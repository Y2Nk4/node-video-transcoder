import { Sequelize } from 'sequelize'

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './runtime/db/database.sqlite'
});

export default sequelize;
