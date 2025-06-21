import React, { useState, useEffect } from 'react';
import { Card, Statistic, Row, Col, Button, DatePicker, Select, Alert, Spin } from 'antd';
import { DollarOutlined, ThunderboltOutlined, SearchOutlined, CameraOutlined } from '@ant-design/icons';
import apiClient from '@/api/axiosConfig';

const { Option } = Select;
const { RangePicker } = DatePicker;

const AICostMonitor = () => {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [period, setPeriod] = useState('monthly');
  const [userId, setUserId] = useState(null);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const params = { period };
      if (userId) params.userId = userId;
      
      const response = await apiClient.get('/ai/usage-stats', { params });
      
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching AI usage stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [period, userId]);

  const formatCost = (cost) => {
    if (cost < 0.01) return `$${(cost * 1000).toFixed(2)}¢`;
    return `$${cost.toFixed(4)}`;
  };

  return (
    <div style={{ padding: '24px' }}>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Select
            value={period}
            onChange={setPeriod}
            style={{ width: '100%' }}
          >
            <Option value="daily">Today</Option>
            <Option value="monthly">This Month</Option>
          </Select>
        </Col>
        <Col span={8}>
          <Button onClick={fetchStats} loading={loading}>
            Refresh Stats
          </Button>
        </Col>
      </Row>

      {loading ? (
        <Spin size="large" style={{ display: 'block', textAlign: 'center', padding: '50px' }} />
      ) : stats ? (
        <>
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Total AI Cost"
                  value={formatCost(stats.totals.cost)}
                  prefix={<DollarOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Total Tokens"
                  value={stats.totals.tokens}
                  prefix={<ThunderboltOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="API Requests"
                  value={stats.totals.requests}
                  prefix={<SearchOutlined />}
                  valueStyle={{ color: '#722ed1' }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Avg Cost/Request"
                  value={stats.totals.requests > 0 ? formatCost(stats.totals.cost / stats.totals.requests) : '$0.00'}
                  prefix={<DollarOutlined />}
                  valueStyle={{ color: '#fa8c16' }}
                />
              </Card>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col span={8}>
              <Card title="Image Analysis" size="small">
                <Statistic
                  title="Cost"
                  value={formatCost(stats.costBreakdown.estimated.imageAnalysis)}
                  prefix={<CameraOutlined />}
                />
                <div style={{ marginTop: 8, fontSize: '12px', color: '#666' }}>
                  Usage: {stats.stats['image-analysis']?.count || 0} requests
                </div>
              </Card>
            </Col>
            <Col span={8}>
              <Card title="Description Generation" size="small">
                <Statistic
                  title="Cost"
                  value={formatCost(stats.costBreakdown.estimated.descriptionGeneration)}
                  prefix={<ThunderboltOutlined />}
                />
                <div style={{ marginTop: 8, fontSize: '12px', color: '#666' }}>
                  Usage: {stats.stats['description-generation']?.count || 0} requests
                </div>
              </Card>
            </Col>
            <Col span={8}>
              <Card title="Smart Search" size="small">
                <Statistic
                  title="Cost"
                  value={formatCost(stats.costBreakdown.estimated.smartSearch)}
                  prefix={<SearchOutlined />}
                />
                <div style={{ marginTop: 8, fontSize: '12px', color: '#666' }}>
                  Usage: {stats.stats['smart-search']?.count || 0} requests
                </div>
              </Card>
            </Col>
          </Row>

          <Alert
            style={{ marginTop: 16 }}
            message="Cost Optimization Tips"
            description={
              <ul style={{ marginBottom: 0 }}>
                <li>Image compression reduces analysis costs by ~60%</li>
                <li>Caching analysis results saves repeat costs</li>
                <li>Smart search batching reduces token usage</li>
                <li>Current monthly cost on track: ~${(stats.totals.cost * 30).toFixed(2)}</li>
              </ul>
            }
            type="info"
            showIcon
          />
        </>
      ) : (
        <Alert message="No usage data available" type="info" />
      )}
    </div>
  );
};

export default AICostMonitor;
