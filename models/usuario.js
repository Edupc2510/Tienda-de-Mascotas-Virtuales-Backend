import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
  class Usuario extends Model {
    static associate(models) {
      // Relación 1:N con Orden
      Usuario.hasMany(models.Orden, {
        foreignKey: "usuarioId",
        as: "ordenes",
      });
    }
  }

  Usuario.init(
    {
      nombre: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      apellido: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      role: {
        type: DataTypes.STRING,
        defaultValue: "user",
      },
      activo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      sequelize,
      modelName: "Usuario",
      tableName: "Usuarios",
    }
  );

  return Usuario;
};

