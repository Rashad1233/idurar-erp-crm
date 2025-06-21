// vite.config.js
import path from "path";
import { defineConfig, loadEnv } from "file:///C:/Users/rasha/Desktop/test%20erp/frontend/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/rasha/Desktop/test%20erp/frontend/node_modules/@vitejs/plugin-react/dist/index.mjs";
var __vite_injected_original_dirname = "C:\\Users\\rasha\\Desktop\\test erp\\frontend";
var vite_config_default = ({ mode }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };
  const proxy_url = process.env.VITE_DEV_REMOTE === "remote" ? process.env.VITE_BACKEND_SERVER : "http://localhost:8888/";
  const config = {
    plugins: [react()],
    resolve: {
      base: "/",
      alias: {
        "@": path.resolve(__vite_injected_original_dirname, "src")
      }
    },
    server: {
      port: 3e3,
      host: "0.0.0.0",
      // Listen on all network interfaces for Android access
      proxy: {
        "/api": {
          target: proxy_url,
          changeOrigin: true,
          secure: false
        }
      }
    }
  };
  return defineConfig(config);
};
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxyYXNoYVxcXFxEZXNrdG9wXFxcXHRlc3QgZXJwXFxcXGZyb250ZW5kXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxyYXNoYVxcXFxEZXNrdG9wXFxcXHRlc3QgZXJwXFxcXGZyb250ZW5kXFxcXHZpdGUuY29uZmlnLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9yYXNoYS9EZXNrdG9wL3Rlc3QlMjBlcnAvZnJvbnRlbmQvdml0ZS5jb25maWcuanNcIjtpbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcclxuXHJcbmltcG9ydCB7IGRlZmluZUNvbmZpZywgbG9hZEVudiB9IGZyb20gJ3ZpdGUnO1xyXG5pbXBvcnQgcmVhY3QgZnJvbSAnQHZpdGVqcy9wbHVnaW4tcmVhY3QnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgKHsgbW9kZSB9KSA9PiB7XHJcbiAgcHJvY2Vzcy5lbnYgPSB7IC4uLnByb2Nlc3MuZW52LCAuLi5sb2FkRW52KG1vZGUsIHByb2Nlc3MuY3dkKCkpIH07XHJcblxyXG4gIGNvbnN0IHByb3h5X3VybCA9XHJcbiAgICBwcm9jZXNzLmVudi5WSVRFX0RFVl9SRU1PVEUgPT09ICdyZW1vdGUnXHJcbiAgICAgID8gcHJvY2Vzcy5lbnYuVklURV9CQUNLRU5EX1NFUlZFUlxyXG4gICAgICA6ICdodHRwOi8vbG9jYWxob3N0Ojg4ODgvJztcclxuXHJcbiAgY29uc3QgY29uZmlnID0ge1xyXG4gICAgcGx1Z2luczogW3JlYWN0KCldLFxyXG4gICAgcmVzb2x2ZToge1xyXG4gICAgICBiYXNlOiAnLycsXHJcbiAgICAgIGFsaWFzOiB7XHJcbiAgICAgICAgJ0AnOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnc3JjJyksXHJcbiAgICAgIH0sXHJcbiAgICB9LCAgICBzZXJ2ZXI6IHtcclxuICAgICAgcG9ydDogMzAwMCxcclxuICAgICAgaG9zdDogJzAuMC4wLjAnLCAvLyBMaXN0ZW4gb24gYWxsIG5ldHdvcmsgaW50ZXJmYWNlcyBmb3IgQW5kcm9pZCBhY2Nlc3NcclxuICAgICAgcHJveHk6IHtcclxuICAgICAgICAnL2FwaSc6IHtcclxuICAgICAgICAgIHRhcmdldDogcHJveHlfdXJsLFxyXG4gICAgICAgICAgY2hhbmdlT3JpZ2luOiB0cnVlLFxyXG4gICAgICAgICAgc2VjdXJlOiBmYWxzZSxcclxuICAgICAgICB9LFxyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICB9O1xyXG4gIHJldHVybiBkZWZpbmVDb25maWcoY29uZmlnKTtcclxufTtcclxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUF3VCxPQUFPLFVBQVU7QUFFelUsU0FBUyxjQUFjLGVBQWU7QUFDdEMsT0FBTyxXQUFXO0FBSGxCLElBQU0sbUNBQW1DO0FBS3pDLElBQU8sc0JBQVEsQ0FBQyxFQUFFLEtBQUssTUFBTTtBQUMzQixVQUFRLE1BQU0sRUFBRSxHQUFHLFFBQVEsS0FBSyxHQUFHLFFBQVEsTUFBTSxRQUFRLElBQUksQ0FBQyxFQUFFO0FBRWhFLFFBQU0sWUFDSixRQUFRLElBQUksb0JBQW9CLFdBQzVCLFFBQVEsSUFBSSxzQkFDWjtBQUVOLFFBQU0sU0FBUztBQUFBLElBQ2IsU0FBUyxDQUFDLE1BQU0sQ0FBQztBQUFBLElBQ2pCLFNBQVM7QUFBQSxNQUNQLE1BQU07QUFBQSxNQUNOLE9BQU87QUFBQSxRQUNMLEtBQUssS0FBSyxRQUFRLGtDQUFXLEtBQUs7QUFBQSxNQUNwQztBQUFBLElBQ0Y7QUFBQSxJQUFNLFFBQVE7QUFBQSxNQUNaLE1BQU07QUFBQSxNQUNOLE1BQU07QUFBQTtBQUFBLE1BQ04sT0FBTztBQUFBLFFBQ0wsUUFBUTtBQUFBLFVBQ04sUUFBUTtBQUFBLFVBQ1IsY0FBYztBQUFBLFVBQ2QsUUFBUTtBQUFBLFFBQ1Y7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFDQSxTQUFPLGFBQWEsTUFBTTtBQUM1QjsiLAogICJuYW1lcyI6IFtdCn0K
