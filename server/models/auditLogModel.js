import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import User from './userModel.js';

const AuditLog = sequelize.define('AuditLog', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    action: {
        type: DataTypes.STRING,
        allowNull: false
    },
    method: {
        type: DataTypes.STRING,
        allowNull: false
    },
    details: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    ipAddress: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    timestamps: true
});

AuditLog.belongsTo(User, { 
  foreignKey: 'userId',
  onDelete: 'CASCADE'
});

export default AuditLog; 