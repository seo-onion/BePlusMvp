const User = require("../../models/User/Users");
const Auth = require("../../models/User/Auth")
const Profile = require("../../models/User/Profile")
require("dotenv").config();
const axios = require("axios")

const DISCORD_WEBHOOK_URL = process.env.WEBHOOK_URL;
const BOT_TOKEN = process.env.TOKEN;

// Create, edit, remove, get

//? PUT USER
exports.createUser = async (req) => {
  const { id, email, token, refreshToken } = req;

  if (!id || !email || !token || !refreshToken) {
    throw new Error("Faltan datos requeridos");
  }

  let user = await User.findOne({ where: { userId: id } })

  if (user) {
    return {
      success: false,
      message: "✅ El usuario ya a sido registrado",
    }
  }

  const newUser = await User.create(
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

    let user = await User.findOne({ where: { userid: userid } });

    if (token !== process.env.TOKEN) {
      return res.render("formulario", { mensaje: "Security token incorrento", user: null });
    }

    if (user) {
      await user.update({ age, description, name, nickname, gender }); // Actualiza los datos

      // Intentar enviar notificación a Discord con un try/catch
      try {
        await axios.post(DISCORD_WEBHOOK_URL, {
          content: `✅ El usuario <@${userid}> ha sido validado exitosamente. 🎉`,
        });
      } catch (error) {
        console.error("Error enviando notificación a Discord:", error.message);
      }


      return res.render("formulario", { mensaje: "Usuario editado correctamente", user });


    }

    return res.render("formulario", { mensaje: "El usuario no existe en la base de datos", user: null });

  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    return res.render("formulario", { mensaje: "Error en el servidor", user: null });
  }
};

