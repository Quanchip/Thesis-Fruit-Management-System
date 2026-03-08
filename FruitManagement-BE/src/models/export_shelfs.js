import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class export_shelfs extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    export_shelf_id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    shelf_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'shelves',
        key: 'shelf_id'
      }
    },
    export_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'exports',
        key: 'export_id'
      }
    },
    export_shelf_quantity: {
      type: DataTypes.FLOAT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'export_shelfs',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "export_shelf_id" },
        ]
      },
      {
        name: "shelf_id",
        using: "BTREE",
        fields: [
          { name: "shelf_id" },
        ]
      },
      {
        name: "export_id",
        using: "BTREE",
        fields: [
          { name: "export_id" },
        ]
      },
    ]
  });
  }
}
