import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import StockList from './pages/StockList';
import StockDetail from './pages/StockDetail';
import { StrategyList } from './pages/StrategyList';
import { StrategyDetail } from './pages/StrategyDetail';
import './styles/strategy.css';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
    },
    secondary: {
      main: '#ce93d8',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
});

const App: React.FC = () => {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<StockList />} />
          <Route path="/stock/:symbol" element={<StockDetail />} />
          <Route path="/strategy" element={<StrategyList />} />
          <Route path="/strategy/:strategyName" element={<StrategyDetail />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App; 