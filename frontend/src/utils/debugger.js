// Comprehensive Frontend Debugger for ERP System
import { isDevelopment } from './environment.js';

class ERPDebugger {
  constructor() {
    this.logs = [];
    this.networkRequests = [];
    this.errors = [];
    this.isEnabled = false; // Disabled debugger
    this.setupDebugger();
  }

  setupDebugger() {
    // Debugger is disabled - no setup needed
    return;
  }

  overrideConsole() {
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;

    console.log = (...args) => {
      this.addLog('log', args);
      originalLog.apply(console, args);
    };

    console.error = (...args) => {
      this.addLog('error', args);
      this.errors.push({ timestamp: new Date(), args });
      originalError.apply(console, args);
    };

    console.warn = (...args) => {
      this.addLog('warn', args);
      originalWarn.apply(console, args);
    };
  }

  interceptFetch() {
    const originalFetch = window.fetch;
    
    window.fetch = async (...args) => {
      const startTime = Date.now();
      const [url, options = {}] = args;
      
      const requestData = {
        id: Math.random().toString(36).substr(2, 9),
        url,
        method: options.method || 'GET',
        startTime,
        headers: options.headers || {},
        body: options.body
      };

      this.networkRequests.push(requestData);
      this.addLog('network', [`🌐 REQUEST: ${requestData.method} ${url}`]);

      try {
        const response = await originalFetch.apply(window, args);
        const endTime = Date.now();
        
        requestData.endTime = endTime;
        requestData.duration = endTime - startTime;
        requestData.status = response.status;
        requestData.statusText = response.statusText;
        requestData.success = response.ok;

        // Clone response to read body without consuming it
        const clonedResponse = response.clone();
        try {
          const responseText = await clonedResponse.text();
          requestData.responseBody = responseText;
          
          if (response.headers.get('content-type')?.includes('application/json')) {
            try {
              requestData.parsedResponse = JSON.parse(responseText);
            } catch (e) {
              // Not valid JSON
            }
          }
        } catch (e) {
          requestData.responseBody = 'Unable to read response body';
        }

        this.addLog('network', [
          `✅ RESPONSE: ${requestData.status} ${requestData.statusText} (${requestData.duration}ms)`
        ]);

        if (!response.ok) {
          this.addLog('error', [
            `❌ HTTP Error: ${response.status} ${response.statusText} for ${url}`,
            requestData.parsedResponse || requestData.responseBody
          ]);
        }

        return response;
      } catch (error) {
        const endTime = Date.now();
        requestData.endTime = endTime;
        requestData.duration = endTime - startTime;
        requestData.error = error.message;
        requestData.success = false;

        this.addLog('error', [`❌ NETWORK ERROR: ${error.message} for ${url}`]);
        throw error;
      }
    };
  }

  captureErrors() {
    window.addEventListener('error', (event) => {
      this.addLog('error', [`💥 JS ERROR: ${event.message} at ${event.filename}:${event.lineno}`]);
      this.errors.push({
        timestamp: new Date(),
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.addLog('error', [`💥 UNHANDLED PROMISE REJECTION: ${event.reason}`]);
      this.errors.push({
        timestamp: new Date(),
        type: 'unhandledrejection',
        reason: event.reason
      });
    });
  }

  addLog(type, args) {
    this.logs.push({
      timestamp: new Date(),
      type,
      args
    });

    // Keep only last 1000 logs
    if (this.logs.length > 1000) {
      this.logs = this.logs.slice(-1000);
    }

    this.updateDebugUI();
  }

  createDebugUI() {
    const debugPanel = document.createElement('div');
    debugPanel.id = 'erp-debugger';
    debugPanel.innerHTML = `
      <div id="debug-header">
        <h3>🐛 ERP Debugger</h3>
        <div>
          <button id="debug-clear">Clear</button>
          <button id="debug-export">Export</button>
          <button id="debug-minimize">−</button>
          <button id="debug-close">×</button>
        </div>
      </div>
      <div id="debug-tabs">
        <button class="debug-tab active" data-tab="logs">Logs</button>
        <button class="debug-tab" data-tab="network">Network</button>
        <button class="debug-tab" data-tab="errors">Errors</button>
        <button class="debug-tab" data-tab="inventory">Inventory</button>
      </div>
      <div id="debug-content">
        <div id="debug-logs" class="debug-tab-content active"></div>
        <div id="debug-network" class="debug-tab-content"></div>
        <div id="debug-errors" class="debug-tab-content"></div>
        <div id="debug-inventory" class="debug-tab-content"></div>
      </div>
    `;

    // Add styles
    const style = document.createElement('style');
    style.textContent = `
      #erp-debugger {
        position: fixed;
        top: 20px;
        right: 20px;
        width: 600px;
        height: 400px;
        background: #1e1e1e;
        color: #ffffff;
        border: 1px solid #444;
        border-radius: 8px;
        font-family: 'Courier New', monospace;
        font-size: 12px;
        z-index: 10000;
        display: none;
        flex-direction: column;
      }
      #erp-debugger.minimized {
        height: 40px;
      }
      #erp-debugger.minimized #debug-tabs,
      #erp-debugger.minimized #debug-content {
        display: none;
      }
      #debug-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 12px;
        background: #2d2d2d;
        border-bottom: 1px solid #444;
        border-radius: 8px 8px 0 0;
      }
      #debug-header h3 {
        margin: 0;
        font-size: 14px;
      }
      #debug-header button {
        background: #444;
        border: none;
        color: white;
        padding: 4px 8px;
        margin-left: 4px;
        border-radius: 4px;
        cursor: pointer;
      }
      #debug-header button:hover {
        background: #555;
      }
      #debug-tabs {
        display: flex;
        background: #2d2d2d;
        border-bottom: 1px solid #444;
      }
      .debug-tab {
        background: none;
        border: none;
        color: #ccc;
        padding: 8px 16px;
        cursor: pointer;
        border-bottom: 2px solid transparent;
      }
      .debug-tab.active {
        color: #fff;
        border-bottom-color: #007acc;
      }
      .debug-tab:hover {
        background: #3d3d3d;
      }
      #debug-content {
        flex: 1;
        overflow: hidden;
      }
      .debug-tab-content {
        display: none;
        height: 100%;
        overflow-y: auto;
        padding: 8px;
      }
      .debug-tab-content.active {
        display: block;
      }
      .log-entry {
        padding: 2px 0;
        border-bottom: 1px solid #333;
      }
      .log-entry.error {
        color: #ff6b6b;
      }
      .log-entry.warn {
        color: #ffd93d;
      }
      .log-entry.network {
        color: #4ecdc4;
      }
      .timestamp {
        color: #888;
        font-size: 10px;
      }
      .network-request {
        margin: 4px 0;
        padding: 8px;
        background: #2d2d2d;
        border-radius: 4px;
        border-left: 4px solid #007acc;
      }
      .network-request.error {
        border-left-color: #ff6b6b;
      }
      .network-request.success {
        border-left-color: #51cf66;
      }
      .request-details {
        font-size: 10px;
        color: #aaa;
        margin-top: 4px;
      }
      .json-viewer {
        background: #1a1a1a;
        padding: 8px;
        border-radius: 4px;
        overflow-x: auto;
        white-space: pre-wrap;
        margin-top: 4px;
      }
    `;

    document.head.appendChild(style);
    document.body.appendChild(debugPanel);

    // Add event listeners
    this.addDebugUIListeners();
  }

  addDebugUIListeners() {
    // Tab switching
    document.querySelectorAll('.debug-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        const tabName = e.target.dataset.tab;
        this.switchTab(tabName);
      });
    });

    // Header buttons
    document.getElementById('debug-clear').addEventListener('click', () => {
      this.clearLogs();
    });

    document.getElementById('debug-export').addEventListener('click', () => {
      this.exportLogs();
    });

    document.getElementById('debug-minimize').addEventListener('click', () => {
      this.toggleMinimize();
    });

    document.getElementById('debug-close').addEventListener('click', () => {
      this.hideDebugger();
    });
  }

  switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.debug-tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.tab === tabName);
    });

    // Update tab content
    document.querySelectorAll('.debug-tab-content').forEach(content => {
      content.classList.toggle('active', content.id === `debug-${tabName}`);
    });

    // Update content based on tab
    this.updateTabContent(tabName);
  }

  updateTabContent(tabName) {
    switch (tabName) {
      case 'logs':
        this.updateLogsTab();
        break;
      case 'network':
        this.updateNetworkTab();
        break;
      case 'errors':
        this.updateErrorsTab();
        break;
      case 'inventory':
        this.updateInventoryTab();
        break;
    }
  }

  updateLogsTab() {
    const logsContainer = document.getElementById('debug-logs');
    logsContainer.innerHTML = this.logs.slice(-100).map(log => `
      <div class="log-entry ${log.type}">
        <span class="timestamp">${log.timestamp.toLocaleTimeString()}</span>
        ${log.args.map(arg => typeof arg === 'object' ? JSON.stringify(arg, null, 2) : arg).join(' ')}
      </div>
    `).join('');
    logsContainer.scrollTop = logsContainer.scrollHeight;
  }

  updateNetworkTab() {
    const networkContainer = document.getElementById('debug-network');
    networkContainer.innerHTML = this.networkRequests.slice(-50).map(req => `
      <div class="network-request ${req.success === false ? 'error' : req.success ? 'success' : ''}">
        <div><strong>${req.method} ${req.url}</strong></div>
        <div class="request-details">
          Status: ${req.status || 'Pending'} | 
          Duration: ${req.duration || 0}ms | 
          Time: ${new Date(req.startTime).toLocaleTimeString()}
        </div>
        ${req.responseBody ? `
          <div class="json-viewer">${this.formatResponse(req.responseBody)}</div>
        ` : ''}
        ${req.error ? `
          <div style="color: #ff6b6b; margin-top: 4px;">Error: ${req.error}</div>
        ` : ''}
      </div>
    `).join('');
  }

  updateErrorsTab() {
    const errorsContainer = document.getElementById('debug-errors');
    errorsContainer.innerHTML = this.errors.map(error => `
      <div class="log-entry error">
        <span class="timestamp">${error.timestamp.toLocaleTimeString()}</span>
        <div>${error.message || error.reason}</div>
        ${error.filename ? `<div style="font-size: 10px; color: #888;">at ${error.filename}:${error.lineno}</div>` : ''}
      </div>
    `).join('');
  }

  updateInventoryTab() {
    const inventoryContainer = document.getElementById('debug-inventory');
    const inventoryRequests = this.networkRequests.filter(req => 
      req.url.includes('/inventory') || req.url.includes('/item-master')
    );

    inventoryContainer.innerHTML = `
      <div><strong>Inventory API Calls (${inventoryRequests.length})</strong></div>
      ${inventoryRequests.map(req => `
        <div class="network-request ${req.success === false ? 'error' : req.success ? 'success' : ''}">
          <div><strong>${req.method} ${req.url}</strong></div>
          <div class="request-details">
            Status: ${req.status || 'Pending'} | Duration: ${req.duration || 0}ms
          </div>
          ${req.parsedResponse ? `
            <div class="json-viewer">${JSON.stringify(req.parsedResponse, null, 2)}</div>
          ` : ''}
        </div>
      `).join('')}
    `;
  }

  formatResponse(response) {
    try {
      const parsed = JSON.parse(response);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return response;
    }
  }

  updateDebugUI() {
    const debugPanel = document.getElementById('erp-debugger');
    if (!debugPanel || !debugPanel.style.display || debugPanel.style.display === 'none') return;

    // Update the active tab
    const activeTab = document.querySelector('.debug-tab.active');
    if (activeTab) {
      this.updateTabContent(activeTab.dataset.tab);
    }
  }

  addKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Ctrl + Shift + D to toggle debugger
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        this.toggleDebugger();
      }
    });
  }

  toggleDebugger() {
    const debugPanel = document.getElementById('erp-debugger');
    if (debugPanel.style.display === 'none' || !debugPanel.style.display) {
      this.showDebugger();
    } else {
      this.hideDebugger();
    }
  }

  showDebugger() {
    const debugPanel = document.getElementById('erp-debugger');
    debugPanel.style.display = 'flex';
    this.updateDebugUI();
  }

  hideDebugger() {
    const debugPanel = document.getElementById('erp-debugger');
    debugPanel.style.display = 'none';
  }

  toggleMinimize() {
    const debugPanel = document.getElementById('erp-debugger');
    debugPanel.classList.toggle('minimized');
  }

  clearLogs() {
    this.logs = [];
    this.networkRequests = [];
    this.errors = [];
    this.updateDebugUI();
  }

  exportLogs() {
    const data = {
      logs: this.logs,
      networkRequests: this.networkRequests,
      errors: this.errors,
      timestamp: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `erp-debug-logs-${new Date().toISOString().slice(0, 19)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Public methods for manual debugging
  logInventoryAction(action, data) {
    this.addLog('inventory', [`🛍️ INVENTORY ACTION: ${action}`, data]);
  }

  logDeleteAttempt(itemId) {
    this.addLog('inventory', [`🗑️ DELETE ATTEMPT: Item ID ${itemId}`]);
  }

  logDeleteSuccess(itemId) {
    this.addLog('inventory', [`✅ DELETE SUCCESS: Item ID ${itemId}`]);
  }

  logDeleteError(itemId, error) {
    this.addLog('error', [`❌ DELETE ERROR: Item ID ${itemId}`, error]);
  }
}

// Create global debugger instance
window.erpDebugger = new ERPDebugger();

// Export for module use
export default window.erpDebugger;
