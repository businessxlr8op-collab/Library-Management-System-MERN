import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import './styles/theme.css';
import './styles/components.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import 'bootstrap/dist/css/bootstrap.min.css';
import { AuthContextProvider } from './Context/AuthContext';

ReactDOM.render(
  <React.StrictMode>
    <AuthContextProvider>
      <App />
    </AuthContextProvider>
  </React.StrictMode>,
  document.getElementById('root')
);

reportWebVitals();
