import React, { useState, useEffect, useRef } from 'react';
import { 
  Input, Button, List, Badge, Spin, Empty, Card, Tooltip, 
  Divider, message, Tabs, Modal, Form, Input as AntInput, Space
} from 'antd';
import { 
  SearchOutlined, RobotOutlined, DatabaseOutlined, 
  CopyOutlined, QuestionCircleOutlined, StarOutlined
} from '@ant-design/icons';
import unspscService from '@/services/unspscService';
import unspscFavoritesService from '@/services/unspscFavoritesService';
import UnspscFavorites from '@/components/UnspscFavorites';
import './UnspscAiSearchWithFavorites.css';

const { TextArea } = AntInput;

const UnspscAiSearchWithFavorites = ({ onSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [source, setSource] = useState('');
  const [messageText, setMessageText] = useState('');
  const [activeTab, setActiveTab] = useState('search');
  const [favoriteModalVisible, setFavoriteModalVisible] = useState(false);
  const [selectedCode, setSelectedCode] = useState(null);
  const [form] = Form.useForm();
  
  const searchTimeout = useRef(null);
  const inputRef = useRef(null);
  const favoritesRef = useRef(null);

  useEffect(() => {
    // Clean up timeout on unmount
    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, []);

  const handleSearchInput = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    // Clear previous timeout
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
    
    // Hide results if input is cleared
    if (!query.trim()) {
      setShowResults(false);
      return;
    }
    
    // Debounce search with 600ms delay
    searchTimeout.current = setTimeout(() => {
      performSearch(query);
    }, 600);
  };
  const performSearch = async (query) => {
    if (!query || query.trim().length < 3) {
      return;
    }
    
    console.log('Performing AI search for:', query);
    setIsLoading(true);
    setShowResults(true);
    
    try {
      // Use AI-powered search
      const response = await unspscService.searchCodesWithAI(query);
      console.log('Search response:', response);
      
      if (response.success) {
        setSearchResults(response.data || []);
        setSource(response.source || 'unknown');
        setMessageText(response.message || '');
        console.log(`Found ${response.data?.length || 0} results from source: ${response.source}`);
      } else {
        setSearchResults([]);
        setMessageText(response.message || 'Search failed');
      }
    } catch (error) {
      console.error('Error searching UNSPSC codes:', error);
      setSearchResults([]);
      setMessageText('Error connecting to search service');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = (item) => {
    if (onSelect) {
      onSelect(item);
    }
    setShowResults(false);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(
      () => message.success('Copied to clipboard'),
      () => message.error('Failed to copy')
    );
  };

  const showSaveFavoriteModal = (item) => {
    setSelectedCode(item);
    form.resetFields();
    setFavoriteModalVisible(true);
  };  const handleSaveFavorite = async (values) => {
    if (!selectedCode) {
      message.error('No UNSPSC code selected');
      return;
    }
    
    try {
      // Extract UNSPSC code components
      const code = selectedCode.code;
      let segmentCode = '';
      let familyCode = '';
      let classCode = '';
      let commodityCode = '';
      
      if (code && code.length === 8) {
        segmentCode = code.substring(0, 2);
        familyCode = code.substring(0, 4);
        classCode = code.substring(0, 6);
        commodityCode = code;
      }
      
      const favoriteData = {
        unspscCode: selectedCode.code,
        level: selectedCode.level,
        title: selectedCode.title,
        segment: segmentCode,
        family: familyCode,
        class: classCode,
        commodity: commodityCode,
        name: values.name,
        description: values.description,
        isDefault: values.isDefault || false
      };      const response = await unspscFavoritesService.saveFavorite(favoriteData);
      console.log('Save favorite response:', response);
        if (response.success) {
        message.success('Favorite saved successfully');
        setFavoriteModalVisible(false);
        
        // Switch to the favorites tab to show the newly added favorite
        setActiveTab('favorites');
        
        // Force refresh the favorites list immediately and wait for completion
        if (favoritesRef.current) {
          console.log('Triggering favorites refresh...');
          try {
            if (favoritesRef.current.refreshFavorites) {
              await favoritesRef.current.refreshFavorites();
            } else if (favoritesRef.current.fetchFavorites) {
              await favoritesRef.current.fetchFavorites(true);
            }
            console.log('Favorites refresh completed successfully');
          } catch (refreshError) {
            console.error('Error during favorites refresh:', refreshError);
            // Try one more time with a delay
            setTimeout(async () => {
              try {
                if (favoritesRef.current?.fetchFavorites) {
                  await favoritesRef.current.fetchFavorites(true);
                }
              } catch (retryError) {
                console.error('Retry refresh failed:', retryError);
              }
            }, 500);
          }
        } else {
          console.warn('Favorites ref is not available');
        }
      } else {
        message.error(response.message || 'Failed to save favorite');
      }
    } catch (error) {
      console.error('Error saving favorite:', error);
      message.error(`Failed to save favorite: ${error.message || 'Unknown error'}`);
    }
  };

  const handleCancelFavorite = () => {
    setFavoriteModalVisible(false);
    form.resetFields();
  };
  return (
    <div className="unspsc-ai-search-container">      <Tabs 
        activeKey={activeTab} 
        onChange={async (key) => {
          console.log('Tab changed to:', key);
          setActiveTab(key);
          // Refresh favorites list when switching to favorites tab
          if (key === 'favorites' && favoritesRef.current) {
            console.log('Refreshing favorites on tab change...');
            if (favoritesRef.current.refreshFavorites) {
              await favoritesRef.current.refreshFavorites();
            } else if (favoritesRef.current.fetchFavorites) {
              await favoritesRef.current.fetchFavorites(true);
            }
          }
        }}
        className="unspsc-search-tabs"
        items={[
          {
            key: 'search',
            label: 'AI Search',
            children: (
              <>
                <div className="search-input-container">
                  <Input
                    ref={inputRef}
                    placeholder="Describe the product or service..."
                    value={searchQuery}
                    onChange={handleSearchInput}
                    prefix={<SearchOutlined />}
                    allowClear
                    className="search-input"
                  />
                </div>

                {showResults && (
                  <div className="search-results-container">                    {isLoading ? (
                      <div className="search-loading">
                        <Spin size="large">
                          <div style={{ minHeight: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            Searching...
                          </div>
                        </Spin>
                      </div>
                    ) : searchResults.length === 0 ? (
                      <Empty 
                        description={messageText || "No results found"} 
                        image={Empty.PRESENTED_IMAGE_SIMPLE} 
                      />
                    ) : (
                      <>                        <div className="search-results-header">
                          <div className="results-count">
                            <Badge 
                              count={searchResults.length} 
                              overflowCount={999} 
                              style={{ backgroundColor: '#52c41a' }} 
                            />
                            <span style={{ marginLeft: '8px' }}>results found</span>
                          </div>
                          <div className="results-source">
                            {source === 'ai' ? (
                              <Tooltip title="Results powered by AI analysis">
                                <div style={{ color: '#1890ff', fontWeight: 'bold' }}>
                                  <RobotOutlined /> AI-Powered
                                </div>
                              </Tooltip>
                            ) : source === 'database_fallback' ? (
                              <Tooltip title="AI search failed, showing database results">
                                <div style={{ color: '#fa8c16', fontWeight: 'bold' }}>
                                  <DatabaseOutlined /> Database (AI Fallback)
                                </div>
                              </Tooltip>
                            ) : (
                              <Tooltip title="Results from local database">
                                <div style={{ color: '#722ed1', fontWeight: 'bold' }}>
                                  <DatabaseOutlined /> Database
                                </div>
                              </Tooltip>
                            )}
                          </div>
                          {messageText && (
                            <div className="search-message" style={{ 
                              fontSize: '12px', 
                              color: '#666', 
                              marginTop: '4px',
                              fontStyle: 'italic'
                            }}>
                              {messageText}
                            </div>
                          )}
                        </div>
                        
                        <List
                          dataSource={searchResults}
                          renderItem={(item) => (
                            <Card 
                              className="result-card"
                              size="small"
                              actions={[
                                <Tooltip title="Copy code">
                                  <CopyOutlined 
                                    key="copy" 
                                    onClick={() => copyToClipboard(item.code)} 
                                  />
                                </Tooltip>,
                                <Tooltip title="Save to favorites">
                                  <StarOutlined 
                                    key="favorite" 
                                    onClick={() => showSaveFavoriteModal(item)} 
                                  />
                                </Tooltip>,
                                <Tooltip title="Use this code">
                                  <Button
                                    type="primary"
                                    size="small"
                                    onClick={() => handleSelect(item)}
                                  >
                                    Select
                                  </Button>
                                </Tooltip>
                              ]}
                            >
                              <Card.Meta
                                title={
                                  <div className="result-card-title">
                                    <span className="unspsc-code">{item.code}</span>
                                    <span className="unspsc-level">{item.level}</span>
                                  </div>
                                }
                                description={
                                  <div className="result-card-description">
                                    <div className="unspsc-title">{item.title}</div>
                                    {item.confidence && (
                                      <div className="confidence-bar">
                                        <Tooltip title={`Confidence: ${Math.round(item.confidence * 100)}%`}>
                                          <div 
                                            className="confidence-level" 
                                            style={{ width: `${item.confidence * 100}%` }}
                                          />
                                        </Tooltip>
                                      </div>
                                    )}
                                    {item.reasoning && (
                                      <div className="reasoning">
                                        <Tooltip title={item.reasoning}>
                                          <QuestionCircleOutlined /> Why this result?
                                        </Tooltip>
                                      </div>
                                    )}
                                  </div>
                                }
                              />
                            </Card>
                          )}
                        />
                      </>
                    )}
                  </div>
                )}
              </>
            ),
          },
          {
            key: 'favorites',
            label: 'My Favorites',
            children: (
              <UnspscFavorites 
                ref={favoritesRef} 
                onSelect={handleSelect} 
              />
            ),
          },
        ]}
      /><Modal
        title="Save to Favorites"
        open={favoriteModalVisible}
        onCancel={handleCancelFavorite}
        footer={null}
      >
        {selectedCode && (
          <div className="selected-code-info">
            <p><strong>Code:</strong> {selectedCode.code}</p>
            <p><strong>Title:</strong> {selectedCode.title}</p>
            <p><strong>Level:</strong> {selectedCode.level}</p>
            {selectedCode.code && selectedCode.code.length === 8 && (
              <div className="unspsc-hierarchy">
                <p><strong>Segment:</strong> {selectedCode.code.substring(0, 2)}</p>
                <p><strong>Family:</strong> {selectedCode.code.substring(2, 4)}</p>
                <p><strong>Class:</strong> {selectedCode.code.substring(4, 6)}</p>
                <p><strong>Commodity:</strong> {selectedCode.code.substring(6, 8)}</p>
              </div>
            )}
          </div>
        )}
        
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSaveFavorite}
        >
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: 'Please enter a name for this favorite' }]}
          >
            <AntInput placeholder="E.g., Common Office Supplies" />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="Description (Optional)"
          >
            <TextArea 
              rows={3} 
              placeholder="Add any notes or details about this UNSPSC code"
            />
          </Form.Item>
          
          <Form.Item
            name="isDefault"
            valuePropName="checked"
          >
            <AntInput 
              type="checkbox" 
              style={{ width: 'auto' }} 
            /> Set as default favorite
          </Form.Item>
          
          <Form.Item>
            <Space style={{ float: 'right' }}>
              <Button onClick={handleCancelFavorite}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                Save
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UnspscAiSearchWithFavorites;
