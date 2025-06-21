import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Button, 
  Table, 
  Tag, 
  Space, 
  Dropdown, 
  Card,
  Input,
  Spin,
  Alert,
  Badge,
  Menu,
  Modal,
  Form,
  Popconfirm
} from 'antd';
import {
  PlusOutlined,
  DownOutlined,
  ShopOutlined,
  EditOutlined,
  EyeOutlined,
  DeleteOutlined,
  SearchOutlined
} from '@ant-design/icons';

import useLanguage from '@/locale/useLanguage';
import procurementService from '@/services/procurementService';

const { Search } = Input;

function SupplierList() {
  const translate = useLanguage();
  
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  
  // Load Suppliers
  useEffect(() => {
    loadSuppliers();
  }, []);
  
  const loadSuppliers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await procurementService.getSuppliers();
      if (response.success) {
        setSuppliers(response.data || []);
      } else {
        setError(response.message || 'Error loading suppliers');
      }
    } catch (err) {
      setError(err.message || 'Error loading suppliers');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSearch = (value) => {
    setSearchQuery(value);
  };
  
  const getSupplierTypeTag = (type) => {
    switch (type) {
      case 'strategic':
        return <Tag color="green">Strategic</Tag>;
      case 'preferred':
        return <Tag color="blue">Preferred</Tag>;
      case 'transactional':
        return <Tag color="orange">Transactional</Tag>;
      case 'blacklisted':
        return <Tag color="red">Blacklisted</Tag>;
      default:
        return <Tag>Unknown</Tag>;
    }
  };
  
  const getStatusTag = (status) => {
    switch (status) {
      case 'active':
        return <Tag color="green">Active</Tag>;
      case 'inactive':
        return <Tag color="orange">Inactive</Tag>;
      case 'pending_approval':
        return <Tag color="blue">Pending Approval</Tag>;
      case 'rejected':
        return <Tag color="red">Rejected</Tag>;
      default:
        return <Tag>Unknown</Tag>;
    }
  };
  
  const showViewModal = (supplier) => {
    setSelectedSupplier(supplier);
    setIsViewModalVisible(true);
  };
  
  const handleViewModalClose = () => {
    setIsViewModalVisible(false);
  };
  
  const showDeleteModal = (supplier) => {
    setSelectedSupplier(supplier);
    setIsDeleteModalVisible(true);
  };
  
  const handleDeleteModalClose = () => {
    setIsDeleteModalVisible(false);
  };
  
  const handleDeleteSupplier = async () => {
    if (!selectedSupplier) return;
    
    setLoading(true);
    try {
      const response = await procurementService.deleteSupplier(selectedSupplier.id);
      if (response.success) {
        loadSuppliers();
        setIsDeleteModalVisible(false);
      } else {
        setError(response.message || 'Failed to delete supplier');
      }
    } catch (err) {
      setError(err.message || 'Error deleting supplier');
    } finally {
      setLoading(false);
    }
  };
  
  const filteredSuppliers = suppliers.filter(supplier => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      (supplier.legalName && supplier.legalName.toLowerCase().includes(query)) ||
      (supplier.tradeName && supplier.tradeName.toLowerCase().includes(query)) ||
      (supplier.supplierNumber && supplier.supplierNumber.toLowerCase().includes(query)) ||
      (supplier.contactEmail && supplier.contactEmail.toLowerCase().includes(query)) ||
      (supplier.contactPhone && supplier.contactPhone.toLowerCase().includes(query))
    );
  });
  
  const columns = [
    {
      title: translate('Supplier Number'),
      dataIndex: 'supplierNumber',
      key: 'supplierNumber',
      sorter: (a, b) => (a.supplierNumber || '').localeCompare(b.supplierNumber || ''),
      render: (text, record) => (
        <Link to={`/supplier/read/${record.id}`}>
          {text || '-'}
        </Link>
      ),
    },
    {
      title: translate('Legal Name'),
      dataIndex: 'legalName',
      key: 'legalName',
      sorter: (a, b) => (a.legalName || '').localeCompare(b.legalName || ''),
    },
    {
      title: translate('Trade Name'),
      dataIndex: 'tradeName',
      key: 'tradeName',
      sorter: (a, b) => (a.tradeName || '').localeCompare(b.tradeName || ''),
    },
    {
      title: translate('Contact Email'),
      dataIndex: 'contactEmail',
      key: 'contactEmail',
    },
    {
      title: translate('Contact Phone'),
      dataIndex: 'contactPhone',
      key: 'contactPhone',
    },
    {
      title: translate('Type'),
      dataIndex: 'supplierType',
      key: 'supplierType',
      render: (text) => getSupplierTypeTag(text),
      filters: [
        { text: 'Strategic', value: 'strategic' },
        { text: 'Preferred', value: 'preferred' },
        { text: 'Transactional', value: 'transactional' },
        { text: 'Blacklisted', value: 'blacklisted' },
      ],
      onFilter: (value, record) => record.supplierType === value,
    },
    {
      title: translate('Status'),
      dataIndex: 'status',
      key: 'status',
      render: (text) => getStatusTag(text),
      filters: [
        { text: 'Active', value: 'active' },
        { text: 'Inactive', value: 'inactive' },
        { text: 'Pending Approval', value: 'pending_approval' },
        { text: 'Rejected', value: 'rejected' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: translate('Actions'),
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            size="small"
            onClick={() => showViewModal(record)}
          >
            {translate('View')}
          </Button>
          <Link to={`/supplier/update/${record.id}`}>
            <Button
              icon={<EditOutlined />}
              size="small"
            >
              {translate('Edit')}
            </Button>
          </Link>
          <Button
            icon={<DeleteOutlined />}
            size="small"
            danger
            onClick={() => showDeleteModal(record)}
          >
            {translate('Delete')}
          </Button>
        </Space>
      ),
    },
  ];
  
  return (
    <div>
      <Card 
        title={
          <Space>
            <ShopOutlined />
            {translate('Suppliers Management')}
          </Space>
        }
        extra={
          <Space>
            <Search
              placeholder={translate('Search suppliers')}
              onSearch={handleSearch}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: 300 }}
              allowClear
            />
            <Link to="/supplier/create">
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
              >
                {translate('Add Supplier')}
              </Button>
            </Link>
          </Space>
        }
      >
        {error && (
          <Alert 
            message={translate('Error')} 
            description={error}
            type="error" 
            showIcon 
            style={{ marginBottom: 16 }}
          />
        )}
        
        <Table
          columns={columns}
          dataSource={filteredSuppliers.map(supplier => ({ ...supplier, key: supplier.id }))}
          loading={loading}
          pagination={{
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} suppliers`,
          }}
        />
      </Card>
      
      {/* View Supplier Modal */}
      {selectedSupplier && (
        <Modal
          title={translate('Supplier Details')}
          visible={isViewModalVisible}
          onCancel={handleViewModalClose}
          footer={[
            <Button key="close" onClick={handleViewModalClose}>
              {translate('Close')}
            </Button>
          ]}
          width={700}
        >
          <div style={{ marginBottom: 16 }}>
            <h3>{selectedSupplier.legalName}</h3>
            {getSupplierTypeTag(selectedSupplier.supplierType)}
            {getStatusTag(selectedSupplier.status)}
          </div>
          
          <table className="detail-table">
            <tbody>
              <tr>
                <td><strong>{translate('Supplier Number')}:</strong></td>
                <td>{selectedSupplier.supplierNumber || '-'}</td>
              </tr>
              <tr>
                <td><strong>{translate('Trade Name')}:</strong></td>
                <td>{selectedSupplier.tradeName || '-'}</td>
              </tr>
              <tr>
                <td><strong>{translate('Contact Email')}:</strong></td>
                <td>{selectedSupplier.contactEmail || '-'}</td>
              </tr>
              <tr>
                <td><strong>{translate('Secondary Email')}:</strong></td>
                <td>{selectedSupplier.contactEmailSecondary || '-'}</td>
              </tr>
              <tr>
                <td><strong>{translate('Contact Phone')}:</strong></td>
                <td>{selectedSupplier.contactPhone || '-'}</td>
              </tr>
              <tr>
                <td><strong>{translate('Contact Name')}:</strong></td>
                <td>{selectedSupplier.contactName || '-'}</td>
              </tr>
              <tr>
                <td><strong>{translate('Address')}:</strong></td>
                <td>{selectedSupplier.address || '-'}</td>
              </tr>
              <tr>
                <td><strong>{translate('City')}:</strong></td>
                <td>{selectedSupplier.city || '-'}</td>
              </tr>
              <tr>
                <td><strong>{translate('State/Province')}:</strong></td>
                <td>{selectedSupplier.state || '-'}</td>
              </tr>
              <tr>
                <td><strong>{translate('Country')}:</strong></td>
                <td>{selectedSupplier.country || '-'}</td>
              </tr>
              <tr>
                <td><strong>{translate('Postal Code')}:</strong></td>
                <td>{selectedSupplier.postalCode || '-'}</td>
              </tr>
              <tr>
                <td><strong>{translate('Payment Terms')}:</strong></td>
                <td>{selectedSupplier.paymentTerms || '-'}</td>
              </tr>
              <tr>
                <td><strong>{translate('Tax ID')}:</strong></td>
                <td>{selectedSupplier.taxId || '-'}</td>
              </tr>
              <tr>
                <td><strong>{translate('Registration Number')}:</strong></td>
                <td>{selectedSupplier.registrationNumber || '-'}</td>
              </tr>
              <tr>
                <td><strong>{translate('Compliance Checked')}:</strong></td>
                <td>{selectedSupplier.complianceChecked ? translate('Yes') : translate('No')}</td>
              </tr>
              <tr>
                <td><strong>{translate('Notes')}:</strong></td>
                <td>{selectedSupplier.notes || '-'}</td>
              </tr>
            </tbody>
          </table>
        </Modal>
      )}
      
      {/* Delete Supplier Modal */}
      {selectedSupplier && (
        <Modal
          title={translate('Delete Supplier')}
          visible={isDeleteModalVisible}
          onCancel={handleDeleteModalClose}
          footer={[
            <Button key="cancel" onClick={handleDeleteModalClose}>
              {translate('Cancel')}
            </Button>,
            <Button 
              key="delete" 
              type="primary" 
              danger 
              onClick={handleDeleteSupplier}
              loading={loading}
            >
              {translate('Delete')}
            </Button>
          ]}
        >
          <p>{translate('Are you sure you want to delete this supplier?')}</p>
          <p><strong>{selectedSupplier.legalName}</strong> ({selectedSupplier.supplierNumber})</p>
          <p>{translate('This action cannot be undone.')}</p>
        </Modal>
      )}
    </div>
  );
}

export default SupplierList;
