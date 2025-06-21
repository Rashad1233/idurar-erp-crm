import { createSelector } from 'reselect';

export const selectSettings = (state) => state.settings;

export const selectCurrentSettings = createSelector(
  [selectSettings],
  (settings) => settings.result
);

export const selectMoneyFormat = createSelector(
  [selectCurrentSettings],
  (settings) => settings?.money_format_settings || {
    default_currency_code: 'USD',
    currency_symbol: '$',
    currency_position: 'before',
    decimal_sep: '.',
    thousand_sep: ',',
    cent_precision: 2,
    zero_format: false
  }
);

export const selectAppSettings = createSelector(
  [selectCurrentSettings],
  (settings) => settings.app_settings
);

export const selectFinanceSettings = createSelector(
  [selectCurrentSettings],
  (settings) => settings.finance_settings
);

export const selectCrmSettings = createSelector(
  [selectCurrentSettings],
  (settings) => settings.crm_settings
);

export const selectCompanySettings = createSelector(
  [selectCurrentSettings],
  (settings) => settings.company_settings
);
