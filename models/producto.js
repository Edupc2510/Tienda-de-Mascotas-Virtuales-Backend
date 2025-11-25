import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
  class Producto extends Model {
    static associate(models) {
      // N:M con Ordenes
      Producto.belongsToMany(models.Orden, {
        through: models.OrdProd,
        foreignKey: "productoId",
        otherKey: "ordenId",
        as: "ordenes",
      });

      // Detalle directo (1:N)
      Producto.hasMany(models.OrdProd, {
        foreignKey: "productoId",
        as: "detalle",
      });
    }
  }

  Producto.init(
    {
      nombre: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      descripcion: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      imagenUrl: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      imagenUrlCartoon: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      precio: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      categoria: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      ventasMes: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      activo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      sequelize,
      modelName: "Producto",
      tableName: "Productos",
    }
  );

  return Producto;
};

