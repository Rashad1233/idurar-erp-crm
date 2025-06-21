// Settings controller for basic system settings
const settingsController = {
  // @desc    Get all settings
  // @route   GET /api/setting/listAll
  // @access  Public (for now)
  listAll: async (req, res) => {
    try {      // Return basic settings in the format expected by the frontend
      const settingsArray = [
        {
          settingKey: 'company_name',
          settingValue: 'ERP System',
          settingCategory: 'company_settings',
          valueType: 'string'
        },
        {
          settingKey: 'company_email',
          settingValue: 'admin@erp.com',
          settingCategory: 'company',
          valueType: 'string'
        },
        {
          settingKey: 'company_phone',
          settingValue: '+1-555-0123',
          settingCategory: 'company',
          valueType: 'string'
        },
        {
          settingKey: 'company_address',
          settingValue: '123 Business Ave, Enterprise City',
          settingCategory: 'company',
          valueType: 'string'
        },
        {          settingKey: 'currency',
          settingValue: 'USD',
          settingCategory: 'money_format_settings',
          valueType: 'string'
        },
        {          settingKey: 'date_format',
          settingValue: 'MM/DD/YYYY',
          settingCategory: 'app_settings',
          valueType: 'string'
        },
        {          settingKey: 'time_format',
          settingValue: '12',
          settingCategory: 'app_settings',
          valueType: 'string'
        },
        {          settingKey: 'timezone',
          settingValue: 'America/New_York',
          settingCategory: 'app_settings',
          valueType: 'string'
        },
        {          settingKey: 'language',
          settingValue: 'en',
          settingCategory: 'app_settings',
          valueType: 'string'
        },
        {
          settingKey: 'app_version',
          settingValue: '1.0.0',
          settingCategory: 'app',
          valueType: 'string'
        },
        {
          settingKey: 'app_name',
          settingValue: 'ERP System',
          settingCategory: 'app',
          valueType: 'string'
        },
        {
          settingKey: 'app_description',
          settingValue: 'Enterprise Resource Planning System',
          settingCategory: 'app',
          valueType: 'string'
        }
      ];

      res.status(200).json({
        success: true,
        result: settingsArray
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server Error',
        error: error.message
      });
    }
  },

  // @desc    Get a specific setting
  // @route   GET /api/setting/:key
  // @access  Public (for now)
  get: async (req, res) => {
    try {
      const { key } = req.params;
      
      // This could be expanded to read from database
      const settings = {
        company_name: 'ERP System',
        company_email: 'admin@erp.com',
        currency: 'USD',
        language: 'en'
      };

      if (settings[key] !== undefined) {
        res.status(200).json({
          success: true,
          data: { [key]: settings[key] }
        });
      } else {
        res.status(404).json({
          success: false,
          message: 'Setting not found'
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server Error',
        error: error.message
      });
    }
  }
};

module.exports = settingsController;
