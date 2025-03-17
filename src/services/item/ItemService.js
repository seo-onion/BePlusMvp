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
                    [Sequelize.Op.or]: [{id: identifier}, {name: identifier}],
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
            const item = await Items.create(itemData);

            // Notification Example (Optional)
            await ChannelNotificationService.sendChannelNotification(
                `🎉 Nuevo ítem creado: **${item.name}**`,
                `Detalles del ítem:\n- Precio: ${item.price}\n- Categoría: ${item.category}`
            );

            return item;
        } catch (error) {
            console.error("❌ Error al crear el ítem:", error.message);
            return null;
        }
    }

    // ✅ Update an Item
    static async updateItem(id, updateData) {
        try {
            const item = await this.getItem(id);
            if (!item) {
                console.error(`❌ No se encontró el ítem con ID: ${id}`);
                return null;
            }

            await item.update(updateData);

            // Notification Example (Optional)
            await ChannelNotificationService.sendChannelNotification(
                `📝 Ítem actualizado: **${item.name}**`,
                `Se actualizó con éxito el ítem: ${item.name}`
            );

            return item;
        } catch (error) {
            console.error("❌ Error al actualizar el ítem:", error.message);
            return null;
        }
    }

    // ✅ Delete an Item
    static async deleteItem(identifier) {
        try {
            const item = await this.getItem(identifier);
            if (!item) {
                console.error(`❌ No se encontró el ítem con identificador: ${identifier}`);
                return null;
            }

            await item.destroy();

            // Notification Example (Optional)
            await ChannelNotificationService.sendChannelNotification(
                `❌ Ítem eliminado: **${item.name}**`,
                `El ítem con nombre ${item.name} fue eliminado correctamente.`
            );

            console.log(`✅ Ítem eliminado: ${identifier}`);
            return true;
        } catch (error) {
            console.error("❌ Error al eliminar el ítem:", error.message);
            return false;
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
}

module.exports = ItemService;
