import React from 'react';
import { Menu } from 'antd';
import {
  DatabaseOutlined,
  AppstoreOutlined,
  BuildOutlined,
  HomeOutlined,
  AlertOutlined,
  SwapOutlined,
  BarChartOutlined,
  ToolOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import useLanguage from '@/locale/useLanguage';

const InventoryMenu = () => {
  const navigate = useNavigate();
  const translate = useLanguage();

  const handleClick = (e) => {
    navigate(e.key);
  };

  return (
    <Menu onClick={handleClick} mode="inline">
      <Menu.SubMenu 
        key="inventory" 
        icon={<DatabaseOutlined />}
        title={translate('Inventory')}      >        <Menu.Item key="/item-master" icon={<AppstoreOutlined />}>
          {translate('Item Master')}
        </Menu.Item>
        <Menu.Item key="/inventory" icon={<DatabaseOutlined />}>
          {translate('Inventory')}
        </Menu.Item>
        <Menu.Item key="/inventory/reorder" icon={<AlertOutlined />}>
          {translate('Reorder Planning')}
        </Menu.Item>
        <Menu.Item key="/warehouse" icon={<HomeOutlined />}>
          {translate('Warehouse')}
        </Menu.Item>
        <Menu.Item key="/warehouse/transaction" icon={<SwapOutlined />}>
          {translate('Warehouse Transactions')}
        </Menu.Item>
        <Menu.Item key="/inventory/reporting" icon={<BarChartOutlined />}>
          {translate('Inventory Reports')}
        </Menu.Item>
        <Menu.Item key="/inventory/maintenance" icon={<ToolOutlined />}>
          {translate('Asset Maintenance')}
        </Menu.Item>
      </Menu.SubMenu>
    </Menu>
  );
};

export default InventoryMenu;
