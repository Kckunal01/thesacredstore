import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { SpeedInsights } from "@vercel/speed-insights/react";

import { HelmetProvider } from "react-helmet-async";

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
    <SpeedInsights />
  </React.StrictMode>
);