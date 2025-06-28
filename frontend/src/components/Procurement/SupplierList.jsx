import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  Popconfirm,
  Row,
  Col,
  Typography
} from 'antd';
import {
  PlusOutlined,
  DownOutlined,
  ShopOutlined,
  EditOutlined,
  EyeOutlined,
  DeleteOutlined,
  SearchOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';

import useLanguage from '@/locale/useLanguage';
import procurementService from '@/services/procurementService';

const { Search } = Input;
const { Text } = Typography;

function SupplierList() {
  const translate = useLanguage();
  const navigate = useNavigate();
  
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
        return <Tag color="green" icon={<CheckCircleOutlined />}>Active</Tag>;
      case 'inactive':
        return <Tag color="orange">Inactive</Tag>;
      case 'pending_approval':
        return <Tag 
          color="gold" 
          icon={<div style={{ 
            width: '8px', 
            height: '8px', 
            borderRadius: '50%', 
            backgroundColor: '#faad14', 
            display: 'inline-block', 
            marginRight: '4px',
            animation: 'pulse 2s infinite'
          }} />}
        >
          Pending Approval
        </Tag>;
      case 'pending_supplier_acceptance':
        return <Tag 
          color="blue" 
          icon={<div style={{ 
            width: '8px', 
            height: '8px', 
            borderRadius: '50%', 
            backgroundColor: '#1890ff', 
            display: 'inline-block', 
            marginRight: '4px',
            animation: 'pulse 2s infinite'
          }} />}
        >
          Pending Supplier Acceptance
        </Tag>;
      case 'rejected':
        return <Tag color="red" icon={<CloseCircleOutlined />}>Rejected</Tag>;
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
        {/* Pending Approval Alert */}
        {suppliers.filter(s => s.status === 'pending_approval').length > 0 && (
          <Alert
            message={`${suppliers.filter(s => s.status === 'pending_approval').length} supplier${suppliers.filter(s => s.status === 'pending_approval').length > 1 ? 's' : ''} pending approval`}
            description="Review and approve pending suppliers to make them active in the system."
            type="warning"
            showIcon
            style={{ marginBottom: 16 }}
            action={
              <Button 
                size="small" 
                type="primary"
                onClick={() => {
                  const pendingSuppliers = suppliers.filter(s => s.status === 'pending_approval');
                  if (pendingSuppliers.length > 0) {
                    navigate(`/supplier/read/${pendingSuppliers[0].id}`);
                  }
                }}
              >
                Review First
              </Button>
            }
          />
        )}
        
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
          open={isViewModalVisible}
          onCancel={handleViewModalClose}
          footer={[
            <Button key="view-full" type="primary" onClick={() => {
              handleViewModalClose();
              navigate(`/supplier/read/${selectedSupplier.id}`);
            }}>
              {translate('View Full Details')}
            </Button>,
            <Button key="close" onClick={handleViewModalClose}>
              {translate('Close')}
            </Button>
          ]}
          width={800}
        >
          <div style={{ marginBottom: '20px', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Text strong style={{ fontSize: '18px' }}>{selectedSupplier.legalName}</Text>
            {getSupplierTypeTag(selectedSupplier.supplierType)}
            {getStatusTag(selectedSupplier.status)}
          </div>
          
          <Row gutter={[24, 16]}>
            {/* Left Column */}
            <Col span={12}>
              <div style={{ 
                background: '#f8f9fa', 
                padding: '16px', 
                borderRadius: '8px',
                border: '1px solid #e9ecef',
                marginBottom: '12px'
              }}>
                <h4 style={{ 
                  margin: '0 0 12px 0', 
                  color: '#1890ff',
                  fontSize: '14px',
                  fontWeight: '600'
                }}>
                  {translate('Basic Information')}
                </h4>
                <div style={{ display: 'grid', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#666', fontSize: '12px' }}>{translate('Supplier Number')}:</span>
                    <Text code style={{ fontSize: '12px' }}>{selectedSupplier.supplierNumber}</Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#666', fontSize: '12px' }}>{translate('Trade Name')}:</span>
                    <span style={{ fontWeight: '500', fontSize: '13px' }}>{selectedSupplier.tradeName || '-'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#666', fontSize: '12px' }}>{translate('Payment Terms')}:</span>
                    <span style={{ fontWeight: '500', fontSize: '13px' }}>{selectedSupplier.paymentTerms || '-'}</span>
                  </div>
                </div>
              </div>

              <div style={{ 
                background: '#f8f9fa', 
                padding: '16px', 
                borderRadius: '8px',
                border: '1px solid #e9ecef'
              }}>
                <h4 style={{ 
                  margin: '0 0 12px 0', 
                  color: '#52c41a',
                  fontSize: '14px',
                  fontWeight: '600'
                }}>
                  {translate('Contact Information')}
                </h4>
                <div style={{ display: 'grid', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#666', fontSize: '12px' }}>{translate('Contact Name')}:</span>
                    <span style={{ fontWeight: '500', fontSize: '13px' }}>{selectedSupplier.contactName || '-'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#666', fontSize: '12px' }}>{translate('Phone')}:</span>
                    <span style={{ fontWeight: '500', fontSize: '13px' }}>
                      {selectedSupplier.contactPhone ? (
                        <a href={`tel:${selectedSupplier.contactPhone}`}>{selectedSupplier.contactPhone}</a>
                      ) : '-'}
                    </span>
                  </div>
                  <div>
                    <span style={{ color: '#666', fontSize: '12px', display: 'block' }}>{translate('Primary Email')}:</span>
                    <span style={{ fontWeight: '500', fontSize: '13px' }}>
                      {selectedSupplier.contactEmail ? (
                        <a href={`mailto:${selectedSupplier.contactEmail}`}>{selectedSupplier.contactEmail}</a>
                      ) : '-'}
                    </span>
                  </div>
                  {selectedSupplier.contactEmailSecondary && (
                    <div>
                      <span style={{ color: '#666', fontSize: '12px', display: 'block' }}>{translate('Secondary Email')}:</span>
                      <a href={`mailto:${selectedSupplier.contactEmailSecondary}`} style={{ fontSize: '13px' }}>
                        {selectedSupplier.contactEmailSecondary}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </Col>

            {/* Right Column */}
            <Col span={12}>
              <div style={{ 
                background: '#f8f9fa', 
                padding: '16px', 
                borderRadius: '8px',
                border: '1px solid #e9ecef',
                marginBottom: '12px'
              }}>
                <h4 style={{ 
                  margin: '0 0 12px 0', 
                  color: '#fa8c16',
                  fontSize: '14px',
                  fontWeight: '600'
                }}>
                  {translate('Address Information')}
                </h4>
                <div style={{ display: 'grid', gap: '8px' }}>
                  {selectedSupplier.address && (
                    <div>
                      <span style={{ color: '#666', fontSize: '12px', display: 'block' }}>{translate('Address')}:</span>
                      <span style={{ fontWeight: '500', fontSize: '13px' }}>{selectedSupplier.address}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#666', fontSize: '12px' }}>{translate('City')}:</span>
                    <span style={{ fontWeight: '500', fontSize: '13px' }}>{selectedSupplier.city || '-'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#666', fontSize: '12px' }}>{translate('State/Province')}:</span>
                    <span style={{ fontWeight: '500', fontSize: '13px' }}>{selectedSupplier.state || '-'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#666', fontSize: '12px' }}>{translate('Country')}:</span>
                    <span style={{ fontWeight: '500', fontSize: '13px' }}>{selectedSupplier.country || '-'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#666', fontSize: '12px' }}>{translate('Postal Code')}:</span>
                    <span style={{ fontWeight: '500', fontSize: '13px' }}>{selectedSupplier.postalCode || '-'}</span>
                  </div>
                </div>
              </div>

              <div style={{ 
                background: '#f8f9fa', 
                padding: '16px', 
                borderRadius: '8px',
                border: '1px solid #e9ecef'
              }}>
                <h4 style={{ 
                  margin: '0 0 12px 0', 
                  color: '#722ed1',
                  fontSize: '14px',
                  fontWeight: '600'
                }}>
                  {translate('Legal & Compliance')}
                </h4>
                <div style={{ display: 'grid', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#666', fontSize: '12px' }}>{translate('Tax ID')}:</span>
                    <span style={{ fontWeight: '500', fontSize: '13px' }}>{selectedSupplier.taxId || '-'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#666', fontSize: '12px' }}>{translate('Registration Number')}:</span>
                    <span style={{ fontWeight: '500', fontSize: '13px' }}>{selectedSupplier.registrationNumber || '-'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#666', fontSize: '12px' }}>{translate('Compliance Checked')}:</span>
                    <span>
                      {selectedSupplier.complianceChecked ? (
                        <Tag color="green" size="small">
                          {translate('Yes')}
                        </Tag>
                      ) : (
                        <Tag color="orange" size="small">
                          {translate('No')}
                        </Tag>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </Col>
          </Row>

          {selectedSupplier.notes && (
            <div style={{ 
              marginTop: '16px',
              background: '#f6ffed', 
              padding: '12px', 
              borderRadius: '6px',
              border: '1px solid #b7eb8f'
            }}>
              <h4 style={{ 
                margin: '0 0 8px 0', 
                color: '#389e0d',
                fontSize: '14px',
                fontWeight: '600'
              }}>
                {translate('Notes')}
              </h4>
              <div style={{ fontSize: '13px', lineHeight: '1.5' }}>
                {selectedSupplier.notes}
              </div>
            </div>
          )}
        </Modal>
      )}
      
      {/* Delete Supplier Modal */}
      {selectedSupplier && (
        <Modal
          title={translate('Delete Supplier')}
          open={isDeleteModalVisible}
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
