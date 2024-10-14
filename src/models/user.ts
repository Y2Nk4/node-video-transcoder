import { Model, DataTypes } from 'sequelize';
import sequelize from '../service/sequelize';

class User extends Model {
    declare id: number;
    declare username: string;
    declare password: string;
}

User.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    sequelize,
    modelName: 'user',
    timestamps: false
})

export default User;
