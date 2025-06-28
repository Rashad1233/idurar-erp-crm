import React, { useState } from 'react';
import { 
  Button, 
  Modal, 
  Space, 
  Alert, 
  Table, 
  Tag, 
  Collapse, 
  Spin,
  Typography,
  Divider
} from 'antd';
import { 
  BugOutlined, 
  ApiOutlined, 
  DatabaseOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';

const { Panel } = Collapse;
const { Title, Text } = Typography;

function PurchaseRequisitionDebugger({ availablePRs, loading }) {
  const [debugVisible, setDebugVisible] = useState(false);
  const [debugData, setDebugData] = useState({
    sequelizeResult: null,
    sqlResult: null,
    apiResult: null,
    errors: []
  });
  const [debugLoading, setDebugLoading] = useState(false);

  const testSequelizeEndpoint = async () => {
    setDebugLoading(true);
    try {
      const response = await fetch('/api/debug/pr-list-sequelize', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      setDebugData(prev => ({ ...prev, sequelizeResult: data }));
    } catch (error) {
      setDebugData(prev => ({ 
        ...prev, 
        errors: [...prev.errors, { type: 'sequelize', error: error.message, timestamp: new Date().toISOString() }] 
      }));
    }
    setDebugLoading(false);
  };

  const testSQLEndpoint = async () => {
    setDebugLoading(true);
    try {
      const response = await fetch('/api/debug/pr-list-simple', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      setDebugData(prev => ({ ...prev, sqlResult: data }));
    } catch (error) {
      setDebugData(prev => ({ 
        ...prev, 
        errors: [...prev.errors, { type: 'sql', error: error.message, timestamp: new Date().toISOString() }] 
      }));
    }
    setDebugLoading(false);
  };

  const testMainAPI = async () => {
    setDebugLoading(true);
    try {
      const response = await fetch('/api/purchase-requisition', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      setDebugData(prev => ({ ...prev, apiResult: data }));
    } catch (error) {
      setDebugData(prev => ({ 
        ...prev, 
        errors: [...prev.errors, { type: 'api', error: error.message, timestamp: new Date().toISOString() }] 
      }));
    }
    setDebugLoading(false);
  };

  const clearDebugData = () => {
    setDebugData({
      sequelizeResult: null,
      sqlResult: null,
      apiResult: null,
      errors: []
    });
  };

  const getStatusIcon = (result) => {
    if (!result) return <InfoCircleOutlined style={{ color: '#1890ff' }} />;
    if (result.success) return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
    return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
  };

  const getResultSummary = (result, type) => {
    if (!result) return 'Not tested yet';
    
    let prCount = 0;
    let approvedCount = 0;
    
    if (result.result && Array.isArray(result.result)) {
      prCount = result.result.length;
      approvedCount = result.result.filter(pr => pr.status === 'approved').length;
    } else if (result.data && Array.isArray(result.data)) {
      prCount = result.data.length;
      approvedCount = result.data.filter(pr => pr.status === 'approved').length;
    }
    
    return (
      <Space>
        {getStatusIcon(result)}
        <Text>
          Total PRs: <Tag color="blue">{prCount}</Tag>
          Approved: <Tag color="green">{approvedCount}</Tag>
        </Text>
      </Space>
    );
  };

  return (
    <>
      <Button 
        icon={<BugOutlined />} 
        onClick={() => setDebugVisible(true)}
        style={{ marginBottom: 16 }}
        type="dashed"
      >
        Debug PR Dropdown
      </Button>

      <Modal
        title="Purchase Requisition Dropdown Debugger"
        visible={debugVisible}
        onCancel={() => setDebugVisible(false)}
        width={1000}
        footer={[
          <Button key="clear" onClick={clearDebugData}>
            Clear Results
          </Button>,
          <Button key="close" onClick={() => setDebugVisible(false)}>
            Close
          </Button>
        ]}
      >
        <Spin spinning={debugLoading}>
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            {/* Current State Info */}
            <Alert
              message="Current Frontend State"
              description={
                <Space direction="vertical">
                  <Text>Approved PRs in dropdown: <Tag color="green">{availablePRs.length}</Tag></Text>
                  <Text>Loading state: <Tag color={loading ? 'orange' : 'green'}>{loading ? 'Loading' : 'Ready'}</Tag></Text>
                  <Text>Auth token present: <Tag color={localStorage.getItem('auth_token') ? 'green' : 'red'}>{localStorage.getItem('auth_token') ? 'Yes' : 'No'}</Tag></Text>
                </Space>
              }
              type="info"
              showIcon
            />

            {/* Test Buttons */}
            <Space wrap>
              <Button 
                icon={<DatabaseOutlined />} 
                onClick={testSequelizeEndpoint}
                loading={debugLoading}
                type="primary"
              >
                Test Sequelize Endpoint
              </Button>
              <Button 
                icon={<DatabaseOutlined />} 
                onClick={testSQLEndpoint}
                loading={debugLoading}
              >
                Test Direct SQL Endpoint
              </Button>
              <Button 
                icon={<ApiOutlined />} 
                onClick={testMainAPI}
                loading={debugLoading}
              >
                Test Main API
              </Button>
            </Space>

            {/* Results Summary */}
            <div style={{ background: '#f0f2f5', padding: 16, borderRadius: 8 }}>
              <Title level={5}>Test Results Summary</Title>
              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <Text strong>Sequelize Endpoint:</Text> {getResultSummary(debugData.sequelizeResult, 'sequelize')}
                </div>
                <div>
                  <Text strong>Direct SQL Endpoint:</Text> {getResultSummary(debugData.sqlResult, 'sql')}
                </div>
                <div>
                  <Text strong>Main API Endpoint:</Text> {getResultSummary(debugData.apiResult, 'api')}
                </div>
              </Space>
            </div>

            {/* Errors */}
            {debugData.errors.length > 0 && (
              <Alert
                message="Errors Detected"
                description={
                  <div style={{ maxHeight: 200, overflow: 'auto' }}>
                    {debugData.errors.map((err, idx) => (
                      <div key={idx} style={{ marginBottom: 8 }}>
                        <Tag color="error">{err.type.toUpperCase()}</Tag>
                        <Text type="danger">{err.error}</Text>
                        <Text type="secondary" style={{ marginLeft: 8, fontSize: 12 }}>
                          {new Date(err.timestamp).toLocaleTimeString()}
                        </Text>
                      </div>
                    ))}
                  </div>
                }
                type="error"
                showIcon
              />
            )}

            {/* Detailed Results */}
            <Collapse>
              {debugData.sequelizeResult && (
                <Panel 
                  header={
                    <Space>
                      {getStatusIcon(debugData.sequelizeResult)}
                      <Text>Sequelize Result</Text>
                    </Space>
                  } 
                  key="1"
                >
                  <pre style={{ maxHeight: 400, overflow: 'auto', background: '#f5f5f5', padding: 12, borderRadius: 4 }}>
                    {JSON.stringify(debugData.sequelizeResult, null, 2)}
                  </pre>
                </Panel>
              )}
              {debugData.sqlResult && (
                <Panel 
                  header={
                    <Space>
                      {getStatusIcon(debugData.sqlResult)}
                      <Text>Direct SQL Result</Text>
                    </Space>
                  } 
                  key="2"
                >
                  <pre style={{ maxHeight: 400, overflow: 'auto', background: '#f5f5f5', padding: 12, borderRadius: 4 }}>
                    {JSON.stringify(debugData.sqlResult, null, 2)}
                  </pre>
                </Panel>
              )}
              {debugData.apiResult && (
                <Panel 
                  header={
                    <Space>
                      {getStatusIcon(debugData.apiResult)}
                      <Text>Main API Result</Text>
                    </Space>
                  } 
                  key="3"
                >
                  <pre style={{ maxHeight: 400, overflow: 'auto', background: '#f5f5f5', padding: 12, borderRadius: 4 }}>
                    {JSON.stringify(debugData.apiResult, null, 2)}
                  </pre>
                </Panel>
              )}
            </Collapse>

            <Divider />

            {/* Current PR Dropdown Data */}
            <div>
              <Title level={5}>Current PR Dropdown Data</Title>
              <Table
                dataSource={availablePRs}
                columns={[
                  { 
                    title: 'ID', 
                    dataIndex: 'id', 
                    key: 'id',
                    width: 80
                  },
                  { 
                    title: 'PR Number', 
                    dataIndex: 'prNumber', 
                    key: 'prNumber',
                    render: (text) => <Tag color="blue">{text}</Tag>
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
                    render: (status) => (
                      <Tag color={status === 'approved' ? 'green' : 'orange'}>
                        {status}
                      </Tag>
                    )
                  },
                  {
                    title: 'Total Amount',
                    dataIndex: 'totalAmount',
                    key: 'totalAmount',
                    render: (amount) => `$${amount || 0}`
                  }
                ]}
                size="small"
                pagination={false}
                scroll={{ y: 200 }}
                rowKey="id"
              />
            </div>

            {/* Debug Info */}
            <Alert
              message="Debug Information"
              description={
                <Space direction="vertical">
                  <Text>Database: erpdb</Text>
                  <Text>Table: PurchaseRequisitions</Text>
                  <Text>Debug endpoints available:</Text>
                  <ul style={{ marginBottom: 0 }}>
                    <li>/api/debug/pr-list-sequelize - Uses Sequelize ORM</li>
                    <li>/api/debug/pr-list-simple - Uses direct SQL query</li>
                    <li>/api/purchase-requisition - Main API endpoint</li>
                  </ul>
                </Space>
              }
              type="info"
            />
          </Space>
        </Spin>
      </Modal>
    </>
  );
}

export default PurchaseRequisitionDebugger;
