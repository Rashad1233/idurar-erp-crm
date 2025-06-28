import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import moment from 'moment';
import { 
  Button, 
  Card, 
  Descriptions, 
  Table, 
  Tag, 
  Alert, 
  Spin,
  Typography,
  Space,
  Divider,
  Steps,
  Modal,
  Timeline,
  List,
  Avatar,
  Tooltip,
  Empty,
  InputNumber,
  App
} from 'antd';
import { 
  ArrowLeftOutlined,
  CheckOutlined,
  CloseOutlined,
  EditOutlined,
  FileTextOutlined,
  FilePdfOutlined,
  FileExcelOutlined,
  FileWordOutlined,
  FileImageOutlined,
  FilePptOutlined,
  FileZipOutlined,
  FileUnknownOutlined,
  PaperClipOutlined,
  PrinterOutlined,
  SendOutlined,
  HistoryOutlined,
  DownloadOutlined
} from '@ant-design/icons';

import useLanguage from '@/locale/useLanguage';
import { request } from '@/request';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '@/redux/auth/selectors';
import { ErpLayout } from '@/layout';
import { DOWNLOAD_BASE_URL } from '@/config/serverApiConfig';

// System Admin ID
const SYSTEM_ADMIN_ID = "0b4afa3e-8582-452b-833c-f8bf695c4d60";

const { Title, Text } = Typography;
const { Step } = Steps;

// Helper function to get file icon based on file type
const getFileIcon = (fileName) => {
  if (!fileName) return <FileUnknownOutlined />;
  
  const extension = fileName.split('.').pop().toLowerCase();
  
  switch (extension) {
    case 'pdf':
      return <FilePdfOutlined style={{ color: '#f5222d' }} />;
    case 'doc':
    case 'docx':
      return <FileWordOutlined style={{ color: '#1677ff' }} />;
    case 'xls':
    case 'xlsx':
    case 'csv':
      return <FileExcelOutlined style={{ color: '#52c41a' }} />;
    case 'ppt':
    case 'pptx':
      return <FilePptOutlined style={{ color: '#fa8c16' }} />;
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'bmp':
    case 'webp':
      return <FileImageOutlined style={{ color: '#13c2c2' }} />;
    case 'zip':
    case 'rar':
    case '7z':
      return <FileZipOutlined style={{ color: '#722ed1' }} />;
    default:
      return <FileTextOutlined style={{ color: '#8c8c8c' }} />;
  }
};

function PurchaseRequisitionReadSimple() {
  const { id } = useParams();
  const navigate = useNavigate();
  const translate = useLanguage();
  const currentUser = useSelector(selectCurrentUser);
  const { message } = App.useApp();
  
  const [pr, setPr] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [prItems, setPrItems] = useState([]);
  const [approvalHistory, setApprovalHistory] = useState([]);
  const [isApproveModalVisible, setIsApproveModalVisible] = useState(false);
  const [isRejectModalVisible, setIsRejectModalVisible] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  // State to temporarily store price value for modal
  const [tempPrice, setTempPrice] = useState(0);  // State to store user information by ID
  const [userCache, setUserCache] = useState({});
    // Function to fetch user information by ID
  const fetchUserInfo = async (userId) => {
    if (!userId || userId === 'null') return null;
    
    // Check if this is the system admin ID
    if (userId === SYSTEM_ADMIN_ID) {
      const adminInfo = { id: SYSTEM_ADMIN_ID, name: 'System Administrator', role: 'admin' };
      console.log('Identified System Administrator:', adminInfo);
      
      // Update cache
      setUserCache(prevCache => ({
        ...prevCache,
        [SYSTEM_ADMIN_ID]: adminInfo
      }));
      
      return adminInfo;
    }
    
    // If we already have this user in cache, return it
    if (userCache[userId]) {
      console.log('User found in cache:', userCache[userId]);
      return userCache[userId];
    }
      try {
      console.log('Fetching user info for ID:', userId);
      console.log('User ID type:', typeof userId, 'length:', userId.length);
      // Try first with user-info endpoint which is more reliable
      let response = await request.get({ entity: `user-info/users/${userId}` });
      
      if (!response || (!response.success && !response.result)) {
        console.log('Falling back to regular users endpoint');
        // Fall back to regular users endpoint if user-info fails
        response = await request.get({ entity: `users/${userId}` });
      }
      
      if (response && (response.success || response.result)) {        const userData = response.result || response.data || {};
        console.log('User data received:', userData);
        const userInfo = {
          id: userData.id || userId,
          // Use the actual name from database - these users will have real names like "System Administrator"
          name: userData.name || userData.email || `User ID: ${userId.substr(0, 8)}`,
          email: userData.email || '',
          role: userData.role || ''
        };
        
        // Update the cache
        setUserCache(prevCache => ({
          ...prevCache,
          [userId]: userInfo
        }));
        
        return userInfo;
      }
    } catch (err) {
      console.error('Error fetching user info:', err);      // Add a placeholder to the cache with a better label
      setUserCache(prevCache => ({
        ...prevCache,
        [userId]: { id: userId, name: `User ID: ${userId.substr(0, 8)}...` }
      }));
    }
    
    const fallbackUser = { id: userId, name: `User ID: ${userId.substr(0, 8)}...` };
    return fallbackUser;
  };
  
  // Load PR data
  useEffect(() => {
    setLoading(true);
    setError(null);    request.get({ entity: `supplier/pr-details/${id}` })
      .then(response => {        console.log('PR data loaded:', response);
        const prData = response.result || response.data;
        console.log('PR data structure:', {
          id: prData?.id,
          prNumber: prData?.prNumber,
          status: prData?.status,
          approver: prData?.approver,
          supplier: prData?.supplier,
          requestor: prData?.requestor,
          createdBy: prData?.createdBy
        });
        console.log('PR items data:', prData?.items);
        
        // Process items to ensure prices are properly formatted
        const processedItems = (prData?.items || []).map(item => {
          console.log('Original item:', item);
          
          // Copy the item to avoid modifying the original
          const processedItem = { ...item };
          
          // Log price-related fields
          console.log('Processing item with price data:', {
            id: processedItem.id,
            itemName: processedItem.itemName,
            price: processedItem.price, 
            unitPrice: processedItem.unitPrice,
            estimatedPrice: processedItem.estimatedPrice,
            estimatedUnitPrice: processedItem.estimatedUnitPrice,
            contractPrice: processedItem.contractPrice,
            lastPrice: processedItem.lastPrice
          });          // ALWAYS map unitPrice to price if available (this ensures maximum compatibility)
          if (processedItem.unitPrice !== undefined && processedItem.unitPrice !== null) {
            processedItem.price = processedItem.unitPrice;
            processedItem.priceSource = 'unit';
          }
          // If still no price, check if we have a price but it's not correctly formatted
          else if (processedItem.price === undefined || processedItem.price === null) {
            // Check if there's contract, estimated, or last price available
            if (processedItem.contractPrice) {
              processedItem.price = processedItem.contractPrice;
              processedItem.priceSource = 'contract';
            } else if (processedItem.estimatedPrice || processedItem.estimatedUnitPrice) {
              processedItem.price = processedItem.estimatedPrice || processedItem.estimatedUnitPrice;
              processedItem.priceSource = 'estimated';
            } else if (processedItem.lastPrice) {
              processedItem.price = processedItem.lastPrice;
              processedItem.priceSource = 'last';
            }
          }
          
          // Make sure both price and unitPrice are set to the same value
          if (processedItem.price !== undefined && processedItem.price !== null) {
            processedItem.unitPrice = processedItem.price;
          }
          
          console.log('After processing:', {
            id: processedItem.id,
            itemName: processedItem.itemName,
            price: processedItem.price,
            unitPrice: processedItem.unitPrice,
            priceSource: processedItem.priceSource
          });
          
          return processedItem;
        });
          console.log('Processed items with prices:', processedItems);
        
        // Fetch user info for approver and requestor
        const loadUserData = async () => {
          try {            // Process approver ID with detailed logging
            if (prData?.approverId || prData?.approver) {
              console.log('Original approver data:', {
                approver: prData.approver,
                approverId: prData.approverId,
                type: typeof prData.approver
              });
              
              let approverIdStr;
              if (typeof prData.approver === 'object' && prData.approver !== null) {
                approverIdStr = prData.approver.id || prData.approver._id;
                console.log('Approver is an object, extracted ID:', approverIdStr);
              } else {
                approverIdStr = prData.approverId || prData.approver;
                console.log('Using direct approver ID:', approverIdStr);
              }
              
              if (approverIdStr && approverIdStr !== 'null') {
                console.log('Fetching info for approver ID:', approverIdStr);
                const approverInfo = await fetchUserInfo(approverIdStr);
                console.log('Fetched approver info:', approverInfo);
                if (approverInfo) {
                  prData.approver = approverInfo;
                  console.log('Updated PR approver data:', prData.approver);
                }
              }
            }
            
            // Process currentApprover ID
            if (prData?.currentApproverId) {
              const currentApproverInfo = await fetchUserInfo(prData.currentApproverId);
              if (currentApproverInfo) {
                prData.currentApprover = currentApproverInfo;
              }
            }
            
            // Process requestor ID
            if (prData?.requestorId || prData?.createdBy) {
              const requestorIdStr = prData.requestorId || prData.createdBy;
              if (requestorIdStr && requestorIdStr !== 'null' && typeof requestorIdStr !== 'object') {
                const requestorInfo = await fetchUserInfo(requestorIdStr);
                if (requestorInfo) {
                  prData.requestor = requestorInfo;
                }
              }
            }
            
            // Process approval history
            if (prData?.approvals && prData.approvals.length > 0) {
              const updatedApprovals = await Promise.all(prData.approvals.map(async (approval) => {
                if (approval.approverId || typeof approval.approver === 'string') {
                  const approverId = approval.approverId || approval.approver;
                  if (approverId && approverId !== 'null') {
                    const approverInfo = await fetchUserInfo(approverId);
                    if (approverInfo) {
                      return { ...approval, approver: approverInfo };
                    }
                  }
                }
                return approval;
              }));
              
              setApprovalHistory(updatedApprovals);
            } else {
              setApprovalHistory([]);
            }
            
            // Update the PR data with resolved user info
            setPr(prData);
          } catch (err) {
            console.error('Error loading user data:', err);
          }
        };
        
        setPrItems(processedItems);
        loadUserData();
      })
      .catch(err => {
        console.error('Error loading PR:', err);
        setError(err.message || 'Error loading purchase requisition');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);
  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'draft':
        return 'default';
      case 'submitted':
        return 'processing';
      case 'partially_approved':
        return 'warning';
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      case 'completed':
        return 'success';
      default:
        return 'default';
    }
  };

  // Get step number for status
  const getStatusStepNumber = (status) => {
    switch (status) {
      case 'draft': return 0;
      case 'submitted': return 1;
      case 'partially_approved': return 2;
      case 'approved': return 3;
      case 'completed': return 4;
      case 'rejected': return 0;
      default: return 0;
    }
  };  // Check if current user can approve
  const canApprove = () => {
    if (pr?.status !== 'submitted') return false;
    
    // Try various fields that might contain the approver ID
    const approverIds = [
      // From object
      typeof pr?.approver === 'object' ? pr?.approver?.id || pr?.approver?._id : null,
      // From currentApprover object
      typeof pr?.currentApprover === 'object' ? pr?.currentApprover?.id || pr?.currentApprover?._id : null,
      // From direct string reference
      typeof pr?.approver === 'string' ? pr?.approver : null,
      // From specific ID fields
      pr?.approverId,
      pr?.currentApproverId
    ].filter(Boolean); // Remove null/undefined values
    
    const currentUserId = currentUser?.id || currentUser?._id;
    
    console.log('Checking approval permission:', {
      prStatus: pr?.status,
      approverIds,
      currentUserId,
      isMatch: approverIds.includes(currentUserId)
    });
    
    return approverIds.includes(currentUserId);
  };// Define columns for PR items table
  const itemColumns = [
    {
      title: translate('Actions'),
      key: 'actions',
      width: 100,      render: (_, record) => {
        // Check if the item is missing price
        const availablePrice = record.price || record.contractPrice || record.lastPrice || record.estimatedPrice || record.estimatedUnitPrice;
        const hasPriceIssue = !availablePrice || isNaN(parseFloat(availablePrice));
        
        return (
          <Space>
            {hasPriceIssue && pr?.status === 'draft' && pr?.createdBy === currentUser._id && (
              <Tooltip title={translate('Add price information')}>
                <Button 
                  type="primary" 
                  size="small" 
                  onClick={() => {
                    message.info(translate('This would open a price entry dialog in a real implementation'));
                    // In a real implementation, this would open a modal to edit the item price
                    // setEditingItem(record);
                    // setIsPriceModalVisible(true);
                  }}
                >
                  {translate('Add Price')}
                </Button>
              </Tooltip>
            )}
            
            <Tooltip title={translate('View price history from previous Purchase Requisitions')}>
              <Button
                type="default"
                size="small"
                icon={<HistoryOutlined />}
                onClick={() => lookupHistoricalPrices(record.id)}
              >
                {translate('Price History')}
              </Button>
            </Tooltip>
          </Space>
        );
      }
    },
    {
      title: translate('Item Name'),
      dataIndex: 'itemName',
      width: 200,
      render: (text, record) => (
        <>
          <div style={{ fontWeight: 'bold' }}>{text}</div>
          {record.inventoryNumber && (
            <div style={{ fontSize: '12px', color: '#666', marginTop: 4 }}>
              <Tag color="blue">{record.inventoryNumber}</Tag>
              {record.manufacturerName && (
                <div style={{ marginTop: 4 }}>
                  <Tag color="purple">{record.manufacturerName}</Tag>
                  {record.manufacturerPartNumber && <Tag>{record.manufacturerPartNumber}</Tag>}
                </div>
              )}
            </div>
          )}
        </>
      ),
    },    {
      title: translate('Description'),
      dataIndex: 'description',
      width: 300,
      render: (text) => (
        <div style={{ 
          wordWrap: 'break-word', 
          wordBreak: 'break-word',
          whiteSpace: 'pre-wrap',
          lineHeight: '1.4',
          maxHeight: '60px',
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical'
        }}>
          {text || '-'}
        </div>
      ),
    },    {
      title: translate('Quantity'),
      dataIndex: 'quantity',
      width: 100,
      align: 'right',
      render: (quantity) => (
        <div style={{ fontWeight: 'bold' }}>
          {quantity}
        </div>
      )
    },
    {
      title: translate('UOM'),
      dataIndex: 'uom',
      width: 80,
      render: (uom) => <Tag>{uom}</Tag>    },    {
      title: translate('Unit Price'),
      dataIndex: 'price',
      width: 150,
      align: 'right',
      render: (price, record) => {        console.log('Rendering price column for item:', {
          id: record.id,
          price,
          unitPrice: record.unitPrice,
          estimatedPrice: record.estimatedPrice,
          estimatedUnitPrice: record.estimatedUnitPrice,
          contractPrice: record.contractPrice,
          lastPrice: record.lastPrice
        });
        
        // Check for any available price options - Try ALL possible price fields
        const availablePrice = price || record.unitPrice || record.contractPrice || record.lastPrice || record.estimatedPrice || record.estimatedUnitPrice;
        
        if (availablePrice === null || availablePrice === undefined || availablePrice === '') {
          console.warn('No price available for item:', record.id);
          return (
            <Tooltip title={translate('No price information available')}>
              <Tag color="warning" style={{ margin: 0 }}>
                {translate('Pending')}
              </Tag>
            </Tooltip>
          );
        }
        
        try {
          const numPrice = typeof availablePrice === 'string' ? parseFloat(availablePrice) : availablePrice;
          if (isNaN(numPrice)) {
            return (
              <Tooltip title={translate('Invalid price format')}>
                <Tag color="error" style={{ margin: 0 }}>
                  {translate('Error')}
                </Tag>
              </Tooltip>
            );
          }          // Show price with source indication if available
          return (
            <div style={{ fontWeight: 'bold', color: '#1890ff' }}>
              <Tooltip title={
                pr?.status === 'draft' && pr?.createdBy === currentUser._id 
                  ? translate('Click to edit price') 
                  : translate('View price details')
              }>
                <div 
                  style={{ cursor: pr?.status === 'draft' && pr?.createdBy === currentUser._id ? 'pointer' : 'default' }}
                  onClick={() => {
                    if (pr?.status === 'draft' && pr?.createdBy === currentUser._id) {
                      updateItemPrice(record.id, numPrice);
                    }
                  }}
                >
                  {`${pr?.currency || 'USD'} ${numPrice.toFixed(2)}`}
                  {record.priceSource && (
                    <Tooltip title={translate(
                      record.priceSource === 'contract' 
                        ? 'Price from contract' 
                        : record.priceSource === 'estimated'
                          ? 'Using estimated price'
                          : record.priceSource === 'historical'
                            ? 'Price from previous purchase requisition'
                            : record.priceSource === 'manual'
                              ? 'Manually entered price'
                              : 'Price from last purchase'
                    )}>
                      <div style={{ fontSize: '12px', color: '#8c8c8c', marginTop: '4px' }}>
                        ({translate(
                          record.priceSource === 'contract' 
                            ? 'Contract' 
                            : record.priceSource === 'estimated'
                              ? 'Estimated'
                              : record.priceSource === 'historical'
                                ? 'Historical'
                                : record.priceSource === 'manual'
                                  ? 'Manual'
                                  : 'Last purchased'
                        )})
                      </div>
                    </Tooltip>
                  )}                </div>
              </Tooltip>
            </div>
          );
        } catch (e) {
          console.error('Error formatting price:', e);
          return (
            <Tooltip title={translate('Error processing price')}>
              <Tag color="error" style={{ margin: 0 }}>
                {translate('Error')}
              </Tag>
            </Tooltip>
          );
        }
      },
    },    {
      title: translate('Total'),
      dataIndex: 'total',
      width: 150,
      align: 'right',
      render: (_, record) => {
        console.log('Rendering total column for item:', {
          id: record.id,
          price: record.price,
          unitPrice: record.unitPrice,
          quantity: record.quantity
        });
          // Check for any available price options
        const availablePrice = record.price || record.unitPrice || record.contractPrice || record.lastPrice || record.estimatedPrice || record.estimatedUnitPrice;
        
        if (!availablePrice || !record.quantity) {
          return (
            <Tooltip title={translate('Missing price or quantity information')}>
              <Tag color="warning" style={{ margin: 0 }}>
                {translate('Pending')}
              </Tag>
            </Tooltip>
          );
        }
          try {
          const price = typeof availablePrice === 'string' ? parseFloat(availablePrice) : availablePrice;
          const quantity = typeof record.quantity === 'string' ? parseFloat(record.quantity) : record.quantity;
          
          if (isNaN(price) || isNaN(quantity)) {
            console.error('Invalid price or quantity format:', { price, quantity, record });
            return (
              <Tooltip title={translate('Invalid price or quantity format')}>
                <Tag color="error" style={{ margin: 0 }}>
                  {translate('Error')}
                </Tag>
              </Tooltip>
            );
          }
          
          const total = price * quantity;
          console.log('Calculated total:', { price, quantity, total, id: record.id });
          return (
            <div style={{ fontWeight: 'bold' }}>
              {`${pr?.currency || 'USD'} ${total.toFixed(2)}`}
            </div>
          );
        } catch (e) {
          console.error('Error calculating total:', e);
          return (
            <Tooltip title={translate('Error calculating total')}>
              <Tag color="error" style={{ margin: 0 }}>
                {translate('Error')}
              </Tag>
            </Tooltip>
          );
        }
      },
    },
  ];

  // Handle status actions
  const handleSubmit = async () => {    setActionLoading(true);
    try {
      await request.update({
        entity: 'procurement/purchase-requisition',
        id,
        jsonData: { status: 'submitted' }
      });
      // Reload PR data
      window.location.reload();
    } catch (err) {
      message.error(translate('Error submitting PR'));
    } finally {
      setActionLoading(false);
    }
  };  // Function to look up historical prices for an item from past PRs
  const lookupHistoricalPrices = async (itemId) => {
    try {
      setActionLoading(true);
      
      // Simulate API call with mock data (in a real implementation, this would be a backend call)
      setTimeout(() => {
        const mockPriceHistory = [
          {
            id: 'pr-item-001',
            date: '2025-05-15',
            prNumber: 'PR-2025-001',
            unitPrice: 125.50,
            status: 'approved',
            currency: 'USD'
          },
          {
            id: 'pr-item-002',
            date: '2025-04-22',
            prNumber: 'PR-2025-002',
            unitPrice: 128.75,
            status: 'approved',
            currency: 'USD'
          },
          {
            id: 'pr-item-003',
            date: '2025-03-10',
            prNumber: 'PR-2025-003',
            unitPrice: 130.00,
            status: 'approved',
            currency: 'USD'
          },
          {
            id: 'pr-item-004',
            date: '2025-02-05',
            prNumber: 'PR-2025-004',
            unitPrice: 119.99,
            status: 'approved',
            currency: 'USD'
          }
        ];
        
        // Show historical prices in a modal
        Modal.info({
          title: translate('Price History'),
          width: 700,
          content: (
            <div>
              <p>{translate('Below are previous prices for this item from other Purchase Requisitions:')}</p>
              <Table 
                dataSource={mockPriceHistory.map((item, index) => ({ ...item, key: index }))} 
                columns={[
                  {
                    title: translate('Date'),
                    dataIndex: 'date',
                    render: (date) => moment(date).format('YYYY-MM-DD')
                  },
                  {
                    title: translate('PR Number'),
                    dataIndex: 'prNumber'
                  },
                  {
                    title: translate('Unit Price'),
                    dataIndex: 'unitPrice',
                    render: (price) => (
                      <span style={{ fontWeight: 'bold' }}>
                        {`${pr?.currency || 'USD'} ${parseFloat(price).toFixed(2)}`}
                      </span>
                    )
                  },
                  {
                    title: translate('Status'),
                    dataIndex: 'status',
                    render: (status) => (
                      <Tag color={
                        status === 'approved' ? 'green' : 
                        status === 'submitted' ? 'blue' : 
                        status === 'rejected' ? 'red' : 
                        'default'
                      }>
                        {status}
                      </Tag>
                    )
                  },
                  {
                    title: translate('Actions'),
                    render: (_, record) => (
                      <Button 
                        type="primary" 
                        size="small"
                        onClick={() => useHistoricalPrice(itemId, record.unitPrice)}
                      >
                        {translate('Use This Price')}
                      </Button>
                    )
                  }
                ]}
                pagination={false}
                size="small"
              />
            </div>
          ),
          onOk() {},
        });
        
        setActionLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching price history:', error);
      message.error(translate('Failed to fetch price history'));
      setActionLoading(false);
    }
  };
  // Function to use a historical price for an item
  const useHistoricalPrice = (itemId, price) => {
    try {
      setActionLoading(true);
      
      // Create a copy of the items array
      const updatedItems = [...prItems];
      
      // Find the item with matching ID and update its price
      const itemIndex = updatedItems.findIndex(item => item.id === itemId);
        if (itemIndex !== -1) {
        updatedItems[itemIndex].price = price;
        updatedItems[itemIndex].unitPrice = price; // Also set unitPrice
        updatedItems[itemIndex].priceSource = 'historical';
        
        // Update the local state
        setPrItems(updatedItems);
        
        message.success(translate('Price has been updated from historical data'));
      } else {
        message.error(translate('Could not find the item to update'));
      }
      
      setActionLoading(false);
    } catch (error) {
      console.error('Error updating price:', error);
      message.error(translate('Failed to update price'));
      setActionLoading(false);
    }
  };
  // Function to manually update an item's price
  const updateItemPrice = (itemId, newPrice) => {
    Modal.confirm({
      title: translate('Update Item Price'),
      content: (
        <div>
          <p>{translate('Enter the new unit price for this item:')}</p>
          <InputNumber 
            style={{ width: '100%' }}
            defaultValue={newPrice || 0}
            min={0}
            precision={2}
            onChange={(value) => setTempPrice(value)}
          />
        </div>
      ),
      onOk: async () => {
        try {
          // In a real implementation, this would update the price in the database
          // For demonstration, we'll just update the local state
          
          const updatedItems = [...prItems];
          const itemIndex = updatedItems.findIndex(item => item.id === itemId);
            if (itemIndex !== -1) {
            updatedItems[itemIndex].price = tempPrice;
            updatedItems[itemIndex].unitPrice = tempPrice; // Also set unitPrice
            updatedItems[itemIndex].priceSource = 'manual';
            setPrItems(updatedItems);
            
            message.success(translate('Price has been updated'));
          } else {
            message.error(translate('Could not find the item to update'));
          }
        } catch (error) {
          console.error('Error updating price:', error);
          message.error(translate('Failed to update price'));
        }
      }
    });
  };
  
  // Show loading state
  if (loading) {    return (
      <ErpLayout>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
          <Spin size="large">
            <div style={{ padding: '50px', minHeight: '200px', minWidth: '300px', textAlign: 'center' }}>
              {translate('Loading purchase requisition...')}
            </div>
          </Spin>
        </div>
      </ErpLayout>
    );
  }

  // Show error state
  if (error || !pr) {
    return (
      <ErpLayout>
        <div style={{ padding: '24px' }}>
          <Alert
            message={translate('Error')}
            description={error || translate('Could not load purchase requisition')}
            type="error"
            showIcon
            action={
              <Button size="small" onClick={() => navigate(-1)} icon={<ArrowLeftOutlined />}>
                {translate('Go Back')}
              </Button>
            }
          />
        </div>
      </ErpLayout>
    );
  }
  // Check if any items are missing prices
  const itemsMissingPrice = prItems.filter(item => {
    const availablePrice = item.price || item.contractPrice || item.lastPrice || item.estimatedPrice || item.estimatedUnitPrice;
    return !availablePrice || isNaN(parseFloat(availablePrice));
  }).length;

  return (
    <ErpLayout>
      <div style={{ padding: '0 24px' }}>
        {itemsMissingPrice > 0 && pr?.status === 'draft' && (
          <Alert
            message={translate('Missing Price Information')}
            description={
              <>
                <p>
                  {translate('This purchase requisition has')} <strong>{itemsMissingPrice}</strong> {translate(itemsMissingPrice === 1 ? 'item' : 'items')} {translate('without price information.')}
                </p>
                {pr?.createdBy === currentUser._id && (
                  <p>
                    {translate('Please add price information to all items before submitting for approval.')}
                  </p>
                )}
              </>
            }
            type="warning"
            showIcon
            style={{ marginBottom: 16 }}
            action={
              pr?.createdBy === currentUser._id && (
                <Button size="small" type="primary">
                  {translate('Add Missing Prices')}
                </Button>
              )
            }
          />
        )}
        
        <Card 
          title={
            <Space direction="vertical" size={16} style={{ width: '100%' }}>
              <Space>                <Title level={4} style={{ margin: 0 }}>
                  {translate('Purchase Requisition')}: {pr?.prNumber || pr?.number || id}
                </Title>
                <Tag color={getStatusColor(pr?.status)}>
                  {translate(pr?.status?.replace(/_/g, ' ').toUpperCase())}
                </Tag>
              </Space>
              
              <Steps current={getStatusStepNumber(pr?.status)} size="small" style={{ marginBottom: 16 }}>
                <Step title={translate('Draft')} description={translate('Created')} />
                <Step title={translate('Pending')} description={translate('For Approval')} />
                <Step title={translate('Review')} description={translate('In Progress')} />
                <Step title={translate('Approved')} description={translate('Complete')} />
              </Steps>
            </Space>
          }
          extra={
            <Space>
              <Button onClick={() => navigate('/purchase-requisition')} icon={<ArrowLeftOutlined />}>
                {translate('Back')}
              </Button>
              {pr?.status === 'draft' && pr?.createdBy === currentUser._id && (
                <>
                  <Button 
                    type="primary"
                    icon={<EditOutlined />}
                    onClick={() => navigate(`/purchase-requisition/update/${id}`)}
                  >
                    {translate('Edit')}
                  </Button>
                  <Button 
                    type="primary"
                    icon={<SendOutlined />}
                    onClick={handleSubmit}
                    loading={actionLoading}
                  >
                    {translate('Submit for Approval')}
                  </Button>
                </>
              )}
              {canApprove() && (
                <>
                  <Button 
                    type="primary"
                    icon={<CheckOutlined />}
                    onClick={() => setIsApproveModalVisible(true)}
                  >
                    {translate('Approve')}
                  </Button>
                  <Button 
                    danger
                    icon={<CloseOutlined />}
                    onClick={() => setIsRejectModalVisible(true)}
                  >
                    {translate('Reject')}
                  </Button>
                </>
              )}
              <Button icon={<PrinterOutlined />} onClick={() => window.print()}>
                {translate('Print')}
              </Button>
            </Space>
          }
        >          <Descriptions bordered column={2}>
            <Descriptions.Item label={translate('PR Number')} span={2}>{pr?.prNumber}</Descriptions.Item>
            <Descriptions.Item label={translate('Description')} span={2}>
              <div style={{ 
                wordWrap: 'break-word', 
                wordBreak: 'break-word',
                whiteSpace: 'pre-wrap',
                lineHeight: '1.5'
              }}>
                {pr?.description || '-'}
              </div>
            </Descriptions.Item>            <Descriptions.Item label={translate('Cost Center')}>{pr?.costCenter}</Descriptions.Item>
            <Descriptions.Item label={translate('Priority')}>
              {pr?.priority ? (
                <Tag 
                  color={
                    pr.priority === 'high' ? 'red' : 
                    pr.priority === 'medium' ? 'orange' : 
                    'green'
                  }
                >
                  {pr.priority.toUpperCase()}
                </Tag>
              ) : '-'}
            </Descriptions.Item>
            <Descriptions.Item label={translate('Currency')}>{pr?.currency}</Descriptions.Item>
            <Descriptions.Item label={translate('Total Value')}>
              {pr?.totalAmount ? `${pr?.currency} ${pr?.totalAmount.toFixed ? pr.totalAmount.toFixed(2) : pr.totalAmount}` : '-'}
            </Descriptions.Item>            <Descriptions.Item label={translate('Created By')}>
              {pr?.requestor 
                ? (typeof pr.requestor === 'object' 
                   ? (pr.requestor.name || pr.requestor.email || `User-${pr.requestorId?.substr(0, 4)}`) 
                   : pr.requestor)
                : typeof pr?.createdBy === 'object'
                  ? (pr.createdBy.name || pr.createdBy.email || `User-${pr.createdById?.substr(0, 4)}`)
                  : pr?.createdBy || 'System Administrator'}
            </Descriptions.Item>
            <Descriptions.Item label={translate('Created Date')}>
              {pr?.createdAt ? new Date(pr?.createdAt).toLocaleString() : '-'}
            </Descriptions.Item>
            <Descriptions.Item label={translate('Required Date')}>
              {pr?.requiredDate ? new Date(pr?.requiredDate).toLocaleDateString() : '-'}
            </Descriptions.Item>            <Descriptions.Item label={translate('Current Approver')}>              {pr?.currentApprover ? (
                <Tag color="processing">                  {typeof pr.currentApprover === 'object' && pr.currentApprover !== null 
                    ? (pr.currentApprover.name || pr.currentApprover.email || `User-${pr.currentApproverId?.substr(0, 4)}`) 
                    : typeof pr.currentApprover === 'string'
                      ? pr.currentApprover
                      : 'Assigned'}
                </Tag>              ) : pr?.approver ? (
                <Tag color="processing">                  {typeof pr.approver === 'object' && pr.approver !== null 
                    ? (pr.approver.name || pr.approver.email || `User-${pr.approverId?.substr(0, 4)}`)
                    : typeof pr.approver === 'string'
                      ? pr.approver
                      : pr.approverId 
                        ? `User-${pr.approverId.substr(0, 4)}` 
                        : 'Assigned'}
                </Tag>
              ) : pr?.currentApproverId ? (
                <Tag color="processing">
                  {`User ${pr.currentApproverId.substr(0, 8)}...`}
                </Tag>
              ) : pr?.approverId ? (
                <Tag color="processing">
                  {`User ${pr.approverId.substr(0, 8)}...`}
                </Tag>
              ) : '-'}
            </Descriptions.Item>{pr?.supplier && (
              <Descriptions.Item label={translate('Supplier')} span={2}>
                {typeof pr.supplier === 'object' 
                  ? (pr.supplier.legalName || pr.supplier.tradeName || pr.supplier.name || 'Unknown Supplier') 
                  : typeof pr.supplier === 'string'
                    ? pr.supplier
                    : 'Unknown Supplier'} 
                {typeof pr.supplier === 'object' && pr.supplier.email && (
                  <Text type="secondary"> ({pr.supplier.email})</Text>
                )}
                {typeof pr.supplier === 'object' && pr.supplier.contactEmail && !pr.supplier.email && (
                  <Text type="secondary"> ({pr.supplier.contactEmail})</Text>
                )}
              </Descriptions.Item>
            )}{pr?.justification && (
              <Descriptions.Item label={translate('Justification')} span={2}>
                <div style={{ 
                  wordWrap: 'break-word', 
                  wordBreak: 'break-word',
                  whiteSpace: 'pre-wrap',
                  lineHeight: '1.5',
                  fontStyle: 'italic',
                  backgroundColor: '#f9f9f9',
                  padding: '8px',
                  borderLeft: '4px solid #1890ff'
                }}>
                  {pr.justification}
                </div>
              </Descriptions.Item>
            )}
            
            {pr?.notes && (
              <Descriptions.Item label={translate('Comments')} span={2}>
                <div style={{ 
                  wordWrap: 'break-word', 
                  wordBreak: 'break-word',
                  whiteSpace: 'pre-wrap',
                  lineHeight: '1.5'
                }}>
                  {pr.notes}
                </div>
              </Descriptions.Item>
            )}
          </Descriptions>
        </Card>
        
        <Card 
          title={
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>{translate('Items')}</span>
              {itemsMissingPrice > 0 && pr?.status === 'draft' && pr?.createdBy === currentUser._id && (
                <Tag color="warning">
                  {translate('Price information needed')}
                </Tag>
              )}
            </div>
          }          style={{ marginTop: 16 }}>
          {itemsMissingPrice > 0 && pr?.status === 'draft' && pr?.createdBy === currentUser._id && (
            <Alert              message={translate('Some items are missing price information')}
              description={translate('The system is using any available price information (including contract prices, estimated prices, and last purchased prices) for total calculations. For more accurate totals, you can use the "Add Price" button for items with missing prices.')}
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
          )}
          
          {prItems && prItems.length > 0 ? (              <div style={{ overflowX: 'auto' }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  margin: '0 0 16px 0'
                }}>
                  <h3 style={{ margin: 0 }}>
                    {translate('Total Items')}: <Tag color="blue">{prItems.length}</Tag>
                  </h3>
                {/* Calculate total value here */}
                {(() => {
                  let totalValue = 0;
                  let itemsWithPrice = 0;
                  let itemsWithoutPrice = 0;
                  
                  prItems.forEach((item) => {
                    console.log('Grand total calculation for item:', {
                      id: item.id,
                      price: item.price,
                      unitPrice: item.unitPrice,
                      quantity: item.quantity
                    });
                    
                    // Check for any available price options
                    const availablePrice = item.price || item.unitPrice || item.contractPrice || item.lastPrice || item.estimatedPrice || item.estimatedUnitPrice;
                    
                    if (availablePrice !== null && availablePrice !== undefined && item.quantity) {
                      const price = typeof availablePrice === 'string' ? parseFloat(availablePrice) : availablePrice;
                      const quantity = typeof item.quantity === 'string' ? parseFloat(item.quantity) : item.quantity;
                      if (!isNaN(price) && !isNaN(quantity)) {
                        totalValue += (price * quantity);
                        itemsWithPrice++;
                      } else {
                        itemsWithoutPrice++;
                      }
                    } else {
                      itemsWithoutPrice++;
                    }
                  });
                    return (
                    <div style={{ 
                      padding: '8px 16px',
                      backgroundColor: '#f0f7ff',
                      borderRadius: '4px',
                      border: '1px solid #1890ff'
                    }}>
                      <div>
                        <span style={{ marginRight: '8px' }}>{translate('Grand Total')}:</span>
                        <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#1890ff' }}>
                          {`${pr?.currency || 'USD'} ${totalValue.toFixed(2)}`}
                        </span>
                      </div>
                      
                      {itemsWithoutPrice > 0 && (
                        <div style={{ fontSize: '12px', color: '#ff4d4f', marginTop: '4px' }}>
                          * {translate('Note')}: {itemsWithoutPrice} {translate(itemsWithoutPrice === 1 ? 'item is' : 'items are')} {translate('missing price information')}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>              <Table 
                dataSource={prItems} 
                columns={itemColumns} 
                rowKey={record => record.id || record._id || Math.random().toString()}
                pagination={prItems.length > 5 ? { 
                  pageSize: 5, 
                  position: ['bottomCenter'],
                  showTotal: (total, range) => `${range[0]}-${range[1]} ${translate('of')} ${total} ${translate('items')}`
                } : false}
                scroll={{ x: 1000, y: prItems.length > 5 ? 400 : undefined }}
                bordered
                sticky={{ offsetHeader: 0, offsetScroll: 0 }}
                tableLayout="fixed"                summary={() => {
                  // Calculate total for ALL items, not just current page
                  let totalValue = 0;
                  prItems.forEach((item) => {
                    // Check for any available price options
                    const availablePrice = item.price || item.unitPrice || item.contractPrice || item.lastPrice || item.estimatedPrice || item.estimatedUnitPrice;
                    
                    if (availablePrice !== null && availablePrice !== undefined && item.quantity) {
                      const price = typeof availablePrice === 'string' ? parseFloat(availablePrice) : availablePrice;
                      const quantity = typeof item.quantity === 'string' ? parseFloat(item.quantity) : item.quantity;
                      if (!isNaN(price) && !isNaN(quantity)) {
                        totalValue += (price * quantity);
                        console.log('Adding to total:', { price, quantity, itemTotal: price * quantity, totalSoFar: totalValue });
                      } else {
                        console.warn('Item has invalid price or quantity:', { price, quantity, item });
                      }
                    } else {
                      console.warn('Item missing price or quantity:', { 
                        id: item.id,                        price: item.price, 
                        unitPrice: item.unitPrice,
                        contractPrice: item.contractPrice,
                        lastPrice: item.lastPrice,
                        estimatedPrice: item.estimatedPrice,
                        estimatedUnitPrice: item.estimatedUnitPrice,
                        quantity: item.quantity
                      });
                    }
                  });
                  
                  return (
                    <>
                      <Table.Summary.Row style={{ 
                        backgroundColor: '#f0f7ff',
                        fontWeight: 'bold',
                        fontSize: '16px',
                        borderTop: '2px solid #1890ff'
                      }}>
                        <Table.Summary.Cell index={0} colSpan={4} style={{ padding: '12px 16px' }}>
                          <strong>{translate('Total')}</strong>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={1} style={{ padding: '12px 16px' }}>
                          <strong style={{ color: '#1890ff', fontSize: '16px' }}>
                            {`${pr?.currency || 'USD'} ${totalValue.toFixed(2)}`}
                          </strong>
                        </Table.Summary.Cell>
                      </Table.Summary.Row>
                    </>
                  );
                }}
              />
            </div>
          ) : (
            <Alert 
              message={translate('No items found')} 
              description={translate('This purchase requisition does not contain any items.')} 
              type="info" 
              showIcon 
            />
          )}        </Card>
        
        {/* Attachments card */}
        <Card 
          title={<Space><PaperClipOutlined /> {translate('Attachments')}</Space>} 
          style={{ marginTop: 16 }}
        >
          {pr?.attachments && pr.attachments.length > 0 ? (
            <List
              itemLayout="horizontal"
              dataSource={pr.attachments}
              renderItem={attachment => {
                const fileName = attachment.originalName || attachment.fileName || 'Unknown file';
                // Build the correct download URL
                const filePath = attachment.path || attachment.url || '';
                const downloadUrl = filePath ? `${DOWNLOAD_BASE_URL}${filePath.startsWith('/') ? '' : '/'}${filePath}` : '';
                
                return (
                  <List.Item
                    actions={[
                      <Tooltip title={translate('Download')}>
                        <Button 
                          type="link" 
                          icon={<DownloadOutlined />} 
                          onClick={() => window.open(downloadUrl, '_blank')}
                        />
                      </Tooltip>
                    ]}
                  >
                    <List.Item.Meta
                      avatar={<Avatar icon={getFileIcon(fileName)} />}
                      title={fileName}
                      description={
                        <Space>
                          {attachment.size && (
                            <Text type="secondary">
                              {(attachment.size / 1024).toFixed(2)} KB
                            </Text>
                          )}
                          {attachment.uploadDate && (
                            <Text type="secondary">
                              {new Date(attachment.uploadDate).toLocaleString()}
                            </Text>
                          )}
                        </Space>
                      }
                    />
                  </List.Item>
                );
              }}
            />
          ) : (
            <Empty 
              image={Empty.PRESENTED_IMAGE_SIMPLE} 
              description={translate('No attachments')} 
            />
          )}
        </Card>

        {approvalHistory.length > 0 && (
          <Card title={<Space><HistoryOutlined /> {translate('Approval History')}</Space>} style={{ marginTop: 16 }}>
            <Timeline mode="left">
              {approvalHistory.map((approval, index) => (
                <Timeline.Item 
                  key={index}
                  color={approval.status === 'approved' ? 'green' : approval.status === 'rejected' ? 'red' : 'blue'}
                >                  <Text strong>
                    {translate(approval.approvalLevel ? `Level ${approval.approvalLevel}` : 'Approval')} - {(approval.status || 'processed').toUpperCase()
                  }</Text>
                  <br />                  <Text type="secondary">
                    {typeof approval.approver === 'object' 
                      ? (approval.approver.name || approval.approver.username || approval.approver.email || 'Unknown')
                      : approval.approverId 
                        ? `User ${approval.approverId.substr(0, 8)}...`
                        : approval.approver || 'System'} - {approval.date ? new Date(approval.date).toLocaleString() : 'Date not recorded'}
                  </Text>
                  {approval.comments && (
                    <p style={{ marginTop: 8 }}>{approval.comments}</p>
                  )}
                </Timeline.Item>
              ))}
            </Timeline>
          </Card>
        )}
      </div>
    </ErpLayout>
  );
}

// Wrapper component to provide App context
function PurchaseRequisitionRead() {
  return (
    <App>
      <PurchaseRequisitionReadSimple />
    </App>
  );
}

export default PurchaseRequisitionRead;
