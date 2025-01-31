import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import User from './userModel.js';

const Contact = sequelize.define('Contact', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        }
    },
    email: {
        type: DataTypes.STRING,
        allowNull: true
    },
    subject: {
        type: DataTypes.STRING,
        allowNull: false
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    reply: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('unread', 'read', 'replied'),
        defaultValue: 'unread'
    },
    isRead: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
});

Contact.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Contact, { foreignKey: 'userId' });

export default Contact; 