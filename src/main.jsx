import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);

// Hide loading spinner once the app mounts
const loader = document.getElementById('loading');
if (loader) loader.style.display = 'none';
