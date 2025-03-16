const axios = require('axios');
const { Users, Auth, Profile } = require('./models');
const ChannelNotificationService = require('./ChannelNotificationService');

class UserService {

  static async getUser(identifier) {
    try {
      const user = await Users.findOne({
        where: {
          [Sequelize.Op.or]: [{ userId: identifier }, { email: identifier }],
          include: [Auth, Profile]
        },
      });
      return user;
    } catch (error) {
      console.error("Error al obtener el usuario:", error.message);
      return null;
    }
  }

  static async getAllUser() {
    try {
      const users = await Users.findAll({
        include: [Auth, Profile],
      });
      return users;
    } catch (error) {
      console.error("Error al obtener usuarios:", error.message);
      return null;
    }
  }


  static async createUser(req) {
    const { id, email, token, refreshToken } = req;

    if (!id || !email || !token || !refreshToken) {
      return {
        success: false,
        message: "Faltan datos requeridos",
      };
    }

    let user = await Users.findOne({ where: { userId: id } });

    if (user) {
      return {
        success: false,
        message: "✅ El usuario ya ha sido registrado",
      };
    }

    await Users.create(
      {
        userId: id,
        email: email,
        Auth: {
          userId: id,
          token: token,
          refreshToken: refreshToken,
        },
        Profile: {
          userId: id,
        },
      },
      {
        include: [Auth, Profile],
      }
    );

    return {
      success: true,
      message: "✅ Usuario creado correctamente",
    };
  }



  static async editUser(req, res) {
    try {
      const { userid, token, ...updateFields } = req.body;

      let user = await Profile.findOne({ where: { userId: userid } });

      if (token !== process.env.TOKEN) {
        return res.render("formulario", { mensaje: "Security token incorrecto", user: null });
      }

      if (user) {
        await user.update(updateFields);
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

      return res.render("formulario", { mensaje: "El usuario no existe en la base de datos", user: null });
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

  static async deleteUser(id) {
    const user = await Users.findByPk(id);
    await user.destroy();
    console.log(`Se eliminó el usuario ${id}`);
  }


  static async assignRoleToUser(req) {
    const { guildId, userId, roleId, BOT_TOKEN } = req;

    try {
      const memberResponse = await axios.get(
        `https://discord.com/api/guilds/${guildId}/members/${userId}`,
        { headers: { Authorization: `Bot ${BOT_TOKEN}` } }
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
            Authorization: `Bot ${BOT_TOKEN}`,
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
