import React, { useState, useEffect, useRef } from 'react';
import { Input, Button, List, Badge, Spin, Empty, Card, Tooltip, Divider, message } from 'antd';
import { SearchOutlined, RobotOutlined, DatabaseOutlined, CopyOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import unspscService from '@/services/unspscService';
import './UnspscAiSearch.css';

const UnspscAiSearch = ({ onSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [source, setSource] = useState('');
  const [message, setMessage] = useState('');
  const searchTimeout = useRef(null);
  const inputRef = useRef(null);

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
    
    setIsLoading(true);
    setShowResults(true);
    
    try {
      // Use AI-powered search
      const response = await unspscService.searchCodesWithAI(query);
      
      if (response.success) {
        setSearchResults(response.data || []);
        setSource(response.source || 'unknown');
        setMessage(response.message || '');
      } else {
        setSearchResults([]);
        setMessage(response.message || 'Search failed');
      }
    } catch (error) {
      console.error('Error searching UNSPSC codes:', error);
      setSearchResults([]);
      setMessage('Error connecting to search service');
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
    navigator.clipboard.writeText(text)
      .then(() => {
        message.success('Code copied to clipboard');
      })
      .catch(err => {
        console.error('Error copying text: ', err);
        message.error('Failed to copy');
      });
  };

  const getSourceIcon = () => {
    if (source === 'ai') {
      return <Badge count={<RobotOutlined style={{ color: '#1890ff' }} />} />;
    } else if (source === 'database') {
      return <Badge count={<DatabaseOutlined style={{ color: '#52c41a' }} />} />;
    }
    return null;
  };

  return (
    <div className="unspsc-ai-search">
      <div className="search-container">
        <Input
          ref={inputRef}
          placeholder="Describe the item to find UNSPSC code..."
          value={searchQuery}
          onChange={handleSearchInput}
          suffix={
            <Tooltip title="AI-powered search helps find the appropriate UNSPSC code based on your description">
              <QuestionCircleOutlined />
            </Tooltip>
          }
          onFocus={() => {
            if (searchResults.length > 0) {
              setShowResults(true);
            }
          }}
        />
        <Button 
          type="primary" 
          icon={<SearchOutlined />} 
          onClick={() => performSearch(searchQuery)}
          disabled={!searchQuery || searchQuery.trim().length < 3}
        >
          Search
        </Button>
      </div>
      
      {showResults && (
        <div className="results-container">
          <Card 
            size="small" 
            title={
              <div className="results-header">
                <span>UNSPSC Code Results</span>
                {getSourceIcon()}
              </div>
            }
            extra={<Button size="small" onClick={() => setShowResults(false)}>Close</Button>}
          >            {isLoading ? (
              <div className="loading-container">
                <Spin size="large">
                  <div style={{ minHeight: '80px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <p>Searching for the best matching UNSPSC codes...</p>
                  </div>
                </Spin>
              </div>
            ) : (
              <>
                {message && <div className="search-message">{message}</div>}
                
                {searchResults.length === 0 ? (
                  <Empty description="No matching UNSPSC codes found" />
                ) : (
                  <List
                    size="small"
                    dataSource={searchResults}
                    renderItem={item => (
                      <List.Item
                        className="result-item"
                        actions={[
                          <Button 
                            type="text" 
                            icon={<CopyOutlined />} 
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(item.code);
                            }}
                          />,
                          <Button 
                            type="link" 
                            size="small" 
                            onClick={() => handleSelect(item)}
                          >
                            Select
                          </Button>
                        ]}
                        onClick={() => handleSelect(item)}
                      >
                        <List.Item.Meta
                          title={
                            <div className="result-title">
                              <span className="code">{item.code}</span>
                              <span className="title">{item.title}</span>
                            </div>
                          }
                          description={
                            <div className="result-details">
                              <span className="level">{item.level}</span>
                              {item.confidence && (
                                <span className="confidence">
                                  Confidence: {Math.round(item.confidence * 100)}%
                                </span>
                              )}
                              {item.reasoning && (
                                <div className="reasoning">{item.reasoning}</div>
                              )}
                            </div>
                          }
                        />
                      </List.Item>
                    )}
                  />
                )}
                
                {source === 'ai' && (
                  <div className="ai-attribution">
                    <Divider plain>
                      <RobotOutlined /> AI-Powered Results
                    </Divider>
                    <p className="disclaimer">
                      These results are AI-generated. Verify the code accuracy before finalizing.
                    </p>
                  </div>
                )}
              </>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};

export default UnspscAiSearch;
