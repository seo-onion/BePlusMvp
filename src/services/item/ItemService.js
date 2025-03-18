const { Sequelize } = require('sequelize');
const axios = require('axios');
const Items = require('../../models/Item/Items');
const ChannelNotificationService = require('../notification/channelNotificationService');

const BOT_TOKEN = process.env.DISCORD_TOKEN;

class ItemService {

    // Get a Single Item by ID or Name
    static async getItem(identifier) {
        try {
            return await Items.findOne({
                where: {
                    id: identifier, // Usamos el parámetro correctamente
                },
            });
        } catch (error) {
            console.error("❌ Error al obtener el ítem:", error.message);
            return null;
        }
    }

    // Get All Items
    static async getAllItems() {
        try {
            return await Items.findAll();
        } catch (error) {
            console.error("❌ Error al obtener los ítems:", error.message);
            return null;
        }
    }

    // ✅ Create an Item
    static async createItem(itemData) {
        try {

            // FALTA ARREGLAR LO DE LA LOGICA DEL STORE
            const { name, price, category, storeId } = itemData;
            if (!name || !price || !category || storeId ) {
                throw new Error("Faltan datos requeridos para crear el item.");
            }

            return await Items.create({
                name,
                description: `Un ${category} del tipo ${name}`,
                price,
                category,
                storeId,
                badge: "coin",
            });
        } catch (error) {
            console.error("❌ Error al crear el ítem:", error.message);
            return null;
        }
    }

    // ✅ Update an Item
    static async updateItemPrice(id, price) {
        try {
            const item = await Items.update(
                { price }, // Se actualiza solo el campo `price`
                { where: { id } } // Se filtra por ID
            );

            if (!item[0]) { // `update` devuelve un array con el número de filas afectadas
                console.error(`❌ No se encontró el ítem con ID: ${id}`);
                return null;
            }

            return item; // Retorna el resultado de la actualización

        } catch (error) {
            console.error("❌ Error al actualizar el ítem:", error.message);
            return null;
        }
    }

    // ✅ Delete an Item
    static async deleteItem(identifier, interaction, category, itemName) {
        try {
            await interaction.deferReply();
            const item = await this.getItem(identifier);
            if (!item) {
                return await interaction.editReply(`❌ No se encontró el artículo **${itemName}** en la categoría **${category}**.`);
            }

            await item.destroy();

            console.log(`✅ Ítem eliminado: ${identifier}`);
            return await interaction.editReply(`✅ En la categoría **${category}**, el artículo **${itemName}** ha sido eliminado correctamente.`);
        } catch (error) {
            console.error("❌ Error al eliminar el ítem:", error.message);
            return await interaction.editReply(`❌ Ocurrió un error al intentar eliminar el artículo **${itemName}** en la categoría **${category}**.`);
        }
    }


    // ✅ Assign Role to User (Example Function, if relevant)
    static async assignRoleToUser(req) {
        const { guildId, userId, roleId } = req;

        try {
            const response = await axios.put(
                `https://discord.com/api/guilds/${guildId}/members/${userId}/roles/${roleId}`,
                {},
                {
                    headers: {
                        Authorization: `Bot ${BOT_TOKEN}`,
                        "Content-Type": "application/json",
                    },
                }
            );
            return { success: true, message: "Rol asignado exitosamente.", data: response.data };
        } catch (error) {
            console.error("❌ Error al asignar el rol:", error.response?.data || error.message);
            throw new Error(error.response?.data || error.message);
        }
    }
    static async getAllItemsByCategory(category, store, attributes = ["id", "name", "price"]) {
        if (!category || !store?.id) {
            console.error("❌ Error: Falta la categoría o el ID de la tienda.");
            return null;
        }

        try {
            const items = await Items.findAll({
                where: { category, storeId: store.id },
                attributes: attributes,
                raw: true
            });

            if (items.length === 0) {
                console.log(`⚠️ Advertencia: No se encontraron ítems en la categoría "${category}" para la tienda con ID ${store.id}`);
                return [];
            }
            return items;
        } catch (error) {
            console.error("❌ Error al obtener los ítems por categoría:", error.message);
            return null;
        }
    }

}

module.exports = ItemService;
