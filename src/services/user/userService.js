const axios = require('axios');
const { refreshDiscordToken } = require("../token/tokenService");
const Sequelize = require("sequelize");
const Users = require('../../models/User/Users');
const Auth = require('../../models/User/Auth');
const Profile = require('../../models/User/Profile');
const ChannelNotificationService = require('../notification/channelNotificationService');

const GENERAL_CHANNEL = process.env.DISCORD_COMMAND_CHANNEL;
const COMMAND_CHANNEL = process.env.DISCORD_ADMIN_COMMAND_CHANNEL;
const TESTER = process.env.DISCORD_TESTER_ROLE;
const VERIFIED = process.env.DISCORD_VERIFICATED_ROLE;
const NO_VERIFIED = process.env.DISCORD_NOT_VERIFICATED_ROLE;
const GUILD_ID = process.env.DISCORD_GUILD_ID;
const BOT_TOKEN = process.env.DISCORD_TOKEN

class UserService {

  static async getUser(identifier) {
    try {
      return await Users.findOne({
        where: {
          [Sequelize.Op.or]: [{userId: identifier}, {email: identifier}],
          include: [Auth, Profile]
        },
      });
    } catch (error) {
      console.error("Error al obtener el usuario:", error.message);
      return null;
    }
  }

  static async getAllUser() {
    try {
      return await Users.findAll({
        include: [Auth, Profile],
      });
    } catch (error) {
      console.error("Error al obtener usuarios:", error.message);
      return null;
    }
  }

  static async createUser(req) {
    try {
      const { userId, email, token, refreshToken } = req;

      if (!userId || !email || !token || !refreshToken) { return null }

      const user = await this.getUser(userId);

      if (user) { return null }

      const newUser = await Users.create(
        {
          userId: userId,
          email: email,
          Auth: {
            userId: userId,
            token: token,
            refreshToken: refreshToken,
          },
          Profile: {
            userId: userId,
          },
        },
        {
          include: [Auth, Profile],
        }
      );

      return newUser;
    } catch (error) {
      console.error("Error al crear usuario:", error.message);
      return null;
    }
  }

  static async editUser(req, res) {
    try {
      const { userid, token, ...updateFields } = req.body;

      let user = await this.getUser(userid);

      if (token !== process.env.TOKEN) {
        return res.render("formulario", { mensaje: "Security token incorrecto", user: null });
      }

      if (user && user.Profile) {
        await user.Profile.update(updateFields);
        console.log("Se hizo el update");
        await this.assignRoleToUser({
          guildId: GUILD_ID,
          userId: userid,
          roleId: TESTER_ROLE,
        });

        await ChannelNotificationService.sendChannelNotification(
          `✅ ${updateFields.name || 'El usuario'} ha sido validado exitosamente. 🎉`,
          `un saludo a nuestro nuevo usuario  <@${updateFields.nickname || userid}>`
        );

        return res.render("formulario", { mensaje: "Usuario editado correctamente", user });
      }

      return res.render("formulario", { mensaje: "El usuario no existe en la base de datos", user });
    } catch (error) {
      console.error("Error al actualizar usuario:", error);
      return res.render("formulario", { mensaje: "Error en el servidor", user: null });
    }
  }

  static async getUserProfile(userId) {
    try {
      const profile = await Profile.findByPk(userId);
      return profile;
    } catch {
      console.error("No se encontró al usuario");
      return null;
    }
  }

  static async deleteUser(identifier) {
    try {
      const user = await Users.findOne({
        where: {
          [Sequelize.Op.or]: [{ userId: identifier }, { email: identifier }],
        },
      });

      if (!user) {
        console.log(`No se encontró el usuario con identificador ${identifier}`);
        return;
      }

      await user.destroy();
      console.log(`Se eliminó el usuario ${identifier}`);
    } catch (error) {
      console.error("Error al eliminar usuario:", error.message);
    }
  }

  static async assignRoleToUser(req) {
    const { guildId, userId, roleId } = req;

    try {
      // token to authenticate requests to the Discord API.
      let token = BOT_TOKEN;


      const memberResponse = await axios.get(
        `https://discord.com/api/guilds/${guildId}/members/${userId}`,
        { headers: { Authorization: `Bot ${token}` } }
      );

      const userRoles = memberResponse.data.roles;
      if (userRoles.includes(roleId)) {
        console.log(`✅ El usuario ${userId} ya tiene el rol ${roleId}.`);
        return { success: true, message: "El usuario ya tiene el rol." };
      }

      await axios.put(
        `https://discord.com/api/guilds/${guildId}/members/${userId}/roles/${roleId}`,
        {},
        {
          headers: {
            Authorization: `Bot ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      return { success: true, message: "Rol asignado exitosamente." };
    } catch (error) {
      console.error("❌ Error al asignar el rol:", error.response?.data || error.message);
      throw new Error(error.response?.data || error.message);
    }
  }

}

module.exports = UserService;
