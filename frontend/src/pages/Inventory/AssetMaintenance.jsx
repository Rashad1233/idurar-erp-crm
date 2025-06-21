import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Button, Modal, Form, Input, DatePicker, Select, Space, Divider, Badge, Tooltip } from 'antd';
import { 
  ToolOutlined, 
  PlusOutlined, 
  CheckCircleOutlined, 
  ExclamationCircleOutlined, 
  ClockCircleOutlined,
  HistoryOutlined
} from '@ant-design/icons';
import useLanguage from '@/locale/useLanguage';
import { ErpLayout } from '@/layout';
import dayjs from 'dayjs';
import SelectAsync from '@/components/SelectAsync';

const { Option } = Select;
const { TextArea } = Input;

export default function AssetMaintenance() {
  const translate = useLanguage();
  const [maintenanceData, setMaintenanceData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [filterStatus, setFilterStatus] = useState(null);
  
  // Load maintenance data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // In a real implementation, this would be an API call
        // const response = await request.get('/maintenance');
        // setMaintenanceData(response.data);
        
        // For now, using mock data
        const mockData = [
          {
            id: '1',
            assetNumber: 'ASSET-001',
            assetName: 'Air Compressor - Atlas Copco',
            maintenanceType: 'preventive',
            status: 'scheduled',
            priority: 'medium',
            scheduledDate: '2025-05-30',
            assignedTo: 'John Smith',
            lastMaintenance: '2025-01-15',
            nextDue: '2025-05-30',
            location: 'Building A - Compressor Room',
            notes: 'Regular 6-month inspection and oil change'
          },
          {
            id: '2',
            assetNumber: 'ASSET-002',
            assetName: 'Forklift - Toyota',
            maintenanceType: 'corrective',
            status: 'in-progress',
            priority: 'high',
            scheduledDate: '2025-05-18',
            assignedTo: 'Mike Johnson',
            lastMaintenance: '2025-03-10',
            nextDue: '2025-05-18',
            location: 'Warehouse - Zone B',
            notes: 'Hydraulic system leaking, needs repair'
          },
          {
            id: '3',
            assetNumber: 'ASSET-003',
            assetName: 'CNC Machine - Haas',
            maintenanceType: 'preventive',
            status: 'completed',
            priority: 'medium',
            scheduledDate: '2025-04-20',
            completedDate: '2025-04-22',
            assignedTo: 'Robert Chen',
            lastMaintenance: '2025-04-22',
            nextDue: '2025-07-20',
            location: 'Production Floor - Bay 3',
            notes: 'Quarterly maintenance completed with parts replacement'
          },
          {
            id: '4',
            assetNumber: 'ASSET-004',
            assetName: 'HVAC Unit - Carrier',
            maintenanceType: 'emergency',
            status: 'scheduled',
            priority: 'urgent',
            scheduledDate: '2025-05-16',
            assignedTo: 'Technical Services',
            lastMaintenance: '2025-02-28',
            nextDue: '2025-05-16',
            location: 'Roof - East Wing',
            notes: 'Unit making unusual noise, needs immediate attention'
          },
          {
            id: '5',
            assetNumber: 'ASSET-005',
            assetName: 'Conveyor System - Main Line',
            maintenanceType: 'preventive',
            status: 'overdue',
            priority: 'high',
            scheduledDate: '2025-05-01',
            assignedTo: 'Mechanical Team',
            lastMaintenance: '2025-02-01',
            nextDue: '2025-05-01',
            location: 'Production Floor - Assembly Area',
            notes: 'Belt needs inspection and tensioning'
          }
        ];
        
        setMaintenanceData(mockData);
      } catch (error) {
        console.error('Error loading maintenance data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  // Handle opening the maintenance modal
  const handleAddMaintenance = () => {
    setSelectedRecord(null);
    form.resetFields();
    setIsModalVisible(true);
  };
  
  // Handle editing existing maintenance
  const handleEditMaintenance = (record) => {
    setSelectedRecord(record);
    form.setFieldsValue({
      ...record,
      scheduledDate: record.scheduledDate ? dayjs(record.scheduledDate) : null,
      completedDate: record.completedDate ? dayjs(record.completedDate) : null,
    });
    setIsModalVisible(true);
  };
  
  // Handle form submission
  const handleFormSubmit = () => {
    form.validateFields().then((values) => {
      const formData = {
        ...values,
        scheduledDate: values.scheduledDate?.format('YYYY-MM-DD'),
        completedDate: values.completedDate?.format('YYYY-MM-DD'),
      };
      
      if (selectedRecord) {
        // Update existing record
        const updatedData = maintenanceData.map(item => 
          item.id === selectedRecord.id ? { ...item, ...formData } : item
        );
        setMaintenanceData(updatedData);
      } else {
        // Add new record
        const newRecord = {
          id: `${Date.now()}`,
          ...formData
        };
        setMaintenanceData([...maintenanceData, newRecord]);
      }
      
      setIsModalVisible(false);
    });
  };
  
  // Get color for status tag
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in-progress': return 'processing';
      case 'scheduled': return 'default';
      case 'overdue': return 'error';
      default: return 'default';
    }
  };
  
  // Get color for priority tag
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return '#f50';
      case 'high': return '#fa8c16';
      case 'medium': return '#1677ff';
      case 'low': return '#52c41a';
      default: return '#1677ff';
    }
  };

  // Table columns definition
  const columns = [
    {
      title: translate('Asset'),
      dataIndex: 'assetName',
      key: 'assetName',
      render: (text, record) => (
        <Tooltip title={record.assetNumber}>
          <span>{text}</span>
        </Tooltip>
      ),
    },
    {
      title: translate('Type'),
      dataIndex: 'maintenanceType',
      key: 'maintenanceType',
      filters: [
        { text: 'Preventive', value: 'preventive' },
        { text: 'Corrective', value: 'corrective' },
        { text: 'Emergency', value: 'emergency' },
      ],
      onFilter: (value, record) => record.maintenanceType === value,
      render: (type) => {
        const typeLabels = {
          preventive: translate('Preventive'),
          corrective: translate('Corrective'),
          emergency: translate('Emergency')
        };
        return typeLabels[type] || type;
      }
    },
    {
      title: translate('Status'),
      dataIndex: 'status',
      key: 'status',
      filters: [
        { text: 'Scheduled', value: 'scheduled' },
        { text: 'In Progress', value: 'in-progress' },
        { text: 'Completed', value: 'completed' },
        { text: 'Overdue', value: 'overdue' },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status) => {
        const statusLabels = {
          scheduled: translate('Scheduled'),
          'in-progress': translate('In Progress'),
          completed: translate('Completed'),
          overdue: translate('Overdue')
        };
        
        const icons = {
          scheduled: <ClockCircleOutlined />,
          'in-progress': <ToolOutlined />,
          completed: <CheckCircleOutlined />,
          overdue: <ExclamationCircleOutlined />
        };
        
        return (
          <Tag icon={icons[status]} color={getStatusColor(status)}>
            {statusLabels[status] || status}
          </Tag>
        );
      }
    },
    {
      title: translate('Priority'),
      dataIndex: 'priority',
      key: 'priority',
      render: (priority) => {
        const priorityLabels = {
          urgent: translate('Urgent'),
          high: translate('High'),
          medium: translate('Medium'),
          low: translate('Low')
        };
        return (
          <Tag color={getPriorityColor(priority)}>
            {priorityLabels[priority] || priority}
          </Tag>
        );
      }
    },
    {
      title: translate('Scheduled Date'),
      dataIndex: 'scheduledDate',
      key: 'scheduledDate',
      sorter: (a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate),
    },
    {
      title: translate('Assigned To'),
      dataIndex: 'assignedTo',
      key: 'assignedTo',
    },
    {
      title: translate('Location'),
      dataIndex: 'location',
      key: 'location',
      ellipsis: true,
    },
    {
      title: translate('Actions'),
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button 
            type="primary" 
            size="small" 
            onClick={() => handleEditMaintenance(record)}
          >
            {translate('Edit')}
          </Button>
          {record.status !== 'completed' && (
            <Button 
              type="default" 
              size="small" 
              onClick={() => {
                const updatedData = maintenanceData.map(item => 
                  item.id === record.id 
                    ? { ...item, status: 'completed', completedDate: dayjs().format('YYYY-MM-DD') } 
                    : item
                );
                setMaintenanceData(updatedData);
              }}
            >
              {translate('Complete')}
            </Button>
          )}
        </Space>
      ),
    },
  ];
  
  // Table tab filters
  const tabBarExtraContent = (
    <Space>
      <Button 
        type={filterStatus === null ? 'primary' : 'default'}
        onClick={() => setFilterStatus(null)}
      >
        {translate('All')}
      </Button>
      <Button 
        type={filterStatus === 'scheduled' ? 'primary' : 'default'}
        onClick={() => setFilterStatus('scheduled')}
      >
        <Badge status="default" />
        {translate('Scheduled')}
      </Button>
      <Button 
        type={filterStatus === 'in-progress' ? 'primary' : 'default'}
        onClick={() => setFilterStatus('in-progress')}
      >
        <Badge status="processing" />
        {translate('In Progress')}
      </Button>
      <Button 
        type={filterStatus === 'overdue' ? 'primary' : 'default'}
        onClick={() => setFilterStatus('overdue')}
      >
        <Badge status="error" />
        {translate('Overdue')}
      </Button>
      <Button 
        type={filterStatus === 'completed' ? 'primary' : 'default'}
        onClick={() => setFilterStatus('completed')}
      >
        <Badge status="success" />
        {translate('Completed')}
      </Button>
    </Space>
  );

  // Filter data based on selected status tab
  const filteredData = filterStatus 
    ? maintenanceData.filter(item => item.status === filterStatus)
    : maintenanceData;
  
  return (
    <ErpLayout>
      <Card
        title={
          <Space>
            <ToolOutlined />
            {translate('Asset Maintenance')}
          </Space>
        }
        extra={
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={handleAddMaintenance}
          >
            {translate('Add Maintenance')}
          </Button>
        }
        tabBarExtraContent={tabBarExtraContent}
      >
        <div style={{ marginBottom: 16 }}>
          {tabBarExtraContent}
        </div>
        
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          expandable={{
            expandedRowRender: record => (
              <p style={{ margin: 0 }}>
                <strong>{translate('Notes')}: </strong> 
                {record.notes}
                <br />
                <strong>{translate('Last Maintenance')}: </strong> 
                {record.lastMaintenance}
                <strong>{translate(' • Next Due')}: </strong> 
                {record.nextDue}
              </p>
            ),
          }}
        />
      </Card>
      
      {/* Maintenance Form Modal */}
      <Modal
        title={selectedRecord ? translate('Edit Maintenance') : translate('Add Maintenance')}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={handleFormSubmit}
        width={800}
      >
        <Form 
          form={form} 
          layout="vertical"
          initialValues={{
            priority: 'medium',
            maintenanceType: 'preventive',
            status: 'scheduled',
            scheduledDate: dayjs()
          }}
        >
          <Divider>{translate('Asset Information')}</Divider>
          
          <Form.Item
            name="assetNumber"
            label={translate('Asset Number')}
            rules={[{ required: true, message: translate('Please select an asset!') }]}
          >
            <SelectAsync
              entity={'item-master'}
              displayLabels={['itemNumber', 'description']}
              placeholder={translate('Search Asset')}
              searchFields='itemNumber,description'
              onChange={(value, option) => {
                form.setFieldsValue({
                  assetName: option?.description || '',
                });
              }}
            />
          </Form.Item>
          
          <Form.Item
            name="assetName"
            label={translate('Asset Name')}
          >
            <Input disabled />
          </Form.Item>
          
          <Form.Item
            name="location"
            label={translate('Location')}
            rules={[{ required: true, message: translate('Please enter location!') }]}
          >
            <Input placeholder={translate('e.g. Building A, Room 101')} />
          </Form.Item>
          
          <Divider>{translate('Maintenance Details')}</Divider>
          
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="maintenanceType"
                label={translate('Maintenance Type')}
                rules={[{ required: true, message: translate('Please select type!') }]}
              >
                <Select>
                  <Option value="preventive">{translate('Preventive')}</Option>
                  <Option value="corrective">{translate('Corrective')}</Option>
                  <Option value="emergency">{translate('Emergency')}</Option>
                </Select>
              </Form.Item>
            </Col>
            
            <Col span={8}>
              <Form.Item
                name="priority"
                label={translate('Priority')}
                rules={[{ required: true, message: translate('Please select priority!') }]}
              >
                <Select>
                  <Option value="low">{translate('Low')}</Option>
                  <Option value="medium">{translate('Medium')}</Option>
                  <Option value="high">{translate('High')}</Option>
                  <Option value="urgent">{translate('Urgent')}</Option>
                </Select>
              </Form.Item>
            </Col>
            
            <Col span={8}>
              <Form.Item
                name="status"
                label={translate('Status')}
                rules={[{ required: true, message: translate('Please select status!') }]}
              >
                <Select>
                  <Option value="scheduled">{translate('Scheduled')}</Option>
                  <Option value="in-progress">{translate('In Progress')}</Option>
                  <Option value="completed">{translate('Completed')}</Option>
                  <Option value="overdue">{translate('Overdue')}</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="scheduledDate"
                label={translate('Scheduled Date')}
                rules={[{ required: true, message: translate('Please select date!') }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            
            <Col span={12}>
              <Form.Item
                name="completedDate"
                label={translate('Completed Date')}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item
            name="assignedTo"
            label={translate('Assigned To')}
            rules={[{ required: true, message: translate('Please assign someone!') }]}
          >
            <Input placeholder={translate('e.g. John Smith or Maintenance Team')} />
          </Form.Item>
          
          <Form.Item
            name="notes"
            label={translate('Notes')}
          >
            <TextArea rows={4} placeholder={translate('Enter maintenance details, parts required, procedures, etc.')} />
          </Form.Item>
        </Form>
      </Modal>
    </ErpLayout>
  );
}
