import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, DatePicker, Select, Table, Tabs, Space, Typography, Radio, Spin, Alert, message, Statistic, Input } from 'antd';
import { 
  BarChartOutlined, 
  PieChartOutlined, 
  LineChartOutlined, 
  DownloadOutlined, 
  PrinterOutlined,
  WarningOutlined,
  DollarOutlined,
  ReloadOutlined,
  SearchOutlined,
  FilterOutlined
} from '@ant-design/icons';
import useLanguage from '@/locale/useLanguage';
import { ErpLayout } from '@/layout';
import dayjs from 'dayjs';
import inventoryService from '@/services/inventoryService';
import { 
  BarChart, Bar, PieChart, Pie, LineChart, Line, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell, 
  ResponsiveContainer, Sector, ReferenceLine 
} from 'recharts';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { Title, Text } = Typography;

// Custom CSS styles for the UNSPSC table
const unspscTableStyles = `
  .unspsc-table .ant-table-tbody > tr.ant-table-row-selected > td {
    background-color: #e6f7ff;
  }
  
  .unspsc-table .ant-table-tbody > tr:hover > td {
    background-color: #f5f5f5;
  }
  
  .unspsc-table .ant-table-thead > tr > th {
    background-color: #f0f5ff;
    font-weight: bold;
  }
  
  .unspsc-table .ant-pagination {
    margin-top: 16px;
  }

  .unspsc-table .ant-table-fixed-header .ant-table-scroll .ant-table-header {
    overflow: hidden;
    background: #f0f5ff;
  }

  .unspsc-table .ant-table-cell-fix-left {
    background: #fff;
  }

  .unspsc-table .ant-table-row-selected .ant-table-cell-fix-left {
    background: #e6f7ff;
  }

  .unspsc-table .ant-table-tbody > tr:hover .ant-table-cell-fix-left {
    background: #f5f5f5;
  }

  .unspsc-table .category-filter-dropdown {
    padding: 8px;
    border-radius: 4px;
    background: #fff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }

  .unspsc-table .category-tag {
    margin: 4px;
    padding: 4px 8px;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.3s;
  }

  .unspsc-table .category-tag:hover {
    opacity: 0.8;
  }

  .unspsc-table .selected-summary {
    background-color: #fafafa;
    padding: 12px;
    border-radius: 4px;
    margin-bottom: 16px;
    border: 1px solid #f0f0f0;
  }

  .unspsc-category-toolbar {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    gap: 8px;
  }

  @media (max-width: 768px) {
    .unspsc-category-toolbar {
      flex-direction: column;
      align-items: flex-start;
    }
  }
`;

// Color palette for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1', '#a4de6c', '#d0ed57'];

export default function EnhancedInventoryReporting() {
  const translate = useLanguage();
  const [reportType, setReportType] = useState('stockLevel');
  const [dateRange, setDateRange] = useState([dayjs().subtract(30, 'days'), dayjs()]);
  const [chartType, setChartType] = useState('bar');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    stockLevelData: [],
    movementData: [],
    valuationData: []
  });
  const [trendData, setTrendData] = useState({
    stockLevel: [],
    movement: [],
    valuation: []
  });
  const [activeIndex, setActiveIndex] = useState(0);
  const [totalInventoryValue, setTotalInventoryValue] = useState(0);
  const [totalInventoryItems, setTotalInventoryItems] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [overStockCount, setOverStockCount] = useState(0);  const [unspscCategoryData, setUnspscCategoryData] = useState([]);
  const [unspscDataLoading, setUnspscDataLoading] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]); // Add new state for selected categories
  const [searchText, setSearchText] = useState(''); // For UNSPSC table search
  const [searchedColumn, setSearchedColumn] = useState(''); // For UNSPSC table search
  const searchInput = React.useRef(null); // For UNSPSC table search
  
  // Load data on component mount
  useEffect(() => {
    loadReportData();
    loadTrendData();
    loadUnspscCategoryData(); // Add loading of UNSPSC category data
  }, []);
  
  // Initialize selectedCategories if it's empty when data is loaded
  useEffect(() => {
    if (selectedCategories.length === 0 && unspscCategoryData.length > 0) {
      // Get sorted data
      const sortedData = [...unspscCategoryData].sort((a, b) => b.value - a.value);
      // Select top 5 categories by default
      const topCategories = sortedData.slice(0, 5).map(item => item.code);
      setSelectedCategories(topCategories);
    }
  }, [unspscCategoryData, selectedCategories]);
    // Handle UNSPSC category search
  const handleUnspscSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };
  
  // Reset UNSPSC category search filters
  const handleUnspscSearchReset = clearFilters => {
    clearFilters();
    setSearchText('');
  };
  
  // Handle UNSPSC category selection by prefix
  const handleSelectUnspscByPrefix = (prefix) => {
    // Get sorted data
    const sortedData = [...unspscCategoryData].sort((a, b) => b.value - a.value);
    // Add colors to each category
    const dataWithColors = sortedData.map((item, index) => ({
      ...item,
      fill: COLORS[index % COLORS.length],
      key: item.code // Ensure each item has a key
    }));
    
    const selectedByPrefix = dataWithColors
      .filter(item => item.code.startsWith(prefix))
      .map(item => item.code);
    setSelectedCategories(selectedByPrefix);
  };
  
  // Function to load UNSPSC category inventory data
  const loadUnspscCategoryData = async () => {
    setUnspscDataLoading(true);
    try {
      const response = await inventoryService.getUnspscCategoryInventoryData();
      console.log('UNSPSC Category Data Response:', response);
      
      if (response && response.success && response.data && response.data.length) {
        setUnspscCategoryData(response.data);
      } else {
        console.warn('No UNSPSC category data available, using empty array');
        setUnspscCategoryData([]);
      }
    } catch (error) {
      console.error('Error loading UNSPSC category data:', error);
      setUnspscCategoryData([]);
    } finally {
      setUnspscDataLoading(false);
    }
  };

  const loadReportData = async () => {
    setLoading(true);
    try {
      // Attempt to load real data from the API
      const summaryResponse = await inventoryService.getInventorySummaryMetrics();
      console.log('Summary Metrics API Response:', summaryResponse);
      
      if (summaryResponse && summaryResponse.success) {
        // Use real summary metrics data
        const summaryData = summaryResponse.data;
        setTotalInventoryValue(summaryData.totalValue || 0);
        setTotalInventoryItems(summaryData.totalItems || 0);
        setLowStockCount(summaryData.lowStockCount || 0);
        setOverStockCount(summaryData.overStockCount || 0);      }
      
      // Load report-specific data
      const reportResponse = await inventoryService.getInventoryReportData(
        reportType, 
        dateRange[0], 
        dateRange[1]
      );
      
      console.log('Report Data API Response:', reportResponse);
        if (reportResponse && reportResponse.success) {
        // Use real report data if available
        console.log('Using REAL data from API for', reportType);
        setData(reportResponse.data);
          // Check for metric overrides in the response
        if (reportResponse.data.metricOverrides) {
          console.log('Using metric overrides from API response:', reportResponse.data.metricOverrides);
          
          if (reportResponse.data.metricOverrides.lowStockCount !== undefined) {
            setLowStockCount(reportResponse.data.metricOverrides.lowStockCount);
            console.log(`Updated lowStockCount to: ${reportResponse.data.metricOverrides.lowStockCount}`);
          }
          
          if (reportResponse.data.metricOverrides.overStockCount !== undefined) {
            setOverStockCount(reportResponse.data.metricOverrides.overStockCount);
            console.log(`Updated overStockCount to: ${reportResponse.data.metricOverrides.overStockCount}`);
          }
          
          if (reportResponse.data.metricOverrides.totalItems !== undefined) {
            setTotalInventoryItems(reportResponse.data.metricOverrides.totalItems);
            console.log(`Updated totalInventoryItems to: ${reportResponse.data.metricOverrides.totalItems}`);
          }
        } else if (reportResponse.data.stockLevelData) {
          // If no metric overrides provided but we have stock data, recalculate the counts
          console.log('No metric overrides found, recalculating from stock data');
          recalculateStockCounts(reportResponse.data.stockLevelData);
        }
      } else {
        // Fall back to mock data if API call fails
        console.warn('Falling back to mock data due to API error');
        // Using mock data for now
        // This would be replaced with API calls to get real data
        const stockLevelData = [          {
            key: '1',
            itemNumber: '10001',
            description: 'Hydraulic Pump - 500PSI',
            currentStock: 5,
            minLevel: 10,
            maxLevel: 50,
            reorderPoint: 15,
            value: 2253.75,
            lastCountDate: '2025-05-25',
            category: 'PUMP',
            stockStatus: determineStockStatus(5, 10, 50)
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
            lastCountDate: '2025-05-25',
            category: 'INSTRUMENT',
            stockStatus: 'normal'
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
            lastCountDate: '2025-05-22',
            category: 'VALVE',
            stockStatus: 'normal'
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
            lastCountDate: '2025-05-23',
            category: 'SEALS',
            stockStatus: 'normal'
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
            lastCountDate: '2025-05-25',
            category: 'ELECTRICAL',
            stockStatus: 'normal'
          },
          {
            key: '6',
            itemNumber: '10212',
            description: 'Motor Controller',
            currentStock: 25,
            minLevel: 10,
            maxLevel: 20,
            reorderPoint: 15,
            value: 5420.25,
            lastCountDate: '2025-05-24',
            category: 'ELECTRICAL',
            stockStatus: 'over'
          },
          {
            key: '7',
            itemNumber: '10254',
            description: 'Circuit Breaker - 30A',
            currentStock: 3,
            minLevel: 5,
            maxLevel: 15,
            reorderPoint: 7,
            value: 765.30,
            lastCountDate: '2025-05-26',
            category: 'ELECTRICAL',
            stockStatus: 'low'
          },
          {
            key: '8',
            itemNumber: '10305',
            description: 'Bearing Assembly - LM25',
            currentStock: 12,
            minLevel: 5,
            maxLevel: 15,
            reorderPoint: 8,
            value: 1875.60,
            lastCountDate: '2025-05-25',
            category: 'MECHANICAL',
            stockStatus: 'normal'
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
            endingBalance: 5,
            category: 'PUMP'
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
            endingBalance: 12,
            category: 'INSTRUMENT'
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
            endingBalance: 4,
            category: 'VALVE'
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
            endingBalance: 8,
            category: 'SEALS'
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
            endingBalance: 2,
            category: 'ELECTRICAL'
          },
          {
            key: '6',
            itemNumber: '10212',
            description: 'Motor Controller',
            receipts: 10,
            issues: 5,
            returns: 0,
            transfers: 0,
            netChange: 5,
            startingBalance: 20,
            endingBalance: 25,
            category: 'ELECTRICAL'
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
            category: 'MECHANICAL',
            itemCount: 10,
            totalValue: 3540.25,
            avgValue: 354.03,
            percentOfTotal: 6.5
          }
        ];

        // Calculate summary metrics
        const totalValue = valuationData.reduce((sum, item) => sum + item.totalValue, 0);
        const totalItems = valuationData.reduce((sum, item) => sum + item.itemCount, 0);
        const lowStock = stockLevelData.filter(item => item.stockStatus === 'low').length;
        const overStock = stockLevelData.filter(item => item.stockStatus === 'over').length;

        setData({ stockLevelData, movementData, valuationData });
        setTotalInventoryValue(totalValue);
        setTotalInventoryItems(totalItems);
        setLowStockCount(lowStock);
        setOverStockCount(overStock);
      }
    } catch (error) {
      console.error('Error loading report data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle date range change
  const handleDateRangeChange = (dates) => {
    if (dates && dates.length === 2) {
      setDateRange(dates);
      // Reload the data with the new date range
      loadReportData();
    }
  };
  // Handle report type change
  const handleReportTypeChange = (value) => {
    setReportType(value);
    setActiveIndex(0); // Reset active index for pie chart
    // Reload data with the new report type
    loadReportData();
    loadTrendData(value); // Also load trend data for the new report type
  };
  
  // Load trend data from API
  const loadTrendData = async (type = reportType) => {
    try {
      console.log(`Loading trend data for ${type} report`);
      const response = await inventoryService.getInventoryTrendData(type);
      console.log('Trend Data API Response:', response);
      
      if (response && response.success) {
        // Use real trend data if available
        console.log('Using REAL trend data from API for', type);
        setTrendData(prev => ({
          ...prev,
          [type]: response.data
        }));
      } else {
        console.warn(`Falling back to mock trend data for ${type} due to API error`);
        // No need to do anything here, as getTrendData will provide mock data
      }
    } catch (error) {
      console.error(`Error loading trend data for ${type}:`, error);
    }
  };
  
  // Handle chart type change
  const handleChartTypeChange = (e) => {
    setChartType(e.target.value);
  };
  
  // Handle export to Excel
  const handleExportExcel = async () => {
    try {
      message.loading({ content: 'Exporting report...', key: 'exportMessage' });
      
      const exportResponse = await inventoryService.exportInventoryReport(
        reportType,
        dateRange[0],
        dateRange[1],
        'excel',
        { chartType }
      );
      
      if (exportResponse.success) {
        message.success({ content: 'Report exported to Excel successfully', key: 'exportMessage' });
      } else {
        message.error({ content: 'Failed to export report', key: 'exportMessage' });
      }
    } catch (error) {
      console.error('Error exporting report:', error);
      message.error({ content: 'Error exporting report', key: 'exportMessage' });
    }
  };
  
  // Handle print report
  const handlePrintReport = () => {
    window.print();
  };
  
  // Custom pie chart active shape
  const renderActiveShape = (props) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle,
      fill, payload, percent, value } = props;
    const sin = Math.sin(-midAngle * Math.PI / 180);
    const cos = Math.cos(-midAngle * Math.PI / 180);
    const sx = cx + (outerRadius + 10) * cos;
    const sy = cy + (outerRadius + 10) * sin;
    const mx = cx + (outerRadius + 30) * cos;
    const my = cy + (outerRadius + 30) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 22;
    const ey = my;
    const textAnchor = cos >= 0 ? 'start' : 'end';
  
    return (
      <g>
        <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill}>
          {payload.category}
        </text>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 6}
          outerRadius={outerRadius + 10}
          fill={fill}
        />
        <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
        <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333">
          {`$${value.toLocaleString()}`}
        </text>
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999">
          {`(${(percent * 100).toFixed(2)}%)`}
        </text>
      </g>
    );
  };  // Render UNSPSC category chart for the Trends tab
  const renderUnspscCategoryChart = () => {
    if (unspscDataLoading) {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
          <Spin size="large" tip="Loading UNSPSC category data..." />
        </div>
      );
    }
    
    if (!unspscCategoryData || unspscCategoryData.length === 0) {
      return (
        <Alert
          message="No UNSPSC Category Data"
          description="No inventory items with UNSPSC codes found. Please assign UNSPSC codes to your item masters to see this chart."
          type="info"
          showIcon
        />
      );
    }
    
    // Sort data by value in descending order for better visualization
    const sortedData = [...unspscCategoryData].sort((a, b) => b.value - a.value);
      // Add colors to each category
    const dataWithColors = sortedData.map((item, index) => ({
      ...item,
      fill: COLORS[index % COLORS.length],
      key: item.code // Ensure each item has a key
    }));
    
    // Calculate total values for selected categories
    const selectedData = dataWithColors.filter(item => selectedCategories.includes(item.code));
    const totalItemCount = selectedData.reduce((sum, item) => sum + item.itemCount, 0);
    const totalStockValue = selectedData.reduce((sum, item) => sum + item.value, 0);
    const percentOfAllItems = totalItemCount / dataWithColors.reduce((sum, item) => sum + item.itemCount, 0) * 100;
    
    // Filter data based on selected categories
    const chartData = selectedData;
    
    // Group categories by first two digits of UNSPSC code
    const groupedBySegment = {};
    dataWithColors.forEach(item => {
      const segmentCode = item.code.substring(0, 2);
      if (!groupedBySegment[segmentCode]) {
        groupedBySegment[segmentCode] = [];
      }
      groupedBySegment[segmentCode].push(item);
    });    // Handle row selection in the table
    const rowSelection = {
      selectedRowKeys: selectedCategories,
      onChange: (selectedRowKeys) => {
        setSelectedCategories(selectedRowKeys);
      },
    };
    
    // Get column search props
    const getColumnSearchProps = dataIndex => ({
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div className="category-filter-dropdown" style={{ padding: 8 }}>
          <Input
            ref={searchInput}
            placeholder={`Search ${dataIndex}`}
            value={selectedKeys[0]}
            onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => handleUnspscSearch(selectedKeys, confirm, dataIndex)}
            style={{ width: 188, marginBottom: 8, display: 'block' }}
          />
          <Space>
            <Button
              type="primary"
              onClick={() => handleUnspscSearch(selectedKeys, confirm, dataIndex)}
              icon={<SearchOutlined />}
              size="small"
              style={{ width: 90 }}
            >
              Search
            </Button>
            <Button
              onClick={() => handleUnspscSearchReset(clearFilters)}
              size="small"
              style={{ width: 90 }}
            >
              Reset
            </Button>
          </Space>
        </div>
      ),
      filterIcon: filtered => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
      onFilter: (value, record) => {
        return record[dataIndex]
          ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase())
          : ''
      },
      onFilterDropdownVisibleChange: visible => {
        if (visible) {
          setTimeout(() => searchInput.current?.select(), 100);
        }
      },      render: text => 
        searchedColumn === dataIndex ? (
          <span style={{ 
            fontWeight: searchedColumn === dataIndex ? 'bold' : 'normal' 
          }}>
            {text}
          </span>
        ) : text,
    });
    
    return (
      <div>
        <div style={{ marginBottom: 16 }}>
          <Alert
            message={translate('UNSPSC Category Analysis')}
            description={
              <>
                {translate('This chart displays inventory stock levels grouped by UNSPSC categories. Use the table below to select which categories to include in the visualization.')}
                <br />
                <strong>{translate('Tip:')}</strong> {translate('UNSPSC (United Nations Standard Products and Services Code) is a hierarchical classification system for products and services. The first two digits represent the segment, the next two the family, etc.')}
              </>
            }
            type="info"
            showIcon
          />
        </div>
        
        {selectedData.length > 0 && (
          <div className="selected-summary">
            <Row gutter={16}>
              <Col xs={24} sm={8}>
                <Statistic 
                  title={translate('Selected Categories')} 
                  value={selectedData.length} 
                  suffix={`/ ${dataWithColors.length}`}
                />
              </Col>
              <Col xs={24} sm={8}>
                <Statistic 
                  title={translate('Total Items')} 
                  value={totalItemCount}
                  suffix={`(${percentOfAllItems.toFixed(1)}%)`}
                />
              </Col>
              <Col xs={24} sm={8}>
                <Statistic 
                  title={translate('Total Stock')} 
                  value={totalStockValue.toFixed(2)}
                  precision={2}
                />
              </Col>
            </Row>
          </div>
        )}
        
        <Row gutter={16}>
          <Col xs={24} lg={14}>
            <div style={{ height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 70 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 11 }} 
                    height={70} 
                    interval={0} 
                    angle={-45} 
                    textAnchor="end" 
                  />
                  <YAxis />
                  <Tooltip
                    formatter={(value, name, props) => [`${value.toFixed(2)} units`, props.payload.name]}
                    labelFormatter={(label) => `Category: ${label}`}
                  />
                  <Legend verticalAlign="top" height={36} />
                  <Bar dataKey="value" name="Current Stock">
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Col>
          <Col xs={24} lg={10}>
            <div style={{ height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    activeIndex={activeIndex}
                    activeShape={renderActiveShape}
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    onMouseEnter={onPieEnter}
                    labelLine={false}
                    label={({ name, percent }) => 
                      chartData.length <= 10 ? `${name} (${(percent * 100).toFixed(0)}%)` : ''
                    }
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value.toFixed(2)} units`, 'Stock']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Col>
        </Row>
        
        <div style={{ marginTop: 20 }}>
          <div className="unspsc-category-toolbar">
            <Space wrap>
              <Button 
                onClick={() => setSelectedCategories(dataWithColors.map(item => item.code))}
                type="default"
                size="small"
                icon={<FilterOutlined />}
              >
                {translate('Select All')}
              </Button>
              <Button 
                onClick={() => setSelectedCategories([])}
                type="default"
                size="small"
              >
                {translate('Clear All')}
              </Button>
              <Button
                onClick={() => {
                  const topCategories = dataWithColors.slice(0, 5).map(item => item.code);
                  setSelectedCategories(topCategories);
                }}
                type="default"
                size="small"
              >
                {translate('Top 5 by Stock')}
              </Button>              <Select
                placeholder={translate('Select by Segment')}
                style={{ width: 180 }}
                onChange={(value) => handleSelectUnspscByPrefix(value)}
                allowClear
              >
                {Object.keys(groupedBySegment).sort().map(segmentCode => {
                  const count = groupedBySegment[segmentCode].length;
                  // Get name of first item as representative for the segment
                  const segmentName = groupedBySegment[segmentCode][0]?.name.split(' ')[0] || '';
                  return (
                    <Option key={segmentCode} value={segmentCode}>
                      {segmentCode} - {segmentName} ({count})
                    </Option>
                  );
                })}
              </Select>
            </Space>
            
            <Text type="secondary">
              <strong>{selectedCategories.length}</strong> {translate('of')} <strong>{dataWithColors.length}</strong> {translate('categories selected')}
            </Text>
          </div>
          
          <Table
            size="small"
            dataSource={dataWithColors}
            rowKey="code"
            rowSelection={{
              ...rowSelection,
              selections: [
                Table.SELECTION_ALL,
                Table.SELECTION_INVERT,
                {
                  key: 'top-5',
                  text: translate('Select Top 5 by Stock'),
                  onSelect: () => {
                    const top5 = dataWithColors.slice(0, 5).map(item => item.code);
                    setSelectedCategories(top5);
                  }
                },
                {
                  key: 'top-10',
                  text: translate('Select Top 10 by Stock'),
                  onSelect: () => {
                    const top10 = dataWithColors.slice(0, 10).map(item => item.code);
                    setSelectedCategories(top10);
                  }
                }
              ],
              columnWidth: 60
            }}
            pagination={{ 
              pageSize: 10,
              showSizeChanger: true,
              pageSizeOptions: ['5', '10', '20', '50'],
              showTotal: (total, range) => `${range[0]}-${range[1]} ${translate('of')} ${total} ${translate('items')}`
            }}
            bordered
            className="unspsc-table"
            scroll={{ y: 300, x: 800 }}
            columns={[
              {
                title: translate('UNSPSC Code'),
                dataIndex: 'code',
                key: 'code',
                width: 130,
                fixed: 'left',
                sorter: (a, b) => a.code.localeCompare(b.code),
                ...getColumnSearchProps('code'),
                render: (code) => (
                  <span style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{code}</span>
                )
              },
              {
                title: translate('Category'),
                dataIndex: 'name',
                key: 'name',
                ellipsis: true,
                sorter: (a, b) => a.name.localeCompare(b.name),
                ...getColumnSearchProps('name'),
                render: (name, record) => (
                  <div>
                    <div>{name}</div>
                    {record.description && (
                      <div style={{ fontSize: '0.85em', color: '#888' }}>
                        {record.description}
                      </div>
                    )}
                  </div>
                )
              },
              {
                title: translate('Items Count'),
                dataIndex: 'itemCount',
                key: 'itemCount',
                width: 120,
                sorter: (a, b) => a.itemCount - b.itemCount,
                render: (value) => (
                  <span style={{ fontWeight: 'bold' }}>{value}</span>
                ),
              },
              {
                title: translate('Total Stock'),
                dataIndex: 'value',
                key: 'value',
                width: 120,
                sorter: (a, b) => a.value - b.value,
                render: (value) => <span style={{ fontWeight: 'bold' }}>{value.toFixed(2)}</span>,
              },
              {
                title: translate('Avg Stock/Item'),
                dataIndex: 'avgPerItem',
                key: 'avgPerItem',
                width: 150,
                sorter: (a, b) => (a.value / a.itemCount) - (b.value / b.itemCount),
                render: (_, record) => {
                  const avg = record.itemCount > 0 ? record.value / record.itemCount : 0;
                  return <span>{avg.toFixed(2)}</span>;
                }
              },
              {
                title: translate('Chart Color'),
                dataIndex: 'fill',
                key: 'fill',
                width: 110,
                render: (fill, record) => (
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{ 
                      width: 24, 
                      height: 24, 
                      backgroundColor: fill, 
                      borderRadius: '50%',
                      border: '1px solid #ddd',
                      marginRight: 8
                    }} />
                    {selectedCategories.includes(record.code) && (
                      <div style={{ fontSize: '0.85em' }}>
                        {translate('Visible')}
                      </div>
                    )}
                  </div>
                ),
              }
            ]}
            summary={() => {
              // Only show summary when there are selected categories
              if (selectedCategories.length === 0) return null;
              
              return (
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={2}>
                    <strong>{translate('Selected Categories Total')}</strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={2}>
                    <strong>{totalItemCount}</strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={3}>
                    <strong>{totalStockValue.toFixed(2)}</strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={4}>
                    <strong>{(totalStockValue / totalItemCount).toFixed(2)}</strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={5}></Table.Summary.Cell>
                </Table.Summary.Row>
              );
            }}
            onRow={(record) => ({
              onClick: () => {
                const newSelectedCategories = [...selectedCategories];
                const index = newSelectedCategories.indexOf(record.code);
                if (index >= 0) {
                  newSelectedCategories.splice(index, 1);
                } else {
                  newSelectedCategories.push(record.code);
                }
                setSelectedCategories(newSelectedCategories);
              },
              style: { cursor: 'pointer' }
            })}
          />
          
          <div style={{ marginTop: 16, textAlign: 'center' }}>
            <Text type="secondary" style={{ fontStyle: 'italic' }}>
              {translate('Tip: Click on any row to toggle selection, or use the checkboxes for multi-select')}
            </Text>
          </div>
        </div>
      </div>
    );
  };

  // Handle pie chart hover
  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };

  // Column definitions for different report types
  const stockLevelColumns = [
    {
      title: translate('Item Number'),
      dataIndex: 'itemNumber',
      key: 'itemNumber',
      sorter: (a, b) => a.itemNumber.localeCompare(b.itemNumber),
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
      sorter: (a, b) => a.currentStock - b.currentStock,      render: (text, record) => {
        // First use existing stockStatus if available
        // Otherwise, explicitly determine based on proper comparison
        const status = record.stockStatus || 
          (Number(record.currentStock) < Number(record.minLevel) ? 'low' : 
           Number(record.currentStock) >= Number(record.maxLevel) ? 'over' : 'normal');
        
        const colors = {
          low: '#f5222d',
          normal: '#52c41a',
          over: '#faad14'
        };
        
        return (
          <span style={{ color: colors[status], fontWeight: status !== 'normal' ? 'bold' : 'normal' }}>
            {text}
          </span>
        );
      }
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
        { text: 'ELECTRICAL', value: 'ELECTRICAL' },
        { text: 'MECHANICAL', value: 'MECHANICAL' }
      ],
      onFilter: (value, record) => record.category === value,
    },
  ];
  
  const movementColumns = [
    {
      title: translate('Item Number'),
      dataIndex: 'itemNumber',
      key: 'itemNumber',
      sorter: (a, b) => a.itemNumber.localeCompare(b.itemNumber),
    },
    {
      title: translate('Description'),
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
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
      onFilter: (value, record) => record.category === value,
    },
    {
      title: translate('Starting'),
      dataIndex: 'startingBalance',
      key: 'startingBalance',
      sorter: (a, b) => a.startingBalance - b.startingBalance,
    },
    {
      title: translate('Receipts'),
      dataIndex: 'receipts',
      key: 'receipts',
      sorter: (a, b) => a.receipts - b.receipts,
    },
    {
      title: translate('Issues'),
      dataIndex: 'issues',
      key: 'issues',
      sorter: (a, b) => a.issues - b.issues,
    },
    {
      title: translate('Returns'),
      dataIndex: 'returns',
      key: 'returns',
      sorter: (a, b) => a.returns - b.returns,
    },
    {
      title: translate('Transfers'),
      dataIndex: 'transfers',
      key: 'transfers',
      sorter: (a, b) => a.transfers - b.transfers,
    },
    {
      title: translate('Net Change'),
      dataIndex: 'netChange',
      key: 'netChange',
      sorter: (a, b) => a.netChange - b.netChange,
      render: (value) => (
        <span style={{ 
          color: value < 0 ? '#f5222d' : value > 0 ? '#52c41a' : 'inherit',
          fontWeight: value !== 0 ? 'bold' : 'normal'
        }}>
          {value > 0 ? `+${value}` : value}
        </span>
      ),
    },
    {
      title: translate('Ending'),
      dataIndex: 'endingBalance',
      key: 'endingBalance',
      sorter: (a, b) => a.endingBalance - b.endingBalance,
    },
  ];
  
  const valuationColumns = [
    {
      title: translate('Category'),
      dataIndex: 'category',
      key: 'category',
      sorter: (a, b) => a.category.localeCompare(b.category),
    },
    {
      title: translate('Item Count'),
      dataIndex: 'itemCount',
      key: 'itemCount',
      sorter: (a, b) => a.itemCount - b.itemCount,
    },
    {
      title: translate('Total Value'),
      dataIndex: 'totalValue',
      key: 'totalValue',
      render: (value) => `$${value.toFixed(2)}`,
      sorter: (a, b) => a.totalValue - b.totalValue,
    },
    {
      title: translate('Avg Value'),
      dataIndex: 'avgValue',
      key: 'avgValue',
      render: (value) => `$${value.toFixed(2)}`,
      sorter: (a, b) => a.avgValue - b.avgValue,
    },
    {
      title: translate('% of Total'),
      dataIndex: 'percentOfTotal',
      key: 'percentOfTotal',
      render: (value) => `${value}%`,
      sorter: (a, b) => a.percentOfTotal - b.percentOfTotal,
    },
  ];

  // Prepare chart data
  const getChartData = () => {
    switch (reportType) {
      case 'stockLevel':
        // Group by category for stock level chart
        const stockByCategory = data.stockLevelData.reduce((acc, item) => {
          const category = acc.find(cat => cat.category === item.category);
          if (category) {
            category.totalItems += 1;
            category.totalStock += item.currentStock;
            category.totalValue += item.value;
          } else {
            acc.push({
              category: item.category,
              totalItems: 1,
              totalStock: item.currentStock,
              totalValue: item.value
            });
          }
          return acc;
        }, []);
        
        // Stock status distribution
        const stockStatusData = [
          { name: 'Low Stock', value: lowStockCount, color: '#f5222d' },
          { name: 'Normal', value: data.stockLevelData.length - lowStockCount - overStockCount, color: '#52c41a' },
          { name: 'Overstock', value: overStockCount, color: '#faad14' }
        ].filter(item => item.value > 0);
        
        return { stockByCategory, stockStatusData };
        
      case 'movement':
        // Prepare movement chart data - sum by category
        const movementByCategory = data.movementData.reduce((acc, item) => {
          const category = acc.find(cat => cat.category === item.category);
          if (category) {
            category.receipts += item.receipts;
            category.issues += item.issues;
            category.returns += item.returns;
            category.transfers += item.transfers;
          } else {
            acc.push({
              category: item.category,
              receipts: item.receipts,
              issues: item.issues,
              returns: item.returns,
              transfers: item.transfers
            });
          }
          return acc;
        }, []);
        
        // Transaction type breakdown
        const transactionData = data.movementData.reduce((acc, item) => {
          acc.receipts += item.receipts;
          acc.issues += item.issues;
          acc.returns += item.returns;
          acc.transfers += item.transfers;
          return acc;
        }, { receipts: 0, issues: 0, returns: 0, transfers: 0 });
        
        // Convert to array format for pie chart
        const transactionTypes = [
          { name: 'Receipts', value: transactionData.receipts, color: '#52c41a' },
          { name: 'Issues', value: transactionData.issues, color: '#f5222d' },
          { name: 'Returns', value: transactionData.returns, color: '#1890ff' },
          { name: 'Transfers', value: transactionData.transfers, color: '#722ed1' }
        ].filter(item => item.value > 0);
        
        return { movementByCategory, transactionTypes };
        
      case 'valuation':
        return { 
          valuationData: data.valuationData.sort((a, b) => b.totalValue - a.totalValue)
        };
        
      default:
        return {};    }
  };
  
  // Prepare trend data (fetch from API with fallback to mock data)
  const getTrendData = () => {
    // If we have real data from the API for this report type, use it
    console.log('Current trendData state:', trendData);
    if (trendData[reportType] && trendData[reportType].length > 0) {
      console.log('Using REAL trend data from state for', reportType);
      return trendData[reportType];
    }
    
    // Otherwise fall back to mock data
    console.log('Using MOCK trend data for', reportType);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    
    switch (reportType) {
      case 'stockLevel':
        return [
          {
            name: 'PUMP',
            data: [5, 6, 4, 8, 7, 5],
            months
          },
          {
            name: 'VALVE',
            data: [3, 4, 5, 4, 6, 4],
            months
          },
          {
            name: 'ELECTRICAL',
            data: [7, 8, 9, 8, 10, 25],
            months
          },        {
            name: 'INSTRUMENT',
            data: [10, 9, 8, 9, 12, 12],
            months
          }
        ];
        
      case 'movement':
        return [
          {
            name: 'Receipts',
            data: [12, 15, 10, 18, 20, 22],
            months
          },
          {
            name: 'Issues',
            data: [8, 10, 12, 15, 16, 18],
            months
          },
          {
            name: 'Returns',
            data: [2, 3, 1, 4, 2, 3],
            months
          }
        ];
        
      case 'valuation':
        return [
          {
            name: 'Total Value',
            data: [45000, 47000, 48000, 51000, 53000, 54000],
            months
          },
          {
            name: 'Average Value',
            data: [420, 425, 435, 450, 470, 480],
            months
          }
        ];
        
      default:
        return [];
    }
  };
  // Render the appropriate chart based on the report and chart types
  const renderChart = () => {
    const chartData = getChartData();
    
    switch (reportType) {
      case 'stockLevel':
        if (chartType === 'bar') {
          return (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={chartData.stockByCategory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip formatter={(value) => value.toLocaleString()} />
                <Legend />
                <Bar dataKey="totalStock" name="Total Stock" fill="#1890ff" />
                <Bar dataKey="totalItems" name="Number of Items" fill="#52c41a" />
              </BarChart>
            </ResponsiveContainer>
          );
        } else if (chartType === 'pie') {
          return (
            <Row gutter={16}>
              <Col span={12}>
                <div style={{ textAlign: 'center' }}>
                  <Title level={5}>{translate('Stock Level by Category')}</Title>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        activeIndex={activeIndex}
                        activeShape={renderActiveShape}
                        data={chartData.stockByCategory}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="totalStock"
                        nameKey="category"
                        onMouseEnter={onPieEnter}
                      >
                        {chartData.stockByCategory.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </Col>
              <Col span={12}>
                <div style={{ textAlign: 'center' }}>
                  <Title level={5}>{translate('Stock Status Distribution')}</Title>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={chartData.stockStatusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {chartData.stockStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => value.toLocaleString()} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </Col>
            </Row>
          );
        } else if (chartType === 'line') {
          // For line charts, we'd ideally have time-series data
          // This is a simplified example
          return (
            <Alert
              message={translate('Trend Data Required')}
              description={translate('Line charts require time-series data. Please select Bar or Pie chart for this report type.')}
              type="info"
              showIcon
            />
          );
        }
        break;
        
      case 'movement':
        if (chartType === 'bar') {
          return (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={chartData.movementByCategory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip formatter={(value) => value.toLocaleString()} />
                <Legend />
                <Bar dataKey="receipts" name="Receipts" fill="#52c41a" />
                <Bar dataKey="issues" name="Issues" fill="#f5222d" />
                <Bar dataKey="returns" name="Returns" fill="#1890ff" />
                <Bar dataKey="transfers" name="Transfers" fill="#722ed1" />
              </BarChart>
            </ResponsiveContainer>
          );
        } else if (chartType === 'pie') {
          return (
            <Row gutter={16}>
              <Col span={24}>
                <div style={{ textAlign: 'center' }}>
                  <Title level={5}>{translate('Transaction Type Distribution')}</Title>
                  <ResponsiveContainer width="100%" height={350}>
                    <PieChart>
                      <Pie
                        activeIndex={activeIndex}
                        activeShape={renderActiveShape}
                        data={chartData.transactionTypes}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={90}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        onMouseEnter={onPieEnter}
                      >
                        {chartData.transactionTypes.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </Col>
            </Row>
          );
        } else if (chartType === 'line') {
          // For line charts, we'd ideally have time-series data
          // This is a simplified example
          return (
            <Alert
              message={translate('Trend Data Required')}
              description={translate('Line charts require time-series data. Please select Bar or Pie chart for this report type.')}
              type="info"
              showIcon
            />
          );
        }
        break;
        
      case 'valuation':
        if (chartType === 'bar') {
          return (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={chartData.valuationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                <Tooltip formatter={(value, name) => name === 'Total Value' ? `$${value.toLocaleString()}` : value} />
                <Legend />
                <Bar yAxisId="left" dataKey="totalValue" name="Total Value" fill="#8884d8" />
                <Bar yAxisId="right" dataKey="itemCount" name="Item Count" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          );
        } else if (chartType === 'pie') {
          return (
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  activeIndex={activeIndex}
                  activeShape={renderActiveShape}
                  data={chartData.valuationData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="totalValue"
                  nameKey="category"
                  onMouseEnter={onPieEnter}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                  labelLine={false}
                >
                  {chartData.valuationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          );
        } else if (chartType === 'line') {
          const trendData = getTrendData();
          
          if (trendData.length > 0) {
            return (
              <ResponsiveContainer width="100%" height={400}>
                <LineChart>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="month" 
                    type="category"
                    allowDuplicatedCategory={false}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {trendData.map(s => (
                    <Line 
                      dataKey="value"
                      data={s.data.map((value, index) => ({
                        month: s.months[index],
                        value: value
                      }))}
                      name={s.name}
                      key={s.name}
                      stroke={COLORS[trendData.indexOf(s) % COLORS.length]}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            );
          } else {
            return (
              <Alert
                message={translate('Trend Data Required')}
                description={translate('Line charts require time-series data. Please select Bar or Pie chart for this report type.')}
                type="info"
                showIcon
              />
            );
          }
        }
        break;
    }
    
    return (
      <div style={{ textAlign: 'center', padding: '40px 0' }}>
        <Title level={4}>{translate('No Chart Available')}</Title>
        <p>{translate('Please select a different report or chart type.')}</p>
      </div>
    );
  };

  // Utility function to recalculate low stock and overstock counts
  const recalculateStockCounts = (stockData) => {
    console.log('Recalculating stock counts from raw data');
    if (!stockData || !Array.isArray(stockData)) {
      console.warn('Cannot recalculate stock counts: Invalid stock data', stockData);
      return;
    }
    
    // Use explicit Number conversion to ensure proper comparison
    const lowStock = stockData.filter(item => 
      Number(item.currentStock) < Number(item.minLevel)
    ).length;
    
    const overStock = stockData.filter(item => 
      Number(item.currentStock) >= Number(item.maxLevel)
    ).length;
    
    console.log(`Recalculated stock counts: Low stock: ${lowStock}, Over stock: ${overStock}`);
    
    // Update state with recalculated counts
    setLowStockCount(lowStock);
    setOverStockCount(overStock);
    
    return { lowStock, overStock };
  };
  
  // Debug function to print details about the current stock levels and status
  const debugStockLevels = () => {
    if (!data || !data.stockLevelData) {
      console.log('No stock level data to debug');
      return;
    }

    console.table(
      data.stockLevelData.map(item => ({
        itemNumber: item.itemNumber,
        description: item.description,
        currentStock: `${item.currentStock} (${typeof item.currentStock})`,
        minLevel: `${item.minLevel} (${typeof item.minLevel})`,
        maxLevel: `${item.maxLevel} (${typeof item.maxLevel})`,
        stockStatus: item.stockStatus,
        isLowStock: Number(item.currentStock) < Number(item.minLevel) ? 'YES' : 'NO',
        isOverStock: Number(item.currentStock) >= Number(item.maxLevel) ? 'YES' : 'NO'
      }))
    );

    console.log('Current metrics:', {
      lowStockCount,
      overStockCount,
      totalInventoryItems
    });
  };

  // Call debug function when report data changes
  useEffect(() => {
    if (data.stockLevelData && data.stockLevelData.length > 0) {
      console.log('Stock level data loaded - running debug check');
      debugStockLevels();
    }
  }, [data.stockLevelData]);
  
  // Render the component
  return (
    <ErpLayout>
      <style>{unspscTableStyles}</style>
      <Card 
        title={<Title level={2}>{translate('Enhanced Inventory Reporting')}</Title>}
        extra={
          <Button 
            type="primary"
            icon={<ReloadOutlined />}
            onClick={() => {
              loadReportData();
              loadTrendData();
              loadUnspscCategoryData();
              message.success(translate('Data refreshed'));
            }}
          >
            {translate('Refresh Data')}
          </Button>
        }
      >
        <Spin spinning={loading}>
          {/* KPI Cards */}
          <Row gutter={16} className="dashboard-stats">
            <Col xs={24} sm={12} md={6}>
              <Card className="stats-card" style={{ background: '#e6f7ff', marginBottom: 16 }}>
                <Statistic
                  title={translate('Total Inventory Value')}
                  value={totalInventoryValue}
                  precision={2}
                  prefix="$"
                  valueStyle={{ color: '#0050b3' }}
                  suffix=""
                />
                <div>
                  <DollarOutlined style={{ fontSize: 24, color: '#0050b3' }} />
                  <span style={{ marginLeft: 8 }}>{totalInventoryItems} {translate('Total Items')}</span>
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card className="stats-card" style={{ background: '#fff2e8', marginBottom: 16 }}>
                <Statistic
                  title={translate('Low Stock Items')}
                  value={lowStockCount}
                  valueStyle={{ color: '#d4380d' }}
                  suffix={`/ ${totalInventoryItems}`}
                />                <div>
                  <WarningOutlined style={{ fontSize: 24, color: '#d4380d' }} />
                  {lowStockCount > 0 ? (
                    <span style={{ marginLeft: 8 }}>{translate('Require Attention')}</span>
                  ) : (
                    <span style={{ marginLeft: 8 }}>{translate('Stock Levels OK')}</span>
                  )}
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card className="stats-card" style={{ background: '#fcffe6', marginBottom: 16 }}>
                <Statistic
                  title={translate('Overstock Items')}
                  value={overStockCount}
                  valueStyle={{ color: '#7cb305' }}
                  suffix={`/ ${totalInventoryItems}`}
                />                <div>
                  <WarningOutlined style={{ fontSize: 24, color: '#7cb305' }} />
                  {overStockCount > 0 ? (
                    <span style={{ marginLeft: 8 }}>{translate('Excess Inventory')}</span>
                  ) : (
                    <span style={{ marginLeft: 8 }}>{translate('Inventory Levels OK')}</span>
                  )}
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card className="stats-card" style={{ background: '#f9f0ff', marginBottom: 16 }}>
                <Statistic
                  title={translate('Average Item Value')}
                  value={(totalInventoryValue / (totalInventoryItems || 1)).toFixed(2)}
                  precision={2}
                  prefix="$"
                  valueStyle={{ color: '#531dab' }}
                />
                <div>
                  <DollarOutlined style={{ fontSize: 24, color: '#531dab' }} />
                  <span style={{ marginLeft: 8 }}>{translate('Per Inventory Item')}</span>
                </div>
              </Card>
            </Col>
          </Row>

          {/* Filter controls */}
          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col xs={24} sm={12} md={6}>
              <label>{translate('Report Type')}</label>
              <Select 
                style={{ width: '100%' }} 
                value={reportType} 
                onChange={handleReportTypeChange}
              >
                <Option value="stockLevel">{translate('Stock Levels')}</Option>
                <Option value="movement">{translate('Inventory Movement')}</Option>
                <Option value="valuation">{translate('Inventory Valuation')}</Option>
              </Select>
            </Col>
            <Col xs={24} sm={12} md={10}>
              <label>{translate('Date Range')}</label>
              <RangePicker 
                style={{ width: '100%' }} 
                value={dateRange}
                onChange={handleDateRangeChange}
              />
            </Col>
            <Col xs={24} md={8}>
              <div style={{ marginTop: 24, textAlign: 'right' }}>
                <Space>
                  <Button
                    type="primary"
                    onClick={handleExportExcel}
                    icon={<DownloadOutlined />}
                  >
                    {translate('Export to Excel')}
                  </Button>
                  <Button
                    onClick={handlePrintReport}
                    icon={<PrinterOutlined />}
                  >
                    {translate('Print')}
                  </Button>
                </Space>
              </div>
            </Col>
          </Row>          <Tabs defaultActiveKey="chart"
            items={[
              {
                key: "chart",
                label: <span><BarChartOutlined /> {translate('Charts')}</span>,
                children: (
                  <>
                    <div style={{ marginBottom: 16 }}>
                      <Radio.Group value={chartType} onChange={handleChartTypeChange}>
                        <Radio.Button value="bar">{translate('Bar Chart')}</Radio.Button>
                        <Radio.Button value="pie">{translate('Pie Chart')}</Radio.Button>
                        <Radio.Button value="line">{translate('Line Chart')}</Radio.Button>
                      </Radio.Group>
                    </div>
                    
                    <div className="chart-container" style={{ minHeight: 400, backgroundColor: '#fafafa', padding: 16, borderRadius: 8 }}>
                      {renderChart()}
                    </div>
                  </>
                )
              },              {
                key: "table",
                label: <span><BarChartOutlined /> {translate('Table')}</span>,
                children: (
                  <Table
                    columns={
                      reportType === 'stockLevel' ? stockLevelColumns :
                      reportType === 'movement' ? movementColumns :
                      valuationColumns
                    }
                    dataSource={
                      reportType === 'stockLevel' ? data.stockLevelData :
                      reportType === 'movement' ? data.movementData :
                      data.valuationData
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
                )              },
              {
                key: "trends",
                label: <span><LineChartOutlined /> {translate('Trends')}</span>,
                children: (
                  <>
                    <div className="chart-container" style={{ minHeight: 400, backgroundColor: '#fafafa', padding: 16, borderRadius: 8, marginBottom: 20 }}>
                      <h3>{translate('Inventory Trends Over Time')}</h3>
                      <ResponsiveContainer width="100%" height={400}>
                        <LineChart>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="month" 
                            type="category"
                            allowDuplicatedCategory={false}
                          />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          {getTrendData().map(s => (
                            <Line 
                              dataKey="value"
                              data={s.data.map((value, index) => ({
                                month: s.months[index],
                                value: value
                              }))}
                              name={s.name}
                              key={s.name}
                              stroke={COLORS[getTrendData().indexOf(s) % COLORS.length]}
                            />
                          ))}
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    
                    <div className="chart-container" style={{ minHeight: 400, backgroundColor: '#fafafa', padding: 16, borderRadius: 8 }}>
                      <h3>{translate('Inventory by UNSPSC Category')}</h3>
                      {renderUnspscCategoryChart()}
                    </div>
                  </>
                )
              }
            ]}
          />
        </Spin>
      </Card>
    </ErpLayout>
  );
}
