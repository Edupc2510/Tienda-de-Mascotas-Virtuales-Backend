// models/OrdProds.js
import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
  class OrdProd extends Model {
    static associate(models) {
      OrdProd.belongsTo(models.Orden, {
        foreignKey: "ordenId",
        as: "orden",
      });

      OrdProd.belongsTo(models.Producto, {
        foreignKey: "productoId",
        as: "producto",
      });
    }
  }

  OrdProd.init(
    {
      ordenId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      productoId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      cantidad: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        validate: { min: 1 },
      },
      precioUnitario: {
        // 👇 dinero => DECIMAL, NO FLOAT
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "OrdProd",
      tableName: "OrdProds",
    }
  );

  return OrdProd;
};
