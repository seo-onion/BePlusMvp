// 📌 src/services/rockie/rockieService.js
const Rockie = require("../../models/Rockie/Rockie");
const renderRockieService = require("./renderRockieService");

/**
 * RockieService - Manages Rockie data and actions.
 */
class RockieService {
    constructor() {
        if (!RockieService.instance) {
            RockieService.instance = this;
        }
        return RockieService.instance;
    }

    /**
     * Retrieves the Rockie associated with a user.
     * @param {string} userId - Discord user ID.
     * @returns {Promise<Rockie|null>} - Rockie instance or null.
     */
    async getRockie(userId) {
        return await Rockie.findByPk(userId);
    }

    /**
     * Creates a new Rockie with default values.
     * @param {string} userId - Discord user ID.
     * @param {string} username - Discord username.
     * @returns {Promise<Rockie>} - Newly created Rockie.
     */
    async createRockie(userId, username) {
        const existing = await this.getRockie(userId);
        if (existing) return existing;

        const defaultColor = "1"; // Default color
        const defaultSkin = "1.png"; // Default skin item

        const rockie = await Rockie.create({
            id: userId,
            name: username,
            level: 1,
            color: defaultColor,
            skinItem: defaultSkin,
            hatItem: null,
            clothesItem: null,
            experience: 0
        });

        return rockie;
    }

    /**
     * Updates attributes of an existing Rockie.
     * @param {string} userId - Discord user ID.
     * @param {Object} updates - Attributes to update.
     * @returns {Promise<Rockie|null>} - Updated Rockie or null.
     */
    async updateRockie(userId, updates) {
        const rockie = await this.getRockie(userId);
        if (!rockie) return null;

        await rockie.update(updates);
        return rockie;
    }

    /**
     * Deletes a Rockie associated with a user.
     * @param {string} userId - Discord user ID.
     * @returns {Promise<boolean>} - True if deleted.
     */
    async deleteRockie(userId) {
        const rockie = await this.getRockie(userId);
        if (!rockie) return false;

        await rockie.destroy();
        return true;
    }

    /**
     * Levels up a Rockie by 1, max level is 4.
     * @param {string} userId - Discord user ID.
     * @returns {Promise<Rockie|null>} - Updated Rockie or null.
     */
    async levelUpRockie(userId) {
        const rockie = await this.getRockie(userId);
        if (!rockie) return null;

        const newLevel = Math.min(rockie.level + 1, 4);
        await rockie.update({ level: newLevel });
        return rockie;
    }

    /**
     * Renders the Rockie image using renderRockieService.
     * @param {string} userId - Discord user ID.
     * @returns {Promise<Buffer|null>} - PNG buffer or null.
     */
    async renderRockie(userId) {
        return await renderRockieService.renderRockie(userId);
    }
}

module.exports = new RockieService();

