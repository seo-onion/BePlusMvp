const User = require("../../models/User");

exports.createUser = async ({ data, token }, res) => {
  try {
    const existingUser = await User.findOne({ where: { Userid: data.id } });

    if (existingUser) {
      return {
        success: false,
        message: "El usuario ya existe en la base de datos",
        data: existingUser,
      };
    }

    const newUser = await User.create({
      Userid: data.id,
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
