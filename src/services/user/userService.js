const axios = require('axios');
const { Op } = require('sequelize'); // To do postgress operations
const Users = require('../../models/User/Users');
const Auth = require('../../models/User/Auth');
const Profile = require('../../models/User/Profile');


class UserService {

  // get user by id or email
  static async getUser(identifier) {
    try {
      const user = await Users.findOne({
        where: {
          [Op.or]: [
            { userId: identifier },
            { email: identifier },
          ],
        },
        include: [
          { model: Auth },
          { model: Profile },
        ],
      });

      return user || null;
    } catch (error) {
      console.error("Error to obtain user: ", error.message);
      return null;
    }
  }

  // get all users
  static async getAllUsers() {
    try {
      const users = await Users.findAll({
        include: [Auth, Profile],
      });

      return users.length > 0 ? users : null;

    } catch (error) {
      console.error("Error to obtain user: ", error.message);
      return null;
    }
  }

  //create new users
  static async createUser(req) {
    try {
      const { userId, email, token, refreshToken } = req;

      // Validate input data
      if (!userId || !email || !token || !refreshToken) {
        console.error("Missing parameters: userId, email, token or refreshToken is undefined. ")
        return null;
      }

      // Check if the user already exists
      const existingUser = await this.getUser(userId);
      if (existingUser) {
        console.error("user already created")
        return null;
      }

      // Create the new user with Auth and Profile associations
      const newUser = await Users.create(
        {
          userId,
          email,
          Auth: {
            userId,
            token,
            refreshToken,},
          Profile: {
            userId,},
        },
        {include: [Auth, Profile],}
      );

      // Return the new user
      return newUser ? newUser : null;

    } catch (error) {
      console.error("Error creating user:", error.message);
      return null;
    }
  }


  //edit a user by id or email
  static async editUser(req) {
    try {
      const { identifier, ...updateFields } = req;

      // Get user
      const user = await this.getUser(identifier);

      // Validate user exist
      if (!user) {
        console.error("User not found");
        return null;
      }

      // Update the fields
      const models = [user, user.Auth, user.Profile];
      for (const model of models) {
        if (model) {
          await model.update(updateFields).catch(() => { });
        }
      }

      return user;
    } catch (error) {
      console.error("Error to update user:", error);
      return null;
    }
  }


  //delete a user by id or email
  static async deleteUser(identifier) {
    try {
      const user = await this.getUser(identifier);

      if (!user) {
        console.error("User not found");
        return null;
      }

      await user.destroy();
      return user;
    } catch (error) {
      console.error("Error deleting user:", error.message);
      return null;
    }
  }

  //Assing a role to user by id
  static async assignRoleToUser(req) {
    const GUILD_ID = process.env.DISCORD_GUILD_ID;
    const BOT_TOKEN = process.env.DISCORD_TOKEN;
    const { userId, roleId } = req;

    const user = await this.getUser(userId);
    if (!user) {
      console.error("user not found");
      return false;
    }

    // Parameter validation
    if (!userId || !roleId) {
      console.error("Missing parameters: userId or roleId is undefined.");
      return false;
    }

    try {
      let memberResponse;

      try {
        memberResponse = await axios.get(
          `https://discord.com/api/guilds/${GUILD_ID}/members/${userId}`,
          { headers: { Authorization: `Bot ${BOT_TOKEN}` } });
      } catch (error) {
        console.error("Cannot assing role to user: ", error)
        return false
      }

      const userRoles = memberResponse.data.roles;

      // verified id role already assigned
      if (userRoles.includes(roleId)) {
        console.log(`User ${userId} already has role ${roleId}`);
        return true;
      }

      // Assign role
      await axios.put(
        `https://discord.com/api/guilds/${GUILD_ID}/members/${userId}/roles/${roleId}`,
        {},
        {
          headers: {
            Authorization: `Bot ${BOT_TOKEN}`,
            "Content-Type": "application/json",
          },
        }
      );

      return true

    } catch (error) {
      console.error("Error assigning role:", error.response?.data || error.message);
      return false;
    }
  }

}

module.exports = UserService;
