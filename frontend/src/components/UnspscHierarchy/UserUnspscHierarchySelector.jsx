import React, { useState, useEffect, useCallback } from 'react';
import { Select, Spin, Typography, message, Empty, Alert, Button } from 'antd';
import unspscHierarchyService from '@/services/unspscHierarchyService';
import unspscService from '@/services/unspscService';

const { Option, OptGroup } = Select;
const { Text } = Typography;

const UserUnspscHierarchySelector = ({ value, onChange, onComplete, showLevel = 'COMMODITY' }) => {
  const [loading, setLoading] = useState({
    segment: false,
    family: false,
    class: false,
    commodity: false,
  });
  const [options, setOptions] = useState({
    segment: [],
    family: [],
    class: [],
    commodity: [],
  });
  const [selectedValues, setSelectedValues] = useState({
    segment: null,
    family: null,
    class: null,
    commodity: null,
  });
  const [selectedTitles, setSelectedTitles] = useState({
    segment: '',
    family: '',
    class: '',
    commodity: '',
  });
  const [error, setError] = useState(null);

  // Helper to format UNSPSC code with title
  const formatOptionLabel = (code, title) => {
    return `${code} - ${title}`;
  };  // Load initial segments
  const loadSegments = useCallback(async () => {
    setLoading(prev => ({ ...prev, segment: true }));
    setError(null);
    
    try {
      console.log('🔄 Loading UNSPSC segments...');
      
      // First try to get user's segments
      console.log('Fetching user-specific segments from hierarchy...');
      const response = await unspscHierarchyService.getByLevel('SEGMENT');
      console.log('User hierarchy response:', response);
      
      if (response.success && response.data && response.data.length > 0) {
        console.log('✅ Using user segments:', response.data.length);
        setOptions(prev => ({
          ...prev,
          segment: response.data.map(item => ({
            code: item.unspscCode.substring(0, 2),
            title: item.title,
            fullCode: item.unspscCode,
          }))
        }));
      } else {
        // Fall back to global segments if user has none
        console.log('No user segments found, falling back to global segments');
        try {
          // Try unspscHierarchyService.getGlobalByLevel first (our new method)
          const globalHierarchyResponse = await unspscHierarchyService.getGlobalByLevel('SEGMENT');
          
          if (globalHierarchyResponse.success && globalHierarchyResponse.data && globalHierarchyResponse.data.length > 0) {
            console.log('✅ Using global segments from hierarchy service:', globalHierarchyResponse.data.length);
            setOptions(prev => ({
              ...prev,
              segment: globalHierarchyResponse.data.map(item => ({
                code: item.code.substring(0, 2),
                title: item.title,
                fullCode: item.code,
              }))
            }));
            
            try {
              // Try to save to user hierarchy, but don't worry if it fails
              for (const item of globalHierarchyResponse.data) {
                await unspscHierarchyService.save({
                  unspscCode: item.code,
                  level: 'SEGMENT',
                  title: item.title,
                  segment: item.code.substring(0, 2),
                }).catch(e => console.warn('Non-critical error saving segment:', e));
              }
            } catch (saveError) {
              console.warn('Non-critical error saving segments:', saveError);
            }
          } else {
            // Fall back to unspscService as a last resort
            console.log('Falling back to unspscService...');
            const globalResponse = await unspscService.getSegments();
            console.log('Global segments response from unspscService:', globalResponse);
            
            if (globalResponse.success && globalResponse.data && globalResponse.data.length > 0) {
              console.log('✅ Using global segments from unspscService:', globalResponse.data.length);
              setOptions(prev => ({
                ...prev,
                segment: globalResponse.data.map(item => ({
                  code: item.code.substring(0, 2),
                  title: item.title,
                  fullCode: item.code,
                }))
              }));
              
              // Try to save these for next time
              try {
                console.log('Saving global segments to user hierarchy...');
                for (const item of globalResponse.data) {
                  await unspscHierarchyService.save({
                    unspscCode: item.code,
                    level: 'SEGMENT',
                    title: item.title,
                    segment: item.code.substring(0, 2),
                  }).catch(e => console.warn('Non-critical error saving segment:', e));
                }
              } catch (saveError) {
                console.warn('Non-critical error saving segments:', saveError);
              }
            } else {
              setError(`Failed to load segments. Please check your connection and try again.`);
            }
          }
        } catch (globalError) {
          console.error('Error fetching global segments:', globalError);
          setError(`Failed to load segments: ${globalError.message}`);
        }
      }
    } catch (err) {
      console.error('Error loading segments:', err);
      setError(`Failed to load segments: ${err.message}. Please make sure you're logged in and try again.`);
    } finally {
      setLoading(prev => ({ ...prev, segment: false }));
    }
  }, []);

  // Load families based on selected segment
  const loadFamilies = useCallback(async (segmentCode) => {
    if (!segmentCode) return;
    
    setLoading(prev => ({ ...prev, family: true }));
    try {
      // First try to get user's families
      const response = await unspscHierarchyService.getChildren(segmentCode + '000000', 'FAMILY');
      
      if (response.success && response.data && response.data.length > 0) {
        setOptions(prev => ({
          ...prev,
          family: response.data.map(item => ({
            code: item.unspscCode ? item.unspscCode.substring(2, 4) : item.family?.substring(2, 4) || item.code?.substring(2, 4),
            title: item.title,
            fullCode: item.unspscCode || item.code,
          }))
        }));
          // If these are global results, save them to user hierarchy
        if (response.source === 'global') {
          response.data.forEach(item => {
            // Add defensive check for item.code
            if (item.code && typeof item.code === 'string' && item.code.length >= 4) {
              unspscHierarchyService.save({
                unspscCode: item.code,
                level: 'FAMILY',
                title: item.title,
                segment: segmentCode,
                family: item.code.substring(2, 4),
              });
            }
          });
        }
      } else {
        setError('No families found for this segment');
      }
    } catch (err) {
      console.error('Error loading families:', err);
      setError('Failed to load families');
    } finally {
      setLoading(prev => ({ ...prev, family: false }));
    }
  }, []);

  // Load classes based on selected family
  const loadClasses = useCallback(async (segmentCode, familyCode) => {
    if (!segmentCode || !familyCode) return;
    
    const familyFullCode = segmentCode + familyCode + '0000';
    
    setLoading(prev => ({ ...prev, class: true }));
    try {
      // First try to get user's classes
      const response = await unspscHierarchyService.getChildren(familyFullCode, 'CLASS');
      
      if (response.success && response.data && response.data.length > 0) {
        setOptions(prev => ({
          ...prev,
          class: response.data.map(item => ({
            code: item.unspscCode ? item.unspscCode.substring(4, 6) : item.class?.substring(4, 6) || item.code?.substring(4, 6),
            title: item.title,
            fullCode: item.unspscCode || item.code,
          }))
        }));
          // If these are global results, save them to user hierarchy
        if (response.source === 'global') {
          response.data.forEach(item => {
            // Add defensive check for item.code
            if (item.code && typeof item.code === 'string' && item.code.length >= 6) {
              unspscHierarchyService.save({
                unspscCode: item.code,
                level: 'CLASS',
                title: item.title,
                segment: segmentCode,
                family: familyCode,
                class: item.code.substring(4, 6),
              });
            }
          });
        }
      } else {
        setError('No classes found for this family');
      }
    } catch (err) {
      console.error('Error loading classes:', err);
      setError('Failed to load classes');
    } finally {
      setLoading(prev => ({ ...prev, class: false }));
    }
  }, []);

  // Load commodities based on selected class
  const loadCommodities = useCallback(async (segmentCode, familyCode, classCode) => {
    if (!segmentCode || !familyCode || !classCode) return;
    
    const classFullCode = segmentCode + familyCode + classCode + '00';
    
    setLoading(prev => ({ ...prev, commodity: true }));
    try {
      // First try to get user's commodities
      const response = await unspscHierarchyService.getChildren(classFullCode, 'COMMODITY');
      
      if (response.success && response.data && response.data.length > 0) {
        setOptions(prev => ({
          ...prev,
          commodity: response.data.map(item => ({
            code: item.unspscCode ? item.unspscCode.substring(6, 8) : item.commodity?.substring(6, 8) || item.code?.substring(6, 8),
            title: item.title,
            fullCode: item.unspscCode || item.code,
          }))
        }));
          // If these are global results, save them to user hierarchy
        if (response.source === 'global') {
          response.data.forEach(item => {
            // Add defensive check for item.code
            if (item.code && typeof item.code === 'string' && item.code.length >= 8) {
              unspscHierarchyService.save({
                unspscCode: item.code,
                level: 'COMMODITY',
                title: item.title,
                segment: segmentCode,
                family: familyCode,
                class: classCode,
                commodity: item.code.substring(6, 8),
              });
            }
          });
        }
      } else {
        setError('No commodities found for this class');
      }
    } catch (err) {
      console.error('Error loading commodities:', err);
      setError('Failed to load commodities');
    } finally {
      setLoading(prev => ({ ...prev, commodity: false }));
    }
  }, []);

  // Handle segment selection
  const handleSegmentChange = (value, option) => {
    const segmentCode = value;
    const segmentTitle = option.title || option.children;
    
    setSelectedValues({
      segment: segmentCode,
      family: null,
      class: null,
      commodity: null
    });
    
    setSelectedTitles({
      segment: segmentTitle,
      family: '',
      class: '',
      commodity: ''
    });
    
    // Save to user history
    unspscHierarchyService.save({
      unspscCode: segmentCode + '000000',
      level: 'SEGMENT',
      title: segmentTitle,
      segment: segmentCode
    });
    
    // Reset dependent dropdowns
    setOptions(prev => ({
      ...prev,
      family: [],
      class: [],
      commodity: []
    }));
    
    // Load families for this segment
    loadFamilies(segmentCode);
    
    // If showLevel is SEGMENT, we're done
    if (showLevel === 'SEGMENT') {
      const selectedCode = segmentCode + '000000';
      onChange?.(selectedCode);
      onComplete?.({
        code: selectedCode,
        title: segmentTitle,
        level: 'SEGMENT',
        segment: segmentCode,
        family: '',
        class: '',
        commodity: ''
      });
    }
  };

  // Handle family selection
  const handleFamilyChange = (value, option) => {
    const familyCode = value;
    const familyTitle = option.title || option.children;
    
    setSelectedValues(prev => ({
      ...prev,
      family: familyCode,
      class: null,
      commodity: null
    }));
    
    setSelectedTitles(prev => ({
      ...prev,
      family: familyTitle,
      class: '',
      commodity: ''
    }));
    
    // Save to user history
    unspscHierarchyService.save({
      unspscCode: selectedValues.segment + familyCode + '0000',
      level: 'FAMILY',
      title: familyTitle,
      segment: selectedValues.segment,
      family: familyCode
    });
    
    // Reset dependent dropdowns
    setOptions(prev => ({
      ...prev,
      class: [],
      commodity: []
    }));
    
    // Load classes for this family
    loadClasses(selectedValues.segment, familyCode);
    
    // If showLevel is FAMILY, we're done
    if (showLevel === 'FAMILY') {
      const selectedCode = selectedValues.segment + familyCode + '0000';
      onChange?.(selectedCode);
      onComplete?.({
        code: selectedCode,
        title: familyTitle,
        level: 'FAMILY',
        segment: selectedValues.segment,
        family: familyCode,
        class: '',
        commodity: ''
      });
    }
  };

  // Handle class selection
  const handleClassChange = (value, option) => {
    const classCode = value;
    const classTitle = option.title || option.children;
    
    setSelectedValues(prev => ({
      ...prev,
      class: classCode,
      commodity: null
    }));
    
    setSelectedTitles(prev => ({
      ...prev,
      class: classTitle,
      commodity: ''
    }));
    
    // Save to user history
    unspscHierarchyService.save({
      unspscCode: selectedValues.segment + selectedValues.family + classCode + '00',
      level: 'CLASS',
      title: classTitle,
      segment: selectedValues.segment,
      family: selectedValues.family,
      class: classCode
    });
    
    // Reset commodity dropdown
    setOptions(prev => ({
      ...prev,
      commodity: []
    }));
    
    // Load commodities for this class
    loadCommodities(selectedValues.segment, selectedValues.family, classCode);
    
    // If showLevel is CLASS, we're done
    if (showLevel === 'CLASS') {
      const selectedCode = selectedValues.segment + selectedValues.family + classCode + '00';
      onChange?.(selectedCode);
      onComplete?.({
        code: selectedCode,
        title: classTitle,
        level: 'CLASS',
        segment: selectedValues.segment,
        family: selectedValues.family,
        class: classCode,
        commodity: ''
      });
    }
  };

  // Handle commodity selection
  const handleCommodityChange = (value, option) => {
    const commodityCode = value;
    const commodityTitle = option.title || option.children;
    
    setSelectedValues(prev => ({
      ...prev,
      commodity: commodityCode
    }));
    
    setSelectedTitles(prev => ({
      ...prev,
      commodity: commodityTitle
    }));
    
    // Save to user history
    const selectedCode = selectedValues.segment + selectedValues.family + selectedValues.class + commodityCode;
    unspscHierarchyService.save({
      unspscCode: selectedCode,
      level: 'COMMODITY',
      title: commodityTitle,
      segment: selectedValues.segment,
      family: selectedValues.family,
      class: selectedValues.class,
      commodity: commodityCode
    });
    
    // Notify parent component
    onChange?.(selectedCode);
    onComplete?.({
      code: selectedCode,
      title: commodityTitle,
      level: 'COMMODITY',
      segment: selectedValues.segment,
      family: selectedValues.family,
      class: selectedValues.class,
      commodity: commodityCode
    });
  };

  // Load initial segments on component mount
  useEffect(() => {
    loadSegments();
  }, [loadSegments]);

  // Parse initial value if provided
  useEffect(() => {
    if (value && value.length === 8) {
      const segment = value.substring(0, 2);
      const family = value.substring(2, 4);
      const classCode = value.substring(4, 6);
      const commodity = value.substring(6, 8);
      
      // Set selected values
      setSelectedValues({
        segment,
        family,
        class: classCode,
        commodity
      });
      
      // Load appropriate options
      loadSegments().then(() => {
        if (segment) {
          loadFamilies(segment).then(() => {
            if (family) {
              loadClasses(segment, family).then(() => {
                if (classCode) {
                  loadCommodities(segment, family, classCode);
                }
              });
            }
          });
        }
      });
    }
  }, [value, loadSegments, loadFamilies, loadClasses, loadCommodities]);
  return (
    <div className="unspsc-hierarchy-selector">
      {error && (
        <Alert
          message="Error Loading UNSPSC Data"
          description={
            <div>
              <p>{error}</p>
              <Button 
                type="primary" 
                size="small" 
                onClick={() => loadSegments()}
                loading={loading.segment}
              >
                Retry
              </Button>
            </div>
          }
          type="error"
          closable
          onClose={() => setError(null)}
          style={{ marginBottom: 16 }}
        />
      )}
      
      {/* Segment Selection */}
      <div style={{ marginBottom: 12 }}>
        <Text strong>Segment</Text>
        <Select
          placeholder="Select Segment"
          style={{ width: '100%' }}
          value={selectedValues.segment}
          onChange={(value, option) => handleSegmentChange(value, option)}
          loading={loading.segment}
          notFoundContent={loading.segment ? <Spin size="small" /> : <Empty description="No segments found" />}
        >
          {options.segment.length > 0 ? (
            options.segment.map((segment) => (
              <Option key={segment.code} value={segment.code} title={segment.title}>
                {formatOptionLabel(segment.code, segment.title)}
              </Option>
            ))
          ) : null}
        </Select>
      </div>
      
      {/* Family Selection - visible once segment is selected */}
      {(selectedValues.segment && (showLevel === 'FAMILY' || showLevel === 'CLASS' || showLevel === 'COMMODITY')) && (
        <div style={{ marginBottom: 12 }}>
          <Text strong>Family</Text>
          <Select
            placeholder="Select Family"
            style={{ width: '100%' }}
            value={selectedValues.family}
            onChange={(value, option) => handleFamilyChange(value, option)}
            loading={loading.family}
            notFoundContent={loading.family ? <Spin size="small" /> : <Empty description="No families found" />}
            disabled={!selectedValues.segment}
          >
            {options.family.length > 0 ? (
              options.family.map((family) => (
                <Option key={family.code} value={family.code} title={family.title}>
                  {formatOptionLabel(family.code, family.title)}
                </Option>
              ))
            ) : null}
          </Select>
        </div>
      )}
      
      {/* Class Selection - visible once family is selected */}
      {(selectedValues.family && (showLevel === 'CLASS' || showLevel === 'COMMODITY')) && (
        <div style={{ marginBottom: 12 }}>
          <Text strong>Class</Text>
          <Select
            placeholder="Select Class"
            style={{ width: '100%' }}
            value={selectedValues.class}
            onChange={(value, option) => handleClassChange(value, option)}
            loading={loading.class}
            notFoundContent={loading.class ? <Spin size="small" /> : <Empty description="No classes found" />}
            disabled={!selectedValues.family}
          >
            {options.class.length > 0 ? (
              options.class.map((classItem) => (
                <Option key={classItem.code} value={classItem.code} title={classItem.title}>
                  {formatOptionLabel(classItem.code, classItem.title)}
                </Option>
              ))
            ) : null}
          </Select>
        </div>
      )}
      
      {/* Commodity Selection - visible once class is selected */}
      {(selectedValues.class && showLevel === 'COMMODITY') && (
        <div style={{ marginBottom: 12 }}>
          <Text strong>Commodity</Text>
          <Select
            placeholder="Select Commodity"
            style={{ width: '100%' }}
            value={selectedValues.commodity}
            onChange={(value, option) => handleCommodityChange(value, option)}
            loading={loading.commodity}
            notFoundContent={loading.commodity ? <Spin size="small" /> : <Empty description="No commodities found" />}
            disabled={!selectedValues.class}
          >
            {options.commodity.length > 0 ? (
              options.commodity.map((commodity) => (
                <Option key={commodity.code} value={commodity.code} title={commodity.title}>
                  {formatOptionLabel(commodity.code, commodity.title)}
                </Option>
              ))
            ) : null}
          </Select>
        </div>
      )}
      
      {/* Selected Classification Path */}
      <div className="selected-classification-path">
        <Text type="secondary">Selected Classification Path:</Text>
        <div style={{ fontWeight: 'bold', marginTop: 4 }}>
          {selectedValues.segment ? (
            <>
              <span>Segment: {selectedValues.segment} ({selectedTitles.segment})</span>
              {selectedValues.family && (
                <>
                  <span> &gt; Family: {selectedValues.family} ({selectedTitles.family})</span>
                  {selectedValues.class && (
                    <>
                      <span> &gt; Class: {selectedValues.class} ({selectedTitles.class})</span>
                      {selectedValues.commodity && (
                        <span> &gt; Commodity: {selectedValues.commodity} ({selectedTitles.commodity})</span>
                      )}
                    </>
                  )}
                </>
              )}
            </>
          ) : (
            <span style={{ fontStyle: 'italic', color: '#999' }}>No classification selected</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserUnspscHierarchySelector;
