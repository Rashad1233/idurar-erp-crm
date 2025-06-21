import { useCallback, useEffect } from 'react';

import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  EllipsisOutlined,
  RedoOutlined,
  ArrowRightOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons';
import { Dropdown, Table, Button, Input } from 'antd';
import { PageHeader } from '@ant-design/pro-layout';

import { useSelector, useDispatch } from 'react-redux';
import { crud } from '@/redux/crud/actions';
import { selectListItems } from '@/redux/crud/selectors';
import useLanguage from '@/locale/useLanguage';
import { dataForTable } from '@/utils/dataStructure';
import { useMoney, useDate } from '@/settings';

import { generate as uniqueId } from 'shortid';

import { useCrudContext } from '@/context/crud';

function AddNewItem({ config }) {
  const { crudContextAction } = useCrudContext();
  const { collapsedBox, panel } = crudContextAction;
  const { ADD_NEW_ENTITY } = config;

  const handelClick = () => {
    panel.open();
    collapsedBox.close();
  };

  return (
    <Button onClick={handelClick} type="primary">
      {ADD_NEW_ENTITY}
    </Button>
  );
}
export default function DataTable({ config, columns, dataSource, isLoading, pagination, rowKey, expandable, extra = [] }) {
  // Support both config object and direct props
  const useDirectProps = !config && columns;
  
  let entity, dataTableColumns, DATATABLE_TITLE, fields, searchConfig;
  
  if (!useDirectProps && config) {
    ({ entity, dataTableColumns, DATATABLE_TITLE, fields, searchConfig } = config);
  } else if (useDirectProps) {
    dataTableColumns = columns;
  }
  
  const { crudContextAction } = useCrudContext();
  const { panel, collapsedBox, modal, readBox, editBox, advancedBox } = crudContextAction;
  const translate = useLanguage();
  const { moneyFormatter } = useMoney();
  const { dateFormat } = useDate();

  const items = [
    {
      label: translate('Show'),
      key: 'read',
      icon: <EyeOutlined />,
    },
    {
      label: translate('Edit'),
      key: 'edit',
      icon: <EditOutlined />,
    },
    ...extra,
    {
      type: 'divider',
    },

    {
      label: translate('Delete'),
      key: 'delete',
      icon: <DeleteOutlined />,
    },
  ];

  const handleRead = (record) => {
    dispatch(crud.currentItem({ data: record }));
    panel.open();
    collapsedBox.open();
    readBox.open();
  };
  function handleEdit(record) {
    dispatch(crud.currentItem({ data: record }));
    dispatch(crud.currentAction({ actionType: 'update', data: record }));
    editBox.open();
    panel.open();
    collapsedBox.open();
  }
  function handleDelete(record) {
    dispatch(crud.currentAction({ actionType: 'delete', data: record }));
    modal.open();
  }

  function handleUpdatePassword(record) {
    dispatch(crud.currentItem({ data: record }));
    dispatch(crud.currentAction({ actionType: 'update', data: record }));
    advancedBox.open();
    panel.open();
    collapsedBox.open();
  }

  let dispatchColumns = [];
  if (fields) {
    dispatchColumns = [...dataForTable({ fields, translate, moneyFormatter, dateFormat })];
  } else {
    dispatchColumns = [...dataTableColumns];
  }

  dataTableColumns = [
    ...dispatchColumns,
    {
      title: '',
      key: 'action',
      fixed: 'right',
      render: (_, record) => (
        <Dropdown
          menu={{
            items,
            onClick: ({ key }) => {
              switch (key) {
                case 'read':
                  handleRead(record);
                  break;
                case 'edit':
                  handleEdit(record);
                  break;

                case 'delete':
                  handleDelete(record);
                  break;
                case 'updatePassword':
                  handleUpdatePassword(record);
                  break;

                default:
                  break;
              }
              // else if (key === '2')handleCloseTask
            },
          }}
          trigger={['click']}
        >
          <EllipsisOutlined
            style={{ cursor: 'pointer', fontSize: '24px' }}
            onClick={(e) => e.preventDefault()}
          />
        </Dropdown>
      ),
    },
  ];
  const dispatch = useDispatch();
  
  // Only use Redux for config-based usage, not for direct props
  const { result: listResult, isLoading: listIsLoading } = useDirectProps ? { result: {}, isLoading: false } : useSelector(selectListItems);
  
  const reduxPagination = listResult?.pagination;
  const reduxDataSource = listResult?.items;

  // Use either direct props or Redux state
  const finalDataSource = useDirectProps ? dataSource : reduxDataSource;
  const finalIsLoading = useDirectProps ? isLoading : listIsLoading;
  const finalPagination = useDirectProps ? pagination : reduxPagination;
  
  const handelDataTableLoad = useCallback((paginationParams) => {
    if (useDirectProps) return;
    
    const options = { page: paginationParams.current || 1, items: paginationParams.pageSize || 10 };
    dispatch(crud.list({ entity, options }));
  }, [entity, useDirectProps]);

  const filterTable = (e) => {
    if (useDirectProps) return;
    
    const value = e.target.value;
    const options = { q: value, fields: searchConfig?.searchFields || '' };
    dispatch(crud.list({ entity, options }));
  };

  const dispatcher = () => {
    if (useDirectProps) return;
    dispatch(crud.list({ entity }));
  };

  useEffect(() => {
    if (useDirectProps) return;
    
    const controller = new AbortController();
    dispatcher();
    return () => {
      controller.abort();
    };
  }, [useDirectProps, entity]);
  return (
    <>
      {!useDirectProps && (
        <PageHeader
          onBack={() => window.history.back()}
          backIcon={<ArrowLeftOutlined />}
          title={DATATABLE_TITLE}
          ghost={false}
          extra={[
            <Input
              key={`searchFilterDataTable}`}
              onChange={filterTable}
              placeholder={translate('search')}
              allowClear
            />,
            <Button onClick={handelDataTableLoad} key={`${uniqueId()}`} icon={<RedoOutlined />}>
              {translate('Refresh')}
            </Button>,
            <AddNewItem key={`${uniqueId()}`} config={config} />,
          ]}
          style={{
            padding: '20px 0px',
          }}
        ></PageHeader>
      )}

      <Table
        columns={dataTableColumns}
        rowKey={useDirectProps ? rowKey : (item => item._id)}
        dataSource={finalDataSource}        expandable={useDirectProps ? expandable : undefined}
        pagination={finalPagination}
        loading={finalIsLoading}
        onChange={handelDataTableLoad}
        scroll={{ x: true }}
      />
    </>
  );
}
