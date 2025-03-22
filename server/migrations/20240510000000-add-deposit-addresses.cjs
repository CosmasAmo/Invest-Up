'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn('Settings', 'depositAddresses', {
      type: Sequelize.JSON,
      defaultValue: {
        BINANCE: '374592285',
        TRC20: 'TYKbfLuFUUz5T3X2UFvhBuTSNvLE6TQpjX',
        BEP20: '0x6f4f06ece1fae66ec369881b4963a4a939fd09a3',
        ERC20: '0x6f4f06ece1fae66ec369881b4963a4a939fd09a3',
        OPTIMISM: '0x6f4f06ece1fae66ec369881b4963a4a939fd09a3'
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('Settings', 'depositAddresses');
  }
}; 