import React, { useState, useRef, useEffect } from 'react';
import { Modal, Button, Input, Alert, Space, Typography, Card } from 'antd';
import { CameraOutlined, ScanOutlined, StopOutlined } from '@ant-design/icons';
import './BarcodeScanner.css';

const { Title, Text } = Typography;

const BarcodeScanner = ({ visible, onClose, onScan, title = "Scan Barcode" }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [manualBarcode, setManualBarcode] = useState('');
  const [error, setError] = useState('');
  const [stream, setStream] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (visible && isScanning) {
      startCamera();
    }
    return () => {
      stopScanning();
    };
  }, [visible, isScanning]);

  const startCamera = async () => {
    try {
      setError('');
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Use back camera if available
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        
        // Start barcode detection
        intervalRef.current = setInterval(captureAndDecode, 500);
      }
    } catch (err) {
      console.error('Camera access error:', err);
      setError(`Camera access denied: ${err.message}. Please use manual input.`);
      setIsScanning(false);
    }
  };

  const stopScanning = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsScanning(false);
  };

  const captureAndDecode = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Get image data
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    
    // Simple barcode detection (this is a basic implementation)
    // In a real application, you would use a library like @zxing/library
    // For now, we'll just show how the infrastructure works
    detectBarcode(imageData);
  };

  const detectBarcode = (imageData) => {
    // This is a placeholder for actual barcode detection
    // You would integrate with libraries like:
    // - @zxing/library
    // - html5-qrcode
    // - quagga2
    
    // For demonstration, we'll simulate finding a barcode
    // In real implementation, use proper barcode detection library
    console.log('Scanning for barcodes...', imageData.width, 'x', imageData.height);
  };

  const handleManualSubmit = () => {
    if (manualBarcode.trim()) {
      onScan(manualBarcode.trim());
      setManualBarcode('');
      onClose();
    }
  };

  const handleStartScanning = () => {
    setIsScanning(true);
  };

  const handleStopScanning = () => {
    stopScanning();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleManualSubmit();
    }
  };

  return (
    <Modal
      title={title}
      open={visible}
      onCancel={onClose}
      footer={null}
      width={600}
      centered
    >
      <div className="barcode-scanner">
        {error && (
          <Alert
            message="Camera Error"
            description={error}
            type="warning"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* Camera Scanner Section */}
          <Card title="Camera Scanner" size="small">
            {!isScanning ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <CameraOutlined style={{ fontSize: '48px', color: '#1890ff', marginBottom: '16px' }} />
                <div>
                  <Button 
                    type="primary" 
                    icon={<ScanOutlined />}
                    onClick={handleStartScanning}
                    size="large"
                  >
                    Start Camera Scanner
                  </Button>
                </div>
                <Text type="secondary" style={{ marginTop: '8px', display: 'block' }}>
                  Click to start camera and scan barcodes
                </Text>
              </div>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    style={{
                      width: '100%',
                      maxWidth: '400px',
                      height: 'auto',
                      border: '2px solid #1890ff',
                      borderRadius: '8px'
                    }}
                  />
                  <canvas
                    ref={canvasRef}
                    style={{ display: 'none' }}
                  />
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    border: '2px solid red',
                    width: '200px',
                    height: '100px',
                    pointerEvents: 'none'
                  }} />
                </div>
                <div style={{ marginTop: '16px' }}>
                  <Button 
                    danger
                    icon={<StopOutlined />}
                    onClick={handleStopScanning}
                  >
                    Stop Scanner
                  </Button>
                </div>
                <Text type="secondary" style={{ marginTop: '8px', display: 'block' }}>
                  Position barcode within the red frame
                </Text>
              </div>
            )}
          </Card>

          {/* Manual Input Section */}
          <Card title="Manual Entry" size="small">
            <Space.Compact style={{ width: '100%' }}>
              <Input
                placeholder="Enter barcode manually or use scanner device"
                value={manualBarcode}
                onChange={(e) => setManualBarcode(e.target.value)}
                onKeyPress={handleKeyPress}
                autoFocus
              />
              <Button 
                type="primary" 
                onClick={handleManualSubmit}
                disabled={!manualBarcode.trim()}
              >
                Submit
              </Button>
            </Space.Compact>
            <Text type="secondary" style={{ marginTop: '8px', display: 'block' }}>
              For USB/Bluetooth barcode scanners or manual entry
            </Text>
          </Card>
        </Space>
      </div>
    </Modal>
  );
};

export default BarcodeScanner;
