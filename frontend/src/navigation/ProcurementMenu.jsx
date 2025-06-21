import React from 'react';
import { Menu } from 'antd';
import {
  ShoppingCartOutlined,
  FormOutlined,
  ShopOutlined,
  FileTextOutlined,
  FileProtectOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import useLanguage from '@/locale/useLanguage';

const ProcurementMenu = () => {
  const navigate = useNavigate();
  const translate = useLanguage();

  const handleClick = (e) => {
    navigate(e.key);
  };

  return (
    <Menu onClick={handleClick} mode="inline">
      <Menu.SubMenu 
        key="procurement" 
        icon={<ShoppingCartOutlined />}
        title={translate('Procurement')}
      >
        <Menu.Item key="/purchase-requisition" icon={<FormOutlined />}>
          {translate('Purchase Requisition')}
        </Menu.Item>
        <Menu.Item key="/rfq" icon={<FileTextOutlined />}>
          {translate('Request for Quotation')}
        </Menu.Item>
        <Menu.Item key="/purchase-order" icon={<FileProtectOutlined />}>
          {translate('Purchase Order')}
        </Menu.Item>
        <Menu.Item key="/supplier" icon={<ShopOutlined />}>
          {translate('Suppliers')}
        </Menu.Item>
        <Menu.Item key="/contract" icon={<FileTextOutlined />}>
          {translate('Contracts')}
        </Menu.Item>
      </Menu.SubMenu>
    </Menu>
  );
};

export default ProcurementMenu;
