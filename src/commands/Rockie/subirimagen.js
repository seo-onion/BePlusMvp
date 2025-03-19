const { SlashCommandBuilder } = require("discord.js");
const fetch = require("node-fetch");
const s3Service = require("../../services/aws/s3Service");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("subirimagen")
        .setDescription("Sube una imagen a Rockie desde un archivo PNG")
        .addStringOption(option =>
            option.setName("tipo")
                .setDescription("Tipo de imagen que deseas subir.")
                .setRequired(true)
                .addChoices(
                    { name: "Ojos (Expresión)", value: "ojos" },
                    { name: "Bocas (Expresión)", value: "bocas" },
                    { name: "Base de color", value: "bases" },
                    { name: "Sombrero", value: "sombreros" },
                    { name: "Ropa", value: "ropas" },
                    { name: "Otros", value: "otros" }
                )
        )
        .addAttachmentOption(option =>
            option.setName("imagen")
                .setDescription("Adjunta la imagen en formato PNG.")
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName("subcarpeta")
                .setDescription("Nombre de subcarpeta si aplica (ej. bases/1 para BASE1.png).")
                .setRequired(false)
        ),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const tipo = interaction.options.getString("tipo");
        const subcarpeta = interaction.options.getString("subcarpeta") || "";
        const imagen = interaction.options.getAttachment("imagen");

        // ✅ Validar PNG usando URL limpia sin parámetros
        const urlSinParametros = imagen.url.split("?")[0];
        if (!urlSinParametros.endsWith(".png")) {
            return interaction.editReply("❌ Solo se permiten imágenes en formato PNG.");
        }

        try {
            const response = await fetch(imagen.url);
            if (!response.ok) {
                return interaction.editReply("❌ No se pudo descargar la imagen adjunta.");
            }

            const buffer = await response.buffer();
            const fileName = imagen.name;

            const basePath = tipo === "ojos" || tipo === "bocas" ? tipo : `assets/${tipo}`;
            const fullPath = subcarpeta
                ? `${basePath}/${subcarpeta}/${fileName}`
                : `${basePath}/${fileName}`;

            // ✅ CORREGIDO: uso correcto de s3Service
            const imageUrl = await s3Service.uploadFileToS3(buffer, fullPath);

            if (imageUrl) {
                return interaction.editReply(`✅ Imagen subida correctamente: ${imageUrl}`);
            } else {
                return interaction.editReply("❌ Error al subir la imagen a S3.");
            }

        } catch (error) {
            console.error("❌ Error al subir la imagen:", error);
            return interaction.editReply("❌ Hubo un problema al subir la imagen.");
        }
    }
};
