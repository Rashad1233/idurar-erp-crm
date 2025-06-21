import { notification } from 'antd';

import codeMessage from './codeMessage';

const successHandler = (response, options = { notifyOnSuccess: false, notifyOnFailed: true }) => {
  const { data, status } = response;
  
  // Don't treat 2xx responses as errors
  if (status >= 200 && status < 300) {
    const message = data && data.message;
    const successText = message || codeMessage[status];

    if (options.notifyOnSuccess) {
      notification.config({
        duration: 2,
        maxCount: 2,
      });
      notification.success({
        message: 'Request success',
        description: successText,
      });
    }
    return data;
  }
  
  // Only show error for non-2xx responses
  const message = data && data.message;
  const errorText = message || codeMessage[status];
  if (options.notifyOnFailed) {
    notification.config({
      duration: 4,
      maxCount: 2,
    });
    notification.error({
      message: `Request error ${status}`,
      description: errorText,
    });
  }
  return data;
};

export default successHandler;
