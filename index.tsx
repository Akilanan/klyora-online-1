import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ErrorBoundary } from './components/ErrorBoundary';
import './src/index.css';
import { UiProvider } from './contexts/UiContext';
import { CartProvider } from './contexts/CartContext';

const rootElement = document.getElementById('klyora-root');

if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <UiProvider>
        <CartProvider>
          <App />
        </CartProvider>
      </UiProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
