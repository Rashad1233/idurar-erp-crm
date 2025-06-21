'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const defaultCostCenter = await queryInterface.rawSelect('cost_centers', {
      where: {},
      limit: 1
    }, ['id']);

    if (!defaultCostCenter) {
      // Create a default cost center if none exists
      const costCenterId = await queryInterface.bulkInsert('cost_centers', [{
        id: Sequelize.literal('uuid_generate_v4()'),
        code: 'CC-001',
        name: 'Default Cost Center',
        description: 'Default cost center for procurement',
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      }], { returning: true });
    }

    // Get user IDs for the approval hierarchy
    const users = await queryInterface.sequelize.query(
      `SELECT id, email FROM users WHERE email IN (?)`,
      {
        replacements: [['farhad@example.com', 'rashad@example.com', 'fakhri@example.com', 'samira@example.com', 'rufat@example.com']],
        type: Sequelize.QueryTypes.SELECT
      }
    );

    const approvalLevels = [
      { email: 'farhad@example.com', threshold: 500, level: 1 },
      { email: 'rashad@example.com', threshold: 3000, level: 2 },
      { email: 'fakhri@example.com', threshold: 5000, level: 3 },
      { email: 'samira@example.com', threshold: 10000, level: 4 },
      { email: 'rufat@example.com', threshold: 999999999, level: 5 }
    ];

    const thresholds = approvalLevels.map(level => {
      const user = users.find(u => u.email === level.email);
      if (!user) return null;

      return {
        id: Sequelize.literal('uuid_generate_v4()'),
        user_id: user.id,
        cost_center_id: defaultCostCenter,
        threshold: level.threshold,
        level: level.level,
        created_at: new Date(),
        updated_at: new Date()
      };
    }).filter(t => t !== null);

    await queryInterface.bulkInsert('approval_thresholds', thresholds);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('approval_thresholds', null, {});
  }
};
