import { ErpLayout } from '@/layout';

import PageLoader from '@/components/PageLoader';
import { erp } from '@/redux/erp/actions';
import { selectItemById, selectCurrentItem, selectRecordPaymentItem } from '@/redux/erp/selectors';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import Payment from './components/Payment';

export default function RecordPaymentModule({ config }) {
  const dispatch = useDispatch();
  const { id } = useParams();
  
  console.log('RecordPaymentModule - Invoice ID from params:', id);

  let item = useSelector(selectItemById(id));  useEffect(() => {    if (item) {
      // Keep it simple and just pass the item directly
      // We'll handle client extraction in the RecordPayment component
      const normalizedItem = {
        ...item,
        id: item.id || item._id,  // Handle both SQL and MongoDB style IDs
      };
      
      console.log('Passing invoice to payment module:', normalizedItem);
      
      console.log('Normalized invoice item:', normalizedItem);
      dispatch(erp.currentItem({ data: normalizedItem }));
    } else {
      dispatch(erp.read({ entity: config.entity, id }));
    }
  }, [item, id]);

  const { result: currentResult } = useSelector(selectCurrentItem);
  item = currentResult;

  useEffect(() => {
    dispatch(erp.currentAction({ actionType: 'recordPayment', data: item }));
  }, [item]);

  return (
    <ErpLayout>
      {item ? <Payment config={config} currentItem={currentResult} /> : <PageLoader />}
    </ErpLayout>
  );
}
