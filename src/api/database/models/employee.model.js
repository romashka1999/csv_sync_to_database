const { DataTypes, Model } = require('sequelize');
const { Database } = require('../db');

class Employee extends Model { }

Employee.init(
    {
        employeeNo: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false,
        },
        firstName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        lastName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false
        },
        phone: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false
        },
        isDeleted: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        } 
    },
    {
        tableName: "employees",
        sequelize: Database,
        timestamps: true
    }
);

module.exports = {
    Employee
}