import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const DeletedWithdrawal = sequelize.define('DeletedWithdrawal', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    originalWithdrawalId: {
        type: DataTypes.INTEGER,
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

export default DeletedWithdrawal; 