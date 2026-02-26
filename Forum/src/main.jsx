import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { GoogleOAuthProvider } from '@react-oauth/google';
import { HelmetProvider } from 'react-helmet-async';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <GoogleOAuthProvider clientId="518776664955-f2h78p9v99c755k0ohk5v1a32a6n4v49.apps.googleusercontent.com">
        <App />
      </GoogleOAuthProvider>
    </HelmetProvider>
  </React.StrictMode>,
)
