import { useState, useEffect, useRef, useCallback } from 'react';

import useDebounce from '@/hooks/useDebounce';

import { Select, Empty } from 'antd';

import { SearchOutlined } from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import { crud } from '@/redux/crud/actions';

import { useCrudContext } from '@/context/crud';
import { selectSearchedItems } from '@/redux/crud/selectors';

function SearchItemComponent({ config, onRerender }) {
  let { entity, searchConfig } = config;

  const { displayLabels, searchFields, outputValue = '_id' } = searchConfig;
  const dispatch = useDispatch();
  const { crudContextAction } = useCrudContext();
  const { result, isLoading, isSuccess } = useSelector(selectSearchedItems);

  const [selectOptions, setOptions] = useState([]);
  const [currentValue, setCurrentValue] = useState(undefined);

  const isSearching = useRef(false);
  const previousOptions = useRef([]);

  const [searching, setSearching] = useState(false);
  const [valToSearch, setValToSearch] = useState('');

  // Use a stable reference for debounced update
  const debouncedUpdate = useCallback(() => {
    if (!isSearching.current) return;

    if (isSuccess && JSON.stringify(result) !== JSON.stringify(previousOptions.current)) {
      previousOptions.current = result;
      setOptions(result);
      setSearching(false);
    } else if (!isSuccess) {
      setSearching(false);
      if (currentValue !== undefined) {
        setCurrentValue(undefined);
      }
      if (selectOptions.length > 0) {
        setOptions([]);
      }
    }
  }, [isSuccess, result, currentValue, selectOptions]);

  useEffect(() => {
    debouncedUpdate();
    
    return () => {
      isSearching.current = false;
    };
  }, [debouncedUpdate]);

  const onSearch = useCallback((searchText) => {
    if (searchText.length < 1) {
      setOptions([]);
      return;
    }

    isSearching.current = true;
    setSearching(true);
    setValToSearch(searchText);

    dispatch(crud.search(entity, { 
      question: searchText,
      fields: searchFields
    }));
  }, [entity, searchFields, dispatch]);

  const onSelect = (data) => {
    const currentItem = result.find((item) => {
      return item[outputValue] === data;
    });

    dispatch(crud.currentItem({ data: currentItem }));

    panel.open();
    collapsedBox.open();
    readBox.open();
    onRerender();
  };

  const labels = (optionField) => {
    return displayLabels.map((x) => optionField[x]).join(' ');
  };

  return (
    <Select
      loading={isLoading}
      showSearch
      allowClear
      placeholder={<SearchOutlined style={{ float: 'right', padding: '8px 0' }} />}
      defaultActiveFirstOption={false}
      filterOption={false}
      notFoundContent={searching ? '... Searching' : <Empty />}
      value={currentValue}
      onSearch={onSearch}
      style={{ width: '100%' }}
      onSelect={onSelect}
    >
      {selectOptions.map((optionField) => (
        <Select.Option key={optionField[outputValue]} value={optionField[outputValue]}>
          {labels(optionField)}
        </Select.Option>
      ))}
    </Select>
  );
}

export default function SearchItem({ config }) {
  const [state, setState] = useState([0]);

  const onRerender = () => {
    setState([state + 1]);
  };

  return state.map((comp) => (
    <SearchItemComponent key={comp} config={config} onRerender={onRerender} />
  ));
}
