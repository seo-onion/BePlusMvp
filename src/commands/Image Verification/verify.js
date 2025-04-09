// commands/Image Verification/verify.js
const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require("discord.js");
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require("@google/generative-ai");
const errorEmbed = require("../../utils/embed/errorEmbed");
const fetch = require('node-fetch');
const { addRockyCoins, addRockyGems } = require("../../services/item/economyService");
const TransactionService = require("../../services/item/transactionServices");

const ALLOWED_PARENT_CHANNEL_IDS = new Set([
  '1349815097228394646',
  '1349807860196048906',
  '1349813484988141578',
  '1349814812443672636',
]);

//--Modification of the rockie coins and gems--
async function modifyRockyCoinsAndGems(userId, quantity) {
  try {
      await addRockyCoins({userId, quantity}); // Add RockyCoins
      await addRockyGems({userId, quantity}); // Add RockyGems
  }
  catch (error) {
    console.error("Error al modificar RockyCoins y RockyGems:", error);
  }
};


// --- Initialization of Gemini ---
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

// --- Function to analyze the image with Gemini ---
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

    //Try to look for SÍ/NO in the first line of the response
    // Divide line by line to get the final response
    const lines = responseText.split('\n');
    const firstLine = lines[0]?.trim().toUpperCase(); // First line in uppercase

    if (firstLine === 'SÍ' || firstLine === 'SI') { // Accept both "SÍ" and "SI"
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
    await interaction.deferReply({ ephemeral: true });
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

    const channel = interaction.channel; // Get the channel where the command was executed
    const userId = interaction.user.id; // Get the user ID of the command executor

    // --- 1. Check the id of the channel or thread ---
    let effectiveChannelId;
    if (channel.isThread()) {
        effectiveChannelId = channel.parentId;
        isThread = true;
    } else {
        effectiveChannelId = channel.id;
    }

    // --- 2. Verify if the channel is allowed or not ---
    if (!effectiveChannelId || !ALLOWED_PARENT_CHANNEL_IDS.has(effectiveChannelId)) {
      console.log(`Comando bloqueado para ${userId} en canal/hilo no permitido (efectivo: ${effectiveChannelId})`);
      const errEmbed = errorEmbed({
          title: "Lugar Incorrecto",
          description: "Este comando solo puede usarse en los canales de retos designados o en hilos dentro de esos canales."
      });
      try {
        return await interaction.reply({ embeds: [errEmbed], flags: MessageFlags.Ephemeral });
      } catch (replyError) { console.error("Error al enviar mensaje de error:", replyError); }
      return;
    }

    try {

      const attachment = interaction.options.getAttachment("imagen", true);
      const descripcionEs = interaction.options.getString("descripcion", true); //General Description

      // Validation of the image
      if (!attachment.contentType?.startsWith("image/")) {
         const errorEmbed = new EmbedBuilder() ;
         return await interaction.editReply({ embeds: [errorEmbed] });
      }

      const imageUrl = attachment.url;
      const imageMimeType = attachment.contentType;

      // 2. Analyze the image with Gemini
      const { cumple, explanation, metodo } = await analyzeImageWithGemini(
        imageUrl,
        imageMimeType,
        descripcionEs
      );

      //--- 3. Check if the image matches the description and if the user can claim the reward ---
      // Variables to track if the reward was granted and if the cooldown is active
      let rewardGranted = false;
      let cooldownActive = false;

      // Verify if the user image matches the description
      if (cumple) {
        // Now we check if the user can claim the reward
        const canClaim = await TransactionService.canClaimDailyImageRewardPair(userId);

        if (canClaim) {
          //if it's true, we can claim the reward
          await modifyRockyCoinsAndGems(userId, 10);
          rewardGranted = true;
        } else {
          // If it's false, we can't claim the reward and we set the cooldown to true to avoid giving the reward again
          cooldownActive = true;
          console.log(`Cooldown activo para ${userId}. No se otorgan recompensas.`);
        }
      }

      // 4. Create and send the result embed
      const resultEmbed = new EmbedBuilder()
        .setColor(cumple ? (cooldownActive ? "#FFA500" : "#00FF00") : "#FF4500")
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
            value:  cumple
            ? (rewardGranted ? '**Sí, ¡Reto Verificado y Recompensado!**' : '**Sí, ¡Reto Verificado!** (Recompensa diaria ya reclamada)')
            : '**No verificado.**',
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

        if (cooldownActive) {
          resultEmbed.addFields({
              name: "⏳ Cooldown Activo",
              value: "Ya has recibido la recompensa por verificación hoy. ¡Vuelve mañana!",
              inline: false
          });
      }

      return await interaction.editReply({ embeds: [resultEmbed] });

    } catch (error) {
      console.error(`❌ Error en el comando /${interaction.commandName}:`, error);
      const embedDeError = errorEmbed({
        title: "Error en el comando",
        description: `\`\`\`${"No hay detalles adicionales."}\`\`\``,
      });

      if (interaction.deferred || interaction.replied) {
        return await interaction.editReply({ embeds: [embedDeError] });
      } else {
        return await interaction.reply({ embeds: [embedDeError], flags: MessageFlags.Ephemeral });
      }
    }
  },
};
