const UserService = require("../services/user/userService");
const PrivateChannelNotificationService = require("../services/notification/privateNotificationService")
TESTER_ROLE = process.env.DISCORD_TESTER_ROLE

class UserController {
    
    static async updateUser(req, res) {
        try {
            const { userid, name, nickname, age, description, gender } = req.body;
            
            if (!userid || (!name && !nickname && !age && !description && !gender)) {
                res.send("✅ Usuario actualizado correctamente.");
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
                res.send("✅ Usuario actualizado correctamente.");
            }

            await UserService.assignRoleToUser({ userId: userid, roleId: TESTER_ROLE })
            PrivateChannelNotificationService.sendPrivateChannelNotification(userid, "Felicidades, haz sido registrado exitosamente" )
            res.send("✅ Usuario actualizado correctamente.");

        } catch (error) {
            console.error("Error al actualizar usuario:", error.message);
            res.status(500).send("Ocurrió un error al actualizar el usuario.");
            res.send("✅ Usuario actualizado correctamente.");
        }
    } 
}

module.exports = UserController;
