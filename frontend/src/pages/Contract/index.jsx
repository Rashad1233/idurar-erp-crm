import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Layout, 
  Button, 
  Row, 
  Col, 
  Table, 
  Space, 
  Tag, 
  Tooltip, 
  Dropdown, 
  Menu,
  Modal,
  message 
} from 'antd';
import { 
  EditOutlined, 
  EllipsisOutlined, 
  EyeOutlined, 
  FilePdfOutlined, 
  PlusOutlined, 
  DeleteOutlined,
  FileProtectOutlined
} from '@ant-design/icons';
import { request } from '@/request';
import { useSelector, useDispatch } from 'react-redux';
import { erp } from '@/redux/erp/actions';
import { selectListItems, selectListState } from '@/redux/erp/selectors';
import { useErpContext } from '@/context/erp';
import { generate as uniqueIdGenerator } from '@/utils/uniqueId';
import useLanguage from '@/locale/useLanguage';
import SearchPanel from '@/components/SearchPanel';
import DataTableDropMenu from '@/components/DataTableDropMenu';

const Contract = () => {
  // Define the entity explicitly for this component
  const entity = 'contract';
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const translate = useLanguage();
  const { result: listResult, isLoading } = useSelector(selectListState);
  const [currentContract, setCurrentContract] = useState(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  
  // Extract data from the result using the correct format
  const contracts = listResult?.items || [];
  
  const columns = [
    {
      title: translate('Contract Number'),
      dataIndex: 'number',
      key: 'number',
      render: (text, record) => <Link to={`/contract/read/${record._id}`}>{text}</Link>,
    },
    {
      title: translate('Contract Name'),
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: translate('Supplier'),
      dataIndex: 'supplier',
      key: 'supplier',
      render: (supplier) => supplier?.name || '-',
    },
    {
      title: translate('Start Date'),
      dataIndex: 'startDate',
      key: 'startDate',
      render: (date) => date ? new Date(date).toLocaleDateString() : '-',
    },
    {
      title: translate('End Date'),
      dataIndex: 'endDate',
      key: 'endDate',
      render: (date) => date ? new Date(date).toLocaleDateString() : '-',
    },    {
      title: translate('Contract Value'),
      dataIndex: 'value',
      key: 'value',
      render: (value, record) => {
        const numValue = parseFloat(value) || 0;
        return `${record.currency || 'USD'} ${numValue.toFixed(2)}`;
      },
    },
    {
      title: translate('Status'),
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = 'default';
        
        switch (status) {
          case 'active':
            color = 'green';
            break;
          case 'draft':
            color = 'blue';
            break;
          case 'expired':
            color = 'red';
            break;
          case 'pending_approval':
            color = 'gold';
            break;
          default:
            color = 'default';
        }
        
        return <Tag color={color}>{translate(status?.replace(/_/g, ' ')?.toUpperCase() || 'UNKNOWN')}</Tag>;
      },
    },
    {
      title: translate('Actions'),
      key: 'actions',
      render: (_, record) => (
        <DataTableDropMenu 
          record={record}
          entity={'contract'}
          onView={() => navigate(`/contract/read/${record._id}`)}
          onEdit={() => navigate(`/contract/update/${record._id}`)}
          onDelete={() => showDeleteModal(record)}
          additionalOptions={[
            {
              label: translate('View Contract PDF'),
              icon: <FilePdfOutlined />,
              onClick: () => navigate(`/contract/pdf/${record._id}`),
            },
          ]}
        />
      ),
    },
  ];

  const showDeleteModal = (contract) => {
    setCurrentContract(contract);
    setDeleteModalVisible(true);
  };

  const handleDelete = async () => {
    try {
      await request.delete({ entity: 'contract', id: currentContract._id });
      message.success(translate('Contract deleted successfully'));
      dispatch(erp.list({ entity: 'contract' }));
      setDeleteModalVisible(false);
    } catch (error) {
      message.error(translate('Error deleting contract'));
    }
  };
  // Load contracts on component mount
  useEffect(() => {
    dispatch(erp.list({ entity: 'contract' }));
  }, []);
  // Console log to debug the data structure
  useEffect(() => {
    console.log('List Result:', listResult);
    console.log('Contracts data:', contracts);
  }, [listResult, contracts]);

  return (
    <Layout.Content style={{ padding: '0 24px' }}>
      <div className="site-layout-background" style={{ padding: 24, minHeight: 360 }}>
        <div className="page-header">
          <div className="page-header-title">
            <h1>
              <FileProtectOutlined /> {translate('Contracts')}
            </h1>
          </div>
          <div className="page-header-actions">
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={() => navigate('/contract/create')}
            >
              {translate('Create Contract')}
            </Button>
          </div>
        </div>
        
        <SearchPanel entity={'contract'} />
          <Table 
          columns={columns} 
          dataSource={contracts}
          loading={isLoading}
          rowKey={(record) => record._id || record.id || uniqueIdGenerator()}
          pagination={listResult?.pagination || { 
            showSizeChanger: true, 
            pageSizeOptions: ['10', '20', '50', '100'],
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
            current: 1,
            pageSize: 10,
            total: 0
          }}
        />
          <Modal
          title={translate('Delete Contract')}
          open={deleteModalVisible}
          onOk={handleDelete}
          onCancel={() => setDeleteModalVisible(false)}
          okText={translate('Delete')}
          cancelText={translate('Cancel')}
          okButtonProps={{ danger: true }}
        >
          <p>
            {translate('Are you sure you want to delete contract')} 
            {currentContract?.number ? ` ${currentContract.number}` : ''}? 
            {translate('This action cannot be undone')}
          </p>
        </Modal>
      </div>
    </Layout.Content>
  );
};

export default Contract;
