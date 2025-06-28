import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button, Drawer, Layout, Menu } from 'antd';

import { useAppContext } from '@/context/appContext';

import useLanguage from '@/locale/useLanguage';
import MimiAppLogo from '@/components/MimiAppLogo';

import useResponsive from '@/hooks/useResponsive';
import ProcurementMenu from '@/navigation/ProcurementMenu';

import {
  SettingOutlined,
  CustomerServiceOutlined,
  ContainerOutlined,
  FileSyncOutlined,
  DashboardOutlined,
  TagOutlined,
  TagsOutlined,
  UserOutlined,
  CreditCardOutlined,
  MenuOutlined,
  FileOutlined,
  ShopOutlined,
  FilterOutlined,
  WalletOutlined,
  ReconciliationOutlined,
  ShoppingCartOutlined,
  FormOutlined,
  FileTextOutlined,
  FileProtectOutlined,
  DatabaseOutlined,
  AppstoreOutlined,
  HomeOutlined,
  DollarOutlined,
  FileSearchOutlined,
  BarChartOutlined,
  AuditOutlined,
} from '@ant-design/icons';

const { Sider } = Layout;

export default function Navigation() {
  const { isMobile } = useResponsive();

  return isMobile ? <MobileSidebar /> : <Sidebar collapsible={false} />;
}

function Sidebar({ collapsible, isMobile = false }) {
  let location = useLocation();

  const { state: stateApp, appContextAction } = useAppContext();
  const { isNavMenuClose } = stateApp;
  const { navMenu } = appContextAction;
  const [showLogoApp, setLogoApp] = useState(isNavMenuClose);
  const [currentPath, setCurrentPath] = useState(location.pathname.slice(1));

  const translate = useLanguage();
  const navigate = useNavigate();  const items = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: <Link to={'/'}>{translate('dashboard')}</Link>,
    },
    // DoFA Module (Separate section for Delegation of Financial Authority)
    {
      key: 'dofa-module',
      icon: <TagsOutlined />,
      label: translate('Approval Authority'),
      children: [
        {
          key: 'dofa',
          label: <Link to={'/dofa'}>{translate('Delegation of Authority (DoFA)')}</Link>,
        },
        {
          key: 'procurement-review',
          label: translate('Procurement'),
          children: [
            {
              key: 'item-review',
              label: <Link to={'/item-master/review'}>{translate('Item Review')}</Link>,
            },
            {
              key: 'purchase-requisition-review',
              label: <Link to={'/purchase-requisition/approval'}>{translate('Purchase Requisition Review')}</Link>,
            },
            {
              key: 'rfq-review',
              label: <Link to={'/rfq'}>{translate('RFQ Review')}</Link>,
            },
            {
              key: 'purchase-order-review',
              label: <Link to={'/purchase-order'}>{translate('PO Review')}</Link>,
            },
            {
              key: 'contracts-review',
              label: <Link to={'/dofa/contracts/review'}>{translate('Contracts Review')}</Link>,
            },
            {
              key: 'suppliers-review',
              label: <Link to={'/dofa/suppliers/review'}>{translate('Suppliers Review')}</Link>,
            },
          ],
        },
      ],
    },
    // Procurement Module
    {
      key: 'procurement-module',
      icon: <ShoppingCartOutlined />,
      label: translate('procurement'),
      children: [
        {
          key: 'purchase-requisition',
          label: <Link to={'/purchase-requisition'}>{translate('Purchase Requisition')}</Link>,
        },
        {
          key: 'rfq',
          label: <Link to={'/rfq'}>{translate('Request for Quotation')}</Link>,
        },
        {
          key: 'purchase-order',
          label: <Link to={'/purchase-order'}>{translate('Purchase Order')}</Link>,
        },
        {
          key: 'supplier',
          label: <Link to={'/supplier'}>{translate('Suppliers')}</Link>,
        },
        {
          key: 'contract',
          label: <Link to={'/contract'}>{translate('Contracts')}</Link>,
        },
      ],
    },
    // Inventory Module
    {
      key: 'inventory-module',
      icon: <DatabaseOutlined />,
      label: translate('inventory'),
      children: [        {
          key: 'item-master',
          label: <Link to={'/item-master'}>{translate('Item Master')}</Link>,
        },
        {
          key: 'inventory',
          label: <Link to={'/inventory'}>{translate('Inventory')}</Link>,
        },
        {
          key: 'warehouse',
          label: <Link to={'/warehouse'}>{translate('Warehouse')}</Link>,
        },
        {
          key: 'inventory-reporting',
          label: <Link to={'/inventory/reporting'}>{translate('Reporting')}</Link>,
        },
      ],
    },
    // Sales Module
    {
      key: 'sales-module',
      icon: <ShopOutlined />,
      label: translate('sales'),
      children: [
        {
          key: 'pos',
          label: <Link to={'/sales/pos'}>{translate('Point of Sale (POS)')}</Link>,
        },
        {
          key: 'sales-orders',
          label: <Link to={'/sales/orders'}>{translate('Sales Orders')}</Link>,
        },
        {
          key: 'sales-customers',
          label: <Link to={'/sales/customers'}>{translate('Customers')}</Link>,
        },
      ],
    },
  ];

  useEffect(() => {
    if (location)
      if (currentPath !== location.pathname) {
        if (location.pathname === '/') {
          setCurrentPath('dashboard');
        } else setCurrentPath(location.pathname.slice(1));
      }
  }, [location, currentPath]);

  useEffect(() => {
    if (isNavMenuClose) {
      setLogoApp(isNavMenuClose);
    }
    const timer = setTimeout(() => {
      if (!isNavMenuClose) {
        setLogoApp(isNavMenuClose);
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [isNavMenuClose]);
  const onCollapse = () => {
    navMenu.collapse();
  };

  return (
    <Sider
      collapsible={collapsible}
      collapsed={collapsible ? isNavMenuClose : collapsible}
      onCollapse={onCollapse}
      className="navigation"
      width={256}
      style={{
        overflow: 'auto',
        height: '100vh',

        position: isMobile ? 'absolute' : 'relative',
        bottom: '20px',
        ...(!isMobile && {
          // border: 'none',
          ['left']: '20px',
          top: '20px',
          // borderRadius: '8px',
        }),
      }}
      theme={'light'}
    >
      <div
        className="logo"
        onClick={() => navigate('/')}
        style={{
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 15px',
          height: '64px'
        }}
      >
        <MimiAppLogo />
      </div>
      <Menu
        items={items}
        mode="inline"
        theme={'light'}
        selectedKeys={[currentPath]}
        style={{
          width: 256,
        }}
      />
    </Sider>
  );
}

function MobileSidebar() {
  const [visible, setVisible] = useState(false);
  const showDrawer = () => {
    setVisible(true);
  };
  const onClose = () => {
    setVisible(false);
  };

  return (
    <>
      <Button
        type="text"
        size="large"
        onClick={showDrawer}
        className="mobile-sidebar-btn"
        style={{ ['marginLeft']: 25 }}
      >
        <MenuOutlined style={{ fontSize: 18 }} />
      </Button>
      <Drawer
        width={250}
        // style={{ backgroundColor: 'rgba(255, 255, 255, 1)' }}
        placement={'left'}
        closable={false}
        onClose={onClose}
        open={visible}
      >
        <Sidebar collapsible={false} isMobile={true} />
      </Drawer>
    </>
  );
}
