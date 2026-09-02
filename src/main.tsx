import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { ProductDraftProvider } from './context/ProductDraftContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <ProductDraftProvider>
        <App />
      </ProductDraftProvider>
    </AuthProvider>
  </StrictMode>
);

