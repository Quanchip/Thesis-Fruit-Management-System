import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class warehouse_products extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    warehouse_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'warehouses',
        key: 'warehouse_id'
      }
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'products',
        key: 'product_id'
      }
    },
    quantity: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 0
    }
  }, {
    sequelize,
    tableName: 'warehouse_products',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "warehouse_id" },
          { name: "product_id" },
        ]
      },
      {
        name: "idx_warehouse_product_id",
        using: "BTREE",
        fields: [
          { name: "product_id" },
        ]
      },
      {
        name: "idx_warehouse_warehouse_id",
        using: "BTREE",
        fields: [
          { name: "warehouse_id" },
        ]
      },
    ]
  });
  }
}
