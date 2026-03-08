import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class exports extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    export_id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    warehouse_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'warehouses',
        key: 'warehouse_id'
      }
    },
    export_date: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
    },
    export_quantity: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'exports',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "export_id" },
        ]
      },
      {
        name: "idx_export_warehouse_id",
        using: "BTREE",
        fields: [
          { name: "warehouse_id" },
        ]
      },
    ]
  });
  }
}
