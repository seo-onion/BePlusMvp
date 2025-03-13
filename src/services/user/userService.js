const {Users} = require("../../models/User/Users");
const Auth = require("../../models/User/Auth");
const Profile = require("../../models/User/Profile")
const ChannelNotificationService = require ("../notification/channelNotificationService")
require("dotenv").config();
const axios = require("axios")

const DISCORD_WEBHOOK_URL = process.env.WEBHOOK_URL;
const BOT_TOKEN = process.env.TOKEN;
const GUILD_ID = process.env.GUILD_ID
const TESTER_ROLE = process.env.TESTER_ROLE


// Create, edit, remove, get

//? PUT USER
exports.createUser = async (req) => {
  const { id, email, token, refreshToken } = req;

  if (!id || !email || !token || !refreshToken) {
    return {
      success: false,
      message: "Faltan datos requeridos ",
    }
  }

  let user = await Users.findOne({ where: { userId: id } })

  if (user) {
    return {
      success: false,
      message: "✅ El usuario ya a sido registrado",
    }
  }

  const newUser = await Users.create(
    {
      userId: id,
      email: email,
      Auth: {
        userId: id,
        token: token,
        refreshToken: refreshToken
      },
      Profile: {
        userId: id
      }
    },
    {
      include: [Auth, Profile], // Sequelize creará Auth y Profile automáticamente
    }
  );

  return {
    success: true,
    message: "✅ Usuario creado correctamente"
  };
};

//? PUT ROLE
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

//? Patch User
exports.editUser = async (req, res) => {
  try {
    const { userid, age, description, name, nickname, gender, token } = req.body;

    let user = await Profile.findOne({ where: { userId: userid } });

    if (token !== process.env.TOKEN) {
      return res.render("formulario", { mensaje: "Security token incorrento", user: null });
    }

    if (user) {
      
      await user.update({ age, description, name, nickname, gender }); // Actualiza los datos
      console.log("Se hizo el update")

      this.assignRoleToUser({
        guildId: GUILD_ID,
        userId: userid,
        roleId: TESTER_ROLE
      })

      await ChannelNotificationService.sendChannelNotification(`✅ ${name} ha sido validado exitosamente. 🎉`, `un saludo a nuestro nuevo usuario  <@${nickname}>`);

      return res.render("formulario", { mensaje: "Usuario editado correctamente", user });


    }

    return res.render("formulario", { mensaje: "El usuario no existe en la base de datos", user: null });

  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    return res.render("formulario", { mensaje: "Error en el servidor", user: null });
  }
};

exports.getAllUser = async () => {
  try {

    console.log(await Users.findAll())

  } catch (error) {
    console.error("❌ Error al obtener usuarios:", error.message);
  }
};

exports.getUserProfile = async (userId) => {
  try {
    const profile = await Profile.findByPk(userId);
    return profile

  } catch {
    console.error("No se encontró al usuario")
    return null
  }
}

exports.deleteUser = async (id) => {
  const user = await Users.findByPk(id);
  await user.destroy();
  console.log(`Se eliminó el usuario ${id}`)
}