import * as actionTypes from './types';
import { request } from '@/request';

const dispatchSettingsData = (datas) => {
  const settingsCategory = {};

  datas.map((data) => {
    // Parse the setting value based on its valueType
    let parsedValue = data.settingValue;
    
    try {
      // First try to parse as JSON (all values come as strings from the DB)
      parsedValue = JSON.parse(data.settingValue);
    } catch (e) {
      // If JSON parsing fails, handle specific types
      if (data.valueType === 'number') {
        parsedValue = Number(data.settingValue) || 0;
      } else if (data.valueType === 'boolean') {
        parsedValue = data.settingValue === 'true';
      }
      // For string type, keep as is
    }
    
    settingsCategory[data.settingCategory] = {
      ...settingsCategory[data.settingCategory],
      [data.settingKey]: parsedValue,
    };
  });

  return settingsCategory;
};

export const settingsAction = {
  resetState: () => (dispatch) => {
    dispatch({
      type: actionTypes.RESET_STATE,
    });
  },
  updateCurrency:
    ({ data }) =>
    async (dispatch) => {
      dispatch({
        type: actionTypes.UPDATE_CURRENCY,
        payload: data,
      });
    },
  update:
    ({ entity, settingKey, jsonData }) =>
    async (dispatch) => {
      dispatch({
        type: actionTypes.REQUEST_LOADING,
      });
      let data = await request.patch({
        entity: entity + '/updateBySettingKey/' + settingKey,
        jsonData,
      });

      if (data.success === true) {
        dispatch({
          type: actionTypes.REQUEST_LOADING,
        });

        let data = await request.listAll({ entity });

        if (data.success === true) {
          const payload = dispatchSettingsData(data.result);
          window.localStorage.setItem(
            'settings',
            JSON.stringify(dispatchSettingsData(data.result))
          );

          dispatch({
            type: actionTypes.REQUEST_SUCCESS,
            payload,
          });
        } else {
          dispatch({
            type: actionTypes.REQUEST_FAILED,
          });
        }
      } else {
        dispatch({
          type: actionTypes.REQUEST_FAILED,
        });
      }
    },
  updateMany:
    ({ entity, jsonData }) =>
    async (dispatch) => {
      dispatch({
        type: actionTypes.REQUEST_LOADING,
      });
      let data = await request.patch({
        entity: entity + '/updateManySetting',
        jsonData,
      });

      if (data.success === true) {
        dispatch({
          type: actionTypes.REQUEST_LOADING,
        });

        let data = await request.listAll({ entity });

        if (data.success === true) {
          const payload = dispatchSettingsData(data.result);
          window.localStorage.setItem(
            'settings',
            JSON.stringify(dispatchSettingsData(data.result))
          );

          dispatch({
            type: actionTypes.REQUEST_SUCCESS,
            payload,
          });
        } else {
          dispatch({
            type: actionTypes.REQUEST_FAILED,
          });
        }
      } else {
        dispatch({
          type: actionTypes.REQUEST_FAILED,
        });
      }
    },  list:
    ({ entity }) =>
    async (dispatch) => {
      dispatch({
        type: actionTypes.REQUEST_LOADING,
      });

      let data = await request.listAll({ entity });

      if (data.success === true) {
        const payload = dispatchSettingsData(data.result);
        window.localStorage.setItem('settings', JSON.stringify(dispatchSettingsData(data.result)));

        dispatch({
          type: actionTypes.REQUEST_SUCCESS,
          payload,
        });
      } else {
        // Check if we have cached settings in localStorage as fallback
        const cachedSettings = window.localStorage.getItem('settings');
        if (cachedSettings) {
          try {
            const parsedSettings = JSON.parse(cachedSettings);
            dispatch({
              type: actionTypes.REQUEST_SUCCESS,
              payload: parsedSettings,
            });
            return;
          } catch (e) {
            console.warn('Failed to parse cached settings:', e);
          }
        }
        
        // If no cached settings, use default settings
        const defaultSettings = {
          app_settings: {},
          company_settings: {},
          finance_settings: {},
          crm_settings: {},
          money_format_settings: {
            default_currency_code: 'USD',
            currency_symbol: '$',
            currency_position: 'before',
            decimal_sep: '.',
            thousand_sep: ',',
            cent_precision: 2,
            zero_format: false
          }
        };
        
        dispatch({
          type: actionTypes.REQUEST_SUCCESS,
          payload: defaultSettings,
        });
      }
    },
  upload:
    ({ entity, settingKey, jsonData }) =>
    async (dispatch) => {
      dispatch({
        type: actionTypes.REQUEST_LOADING,
      });

      let data = await request.upload({
        entity: entity,
        id: settingKey,
        jsonData,
      });

      if (data.success === true) {
        dispatch({
          type: actionTypes.REQUEST_LOADING,
        });

        let data = await request.listAll({ entity });

        if (data.success === true) {
          const payload = dispatchSettingsData(data.result);
          window.localStorage.setItem(
            'settings',
            JSON.stringify(dispatchSettingsData(data.result))
          );
          dispatch({
            type: actionTypes.REQUEST_SUCCESS,
            payload,
          });
        } else {
          dispatch({
            type: actionTypes.REQUEST_FAILED,
          });
        }
      } else {
        dispatch({
          type: actionTypes.REQUEST_FAILED,
        });
      }
    },
};
