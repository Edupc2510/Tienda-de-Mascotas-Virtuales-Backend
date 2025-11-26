// indexTienda.js
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
  res.send("🐶 Backend de Kozzy Shop funcionando correctamente (actualizado).");
});

// (Opcional) endpoint para verificar despliegue/version
app.get("/version", (req, res) => {
  res.json({ version: "2025-11-26-1" });
});

// Helper: redondear a 2 decimales
const round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;

// Helper: includes consistentes para orden
const ordenIncludes = [
  { model: Usuario, as: "usuario" },
  {
    model: OrdProd,
    as: "detalle",
    include: [{ model: Producto, as: "producto" }], // 👈 para nombre/imagen/etc
  },
];

// ========================================================
// USUARIOS
// ========================================================

app.get("/usuarios", async (req, res) => {
  try {
    const usuarios = await Usuario.findAll();
    res.json(usuarios);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error obteniendo usuarios" });
  }
});

app.get("/usuarios/:id", async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.params.id);
    usuario
      ? res.json(usuario)
      : res.status(404).json({ error: "Usuario no encontrado" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error obteniendo usuario" });
  }
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
  try {
    const usuario = await Usuario.findByPk(req.params.id);
    if (!usuario) return res.status(404).json({ error: "Usuario no encontrado" });

    await usuario.update(req.body);
    res.json(usuario);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error actualizando usuario" });
  }
});

app.delete("/usuarios/:id", async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.params.id);
    if (!usuario) return res.status(404).json({ error: "Usuario no encontrado" });

    await usuario.destroy();
    res.json({ mensaje: "Usuario eliminado" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error eliminando usuario" });
  }
});

// ========================================================
// CAMBIAR CONTRASEÑA
// ========================================================

app.put("/usuarios/:id/password", async (req, res) => {
  try {
    const { actual, nueva } = req.body;
    const usuario = await Usuario.findByPk(req.params.id);

    if (!usuario) return res.status(404).json({ error: "Usuario no encontrado" });

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

    if (!usuario) return res.status(401).json({ error: "Credenciales inválidas" });

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
  try {
    res.json(await Producto.findAll());
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error obteniendo productos" });
  }
});

app.get("/productos/:id", async (req, res) => {
  try {
    const producto = await Producto.findByPk(req.params.id);
    producto
      ? res.json(producto)
      : res.status(404).json({ error: "Producto no encontrado" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error obteniendo producto" });
  }
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
  try {
    const producto = await Producto.findByPk(req.params.id);
    if (!producto) return res.status(404).json({ error: "Producto no encontrado" });

    await producto.update(req.body);
    res.json(producto);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error actualizando producto" });
  }
});

app.delete("/productos/:id", async (req, res) => {
  try {
    const producto = await Producto.findByPk(req.params.id);
    if (!producto) return res.status(404).json({ error: "Producto no encontrado" });

    await producto.destroy();
    res.json({ mensaje: "Producto eliminado" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error eliminando producto" });
  }
});

// ========================================================
// ORDENES
// ========================================================

app.get("/ordenes", async (req, res) => {
  try {
    const where = {};
    if (req.query.usuarioId) where.usuarioId = req.query.usuarioId;

    const ordenes = await Orden.findAll({
      where,
      include: ordenIncludes,
      order: [["createdAt", "DESC"]],
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
      include: ordenIncludes,
    });

    orden ? res.json(orden) : res.status(404).json({ error: "Orden no encontrada" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error obteniendo la orden" });
  }
});

app.post("/ordenes", async (req, res) => {
  console.log("📦 Body recibido en /ordenes:", req.body);
  const t = await sequelize.transaction();

  try {
    const { usuarioId, items, envio, pago } = req.body;

    if (!usuarioId || !Array.isArray(items) || items.length === 0) {
      await t.rollback();
      return res.status(400).json({ error: "Faltan datos para crear orden" });
    }

    // 1) Normalizar items
    const itemsNormalizados = items.map((item) => {
      const productoId = item.productoId ?? item.id;
      const cantidad = Number(item.cantidad ?? 1);

      const precioRaw =
        item.precio ??
        item.precioUnitario ??
        item.precioDescuento ??
        item.precioFinal ??
        item.precioBase;

      const precio = Number(precioRaw);

      if (!productoId) throw new Error("Item sin productoId/id");
      if (!Number.isFinite(cantidad) || cantidad <= 0) throw new Error("Cantidad inválida");
      if (!Number.isFinite(precio)) throw new Error("Precio inválido");

      return {
        productoId: Number(productoId),
        cantidad,
        precio: round2(precio),
      };
    });

    // 2) Calcular total en backend
    const totalCalculado = round2(
      itemsNormalizados.reduce((acc, it) => acc + it.precio * it.cantidad, 0)
    );

    // 3) Enriquecer items con nombre/imagen para que el front pueda imprimir orden.items.nombre
    const ids = [...new Set(itemsNormalizados.map((x) => x.productoId))];

    const productos = await Producto.findAll({
      where: { id: ids },
      attributes: ["id", "nombre", "imagenUrl", "imagenUrlCartoon", "activo"],
      transaction: t,
    });

    const mapProd = new Map(productos.map((p) => [p.id, p]));

    const itemsConNombre = itemsNormalizados.map((it) => {
      const p = mapProd.get(it.productoId);
      if (!p) throw new Error(`Producto no existe: ${it.productoId}`);

      return {
        productoId: it.productoId,
        nombre: p.nombre,
        imagenUrl: p.imagenUrl,
        imagenUrlCartoon: p.imagenUrlCartoon ?? null,
        activo: p.activo ?? true,
        cantidad: it.cantidad,
        precio: it.precio,
      };
    });

    // 4) Crear orden
    const nuevaOrden = await Orden.create(
      {
        usuarioId,
        total: totalCalculado,
        items: itemsConNombre,
        envio: envio || null,
        pago: pago || null,
        // estado: "Pendiente" (default)
      },
      { transaction: t }
    );

    // 5) Insertar detalle
    for (const it of itemsNormalizados) {
      await OrdProd.create(
        {
          ordenId: nuevaOrden.id,
          productoId: it.productoId,
          cantidad: it.cantidad,
          // OrdProd.precioUnitario es DECIMAL(10,2) => pasamos string fijo
          precioUnitario: round2(it.precio).toFixed(2),
        },
        { transaction: t }
      );
    }

    await t.commit();

    // 6) Devolver orden completa
    const ordenCompleta = await Orden.findByPk(nuevaOrden.id, {
      include: ordenIncludes,
    });

    return res.json(ordenCompleta);
  } catch (error) {
    console.error("❌ ERROR AL CREAR ORDEN:", error);
    await t.rollback();
    return res.status(500).json({ error: error.message || "Error al crear la orden" });
  }
});

// actualizar orden (genérico)
app.put("/ordenes/:id", async (req, res) => {
  try {
    const orden = await Orden.findByPk(req.params.id);
    if (!orden) return res.status(404).json({ error: "Orden no encontrada" });

    await orden.update(req.body);

    const ordenActualizada = await Orden.findByPk(req.params.id, {
      include: ordenIncludes,
    });

    res.json(ordenActualizada);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error actualizando orden" });
  }
});

// ✅ "DELETE" = CANCELAR (NO BORRAR)
app.delete("/ordenes/:id", async (req, res) => {
  try {
    const orden = await Orden.findByPk(req.params.id);
    if (!orden) return res.status(404).json({ error: "Orden no encontrada" });

    await orden.update({ estado: "Cancelado" });

    const ordenActualizada = await Orden.findByPk(req.params.id, {
      include: ordenIncludes,
    });

    return res.json(ordenActualizada);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Error cancelando la orden" });
  }
});

// ========================================================
// SERVIDOR
// ========================================================
app.listen(PORT, () => console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`));
