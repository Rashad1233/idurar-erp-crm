import React, { useEffect, useRef } from 'react';

/**
 * A debug component to track component re-renders
 * Place this inside any component you want to debug
 * @param {Object} props - Component props
 * @param {string} props.componentName - Name of the component to track
 * @param {boolean} props.showInConsole - Whether to log to console
 * @param {boolean} props.showInUI - Whether to show render count in UI
 */
const RenderTracker = ({ 
  componentName = 'Component', 
  showInConsole = true, 
  showInUI = false, 
  dependencies = {} 
}) => {
  const renderCount = useRef(0);
    useEffect(() => {
    renderCount.current += 1;
    
    if (showInConsole) {
      console.log(`[DEBUG] ${componentName} rendered ${renderCount.current} times`);
      
      // Check if dependencies are provided
      if (Object.keys(dependencies).length > 0) {
        console.log(`[DEBUG] ${componentName} dependencies:`, dependencies);
      }
      
      // Warn if we're getting into infinite loop territory
      if (renderCount.current > 20) {
        console.warn(`[DEBUG] ⚠️ ${componentName} may be in an infinite loop! Rendered ${renderCount.current} times.`);
      }
    }
  }, []); // Empty dependency array to only run once on mount
  
  if (!showInUI) return null;
  
  return (
    <div style={{ 
      position: 'fixed', 
      bottom: '10px', 
      right: '10px', 
      padding: '5px 10px',
      background: renderCount.current > 20 ? '#ff4d4f' : '#1890ff',
      color: 'white',
      borderRadius: '4px',
      fontSize: '12px',
      zIndex: 9999
    }}>
      {componentName}: {renderCount.current} renders
    </div>
  );
};

export default RenderTracker;
