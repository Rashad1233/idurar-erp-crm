// Enhanced static tooltip with touch device support and accessibility improvements
import React from 'react';
import { InfoCircleOutlined } from '@ant-design/icons';

/**
 * Enhanced StaticTooltipHeader component with touch device support and accessibility
 * This component is completely isolated from React's state management
 * to prevent infinite rendering loops
 */
export const EnhancedStaticTooltipHeader = React.memo(function EnhancedStaticTooltipHeader({ 
  title, 
  tooltipText, 
  tooltipId 
}) {
  // Use a ref to track tooltip state without triggering re-renders
  const tooltipRef = React.useRef(null);
  // Generate unique ID for ARIA attributes if not provided
  const uniqueId = React.useMemo(() => 
    tooltipId || `tooltip-${Math.random().toString(36).substr(2, 9)}`, 
    [tooltipId]
  );
  
  // Enhanced handlers for both mouse and touch events
  const showTooltip = React.useCallback((e) => {
    if (tooltipRef.current) {
      tooltipRef.current.style.display = 'block';
    }
  }, []);
  
  const hideTooltip = React.useCallback((e) => {
    if (tooltipRef.current) {
      tooltipRef.current.style.display = 'none';
    }
  }, []);
  
  // Toggle for touch devices
  const toggleTooltip = React.useCallback((e) => {
    if (tooltipRef.current) {
      const isVisible = tooltipRef.current.style.display === 'block';
      tooltipRef.current.style.display = isVisible ? 'none' : 'block';
      
      // If opening the tooltip, close it after a delay
      if (!isVisible) {
        setTimeout(() => {
          if (tooltipRef.current) {
            tooltipRef.current.style.display = 'none';
          }
        }, 3000); // Auto-close after 3 seconds
      }
    }
  }, []);
  
  // Handle click outside to close tooltip
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (tooltipRef.current && 
          tooltipRef.current.style.display === 'block' &&
          !event.target.closest('.static-tooltip-trigger')) {
        tooltipRef.current.style.display = 'none';
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);
  
  return (
    <div className="static-tooltip-header">
      <span>{title}</span>
      {tooltipText && (
        <span 
          className="static-tooltip-trigger"
          aria-describedby={uniqueId}
        >
          <InfoCircleOutlined 
            style={{ marginLeft: '5px', color: 'rgba(0,0,0,.45)' }} 
            onMouseEnter={showTooltip}
            onMouseLeave={hideTooltip}
            onClick={toggleTooltip} // For touch devices
            role="button"
            tabIndex={0}
            aria-label={`Info about ${title}`}
          />
          <div 
            ref={tooltipRef}
            id={uniqueId}
            className="static-tooltip-content"
            style={{ display: 'none' }}
            role="tooltip"
          >
            {tooltipText}
          </div>
        </span>
      )}
    </div>
  );
});

export default EnhancedStaticTooltipHeader;
