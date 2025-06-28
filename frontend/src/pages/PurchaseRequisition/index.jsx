import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';

import { Button, Input, Menu, Tag, App } from 'antd';
import { PlusOutlined, EyeOutlined, EditOutlined, CheckOutlined, SearchOutlined, InfoCircleOutlined, ArrowRightOutlined, MinusOutlined } from '@ant-design/icons';

// Import our custom procurement table styles
import '@/styles/procurement-tables.css';
// Import global tooltip disabling CSS
import '@/styles/disable-tooltips.css';
// Import title attribute suppression
import '@/styles/title-attribute-fix.css';

import { ErpLayout } from '@/layout';

import { useSelector } from 'react-redux';
import { selectCurrentUser } from '@/redux/auth/selectors';

import useLanguage from '@/locale/useLanguage';
import SearchItem from '@/components/SearchItem';
import SimpleDataTable from '@/components/SimpleDataTable';
import { DOWNLOAD_BASE_URL } from '@/config/serverApiConfig';
import RenderTracker from '@/components/debug/RenderTracker';

import useApiData from '@/hooks/useApiData';
import useApiSearch from '@/hooks/useApiSearch';

// System Admin ID
const SYSTEM_ADMIN_ID = "0b4afa3e-8582-452b-833c-f8bf695c4d60";

function PurchaseRequisition() {
  const { message } = App.useApp();
  const [refreshTrigger, setRefreshTrigger] = useState(false);
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);
  const tableContainerRef = useRef(null);
  const { data: items, loading: isLoading, error: apiError } = useApiData('/procurement/purchase-requisition', refreshTrigger);
  
  // Search functionality with our new hook
  const { 
    searchTerm, 
    setSearchTerm, 
    searchResults, 
    isSearching, 
    error: searchError, 
    search, 
    clearSearch 
  } = useApiSearch('/procurement/purchase-requisition', { fields: 'prNumber,description,costCenter,status,currency' });  const translate = useLanguage();
  const currentUser = useSelector(selectCurrentUser);
  
  // Memoize translated tooltip text to prevent re-renders
  const tooltipText = React.useMemo(() => {
    return translate("Search across all purchase requisition fields including number, description, cost center, status, supplier and comments");
  }, [translate]);
  // ULTRA STATIC TOOLTIP - NO REACT STATE UPDATES
  // Generate a static ID once, outside of any React lifecycle
  const STATIC_TOOLTIP_ID = 'static-search-tooltip-' + Math.random().toString(36).substring(2, 11);
  
  // Completely remove tooltip functionality to eliminate infinite loops
  const InfoIcon = React.useMemo(() => {
    return (
      <InfoCircleOutlined style={{ color: 'rgba(0,0,0,.45)' }} />
    );
  }, []);
  
  // Ultra-static search tooltip - no React state at all
  const TooltipIcon = React.useMemo(() => {
    return (
      <span className="tooltip-icon-wrapper" id={STATIC_TOOLTIP_ID}>
        {InfoIcon}
      </span>
    );
  }, [InfoIcon]);

  // Set up DOM event handlers for the ultra-static tooltip completely outside React's lifecycle
    // Handle workflow actions
  const handleSubmitPR = async (prId) => {
    try {
      const response = await fetch(`/api/procurement/purchase-requisition/${prId}/submit`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        message.success(translate('Purchase Requisition submitted successfully'));
        setRefreshTrigger(prev => !prev); // Refresh the list
      } else {
        const errorData = await response.json();
        message.error(errorData.message || translate('Failed to submit Purchase Requisition'));
      }
    } catch (error) {
      console.error('Error submitting PR:', error);
      message.error(translate('Failed to submit Purchase Requisition'));
    }
  };
  // Use setTimeout to ensure this runs after the component is mounted
  setTimeout(() => {
    const iconElement = document.getElementById(STATIC_TOOLTIP_ID);
    if (iconElement) {
      // Only create the tooltip element if it doesn't exist yet
      let tooltipElement = document.getElementById(STATIC_TOOLTIP_ID + '-content');
      if (!tooltipElement) {
        tooltipElement = document.createElement('div');
        tooltipElement.id = STATIC_TOOLTIP_ID + '-content';
        tooltipElement.className = 'static-tooltip-content search-tooltip';
        tooltipElement.style.display = 'none';
        tooltipElement.style.position = 'absolute';
        tooltipElement.style.zIndex = '9999';
        tooltipElement.style.backgroundColor = '#fff';
        tooltipElement.style.border = '1px solid #d9d9d9';
        tooltipElement.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
        tooltipElement.style.padding = '8px 12px';
        tooltipElement.style.borderRadius = '4px';
        tooltipElement.style.maxWidth = '300px';
        tooltipElement.textContent = translate("Search across all purchase requisition fields including number, description, cost center, status, supplier and comments");
        
        // Add tooltip element to the document body instead of as a child of the icon
        document.body.appendChild(tooltipElement);
      }
      
      // Function to position the tooltip
      const positionTooltip = () => {
        const rect = iconElement.getBoundingClientRect();
        tooltipElement.style.top = (rect.bottom + window.scrollY + 8) + 'px';
        tooltipElement.style.left = (rect.left + window.scrollX) + 'px';
      };
      
      // Handlers with no React state updates
      const showTooltip = () => { 
        tooltipElement.style.display = 'block';
        positionTooltip();
      };
      const hideTooltip = () => { 
        tooltipElement.style.display = 'none';
      };
      
      // Remove any existing listeners first to prevent duplicates
      iconElement.removeEventListener('mouseenter', showTooltip);
      iconElement.removeEventListener('mouseleave', hideTooltip);
      
      // Add event listeners directly to DOM
      iconElement.addEventListener('mouseenter', showTooltip);
      iconElement.addEventListener('mouseleave', hideTooltip);
    }
  }, 100); // Delay to ensure DOM is ready
  
  // Memoized search result count to prevent re-renders
  const searchResultsText = React.useMemo(() => {
    if (!searchTerm || !searchResults || searchResults.length === 0) return '';
    return ` (${searchResults.length} ${translate('results')})`;
  }, [searchTerm, searchResults?.length, translate]);
    // Check if horizontal scrolling is needed
  useEffect(() => {
    if (tableContainerRef.current) {
      const checkScroll = () => {
        const container = tableContainerRef.current;
        if (container) {
          setShowScrollIndicator(container.scrollWidth > container.clientWidth);
        }
      };
      
      checkScroll();
      
      // Also check when window is resized
      window.addEventListener('resize', checkScroll);
      return () => window.removeEventListener('resize', checkScroll);
    }
  }, [items?.length, searchResults?.length]); // Use lengths instead of full arrays to prevent infinite re-renders
  // Effect to log errors and data loading for debugging
  useEffect(() => {
    if (apiError) {
      console.error('Error loading purchase requisitions:', apiError);
    }
    
    if (searchError) {
      console.error('Error during search:', searchError);
    }
    
    if (items && items.length > 0) {
      console.log('Purchase requisitions loaded:', items.length);
    }
      if (searchResults && searchResults.length > 0) {
      console.log('Search results found:', searchResults.length);
    }
  }, [items?.length, apiError, searchResults?.length, searchError]); // Use lengths and stable error objects
    // Debounce ref for search
  const searchTimeoutRef = useRef(null);
    // Use useCallback for handlers to prevent recreation on every render
  const handleSearch = useCallback((queryValue) => {
    // Set the search term directly to avoid multiple state updates
    setSearchTerm(queryValue);
    
    // Clear any pending debounce
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = null;
    }
    
    // If the query is empty, clear search immediately
    if (!queryValue || queryValue.trim() === '') {
      clearSearch();
      return;
    }
    
    // Let useApiSearch handle the debouncing internally
    // We don't need additional debouncing here
  }, [setSearchTerm, clearSearch]);
  
  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);
    // Memoized input change handler
  const handleInputChange = useCallback((e) => {
    handleSearch(e.target.value);
  }, [handleSearch]);
    const handleClearSearch = useCallback(() => {
    clearSearch();
    setSearchTerm('');
  }, [clearSearch]);
  
  
    const dropdownMenu = (row) => {
    const recordId = row.id || row._id;
    const isCreator = row.createdBy === currentUser._id || row.createdBy === currentUser.id;
    
    return (
      <Menu>
        <Menu.Item key="view">
          <Link to={`/purchase-requisition/read/${recordId}`}>
            <EyeOutlined /> {translate('View Details')}
          </Link>
        </Menu.Item>
        {row.status === 'draft' && isCreator && (
          <Menu.Item key="edit">
            <Link to={`/purchase-requisition/update/${recordId}`}>
              <EditOutlined /> {translate('Edit')}
            </Link>
          </Menu.Item>
        )}
        {row.status === 'draft' && isCreator && (
          <Menu.Item key="submit">
            <Link to={`/purchase-requisition/submit/${recordId}`}>
              <CheckOutlined /> {translate('Submit for Approval')}
            </Link>
          </Menu.Item>
        )}
      </Menu>
    );
    };  const columns = React.useMemo(() => [    {
      title: translate('PR Number'),
      dataIndex: 'prNumber', // Updated to match database column
      key: 'prNumber',
      fixed: 'left', // Pin to left when scrolling horizontally
      width: 150,
      render: (text, record) => (
        <Link to={`/purchase-requisition/read/${record.id || record._id}`}>{text}</Link>
      ),
    },    {
      title: translate('Description'),
      dataIndex: 'description',
      key: 'description',
      width: 200,
      render: (text) => (
        <div style={{ 
          wordWrap: 'break-word', 
          wordBreak: 'break-word',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          maxWidth: '180px'
        }}>
          {text || '-'}
        </div>
      ),
    },{
      title: translate('Status'),
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => {
        let color = 'default';
        switch (status) {
          case 'draft':
            color = 'default';
            break;
          case 'submitted':
            color = 'processing';
            break;
          case 'partially_approved':
            color = 'warning';
            break;
          case 'approved':
            color = 'success';
            break;
          case 'rejected':
            color = 'error';
            break;
          case 'completed':
            color = 'blue';
            break;
          default:
            color = 'default';
        }
        return <Tag color={color}>{translate(status.replace(/_/g, ' ').toUpperCase())}</Tag>;
      },
    },    {
      title: translate('Total Amount'),
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 120,
      render: (value, record) => {
        const numValue = parseFloat(value) || 0;
        return `${record.currency || 'USD'} ${numValue.toFixed(2)}`;
      },
      sorter: (a, b) => a.totalAmount - b.totalAmount,
    },
    {
      title: translate('Currency'),
      dataIndex: 'currency',
      key: 'currency',
      width: 100,
    },
    {
      title: translate('Cost Center'),
      dataIndex: 'costCenter',
      key: 'costCenter',
      width: 120,
    },    {
      title: translate('Requestor'),
      dataIndex: 'requestor',
      key: 'requestor',
      width: 150,      render: (text, record) => {
        // Check if it's the system admin ID
        if (record.requestorId === SYSTEM_ADMIN_ID || 
            (record.requestor && record.requestor.id === SYSTEM_ADMIN_ID)) {
          return 'System Administrator';
        }
        
        // Handle both object and string/id formats
        if (record.requestor && typeof record.requestor === 'object') {
          return record.requestor.name || `User-${record.requestorId?.substr(0, 4)}`;
        } else if (record.requestorName) {
          return record.requestorName;
        } else if (record.requestorId) {
          return `User-${record.requestorId.substr(0, 4)}`;
        } else if (record.createdBy) {
          if (typeof record.createdBy === 'object') {
            if (record.createdBy.id === SYSTEM_ADMIN_ID) {
              return 'System Administrator';
            }
            return record.createdBy.name || `User-${record.createdById?.substr(0, 4)}`;
          } else if (record.createdBy === SYSTEM_ADMIN_ID) {
            return 'System Administrator';
          }
          return record.createdBy;
        }
        return 'System Administrator';
      },
    },{
      title: translate('Approver'),
      dataIndex: 'approver', 
      key: 'approver',
      width: 150,      render: (text, record) => {
        // Check if it's the system admin ID
        if (record.approverId === SYSTEM_ADMIN_ID || 
            (record.approver && record.approver.id === SYSTEM_ADMIN_ID)) {
          return 'System Administrator';
        }
        
        // Handle both object and string/id formats
        if (record.approver && typeof record.approver === 'object') {
          return record.approver.name || `User-${record.approverId?.substr(0, 4)}`;
        } else if (record.approverName) {
          return record.approverName;
        } else if (record.approverId) {
          return `User-${record.approverId.substr(0, 4)}`;
        }
        return 'Not Assigned';
      },
    },
    {
      title: translate('Current Approver'),
      dataIndex: 'currentApprover',
      key: 'currentApprover',
      width: 150,      render: (text, record) => {
        // Check if it's the system admin ID
        if (record.currentApproverId === SYSTEM_ADMIN_ID || 
            (record.currentApprover && record.currentApprover.id === SYSTEM_ADMIN_ID)) {
          return 'System Administrator';
        }
        
        // Handle both object and string/id formats
        if (record.currentApprover && typeof record.currentApprover === 'object') {
          return record.currentApprover.name || `User-${record.currentApproverId?.substr(0, 4)}`;
        } else if (record.currentApproverName) {
          return record.currentApproverName;
        } else if (record.currentApproverId) {
          return `User-${record.currentApproverId.substr(0, 4)}`;
        }
        return 'Not Assigned';
      },
    },{
      title: translate('Notes'),
      dataIndex: 'notes',
      key: 'notes',
      width: 150,
      render: (text) => (
        <div style={{ 
          wordWrap: 'break-word', 
          wordBreak: 'break-word',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          maxWidth: '130px'
        }}>
          {text || translate('No notes')}
        </div>
      ),
    },
    {
      title: translate('Attachments'),
      dataIndex: 'attachments',
      key: 'attachments',
      width: 120,
      render: (attachments) => {
        if (!attachments || attachments.length === 0) return translate('No attachments');
        return (
          <span>{attachments.length} {translate('file(s)')}</span>
        );
      },
    },
    {
      title: translate('Submitted At'),
      dataIndex: 'submittedAt',
      key: 'submittedAt',
      width: 150,
      render: (date) => date ? new Date(date).toLocaleString() : translate('Not submitted'),
      sorter: (a, b) => {
        if (!a.submittedAt) return -1;
        if (!b.submittedAt) return 1;
        return new Date(a.submittedAt) - new Date(b.submittedAt);
      },
    },    {
      title: translate('Approved At'),
      dataIndex: 'approvedAt',
      key: 'approvedAt',
      width: 150,
      render: (date) => date ? new Date(date).toLocaleString() : '',
    },
    {
      title: translate('Rejected At'),
      dataIndex: 'rejectedAt',
      key: 'rejectedAt',
      width: 150,
      render: (date) => date ? new Date(date).toLocaleString() : '',
    },{
      title: translate('Rejection Reason'),
      dataIndex: 'rejectionReason',
      key: 'rejectionReason',
      width: 150,
      render: (text) => text || '',
    },    {
      title: translate('Created By'),
      dataIndex: 'createdByName', // Use the flat field from backend
      key: 'createdBy',
      width: 120,
      render: (text, record) => {
        // Display 'Me' if the current user created this PR
        const createdById = record.createdById;
        const isCurrentUser = createdById && currentUser && 
                             (createdById === currentUser._id || createdById === currentUser.id);
        
        return isCurrentUser ? translate('Me') : (text || record.createdByName || 'Unknown');
      },
    },    {
      title: translate('Created At'),
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (date) => date ? new Date(date).toLocaleString() : '',
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    },
    {
      title: translate('Updated By'),
      dataIndex: 'updatedByName', // Use the flat field from backend
      key: 'updatedBy',
      width: 120,
      render: (text, record) => text || record.updatedByName || 'Unknown',
    },
    {
      title: translate('Updated At'),
      dataIndex: 'updatedAt',
      key: 'updatedAt',      width: 150,
      render: (date) => date ? new Date(date).toLocaleString() : '',
    },
    {
      title: translate('Actions'),
      key: 'actions',
      fixed: 'right',
      width: 200,
      render: (_, record) => {        const canSubmit = record.status === 'draft' && 
          (record.requestorId === currentUser?.id || currentUser?.role === 'admin');
        const canApprove = record.status === 'submitted' || record.status === 'pending_approval';
        const canView = true;

        return (
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            {canView && (
              <Link to={`/purchase-requisition/read/${record.id}`}>
                <Button 
                  type="default" 
                  size="small" 
                  icon={<EyeOutlined />}
                  title={translate('View')}
                >
                  {translate('View')}
                </Button>
              </Link>
            )}
            {canSubmit && (
              <Button 
                type="primary" 
                size="small" 
                icon={<ArrowRightOutlined />}
                title={translate('Submit for Approval')}
                onClick={() => handleSubmitPR(record.id)}
              >
                {translate('Submit')}
              </Button>
            )}            {canApprove && (
              <Link to={`/purchase-requisition/approval`}>
                <Button 
                  type="primary" 
                  size="small" 
                  icon={<ArrowRightOutlined />}
                  title={translate('Go to Review')}
                >
                  {translate('Review')}
                </Button>
              </Link>
            )}
          </div>
        );
      },
    }
  ], [translate, currentUser]);
  
  // Normalize data from API response - handle both array and object with data property
  const normalizeData = (apiData) => {
    if (!apiData) return [];
    if (Array.isArray(apiData)) return apiData;
    if (apiData.data && Array.isArray(apiData.data)) return apiData.data;
    return [];
  };

  // Enhanced logic to prevent blinking when toggling between search results and all items
  // Using useMemo to prevent re-creating the array on every render
  const displayedItems = React.useMemo(() => {
    return searchTerm 
      ? normalizeData(searchResults)  // Always use search results when search term is present, even if empty
      : normalizeData(items); // Default to all items when no search term
  }, [searchTerm, searchResults, items]);
      // Additional debugging to help troubleshoot data issues
  useEffect(() => {    if (displayedItems && displayedItems.length > 0) {
      console.log('Sample PR data structure:', displayedItems[0]);
    }  }, [displayedItems?.length]); // Only run when the length changes
      // Use useCallback to prevent recreating the function on every render
  const refreshList = React.useCallback(() => {
    setRefreshTrigger(prev => !prev);
  }, []);

  // Pre-process columns to prevent tooltip behaviors entirely
  const safeColumns = React.useMemo(() => {
    return columns.map(col => {
      const { ellipsis, tooltip, ...restCol } = col;
      return {
        ...restCol,
        // Remove any tooltip props that might exist
        showSorterTooltip: false,
        // Make sure all titles are simple strings
        title: typeof col.title === 'string' ? col.title : 
               typeof col.title === 'function' ? col.title() : 
               String(col.title),
        // Ensure render functions don't trigger tooltips
        render: col.render ? (text, record, index) => {
          const rendered = col.render(text, record, index);
          // If the rendered result is a React element, make sure it doesn't have tooltip props
          if (React.isValidElement(rendered)) {
            const { ellipsis, ...safeProps } = rendered.props || {};
            return React.cloneElement(rendered, {
              ...safeProps,
              title: undefined, 
              tooltip: undefined
            });
          }
          return rendered;
        } : undefined
      };
    });
  }, [columns]);
  
  return (
    <ErpLayout>
      {/* Add RenderTracker to monitor component renders */}
      <RenderTracker 
        componentName="PurchaseRequisition" 
        showInConsole={true}
        dependencies={{ 
          itemsLength: items?.length, 
          searchTermLength: searchTerm?.length,
          resultsLength: searchResults?.length,
          displayedItemsLength: displayedItems?.length
        }}
      />
      <div>
        <div className="action-panel">
          <div className="title-action-panel">
            <h3>{translate('Purchase Requisitions')}</h3>
          </div>
         <div className="action-buttons">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                window.location.href = '/purchase-requisition/create';
              }}
              style={{ marginRight: '10px' }}
            >
              {translate('Create New')}
            </Button>
            <Button onClick={refreshList}>
              {translate('Refresh')}
            </Button>
          </div>        </div>

        <div className="search-container">
          <Input
            prefix={<SearchOutlined />}
            placeholder={translate("Search by PR Number, Description, Cost Center, Status...")}
            value={searchTerm}
            onChange={handleInputChange}
            style={{ width: 400 }}
            allowClear
            suffix={
              isSearching ? (
                <span className="ant-input-search-icon">
                  <div className="ant-spin-nested-loading">
                    <div className="ant-spin ant-spin-small ant-spin-spinning">
                      <span className="ant-spin-dot ant-spin-dot-spin">
                        <i className="ant-spin-dot-item"></i>
                        <i className="ant-spin-dot-item"></i>
                        <i className="ant-spin-dot-item"></i>
                        <i className="ant-spin-dot-item"></i>
                      </span>
                    </div>
                  </div>
                </span>
              ) : (
                TooltipIcon
              )
            }
          />
          {searchError && <div className="search-error">{searchError}</div>}
          {searchTerm && (
            <Button 
              onClick={handleClearSearch}
              type="link"
              style={{ marginLeft: 8 }}
            >
              {translate('Clear Search')}
              {searchResultsText}
            </Button>
          )}
        </div>

        <div 
          ref={tableContainerRef}
          style={{ 
            width: '100%', 
            overflowX: 'auto',
            overflowY: 'visible'
          }}
          onScroll={() => console.log('Table scrolling detected')}
        >
          <SimpleDataTable
            columns={safeColumns}
            dataSource={displayedItems}
            isLoading={isLoading || (isSearching && searchTerm.length > 1)}
            pagination={{
              showSizeChanger: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} items`,
            }}            rowKey={(record) => record.id || record._id}
            scroll={{ x: 2500 }} // Enable horizontal scrolling with larger fixed width
            size="small" // Make the table more compact for many columns
            bordered // Add borders for better column visibility
            expandable={{              expandedRowRender: (record) => (
                <div style={{ margin: 0 }}>
                  <h4>{translate('Notes')}</h4>
                  <div style={{ 
                    wordWrap: 'break-word', 
                    wordBreak: 'break-word',
                    whiteSpace: 'pre-wrap',
                    lineHeight: '1.5',
                    padding: '8px 0'
                  }}>
                    {record.notes || translate('No notes')}
                  </div>
                  
                  {record.items && record.items.length > 0 && (
                    <div>
                      <h4>{translate('Items')}</h4>
                      <ul>
                        {record.items.map((item, idx) => (
                          <li key={idx}>
                            {item.description || item.itemNumber} - {item.quantity} {item.uom} x {item.price} {record.currency}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ),
              // Make sure expanded row doesn't use tooltips
              expandIcon: ({ expanded, onExpand, record }) => expanded ?
                <Button type="text" onClick={e => onExpand(record, e)} icon={<MinusOutlined />} size="small" /> :
                <Button type="text" onClick={e => onExpand(record, e)} icon={<PlusOutlined />} size="small" />
            }}
            locale={{
              emptyText: searchTerm ? 
                translate(`No purchase requisitions found matching "${searchTerm}". Try a different search term.`) : 
                translate('No purchase requisitions found')
            }}
          />
        </div>
      </div>
    </ErpLayout>
  );
}

// Wrapper component to provide App context
function PurchaseRequisitionWrapper() {
  return (
    <App>
      <PurchaseRequisition />
    </App>
  );
}

export default PurchaseRequisitionWrapper;
