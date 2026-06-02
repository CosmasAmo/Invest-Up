import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const DeletedInvestment = sequelize.define('DeletedInvestment', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    originalInvestmentId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    profit: {
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

export default DeletedInvestment; 