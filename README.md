# BePlusMvp
# BePlus - Comandos de Discord Bot

## 📌 Descripción
BePlus es un bot de Discord que incorpora gamificación para incentivar hábitos saludables y la productividad. A continuación, se documentan los comandos principales implementados.

---

## 🏆 `/desbloquear`
### Descripción:
Desbloquea logros en el sistema de recompensas.

### Flujo:
1. Verifica si el usuario ya tiene logros desbloqueados.
2. Si no los tiene, intenta desbloquearlos según las condiciones establecidas.
3. Agrega **Rocky Gems** al usuario si desbloquea un logro.
4. Devuelve un embed con los logros obtenidos.

### Código clave:
- `AchievementGetService`: Maneja la lógica de desbloqueo de logros.
- `getUserAchievementById()`: Verifica si el usuario ya tiene un logro.
- `addRockyGems()`: Otorga recompensas al usuario.

---

## 💰 `/reclamar`
### Descripción:
Convierte los pasos del usuario en **RockyCoins**.

### Flujo:
1. Verifica si el usuario ya reclamó la recompensa del día.
2. Si no ha reclamado, convierte los pasos en **RockyCoins**.
3. Devuelve un embed con la cantidad obtenida.

### Código clave:
- `claimRockyCoins(id)`: Función que obtiene y valida la conversión de pasos en monedas.

---

## 📊 `/rankearme`
### Descripción:
Muestra el ranking de **RockyGems** del usuario.

### Flujo:
1. Obtiene el ID del usuario.
2. Consulta el ranking en `ranking(id)`.
3. Devuelve la posición y datos del usuario.

### Código clave:
- `ranking(id)`: Función que calcula el ranking del usuario.

---

## 🚶 `/pasos`
### Descripción:
Consulta la cantidad de pasos acumulados en un período determinado.

### Opciones:
- `Día`
- `Semana`
- `Mes`

### Flujo:
1. Verifica si el usuario tiene permisos.
2. Recupera los pasos de la API de **Google Fit**.
3. Almacena el registro en la base de datos.
4. Devuelve un embed con la cantidad de pasos en el período seleccionado.

### Código clave:
- `getSteps({startTimeMillis, endTimeMillis, userId})`: Obtiene los pasos del usuario.
- `registerSteps({userId, steps})`: Registra los pasos en la base de datos.

---

## 📦 Dependencias
- `discord.js`: Para la interacción con Discord.
- `Sequelize`: ORM para manejo de datos.
- `Google Fit API`: Para sincronización de pasos.
- `.env`: Configuración de variables de entorno.

---
# BePlus - Sistema de Tienda

## 📌 Descripción
Sistema de tienda en Discord donde los usuarios pueden comprar, listar, añadir y eliminar artículos usando comandos de Slash.

---

## 🛒 `/comprar`
### Descripción:
Compra un artículo de la tienda **Rocky**.

### Flujo:
1. Obtiene la categoría e ítem a comprar.
2. Valida si el usuario tiene suficientes **RockyCoins**.
3. Realiza la compra y devuelve un embed de confirmación.

### Código clave:
- `storeInstance.getCategories()`: Carga las categorías de la tienda.
- `storeInstance.buyItem(userId, itemName, category)`: Maneja la transacción.

---

## 🏗️ `/item`
### Descripción:
Añade o actualiza un artículo en la tienda.

### Flujo:
1. Verifica si la tienda existe, si no la crea.
2. Busca si el artículo ya existe en la categoría dada.
3. Si existe, actualiza el precio; si no, crea un nuevo ítem.
4. Devuelve un mensaje de confirmación.

### Código clave:
- `Store.findOne()`: Obtiene la tienda.
- `Items.findOne({ where: { name, category } })`: Verifica si el ítem existe.
- `Items.create({ name, price, category, storeId })`: Crea un nuevo ítem.

---

## ❌ `/eliminar`
### Descripción:
Elimina un artículo de la tienda.

### Flujo:
1. Verifica si la tienda existe.
2. Busca el artículo en la categoría dada.
3. Si el ítem existe, lo elimina; si no, envía un mensaje de error.

### Código clave:
- `Items.findOne({ where: { name, category } })`: Busca el ítem.
- `item.destroy()`: Elimina el artículo de la tienda.

---

## 📜 `/tienda`
### Descripción:
Muestra los artículos disponibles en la tienda con paginación.

### Flujo:
1. Obtiene todos los ítems de la base de datos.
2. Agrupa los ítems por categoría.
3. Crea un embed paginado con botones para navegar.

### Código clave:
- `Items.findAll({ attributes: ["id", "name", "price", "category"] })`: Obtiene los ítems disponibles.
- `ActionRowBuilder() + ButtonBuilder()`: Maneja la paginación.

---

## 📦 Dependencias
- `discord.js`: Manejo de interacciones en Discord.
- `Sequelize`: ORM para base de datos.
- `.env`: Configuración de variables de entorno.

---
# BePlus - Autenticación y Perfil

## 📌 Descripción
Este módulo gestiona la autenticación de usuarios en BePlus, la integración con **Google Fit** y la visualización de perfiles.

---

## 🔑 `/empezar`
### Descripción:
Vincula la cuenta de **Discord** con BePlus.

### Flujo:
1. Genera un embed con un enlace de autenticación basado en `DISCORD_URI`.
2. Permite a los usuarios registrarse y empezar a usar el sistema.

### Código clave:
- `DISCORD_URI`: URL de autenticación.
- `EmbedBuilder()`: Genera el embed con el botón de inicio.

---

## 🏃 `/vincularmeconfit`
### Descripción:
Vincula la cuenta de **Google Fit** con BePlus.

### Flujo:
1. Genera un enlace de autenticación con `GOOGLE_URI`.
2. Permite la sincronización de actividad física con BePlus.

### Código clave:
- `GOOGLE_URI`: URL de autenticación de Google Fit.
- `EmbedBuilder()`: Embed informativo con el enlace de autenticación.

---

## 👤 `/yo`
### Descripción:
Muestra el perfil del usuario, incluyendo logros y economía.

### Flujo:
1. Obtiene el perfil del usuario desde la base de datos.
2. Recupera logros asociados al usuario.
3. Genera un embed con la información del perfil.

### Código clave:
- `getUserProfile(userId)`: Obtiene la información del usuario.
- `User.findByPk(userId)`: Busca los datos en la base de datos.
- `UserAchievements.findAll({ where: { userId } })`: Obtiene los logros desbloqueados.

---

## 📦 Dependencias
- `discord.js`: Manejo de interacciones en Discord.
- `Sequelize`: ORM para base de datos.
- `.env`: Configuración de variables de entorno.

---

# BePlus - Configuración y Base de Datos

## 📌 Descripción
Este módulo gestiona la configuración y conexión a la base de datos **PostgreSQL** utilizando **Sequelize**.

---

## 📂 Configuración (`config.json`)
Define los entornos para el despliegue:

## 🔧 Configuración
1. Clonar el repositorio.
2. Instalar dependencias:
   ```sh
   npm install

# BePlus - Autenticación con Discord y Google

## 📌 Descripción
Este módulo gestiona la autenticación de usuarios en BePlus mediante **OAuth2** para **Discord** y **Google Fit**. Permite registrar usuarios, asignar roles y enlazar cuentas de fitness.

---

## 🔑 Autenticación con Discord
### **Endpoints**
- `GET /discordRedirect`: Redirige al usuario a la autenticación de Discord.
- `GET /discordAuth`: Intercambia el código de autorización por tokens y registra al usuario en BePlus.

### **Flujo**
1. Redirección a la página de autenticación de Discord con los permisos requeridos.
2. Obtención del código de autorización.
3. Solicitud del `access_token` y `refresh_token` a Discord.
4. Obtención de datos del usuario (`id`, `email`).
5. Registro del usuario en la base de datos.
6. Asignación del rol **NO VERIFICADO** en el servidor.

---

## 🏃 Autenticación con Google Fit
### **Endpoints**
- `GET /googleRedirect`: Redirige al usuario a la autenticación de Google Fit.
- `GET /googleAuth`: Intercambia el código de autorización por tokens y los asocia al usuario de BePlus.

### **Flujo**
1. Verificación del **ID de usuario de Discord**.
2. Generación de la URL de autenticación con permisos de acceso a la actividad física.
3. Obtención del código de autorización.
4. Solicitud del `access_token` y `refresh_token` a Google.
5. Asociación del usuario de BePlus con la cuenta de Google Fit.

---

## 🔧 Configuración
1. Configurar las variables de entorno en `.env`:
    - `DISCORD_CLIENT_ID`
    - `DISCORD_CLIENT_SECRET`
    - `DISCORD_REDIRECT_URI`
    - `GOOGLE_CLIENT_ID`
    - `GOOGLE_CLIENT_SECRET`
    - `GOOGLE_REDIRECT_URI`
    - `GUILD_ID`
    - `NOT_VERIFICATED_ROLE`
    - `VERIFICATED_ROLE`
2. Instalar dependencias con `npm install`.
3. Iniciar el servidor con `node server.js`.

---

## 📦 Dependencias
- **axios**: Para realizar peticiones HTTP a Discord y Google.
- **dotenv**: Para cargar las variables de entorno.
- **express**: Para gestionar las rutas de autenticación.
- **Sequelize**: Para la gestión de la base de datos.

---

## 📌 Notas
- Los usuarios deben autenticarse en **Discord** antes de enlazar **Google Fit**.
- El rol **NO VERIFICADO** se asigna hasta que se complete la autenticación.
- La integración con Google Fit permite registrar pasos y actividad física automáticamente.

---
# BePlus - Modelos de Base de Datos

## 📌 Descripción
Este módulo define la estructura de los modelos utilizados en BePlus mediante **Sequelize** y **PostgreSQL**. Los modelos gestionan usuarios, logros, transacciones, tienda y autenticación.

---

## 🏗️ **Modelos de Datos**

### 👤 **Usuarios y Perfiles**
#### `Users.js`
Define los usuarios de BePlus.
- **`userId`** *(STRING, PRIMARY KEY)*: Identificador único del usuario (Discord ID).
- **`email`** *(STRING, UNIQUE)*: Email del usuario.
- **`rockyCoins`** *(INTEGER, DEFAULT 0)*: Monedas virtuales del usuario.
- **`rockyGems`** *(INTEGER, DEFAULT 0)*: Gemas virtuales del usuario.
- **`createdAt`** *(DATE, DEFAULT NOW)*: Fecha de creación del usuario.

#### `Profile.js`
Almacena información del usuario.
- **`userId`** *(STRING, PRIMARY KEY, FK → Users)*: Relación con `Users.js`.
- **`age`** *(INTEGER, >=13, NULLABLE)*: Edad del usuario.
- **`description`** *(TEXT, NULLABLE)*: Descripción personalizada.
- **`name`** *(STRING, NULLABLE)*: Nombre del usuario.
- **`nickname`** *(STRING, NULLABLE)*: Apodo.
- **`gender`** *(ENUM: male, female, other, prefer_not_to_say, NULLABLE)*: Género.

---

### 🔑 **Autenticación**
#### `Auth.js`
Gestiona la autenticación de usuarios.
- **`userId`** *(STRING, PRIMARY KEY, FK → Users)*: Relación con `Users.js`.
- **`token`** *(STRING, NOT NULL)*: Token de acceso de Discord.
- **`refreshToken`** *(STRING, NOT NULL)*: Refresh token de Discord.
- **`googleToken`** *(STRING, NULLABLE)*: Token de acceso de Google Fit.
- **`googleRefreshToken`** *(STRING, NULLABLE)*: Refresh token de Google Fit.

---

### 🏆 **Sistema de Logros**
#### `Achievements.js`
Define los logros disponibles en BePlus.
- **`id`** *(UUID, PRIMARY KEY, AUTO-GENERATED)*: Identificador único.
- **`name`** *(STRING, NOT NULL)*: Nombre del logro.
- **`description`** *(STRING, NOT NULL)*: Descripción del logro.
- **`emoji`** *(STRING, NOT NULL)*: Emoji representativo.
- **`point`** *(INTEGER, NOT NULL)*: Puntos otorgados por el logro.

#### `UserAchievements.js`
Relación entre usuarios y logros desbloqueados.
- **`userId`** *(STRING, FK → Users, NOT NULL, CASCADE)*: Relación con `Users.js`.
- **`achievementId`** *(UUID, FK → Achievements, NOT NULL, CASCADE)*: Relación con `Achievements.js`.
- **`date`** *(DATE, DEFAULT NOW)*: Fecha de desbloqueo.

---

### 🚶 **Seguimiento de Pasos**
#### `UserSteps.js`
Registra la cantidad de pasos dados por el usuario.
- **`id`** *(UUID, PRIMARY KEY, AUTO-GENERATED)*: Identificador único.
- **`userId`** *(STRING, FK → Users, NOT NULL)*: Relación con `Users.js`.
- **`steps`** *(INTEGER, DEFAULT 0, NOT NULL)*: Cantidad de pasos acumulados.
- **`date`** *(DATEONLY, NOT NULL)*: Fecha del registro.

---

### 🛍️ **Tienda y Economía**
#### `Items.js`
Define los artículos disponibles en la tienda.
- **`id`** *(UUID, PRIMARY KEY, AUTO-GENERATED)*: Identificador único del ítem.
- **`name`** *(STRING, NOT NULL)*: Nombre del artículo.
- **`description`** *(STRING, NOT NULL)*: Descripción del artículo.
- **`price`** *(INTEGER, NOT NULL)*: Precio en RockyCoins o RockyGems.
- **`badge`** *(ENUM: coin, gem, NULLABLE)*: Tipo de moneda aceptada.
- **`category`** *(STRING, NOT NULL)*: Categoría del artículo.

#### `UserItems.js`
Relación entre usuarios y artículos comprados.
- **`id`** *(UUID, PRIMARY KEY, AUTO-GENERATED)*: Identificador único.
- **`userId`** *(UUID, FK → Users, NOT NULL, CASCADE)*: Relación con `Users.js`.
- **`itemId`** *(UUID, FK → Items, NOT NULL, CASCADE)*: Relación con `Items.js`.
- **`createdAt`** *(DATE, DEFAULT NOW)*: Fecha de adquisición.

#### `Store.js`
Define las tiendas dentro del sistema.
- **`id`** *(UUID, PRIMARY KEY, AUTO-GENERATED)*: Identificador único.
- **`name`** *(STRING, UNIQUE, NOT NULL)*: Nombre de la tienda.

#### `Transaction.js`
Registra todas las transacciones realizadas por los usuarios.
- **`id`** *(UUID, PRIMARY KEY, AUTO-GENERATED)*: Identificador único de la transacción.
- **`userId`** *(STRING, FK → Users, NOT NULL)*: Relación con `Users.js`.
- **`amount`** *(INTEGER, NOT NULL)*: Cantidad de monedas/gemas en la transacción.
- **`type`** *(ENUM: reward, compra)*: Tipo de transacción.
- **`productId`** *(STRING, FK → Items, NOT NULL)*: Identificador del artículo comprado.
- **`createdAt`** *(DATE, DEFAULT NOW)*: Fecha de la transacción.

---

## 🗄️ **Configuración de Base de Datos**
- **Todos los modelos utilizan Sequelize como ORM.**
- **Las relaciones están definidas con claves foráneas y eliminación en cascada (CASCADE).**
- **Los modelos usan `UUID` como identificadores únicos para evitar colisiones.**

---

## 📦 **Dependencias**
- **Sequelize**: ORM para la gestión de la base de datos.
- **PostgreSQL**: Base de datos utilizada.
- **dotenv**: Manejo de variables de entorno.

---

## 🔧 **Configuración del Proyecto**
1. **Configurar variables de entorno en `.env`:**
   ```sh
   POSTGRES_DB=beplus
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=secret
   POSTGRES_PORT=5432

# BePlus - Servidor y Bot de Discord

## 📌 Descripción
Este módulo maneja la inicialización del **bot de Discord**, el **servidor Express** y el **despliegue de comandos**. BePlus se conecta a una base de datos **PostgreSQL** utilizando **Sequelize** y gestiona autenticación con **Discord y Google**.

---

## 🚀 **Estructura de Archivos**

### 🗄️ **Servidor y API**
#### `server.js`
- **Framework:** Express.js.
- **Endpoints:**
    - `/api/auth/discord`: Redirección para autenticación con Discord.
    - `/api/auth/discord/callback`: Callback para recibir el código de autorización de Discord.
    - `/api/auth/google`: Redirección para autenticación con Google Fit.
    - `/api/auth/google/callback`: Callback para recibir el código de autorización de Google Fit.
    - `/form`: Renderiza un formulario de prueba.

---

#### `index.js`
- **Inicia el servidor y el bot.**
- **Autentica la conexión con PostgreSQL y sincroniza modelos.**
- **Corre el servidor en el puerto `3000`.**
- **Si el bot no está autenticado, lo inicia con `client.login(TOKEN)`.**

---

### 🤖 **Bot de Discord**
#### `bot.js`
- **Maneja la inicialización del bot de Discord.**
- **Carga los comandos de la carpeta `commands`.**
- **Escucha eventos como `InteractionCreate` para ejecutar comandos.**
- **Registra `GatewayIntentBits.Guilds` para permitir interacciones dentro de servidores.**
- **Se autentica con el `TOKEN` en `.env`.**

---

### 📢 **Despliegue de Comandos**
#### `deploy-commands.js`
- **Registra los comandos de Slash (`/comandos`).**
- **Lee los archivos en `commands/` y los sube a Discord.**
- **Usa la API REST de Discord para actualizar los comandos del bot.**
- **Requiere `TOKEN` y `APPLICATION_ID` en `.env`.**

---

## 🔧 **Configuración**
1. **Configurar variables de entorno en `.env`:**
   ```sh
   TOKEN=your_discord_bot_token
   APPLICATION_ID=your_discord_application_id
   POSTGRES_DB=beplus
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=secret
   POSTGRES_PORT=5432
# BePlus - Servicios de Logros

## 📌 Descripción
Este módulo maneja la lógica de logros en BePlus. Permite la creación, consulta y otorgamiento de logros en función del progreso del usuario.

---

## 🏆 **Servicios de Logros**
### **`achievementService.js`**
Maneja la gestión de logros en la base de datos.

#### **Funciones:**
- `createAchievement(req)`: Crea un nuevo logro en la base de datos.
- `getAllAchievements()`: Retorna todos los logros existentes.
- `getAchievementById(id)`: Obtiene un logro por su `id`.
- `getAchievementByName(name)`: Obtiene un logro por su `nombre`.
- `getUserAchievementById(req)`: Verifica si un usuario ha desbloqueado un logro específico.
- `getAllUserAchievementById(userId)`: Retorna todos los logros desbloqueados por un usuario.

---

### **`achievementGetService.js`**
Maneja la lógica de otorgamiento de logros según el progreso del usuario.

#### **Funciones:**
- `firstStep(userId)`: Otorga el logro **"Primer Paso"** si el usuario ha dado al menos un paso.
- `tenK(userId)`: Otorga el logro **"10k Club"** si el usuario ha caminado **10,000 pasos en un día**.
- `marathoner(userId)`: Otorga el logro **"Maratonista"** si el usuario ha acumulado **42,195 pasos**.
- `hundredKWalker(userId)`: Otorga el logro **"100k Walker"** si el usuario ha acumulado **100,000 pasos**.

#### **Dependencias:**
- `UserAchievements`: Modelo que asocia logros con usuarios.
- `getAchievementByName(name)`: Obtiene el logro desde la base de datos.
- `getAccumulatedSteps(userId)`: Obtiene la cantidad total de pasos acumulados.
- `getDaySteps(userId, date)`: Obtiene la cantidad de pasos dados en un día específico.

---

## 🔧 **Configuración**
1. **Asegurar que la base de datos esté configurada correctamente.**
2. **Verificar que `UserAchievements.js` y `Achievements.js` estén correctamente migrados.**
3. **Llamar a `achievementGetService` después de cada actualización de pasos para verificar logros.**

---

## 📦 **Dependencias**
- **Sequelize**: ORM para manejar la base de datos.
- **Google Fit API**: Para obtener los pasos de los usuarios.
- **Node.js y Express**: Para manejar las solicitudes HTTP.

---

## 📝 **Notas**
- **Los logros son otorgados automáticamente cuando un usuario cumple los requisitos.**
- **Si un usuario ya tiene un logro, la función simplemente lo ignora.**
- **Para agregar más logros, se debe actualizar `Achievements.js` y `achievementGetService.js`.**

---

# BePlus - Servicios Backend

## 📌 Descripción
Este módulo gestiona la lógica de la aplicación, incluyendo la economía del juego, tienda, autenticación con tokens, gestión de usuarios y sincronización con **Google Fit**.

---

## 💰 **Economía**
### `economyService.js`
Maneja la economía del sistema con **RockyCoins** y **RockyGems**.

#### **Funciones:**
- `createBadges()`: Crea las monedas virtuales en la base de datos.
- `createTransaction(req)`: Registra transacciones en la base de datos.
- `addRockyGems(req)`: Agrega **RockyGems** al usuario y registra la transacción.
- `addRockyCoins(req)`: Agrega **RockyCoins** al usuario y registra la transacción.

---

## 🛍️ **Tienda**
### `storeService.js`
Gestiona la tienda de BePlus, permitiendo comprar y listar artículos.

#### **Funciones:**
- `getStore()`: Obtiene o crea la tienda **Rocky Store**.
- `getCategories()`: Retorna todas las categorías de artículos disponibles.
- `getItems()`: Retorna todos los artículos de la tienda.
- `getItemsByCategory(category)`: Obtiene artículos según su categoría.
- `getItemByCategoryAndName(category, itemName)`: Obtiene un artículo por su nombre y categoría.
- `buyItem(userId, itemName, category)`: Permite a un usuario comprar un artículo usando **RockyCoins**.

---

## 🔑 **Autenticación y Tokens**
### `tokenService.js`
Maneja la autenticación de OAuth2 para **Discord y Google Fit**.

#### **Funciones:**
- `getOAuthToken(tokenUrl, params)`: Obtiene tokens de autenticación.
- `refreshGoogleToken(userId)`: Renueva el token de Google Fit si ha expirado.
- `refreshDiscordToken(userId)`: Renueva el token de Discord si ha expirado.

---

## 👤 **Gestión de Usuarios**
### `userService.js`
Gestiona la creación y actualización de usuarios en BePlus.

#### **Funciones:**
- `createUser(req)`: Crea un nuevo usuario con perfil y autenticación.
- `assignRoleToUser(req)`: Asigna un rol a un usuario en Discord.
- `editUser(req, res)`: Edita los datos del perfil del usuario.
- `getAllUser()`: Obtiene todos los usuarios registrados.
- `getUserProfile(userId)`: Retorna el perfil de un usuario.
- `deleteUser(id)`: Elimina un usuario de la base de datos.

---

## 🚶 **Google Fit - Pasos**
### `fitService.js`
Maneja la integración con **Google Fit** y registra la actividad del usuario.

#### **Funciones:**
- `addGoogleAuth(req)`: Vincula la cuenta del usuario con **Google Fit**.
- `registerSteps(req)`: Registra los pasos del usuario en la base de datos.
- `getDaySteps(req)`: Obtiene los pasos de un usuario en un día específico.
- `getAccumulatedSteps(userId)`: Obtiene la cantidad total de pasos del usuario.
- `getSteps(req)`: Obtiene los pasos dentro de un período de tiempo.
- `claimRockyCoins(userId)`: Convierte los pasos en **RockyCoins**.

---

## 🔧 **Configuración**
1. **Configurar variables de entorno en `.env`:**
   ```sh
   TOKEN=your_discord_bot_token
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   DISCORD_CLIENT_ID=your_discord_client_id
   DISCORD_CLIENT_SECRET=your_discord_client_secret