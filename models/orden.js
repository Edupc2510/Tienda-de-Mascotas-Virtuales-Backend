import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
  class Orden extends Model {
    static associate(models) {
      // Usuario 1:N
      Orden.belongsTo(models.Usuario, {
        foreignKey: "usuarioId",
        as: "usuario",
      });

      // Productos N:M
      Orden.belongsToMany(models.Producto, {
        through: models.OrdProd,
        foreignKey: "ordenId",
        otherKey: "productoId",
        as: "productos",
      });

      // Detalle (1:N)
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
        allowNull: true,
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
        type: DataTypes.FLOAT,
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

