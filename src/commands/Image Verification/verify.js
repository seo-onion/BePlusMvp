// commands/Image Verification/verify.js

const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require("discord.js");
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require("@google/generative-ai");
const errorEmbed = require("../../utils/embed/errorEmbed");
const fetch = require('node-fetch');

// --- Inicialización del Cliente Gemini ---
let genAI;
let geminiModel;
if (process.env.GEMINI_API_KEY) {
  try {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    geminiModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
    console.log("Cliente Gemini Pro Vision inicializado correctamente.");
  } catch (error) {
    console.error("Error al inicializar el cliente Gemini:", error);
    geminiModel = null;
  }
} else {
  console.error("Error Crítico: Falta GEMINI_API_KEY en las variables de entorno.");
  geminiModel = null;
}

//Function to process the URL image
async function urlToGenerativePart(url, mimeType) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Error al descargar imagen: ${response.statusText}`);
    }
    const buffer = await response.buffer();
    return {
      inlineData: {
        data: buffer.toString("base64"),
        mimeType
      },
    };
  } catch (error) {
     console.error("Error en urlToGenerativePart:", error);
     throw new Error(`No se pudo procesar la imagen desde la URL: ${error.message}`);
  }
}

/**
 * Analiza la imagen usando Gemini Pro Vision para determinar si coincide
 * con la descripción del usuario, aplicando razonamiento.
 *
 * @param {string} imageUrl - URL de la imagen.
 * @param {string} imageMimeType - Tipo MIME de la imagen (ej. 'image/jpeg').
 * @param {string} descripcionEs - Descripción en ESPAÑOL a verificar.
 * @returns {Promise<{cumple: boolean, explanation: string, metodo: string}>}
 * @throws {Error} Si ocurre un error durante el análisis.
 */
async function analyzeImageWithGemini(imageUrl, imageMimeType, descripcionEs) {
  if (!geminiModel) {
    throw new Error("El modelo Gemini Pro Vision no está inicializado.");
  }

  try {
    const imagePart = await urlToGenerativePart(imageUrl, imageMimeType);

    const prompt = `Analiza cuidadosamente la siguiente imagen. El usuario quiere saber si la imagen muestra o implica la siguiente actividad o concepto: "${descripcionEs}".

Considera el contenido visual, cualquier texto visible y el contexto general.

Responde únicamente con "SÍ" o "NO". A continuación, en una nueva línea, proporciona una breve explicación (1-2 frases) de tu razonamiento, **en español**, basada únicamente en la imagen.

Ejemplo de respuesta:
SÍ
La imagen muestra código en un editor de texto en la pantalla de un portátil, lo cual es consistente con estar programando.

Otro ejemplo:
NO
La imagen muestra un paisaje natural, no hay indicios de la actividad descrita.

Tu respuesta:`; // End of the prompt

    console.log("Enviando prompt en español a Gemini Pro Vision...");
    const result = await geminiModel.generateContent([prompt, imagePart]);
    const response = await result.response;
    const responseText = response.text().trim();

    console.log("Respuesta de Gemini:", responseText);

    // --- Process the Gemini response (searching SÍ/NO in español) ---
    let cumple = false;
    let explanation = "Gemini no proporcionó una explicación clara o no siguió el formato.";
    const metodo = "Razonamiento Gemini";

    // Busca SÍ o NO al principio de la respuesta (insensible a mayúsculas/acentos si es posible, aunque regex simple es más fácil)
    // Dividimos por línea para separar SÍ/NO de la explicación
    const lines = responseText.split('\n');
    const firstLine = lines[0]?.trim().toUpperCase(); // Primera línea en mayúsculas

    if (firstLine === 'SÍ' || firstLine === 'SI') { // Acepta con o sin acento
      cumple = true;
      explanation = lines.slice(1).join('\n').trim() || "Gemini confirmó pero no dio explicación detallada."; // El resto es la explicación
    } else if (firstLine === 'NO') {
      cumple = false;
      explanation = lines.slice(1).join('\n').trim() || "Gemini negó pero no dio explicación detallada.";
    } else {

      // if doesn't find SÍ/NO in the first line, use the whole response as explanation.

      explanation = `Gemini respondió: "${responseText}" (No se pudo determinar un SÍ/NO claro en la primera línea).`;
      console.warn("No se pudo extraer SÍ/NO de la primera línea de la respuesta de Gemini.");
    }

    return { cumple, explanation, metodo };

  } catch (error) {
    console.error("Error al analizar la imagen con Gemini API:", error);
    if (error.message.includes("SAFETY")) {
         throw new Error("El análisis fue bloqueado por filtros de seguridad de contenido.");
    }
    throw new Error(`Error al interactuar con Gemini: ${error.message}`);
  }
}

// --- Definition of the command ---
module.exports = {
  data: new SlashCommandBuilder()
    .setName("verificar_imagen_gemini")
    .setDescription(
      "Analiza una imagen usando IA (Gemini) para ver si coincide con la descripción (en español)."
    )
    .addAttachmentOption((option) =>
      option
        .setName("imagen")
        .setDescription("La imagen que quieres analizar.")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("descripcion")
        .setDescription(
          "La descripción en español a verificar (ej. programando, estudiando)." // Descripción actualizada
        )
        .setRequired(true)
    ),

  restricted: false,

  async execute(interaction) {
    // We only need to verify geminiModel
    if (!geminiModel) {
      console.error("Intento de ejecutar comando sin modelo Gemini inicializado.");
      const errorEmbed = new EmbedBuilder()
        .setColor("#FF0000")
        .setTitle("Error de Configuración del Bot")
        .setDescription("El servicio de análisis de imágenes (Gemini) no está disponible. Contacta al administrador.");
      try {
        if (interaction.replied || interaction.deferred) {
          await interaction.editReply({ embeds: [errorEmbed] });
        } else {
          await interaction.reply({ embeds: [errorEmbed], flags: MessageFlags.Ephemeral });
        }
      } catch (replyError) { console.error("Error al enviar mensaje de error:", replyError); }
      return;
    }

    try {
      await interaction.deferReply();

      const attachment = interaction.options.getAttachment("imagen", true);
      const descripcionEs = interaction.options.getString("descripcion", true); //General Description

      // Validation of the image
      if (!attachment.contentType?.startsWith("image/")) {
         const errorEmbed = new EmbedBuilder() ;
         return await interaction.editReply({ embeds: [errorEmbed] });
      }

      const imageUrl = attachment.url;
      const imageMimeType = attachment.contentType;

      // 2. Analizar la imagen usando Gemini con la descripción en español
      const { cumple, explanation, metodo } = await analyzeImageWithGemini(
        imageUrl,
        imageMimeType,
        descripcionEs // Pasamos la descripción en español directamente
      );

      // 3. Crear y enviar el Embed de resultado (en español)
      const resultEmbed = new EmbedBuilder()
        .setColor(cumple ? "#00FF00" : "#FF4500")
        .setTitle("🧠 Resultado del Análisis con de la Imagen Gemini Vision")
        .setDescription(`Se consultó a Gemini si la imagen muestra "${descripcionEs}".`)
        .setImage(imageUrl)
        .addFields(
          {
            name: "📝 Descripción Buscada",
            value: `"${descripcionEs}"`,
            inline: false,
          },
          { name: "\u200B", value: "\u200B" },
          {
            name: "✅ Resultado",
            value: cumple ? `**Sí**` : `**No**`,
            inline: true,
          },
          {
            name: "⚙️ Método",
            value: metodo,
            inline: true,
          },
          {
            name: "💬 Explicación",
            value: explanation || "No disponible.",
            inline: false,
          }
        )
        .setTimestamp()
        .setFooter({
          text: `Solicitado por ${interaction.user.username}`,
          iconURL: interaction.user.displayAvatarURL(),
        });

      return await interaction.editReply({ embeds: [resultEmbed] });

    } catch (error) {
      console.error(`❌ Error en el comando /${interaction.commandName}:`, error);
      const errorEmbed = new EmbedBuilder()
        .setColor("#FF0000")
        .setTitle("❌ Error Inesperado")
        .setDescription(error.message.startsWith("No se pudo") || error.message.startsWith("Error al interactuar") || error.message.startsWith("El análisis fue bloqueado") ? error.message : "Ocurrió un error al procesar tu solicitud con Gemini.");

      if (interaction.deferred || interaction.replied) {
        return await interaction.editReply({ embeds: [errorEmbed] });
      } else {
        return await interaction.reply({ embeds: [errorEmbed], flags: MessageFlags.Ephemeral });
      }
    }
  },
};
