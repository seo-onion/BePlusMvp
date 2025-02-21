const axios = require("axios");

async function getOAuthToken(tokenUrl, params) {
    try {
        const response = await axios.post(tokenUrl, params.toString(), {
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
        });
        return response.data;
    } catch (error) {
        console.error("Error en al obtener el token:", error.response?.data || error.message);
        throw new Error("Error en al obtener el token:", error.response?.data || error.message);
    }
}


module.exports = { getOAuthToken };
