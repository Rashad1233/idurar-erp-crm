import React, { useState, useEffect } from 'react';
import { Form, Input, InputNumber, Select, Typography, Spin, message, Tooltip, Modal, Button } from 'antd';
import { InfoCircleOutlined, EditOutlined, EnvironmentOutlined, InboxOutlined } from '@ant-design/icons';

import useLanguage from '@/locale/useLanguage';
import SelectAsync from '@/components/SelectAsync';
import inventoryService from '@/services/inventoryService';
import warehouseService from '@/services/warehouseService';

// Add custom styles
import './InventoryForm.scss';

const { Title } = Typography;
const { TextArea } = Input;

export default function InventoryForm({ isUpdateForm = false, current = {}, form }) {
  const translate = useLanguage();  const [itemMasters, setItemMasters] = useState([]);
  const [selectedItemMaster, setSelectedItemMaster] = useState(null);
  const [loading, setLoading] = useState(false);
  const [storageLocations, setStorageLocations] = useState([]);
  const [binLocations, setBinLocations] = useState([]);
  const [loadingStorageLocations, setLoadingStorageLocations] = useState(false);
  const [loadingBinLocations, setLoadingBinLocations] = useState(false);
  
  // Modal states
  const [longDescModalVisible, setLongDescModalVisible] = useState(false);
  const [longDescription, setLongDescription] = useState('');

  // State for selected storage location
  const [selectedStorageLocation, setSelectedStorageLocation] = useState(null);

  // Add validation state to track form submission
  const [isFormValid, setIsFormValid] = useState(false);
  useEffect(() => {
    const fetchFormData = async () => {  
      try {
        setLoading(true);
        // Fetch both item masters and storage locations
        const storageLocationsResponse = await warehouseService.getStorageLocations();
        
        // Process storage locations
        if (storageLocationsResponse.success) {
          const activeLocations = (storageLocationsResponse.data || [])
            .filter(location => location.isActive !== false)
            .sort((a, b) => a.code.localeCompare(b.code));
            
          setStorageLocations(activeLocations);
          
          // If in update mode and we have a storageLocation, set it and fetch bin locations
          if (isUpdateForm && current.storageLocationId) {
            const currentLocation = activeLocations.find(loc => loc.id === current.storageLocationId);
            if (currentLocation) {
              setSelectedStorageLocation(currentLocation);
              fetchBinLocations(currentLocation.id);
            }
          }
        } else {
          console.error('Storage locations API error:', storageLocationsResponse);
          setStorageLocations([]);
        }        // Fetch only approved item masters for inventory
        const itemMastersResponse = await inventoryService.getApprovedItemsForInventory();
        if (itemMastersResponse.success) {
          setItemMasters(itemMastersResponse.data);
          console.log(`✅ Loaded ${itemMastersResponse.data.length} approved items for inventory`);
        } else {
          console.error('Failed to load approved item masters:', itemMastersResponse);
        }
      } catch (error) {
        console.error('Error fetching form data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFormData();
  }, [isUpdateForm]); // Remove current and translate from dependencies

  // Separate useEffect for handling current data when form is loaded
  useEffect(() => {
    if (isUpdateForm && current && current.itemMasterId && itemMasters.length > 0) {
      handleItemMasterChange(current.itemMasterId);
    }
  }, [current.itemMasterId, itemMasters.length]); // Only depend on specific fields
  // Fetch bin locations when storage location changes
  const fetchBinLocations = async (storageLocationId) => {
    if (!storageLocationId) {
      setBinLocations([]);
      return;
    }

    setLoadingBinLocations(true);
    try {
      const response = await warehouseService.getBinsByStorageLocation(storageLocationId);
      if (response.success && response.data) {
        const activeBins = (response.data || [])
          .filter(bin => bin.isActive !== false)
          .sort((a, b) => a.binCode.localeCompare(b.binCode));
        setBinLocations(activeBins);
      } else {
        console.warn('Failed to fetch bin locations:', response.message);
        setBinLocations([]);
        // Don't show error message to prevent spam
      }
    } catch (error) {
      console.error('Error fetching bin locations:', error);
      setBinLocations([]);
      // Don't show error message to prevent spam
    } finally {
      setLoadingBinLocations(false);
    }  };

  // Handle storage location selection
  const handleStorageLocationChange = async (value) => {
    // Clear bin location when storage location changes
    form.setFieldValue('binLocationId', undefined);

    if (!value) {
      setSelectedStorageLocation(null);
      setBinLocations([]);
      return;
    }

    const location = storageLocations.find(loc => loc.id === value);
    if (location) {
      setSelectedStorageLocation(location);
      // Fetch bin locations for selected storage location
      await fetchBinLocations(location.id);
    } else {
      setSelectedStorageLocation(null);
      setBinLocations([]);
    }
  };

  // Handle item master selection
  const handleItemMasterChange = async (itemMasterId) => {
    if (!itemMasterId) return;

    setLoading(true);
    try {
      const response = await inventoryService.getItemMaster(itemMasterId);
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch item master data');
      }
      
      const itemMaster = response.data;
      if (!itemMaster) {
        throw new Error('Item master data is empty or invalid');
      }

      if (!form) {
        console.error("Form instance is not available!");
        message.error("Cannot update form: form instance not available");
        return;
      }      // Determine stock type based on item master properties
      const isPlannedStock = itemMaster.plannedStock === 'Y';
      const isStockItem = itemMaster.stockItem === 'Y';
      const stockType = isPlannedStock ? 'ST2' : 
                       (isStockItem ? 'ST1' : 'NS3');

      const currentUnitPrice = form.getFieldValue('unitPrice');
      const unspscCodeValue = itemMaster.unspscCode || 
                            (itemMaster.unspsc ? itemMaster.unspsc.code : '00000000');
      
      // Get the default storage location ID if available
      let defaultLocationId = null;
      if (itemMaster.defaultStorageLocation) {
        if (typeof itemMaster.defaultStorageLocation === 'object') {
          defaultLocationId = itemMaster.defaultStorageLocation.id;
        }
      }      form.setFieldsValue({
        shortDescription: itemMaster.shortDescription || 'No description available',
        longDescription: itemMaster.longDescription || '',
        criticality: itemMaster.criticality || 'MEDIUM',
        unspscCode: unspscCodeValue,
        manufacturerName: itemMaster.manufacturerName || 'Not specified',
        manufacturerPartNumber: itemMaster.manufacturerPartNumber || 'Not specified',
        uom: itemMaster.uom || 'EA',
        unitPrice: currentUnitPrice || 0.01,
        storageLocationId: defaultLocationId,        // Logic for physical balance and condition:
        // - ST2 (planned stock ONLY, not stock item): Lock to 0
        // - NS3 (non-stock, not planned): Lock to 0  
        // - ST1 (stock item, not planned): Allow input
        // - Both planned AND stock: Allow input (special case)
        physicalBalance: (isPlannedStock && !isStockItem) || (!isStockItem && !isPlannedStock) ? 0 : (form.getFieldValue('physicalBalance') || 0),
        condition: (isPlannedStock && !isStockItem) || (!isStockItem && !isPlannedStock) ? 'N' : (form.getFieldValue('condition') || 'A'),
      });

      // Store the selected item master for UI updates
      setSelectedItemMaster(itemMaster);

      // If we have a default storage location, fetch its bin locations
      if (defaultLocationId) {
        const location = storageLocations.find(loc => loc.id === defaultLocationId);
        if (location) {
          setSelectedStorageLocation(location);
          fetchBinLocations(defaultLocationId);
        }
      }      // Show appropriate message based on stock type
      if (isPlannedStock && isStockItem) {
        message.success(`Both Planned Stock AND Stock Item "${itemMaster.itemNumber}" selected. You can set physical balance.`);
      } else if (isPlannedStock && !isStockItem) {
        message.info(`ST2 Planned Stock item "${itemMaster.itemNumber}" selected. Physical balance set to 0 and condition set to N (managed by planning system).`);
      } else if (!isStockItem && !isPlannedStock) {
        message.info(`NS3 Non-Stock item "${itemMaster.itemNumber}" selected. Physical balance set to 0 and condition set to N (used for contracts/direct orders only).`);
      } else {
        message.success(`ST1 Stock item "${itemMaster.itemNumber}" selected and data populated. You can set physical balance.`);
      }
    } catch (error) {
      console.error('Error fetching item master details:', error);
      message.error(`Failed to load item details: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const openLongDescModal = () => {
    const desc = form.getFieldValue('shortDescription') || '';
    setLongDescription(desc);
    setLongDescModalVisible(true);
  };

  const saveLongDescription = () => {
    form.setFieldsValue({ longDescription });
    setLongDescModalVisible(false);
  };

  return (
    <>
      <Title level={4}>{translate('Inventory Details')}</Title>
      
      <Form.Item
        label={translate('Item Master')}
        name="itemMasterId"
        rules={[
          {
            required: true,
            message: translate('Please select an item master'),
          },
        ]}
      >
        <Select
          placeholder={translate('Select item master')}
          loading={loading}
          showSearch
          optionFilterProp="children"
          filterOption={(input, option) =>
            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
          onChange={handleItemMasterChange}
        >
          {itemMasters.map(item => (
            <Select.Option key={item.id || item._id} value={item.id || item._id}>
              {item.itemNumber} - {item.shortDescription}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>      {/* Storage Location Selection */}
      <Form.Item
        label={
          <span>
            <EnvironmentOutlined style={{ marginRight: 5, color: '#1890ff' }} />
            {translate('Storage Location')}
          </span>
        }
        name="storageLocationId"
        tooltip={translate('Physical location where the item is stored')}
        rules={[
          {
            required: true,
            message: translate('Please select a storage location')
          }
        ]}
        className="storage-location-field"
      >
        <Select 
          placeholder={translate('Select a storage location')}
          allowClear
          showSearch
          loading={loading}
          optionFilterProp="children"
          style={{ width: '100%' }}
          className="storage-location-select"
          onChange={handleStorageLocationChange}
          filterOption={(input, option) =>
            option?.label?.toLowerCase().includes(input.toLowerCase())
          }
          options={storageLocations.map(location => ({
            label: `${location.code} - ${location.description}`,
            value: location.id,
            icon: <EnvironmentOutlined style={{ color: '#1890ff' }} />
          }))}
        />
      </Form.Item>      {/* Bin Location Selection */}
      <Form.Item
        label={
          <span>
            <InboxOutlined style={{ marginRight: 5, color: '#1890ff' }} />
            {translate('Bin Location')}
          </span>
        }
        name="binLocationId"
        tooltip={translate('Specific bin location within the selected storage location')}
        className="bin-location-field"
      >
        <Select 
          placeholder={
            !selectedStorageLocation 
              ? translate('Please select a storage location first')
              : translate('Select a bin location')
          }
          allowClear
          showSearch
          disabled={!selectedStorageLocation}
          loading={loadingBinLocations}
          optionFilterProp="children"
          style={{ width: '100%' }}
          className="bin-location-select"
          filterOption={(input, option) =>
            option?.label?.toLowerCase().includes(input.toLowerCase())
          }
          options={binLocations.map(bin => ({
            label: `${bin.binCode} - ${bin.description}`,
            value: bin.id,
            icon: <InboxOutlined style={{ color: '#1890ff' }} />
          }))}
        />
      </Form.Item>

      {isUpdateForm && (
        <Form.Item
          label={translate('Inventory Number')}
          name="inventoryNumber"
          tooltip={translate('System-generated unique identifier')}
        >
          <Input 
            disabled={true} 
            style={{ fontFamily: 'monospace' }}
            className="inventory-number-field"
          />
        </Form.Item>
      )}
      <Form.Item
        label={
          <span>
            {translate('Short Description')}
            <Tooltip title={translate('Maximum 44 characters')}>
              <InfoCircleOutlined style={{ marginLeft: 8 }} />
            </Tooltip>
          </span>
        }
        name="shortDescription"
        rules={[
          {
            required: true,
            max: 44,
            validator: (_, value) => {
              if (value) {
                return Promise.resolve();
              }
              return Promise.reject(new Error(translate('Description is required')));
            }
          },
        ]}
        extra={
          <Tooltip title={translate("Auto-populated from Item Master")}>
            <Button type="link" onClick={openLongDescModal} icon={<EditOutlined />}>
              {translate("Long Description")}
            </Button>
          </Tooltip>
        }
      >
        <Input placeholder={translate('Auto-populated from Item Master')} readOnly />
      </Form.Item>

      <Form.Item name="longDescription" hidden>
        <Input />
      </Form.Item>
      <Form.Item
        label={translate('Criticality')}
        name="criticality"
        rules={[
          {
            required: true,
            validator: (_, value) => {
              if (value) {
                return Promise.resolve();
              }
              return Promise.reject(new Error(translate('Criticality is required')));
            }
          },
        ]}
        tooltip={translate('Automatically filled from item master')}
      >
        <Select placeholder={translate('Auto-populated from Item Master')} disabled>
          <Select.Option value="HIGH">High critical</Select.Option>
          <Select.Option value="MEDIUM">Medium critical</Select.Option>
          <Select.Option value="LOW">Non-critical</Select.Option>
        </Select>
      </Form.Item>
      <Form.Item
        label={translate('UNSPSC Code')}
        name="unspscCode"
        rules={[
          {
            required: true,
            validator: (_, value) => {
              if (value) {
                return Promise.resolve();
              }
              return Promise.reject(new Error(translate('UNSPSC code is required')));
            }
          },
        ]}
        tooltip={translate('Automatically filled from item master')}
      >
        <Input placeholder={translate("Auto-populated from Item Master")} readOnly />
      </Form.Item>

      <Form.Item
        label={translate('Manufacturer Name')}
        name="manufacturerName"
      >
        <Input placeholder={translate('Auto-populated from Item Master')} readOnly />
      </Form.Item>

      <Form.Item
        label={translate('Manufacturer Part Number')}
        name="manufacturerPartNumber"
      >
        <Input placeholder={translate('Auto-populated from Item Master')} readOnly />
      </Form.Item>      <Form.Item
        label={
          selectedItemMaster?.plannedStock === 'Y' ? (
            <Tooltip title="Physical balance is managed by planning system for ST2 items">
              <span>
                {translate('Physical Balance')} 
                <span style={{ color: '#1890ff', fontSize: '11px', marginLeft: '5px' }}>
                  (ST2 - Planned Stock)
                </span>
              </span>
            </Tooltip>
          ) : (
            translate('Physical Balance')
          )
        }
        name="physicalBalance"
        initialValue={0}
        rules={[
          {
            type: 'number',
            min: 0,
            message: translate('Physical balance cannot be negative')
          }
        ]}
      >        <InputNumber 
          min={0} 
          style={{ width: '100%' }} 
          disabled={
            (selectedItemMaster?.plannedStock === 'Y' && selectedItemMaster?.stockItem !== 'Y') || 
            (selectedItemMaster?.stockItem !== 'Y' && selectedItemMaster?.plannedStock !== 'Y')
          }
          placeholder={
            selectedItemMaster?.plannedStock === 'Y' && selectedItemMaster?.stockItem !== 'Y'
              ? "ST2: Managed by planning system (locked at 0)" 
              : (selectedItemMaster?.stockItem !== 'Y' && selectedItemMaster?.plannedStock !== 'Y')
              ? "NS3: Non-stock item (locked at 0)"
              : selectedItemMaster?.plannedStock === 'Y' && selectedItemMaster?.stockItem === 'Y'
              ? "Both Planned & Stock: Enter physical balance"
              : "ST1: Enter physical balance"
          }
        />
      </Form.Item>
      <Form.Item
        label={translate('Unit of Measure')}
        name="uom"
        rules={[
          {
            required: true,
            validator: (_, value) => {
              if (value) {
                return Promise.resolve();
              }
              return Promise.reject(new Error(translate('Unit of Measure is required')));
            }
          },
        ]}
        tooltip={translate('Automatically filled from item master')}
      >
        <Select placeholder={translate('Auto-populated from Item Master')} disabled>
          <Select.Option value="EA">EA (Each)</Select.Option>
          <Select.Option value="PCS">PCS (Pieces)</Select.Option>
          <Select.Option value="KG">KG (Kilograms)</Select.Option>
          <Select.Option value="LTR">LTR (Liters)</Select.Option>
          <Select.Option value="M">M (Meters)</Select.Option>
          <Select.Option value="SET">SET (Set)</Select.Option>
        </Select>
      </Form.Item>

      <Form.Item
        label={translate('Unit Price')}
        name="unitPrice"
        rules={[
          {
            required: true,
            message: translate('Unit price is required'),
          },
        ]}
      >
        <InputNumber
          min={0}
          step={0.01}
          style={{ width: '100%' }}
          formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          parser={value => value.replace(/\$\s?|(,*)/g, '')}
        />
      </Form.Item>

      <Form.Item
        label={translate('Line Price')}
        name="linePrice"
      >
        <InputNumber
          disabled
          style={{ width: '100%' }}
          formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
        />      </Form.Item>      
        <Form.Item
        label={translate('Condition')}
        name="condition"
        initialValue="A"
      >        <Select 
          disabled={selectedItemMaster && 
            ((selectedItemMaster.plannedStock === 'Y' && selectedItemMaster.stockItem !== 'Y') ||
             (selectedItemMaster.stockItem !== 'Y' && selectedItemMaster.plannedStock !== 'Y'))
          }
          placeholder={selectedItemMaster && 
            ((selectedItemMaster.plannedStock === 'Y' && selectedItemMaster.stockItem !== 'Y') ||
             (selectedItemMaster.stockItem !== 'Y' && selectedItemMaster.plannedStock !== 'Y'))
            ? "N - None (ST2/NS3 items)" 
            : "Select condition"
          }
        >          <Select.Option value="A">{translate('A - Excellent')}</Select.Option>
          <Select.Option value="B">{translate('B - Good')}</Select.Option>
          <Select.Option value="C">{translate('C - Fair')}</Select.Option>
          <Select.Option value="D">{translate('D - Poor')}</Select.Option>
          <Select.Option value="E">{translate('E - Critical')}</Select.Option>
          <Select.Option value="N">{translate('N - None (Planned/Non-stock)')}</Select.Option>
        </Select>
      </Form.Item>
      <Title level={4}>{translate('Stock Level Settings')}</Title>
      <Form.Item
        label={
          <span>
            {translate('Minimum Level (ROP)')}
            <Tooltip title={translate('Reorder Point')}>
              <InfoCircleOutlined style={{ marginLeft: 8 }} />
            </Tooltip>
          </span>
        }
        name="minimumLevel"
        initialValue={0}
        rules={[
          {
            type: 'number',
            min: 0,
            message: translate('Minimum level cannot be negative')
          }
        ]}
      >
        <InputNumber min={0} style={{ width: '100%' }} />
      </Form.Item>

      <Form.Item
        label={translate('Maximum Level')}
        name="maximumLevel"
        initialValue={0}
        rules={[
          {
            type: 'number',
            min: 0,
            message: translate('Maximum level cannot be negative')
          },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue('minimumLevel') <= value) {
                return Promise.resolve();
              }
              return Promise.reject(new Error(translate('Maximum level must be greater than or equal to minimum level')));
            },
          }),
        ]}
      >        <InputNumber min={0} style={{ width: '100%' }} />
      </Form.Item>

      <Form.Item
        label={translate('Reorder Point')}
        name="reorderPoint"
        initialValue={0}
        rules={[
          {
            type: 'number',
            min: 0,
            message: translate('Reorder point cannot be negative')
          }
        ]}
      >
        <InputNumber min={0} style={{ width: '100%' }} placeholder={translate('Enter reorder point')} />
      </Form.Item>      <Modal
        title={translate("Long Description")}
        open={longDescModalVisible}
        onOk={saveLongDescription}
        onCancel={() => setLongDescModalVisible(false)}
        width={700}
      >
        <Input.TextArea
          rows={10}
          value={longDescription}
          onChange={(e) => setLongDescription(e.target.value)}
          placeholder={translate("Enter detailed item description")}
        />
      </Modal>
    </>
  );
}
