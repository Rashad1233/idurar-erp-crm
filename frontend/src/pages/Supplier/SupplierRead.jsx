import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Card, 
  Button, 
  Descriptions, 
  Tag, 
  Alert, 
  Spin, 
  Space, 
  Row, 
  Col,
  Divider,
  Typography,
  Popconfirm
} from 'antd';
import {
  ShopOutlined,
  EditOutlined,
  DeleteOutlined,
  ArrowLeftOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';

import useLanguage from '@/locale/useLanguage';
import procurementService from '@/services/procurementService';
import styles from './SupplierRead.module.css';

const { Title, Text } = Typography;

export default function SupplierRead() {
  const { id } = useParams();
  const navigate = useNavigate();
  const translate = useLanguage();
  
  const [supplier, setSupplier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadSupplier();
  }, [id]);

  const loadSupplier = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await procurementService.getSupplier(id);
      if (response.success) {
        setSupplier(response.data);
      } else {
        setError(response.message || 'Failed to load supplier');
      }
    } catch (err) {
      setError(err.message || 'Error loading supplier');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const response = await procurementService.deleteSupplier(id);
      if (response.success) {
        navigate('/supplier');
      } else {
        setError(response.message || 'Failed to delete supplier');
      }
    } catch (err) {
      setError(err.message || 'Error deleting supplier');
    } finally {
      setDeleting(false);
    }
  };

  const getSupplierTypeTag = (type) => {
    switch (type) {
      case 'strategic':
        return <Tag color="green" icon={<CheckCircleOutlined />}>Strategic</Tag>;
      case 'preferred':
        return <Tag color="blue" icon={<CheckCircleOutlined />}>Preferred</Tag>;
      case 'transactional':
        return <Tag color="orange">Transactional</Tag>;
      case 'blacklisted':
        return <Tag color="red" icon={<CloseCircleOutlined />}>Blacklisted</Tag>;
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
          icon={<div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#faad14', display: 'inline-block', marginRight: '4px' }} />}
        >
          Pending Approval
        </Tag>;
      case 'pending_supplier_acceptance':
        return <Tag 
          color="blue" 
          icon={<div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#1890ff', display: 'inline-block', marginRight: '4px' }} />}
        >
          Pending Supplier Acceptance
        </Tag>;
      case 'rejected':
        return <Tag color="red" icon={<CloseCircleOutlined />}>Rejected</Tag>;
      default:
        return <Tag>Unknown</Tag>;
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <Alert
          message={translate('Error')}
          description={error}
          type="error"
          showIcon
          action={
            <Button onClick={() => navigate('/supplier')}>
              {translate('Back to Suppliers')}
            </Button>
          }
        />
      </div>
    );
  }

  if (!supplier) {
    return (
      <Alert
        message={translate('Supplier Not Found')}
        description={translate('The requested supplier could not be found.')}
        type="warning"
        showIcon
        action={
          <Button onClick={() => navigate('/supplier')}>
            {translate('Back to Suppliers')}
          </Button>
        }
      />
    );
  }

  return (
    <div className={styles.supplierViewContainer}>
      <Card
        className={styles.supplierCard}
        title={
          <div className={styles.cardTitle}>
            <div className={`${styles.iconCircle} ${styles.basicInfoIcon}`}>
              <ShopOutlined />
            </div>
            <div>
              <div className={styles.supplierName}>
                {supplier.legalName}
              </div>
              <div className={styles.statusTagsContainer}>
                {getSupplierTypeTag(supplier.supplierType)}
                {getStatusTag(supplier.status)}
              </div>
            </div>
          </div>
        }
        extra={
          <div className={styles.actionButtons}>
            <Button 
              className={styles.backButton}
              icon={<ArrowLeftOutlined />} 
              onClick={() => navigate('/supplier')}
            >
              {translate('Back to List')}
            </Button>
            <Link to={`/supplier/update/${id}`}>
              <Button 
                type="primary"
                className={styles.editButton}
                icon={<EditOutlined />}
              >
                {translate('Edit')}
              </Button>
            </Link>
            <Popconfirm
              title={translate('Are you sure you want to delete this supplier?')}
              description={translate('This action cannot be undone.')}
              okText={translate('Yes, Delete')}
              cancelText={translate('Cancel')}
              okType="danger"
              onConfirm={handleDelete}
            >
              <Button 
                danger
                className={styles.deleteButton}
                icon={<DeleteOutlined />}
                loading={deleting}
              >
                {translate('Delete')}
              </Button>
            </Popconfirm>
          </div>
        }
      >
        {/* Professional Card Layout */}
        <Row gutter={[24, 24]}>
          {/* Left Column */}
          <Col xs={24} lg={12}>
            {/* Basic Information Card */}
            <Card 
              className={styles.supplierCard}
              title={
                <div className={styles.cardTitle}>
                  <div className={`${styles.iconCircle} ${styles.basicInfoIcon}`}>
                    <ShopOutlined />
                  </div>
                  <span>{translate('Basic Information')}</span>
                </div>
              }
              style={{ marginBottom: '16px' }}
              bodyStyle={{ padding: '20px' }}
            >
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <div className={styles.fieldGroup}>
                    <Text className={styles.fieldLabel}>{translate('Supplier Number')}</Text>
                    <Text className={styles.supplierNumber}>{supplier.supplierNumber}</Text>
                  </div>
                </Col>
                <Col span={12}>
                  <div className={styles.fieldGroup}>
                    <Text className={styles.fieldLabel}>{translate('Supplier Type')}</Text>
                    <div>{getSupplierTypeTag(supplier.supplierType)}</div>
                  </div>
                </Col>
                <Col span={24}>
                  <div className={styles.fieldGroup}>
                    <Text className={styles.fieldLabel}>{translate('Trade Name')}</Text>
                    <Text className={styles.fieldValue}>{supplier.tradeName || '-'}</Text>
                  </div>
                </Col>
                <Col span={24}>
                  <div className={styles.fieldGroup}>
                    <Text className={styles.fieldLabel}>{translate('Payment Terms')}</Text>
                    <Text className={styles.fieldValue}>{supplier.paymentTerms || '-'}</Text>
                  </div>
                </Col>
              </Row>
            </Card>

            {/* Contact Information Card */}
            <Card 
              className={styles.supplierCard}
              title={
                <div className={styles.cardTitle}>
                  <div className={`${styles.iconCircle} ${styles.contactIcon}`}>
                    @
                  </div>
                  <span>{translate('Contact Information')}</span>
                </div>
              }
              style={{ marginBottom: '16px' }}
              bodyStyle={{ padding: '20px' }}
            >
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <div className={styles.fieldGroup}>
                    <Text className={styles.fieldLabel}>{translate('Contact Person')}</Text>
                    <Text className={styles.fieldValue}>{supplier.contactName || '-'}</Text>
                  </div>
                </Col>
                <Col span={24}>
                  <div className={styles.fieldGroup}>
                    <Text className={styles.fieldLabel}>{translate('Primary Email')}</Text>
                    {supplier.contactEmail ? (
                      <a href={`mailto:${supplier.contactEmail}`} className={styles.fieldValueLink}>
                        {supplier.contactEmail}
                      </a>
                    ) : (
                      <Text className={styles.fieldValue}>-</Text>
                    )}
                  </div>
                </Col>
                <Col span={24}>
                  <div className={styles.fieldGroup}>
                    <Text className={styles.fieldLabel}>{translate('Secondary Email')}</Text>
                    {supplier.contactEmailSecondary ? (
                      <a href={`mailto:${supplier.contactEmailSecondary}`} className={styles.fieldValueLink}>
                        {supplier.contactEmailSecondary}
                      </a>
                    ) : (
                      <Text className={styles.fieldValue}>-</Text>
                    )}
                  </div>
                </Col>
                <Col span={24}>
                  <div className={styles.fieldGroup}>
                    <Text className={styles.fieldLabel}>{translate('Phone')}</Text>
                    {supplier.contactPhone ? (
                      <a href={`tel:${supplier.contactPhone}`} className={styles.fieldValueLink}>
                        {supplier.contactPhone}
                      </a>
                    ) : (
                      <Text className={styles.fieldValue}>-</Text>
                    )}
                  </div>
                </Col>
              </Row>
            </Card>

            {/* Legal & Compliance Card */}
            <Card 
              className={styles.supplierCard}
              title={
                <div className={styles.cardTitle}>
                  <div className={`${styles.iconCircle} ${styles.legalIcon}`}>
                    §
                  </div>
                  <span>{translate('Legal & Compliance')}</span>
                </div>
              }
              bodyStyle={{ padding: '20px' }}
            >
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <div className={styles.fieldGroup}>
                    <Text className={styles.fieldLabel}>{translate('Tax ID')}</Text>
                    <Text className={styles.fieldValue}>{supplier.taxId || '-'}</Text>
                  </div>
                </Col>
                <Col span={24}>
                  <div className={styles.fieldGroup}>
                    <Text className={styles.fieldLabel}>{translate('Registration Number')}</Text>
                    <Text className={styles.fieldValue}>{supplier.registrationNumber || '-'}</Text>
                  </div>
                </Col>
                <Col span={24}>
                  <div className={styles.fieldGroup}>
                    <Text className={styles.fieldLabel}>{translate('Compliance Checked')}</Text>
                    <div>
                      {supplier.complianceChecked ? (
                        <Tag color="green" icon={<CheckCircleOutlined />}>
                          {translate('Yes')}
                        </Tag>
                      ) : (
                        <Tag color="orange" icon={<CloseCircleOutlined />}>
                          {translate('No')}
                        </Tag>
                      )}
                    </div>
                  </div>
                </Col>
              </Row>
            </Card>
          </Col>

          {/* Right Column */}
          <Col xs={24} lg={12}>
            {/* Address Information Card */}
            <Card 
              className={styles.supplierCard}
              title={
                <div className={styles.cardTitle}>
                  <div className={`${styles.iconCircle} ${styles.addressIcon}`}>
                    📍
                  </div>
                  <span>{translate('Address Information')}</span>
                </div>
              }
              style={{ marginBottom: '16px' }}
              bodyStyle={{ padding: '20px' }}
            >
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <div className={styles.fieldGroup}>
                    <Text className={styles.fieldLabel}>{translate('Address')}</Text>
                    <Text className={styles.fieldValue}>{supplier.address || '-'}</Text>
                  </div>
                </Col>
                <Col span={12}>
                  <div className={styles.fieldGroup}>
                    <Text className={styles.fieldLabel}>{translate('City')}</Text>
                    <Text className={styles.fieldValue}>{supplier.city || '-'}</Text>
                  </div>
                </Col>
                <Col span={12}>
                  <div className={styles.fieldGroup}>
                    <Text className={styles.fieldLabel}>{translate('State/Province')}</Text>
                    <Text className={styles.fieldValue}>{supplier.state || '-'}</Text>
                  </div>
                </Col>
                <Col span={12}>
                  <div className={styles.fieldGroup}>
                    <Text className={styles.fieldLabel}>{translate('Country')}</Text>
                    <Text className={styles.fieldValue}>{supplier.country || '-'}</Text>
                  </div>
                </Col>
                <Col span={12}>
                  <div className={styles.fieldGroup}>
                    <Text className={styles.fieldLabel}>{translate('Postal Code')}</Text>
                    <Text className={styles.fieldValue}>{supplier.postalCode || '-'}</Text>
                  </div>
                </Col>
              </Row>
            </Card>

            {/* Notes Card */}
            {supplier.notes && (
              <Card 
                className={styles.supplierCard}
                title={
                  <div className={styles.cardTitle}>
                    <div className={`${styles.iconCircle} ${styles.notesIcon}`}>
                      📝
                    </div>
                    <span>{translate('Notes')}</span>
                  </div>
                }
                style={{ marginBottom: '16px' }}
                bodyStyle={{ padding: '20px' }}
              >
                <div className={styles.notesContent}>
                  {supplier.notes}
                </div>
              </Card>
            )}

            {/* Audit Trail Card */}
            <Card 
              className={styles.supplierCard}
              title={
                <div className={styles.cardTitle}>
                  <div className={`${styles.iconCircle} ${styles.auditIcon}`}>
                    🕒
                  </div>
                  <span>{translate('Audit Trail')}</span>
                </div>
              }
              bodyStyle={{ padding: '20px' }}
            >
              <div className={styles.auditInfo}>
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <div className={styles.fieldGroup}>
                      <Text className={styles.fieldLabel}>{translate('Created At')}</Text>
                      <Text className={styles.fieldValue}>
                        {supplier.createdAt ? new Date(supplier.createdAt).toLocaleString() : '-'}
                      </Text>
                    </div>
                  </Col>
                  <Col span={12}>
                    <div className={styles.fieldGroup}>
                      <Text className={styles.fieldLabel}>{translate('Updated At')}</Text>
                      <Text className={styles.fieldValue}>
                        {supplier.updatedAt ? new Date(supplier.updatedAt).toLocaleString() : '-'}
                      </Text>
                    </div>
                  </Col>
                  <Col span={12}>
                    <div className={styles.fieldGroup}>
                      <Text className={styles.fieldLabel}>{translate('Created By')}</Text>
                      <Text className={styles.fieldValue}>
                        {supplier.createdByName || supplier.createdById || '-'}
                      </Text>
                    </div>
                  </Col>
                  <Col span={12}>
                    <div className={styles.fieldGroup}>
                      <Text className={styles.fieldLabel}>{translate('Updated By')}</Text>
                      <Text className={styles.fieldValue}>
                        {supplier.updatedByName || supplier.updatedById || '-'}
                      </Text>
                    </div>
                  </Col>
                </Row>
              </div>
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  );
}
