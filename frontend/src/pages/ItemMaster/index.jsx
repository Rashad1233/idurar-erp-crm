import React from 'react';
import { Tag, Tooltip, Button, Space } from 'antd';
import { Link } from 'react-router-dom';
import { PlusOutlined, ToolOutlined } from '@ant-design/icons';

import SimpleCrudModule from '@/modules/SimpleCrudModule';
import ItemMasterForm from '@/forms/ItemMasterForm';

function ItemMaster() {
  const entity = 'item';
  
  const searchConfig = {
    displayLabels: ['itemNumber', 'shortDescription'],
    searchFields: 'itemNumber,shortDescription,manufacturerPartNumber,manufacturerName',
    outputValue: '_id',
  };

  const entityDisplayLabels = ['itemNumber', 'shortDescription'];
  const dataTableColumns = [
    {
      title: 'Item Number',
      dataIndex: 'itemNumber',
      width: 110,
      fixed: 'left',
    },
    {
      title: 'Description',
      dataIndex: 'shortDescription',
      width: 180,
      ellipsis: {
        showTitle: false,
      },
      render: (text, record) => (
        <Tooltip placement="topLeft" title={record.longDescription || text}>
          {text}
        </Tooltip>
      ),
    },
    {
      title: 'Category',
      dataIndex: 'equipmentCategory',
      width: 120,
    },
    {
      title: 'Sub-Category',
      dataIndex: 'equipmentSubCategory',
      width: 130,
    },
    {
      title: 'Manufacturer',
      dataIndex: 'manufacturerName',
      width: 130,
    },
    {
      title: 'MPN',
      dataIndex: 'manufacturerPartNumber',
      width: 130,
      ellipsis: true,
    },    {
      title: 'UNSPSC Code',
      dataIndex: 'unspsc',
      width: 110,
      render: (unspsc, record) => {
        // First try the unspsc object
        if (unspsc && unspsc.code) {
          return (
            <Tooltip title={unspsc.title || unspsc.description || 'UNSPSC Code'}>
              <Link to={`/unspsc-enhanced-search?code=${unspsc.code}`}>
                <Tag color="blue">{unspsc.code}</Tag>
              </Link>
            </Tooltip>
          );
        }
        
        // If unspsc object doesn't exist, try direct unspscCode field
        if (record.unspscCode) {
          return (
            <Tooltip title={record.unspscTitle || record.equipmentCategory || 'UNSPSC Code'}>
              <Link to={`/unspsc-enhanced-search?code=${record.unspscCode}`}>
                <Tag color="blue">{record.unspscCode}</Tag>
              </Link>
            </Tooltip>
          );
        }
        
        // Fallback
        return '-';
      },
    },
    {
      title: 'UoM',
      dataIndex: 'uom',
      width: 70,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      width: 100,
      render: (status) => {
        const colorMap = {
          'DRAFT': 'orange',
          'PENDING_REVIEW': 'blue',
          'APPROVED': 'green',
          'REJECTED': 'red'
        };
        return <Tag color={colorMap[status] || 'default'}>{status}</Tag>;
      },
    },
    {
      title: 'Criticality',
      dataIndex: 'criticality',
      width: 90,
      render: (criticality) => {
        const colorMap = {
          'HIGH': 'red',
          'MEDIUM': 'orange',
          'LOW': 'blue',
          'NO': 'default'
        };
        return <Tag color={colorMap[criticality] || 'default'}>{criticality}</Tag>;
      },
    },    {
      title: 'Stock Item',
      dataIndex: 'stockItem',
      width: 90,
      render: (stockItem) => {
        return stockItem === 'Y' ? (
          <Tag color="green">Yes</Tag>
        ) : (
          <Tag color="default">No</Tag>
        );
      },
    },
  ];
  const readColumns = [
    {
      title: 'Item Number',
      dataIndex: 'itemNumber',
    },
    {
      title: 'Short Description',
      dataIndex: 'shortDescription',
    },
    {
      title: 'Long Description',
      dataIndex: 'longDescription',
    },
    {
      title: 'Standard Description',
      dataIndex: 'standardDescription',
    },
    {
      title: 'Manufacturer Name',
      dataIndex: 'manufacturerName',
    },
    {
      title: 'Manufacturer Part Number',
      dataIndex: 'manufacturerPartNumber',
    },
    {
      title: 'Equipment Category',
      dataIndex: 'equipmentCategory',
    },
    {
      title: 'Equipment Sub-Category',
      dataIndex: 'equipmentSubCategory',
    },
    {
      title: 'Unit of Measure',
      dataIndex: 'uom',
    },
    {
      title: 'Equipment Tag',
      dataIndex: 'equipmentTag',
    },    {
      title: 'UNSPSC Code',
      dataIndex: 'unspsc',
      render: (unspsc, record) => {
        if (unspsc && unspsc.code) {
          return (
            <Link to={`/unspsc-enhanced-search?code=${unspsc.code}`}>
              {`${unspsc.code} - ${unspsc.description || unspsc.title || ''}`}
            </Link>
          );
        }
        if (record.unspscCode) {
          return (
            <Link to={`/unspsc-enhanced-search?code=${record.unspscCode}`}>
              {`${record.unspscCode} - ${record.unspscTitle || ''}`}
            </Link>
          );
        }
        return '-';
      },
    },
    {
      title: 'Serial Number',
      dataIndex: 'serialNumber',
    },
    {
      title: 'Criticality',
      dataIndex: 'criticality',
    },
    {
      title: 'Stock Item',
      dataIndex: 'stockItem',
      render: (stockItem) => {
        return stockItem === 'Y' ? 'Yes' : 'No';
      },
    },
    {
      title: 'Planned Stock',
      dataIndex: 'plannedStock',
      render: (plannedStock) => {
        return plannedStock === 'Y' ? 'Yes' : 'No';
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
    },
    {
      title: 'Contract Number',
      dataIndex: 'contractNumber',
    },
    {
      title: 'Supplier Name',
      dataIndex: 'supplierName',
    },
    {
      title: 'Created By',
      dataIndex: 'createdBy',
      render: (createdBy) => {
        return createdBy ? createdBy.name : '-';
      },
    },
    {
      title: 'Reviewed By',
      dataIndex: 'reviewedBy',
      render: (reviewedBy) => {
        return reviewedBy ? reviewedBy.name : '-';
      },
    },
    {
      title: 'Approved By',
      dataIndex: 'approvedBy',
      render: (approvedBy) => {
        return approvedBy ? approvedBy.name : '-';
      },
    },
  ];
  
  return (
    <SimpleCrudModule
      entity={entity}
      dataTableColumns={dataTableColumns}
      searchConfig={searchConfig}
      entityDisplayLabels={entityDisplayLabels}
      extraButtons={[]} // Empty array to remove extra buttons
    />
  );
}

export default ItemMaster;
