// Ultra-optimized static tooltip component to completely eliminate render loops
import React from 'react';
import { InfoCircleOutlined } from '@ant-design/icons';

// This component is completely isolated from React's state management system
// It uses direct DOM manipulation and never causes re-renders
const UltraStaticTooltipHeader = React.memo(function UltraStaticTooltipHeader({ 
  title, 
  tooltipText,
  tooltipId 
}) {
  // Create a unique ID for this tooltip if not provided
  const uniqueId = React.useMemo(() => 
    tooltipId || `tooltip-${Math.random().toString(36).substr(2, 9)}`, 
    [tooltipId]
  );
  
  // We don't even use React's ref system - we use direct DOM API for maximum isolation
  React.useEffect(() => {
    // After mount, set up the DOM event handlers directly
    const headerElement = document.getElementById(`tooltip-header-${uniqueId}`);
    const contentElement = document.getElementById(`tooltip-content-${uniqueId}`);
    const iconElement = document.getElementById(`tooltip-icon-${uniqueId}`);
    
    if (headerElement && contentElement && iconElement) {
      // Set up direct DOM event handlers - no React event system involved
      const showTooltip = () => { contentElement.style.display = 'block'; };
      const hideTooltip = () => { contentElement.style.display = 'none'; };
      
      // Attach the handlers directly to the DOM nodes
      iconElement.addEventListener('mouseenter', showTooltip);
      iconElement.addEventListener('mouseleave', hideTooltip);
      
      // Touch support
      iconElement.addEventListener('click', (e) => {
        e.preventDefault();
        const isVisible = contentElement.style.display === 'block';
        contentElement.style.display = isVisible ? 'none' : 'block';
        
        // Auto-hide after a timeout on touch devices
        if (!isVisible) {
          setTimeout(() => {
            if (contentElement) {
              contentElement.style.display = 'none';
            }
          }, 3000);
        }
      });
      
      // Clean up on unmount
      return () => {
        iconElement.removeEventListener('mouseenter', showTooltip);
        iconElement.removeEventListener('mouseleave', hideTooltip);
        iconElement.removeEventListener('click', () => {});
      };
    }
  }, [uniqueId]); // Only run once on mount and if uniqueId changes
    return (
    <div className="ultra-static-tooltip-header" id={`tooltip-header-${uniqueId}`}>
      <span>{title}</span>
      {tooltipText && (
        <span className="ultra-static-tooltip-trigger">
          <InfoCircleOutlined 
            id={`tooltip-icon-${uniqueId}`}
            style={{ marginLeft: '5px', color: 'rgba(0,0,0,.45)' }} 
            role="button"
            aria-describedby={`tooltip-content-${uniqueId}`}
            tabIndex={0}
          />
          <div 
            id={`tooltip-content-${uniqueId}`}
            className="ultra-static-tooltip-content"
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

export default UltraStaticTooltipHeader;
