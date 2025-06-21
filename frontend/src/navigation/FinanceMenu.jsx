import React from 'react';
import { Menu } from 'antd';
import {
  DollarOutlined,
  FileSearchOutlined,
  BarChartOutlined,
  AuditOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import useLanguage from '@/locale/useLanguage';

const FinanceMenu = () => {
  const navigate = useNavigate();
  const translate = useLanguage();

  const handleClick = (e) => {
    navigate(e.key);
  };

  return (
    <Menu onClick={handleClick} mode="inline">
      <Menu.SubMenu 
        key="finance" 
        icon={<DollarOutlined />}
        title={translate('Finance')}
      >
        <Menu.Item key="/finance/three-way-matching" icon={<FileSearchOutlined />}>
          {translate('Three-Way Matching')}
        </Menu.Item>
        <Menu.Item key="/finance/reporting" icon={<BarChartOutlined />}>
          {translate('Financial Reporting')}
        </Menu.Item>
        <Menu.Item key="/finance/audit" icon={<AuditOutlined />}>
          {translate('Financial Audit')}
        </Menu.Item>
      </Menu.SubMenu>
    </Menu>
  );
};

export default FinanceMenu;
