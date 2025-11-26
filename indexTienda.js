import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

// Base de datos
import { sequelize, testConnection } from "./database.js";

// Importa TODOS los modelos desde models/index.js
import db from "./models/index.js";

const { Usuario, Producto, Orden, OrdProd } = db;

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ========================================================
// 🟩 PROBAR LA CONEXIÓN A LA BASE DE DATOS
// ========================================================
testConnection();

// Ruta para verificar que el backend responde
app.get("/", (req, res) => {
  res.send("🐶 Backend de Kozzy Shop funcionando correctamente.");
});

// ========================================================
// USUARIOS
// ========================================================

app.get("/usuarios", async (req, res) => {
  const usuarios = await Usuario.findAll();
  res.json(usuarios);
});

app.get("/usuarios/:id", async (req, res) => {
  const usuario = await Usuario.findByPk(req.params.id);
  usuario
    ? res.json(usuario)
    : res.status(404).json({ error: "Usuario no encontrado" });
});

app.post("/usuarios", async (req, res) => {
  try {
    const nuevo = await Usuario.create(req.body);
    res.json(nuevo);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put("/usuarios/:id", async (req, res) => {
  const usuario = await Usuario.findByPk(req.params.id);
  if (!usuario)
    return res.status(404).json({ error: "Usuario no encontrado" });

  await usuario.update(req.body);
  res.json(usuario);
});

app.delete("/usuarios/:id", async (req, res) => {
  const usuario = await Usuario.findByPk(req.params.id);
  if (!usuario)
    return res.status(404).json({ error: "Usuario no encontrado" });

  await usuario.destroy();
  res.json({ mensaje: "Usuario eliminado" });
});

// ========================================================
// CAMBIAR CONTRASEÑA
// ========================================================

app.put("/usuarios/:id/password", async (req, res) => {
  try {
    const { actual, nueva } = req.body;
    const usuario = await Usuario.findByPk(req.params.id);

    if (!usuario)
      return res.status(404).json({ error: "Usuario no encontrado" });

    if (usuario.password !== actual)
      return res.status(400).json({ error: "Contraseña actual incorrecta" });

    await usuario.update({ password: nueva });

    res.json({ message: "Contraseña actualizada correctamente" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error cambiando la contraseña" });
  }
});

// ========================================================
// LOGIN
// ========================================================

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ error: "Faltan datos" });

    const usuario = await Usuario.findOne({ where: { email, password } });

    if (!usuario)
      return res.status(401).json({ error: "Credenciales inválidas" });

    if (!usuario.activo)
      return res
        .status(403)
        .json({ error: "Usuario inactivo, no puede iniciar sesión" });

    res.json({
      id: usuario.id,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      email: usuario.email,
      role: usuario.role,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

// ========================================================
// PRODUCTOS
// ========================================================

app.get("/productos", async (req, res) => {
  res.json(await Producto.findAll());
});

app.get("/productos/:id", async (req, res) => {
  const producto = await Producto.findByPk(req.params.id);
  producto
    ? res.json(producto)
    : res.status(404).json({ error: "Producto no encontrado" });
});

app.post("/productos", async (req, res) => {
  try {
    const nuevo = await Producto.create(req.body);
    res.json(nuevo);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put("/productos/:id", async (req, res) => {
  const producto = await Producto.findByPk(req.params.id);
  if (!producto)
    return res.status(404).json({ error: "Producto no encontrado" });

  await producto.update(req.body);
  res.json(producto);
});

app.delete("/productos/:id", async (req, res) => {
  const producto = await Producto.findByPk(req.params.id);
  if (!producto)
    return res.status(404).json({ error: "Producto no encontrado" });

  await producto.destroy();
  res.json({ mensaje: "Producto eliminado" });
});

// ========================================================
// ORDENES
// ========================================================

app.get("/ordenes", async (req, res) => {
  try {
    const ordenes = await Orden.findAll({
      include: [
        { model: Usuario, as: "usuario" },
        { model: Producto, as: "productos" },
      ],
    });
    res.json(ordenes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error obteniendo órdenes" });
  }
});

app.get("/ordenes/:id", async (req, res) => {
  try {
    const orden = await Orden.findByPk(req.params.id, {
      include: [
        { model: Usuario, as: "usuario" },
        { model: Producto, as: "productos" },
      ],
    });

    orden
      ? res.json(orden)
      : res.status(404).json({ error: "Orden no encontrada" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error obteniendo la orden" });
  }
});

app.post("/ordenes", async (req, res) => {
  console.log("Body recibido:", req.body);
  const t = await sequelize.transaction();

  try {
    const { usuarioId, total, items, envio, pago } = req.body;

    if (!usuarioId || !items || items.length === 0) {
      return res.status(400).json({ error: "Faltan datos para crear orden" });
    }

    // 1. Crear la orden
    const nuevaOrden = await Orden.create(
      {
        usuarioId,
        total,
        envio: envio || null,
        pago: pago || null,
      },
      { transaction: t }
    );

    // 2. Insertar productos en OrdProds
    for (const item of items) {
      await OrdProd.create(
        {
          ordenId: nuevaOrden.id,
          productoId: item.productoId,
          cantidad: item.cantidad,
          precioUnitario: item.precio, // o item.precioUnitario
        },
        { transaction: t }
      );
    }

    await t.commit();

    // 3. Obtener la orden completa con productos
    const ordenCompleta = await Orden.findByPk(nuevaOrden.id, {
      include: [
        { model: Usuario, as: "usuario" },
        { model: Producto, as: "productos" },
        { model: OrdProd, as: "detalle" },
      ],
    });

    return res.json(ordenCompleta);
  } catch (error) {
    console.error(error);
    await t.rollback();
    return res.status(500).json({ error: "Error al crear la orden" });
  }
});


app.put("/ordenes/:id", async (req, res) => {
  const orden = await Orden.findByPk(req.params.id);
  if (!orden)
    return res.status(404).json({ error: "Orden no encontrada" });

  await orden.update(req.body);
  res.json(orden);
});

app.delete("/ordenes/:id", async (req, res) => {
  const orden = await Orden.findByPk(req.params.id);
  if (!orden)
    return res.status(404).json({ error: "Orden no encontrada" });

  await orden.destroy();
  res.json({ mensaje: "Orden eliminada" });
});

// ========================================================
// SERVIDOR
// ========================================================

app.listen(PORT, () =>
  console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`)
);
