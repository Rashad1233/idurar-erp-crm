/**import React, { useState, useEffect, useRef } from 'react';
import { Input, Button, List, Badge, Spin, Empty, Card, Tooltip, Tabs, message, App } from 'antd';
import { SearchOutlined, RobotOutlined, StarOutlined, StarFilled, LoadingOutlined } from '@ant-design/icons';
import unspscService from '../../services/unspscService';
import './EnhancedUnspscInput.css';nhanced UNSPSC code search and selection component
 * Fixes issues with API interaction and improves user experience
 */
import React, { useState, useEffect, useRef } from 'react';
import { Input, Button, List, Badge, Spin, Empty, Card, Tooltip, Tabs, message, App } from 'antd';
import { SearchOutlined, RobotOutlined, StarOutlined, StarFilled, LoadingOutlined } from '@ant-design/icons';
import unspscService from '../../services/unspscService';
import './EnhancedUnspscInput.css';

const { TabPane } = Tabs;

const EnhancedUnspscInput = ({ value, onChange, placeholder = "Enter UNSPSC code or describe item" }) => {
  const { message } = App.useApp();
  const [inputValue, setInputValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [activeTab, setActiveTab] = useState('search');
  const searchTimeout = useRef(null);
  const inputRef = useRef(null);

  // Initialize with value if provided
  useEffect(() => {
    if (value) {
      setInputValue(value);
      // Format code if it's an 8-digit number
      if (/^\d{8}$/.test(value)) {
        retrieveUnspscInfo(value);
      }
    }
  }, [value]);
  
  // Load favorites on mount
  useEffect(() => {
    loadFavorites();
    
    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, []);
  
  const loadFavorites = async () => {
    try {
      const response = await unspscService.getFavorites();
      if (response.success) {
        setFavorites(response.data || []);
      }
    } catch (error) {
      console.error('Failed to load favorites:', error);
    }
  };

  const handleSearchInput = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
    
    if (!query.trim()) {
      setShowResults(false);
      return;
    }
    
    // Search after 500ms of typing pause
    searchTimeout.current = setTimeout(() => {
      performSearch(query);
    }, 500);
  };
  
  const handleDirectInput = (e) => {
    const input = e.target.value;
    setInputValue(input);
    
    // Check if it's a direct UNSPSC code
    if (/^\d{8}$/.test(input)) {
      retrieveUnspscInfo(input);
    }
    
    // Update parent form
    if (onChange) {
      onChange(input);
    }
  };

  const retrieveUnspscInfo = async (code) => {
    try {
      setIsLoading(true);
      const response = await unspscService.getUnspscByCode(code);
      
      if (response.success && response.data) {
        // Silently update with complete info
        if (onChange) {
          onChange(code, response.data);
        }
      }
    } catch (error) {
      console.error('Error retrieving UNSPSC info:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const performSearch = async (query) => {
    if (!query || query.trim().length < 3) {
      return;
    }
    
    setIsLoading(true);
    setShowResults(true);
    
    try {
      const response = await unspscService.searchCodesWithAI(query);
      
      if (response.success) {
        setSearchResults(response.data || []);
        // Switch to search tab if we get results
        setActiveTab('search');
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Error searching UNSPSC codes:', error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = (code, item = null) => {
    setInputValue(code);
    if (onChange) {
      onChange(code, item);
    }
    setShowResults(false);
  };
  
  const toggleFavorite = async (item, isFavorite) => {
    try {
      if (isFavorite) {
        await unspscService.removeFromFavorites(item.id || item.code);
        message.success(`Removed "${item.title || item.code}" from favorites`);
      } else {
        await unspscService.addToFavorites(item.id || item.code);
        message.success(`Added "${item.title || item.code}" to favorites`);
      }
      
      // Refresh favorites
      loadFavorites();
    } catch (error) {
      console.error('Error toggling favorite:', error);
      message.error('Failed to update favorites');
    }
  };
  
  const isFavorite = (item) => {
    return favorites.some(f => f.id === item.id || f.code === item.code);
  };

  return (
    <div className="enhanced-unspsc-input-container">
      {/* Main input field */}
      <Input 
        ref={inputRef}
        value={inputValue}
        onChange={handleDirectInput}
        placeholder={placeholder}
        suffix={
          <Tooltip title="Search UNSPSC code">
            <Button 
              type="text" 
              icon={<SearchOutlined />} 
              onClick={() => {
                setShowResults(true);
                setActiveTab('search');
                performSearch(inputValue);
              }}
            />
          </Tooltip>
        }
        onFocus={() => setShowResults(true)}
      />
      
      {/* Results dropdown */}
      {showResults && (
        <Card className="unspsc-search-dropdown">
          <Tabs
            activeKey={activeTab}
            onChange={(key) => setActiveTab(key)}
            size="small"
            className="unspsc-search-tabs"
          >
            <TabPane 
              tab={<><SearchOutlined /> Search</>} 
              key="search"
            >
              <Input
                placeholder="Search by description"
                value={searchQuery}
                onChange={handleSearchInput}
                prefix={<SearchOutlined />}
                suffix={isLoading ? <LoadingOutlined /> : null}
              />
              
              <div className="unspsc-search-results">
                {isLoading ? (
                  <div className="unspsc-loading">
                    <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
                    <p>Searching UNSPSC database...</p>
                  </div>
                ) : searchResults.length > 0 ? (
                  <List
                    size="small"
                    dataSource={searchResults}
                    renderItem={(item) => {
                      const isFav = isFavorite(item);
                      return (
                        <List.Item 
                          key={item.id || item.code}
                          className="unspsc-search-item"
                          actions={[
                            <Button
                              type="text"
                              icon={isFav ? <StarFilled style={{ color: '#faad14' }} /> : <StarOutlined />}
                              onClick={() => toggleFavorite(item, isFav)}
                            />
                          ]}
                          onClick={() => handleSelect(item.code, item)}
                        >
                          <List.Item.Meta
                            title={
                              <span>
                                <Badge color="blue" text={item.code} /> - {item.title}
                              </span>
                            }
                            description={item.description}
                          />
                        </List.Item>
                      );
                    }}
                  />
                ) : searchQuery ? (
                  <Empty 
                    image={Empty.PRESENTED_IMAGE_SIMPLE} 
                    description="No matching UNSPSC codes found"
                  />
                ) : (
                  <div className="unspsc-search-instructions">
                    <p>Type at least 3 characters to search</p>
                    <p><small>Example: "laptop computer" or "valve"</small></p>
                  </div>
                )}
              </div>
            </TabPane>
            
            <TabPane 
              tab={<><StarOutlined /> Favorites</>} 
              key="favorites"
            >
              <div className="unspsc-favorites">
                {favorites.length > 0 ? (
                  <List
                    size="small"
                    dataSource={favorites}
                    renderItem={(item) => (
                      <List.Item 
                        key={item.id || item.code}
                        className="unspsc-favorite-item"
                        actions={[
                          <Button
                            type="text"
                            icon={<StarFilled style={{ color: '#faad14' }} />}
                            onClick={() => toggleFavorite(item, true)}
                          />
                        ]}
                        onClick={() => handleSelect(item.code, item)}
                      >
                        <List.Item.Meta
                          title={
                            <span>
                              <Badge color="gold" text={item.code} /> - {item.title}
                            </span>
                          }
                          description={item.description}
                        />
                      </List.Item>
                    )}
                  />
                ) : (
                  <Empty 
                    image={Empty.PRESENTED_IMAGE_SIMPLE} 
                    description="No favorite UNSPSC codes saved yet"
                  />
                )}
              </div>
            </TabPane>
          </Tabs>
          
          <div className="unspsc-search-footer">
            <Button 
              size="small" 
              onClick={() => setShowResults(false)}
            >
              Close
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default EnhancedUnspscInput;
