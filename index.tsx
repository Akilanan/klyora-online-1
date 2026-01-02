
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('klyora-root');

if (!rootElement) {
  document.body.innerHTML += '<div style="color:red; font-size: 24px;">CRITICAL: ROOT ELEMENT NOT FOUND</div>';
  throw new Error("Could not find root element to mount to");
}

try {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  console.log("Klyora App Mounted Successfully");
} catch (e: any) {
  document.body.innerHTML += `<div style="color:red; font-size: 20px; white-space:pre; padding: 20px; background:white; position:fixed; top:0; left:0; z-index:9999;">APP CRASH: ${e.message}\n${e.stack}</div>`;
}

window.addEventListener('error', (event) => {
  const msg = event.message || event.toString();
  console.error("Global Error:", msg);
  // Optional: visually show it if the app is blank
  if (document.getElementById('root')?.childElementCount === 0) {
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = "position:fixed; top:0; left:0; width:100%; background:red; color:white; padding:10px; z-index:10000;";
    errorDiv.innerText = "JS Error: " + msg;
    document.body.appendChild(errorDiv);
  }
});
