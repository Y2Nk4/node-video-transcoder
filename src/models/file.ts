import { Model, DataTypes } from 'sequelize';
import sequelize from '../service/sequelize';

class File extends Model {
    declare id: number;
    declare name: string;
    declare type: string;
    declare status: FileStatus;
    declare path: string;
    declare outPath: string;
    declare size: number;
    declare queueJobId: number;
    declare createdAt: Date;
    declare encodedAt: Date;
}

File.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    type: {
        type: DataTypes.STRING,
        allowNull: false
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false
    },
    path: {
        type: DataTypes.STRING,
        allowNull: false
    },
    outPath: {
        type: DataTypes.STRING,
        allowNull: false
    },
    size: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    encodingProgress: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false
    },
    encodedAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    nextCheckAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    queueJobId: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
}, {
    sequelize,
    modelName: 'files',
    timestamps: false
})

export default File;

export enum FileStatus {
    ARRIVED = 'ARRIVED',
    NOT_READY = 'NOT_READY',
    ENCODING = 'ENCODING',
    ENCODED = 'ENCODED',
    PAUSED = 'PAUSED',
    NOT_EXIST = 'NOT_EXIST',
}


export enum FileType {
    VIDEO = 'VIDEO'
}
