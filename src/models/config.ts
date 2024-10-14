import { Model, DataTypes } from 'sequelize';
import sequelize from '../service/sequelize';

class Config extends Model {
    declare id: number;
    declare key: string;
    declare value: string;

    static async getConfig(key: string): Promise<any | null> {
        const config: Config | null = await Config.findOne({ where: { key }});

        if (config == null) {
            return null;
        } else {
            let data: any = config.value;
            try {
                data = JSON.parse(data);
            } catch (e) {}

            return data;
        }
    }

    static async updateConfig(key: string, value: string): Promise<any | null> {
        const config: Config | null = await Config.findOne({ where: { key }});

        if (config == null) {
            return null;
        } else {
            config.value = value;
            await config.save();

            return config.value;
        }
    }

    static async createConfig(key: string, value: string): Promise<any | null> {
        let config: Config | null = await Config.findOne({ where: { key }});

        if (config == null) {
            config = await Config.create({ key, value });
        } else {
            config.value = value;
            await config.save();
        }

        return config.value;
    }
}

Config.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    key: {
        type: DataTypes.STRING,
        allowNull: false
    },
    value: {
        type: DataTypes.STRING,
        allowNull: false
    },
}, {
    sequelize,
    modelName: 'config',
    timestamps: false
})

export default Config;
