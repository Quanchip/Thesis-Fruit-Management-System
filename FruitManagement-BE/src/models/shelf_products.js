import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class shelf_products extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    shelf_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'shelves',
        key: 'shelf_id'
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
    tableName: 'shelf_products',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "shelf_id" },
          { name: "product_id" },
        ]
      },
      {
        name: "idx_shelf_product_id",
        using: "BTREE",
        fields: [
          { name: "product_id" },
        ]
      },
      {
        name: "idx_shelf_shelf_id",
        using: "BTREE",
        fields: [
          { name: "shelf_id" },
        ]
      },
    ]
  });
  }
}
