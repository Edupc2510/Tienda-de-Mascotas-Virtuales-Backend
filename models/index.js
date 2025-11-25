import fs from "fs";
import path from "path";
import { Sequelize } from "sequelize";
import { fileURLToPath } from "url";
import { sequelize } from "../database.js"; // ✅ IMPORTA la conexión real desde database.js

// Emular __dirname en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const basename = path.basename(__filename);

export const db = {};


const modelFiles = fs
  .readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf(".") !== 0 && // no archivos ocultos
      file !== basename &&       // no este mismo archivo
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

// Ejecutar asociaciones si el modelo las define
Object.values(db).forEach((model) => {
  if (typeof model.associate === "function") {
    model.associate(db);
  }
});

// Exportar
db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
