import React from 'react';
import { Dropdown, Button, Menu } from 'antd';
import { EllipsisOutlined, EditOutlined, EyeOutlined, DeleteOutlined } from '@ant-design/icons';
import useLanguage from '@/locale/useLanguage';
import { useDispatch } from 'react-redux';
import { erp } from '@/redux/erp/actions';
import { useErpContext } from '@/context/erp';

const DataTableDropMenu = ({
  record,
  entity,
  onView,
  onEdit,
  onDelete,
  additionalOptions = []
}) => {
  const translate = useLanguage();
  const dispatch = useDispatch();
  const { erpContextAction } = useErpContext();
  const handleView = () => {
    if (onView) {
      onView(record);
    } else {
      dispatch(erp.currentItem({ data: record }));
      erpContextAction.readPanel.open();
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(record);
    } else {
      dispatch(erp.currentAction({ actionType: 'update', data: record }));
      erpContextAction.updatePanel.open();
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(record);
    } else {
      dispatch(erp.currentAction({ actionType: 'delete', data: record }));
      // Use modal for delete confirmation
      erpContextAction.modal.open();
    }
  };

  const menuItems = [
    {
      key: 'view',
      label: translate('View'),
      icon: <EyeOutlined />,
      onClick: handleView
    },
    {
      key: 'edit',
      label: translate('Edit'),
      icon: <EditOutlined />,
      onClick: handleEdit
    },
    {
      key: 'delete',
      label: translate('Delete'),
      icon: <DeleteOutlined />,
      onClick: handleDelete,
      danger: true
    },
    ...additionalOptions.map((option, index) => ({
      key: `additional-${index}`,
      label: option.label,
      icon: option.icon,
      onClick: option.onClick
    }))
  ];
  return (
    <Dropdown 
      menu={{ items: menuItems }} 
      trigger={['click']}
      placement="bottomRight"
    >
      <Button 
        type="text" 
        icon={<EllipsisOutlined />} 
        size="small"
        className="dropdown-button"
      />
    </Dropdown>
  );
};

export default DataTableDropMenu;
