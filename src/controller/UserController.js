const UserService = require("../services/user/userService");
const PrivateChannelNotificationService = require("../services/notification/privateNotificationService")
TESTER_ROLE = process.env.DISCORD_TESTER_ROLE

class UserController {
    
    static async updateUser(req, res) {
        try {
            const { userid, name, nickname, age, description, gender } = req.body;
            
            if (!userid || (!name && !nickname && !age && !description && !gender)) {
                res.render("response", { message: "Error: Debes proporcionar un userId y al menos un campo para actualizar.", success: false });
                }

            const updateFields = {};
            if (name) updateFields.name = name;
            if (nickname) updateFields.nickname = nickname;
            if (age) updateFields.age = parseInt(age);
            if (description) updateFields.description = description;
            if (gender) updateFields.gender = gender;

            const updatedUser = await UserService.editUser({
                identifier: userid,
                ...updateFields
            });

            if (!updatedUser) {
                res.render("response", { message: "Usuario no encontrado o no se pudo actualizar", success: false });
            }

            await UserService.assignRoleToUser({ userId: userid, roleId: TESTER_ROLE })
            PrivateChannelNotificationService.sendPrivateChannelNotification(userid, "Felicidades, haz sido registrado exitosamente" )
            res.render("response", { message: "✅ Usuario actualizado correctamente.", success: true });

        } catch (error) {
            console.error("Error al actualizar usuario:", error.message);
            res.status(500).send("Ocurrió un error al actualizar el usuario.");
            res.render("response", { message: "No se pudo actualizar al usuario correctamente.", success: false });
        }
    }
}

module.exports = UserController;
