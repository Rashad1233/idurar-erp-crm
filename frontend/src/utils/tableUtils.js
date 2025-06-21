/**
 * React Table Utilities
 * 
 * This file contains utility functions for working with tables in React
 * to avoid common issues and improve consistency.
 */
import React from 'react';
import { Table } from 'antd';

/**
 * Create a Table Summary Row without whitespace issues
 * 
 * @param {Array} cells - Array of cell configurations
 * @returns {JSX.Element} - A Table.Summary.Row element with properly formatted cells
 * 
 * @example
 * // Usage:
 * summary={(pageData) => {
 *   const total = calculateTotal(pageData);
 *   return createTableSummaryRow([
 *     { colSpan: 3, content: <strong>Total</strong> },
 *     { align: 'right', content: <strong>{total}</strong> },
 *     { colSpan: 4 }
 *   ]);
 * }}
 */
export const createTableSummaryRow = (cells = [], TableComponent = Table) => {
  return (
    <TableComponent.Summary.Row>
      {cells.map((cell, index) => (
        <TableComponent.Summary.Cell 
          key={index}
          index={index}
          colSpan={cell.colSpan}
          align={cell.align}
        >
          {cell.content || null}
        </TableComponent.Summary.Cell>
      ))}
    </TableComponent.Summary.Row>
  );
};

/**
 * Check table columns and rows for potential whitespace issues
 * 
 * @param {Array} columns - Table column definitions
 * @param {Array} dataSource - Table data source
 * @returns {Object} - Validation results with any issues found
 */
export const validateTableStructure = (columns, dataSource) => {
  const issues = [];
  
  // Check for whitespace in column definitions
  columns.forEach((col, index) => {
    if (col.title && typeof col.title === 'string' && /^\s|\s$/.test(col.title)) {
      issues.push(`Column ${index} title has leading/trailing whitespace: "${col.title}"`);
    }
    
    if (col.dataIndex && typeof col.dataIndex === 'string' && /\s/.test(col.dataIndex)) {
      issues.push(`Column ${index} dataIndex contains whitespace: "${col.dataIndex}"`);
    }
  });
  
  return {
    hasIssues: issues.length > 0,
    issues
  };
};

// Named exports
export {
  // Functions already exported above with export const
};

// Default export
export default {
  createTableSummaryRow,
  validateTableStructure
};
