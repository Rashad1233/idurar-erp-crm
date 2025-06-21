import { useState, useEffect, useCallback, useRef } from 'react';
import { request } from '@/request';

/**
 * Custom hook for searching data via API
 * 
 * @param {string} entity - The entity to search (e.g., 'purchase-requisition')
 * @param {Object} defaultOptions - Default search options
 * @returns {Object} - Search state and functions
 */
const useApiSearch = (entity, defaultOptions = {}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState(null);
  
  // Cache for search results to prevent repeated searches for the same term
  const [searchCache, setSearchCache] = useState({});
  
  // Use a ref to access the cache without creating dependencies
  const cacheRef = useRef({});
  
  // Store the defaultOptions as a ref to prevent re-renders
  const defaultOptionsRef = useRef(defaultOptions);
    // Update the ref when defaultOptions changes
  useEffect(() => {
    defaultOptionsRef.current = defaultOptions;
  }, [defaultOptions]);
  
  // Keep the cache in sync between the ref and state
  // We'll update the ref from state changes but avoid updating state from ref changes
  useEffect(() => {
    // Deep compare to avoid unnecessary updates
    if (JSON.stringify(cacheRef.current) !== JSON.stringify(searchCache)) {
      cacheRef.current = { ...searchCache };
    }
  }, [searchCache]);
    // Debounced search function with caching
  const debouncedSearch = useCallback((term) => {
    if (!term || term.trim() === '') {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }
    
    // Create a cache key based on the search term and options from the ref
    const cacheKey = `${term}:${JSON.stringify(defaultOptionsRef.current)}`;
    
    // Check if we have a cached result
    if (cacheRef.current[cacheKey]) {
      console.log('Using cached search results for:', term);
      setSearchResults(cacheRef.current[cacheKey].results);
      setIsSearching(false);
      return;
    }

    // Otherwise proceed with API request
    setIsSearching(true);
    setError(null);
    
    // Safety timeout to prevent UI from being stuck in loading state
    const loadingTimeout = setTimeout(() => {
      setIsSearching(false);
    }, 1500);

    // Build search options
    const options = {
      q: term,
      ...defaultOptionsRef.current
    };

    // Call the search API
    request.search({ entity, options })
      .then(response => {
        clearTimeout(loadingTimeout);
        
        if (response.success) {
          const results = response.result || [];
          
          // Cache the results directly in the ref to avoid triggering renders
          cacheRef.current[cacheKey] = { 
            results,
            timestamp: Date.now()
          };
          
          // Only update state if this search term is still current
          if (term === searchTerm) {
            setSearchResults(results);
            setIsSearching(false);
          }
        } else {
          // Cache empty results too
          cacheRef.current[cacheKey] = { 
            results: [],
            timestamp: Date.now()
          };
          
          // Only update state if this search term is still current
          if (term === searchTerm) {
            setSearchResults([]);
            setError(response.message || 'Search failed');
            setIsSearching(false);
          }
        }
      })
      .catch(err => {
        clearTimeout(loadingTimeout);
        
        console.error(`Error searching ${entity}:`, err);
        
        // Cache the error
        cacheRef.current[cacheKey] = { 
          results: [],
          timestamp: Date.now(),
          error: err.message
        };
        
        // Only update state if this search term is still current
        if (term === searchTerm) {
          setError(err.message || 'An error occurred during search');
          setSearchResults([]);
          setIsSearching(false);
        }
      });  }, [entity, searchTerm]); // Only depend on entity and searchTerm

  // Handle search term changes with debounce
  useEffect(() => {
    // Skip if term is empty
    if (!searchTerm || searchTerm.trim() === '') {
      setSearchResults([]);
      setIsSearching(false);
      return () => {};
    }
    
    // Store the current search term and options to avoid closure issues
    const currentSearchTerm = searchTerm;
    const currentOptions = defaultOptionsRef.current;
    
    // Check cache first using the ref to avoid dependencies
    const cacheKey = `${currentSearchTerm}:${JSON.stringify(currentOptions)}`;
    const cachedResult = cacheRef.current[cacheKey];
    
    if (cachedResult) {
      // Use a local variable for the cached results to avoid closure issues
      const cachedResults = cachedResult.results;
      // Use a functional update to ensure we're working with the latest state
      setSearchResults(() => cachedResults);
      setIsSearching(false);
      return () => {};
    }
    
    // Track if this effect is still the most recent one
    const effectId = Date.now();
    const isCurrentEffect = () => currentSearchTerm === searchTerm;
    
    // Show loading after a small delay
    const loadingDelay = setTimeout(() => {
      // Only set loading if we're still searching for the same term
      if (isCurrentEffect()) {
        setIsSearching(true);
      }
    }, 100);
    
    // Use adaptive debounce time
    let debounceTime = 300;
    if (/^\d+$/.test(currentSearchTerm) || currentSearchTerm.length > 5) {
      debounceTime = 200;
    } else if (currentSearchTerm.length <= 2) {
      debounceTime = 400;
    }
    
    // Set up the debounced search
    const handler = setTimeout(() => {
      // Only perform search if this is still the current search term
      if (isCurrentEffect()) {
        // Use the standalone function without triggering the useEffect
        if (!currentSearchTerm || currentSearchTerm.trim() === '') {
          setSearchResults([]);
          setIsSearching(false);
          return;
        }
        
        // Check one more time if the result is in cache (could have been added while waiting)
        if (cacheRef.current[cacheKey]) {
          setSearchResults(cacheRef.current[cacheKey].results);
          setIsSearching(false);
          return;
        }
        
        // Otherwise proceed with API request
        setIsSearching(true);
        setError(null);
        
        // Safety timeout to prevent UI from being stuck in loading state
        const loadingTimeout = setTimeout(() => {
          if (isCurrentEffect()) {
            setIsSearching(false);
          }
        }, 1500);
        
        // Build search options
        const options = {
          q: currentSearchTerm,
          ...currentOptions
        };
        
        // Call the search API
        request.search({ entity, options })
          .then(response => {
            clearTimeout(loadingTimeout);
            
            // Only update state if this is still the current search
            if (!isCurrentEffect()) return;
            
            if (response.success) {
              const results = response.result || [];
              
              // Cache the results without triggering a state update in the dependency array
              cacheRef.current[cacheKey] = { 
                results,
                timestamp: Date.now()
              };
              
              // Update state with the latest results
              setSearchResults(results);
              setIsSearching(false);
            } else {
              setSearchResults([]);
              setError(response.message || 'Search failed');
              
              // Cache empty results too
              cacheRef.current[cacheKey] = { 
                results: [],
                timestamp: Date.now()
              };
              
              setIsSearching(false);
            }
          })
          .catch(err => {
            clearTimeout(loadingTimeout);
            
            // Only update state if this is still the current search
            if (!isCurrentEffect()) return;
            
            console.error(`Error searching ${entity}:`, err);
            setError(err.message || 'An error occurred during search');
            setSearchResults([]);
            
            // Cache the error
            cacheRef.current[cacheKey] = { 
              results: [],
              timestamp: Date.now(),
              error: err.message
            };
            
            setIsSearching(false);
          });
      }
      clearTimeout(loadingDelay);
    }, debounceTime);

    return () => {
      clearTimeout(handler);
      clearTimeout(loadingDelay);
    };
  }, [searchTerm, entity]); // Only depend on searchTerm and entity
  // Function to manually trigger search
  const search = useCallback((term) => {
    // Check if the term is the same to avoid unnecessary state updates
    if (term === searchTerm) return;
    setSearchTerm(term);
  }, [searchTerm]);
  
  // Function to clear search
  const clearSearch = useCallback(() => {
    // Check if already empty to avoid unnecessary state updates
    if (searchTerm === '' && searchResults.length === 0 && !error) return;
    
    setSearchTerm('');
    setSearchResults([]);
    setError(null);
  }, [searchTerm, searchResults.length, error]);

  return {
    searchTerm,
    setSearchTerm,
    searchResults,
    isSearching,
    error,
    search,
    clearSearch
  };
};

export default useApiSearch;
