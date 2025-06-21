// Static tooltip header component for performance
// Isolated from main component to prevent render loops
import React from 'react';
import { InfoCircleOutlined } from '@ant-design/icons';

// A completely static tooltip component that doesn't depend on Ant Design's Tooltip
export const StaticTooltipHeader = React.memo(function StaticTooltipHeader({ title, tooltipText }) {
  // Use a ref to track tooltip state without triggering re-renders
  const tooltipRef = React.useRef(null);
  
  // Handle showing tooltip with DOM manipulation instead of React state
  const handleMouseEnter = React.useCallback((e) => {
    if (tooltipRef.current) {
      tooltipRef.current.style.display = 'block';
    }
  }, []);
  
  const handleMouseLeave = React.useCallback((e) => {
    if (tooltipRef.current) {
      tooltipRef.current.style.display = 'none';
    }
  }, []);
  
  return (
    <div className="static-tooltip-header">
      <span>{title}</span>
      {tooltipText && (
        <span className="static-tooltip-trigger">
          <InfoCircleOutlined 
            style={{ marginLeft: '5px', color: 'rgba(0,0,0,.45)' }} 
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          />
          <div 
            ref={tooltipRef}
            className="static-tooltip-content"
            style={{ display: 'none' }}
          >
            {tooltipText}
          </div>
        </span>
      )}
    </div>
  );
});

export default StaticTooltipHeader;
