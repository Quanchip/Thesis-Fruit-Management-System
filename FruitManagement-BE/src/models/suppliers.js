import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class suppliers extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    supplier_id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    supplier_name: {
      type: DataTypes.STRING(255),
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'suppliers',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "supplier_id" },
        ]
      },
    ]
  });
  }
}
