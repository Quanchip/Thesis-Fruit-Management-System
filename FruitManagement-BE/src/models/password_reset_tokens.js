import _sequelize from "sequelize";
const { Model } = _sequelize;

export default class password_reset_tokens extends Model {
  static init(sequelize, DataTypes) {
    return super.init(
      {
        password_reset_token_id: {
          autoIncrement: true,
          type: DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true,
        },
        user_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: "users",
            key: "user_id",
          },
        },
        token_hash: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        expires_at: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        used_at: {
          type: DataTypes.DATE,
          allowNull: true,
        },
      },
      {
        sequelize,
        tableName: "password_reset_tokens",
        timestamps: false,
        indexes: [
          {
            name: "PRIMARY",
            unique: true,
            using: "BTREE",
            fields: [{ name: "password_reset_token_id" }],
          },
          {
            name: "idx_password_reset_tokens_user_id",
            using: "BTREE",
            fields: [{ name: "user_id" }],
          },
          {
            name: "idx_password_reset_tokens_token_hash",
            unique: true,
            using: "BTREE",
            fields: [{ name: "token_hash" }],
          },
        ],
      }
    );
  }
}
