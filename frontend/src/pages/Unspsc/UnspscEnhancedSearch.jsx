import React, { useState, useEffect } from 'react';
import { 
  Input, Button, Card, List, Tag, Space, Typography, Spin, 
  message, Divider, Tabs, Badge, Table, Tooltip, Modal, Empty, App
} from 'antd';
import { 
  SearchOutlined, StarOutlined, StarFilled, InfoCircleOutlined,
  ArrowLeftOutlined, PlusOutlined, LoadingOutlined
} from '@ant-design/icons';
import axios from 'axios';
import { API_BASE_URL } from '@/config/serverApiConfig';
import { ErpLayout } from '@/layout';
import { useLocation, useNavigate } from 'react-router-dom';

const { Text, Title, Paragraph } = Typography;
const { Search } = Input;

const UnspscEnhancedSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [selectedCode, setSelectedCode] = useState(null);
  const [codeDetails, setCodeDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('search');
  const [detailsVisible, setDetailsVisible] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();

  // Fetch favorites on initial load
  useEffect(() => {
    fetchFavorites();
    
    // Check if a code was passed in the URL
    const params = new URLSearchParams(location.search);
    const codeFromUrl = params.get('code');
    
    if (codeFromUrl && /^\d{8}$/.test(codeFromUrl)) {
      setSelectedCode(codeFromUrl);
      fetchCodeDetails(codeFromUrl);
      setDetailsVisible(true);
    }
  }, [location.search]);  const fetchFavorites = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/unspsc/favorites`);
      if (response.data && response.data.success) {
        setFavorites(response.data.favorites);
      } else {
        message.error('Failed to fetch favorites');
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
      message.error('Error fetching favorites');
    }
  };

  const handleSearch = async () => {
    if (!searchQuery || searchQuery.trim() === '') {
      message.warning('Please enter a search term');
      return;
    }

    setLoading(true);    try {
      const response = await axios.post(`${API_BASE_URL}/unspsc/search`, { query: searchQuery });
      if (response.data && response.data.success) {
        setSearchResults(response.data.results);
        if (response.data.results.length === 0) {
          message.info('No results found for your search');
        }
      } else {
        message.error(response.data?.message || 'Search failed');
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Error searching UNSPSC codes:', error);
      message.error('Error searching UNSPSC codes');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToFavorites = async (code) => {
    try {
      const codeToAdd = code || selectedCode;
      if (!codeToAdd) {
        message.error('No UNSPSC code selected');
        return;
      }

      // Find the code details in search results
      const codeData = searchResults.find(result => result.unspscCode === codeToAdd) || codeDetails;
      if (!codeData) {
        message.error('Code details not found');
        return;
      }

      const payload = {
        unspscCode: codeData.unspscCode,
        title: codeData.fullTitle || codeData.commodity?.title || 'Unknown',
        description: codeData.explanation || codeData.description || ''
      };

      const response = await axios.post(`${API_BASE_URL}/unspsc/favorites`, payload);
      if (response.data && response.data.success) {
        message.success('Added to favorites');
        fetchFavorites();
      } else {
        message.error(response.data?.message || 'Failed to add to favorites');
      }
    } catch (error) {
      console.error('Error adding to favorites:', error);
      message.error('Error adding to favorites');
    }
  };

  const handleRemoveFromFavorites = async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/unspsc/favorites/${id}`);
      if (response.data && response.data.success) {
        message.success('Removed from favorites');
        fetchFavorites();
      } else {
        message.error(response.data?.message || 'Failed to remove from favorites');
      }
    } catch (error) {
      console.error('Error removing from favorites:', error);
      message.error('Error removing from favorites');
    }
  };

  const fetchCodeDetails = async (code) => {
    setDetailsLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/unspsc/details/${code}`);
      if (response.data && response.data.success) {
        setCodeDetails(response.data.result);
        setSelectedCode(code);
        setDetailsVisible(true);
      } else {
        message.error(response.data?.message || 'Failed to fetch code details');
      }
    } catch (error) {
      console.error('Error fetching code details:', error);
      message.error('Error fetching code details');
    } finally {
      setDetailsLoading(false);
    }
  };

  const isCodeInFavorites = (code) => {
    return favorites.some(fav => fav.unspscCode === code);
  };

  // Function to copy UNSPSC code to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => message.success(`Copied ${text} to clipboard`))
      .catch(err => {
        console.error('Failed to copy:', err);
        message.error('Failed to copy to clipboard');
      });
  };

  const renderHierarchyDetails = () => {
    if (!codeDetails) return null;    const columns = [
      {
        title: 'Level',
        dataIndex: 'level',
        key: 'level',
        width: 100,
      },
      {
        title: 'Code',
        dataIndex: 'code',
        key: 'code',
        width: 100,
        render: (text) => (
          <Tag color="blue" style={{ cursor: 'pointer' }} onClick={() => copyToClipboard(text)}>
            {text}
          </Tag>
        ),
      },
      {
        title: 'Title',
        dataIndex: 'title',
        key: 'title',
      },
    ];

    const data = [
      {
        key: '1',
        level: 'Segment',
        code: codeDetails.segment.code,
        title: codeDetails.segment.title,
      },
      {
        key: '2',
        level: 'Family',
        code: codeDetails.family.code,
        title: codeDetails.family.title,
      },
      {
        key: '3',
        level: 'Class',
        code: codeDetails.class.code,
        title: codeDetails.class.title,
      },
      {
        key: '4',
        level: 'Commodity',
        code: codeDetails.commodity.code,
        title: codeDetails.commodity.title,
      },
    ];

    return (
      <Table 
        columns={columns} 
        dataSource={data} 
        pagination={false}
        size="small"
        bordered
        style={{ marginTop: '16px' }}
      />
    );
  };

  const renderDetailModal = () => {
    return (
      <Modal
        title={
          <Space>
            <InfoCircleOutlined />
            <span>UNSPSC Code Details</span>
            <Tag color="blue" style={{ cursor: 'pointer' }} onClick={() => copyToClipboard(selectedCode)}>
              {selectedCode}
            </Tag>
          </Space>
        }
        open={detailsVisible}
        onCancel={() => setDetailsVisible(false)}
        width={800}
        footer={[
          <Button key="close" onClick={() => setDetailsVisible(false)}>
            Close
          </Button>,
          <Button 
            key="favorite" 
            type="primary"
            icon={isCodeInFavorites(selectedCode) ? <StarFilled /> : <StarOutlined />}
            onClick={() => handleAddToFavorites(selectedCode)}
          >
            {isCodeInFavorites(selectedCode) ? 'Already in Favorites' : 'Add to Favorites'}
          </Button>
        ]}
      >
        {detailsLoading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Spin size="large" />
            <div style={{ marginTop: '16px' }}>Loading UNSPSC code details...</div>
          </div>
        ) : codeDetails ? (
          <>
            <Title level={4}>{codeDetails.fullTitle}</Title>
            <Paragraph>{codeDetails.description}</Paragraph>
            
            <Divider>Hierarchy Details</Divider>
            {renderHierarchyDetails()}
            
            {codeDetails.examples && codeDetails.examples.length > 0 && (
              <>
                <Divider>Example Products/Services</Divider>
                <List
                  size="small"
                  bordered
                  dataSource={codeDetails.examples}
                  renderItem={item => <List.Item>{item}</List.Item>}
                />
              </>
            )}
          </>
        ) : (
          <Empty description="No details available" />
        )}
      </Modal>
    );
  };

  // Define items for Tabs component
  const tabItems = [
    {
      key: 'search',
      label: (
        <span>
          <SearchOutlined /> Search
        </span>
      ),
      children: (
        <Card>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Search
              placeholder="Enter product or service description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onSearch={handleSearch}
              enterButton="Search"
              size="large"
              loading={loading}
              allowClear
            />
                
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <Spin size="large" />
                <div style={{ marginTop: '16px' }}>Searching for UNSPSC codes...</div>
              </div>
            ) : searchResults.length > 0 ? (
              <List
                itemLayout="vertical"
                dataSource={searchResults}
                renderItem={item => (
                  <List.Item
                    key={item.unspscCode}
                    actions={[
                      <Button 
                        key="details" 
                        type="link" 
                        onClick={() => fetchCodeDetails(item.unspscCode)}
                        icon={<InfoCircleOutlined />}
                      >
                        Details
                      </Button>,
                      <Button
                        key="favorite"
                        type="link"
                        onClick={() => handleAddToFavorites(item.unspscCode)}
                        icon={isCodeInFavorites(item.unspscCode) ? <StarFilled style={{ color: '#faad14' }} /> : <StarOutlined />}
                      >
                        {isCodeInFavorites(item.unspscCode) ? 'Saved' : 'Add to Favorites'}
                      </Button>
                    ]}
                  >
                    <List.Item.Meta
                      title={
                        <Space>
                          <Tag color="blue" style={{ cursor: 'pointer' }} onClick={() => copyToClipboard(item.unspscCode)}>
                            {item.unspscCode}
                          </Tag>
                          <span>{item.fullTitle}</span>
                          {isCodeInFavorites(item.unspscCode) && (
                            <StarFilled style={{ color: '#faad14' }} />
                          )}
                        </Space>
                      }
                      description={
                        <Space direction="vertical">
                          <Text>
                            <strong>Segment:</strong> {item.segment.title}
                          </Text>
                          <Text>
                            <strong>Family:</strong> {item.family.title}
                          </Text>
                          <Text>
                            <strong>Class:</strong> {item.class.title}
                          </Text>
                          <Text>
                            <strong>Commodity:</strong> {item.commodity.title}
                          </Text>
                        </Space>
                      }
                    />
                    {item.explanation && (
                      <div style={{ marginTop: '10px' }}>
                        <Text type="secondary">{item.explanation}</Text>
                      </div>
                    )}
                  </List.Item>
                )}
              />
            ) : searchQuery ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <Text type="secondary">No results found. Try a different search term.</Text>
              </div>
            ) : null}
          </Space>
        </Card>
      )
    },
    {
      key: 'favorites',
      label: (
        <span>
          <StarFilled /> Favorites
          <Badge count={favorites.length} style={{ marginLeft: '5px' }} />
        </span>
      ),
      children: (
        <Card
          title="Your UNSPSC Favorites"
          extra={
            <Button 
              type="primary" 
              icon={<SearchOutlined />} 
              onClick={() => setActiveTab('search')}
            >
              Search New Codes
            </Button>
          }
        >
          {favorites.length > 0 ? (
            <List
              itemLayout="horizontal"
              dataSource={favorites}
              renderItem={item => (
                <List.Item
                  actions={[
                    <Button 
                      key="details" 
                      type="link" 
                      onClick={() => fetchCodeDetails(item.unspscCode)}
                      icon={<InfoCircleOutlined />}
                    >
                      Details
                    </Button>,
                    <Button
                      key="remove"
                      type="link"
                      danger
                      onClick={() => handleRemoveFromFavorites(item.id)}
                      icon={<StarFilled />}
                    >
                      Remove
                    </Button>
                  ]}
                >
                  <List.Item.Meta
                    title={
                      <Space>
                        <Tag color="blue" style={{ cursor: 'pointer' }} onClick={() => copyToClipboard(item.unspscCode)}>
                          {item.unspscCode}
                        </Tag>
                        <span>{item.title}</span>
                      </Space>
                    }
                    description={item.description || 'No description available'}
                  />
                </List.Item>
              )}
            />
          ) : (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <Text type="secondary">You haven't saved any UNSPSC codes as favorites yet.</Text>
              <div style={{ marginTop: '16px' }}>
                <Button 
                  type="primary" 
                  icon={<SearchOutlined />} 
                  onClick={() => setActiveTab('search')}
                >
                  Search for UNSPSC Codes
                </Button>
              </div>
            </div>
          )}
        </Card>
      )
    }
  ];
  return (
    <ErpLayout>
      <App>
        <div style={{ padding: '24px' }}>
          <Title level={3}>Enhanced UNSPSC Code Search</Title>
          <Paragraph>
            Search for UNSPSC codes using AI-powered search, save your favorite codes, and view detailed information.
          </Paragraph>
          
          <Tabs 
            activeKey={activeTab} 
            onChange={setActiveTab}
            items={tabItems}
          />

          {renderDetailModal()}
        </div>
      </App>
    </ErpLayout>
  );
};

export default UnspscEnhancedSearch;
