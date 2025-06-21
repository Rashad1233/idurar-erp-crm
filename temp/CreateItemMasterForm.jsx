import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CreateItemMasterForm.css';

const initialState = {
  itemNumber: '',
  shortDescription: '',
  unspscCodeId: '',
  unitOfMeasure: '',
  manufacturer: '',
  brand: '',
  model: '',
  partNumber: '',
  minimumOrderQty: '',
  reorderLevel: '',
  maximumLevel: '',
};

export default function CreateItemMasterForm({ onSuccess }) {
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  // UNSPSC hierarchical data
  const [segments, setSegments] = useState([]);
  const [families, setFamilies] = useState([]);
  const [classes, setClasses] = useState([]);
  const [commodities, setCommodities] = useState([]);
  
  // Selected UNSPSC values
  const [selectedSegment, setSelectedSegment] = useState('');
  const [selectedFamily, setSelectedFamily] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedCommodity, setSelectedCommodity] = useState('');
  
  // UNSPSC search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState(null);

  // Units of measure common in ERP systems
  const unitsOfMeasure = ['EA', 'PCS', 'KG', 'G', 'L', 'ML', 'M', 'CM', 'MM', 'BOX', 'CTN', 'DZ', 'PR', 'SET'];

  useEffect(() => {
    // Generate random item number
    generateItemNumber();
    
    // Fetch UNSPSC segments (top level)
    fetchUnspscSegments();
  }, []);

  const generateItemNumber = () => {
    const randomNumber = Math.floor(100000 + Math.random() * 900000);
    setForm(prev => ({ ...prev, itemNumber: `ITEM-${randomNumber}` }));
  };

  // Fetch top level UNSPSC segments
  const fetchUnspscSegments = async () => {
    try {
      console.log('Fetching UNSPSC segments...');
      const response = await axios.get('/api/unspsc/level/SEGMENT');
      
      if (response.data && Array.isArray(response.data)) {
        setSegments(response.data);
        console.log('Loaded segments:', response.data);
      } else {
        // Fallback data if API doesn't return expected data
        setSegments([
          { id: 's1', code: '31000000', title: 'Manufacturing Components', segment: '31' },
          { id: 's2', code: '43000000', title: 'Information Technology', segment: '43' },
          { id: 's3', code: '44000000', title: 'Office Equipment', segment: '44' }
        ]);
      }
    } catch (err) {
      console.error('Failed to fetch UNSPSC segments:', err);
      // Fallback data if API fails
      setSegments([
        { id: 's1', code: '31000000', title: 'Manufacturing Components', segment: '31' },
        { id: 's2', code: '43000000', title: 'Information Technology', segment: '43' },
        { id: 's3', code: '44000000', title: 'Office Equipment', segment: '44' }
      ]);
    }
  };
  
  // Search for UNSPSC codes in external database
  const searchUnspscCodes = async (query) => {
    if (!query || query.trim().length < 3) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }
    
    try {
      setIsSearching(true);
      console.log(`Searching for UNSPSC codes with query: ${query}`);
      const response = await axios.get(`/api/unspsc-external/search/${encodeURIComponent(query)}`);
      
      if (response.data && Array.isArray(response.data)) {
        setSearchResults(response.data);
        setShowSearchResults(true);
      } else {
        setSearchResults([]);
        setShowSearchResults(false);
      }
    } catch (err) {
      console.error('Failed to search UNSPSC codes:', err);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle search input changes with debounce
  const handleSearchInputChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    // Clear any existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    // Set a new timeout to debounce the search
    const timeout = setTimeout(() => {
      searchUnspscCodes(query);
    }, 500); // 500ms debounce
    
    setSearchTimeout(timeout);
  };

  // Handle selecting a search result
  const handleSearchResultSelect = (result) => {
    // Reset search
    setSearchQuery('');
    setSearchResults([]);
    setShowSearchResults(false);
    
    // Extract UNSPSC components from the code
    const segment = result.code.substring(0, 2);
    const family = result.code.substring(2, 4);
    const classCode = result.code.substring(4, 6);
    const commodity = result.code.substring(6, 8);
    
    // If it's a segment
    if (family === '00' && classCode === '00' && commodity === '00') {
      setSelectedSegment(segment);
      fetchFamilies(segment);
    }
    // If it's a family
    else if (classCode === '00' && commodity === '00') {
      setSelectedSegment(segment);
      setSelectedFamily(family);
      fetchFamilies(segment);
      fetchClasses(segment, family);
    }
    // If it's a class
    else if (commodity === '00') {
      setSelectedSegment(segment);
      setSelectedFamily(family);
      setSelectedClass(classCode);
      fetchFamilies(segment);
      fetchClasses(segment, family);
      fetchCommodities(segment, family, classCode);
    }
    // If it's a commodity
    else {
      setSelectedSegment(segment);
      setSelectedFamily(family);
      setSelectedClass(classCode);
      setSelectedCommodity(commodity);
      fetchFamilies(segment);
      fetchClasses(segment, family);
      fetchCommodities(segment, family, classCode);
      
      // Set the form UNSPSC ID (would need to fetch the actual ID from backend)
      // For now, assuming the ID structure
      setForm(prev => ({ ...prev, unspscCodeId: result.id || `${segment}${family}${classCode}${commodity}` }));
    }
  };

  // Fetch families for selected segment
  const fetchFamilies = async (segment) => {
    if (!segment) return;
    
    try {
      console.log(`Fetching families for segment ${segment}...`);
      const response = await axios.get(`/api/unspsc/families/${segment}`);
      
      if (response.data && Array.isArray(response.data)) {
        setFamilies(response.data);
        console.log('Loaded families:', response.data);
      } else {
        // Fallback data if API doesn't return expected data
        setFamilies([
          { id: 'f1', code: '31150000', title: 'Bearings and bushings', segment: '31', family: '15' },
          { id: 'f2', code: '43210000', title: 'Computer Equipment', segment: '43', family: '21' }
        ]);
      }
    } catch (err) {
      console.error(`Failed to fetch families for segment ${segment}:`, err);
      // Fallback data if API fails
      setFamilies([
        { id: 'f1', code: '31150000', title: 'Bearings and bushings', segment: '31', family: '15' },
        { id: 'f2', code: '43210000', title: 'Computer Equipment', segment: '43', family: '21' }
      ]);
    }
  };

  // Fetch classes for selected segment and family
  const fetchClasses = async (segment, family) => {
    if (!segment || !family) return;
    
    try {
      console.log(`Fetching classes for segment ${segment}, family ${family}...`);
      const response = await axios.get(`/api/unspsc/classes/${segment}/${family}`);
      
      if (response.data && Array.isArray(response.data)) {
        setClasses(response.data);
        console.log('Loaded classes:', response.data);
      } else {
        // Fallback data if API doesn't return expected data
        setClasses([
          { id: 'c1', code: '31151500', title: 'Bearings', segment: '31', family: '15', class: '15' },
          { id: 'c2', code: '43211500', title: 'Computers', segment: '43', family: '21', class: '15' }
        ]);
      }
    } catch (err) {
      console.error(`Failed to fetch classes for segment ${segment}, family ${family}:`, err);
      // Fallback data if API fails
      setClasses([
        { id: 'c1', code: '31151500', title: 'Bearings', segment: '31', family: '15', class: '15' },
        { id: 'c2', code: '43211500', title: 'Computers', segment: '43', family: '21', class: '15' }
      ]);
    }
  };

  // Fetch commodities for selected segment, family, and class
  const fetchCommodities = async (segment, family, classCode) => {
    if (!segment || !family || !classCode) return;
    
    try {
      console.log(`Fetching commodities for segment ${segment}, family ${family}, class ${classCode}...`);
      const response = await axios.get(`/api/unspsc/commodities/${segment}/${family}/${classCode}`);
      
      if (response.data && Array.isArray(response.data)) {
        setCommodities(response.data);
        console.log('Loaded commodities:', response.data);
      } else {
        // Fallback data if API doesn't return expected data
        setCommodities([
          { id: 'co1', code: '31151501', title: 'Ball bearings', segment: '31', family: '15', class: '15', commodity: '01' },
          { id: 'co2', code: '43211501', title: 'Desktop computers', segment: '43', family: '21', class: '15', commodity: '01' }
        ]);
      }
    } catch (err) {
      console.error(`Failed to fetch commodities:`, err);
      // Fallback data if API fails
      setCommodities([
        { id: 'co1', code: '31151501', title: 'Ball bearings', segment: '31', family: '15', class: '15', commodity: '01' },
        { id: 'co2', code: '43211501', title: 'Desktop computers', segment: '43', family: '21', class: '15', commodity: '01' }
      ]);
    }
  };

  // Handle segment selection
  const handleSegmentChange = (e) => {
    const segment = e.target.value;
    setSelectedSegment(segment);
    setSelectedFamily('');
    setSelectedClass('');
    setSelectedCommodity('');
    setFamilies([]);
    setClasses([]);
    setCommodities([]);
    setForm(prev => ({ ...prev, unspscCodeId: '' }));
    
    if (segment) {
      fetchFamilies(segment);
    }
  };

  // Handle family selection
  const handleFamilyChange = (e) => {
    const family = e.target.value;
    setSelectedFamily(family);
    setSelectedClass('');
    setSelectedCommodity('');
    setClasses([]);
    setCommodities([]);
    setForm(prev => ({ ...prev, unspscCodeId: '' }));
    
    if (family && selectedSegment) {
      fetchClasses(selectedSegment, family);
    }
  };

  // Handle class selection
  const handleClassChange = (e) => {
    const classCode = e.target.value;
    setSelectedClass(classCode);
    setSelectedCommodity('');
    setCommodities([]);
    setForm(prev => ({ ...prev, unspscCodeId: '' }));
    
    if (classCode && selectedSegment && selectedFamily) {
      fetchCommodities(selectedSegment, selectedFamily, classCode);
    }
  };

  // Handle commodity selection
  const handleCommodityChange = (e) => {
    const commodity = e.target.value;
    setSelectedCommodity(commodity);
    
    // Find the selected commodity's ID to set in the form
    if (commodity) {
      const selectedItem = commodities.find(item => item.commodity === commodity);
      if (selectedItem) {
        setForm(prev => ({ ...prev, unspscCodeId: selectedItem.id }));
      }
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/item-master', form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess(true);
      setForm(initialState);
      generateItemNumber(); // Generate new item number after successful submission
      
      // Reset UNSPSC selections
      setSelectedSegment('');
      setSelectedFamily('');
      setSelectedClass('');
      setSelectedCommodity('');
      setFamilies([]);
      setClasses([]);
      setCommodities([]);
      
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create item');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form className="item-master-form" onSubmit={handleSubmit}>
      <h2>Create New Item</h2>
      
      {/* Item Number - Read-only, auto-generated */}
      <div className="form-group">
        <label htmlFor="itemNumber">Item Number</label>
        <input
          id="itemNumber"
          name="itemNumber"
          value={form.itemNumber}
          readOnly
          className="read-only-input"
        />
      </div>
      
      {/* Short Description */}
      <div className="form-group">
        <label htmlFor="shortDescription">Short Description</label>
        <input
          id="shortDescription"
          name="shortDescription"
          value={form.shortDescription}
          onChange={handleChange}
          required
        />
      </div>
      
      {/* UNSPSC Code Search */}
      <div className="unspsc-section">
        <h3>UNSPSC Classification</h3>
        
        {/* UNSPSC Search Input */}
        <div className="form-group">
          <label htmlFor="unspsc-search">Search UNSPSC Codes</label>
          <div className="search-container">
            <input
              id="unspsc-search"
              type="text"
              value={searchQuery}
              onChange={handleSearchInputChange}
              placeholder="Search by keyword (e.g., 'computer', 'bearing')"
              className="search-input"
            />
            {isSearching && <div className="search-spinner">Searching...</div>}
            
            {/* Search Results Dropdown */}
            {showSearchResults && searchResults.length > 0 && (
              <div className="search-results">
                {searchResults.map((result, index) => (
                  <div 
                    key={index} 
                    className="search-result-item"
                    onClick={() => handleSearchResultSelect(result)}
                  >
                    <span className="search-result-code">{result.code}</span>
                    <span className="search-result-title">{result.title}</span>
                    <span className="search-result-level">{result.level}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Segment Dropdown */}
        <div className="form-group">
          <label htmlFor="unspsc-segment">Segment</label>
          <select
            id="unspsc-segment"
            value={selectedSegment}
            onChange={handleSegmentChange}
            required
          >
            <option value="">Select Segment</option>
            {segments.map(segment => (
              <option key={segment.id} value={segment.segment}>
                {`${segment.code} - ${segment.title}`}
              </option>
            ))}
          </select>
        </div>
        
        {/* Family Dropdown - Only enabled if segment is selected */}
        <div className="form-group">
          <label htmlFor="unspsc-family">Family</label>
          <select
            id="unspsc-family"
            value={selectedFamily}
            onChange={handleFamilyChange}
            disabled={!selectedSegment}
            required={!!selectedSegment}
          >
            <option value="">Select Family</option>
            {families.map(family => (
              <option key={family.id} value={family.family}>
                {`${family.code} - ${family.title}`}
              </option>
            ))}
          </select>
        </div>
        
        {/* Class Dropdown - Only enabled if family is selected */}
        <div className="form-group">
          <label htmlFor="unspsc-class">Class</label>
          <select
            id="unspsc-class"
            value={selectedClass}
            onChange={handleClassChange}
            disabled={!selectedFamily}
            required={!!selectedFamily}
          >
            <option value="">Select Class</option>
            {classes.map(cls => (
              <option key={cls.id} value={cls.class}>
                {`${cls.code} - ${cls.title}`}
              </option>
            ))}
          </select>
        </div>
        
        {/* Commodity Dropdown - Only enabled if class is selected */}
        <div className="form-group">
          <label htmlFor="unspsc-commodity">Commodity</label>
          <select
            id="unspsc-commodity"
            value={selectedCommodity}
            onChange={handleCommodityChange}
            disabled={!selectedClass}
            required={!!selectedClass}
          >
            <option value="">Select Commodity</option>
            {commodities.map(commodity => (
              <option key={commodity.id} value={commodity.commodity}>
                {`${commodity.code} - ${commodity.title}`}
              </option>
            ))}
          </select>
        </div>
        
        {/* Display selected UNSPSC path */}
        {selectedSegment && (
          <div className="selected-unspsc-path">
            <label>Selected UNSPSC Path:</label>
            <span>
              {`${selectedSegment}${selectedFamily || '00'}${selectedClass || '00'}${selectedCommodity || '00'}`}
              {selectedSegment && ` - Segment: ${segments.find(s => s.segment === selectedSegment)?.title || ''}`}
              {selectedFamily && ` > Family: ${families.find(f => f.family === selectedFamily)?.title || ''}`}
              {selectedClass && ` > Class: ${classes.find(c => c.class === selectedClass)?.title || ''}`}
              {selectedCommodity && ` > Commodity: ${commodities.find(c => c.commodity === selectedCommodity)?.title || ''}`}
            </span>
          </div>
        )}
        
        {/* Hidden field to store the actual UNSPSC code ID */}
        <input
          type="hidden"
          name="unspscCodeId"
          value={form.unspscCodeId}
        />
      </div>
      
      {/* Unit of Measure - Dropdown */}
      <div className="form-group">
        <label htmlFor="unitOfMeasure">Unit of Measure</label>
        <select
          id="unitOfMeasure"
          name="unitOfMeasure"
          value={form.unitOfMeasure}
          onChange={handleChange}
          required
        >
          <option value="">Select Unit</option>
          {unitsOfMeasure.map(unit => (
            <option key={unit} value={unit}>{unit}</option>
          ))}
        </select>
      </div>
      
      {/* Remaining form fields */}
      {['manufacturer', 'brand', 'model', 'partNumber', 'minimumOrderQty', 'reorderLevel', 'maximumLevel'].map((key) => (
        <div className="form-group" key={key}>
          <label htmlFor={key}>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</label>
          <input
            id={key}
            name={key}
            value={form[key]}
            onChange={handleChange}
            type={key.includes('Qty') || key.includes('Level') ? 'number' : 'text'}
          />
        </div>
      ))}
      
      <button type="submit" className="submit-button" disabled={loading}>
        {loading ? 'Creating...' : 'Create Item'}
      </button>
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">Item created successfully!</div>}
    </form>
  );
}
