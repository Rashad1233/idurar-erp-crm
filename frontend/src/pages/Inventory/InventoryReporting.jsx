import React, { useState } from 'react';
import { Card, Row, Col, Button, DatePicker, Select, Table, Tabs, Space, Typography } from 'antd';
import { BarChartOutlined, PieChartOutlined, LineChartOutlined, DownloadOutlined, PrinterOutlined } from '@ant-design/icons';
import useLanguage from '@/locale/useLanguage';
import { ErpLayout } from '@/layout';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { Title } = Typography;

export default function InventoryReporting() {
  const translate = useLanguage();
  const [reportType, setReportType] = useState('stockLevel');
  const [dateRange, setDateRange] = useState([dayjs().subtract(30, 'days'), dayjs()]);
  const [loading, setLoading] = useState(false);
  
  // Mock data for the reports
  const stockLevelData = [
    {
      key: '1',
      itemNumber: '10001',
      description: 'Hydraulic Pump - 500PSI',
      currentStock: 5,
      minLevel: 10,
      maxLevel: 50,
      reorderPoint: 15,
      value: 2253.75,
      lastCountDate: '2025-04-25',
      category: 'PUMP'
    },
    {
      key: '2',
      itemNumber: '10034',
      description: 'Pressure Gauge 0-1000PSI',
      currentStock: 12,
      minLevel: 5,
      maxLevel: 20,
      reorderPoint: 8,
      value: 942.00,
      lastCountDate: '2025-04-25',
      category: 'INSTRUMENT'
    },
    {
      key: '3',
      itemNumber: '10089',
      description: 'Control Valve - 2"',
      currentStock: 4,
      minLevel: 2,
      maxLevel: 10,
      reorderPoint: 3,
      value: 1300.00,
      lastCountDate: '2025-04-25',
      category: 'VALVE'
    },
    {
      key: '4',
      itemNumber: '10102',
      description: 'O-Ring Kit - Assorted',
      currentStock: 8,
      minLevel: 5,
      maxLevel: 20,
      reorderPoint: 5,
      value: 367.92,
      lastCountDate: '2025-04-25',
      category: 'SEALS'
    },
    {
      key: '5',
      itemNumber: '10155',
      description: 'Electrical Control Unit',
      currentStock: 2,
      minLevel: 1,
      maxLevel: 5,
      reorderPoint: 2,
      value: 1200.00,
      lastCountDate: '2025-04-25',
      category: 'ELECTRICAL'
    }
  ];
  
  const movementData = [
    {
      key: '1',
      itemNumber: '10001',
      description: 'Hydraulic Pump - 500PSI',
      receipts: 2,
      issues: 3,
      returns: 0,
      transfers: 1,
      netChange: -2,
      startingBalance: 7,
      endingBalance: 5
    },
    {
      key: '2',
      itemNumber: '10034',
      description: 'Pressure Gauge 0-1000PSI',
      receipts: 5,
      issues: 2,
      returns: 1,
      transfers: 0,
      netChange: 4,
      startingBalance: 8,
      endingBalance: 12
    },
    {
      key: '3',
      itemNumber: '10089',
      description: 'Control Valve - 2"',
      receipts: 3,
      issues: 2,
      returns: 0,
      transfers: 0,
      netChange: 1,
      startingBalance: 3,
      endingBalance: 4
    },
    {
      key: '4',
      itemNumber: '10102',
      description: 'O-Ring Kit - Assorted',
      receipts: 1,
      issues: 4,
      returns: 2,
      transfers: 0,
      netChange: -1,
      startingBalance: 9,
      endingBalance: 8
    },
    {
      key: '5',
      itemNumber: '10155',
      description: 'Electrical Control Unit',
      receipts: 1,
      issues: 1,
      returns: 0,
      transfers: 1,
      netChange: -1,
      startingBalance: 3,
      endingBalance: 2
    }
  ];
  
  const valuationData = [
    {
      key: '1',
      category: 'PUMP',
      itemCount: 12,
      totalValue: 15420.50,
      avgValue: 1285.04,
      percentOfTotal: 28.5
    },
    {
      key: '2',
      category: 'VALVE',
      itemCount: 18,
      totalValue: 12850.75,
      avgValue: 713.93,
      percentOfTotal: 23.7
    },
    {
      key: '3',
      category: 'ELECTRICAL',
      itemCount: 25,
      totalValue: 9875.25,
      avgValue: 395.01,
      percentOfTotal: 18.2
    },
    {
      key: '4',
      category: 'INSTRUMENT',
      itemCount: 15,
      totalValue: 7890.30,
      avgValue: 526.02,
      percentOfTotal: 14.6
    },
    {
      key: '5',
      category: 'SEALS',
      itemCount: 30,
      totalValue: 4590.45,
      avgValue: 153.02,
      percentOfTotal: 8.5
    },
    {
      key: '6',
      category: 'OTHER',
      itemCount: 10,
      totalValue: 3540.25,
      avgValue: 354.03,
      percentOfTotal: 6.5
    }
  ];
  
  // Column definitions for different report types
  const stockLevelColumns = [
    {
      title: translate('Item Number'),
      dataIndex: 'itemNumber',
      key: 'itemNumber',
    },
    {
      title: translate('Description'),
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: translate('Current Stock'),
      dataIndex: 'currentStock',
      key: 'currentStock',
      sorter: (a, b) => a.currentStock - b.currentStock,
    },
    {
      title: translate('Min Level'),
      dataIndex: 'minLevel',
      key: 'minLevel',
    },
    {
      title: translate('Max Level'),
      dataIndex: 'maxLevel',
      key: 'maxLevel',
    },
    {
      title: translate('Value'),
      dataIndex: 'value',
      key: 'value',
      render: (value) => `$${value.toFixed(2)}`,
      sorter: (a, b) => a.value - b.value,
    },
    {
      title: translate('Last Count'),
      dataIndex: 'lastCountDate',
      key: 'lastCountDate',
    },
    {
      title: translate('Category'),
      dataIndex: 'category',
      key: 'category',
      filters: [
        { text: 'PUMP', value: 'PUMP' },
        { text: 'VALVE', value: 'VALVE' },
        { text: 'INSTRUMENT', value: 'INSTRUMENT' },
        { text: 'SEALS', value: 'SEALS' },
        { text: 'ELECTRICAL', value: 'ELECTRICAL' }
      ],
      onFilter: (value, record) => record.category.indexOf(value) === 0,
    },
  ];
  
  const movementColumns = [
    {
      title: translate('Item Number'),
      dataIndex: 'itemNumber',
      key: 'itemNumber',
    },
    {
      title: translate('Description'),
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: translate('Starting Balance'),
      dataIndex: 'startingBalance',
      key: 'startingBalance',
    },
    {
      title: translate('Receipts'),
      dataIndex: 'receipts',
      key: 'receipts',
    },
    {
      title: translate('Issues'),
      dataIndex: 'issues',
      key: 'issues',
    },
    {
      title: translate('Returns'),
      dataIndex: 'returns',
      key: 'returns',
    },
    {
      title: translate('Transfers'),
      dataIndex: 'transfers',
      key: 'transfers',
    },
    {
      title: translate('Net Change'),
      dataIndex: 'netChange',
      key: 'netChange',
    },
    {
      title: translate('Ending Balance'),
      dataIndex: 'endingBalance',
      key: 'endingBalance',
    },
  ];
  
  const valuationColumns = [
    {
      title: translate('Category'),
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: translate('Item Count'),
      dataIndex: 'itemCount',
      key: 'itemCount',
    },
    {
      title: translate('Total Value'),
      dataIndex: 'totalValue',
      key: 'totalValue',
      render: (value) => `$${value.toFixed(2)}`,
      sorter: (a, b) => a.totalValue - b.totalValue,
    },
    {
      title: translate('Avg Value per Item'),
      dataIndex: 'avgValue',
      key: 'avgValue',
      render: (value) => `$${value.toFixed(2)}`,
    },
    {
      title: translate('% of Total'),
      dataIndex: 'percentOfTotal',
      key: 'percentOfTotal',
      render: (value) => `${value}%`,
      sorter: (a, b) => a.percentOfTotal - b.percentOfTotal,
    },
  ];
  
  // Function to handle generating the report
  const handleGenerateReport = () => {
    setLoading(true);
    // In a real implementation, this would call an API to get the report data
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };
  
  // Function to export report to CSV
  const handleExportCSV = () => {
    // Implementation for exporting to CSV
    console.log('Exporting report to CSV');
  };
  
  // Function to print the report
  const handlePrintReport = () => {
    // Implementation for printing
    window.print();
  };
  
  return (
    <ErpLayout>
      <Card 
        title={
          <Space>
            <BarChartOutlined />
            {translate('Inventory Reports')}
          </Space>
        }
      >
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={8}>
            <Select
              style={{ width: '100%' }}
              value={reportType}
              onChange={setReportType}
            >
              <Option value="stockLevel">{translate('Stock Level Report')}</Option>
              <Option value="movement">{translate('Inventory Movement')}</Option>
              <Option value="valuation">{translate('Inventory Valuation')}</Option>
            </Select>
          </Col>
          <Col xs={24} sm={8}>
            <RangePicker 
              style={{ width: '100%' }}
              value={dateRange}
              onChange={setDateRange}
            />
          </Col>
          <Col xs={24} sm={8} style={{ textAlign: 'right' }}>
            <Space>
              <Button 
                type="primary" 
                onClick={handleGenerateReport}
                loading={loading}
              >
                {translate('Generate Report')}
              </Button>
              <Button 
                onClick={handleExportCSV}
                icon={<DownloadOutlined />}
              >
                {translate('Export CSV')}
              </Button>
              <Button 
                onClick={handlePrintReport}
                icon={<PrinterOutlined />}
              >
                {translate('Print')}
              </Button>
            </Space>
          </Col>
        </Row>
          <Tabs defaultActiveKey="table" 
          items={[
            {
              key: "table",
              label: <span><BarChartOutlined /> {translate('Table')}</span>,
              children: <Table
                columns={
                  reportType === 'stockLevel' ? stockLevelColumns :
                  reportType === 'movement' ? movementColumns :
                  valuationColumns
                }
                dataSource={
                  reportType === 'stockLevel' ? stockLevelData :
                  reportType === 'movement' ? movementData :
                  valuationData
                }
                loading={loading}
                pagination={{ pageSize: 10 }}
                scroll={{ x: 1000 }}
                summary={(pageData) => {
                  if (reportType === 'stockLevel') {
                    const totalValue = pageData.reduce((sum, item) => sum + item.value, 0);
                    return (
                      <>
                        <Table.Summary.Row>
                          <Table.Summary.Cell index={0} colSpan={5}><strong>{translate('Total')}</strong></Table.Summary.Cell>
                          <Table.Summary.Cell index={5}><strong>${totalValue.toFixed(2)}</strong></Table.Summary.Cell>
                          <Table.Summary.Cell index={6} colSpan={2}></Table.Summary.Cell>
                        </Table.Summary.Row>
                      </>
                    );
                  }
                  
                  if (reportType === 'valuation') {
                    const totalValue = pageData.reduce((sum, item) => sum + item.totalValue, 0);
                    const totalItems = pageData.reduce((sum, item) => sum + item.itemCount, 0);
                    return (
                      <>
                        <Table.Summary.Row>
                          <Table.Summary.Cell index={0}><strong>{translate('Total')}</strong></Table.Summary.Cell>
                          <Table.Summary.Cell index={1}><strong>{totalItems}</strong></Table.Summary.Cell>
                          <Table.Summary.Cell index={2}><strong>${totalValue.toFixed(2)}</strong></Table.Summary.Cell>
                          <Table.Summary.Cell index={3} colSpan={2}></Table.Summary.Cell>
                        </Table.Summary.Row>
                      </>
                    );
                  }
                  
                  return null;
                }}
              />
            },
            {
              key: "chart",
              label: <span><PieChartOutlined /> {translate('Chart')}</span>,
              children: <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <Title level={4}>{translate('Chart View - Coming Soon')}</Title>
                <p>{translate('Visual representations of the report data will be available here.')}</p>
              </div>
            },
            {
              key: "trends",
              label: <span><LineChartOutlined /> {translate('Trends')}</span>,
              children: <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <Title level={4}>{translate('Trend Analysis - Coming Soon')}</Title>
                <p>{translate('Historical trend analysis will be available here.')}</p>
              </div>
            }
          ]}
        />
      </Card>
    </ErpLayout>
  );
}
