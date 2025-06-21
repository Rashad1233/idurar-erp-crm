import React, { Component } from 'react';
import { Alert, Button, Typography } from 'antd';

const { Text, Paragraph } = Typography;

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error('React Error Boundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
    
    // Log additional details that might help diagnose the issue
    if (error && error.message && error.message.includes('primitive value')) {
      console.error('This appears to be a lazy loading error. Check the component imports and routes.');
    }
  }

  render() {
    if (this.state.hasError) {
      // Provide a more detailed error UI with helpful information
      return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
          <Alert
            message="Application Error"
            description={
              <div>
                <Paragraph>
                  Something went wrong in the application. This might be due to:
                </Paragraph>
                <ul>
                  <li>A component loading issue</li>
                  <li>An API or data formatting problem</li>
                  <li>A configuration error</li>
                </ul>
                {this.state.error && (
                  <Paragraph>
                    <Text type="danger">Error: {this.state.error.toString()}</Text>
                  </Paragraph>
                )}
                <div style={{ marginTop: '15px' }}>
                  <Button 
                    type="primary" 
                    onClick={() => window.location.href = '/'}
                    style={{ marginRight: '10px' }}
                  >
                    Go to Home
                  </Button>
                  <Button 
                    onClick={() => window.location.reload()}
                  >
                    Reload Page
                  </Button>
                </div>
              </div>
            }
            type="error"
            showIcon
          />
        </div>
      );
    }

    return this.props.children;
  }
}
