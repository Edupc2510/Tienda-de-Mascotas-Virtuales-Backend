// models/Orden.js
import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
  class Orden extends Model {
    static associate(models) {
      Orden.belongsTo(models.Usuario, {
        foreignKey: "usuarioId",
        as: "usuario",
      });

      Orden.belongsToMany(models.Producto, {
        through: models.OrdProd,
        foreignKey: "ordenId",
        otherKey: "productoId",
        as: "productos",
      });

      Orden.hasMany(models.OrdProd, {
        foreignKey: "ordenId",
        as: "detalle",
      });
    }
  }

  Orden.init(
    {
      usuarioId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      items: {
        type: DataTypes.JSON,
        allowNull: true, // tu BD puede tener NOT NULL; si es así, guárdalo siempre en el POST
      },
      envio: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      pago: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      total: {
        // 👇 dinero => DECIMAL, NO FLOAT
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      estado: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "Pendiente",
      },
    },
    {
      sequelize,
      modelName: "Orden",
      tableName: "Ordenes",
    }
  );

  return Orden;
};
