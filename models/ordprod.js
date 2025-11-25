import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
  class OrdProd extends Model {
    static associate(models) {
      // Relación con Orden
      OrdProd.belongsTo(models.Orden, {
        foreignKey: "ordenId",
        as: "orden",
      });

      // Relación con Producto
      OrdProd.belongsTo(models.Producto, {
        foreignKey: "productoId",
        as: "producto",
      });
    }
  }

  OrdProd.init(
    {
      ordenId: DataTypes.INTEGER,
      productoId: DataTypes.INTEGER,
      cantidad: DataTypes.INTEGER,
      precioUnitario: DataTypes.FLOAT,
    },
    {
      sequelize,
      modelName: "OrdProd",
      tableName: "OrdProds",
    }
  );

  return OrdProd;
};

