import React, { useState, useEffect } from 'react';
import { 
  Input, Button, Card, List, Tag, Space, Typography, Spin, 
  message, Modal, Table, Tooltip, Empty, Row, Col, Divider, Tabs
} from 'antd';
import { 
  SearchOutlined, InfoCircleOutlined, StarOutlined, StarFilled,
  PlusOutlined, CheckOutlined, HeartOutlined
} from '@ant-design/icons';
import axios from 'axios';
import { API_BASE_URL } from '@/config/serverApiConfig';
import './UnspscItemMasterIntegration.css';

const { Text, Title } = Typography;
const { Search } = Input;

const UnspscItemMasterIntegration = ({ onSelect, value, placeholder = "Search for UNSPSC codes..." }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [selectedCode, setSelectedCode] = useState(value || null);
  const [codeDetails, setCodeDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [favoritesLoading, setFavoritesLoading] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('search');

  // Update selected code when value prop changes
  useEffect(() => {
    if (value && value !== selectedCode) {
      setSelectedCode(value);
    }
  }, [value]);

  // Fetch favorites on component mount
  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    setFavoritesLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/unspsc/favorites`);
      if (response.data && response.data.success) {
        setFavorites(response.data.favorites);
      } else {
        console.warn('Failed to fetch favorites:', response.data?.message);
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setFavoritesLoading(false);
    }
  };

  const handleSearch = async (query) => {
    if (!query || query.trim() === '') {
      message.warning('Please enter a search term');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/unspsc/search`, { query });
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

  const fetchCodeDetails = async (code) => {
    setDetailsLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/unspsc/details/${code}`);
      if (response.data && response.data.success) {
        setCodeDetails(response.data.result);
      } else {
        message.error('Failed to fetch code details');
      }
    } catch (error) {
      console.error('Error fetching code details:', error);
      message.error('Error fetching code details');
    } finally {
      setDetailsLoading(false);
    }
  };
  const handleSelectCode = (result) => {
    setSelectedCode(result.unspscCode || result.code);
    if (onSelect) {
      onSelect({
        code: result.unspscCode || result.code,
        title: result.fullTitle || result.title,
        segment: result.segment,
        family: result.family,
        class: result.class,
        commodity: result.commodity,
        confidence: result.confidence,
        explanation: result.explanation
      });
    }
    setSearchResults([]); // Clear search results
    setSearchQuery(''); // Clear search input
    message.success(`Selected UNSPSC code: ${result.unspscCode || result.code}`);
  };
  const handleSelectFromFavorites = (favorite) => {
    setSelectedCode(favorite.unspscCode);
    if (onSelect) {
      // Parse hierarchy from description if available
      const hierarchyParts = favorite.description ? favorite.description.split('\n')[0].split(' → ') : [];
      
      onSelect({
        code: favorite.unspscCode,
        title: favorite.title,
        segment: { title: hierarchyParts[0] || 'Unknown Segment' },
        family: { title: hierarchyParts[1] || 'Unknown Family' },
        class: { title: hierarchyParts[2] || 'Unknown Class' },
        commodity: { title: hierarchyParts[3] || 'Unknown Commodity' },
        explanation: favorite.description ? favorite.description.split('\n')[1] || '' : ''
      });
    }
    message.success(`Selected UNSPSC code from favorites: ${favorite.unspscCode}`);
  };
  const handleRemoveFromFavorites = async (favoriteId) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/unspsc/favorites/${favoriteId}`);
      if (response.data && response.data.success) {
        message.success('Removed from favorites');
        fetchFavorites(); // Refresh favorites list
      } else {
        message.error(response.data?.message || 'Failed to remove from favorites');
      }
    } catch (error) {
      console.error('Error removing from favorites:', error);
      message.error('Error removing from favorites');
    }
  };

  const handleViewDetails = async (code) => {
    setSelectedCode(code);
    await fetchCodeDetails(code);
    setDetailsVisible(true);
  };  const handleAddToFavorites = async (code) => {
    try {
      // Find the code details in search results
      const codeData = searchResults.find(result => result.unspscCode === code) || codeDetails;
      if (!codeData) {
        message.error('Code details not found');
        return;
      }

      // Create a comprehensive title and description for favorites
      const title = codeData.fullTitle || codeData.title || `UNSPSC Code ${code}`;
      const hierarchyPath = `${codeData.segment?.title || 'Unknown Segment'} → ${codeData.family?.title || 'Unknown Family'} → ${codeData.class?.title || 'Unknown Class'} → ${codeData.commodity?.title || 'Unknown Commodity'}`;
      const description = `${hierarchyPath}\n${codeData.explanation || 'No description available'}`;

      const payload = {
        unspscCode: code,
        title: title,
        description: description
      };

      console.log('Adding to favorites with payload:', payload);

      const response = await axios.post(`${API_BASE_URL}/unspsc/favorites`, payload);
      if (response.data && response.data.success) {
        message.success('Added to favorites');
        // Refresh the favorites list
        await fetchFavorites();
      } else {
        message.error(response.data?.message || 'Failed to add to favorites');
      }
    } catch (error) {
      console.error('Error adding to favorites:', error);
      if (error.response?.status === 409) {
        message.warning('This code is already in your favorites');
      } else {
        message.error('Error adding to favorites');
      }
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    message.success('Copied to clipboard');
  };

  const renderHierarchyTable = () => {
    if (!codeDetails) return null;

    const columns = [
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
            <Text>UNSPSC Code Details</Text>
            <Tag color="blue">{selectedCode}</Tag>
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
            key="favorites" 
            type="primary" 
            icon={<StarOutlined />}
            onClick={() => handleAddToFavorites(selectedCode)}
          >
            Add to Favorites
          </Button>,
        ]}
      >
        {detailsLoading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Spin size="large" />
            <div style={{ marginTop: '16px' }}>Loading details...</div>
          </div>
        ) : codeDetails ? (
          <div>
            <Title level={4}>{codeDetails.fullTitle}</Title>
            <Text>{codeDetails.description}</Text>
            
            <Divider>Hierarchy Details</Divider>
            {renderHierarchyTable()}
          </div>
        ) : null}
      </Modal>
    );
  };  const renderFavoritesList = () => {
    if (favoritesLoading) {
      return (
        <div className="loading-container">
          <Spin size="large" />
          <div className="loading-text">Loading favorites...</div>
        </div>
      );
    }

    if (favorites.length === 0) {
      return (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="No favorites yet"
        >
          <Text type="secondary">
            Add UNSPSC codes to favorites for quick access
          </Text>
        </Empty>
      );
    }

    return (
      <List
        dataSource={favorites}
        renderItem={(item) => (
          <List.Item
            actions={[
              <Tooltip title="View Details">
                <Button
                  type="text"
                  icon={<InfoCircleOutlined />}
                  onClick={() => handleViewDetails(item.unspscCode)}
                />
              </Tooltip>,              <Tooltip title="Remove from Favorites">
                <Button
                  type="text"
                  icon={<StarFilled style={{ color: '#faad14' }} />}
                  onClick={() => handleRemoveFromFavorites(item.id)}
                />
              </Tooltip>,
              <Button
                type="primary"
                icon={<CheckOutlined />}
                size="small"
                onClick={() => handleSelectFromFavorites(item)}
              >
                Select
              </Button>,
            ]}
          >            <List.Item.Meta
              title={
                <Space>
                  <Tag color="blue">{item.unspscCode}</Tag>
                  <Text strong>{item.title}</Text>
                </Space>
              }
              description={
                <div>
                  <Text type="secondary" className="hierarchy-breadcrumb">
                    {item.description ? item.description.split('\n')[0] : 'No hierarchy available'}
                  </Text>
                  {item.description && item.description.split('\n')[1] && (
                    <>
                      <br />
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {item.description.split('\n')[1]}
                      </Text>
                    </>
                  )}
                </div>
              }
            />
          </List.Item>
        )}
      />
    );
  };

  const renderSearchTab = () => (
    <div>
      <Row gutter={[16, 16]}>
        <Col span={18}>
          <Search
            placeholder={placeholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onSearch={handleSearch}
            enterButton={
              <Button 
                type="primary" 
                icon={<SearchOutlined />}
                loading={loading}
              >
                Search
              </Button>
            }
            size="large"
          />
        </Col>
        <Col span={6}>
          {selectedCode && (
            <div className="selected-code-display">
              <Text type="secondary">Selected:</Text>
              <br />
              <Tag color="green" style={{ fontSize: '14px', padding: '4px 8px' }}>
                {selectedCode}
              </Tag>
            </div>
          )}
        </Col>
      </Row>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <Card 
          title="Search Results" 
          className="search-results-card"
          style={{ marginTop: '16px' }}
          size="small"
        >
          <List
            dataSource={searchResults}
            renderItem={(item) => (
              <List.Item
                actions={[
                  <Tooltip title="View Details">
                    <Button
                      type="text"
                      icon={<InfoCircleOutlined />}
                      onClick={() => handleViewDetails(item.unspscCode)}
                    />
                  </Tooltip>,
                  <Tooltip title="Add to Favorites">
                    <Button
                      type="text"
                      icon={<StarOutlined />}
                      onClick={() => handleAddToFavorites(item.unspscCode)}
                    />
                  </Tooltip>,
                  <Button
                    type="primary"
                    icon={<CheckOutlined />}
                    size="small"
                    onClick={() => handleSelectCode(item)}
                  >
                    Select
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  title={
                    <Space>
                      <Tag color="blue">{item.unspscCode}</Tag>
                      <Text strong>{item.fullTitle}</Text>
                      {item.confidence && (
                        <Tag 
                          color={item.confidence > 0.8 ? 'green' : 'orange'}
                          className="confidence-tag"
                        >
                          {Math.round(item.confidence * 100)}% match
                        </Tag>
                      )}
                    </Space>
                  }
                  description={
                    <div>
                      <Text type="secondary">{item.explanation}</Text>
                      <br />
                      <Text type="secondary" className="hierarchy-breadcrumb">
                        {item.segment?.title} → {item.family?.title} → {item.class?.title}
                      </Text>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        </Card>
      )}

      {loading && (
        <div className="loading-container">
          <Spin size="large" />
          <div className="loading-text">Searching UNSPSC codes...</div>
        </div>
      )}
    </div>
  );

  const tabItems = [
    {
      key: 'search',
      label: (
        <Space>
          <SearchOutlined />
          Search Codes
        </Space>
      ),
      children: renderSearchTab(),
    },
    {
      key: 'favorites',
      label: (
        <Space>
          <HeartOutlined />
          My Favorites
          {favorites.length > 0 && (
            <Tag color="blue" size="small">
              {favorites.length}
            </Tag>
          )}
        </Space>
      ),
      children: renderFavoritesList(),
    },
  ];

  return (
    <div className="unspsc-item-master-integration">
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
        size="small"
      />
      {renderDetailModal()}
    </div>
  );
};

export default UnspscItemMasterIntegration;
