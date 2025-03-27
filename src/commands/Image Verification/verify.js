// commands/utility/verificar_imagen.js

const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { ImageAnnotatorClient } = require("@google-cloud/vision");
const { v2 } = require("@google-cloud/translate");
const { Translate } = v2;
const path = require("path"); // Para manejar rutas de archivos

// --- Inicialización de Clientes de Google Cloud ---
// Asegúrate de que la ruta al archivo de credenciales sea correcta
// Es MUY recomendable usar variables de entorno para esto en producción.
const credentialsPath = path.join(__dirname, "../../../hidden-proxy-438202-m1-3e1d23c34176.json");

const semanticConcepts = new Map([
    [
      "programming", // Si el usuario busca "programming", "coding", etc.
      [
        "programming",
        "coding",
        "software development",
        "software engineering",
        "computer program",
        "developer",
        "code", // Añadido 'code' como término central
      ],
    ],
    [
      "studying", // Si el usuario busca "studying", "learning"
      ["studying", "learning", "education", "student", "research", "homework"],
    ],
    // Añade más conceptos clave si es necesario (ej. 'gaming', 'designing')
  ]);

let visionClient;
let translateClient;
try {
  visionClient = new ImageAnnotatorClient({ keyFilename: credentialsPath });
  translateClient = new Translate({ keyFilename: credentialsPath });
  console.log("Clientes de Google Cloud inicializados correctamente.");
} catch (error) {
  console.error(
    "Error al inicializar los clientes de Google Cloud:",
    error
  );
}

// --- Lógica de Análisis de Imagen (Adaptada) ---
/**
 * Analiza la imagen desde una URL usando Label/Web Detection y aplica
 * lógica de coincidencia por niveles para verificar la descripción.
 *
 * @param {string} imageUrl - URL de la imagen.
 * @param {string} targetDescriptionEn - Descripción en inglés a buscar.
 * @returns {Promise<{cumple: boolean, etiquetas: string[], webEntities: string[], bestGuess: string | null, metodo: string}>}
 * @throws {Error} Si ocurre un error durante el análisis.
 */
async function analyzeImageWithContext(imageUrl, targetDescriptionEn) {
    if (!visionClient) {
      throw new Error(/* ... mensaje de error ... */);
    }
    try {
      const [result] = await visionClient.annotateImage({
        image: { source: { imageUri: imageUrl } },
        features: [
          { type: "LABEL_DETECTION", maxResults: 15 },
          { type: "WEB_DETECTION", maxResults: 10 },
        ],
      });
  
      // --- Procesar Label Detection ---
      const labelAnnotations = result.labelAnnotations || [];
      const detectedLabels = labelAnnotations.map(
        (label) => `${label.description} (${label.score.toFixed(2)})`
      );
      // Guardamos las descripciones limpias y en minúsculas para comparar
      const labelDescriptions = labelAnnotations.map((l) =>
        l.description.trim().toLowerCase()
      );
      console.log("Etiquetas detectadas:", detectedLabels);
  
      // --- Procesar Web Detection ---
      const webDetection = result.webDetection || {};
      const webEntities = (webDetection.webEntities || []).map(
        (entity) => `${entity.description} (${(entity.score || 0).toFixed(2)})`
      );
      // Guardamos descripciones limpias y en minúsculas
      const webEntityDescriptions = (webDetection.webEntities || [])
        .map((e) => (e.description || "").trim().toLowerCase())
        .filter(Boolean); // Filtra cadenas vacías
      const bestGuessLabels = (webDetection.bestGuessLabels || [])
        .map((l) => (l.label || "").trim().toLowerCase())
        .filter(Boolean);
      const bestGuess = bestGuessLabels.length > 0 ? bestGuessLabels[0] : null;
  
      console.log("Entidades Web detectadas:", webEntities);
      console.log("Mejor Suposición (Web):", bestGuess);
  
      // --- Combinar todas las descripciones detectadas (únicas y limpias) ---
      const allDetectedDescriptions = new Set([
        ...labelDescriptions,
        ...webEntityDescriptions,
        ...(bestGuess ? [bestGuess] : []),
      ]);
      // Convertir a array para facilitar algunas operaciones
      const allDetectedArray = Array.from(allDetectedDescriptions);
      console.log("Descripciones combinadas para búsqueda:", allDetectedArray);
  
      // --- Lógica de Verificación por Niveles ---
      const targetLower = targetDescriptionEn.trim().toLowerCase();
      let cumple = false;
      let metodo = "Sin coincidencia";
      let matchedTerm = null; // Para saber qué término coincidió
  
      // Nivel 1: Coincidencia Exacta
      if (allDetectedDescriptions.has(targetLower)) {
        cumple = true;
        metodo = "Coincidencia Exacta";
        matchedTerm = targetLower;
      }
  
      // Nivel 2: Inclusión Directa (si no hubo coincidencia exacta)
      if (!cumple) {
        const includedIn = allDetectedArray.find((desc) =>
          desc.includes(targetLower)
        );
        if (includedIn) {
          cumple = true;
          metodo = "Inclusión Directa (Detectado contiene Objetivo)";
          matchedTerm = includedIn;
        }
      }
  
      // Nivel 3: Inclusión Inversa (si aún no hay coincidencia)
      if (!cumple) {
        const containsDetected = allDetectedArray.find((desc) =>
          targetLower.includes(desc)
        );
        if (containsDetected) {
          cumple = true;
          metodo = "Inclusión Inversa (Objetivo contiene Detectado)";
          matchedTerm = containsDetected;
        }
      }
  
      // Nivel 4: Coincidencia Semántica Simple (si aún no hay coincidencia)
      if (!cumple) {
        // Encuentra el concepto clave relacionado con el objetivo (si existe)
        let relatedConceptKey = null;
        for (const [key, terms] of semanticConcepts.entries()) {
          if (terms.includes(targetLower)) { // Si el objetivo es uno de los términos clave
            relatedConceptKey = key;
            break;
          }
          // Opcional: verificar si el objetivo *contiene* una clave (ej. "practicing programming")
          // else if (targetLower.includes(key)) {
          //   relatedConceptKey = key;
          //   break;
          // }
        }
  
        if (relatedConceptKey) {
          const relevantTerms = semanticConcepts.get(relatedConceptKey);
          console.log(`Buscando términos semánticos para '${relatedConceptKey}':`, relevantTerms);
          // Comprueba si alguna descripción detectada coincide EXACTAMENTE con un término relevante
          const semanticMatch = allDetectedArray.find((desc) =>
            relevantTerms.includes(desc)
          );
  
          if (semanticMatch) {
            cumple = true;
            metodo = `Coincidencia Semántica ('${semanticMatch}' relacionado con '${relatedConceptKey}')`;
            matchedTerm = semanticMatch;
          }
        }
      }
  
      console.log(`Resultado final: cumple=${cumple}, metodo=${metodo}, matchedTerm=${matchedTerm}`);
      return {
        cumple,
        etiquetas: detectedLabels,
        webEntities: webEntities,
        bestGuess: bestGuess,
        metodo: metodo, // Devolvemos el método detallado
      };
    } catch (error) {
      console.error("Error al analizar la imagen con Vision API:", error);
      // ... (manejo de errores como antes) ...
      throw new Error("No se pudo analizar la imagen con Google Vision.");
    }
}

// --- Definition of the command ---
module.exports = {
  data: new SlashCommandBuilder()
    .setName("verificar_imagen")
    .setDescription(
      "Analiza una imagen adjunta y verifica si contiene la descripción dada."
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
          "La descripción a buscar en la imagen (ej. perro, coche)."
        )
        .setRequired(true)
    ),

  restricted: false, // O true si quieres restringirlo como el comando 'pasos'

  async execute(interaction) {
    // Asegurarse de que los clientes estén listos
    if (!visionClient || !translateClient) {
      console.error(
        "Intento de ejecutar comando sin clientes de Google Cloud inicializados."
      );
      const errorEmbed = new EmbedBuilder() // Asumiendo que tienes createErrorEmbed o usa uno simple
        .setColor("#FF0000")
        .setTitle("Error de Configuración")
        .setDescription(
          "El bot no está configurado correctamente para usar las APIs de Google. Contacta al administrador."
        );
      try {
        if (!interaction.replied && !interaction.deferred) {
          await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        } else {
          await interaction.editReply({ embeds: [errorEmbed] });
        }
      } catch (replyError) {
        console.error("Error al enviar mensaje de error de cliente:", replyError);
      }
      return;
    }


    try {
      // Diferir la respuesta
      if (!interaction.deferred && !interaction.replied) {
        // Usar ephemeral: true si prefieres que solo el usuario vea el proceso
        await interaction.deferReply();
      }

      const attachment = interaction.options.getAttachment("imagen", true);
      const descripcionEs = interaction.options.getString("descripcion", true);

      // Validación del tipo de archivo
      if (!attachment.contentType?.startsWith("image/")) {
        const errorEmbed = new EmbedBuilder()
          .setColor("#FFA500") // Naranja para advertencia
          .setTitle("Archivo Inválido")
          .setDescription(
            "Por favor, adjunta un archivo de imagen válido (JPEG, PNG, etc.)."
          );
        return await interaction.editReply({
          embeds: [errorEmbed],
          ephemeral: true,
        }); // ephemeral: true para que solo lo vea el usuario
      }

      const imageUrl = attachment.url;
      let descripcionEn = "";

      // 1. Traducir la descripción a inglés
      try {
        const [translation] = await translateClient.translate(
          descripcionEs,
          "en"
        );
        descripcionEn = translation;
        console.log(
          `Descripción "${descripcionEs}" traducida a: "${descripcionEn}"`
        );
      } catch (translateError) {
        console.error("Error al traducir:", translateError);
        const errorEmbed = new EmbedBuilder()
          .setColor("#FF0000")
          .setTitle("Error de Traducción")
          .setDescription(
            "Hubo un problema al traducir tu descripción. Intenta de nuevo o con otras palabras."
          );
        return await interaction.editReply({ embeds: [errorEmbed] });
      }

      // 2. Analizar la imagen usando Label y Web Detection
      const { cumple, etiquetas, webEntities, bestGuess, metodo } =
        await analyzeImageWithContext(
          imageUrl,
          descripcionEn
          // Ya no necesitamos pasar descripcionEs aquí, la comparación se hace con la versión inglesa
        );

      // 3. Crear y enviar el Embed de resultado (actualizado)
      const resultEmbed = new EmbedBuilder()
        .setColor(cumple ? "#00FF00" : "#FF4500")
        .setTitle("🔍 Resultado del Análisis de Imagen (con Contexto Web + Semantica)")
        .setDescription(
          `Se buscó si la imagen contenía "${descripcionEs}" (interpretado como "${descripcionEn}").`
        )
        .setImage(imageUrl)
        .addFields(
          {
            name: "📝 Descripción Buscada",
            value: `"${descripcionEs}" / "${descripcionEn}"`, // Muestra ambas
            inline: false,
          },
          { name: "\u200B", value: "\u200B" }, // Espacio
          {
            name: "✅ Resultado",
            value: cumple
              ? `**Sí**, la imagen parece coincidir.`
              : `**No**, la imagen no parece coincidir.`,
            inline: true,
          },
          {
            name: "⚙️ Método",
            value: metodo,
            inline: true,
          },
          // Mostrar la mejor suposición si existe
          ...(bestGuess
            ? [
                {
                  name: "🤔 Mejor Suposición (Web)",
                  value: bestGuess,
                  inline: false,
                },
              ]
            : []),
          {
            name: "🏷️ Etiquetas Directas",
            value: etiquetas.length > 0
              ? etiquetas.join(", ")
              : "Ninguna.",
            inline: false,
          },
          // Mostrar entidades web si existen
          ...(webEntities.length > 0
            ? [
                {
                  name: "🌐 Entidades Web Relacionadas",
                  value: webEntities.join(", "),
                  inline: false,
                },
              ]
            : [])
        )
        .setTimestamp()
        .setFooter({
          text: `Solicitado por ${interaction.user.username}`,
          iconURL: interaction.user.displayAvatarURL(),
        });

      return await interaction.editReply({ embeds: [resultEmbed] });
    } catch (error) {
      console.error("❌ Error en el comando /verificar_imagen:", error);

      // Crear un embed de error genérico (puedes usar tu `createErrorEmbed` si lo tienes)
      const errorEmbed = new EmbedBuilder()
        .setColor("#FF0000")
        .setTitle("❌ Error Inesperado")
        .setDescription(
          "Ocurrió un error al procesar tu solicitud. Por favor, inténtalo de nuevo más tarde."
        );

      // Enviar respuesta de error
      if (interaction.deferred || interaction.replied) {
        return await interaction.editReply({ embeds: [errorEmbed] });
      } else {
        // Si ni siquiera se pudo diferir, responder directamente
        return await interaction.reply({
          embeds: [errorEmbed],
          ephemeral: true,
        });
      }
    }
  },
};
