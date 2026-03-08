import _sequelize from "sequelize";
const { Model } = _sequelize;

export default class auth_refresh_tokens extends Model {
  static init(sequelize, DataTypes) {
    return super.init(
      {
        refresh_token_id: {
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
        is_revoked: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        revoked_at: {
          type: DataTypes.DATE,
          allowNull: true,
        },
      },
      {
        sequelize,
        tableName: "auth_refresh_tokens",
        timestamps: false,
        indexes: [
          {
            name: "PRIMARY",
            unique: true,
            using: "BTREE",
            fields: [{ name: "refresh_token_id" }],
          },
          {
            name: "idx_auth_refresh_tokens_user_id",
            using: "BTREE",
            fields: [{ name: "user_id" }],
          },
          {
            name: "idx_auth_refresh_tokens_token_hash",
            unique: true,
            using: "BTREE",
            fields: [{ name: "token_hash" }],
          },
        ],
      }
    );
  }
}
