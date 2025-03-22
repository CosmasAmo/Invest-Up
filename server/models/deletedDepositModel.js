import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const DeletedDeposit = sequelize.define('DeletedDeposit', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    originalDepositId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    originalCreatedAt: {
        type: DataTypes.DATE,
        allowNull: false
    }
}, {
    timestamps: true
});

export default DeletedDeposit; 