import fs from "fs";
import path from "path";
import { Sequelize } from "sequelize";
import { fileURLToPath } from "url";
import { sequelize } from "../database.js"; // conexión real a la BD

// Emular __dirname en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Nombre de este archivo
const basename = path.basename(__filename);

// Objeto que contendrá TODOS los modelos
const db = {};

// =======================================================
// 🔎 LEER TODOS LOS ARCHIVOS DE MODELOS
// =======================================================

const modelFiles = fs
  .readdirSync(__dirname)
  .filter(
    (file) =>
      file !== basename &&
      file.endsWith(".js") &&
      !file.endsWith(".test.js") &&
      !file.startsWith(".")
  );

for (const file of modelFiles) {
  const modelPath = path.join(__dirname, file);

  // Import dinámico de ES Modules
  const module = await import(modelPath);

  // Cada modelo debe exportar "default"
  const model = module.default(sequelize, Sequelize.DataTypes);

  db[model.name] = model;
}

// =======================================================
// 🔗 Ejecutar asociaciones (associate) si existen
// =======================================================

Object.values(db).forEach((model) => {
  if (typeof model.associate === "function") {
    model.associate(db);
  }
});

// =======================================================
// 📤 Exportar
// =======================================================

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
