import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class warehouses extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    warehouse_id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'warehouses',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "warehouse_id" },
        ]
      },
    ]
  });
  }
}
