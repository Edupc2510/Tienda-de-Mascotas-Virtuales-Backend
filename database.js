import { Sequelize } from "sequelize";

let sequelize;

// PRODUCCIÓN (Railway)
if (process.env.DATABASE_URL) {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: "postgres",
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
    logging: false,
  });

  console.log(" Modo producción: usando Railway DATABASE_URL");
}

// DESARROLLO LOCAL
else {
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      dialect: "postgres",
      logging: false,
    }
  );

  console.log(" Modo local: usando configuración de desarrollo");
}

export { sequelize };

export async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log(" Conexión a la BD exitosa");
  } catch (error) {
    console.error(" Error al conectar a la BD:", error);
  }
}
