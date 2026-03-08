import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class export_products extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'products',
        key: 'product_id'
      }
    },
    export_shelf_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'export_shelfs',
        key: 'export_shelf_id'
      }
    },
    export_product_quantity: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'export_products',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "product_id" },
          { name: "export_shelf_id" },
        ]
      },
      {
        name: "idx_export_product_id",
        using: "BTREE",
        fields: [
          { name: "product_id" },
        ]
      },
      {
        name: "idx_export_shelf_id",
        using: "BTREE",
        fields: [
          { name: "export_shelf_id" },
        ]
      },
    ]
  });
  }
}
