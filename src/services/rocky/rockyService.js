const Rocky = require("../../models/Rocky");

exports.createRocky = async ({ data }) => {
    try {
        const rockyExists = await Rocky.findOne({ where: { id: data.id } });

        if (rockyExists) {
            return {
                success: false,
                message: "Ya tienes un Rocky registrado en la base de datos.",
                data: rockyExists,
            };
        }

        const newRocky = await Rocky.create({
            id: data.id, // Se usará la ID de Discord como ID de Rocky
            name: data.name,
            level: 1,
            skinItem: null,
            hatItem: null,
            clothesItem: null,
        });

        return {
            success: true,
            message: "Rocky creado correctamente.",
            data: newRocky,
        };
    } catch (error) {
        console.error("Error al crear Rocky:", error.message);
        return {
            success: false,
            message: "No se pudo crear el Rocky. Verifica los datos.",
        };
    }
};
