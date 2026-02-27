import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { GoogleOAuthProvider } from '@react-oauth/google';
import { HelmetProvider } from 'react-helmet-async';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <GoogleOAuthProvider clientId="606656984832-tg33p4bor6kod5fk6h9np2c9acus475e.apps.googleusercontent.com">
        <App />
      </GoogleOAuthProvider>
    </HelmetProvider>
  </React.StrictMode>,
)
