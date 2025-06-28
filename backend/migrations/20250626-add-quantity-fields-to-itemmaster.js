'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('ItemMasters', 'quantityPerKg', {
      type: Sequelize.DECIMAL(10, 4),
      allowNull: true,
      comment: 'Quantity per kilogram (for weight-based calculations)',
    });

    await queryInterface.addColumn('ItemMasters', 'quantityPerCubicMeter', {
      type: Sequelize.DECIMAL(10, 4),
      allowNull: true,
      comment: 'Quantity per cubic meter (for volume-based calculations)',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('ItemMasters', 'quantityPerKg');
    await queryInterface.removeColumn('ItemMasters', 'quantityPerCubicMeter');
  }
};