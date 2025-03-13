# Usa la imagen oficial de Node.js
FROM node:18

# Directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia los archivos de configuración primero
COPY package*.json ./

# Instala las dependencias del proyecto
RUN npm install --production

# Copia el resto de los archivos del proyecto
COPY . .

# Expone el puerto en el que se ejecuta tu aplicación
EXPOSE 8080

# Ejecuta primero el deploy-commands y luego inicia el bot
CMD ["npm", "start"]