// Zero-tooltip component - completely removes all tooltip functionality to eliminate infinite loops
import React from 'react';

// This component renders just the title text without any tooltip functionality
// Use this as a last resort when all other tooltip solutions fail
const ZeroTooltipHeader = React.memo(function ZeroTooltipHeader({ title, tooltipText }) {
  // Simply render the title text - no tooltip functionality at all
  return <span>{title}</span>;
});

export default ZeroTooltipHeader;
