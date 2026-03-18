import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class chat_messages extends Model {
    static init(sequelize, DataTypes) {
        return super.init({
            message_id: {
                autoIncrement: true,
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true
            },
            sender_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'user_id'
                }
            },
            receiver_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'user_id'
                }
            },
            message: {
                type: DataTypes.TEXT,
                allowNull: false
            },
            is_read: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },
            created_at: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            }
        }, {
            sequelize,
            tableName: 'chat_messages',
            timestamps: false,
            indexes: [
                {
                    name: "PRIMARY",
                    unique: true,
                    using: "BTREE",
                    fields: [
                        { name: "message_id" },
                    ]
                },
                {
                    name: "sender_id",
                    using: "BTREE",
                    fields: [
                        { name: "sender_id" },
                    ]
                },
                {
                    name: "receiver_id",
                    using: "BTREE",
                    fields: [
                        { name: "receiver_id" },
                    ]
                },
            ]
        });
    }
}
