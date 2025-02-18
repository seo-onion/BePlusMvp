const { response } = require("express");
const User = require("../../models/User");
require("dotenv").config();
const axios = require("axios")

const DISCORD_WEBHOOK_URL = process.env.WEBHOOK_URL;

exports.createUser = async ({ data, token }, res) => {
  try {
    const userExists = await User.findOne({ where: { userid: data.id } });

    if (userExists) {
      return {
        success: false,
        message: "El usuario ya existe en la base de datos",
        data: userExistsm,
      };
    }

    const newUser = await User.create({
      userid: data.id,
      email: data.email,
      token: token.access_token,
      refreshToken: token.refresh_token,
    });

    return {
      success: true,
      message: "Usuario creado correctamente",
      data: newUser,
    };
  } catch (error) {
    console.error("Error al crear usuario:", error.message);
    throw new Error("No se pudo crear el usuario. Verifica los datos.");
  }
};

exports.AddUser = async (req, res) => {
  try {
    const { userid, age, description, name, nickname, gender, token } = req.body; // Obtener datos del formulario

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

exports.assignRoleToUser = async (guildId, userId, roleId, botToken) => {
  try {
      const memberResponse = await axios.get(
          `https://discord.com/api/guilds/${guildId}/members/${userId}`,
          { headers: { Authorization: `Bot ${botToken}` } }
      );

      const userRoles = memberResponse.data.roles;
      if (userRoles.includes(roleId)) {
          console.log(`✅ El usuario ${userId} ya tiene el rol ${roleId}.`);
          return { success: true, message: "El usuario ya tiene el rol." };
      }


      await axios.put(
          `https://discord.com/api/guilds/${guildId}/members/${userId}/roles/${roleId}`,
          {},
          { headers: { Authorization: `Bot ${botToken}`, "Content-Type": "application/json" } }
      );

      console.log(`✅ Rol ${roleId} asignado al usuario ${userId}.`);
      return { success: true, message: "Rol asignado exitosamente." };
  } catch (error) {
      console.error("❌ Error al asignar el rol:", error.response?.data || error.message);
      return { success: false, error: error.response?.data || error.message };
  }
};


exports.AddGoogleUser = async (req, res)=> {
  const {token, refreshToken } = req;

  
}