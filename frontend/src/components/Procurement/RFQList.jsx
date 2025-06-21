import React, { useEffect, useState } from 'react';
import { Button, Row, Col, Descriptions, Table, Tag, Space, DatePicker, Statistic, Card } from 'antd';
import { 
  PlusOutlined, 
  SendOutlined, 
  CheckOutlined, 
  CloseOutlined, 
  HistoryOutlined,
  SearchOutlined,
  FileDoneOutlined,
  FileExcelOutlined
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import dayjs from 'dayjs';

import CrudModal from '@/components/CrudModal';
import SearchPanel from '@/components/SearchPanel';
import DataTable from '@/components/DataTable';
import { selectListItems } from '@/redux/crud/selectors';
import { request } from '@/request';
import procurementService from '@/services/procurementService';

export default function RFQList() {
  const dispatch = useDispatch();
  const history = useHistory();
  const [isLoading, setIsLoading] = useState(false);
  const [rfqs, setRfqs] = useState([]);
  const [searchParams, setSearchParams] = useState({});
  const [filterActive, setFilterActive] = useState(false);
  
  // States for modal dialogs
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [currentRFQ, setCurrentRFQ] = useState(null);
  
  // Fetch RFQs
  const fetchRFQs = async (params = {}) => {
    setIsLoading(true);
    try {
      const result = await procurementService.getRFQs(params);
      if (result.success) {
        setRfqs(result.data || []);
      } else {
        console.error('Failed to fetch RFQs:', result.message);
      }
    } catch (error) {
      console.error('Error fetching RFQs:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch data on component mount
  useEffect(() => {
    fetchRFQs();
  }, []);
  
  // Fetch data when search params change
  useEffect(() => {
    if (filterActive) {
      fetchRFQs(searchParams);
    }
  }, [searchParams, filterActive]);
  
  // Handle search and filters
  const handleSearch = (values) => {
    setSearchParams(values);
    setFilterActive(true);
  };
  
  const handleClearSearch = () => {
    setSearchParams({});
    setFilterActive(false);
    fetchRFQs();
  };
  
  // Handle view details
  const handleViewDetails = (record) => {
    setCurrentRFQ(record);
    setIsDetailModalVisible(true);
  };
  
  // Handle create new
  const handleCreateNew = () => {
    history.push('/procurement/rfq/create');
  };
  
  // Handle send RFQ
  const handleSendRFQ = async (id) => {
    try {
      const result = await procurementService.sendRFQ(id);
      if (result.success) {
        fetchRFQs(searchParams);
      }
    } catch (error) {
      console.error('Error sending RFQ:', error);
    }
  };
  
  // Handle cancel RFQ
  const handleCancelRFQ = async (id) => {
    try {
      const result = await procurementService.cancelRFQ(id, 'Cancelled by user');
      if (result.success) {
        fetchRFQs(searchParams);
      }
    } catch (error) {
      console.error('Error cancelling RFQ:', error);
    }
  };
  
  // RFQ status tag renderer
  const renderStatusTag = (status) => {
    const statusConfig = {
      draft: { color: 'default', text: 'Draft' },
      sent: { color: 'processing', text: 'Sent to Suppliers' },
      in_progress: { color: 'warning', text: 'In Progress' },
      completed: { color: 'success', text: 'Completed' },
      cancelled: { color: 'error', text: 'Cancelled' }
    };
    
    const config = statusConfig[status] || { color: 'default', text: status };
    
    return <Tag color={config.color}>{config.text}</Tag>;
  };
  
  // Table columns
  const columns = [
    {
      title: 'RFQ Number',
      dataIndex: 'rfqNumber',
      key: 'rfqNumber',
      sorter: (a, b) => a.rfqNumber.localeCompare(b.rfqNumber)
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: renderStatusTag,
      sorter: (a, b) => a.status.localeCompare(b.status)
    },
    {
      title: 'Response Deadline',
      dataIndex: 'responseDeadline',
      key: 'responseDeadline',
      render: (date) => date ? dayjs(date).format('YYYY-MM-DD') : '-',
      sorter: (a, b) => new Date(a.responseDeadline) - new Date(b.responseDeadline)
    },
    {
      title: 'Created By',
      dataIndex: ['createdBy', 'name'],
      key: 'createdBy',
      render: (text, record) => record.createdBy?.name || '-'
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => date ? dayjs(date).format('YYYY-MM-DD') : '-',
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <Button 
            type="primary" 
            size="small" 
            onClick={() => handleViewDetails(record)}
          >
            View
          </Button>
          
          {record.status === 'draft' && (
            <>
              <Button 
                type="default" 
                size="small" 
                onClick={() => history.push(`/procurement/rfq/edit/${record.id}`)}
              >
                Edit
              </Button>
              <Button 
                type="primary" 
                size="small" 
                icon={<SendOutlined />}
                onClick={() => handleSendRFQ(record.id)}
              >
                Send
              </Button>
            </>
          )}
          
          {(record.status === 'draft' || record.status === 'sent') && (
            <Button 
              danger 
              size="small" 
              onClick={() => handleCancelRFQ(record.id)}
            >
              Cancel
            </Button>
          )}
          
          {record.status === 'in_progress' && (
            <Button 
              type="primary" 
              size="small" 
              onClick={() => history.push(`/procurement/rfq/select-quotes/${record.id}`)}
            >
              Select Quotes
            </Button>
          )}
        </Space>
      )
    }
  ];
  
  // Search fields for the search panel
  const searchFields = [
    {
      key: 'rfqNumber',
      label: 'RFQ Number',
      type: 'string'
    },
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'draft', label: 'Draft' },
        { value: 'sent', label: 'Sent to Suppliers' },
        { value: 'in_progress', label: 'In Progress' },
        { value: 'completed', label: 'Completed' },
        { value: 'cancelled', label: 'Cancelled' }
      ]
    },
    {
      key: 'dateFrom',
      label: 'Date From',
      type: 'date'
    },
    {
      key: 'dateTo',
      label: 'Date To',
      type: 'date'
    }
  ];
  
  // Summary statistics
  const renderSummary = () => {
    const totalRFQs = rfqs.length;
    const draftRFQs = rfqs.filter(rfq => rfq.status === 'draft').length;
    const sentRFQs = rfqs.filter(rfq => rfq.status === 'sent').length;
    const inProgressRFQs = rfqs.filter(rfq => rfq.status === 'in_progress').length;
    const completedRFQs = rfqs.filter(rfq => rfq.status === 'completed').length;
    
    return (
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={4}>
          <Card>
            <Statistic title="Total RFQs" value={totalRFQs} />
          </Card>
        </Col>
        <Col span={5}>
          <Card>
            <Statistic title="Draft" value={draftRFQs} valueStyle={{ color: '#888888' }} />
          </Card>
        </Col>
        <Col span={5}>
          <Card>
            <Statistic title="Sent to Suppliers" value={sentRFQs} valueStyle={{ color: '#1890ff' }} />
          </Card>
        </Col>
        <Col span={5}>
          <Card>
            <Statistic title="In Progress" value={inProgressRFQs} valueStyle={{ color: '#faad14' }} />
          </Card>
        </Col>
        <Col span={5}>
          <Card>
            <Statistic title="Completed" value={completedRFQs} valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
      </Row>
    );
  };
  
  // RFQ details modal
  const renderDetailsModal = () => {
    if (!currentRFQ) return null;
    
    const supplierColumns = [
      {
        title: 'Supplier Name',
        dataIndex: 'supplierName',
        key: 'supplierName'
      },
      {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        render: (status) => {
          const statusMap = {
            pending: { color: 'default', text: 'Pending' },
            sent: { color: 'processing', text: 'Sent' },
            responded: { color: 'success', text: 'Responded' },
            selected: { color: 'success', text: 'Selected' },
            rejected: { color: 'error', text: 'Rejected' }
          };
          const config = statusMap[status] || { color: 'default', text: status };
          return <Tag color={config.color}>{config.text}</Tag>;
        }
      },
      {
        title: 'Contact Email',
        dataIndex: 'contactEmail',
        key: 'contactEmail'
      },
      {
        title: 'Contact Phone',
        dataIndex: 'contactPhone',
        key: 'contactPhone'
      }
    ];
    
    const itemColumns = [
      {
        title: 'Description',
        dataIndex: 'description',
        key: 'description'
      },
      {
        title: 'Quantity',
        dataIndex: 'quantity',
        key: 'quantity'
      },
      {
        title: 'UOM',
        dataIndex: 'uom',
        key: 'uom'
      },
      {
        title: 'Item Number',
        dataIndex: 'itemNumber',
        key: 'itemNumber'
      }
    ];
    
    return (
      <CrudModal
        title={`RFQ Details: ${currentRFQ.rfqNumber}`}
        visible={isDetailModalVisible}
        onCancel={() => {
          setIsDetailModalVisible(false);
          setCurrentRFQ(null);
        }}
        width={1000}
        footer={[
          <Button key="close" onClick={() => {
            setIsDetailModalVisible(false);
            setCurrentRFQ(null);
          }}>
            Close
          </Button>
        ]}
      >
        <Descriptions bordered column={2}>
          <Descriptions.Item label="RFQ Number">{currentRFQ.rfqNumber}</Descriptions.Item>
          <Descriptions.Item label="Status">{renderStatusTag(currentRFQ.status)}</Descriptions.Item>
          <Descriptions.Item label="Created By">{currentRFQ.createdBy?.name || '-'}</Descriptions.Item>
          <Descriptions.Item label="Created At">{dayjs(currentRFQ.createdAt).format('YYYY-MM-DD HH:mm')}</Descriptions.Item>
          <Descriptions.Item label="Response Deadline">{dayjs(currentRFQ.responseDeadline).format('YYYY-MM-DD')}</Descriptions.Item>
          <Descriptions.Item label="PR Number">
            {currentRFQ.purchaseRequisition?.prNumber || 'Not linked to PR'}
          </Descriptions.Item>
          <Descriptions.Item label="Description" span={2}>{currentRFQ.description}</Descriptions.Item>
          <Descriptions.Item label="Notes" span={2}>{currentRFQ.notes || '-'}</Descriptions.Item>
        </Descriptions>
        
        <h3 style={{ marginTop: 24 }}>Items</h3>
        <Table 
          dataSource={currentRFQ.items || []} 
          columns={itemColumns} 
          rowKey="id" 
          pagination={false}
          size="small"
        />
        
        <h3 style={{ marginTop: 24 }}>Suppliers</h3>
        <Table 
          dataSource={currentRFQ.suppliers || []} 
          columns={supplierColumns}
          rowKey="id"
          pagination={false}
          size="small"
        />
      </CrudModal>
    );
  };
  
  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col span={24}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0 }}>Requests for Quotation (RFQs)</h3>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={handleCreateNew}
            >
              Create New RFQ
            </Button>
          </div>
        </Col>
      </Row>
      
      {renderSummary()}
      
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col span={24}>
          <SearchPanel
            fields={searchFields}
            onSearch={handleSearch}
            onClear={handleClearSearch}
          />
        </Col>
      </Row>
      
      <DataTable
        columns={columns}
        dataSource={rfqs}
        loading={isLoading}
        pagination={{ pageSize: 10 }}
        rowKey="id"
      />
      
      {renderDetailsModal()}
    </div>
  );
}
