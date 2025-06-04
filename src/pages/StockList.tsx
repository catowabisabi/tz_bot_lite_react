import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import dayjs, { Dayjs } from 'dayjs';
import { 
  Box, 
  Typography,
  useMediaQuery,
  useTheme,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { MobileDatePicker } from '@mui/x-date-pickers/MobileDatePicker';
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker';
import { StockCard } from '../components/cards/StockCard';
import { StrategyList } from '../pages/StrategyList';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

interface Stock {
  _id?: { "$oid": string };
  symbol: string;
  name: string | null;
  day_close: number;
  yesterday_close: number;
  close_change_percentage: number;
  high_change_percentage: number;
  day_high: number;
  day_low: number | null;
  today_date: string;
  float_risk: string;
  sector: string | null;
  short_signal: boolean;
}

const title = "WealthBehave AI Scanner";
const pageTitle = "Top Gainers";

type SortKey = keyof Pick<Stock, 'symbol' | 'name' | 'close_change_percentage' | 'high_change_percentage' | 'day_close'> | '';

const StockList: React.FC = () => {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [tabValue, setTabValue] = useState(0);
  const [dateValue, setDateValue] = useState<Dayjs | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<SortKey>('');
  const location = useLocation();
  const navigate = useNavigate();
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const dateQuery = params.get('date');
    const tabQuery = params.get('tab');

    if (tabQuery) {
      const tabNumber = parseInt(tabQuery, 10);
      if (!isNaN(tabNumber) && (tabNumber === 0 || tabNumber === 1 || tabNumber === 2)) {
        setTabValue(tabNumber);
      }
    }

    if (dateQuery && dayjs(dateQuery, 'YYYY-MM-DD', true).isValid()) {
      fetchStocksByDate(dateQuery);
    } else {
      fetchLatestDayStocks();
    }
  }, [location.search]);

  useEffect(() => {
    // Fetch available dates when component mounts
    const fetchAvailableDates = async () => {
      try {
        const response = await fetch('https://fastapi.enomars.org/api/stocks/available_dates');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        if (result.dates) {
          setAvailableDates(result.dates);
        }
      } catch (err) {
        console.error("Error fetching available dates:", err);
      }
    };

    fetchAvailableDates();
  }, []);

  const fetchLatestDayStocks = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('https://fastapi.enomars.org/api/stocks/latest_day?limit=500');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      if (result.data && result.latest_date_retrieved) {
        setStocks(result.data);
        setSelectedDate(result.latest_date_retrieved);
        setDateValue(dayjs(result.latest_date_retrieved));
        const params = new URLSearchParams(location.search);
        if (!params.has('date')) {
          navigate(`${location.pathname}?date=${result.latest_date_retrieved}${params.get('tab') ? '&tab=' + params.get('tab') : ''}`, { replace: true });
        }
      } else {
        setError('No data found for the latest day.');
        setStocks([]);
      }
    } catch (err) {
      console.error("Error fetching latest day stocks:", err);
      setError(err instanceof Error ? err.message : 'Failed to fetch latest day stocks.');
      setStocks([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStocksByDate = async (date: string) => {
    setLoading(true);
    setError(null);
    setSelectedDate(date);
    setDateValue(dayjs(date));
    try {
      const response = await fetch(`https://fastapi.enomars.org/api/stocks/by_date?date=${date}&limit=500`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      if (result.data) {
        setStocks(result.data);
      } else {
        setError(`No data found for ${date}.`);
        setStocks([]);
      }
    } catch (err) {
      console.error(`Error fetching stocks for date ${date}:`, err);
      setError(err instanceof Error ? err.message : `Failed to fetch stocks for ${date}.`);
      setStocks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabQuery = params.get('tab');
    if (tabQuery) {
      const tabNumber = parseInt(tabQuery, 10);
      if (!isNaN(tabNumber) && (tabNumber >= 0 && tabNumber <= 2)) {
        setTabValue(tabNumber);
      }
    } else {
      setTabValue(0);
      const existingDate = params.get('date');
      if (existingDate) {
        navigate(`${location.pathname}?date=${existingDate}&tab=0`, { replace: true });
      } else if (selectedDate) {
        navigate(`${location.pathname}?date=${selectedDate}&tab=0`, { replace: true });
      }
    }
  }, [location.search, navigate, selectedDate]);

  const handleDateChange = (newValue: Dayjs | null) => {
    if (newValue) {
      const formattedDate = newValue.format('YYYY-MM-DD');
      const params = new URLSearchParams(location.search);
      params.set('date', formattedDate);
      navigate(`${location.pathname}?${params.toString()}`, { replace: true });
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    const params = new URLSearchParams(location.search);
    params.set('tab', newValue.toString());
    navigate(`${location.pathname}?${params.toString()}`, { replace: true });
  };

  const handleSortChange = (event: SelectChangeEvent<SortKey>) => {
    setSortOption(event.target.value as SortKey);
  };

  const sortedStocks = React.useMemo(() => {
    let sortableStocks = [...stocks];
    if (sortOption) {
      sortableStocks.sort((a, b) => {
        const valA = a[sortOption];
        const valB = b[sortOption];

        if (valA === null || valA === undefined) return 1;
        if (valB === null || valB === undefined) return -1;

        if (typeof valA === 'string' && typeof valB === 'string') {
          if (sortOption === 'name') {
            return valA.localeCompare(valB);
          }
          if (sortOption === 'symbol') {
            return valA.localeCompare(valB);
          }
        }
        if (typeof valA === 'number' && typeof valB === 'number') {
          if (sortOption === 'close_change_percentage' || sortOption === 'high_change_percentage' || sortOption === 'day_close') {
            return valB - valA; 
          }
        }
        return 0;
      });
    }
    return sortableStocks;
  }, [stocks, sortOption]);

  const DatePickerComponent = isMobile ? MobileDatePicker : DesktopDatePicker;

  const shouldDisableDate = (date: Dayjs) => {
    const formattedDate = date.format('YYYY-MM-DD');
    return !availableDates.includes(formattedDate);
  };

  if (loading && stocks.length === 0) {
    return (
      <div className="main-content" style={{ textAlign: 'center', marginTop: '2rem' }}>
        <CircularProgress />
        <Typography>Loading stock data...</Typography>
      </div>
    );
  }

  if (error && stocks.length === 0) {
    return (
      <div className="main-content" style={{ textAlign: 'center', marginTop: '2rem' }}>
        <h1>{title}</h1>
        <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
        <Button onClick={() => window.location.reload()} sx={{ mt: 2 }}>Try Again</Button>
      </div>
    );
  }

  if (!loading && stocks.length === 0 && !error) {
    return (
      <div className="main-content" style={{ textAlign: 'center', marginTop: '2rem' }}>
        <h1>{title}</h1>
        <Typography variant="h5" sx={{mb: 2}}>No stock data available for {selectedDate || 'the selected date'}.</Typography>
        <Box sx={{ mb: 3, display: 'inline-block' }}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePickerComponent
              label="Select Date"
              value={dateValue}
              onChange={handleDateChange}
              shouldDisableDate={shouldDisableDate}
              slotProps={{
                textField: { 
                  fullWidth: true,
                  size: "small"
                },
                actionBar: {
                  actions: ['cancel', 'accept']
                }
              }}
              format="YYYY-MM-DD"
            />
          </LocalizationProvider>
        </Box>
      </div>
    );
  }

  return (
    <div className="main-content">
      <header>
        <h1>{title}</h1>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="Stock and Strategy Tabs">
            <Tab label="Stocks" id="stock-tab-0" aria-controls="stock-panel-0" />
            <Tab label="Strategy" id="stock-tab-1" aria-controls="stock-panel-1" />
          </Tabs>
        </Box>
        
        <Box role="tabpanel" hidden={tabValue !== 0} id="stock-panel-0" aria-labelledby="stock-tab-0">
          {tabValue === 0 && (
            <>
              <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, borderRadius: '30px' }}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePickerComponent
                    label="Select Date"
                    value={dateValue}
                    onChange={handleDateChange}
                    shouldDisableDate={shouldDisableDate}
                    slotProps={{
                      textField: { 
                        sx: { minWidth: '200px' }
                      },
                      actionBar: {
                        actions: ['cancel', 'accept']
                      }
                    }}
                    format="YYYY-MM-DD"
                  />
                </LocalizationProvider>
                <FormControl size="small" sx={{ minWidth: 180 }}>
                  <InputLabel id="sort-select-label">Sort By</InputLabel>
                  <Select
                    labelId="sort-select-label"
                    id="sort-by-select"
                    value={sortOption}
                    label="Sort By"
                    onChange={handleSortChange}
                  >
                    <MenuItem value="">None</MenuItem>
                    <MenuItem value="symbol">Symbol</MenuItem>
                    <MenuItem value="name">Name</MenuItem>
                    <MenuItem value="close_change_percentage">% Change (Close)</MenuItem>
                    <MenuItem value="high_change_percentage">% Change (High)</MenuItem>
                    <MenuItem value="day_close">Close Price</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              {loading && <CircularProgress sx={{ display: 'block', margin: '20px auto' }} />}
              {error && !loading && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}

              <Typography variant="h5" sx={{ mb: 2 }}>
                {pageTitle} {selectedDate ? `for ${selectedDate}` : '(Latest)'}
              </Typography>
              
              {stocks.length > 0 ? (
                <Box className="stock-list" sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: 'repeat(2, 1fr)',
                    sm: 'repeat(2, 1fr)',
                    md: 'repeat(3, 1fr)',
                    lg: 'repeat(4, 1fr)',
                  },
                  gap: {
                    xs: '10px',
                    sm: '15px',
                    md: '20px',
                  },
                  padding: {
                    xs: '10px',
                    sm: '15px',
                    md: '20px',
                  },
                  '& .card-wrapper': {
                    height: '100%',
                    '& > *': {
                      height: '100%',
                      display: 'block'
                    },
                    '& .MuiCard-root': {
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column'
                    },
                    '& .MuiCardContent-root': {
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      '& > *:last-child': {
                        marginTop: 'auto'
                      }
                    }
                  }
                }}>
                  {sortedStocks.map(stock => (
                    <Box key={stock.symbol} className="card-wrapper">
                      <StockCard data={stock} />
                    </Box>
                  ))}
                </Box>
              ) : (
                 !loading && <Typography sx={{textAlign: 'center', mt: 3}}>No stocks found for {selectedDate}. Please try a different date.</Typography>
              )}
            </>
          )}
        </Box>
        <Box role="tabpanel" hidden={tabValue !== 1} id="stock-panel-1" aria-labelledby="stock-tab-1">
          {tabValue === 1 && (
            <StrategyList />
          )}
        </Box>
      </header>

      <footer className="footer">
        <p className="footer-text">© 2024 貓咪神-短炒Scanner. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default StockList; 