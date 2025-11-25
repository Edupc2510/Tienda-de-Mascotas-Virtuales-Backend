import { Sequelize } from "sequelize";

// Verifica variables necesarias
const requiredEnv = ["DB_NAME", "DB_USER", "DB_PASSWORD", "DB_HOST"];
requiredEnv.forEach((v) => {
  if (!process.env[v]) {
    console.warn(` WARNING: Missing environment variable ${v}`);
  }
});

// Conexión Sequelize
export const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "postgres",

    // Render necesita SSL
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },

    logging: false, 
  }
);


export async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log(" Conexión a la BD exitosa");
  } catch (error) {
    console.error(" Error al conectar a la BD:", error);
  }
}