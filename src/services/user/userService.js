const { Users } = require("../../models/User/Users");
const Auth = require("../../models/User/Auth");
const Profile = require("../../models/User/Profile");
const ChannelNotificationService = require("../notification/channelNotificationService");
require("dotenv").config();
const axios = require("axios");

const DISCORD_WEBHOOK_URL = process.env.WEBHOOK_URL;
const BOT_TOKEN = process.env.TOKEN;
const GUILD_ID = process.env.GUILD_ID;
const TESTER_ROLE = process.env.TESTER_ROLE;

// Create a new user and their associated Auth and Profile records.
// Create, edit, remove, get

exports.createUser = async (req) => {
  const { id, email, token, refreshToken } = req;

  if (!id || !email || !token || !refreshToken) {
    return {
      success: false,
      message: "Faltan datos requeridos ",
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
};

// Assign a role to a user in a specific Discord guild. (PUT ROLE)
exports.assignRoleToUser = async (req) => {
  const { guildId, userId, roleId } = req;

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
        { headers: { Authorization: `Bot ${BOT_TOKEN}`, "Content-Type": "application/json" } }
    );

    return { success: true, message: "Rol asignado exitosamente." };
  } catch (error) {
    console.error("❌ Error al asignar el rol:", error.response?.data || error.message);
    throw new Error(error.response?.data || error.message);
  }
};

// Edit an existing user's profile details. (PATCH USER)
exports.editUser = async (req, res) => {
  try {
    const { userid, age, description, name, nickname, gender, token } = req.body;

    let user = await Profile.findOne({ where: { userId: userid } });

    if (token !== process.env.TOKEN) {
      return res.render("formulario", { mensaje: "Security token incorrecto", user: null });
    }

    if (user) {
      await user.update({ age, description, name, nickname, gender });
      console.log("Se hizo el update");

      this.assignRoleToUser({
        guildId: GUILD_ID,
        userId: userid,
        roleId: TESTER_ROLE,
      });

      await ChannelNotificationService.sendChannelNotification(
          `✅ ${name} ha sido validado exitosamente. 🎉`,
          `Un saludo a nuestro nuevo usuario  <@${nickname}>`
      );

      return res.render("formulario", { mensaje: "Usuario editado correctamente", user });
    }

    return res.render("formulario", { mensaje: "El usuario no existe en la base de datos", user: null });
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    return res.render("formulario", { mensaje: "Error en el servidor", user: null });
  }
};

// Retrieve and log all users.
exports.getAllUser = async () => {
  try {
    console.log(await Users.findAll());
  } catch (error) {
    console.error("❌ Error al obtener usuarios:", error.message);
  }
};

// Retrieve a user's profile by their ID.
exports.getUserProfile = async (userId) => {
  try {
    const profile = await Profile.findByPk(userId);
    return profile;
  } catch {
    console.error("No se encontró al usuario");
    return null;
  }
};

// Delete a user by their ID.
exports.deleteUser = async (id) => {
  const user = await Users.findByPk(id);
  await user.destroy();
  console.log(`Se eliminó el usuario ${id}`);
};
