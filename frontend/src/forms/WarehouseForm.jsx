import { Form, Input, Tabs, Select, message } from 'antd';
import { useState, useEffect } from 'react';
import useLanguage from '@/locale/useLanguage';
import warehouseService from '@/services/warehouseService';

// Removed TabPane import - using items prop instead
const { Option } = Select;

export default function WarehouseForm({ type = 'location', isUpdateForm = false }) {
  const translate = useLanguage();
  const [activeTab, setActiveTab] = useState(type || 'location');
  const [storageLocations, setStorageLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    // Fetch storage locations when component mounts or when the active tab is 'bin'
    if (activeTab === 'bin') {
      fetchStorageLocations();
    }
  }, [activeTab]);
  
  const fetchStorageLocations = async () => {
    setLoading(true);
    try {
      const response = await warehouseService.getStorageLocations();
      if (response.success) {
        setStorageLocations(response.data || []);
      } else {
        message.error(translate('Failed to fetch storage locations'));
        console.error('API Error:', response);
      }
    } catch (error) {
      message.error(translate('Failed to fetch storage locations'));
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleTabChange = (key) => {
    setActiveTab(key);
    
    // Reset the form fields when changing tabs
    const form = Form.useFormInstance();
    form.resetFields();
  };
  
  return (
    <>
      <Tabs activeKey={activeTab} onChange={handleTabChange}>
        <TabPane tab={translate('Storage Location')} key="location">
          {activeTab === 'location' && (
            <>
              <Form.Item
                label={translate('Location Code')}
                name="code"
                rules={[
                  {
                    required: true,
                    message: translate('Please input the location code!'),
                  },
                ]}
              >
                <Input placeholder="e.g., BRG01" />
              </Form.Item>
              
              <Form.Item
                label={translate('Description')}
                name="description"
                rules={[
                  {
                    required: true,
                    message: translate('Please input the location description!'),
                  },
                ]}
              >
                <Input placeholder="e.g., Brighton Warehouse 1" />
              </Form.Item>
              
              <Form.Item
                label={translate('Street')}
                name="street"
              >
                <Input placeholder="e.g., Falmer village street 3" />
              </Form.Item>
              
              <Form.Item
                label={translate('City')}
                name="city"
              >
                <Input placeholder="e.g., Brighton" />
              </Form.Item>
              
              <Form.Item
                label={translate('Postal Code')}
                name="postalCode"
              >
                <Input placeholder="e.g., NS0R51" />
              </Form.Item>
              
              <Form.Item
                label={translate('Country')}
                name="country"
              >
                <Input placeholder="e.g., United Kingdom" />
              </Form.Item>
            </>
          )}
        </TabPane>
        <TabPane tab={translate('Bin')} key="bin">
          {activeTab === 'bin' && (
            <>
              <Form.Item
                label={translate('Bin Code')}
                name="binCode"
                rules={[
                  {
                    required: true,
                    message: translate('Please input the bin code!'),
                  },
                ]}
              >
                <Input placeholder="e.g., W1010105 (Warehouse 1, row 1, shelf 1, bin 5)" />
              </Form.Item>
              
              <Form.Item
                label={translate('Storage Location')}
                name="storageLocationId"
                rules={[
                  {
                    required: true,
                    message: translate('Please select a storage location!'),
                  },
                ]}
              >
                <Select 
                  placeholder={translate('Select a storage location')}
                  loading={loading}
                  disabled={loading || storageLocations.length === 0}
                >
                  {storageLocations.map(location => (
                    <Option key={location.id} value={location.id}>
                      {location.code} - {location.description}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              
              <Form.Item
                label={translate('Description')}
                name="description"
              >
                <Input placeholder={translate('Optional bin description')} />
              </Form.Item>
            </>
          )}
        </TabPane>
      </Tabs>
    </>
  );
}
