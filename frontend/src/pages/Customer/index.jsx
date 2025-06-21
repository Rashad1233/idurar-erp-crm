import SimpleCrudModule from '@/modules/SimpleCrudModule';
import DynamicForm from '@/forms/DynamicForm';
import { fields } from './config';

import useLanguage from '@/locale/useLanguage';

export default function Customer() {
  const translate = useLanguage();
  const entity = 'client';
  const searchConfig = {
    displayLabels: ['name'],
    searchFields: 'name',
  };
  const deleteModalLabels = ['name'];

  const Labels = {
    PANEL_TITLE: translate('client'),
    DATATABLE_TITLE: translate('client_list'),
    ADD_NEW_ENTITY: translate('add_new_client'),
    ENTITY_NAME: translate('client'),
  };
  const configPage = {
    entity,
    ...Labels,
  };
  const config = {
    ...configPage,
    fields,
    searchConfig,
    deleteModalLabels,
  };  // Generate columns from fields
  const dataTableColumns = fields
    .filter(field => !field.hideInTable)
    .map(field => ({
      title: translate(field.label || field.name),
      dataIndex: field.name,
    }));
    
  return (
    <SimpleCrudModule
      entity={entity}
      dataTableColumns={dataTableColumns}
      searchConfig={searchConfig}
      entityDisplayLabels={deleteModalLabels}
    />
  );
}
