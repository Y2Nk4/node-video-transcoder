'use strict';

const {DataTypes} = require("sequelize");
const User = require("../src/models/user");
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.createTable('users', {
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
    })

    await queryInterface.insert(User, 'users', {
      username: 'admin',
      password: '$2b$04$y.dBMvHxP9FWRUE0yehQa.fuh0p/7Kwc.8ZvcVEn0zUxQOsNkrGOS'
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('users');
  }
};
