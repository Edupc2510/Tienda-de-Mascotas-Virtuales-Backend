import fs from "fs";
import path from "path";
import { Sequelize } from "sequelize";
import { fileURLToPath } from "url";
import configFile from "../config/config.json" assert { type: "json" };

// Necesario porque ES Modules NO tienen __dirname
const __filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(_filename);

const basename = path.basename(__filename);
const env = process.env.NODE_ENV || "development";
const config = configFile[env];

export const db = {};
export let sequelize;

// Crear conexión
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config
  );
}

// Cargar todos los modelos automáticamente
const modelFiles = fs.readdirSync(__dirname).filter((file) => {
  return (
    file.indexOf(".") !== 0 &&
    file !== basename &&
    file.endsWith(".js") &&
    !file.endsWith(".test.js")
  );
});

for (const file of modelFiles) {
  const modelPath = path.join(__dirname, file);

  // IMPORT DINÁMICO
  const module = await import(modelPath);

  // Cada archivo de modelo debe exportar default
  const model = module.default(sequelize, Sequelize.DataTypes);

  db[model.name] = model;
}

// Ejecutar asociaciones
Object.values(db).forEach((model) => {
  if (model.associate) {
    model.associate(db);
  }
});

// Exportar
db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;