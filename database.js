import { Sequelize } from "sequelize";

let sequelize;

// =======================================
// 1️⃣ MODO AZURE — si existe un host de Azure
// =======================================
if (
  process.env.DB_HOST &&
  process.env.DB_HOST.includes("postgres.database.azure.com")
) {
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      port: 5432,
      dialect: "postgres",
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      },
      logging: false,
    }
  );

  console.log("🔥 Producción Azure: conectado a PostgreSQL en Azure");
}

// =======================================
// 2️⃣ MODO LOCAL — sin SSL
// =======================================
else {
  sequelize = new Sequelize(
    process.env.DB_NAME || "kozzy_db",
    process.env.DB_USER || "postgres",
    process.env.DB_PASSWORD || "",
    {
      host: process.env.DB_HOST || "localhost",
      dialect: "postgres",
      logging: false,
    }
  );

  console.log("🐾 Modo local: conectado a PostgreSQL local");
}

// =======================================
// Export
// =======================================
export { sequelize };

export async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log("✨ Conexión a la BD exitosa");
  } catch (error) {
    console.error("❌ Error al conectar a la BD:", error);
  }
}
