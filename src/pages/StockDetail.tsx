import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Container,
  Snackbar,
  Alert,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { PriceChartCard } from '../components/charts/PriceChart';
import type { PriceChartData } from '../components/charts/PriceChart';

import '../styles/App.css';

import MetricsCard from '../components/cards/MetricCard';
import { CompanyInfoCard } from '../components/cards/CompanyInfoCard';
import { CashDebtChartCard } from '../components/charts/CashDebtChart';
import { SECFilingCard } from '../components/cards/SECFilingCard';
import { SuggestionCard } from '../components/cards/SuggestionCard';
import { NewsDisplayCard } from '../components/cards/NewsDisplayCard';
import { NewsInputCard } from '../components/cards/NewsInputCard';
import SmallStockChartCard from '../components/charts/SmallStockChartCard';

interface ApiStockData {
  _id: {
    $oid: string;
  };
  symbol: string;
  name: string;
  today_date: string;
  day_close?: string | number;
  close_change_percentage?: string | number;
  day_low?: string | number;
  yesterday_close?: string | number;
  day_high?: string | number;
  market_open_high?: string | number;
  market_open_low?: string | number;
  key_levels?: number[];
  outstandingShares?: string | number;
  description?: string;
  industry?: string;
  sector?: string;
  website?: string;
  ceo?: string;
  employees?: string | number;
  countryDomicile?: string;
  securityType?: string;
  isin?: string;
  
  cash_and_equivalents?: string | number;
  total_debt?: string | number;
  net_debt?: string | number;
  free_cash_flow?: string | number;
  operating_cash_flow?: string | number;

  sec_filing?: string;
  sec_filing_analysis?: {
    'Cash (USD)'?: string;
    'Debt (USD)'?: string;
    'Cash/Debt Ratio'?: string;
    'ATM Risk Level'?: string;
    'Risk Reason'?: string;
    'Trading Recommendation'?: string;
    'Recommendation Confidence'?: string;
    'Short Squeeze Risk'?: string;
  };
  sec_filing_analysis_summary?: string;
  sec_filing_analysis_details?: string;
  sec_filing_analysis_recommendation?: string;

  suggestion?: string;

  raw_news?: Array<{
    summary: string;
    timestamp: string;
    uuid: string;
  }>;

  historical_data?: {
    [key: string]: Array<{ time: number; open: number; high: number; low: number; close: number }>;
  };
  float?: string | number;
  float_risk?: string | number;

  // Data for new small charts - updated to match provided API structure
  "1m_chart_data"?: Array<{ datetime: { "$date": string }; open: number; high: number; low: number; close: number; [key: string]: any }>;
  "5m_chart_data"?: Array<{ datetime: { "$date": string }; open: number; high: number; low: number; close: number; [key: string]: any }>;
  "1d_chart_data"?: Array<{ datetime: { "$date": string }; open: number; high: number; low: number; close: number; [key: string]: any }>;

  target_document_id?: string;
}

const Footer: React.FC = () => (
  <Box component="footer" className="footer">
    <Typography className="footer-text">© {new Date().getFullYear()} Stock Analysis Inc. All rights reserved.</Typography>
    <Typography className="footer-text">Data provided for informational purposes only.</Typography>
  </Box>
);

const safeFloat = (value: any): number | null => {
  if (value === null || value === undefined) return null;
  const num = parseFloat(String(value).replace(/,/g, ''));
  return isNaN(num) ? null : num;
};

const StockDetail: React.FC = () => {
  const { symbol: routeSymbol } = useParams<{ symbol: string }>();
  const navigate = useNavigate();
  const [stockData, setStockData] = React.useState<ApiStockData | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [currentError, setCurrentError] = React.useState<string | null>(null);
  const [statusMessage, setStatusMessage] = React.useState<{ message: string; severity: 'success' | 'error' } | null>(null);

  const fetchStockData = React.useCallback(async () => {
    if (!routeSymbol) return;
    setLoading(true);
    setCurrentError(null);
    try {
      const response = await fetch(`https://fastapi.enomars.org/stocks/${routeSymbol}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data:ApiStockData = await response.json();
      //console.log('API Response:', data);
      if (!data.target_document_id) {
        //console.warn('Missing target_document_id in API response. Available fields:', Object.keys(data));
        // Check if it might be under a different name
        const possibleDocIdFields = Object.entries(data).filter(([key]) => 
          key.toLowerCase().includes('document') || key.toLowerCase().includes('doc') || key.toLowerCase().includes('id')
        );
        if (possibleDocIdFields.length > 0) {
          console.log('Possible document ID fields found:', possibleDocIdFields);
        }
      }
      setStockData(data);
    } catch (err) { 
      console.error('Error fetching stock data:', err);
      setCurrentError(err instanceof Error ? err.message : 'Failed to fetch stock data.');
    } finally {
      setLoading(false);
    }
  }, [routeSymbol]);

  React.useEffect(() => {
    fetchStockData();
  }, [fetchStockData]);

  const handleNewsDelete = async (uuid: string, password: string, target_document_id: string) => {
    if (!stockData || !stockData.symbol) {
      setStatusMessage({ message: 'Error: Missing stock data for deletion.', severity: 'error' });
      return;
    }
    setStatusMessage(null);

    try {
      console.log('Sending delete request with:', {
        uuid,
        target_document_id,
        symbol: stockData.symbol
      });

      const response = await fetch(
        `https://fastapi.enomars.org/api/stocks/${stockData.symbol}/news/${uuid}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            password: password,
            target_document_id: target_document_id,  // Changed to match API expectation
          }),
        }
      );

      const result = await response.json();
      //console.log('Delete response:', result);

      if (response.ok) {
        setStatusMessage({ 
          message: typeof result === 'string' ? result : 'News deleted successfully!', 
          severity: 'success' 
        });
        fetchStockData();
      } else {
        let errorMessage = 'Failed to delete news.';
        if (result.detail) {
          console.error('API Error details:', result.detail);
          if (Array.isArray(result.detail) && result.detail.length > 0) {
            // Handle FastAPI validation error format
            errorMessage = result.detail[0].msg || errorMessage;
          } else if (typeof result.detail === 'string') {
            errorMessage = result.detail;
          } else if (typeof result.detail === 'object') {
            // If detail is an object with error info
            errorMessage = result.detail.msg || result.detail.message || JSON.stringify(result.detail);
          }
        }
        setStatusMessage({ message: errorMessage, severity: 'error' });
      }
    } catch (error) {
      console.error('Error deleting news:', error);
      setStatusMessage({ 
        message: error instanceof Error ? error.message : 'An unexpected error occurred during deletion.', 
        severity: 'error' 
      });
    }
  };

  const handleNewsSubmittedCallback = React.useCallback(() => {
    console.log("News submitted via NewsInputCard, refetching stock data...");
    fetchStockData();
    // Optionally, set a success message here if NewsInputCard doesn't show its own persistent one
    // setStatusMessage({ message: 'News submitted successfully! Refreshing data...', severity: 'success' });
  }, [fetchStockData]);

  const handleCloseSnackbar = () => {
    setStatusMessage(null);
  };

  if (loading) {
    return <Container className="main-content"><Typography variant="h6">Loading...</Typography></Container>;
  }

  if (currentError) {
    return (
      <Container className="main-content">
        <Typography variant="h6" color="error">Error: {currentError}</Typography>
        <Button onClick={() => navigate(-1)} startIcon={<ArrowBackIcon />} sx={{ mt: 2 }}>Back</Button>
      </Container>
    );
  }

  if (!stockData) {
    return (
      <Container className="main-content">
        <Typography variant="h6">No data available for {routeSymbol}.</Typography>
        <Button onClick={() => navigate(-1)} startIcon={<ArrowBackIcon />} sx={{ mt: 2 }}>Back</Button>
      </Container>
    );
  }

  const outstandingSharesNum = safeFloat(stockData.outstandingShares);
  const dayCloseNum = safeFloat(stockData.day_close);
  let marketCapFormatted = "N/A";
  if (outstandingSharesNum !== null && dayCloseNum !== null) {
    const marketCap = outstandingSharesNum * dayCloseNum;
    if (marketCap) { 
        marketCapFormatted = `$${(marketCap / 1000000).toFixed(2)}M`;
    }
  }
  
  const metricsCardDataProp = {
    day_close: String(stockData.day_close ?? '0.00'),
    close_change_percentage: String(stockData.close_change_percentage ?? '0'),
    day_low: String(stockData.day_low ?? '0.00'),
    day_high: String(stockData.day_high ?? '0.00'),
    float: String(stockData.float ?? 'N/A'), 
    float_risk: String(stockData.float_risk ?? 'N/A'), 
  };
  
  const companyInfoDataProp = {
      symbol: stockData.symbol,
      name: stockData.name,
      sector: stockData.sector,
      industry: stockData.industry,
      countryDomicile: stockData.countryDomicile,
      securityType: stockData.securityType,
      isin: stockData.isin,
  };

  const secFilingDataProp = {
      sec_filing: stockData.sec_filing || "No SEC filing content available.",
      sec_filing_analysis: stockData.sec_filing_analysis || {},
      sec_filing_analysis_summary: stockData.sec_filing_analysis_summary || "No summary available.",
      sec_filing_analysis_details: stockData.sec_filing_analysis_details || "No details available.",
      sec_filing_analysis_recommendation: stockData.sec_filing_analysis_recommendation || "No recommendation available.",
  };

  const suggestionDataProp = {
      suggestion: stockData.suggestion || "No suggestion available.",
  };

  const newsDisplayDataProp = {
    raw_news: stockData.raw_news || [],
    symbol: stockData.symbol,
    target_document_id: stockData._id.$oid,  // MongoDB ObjectId string
  };

  const newsInputCardDataProp = {
    symbol: stockData.symbol,
    target_document_id: stockData._id.$oid,  // MongoDB ObjectId string
  };

  // --- Prepare data for NEW small charts --- 
  const oneMinApiData = stockData?.["1m_chart_data"] || [];
  let oneMinDataForCard: Array<{ time: string; open: number; high: number; low: number; close: number; }> = [];

  if (oneMinApiData.length > 0) {
    // Sort to ensure the last point is indeed the latest, if not already sorted
    const sortedOneMinApiData = [...oneMinApiData].sort((a, b) => 
        new Date(a.datetime["$date"]).getTime() - new Date(b.datetime["$date"]).getTime()
    );
    
    const lastDataPointTime = new Date(sortedOneMinApiData[sortedOneMinApiData.length - 1].datetime["$date"]).getTime();
    const twoHoursBeforeLastDataPoint = lastDataPointTime - (2 * 60 * 60 * 1000);

    const oneMinDataFiltered = sortedOneMinApiData.filter(
      item => new Date(item.datetime["$date"]).getTime() >= twoHoursBeforeLastDataPoint
    );
    
    oneMinDataForCard = oneMinDataFiltered.map(item => ({
      time: item.datetime["$date"], 
      open: item.open,
      high: item.high,
      low: item.low,
      close: item.close
    }));
  }

  const dailyApiData = stockData?.["1d_chart_data"] || [];
  const dailyDataForCard = dailyApiData.map(item => ({
    time: item.datetime["$date"],
    open: item.open,
    high: item.high,
    low: item.low,
    close: item.close
  }));
  
  // Filter 5-minute data for the last day
  const fiveMinApiData = stockData?.["5m_chart_data"] || [];
  let fiveMinDataForCard: Array<{ time: string; open: number; high: number; low: number; close: number; }> = [];
  if (fiveMinApiData.length > 0) {
    const sortedFiveMinApiData = [...fiveMinApiData].sort((a, b) => 
        new Date(a.datetime["$date"]).getTime() - new Date(b.datetime["$date"]).getTime()
    );
    const lastDataPointDateStr = new Date(sortedFiveMinApiData[sortedFiveMinApiData.length - 1].datetime["$date"]).toISOString().split('T')[0];
    
    fiveMinDataForCard = sortedFiveMinApiData.filter(item => 
        new Date(item.datetime["$date"]).toISOString().startsWith(lastDataPointDateStr)
    ).map(item => ({
        time: item.datetime["$date"],
        open: item.open,
        high: item.high,
        low: item.low,
        close: item.close
    }));
  }

  // Data for CashDebtChartCard (moved here for clarity)
  const cashFromAnalysis = stockData.sec_filing_analysis?.['Cash (USD)'];
  const debtFromAnalysis = stockData.sec_filing_analysis?.['Debt (USD)'];

  const cashDebtDataProp = {
      cash_and_equivalents: cashFromAnalysis ?? String(stockData.cash_and_equivalents ?? '0'),
      total_debt: debtFromAnalysis ?? String(stockData.total_debt ?? '0'),
      // We are not using net_debt, free_cash_flow, or operating_cash_flow in the chart anymore
      // net_debt: String(stockData.net_debt ?? '0'),
      // free_cash_flow: String(stockData.free_cash_flow ?? '0'),
      // operating_cash_flow: String(stockData.operating_cash_flow ?? '0'),
  };

  // Data for PriceChartCard
  const priceChartDataProp: PriceChartData = {
    symbol: stockData.symbol,
    day_low: String(stockData.day_low ?? '0'),
    yesterday_close: String(stockData.yesterday_close ?? '0'),
    day_close: String(stockData.day_close ?? '0'),
    day_high: String(stockData.day_high ?? '0'),
    market_open_high: String(stockData.market_open_high ?? '0'),
    market_open_low: String(stockData.market_open_low ?? '0'),
    key_levels: stockData.key_levels || [],
  };

  return (
    <>
      <Box className="header">
        <Typography className="header-title">{stockData.name} ({stockData.symbol})</Typography>
        <Typography className="header-date">Data as of {stockData.today_date}</Typography>
      </Box>

      <Container maxWidth="xl" className="main-content">
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mb: 2, mt:1 }} className="back-button">Back</Button>

        {/* --- NEW ROW 0: Daily Chart (Left) | Price Chart (Right) --- */}
        <Box className="row" sx={{ alignItems: 'stretch', gap: '20px' }}> 
          {/* Left Column: Daily Chart */}
          <Box className="daily-chart-wrapper" sx={{ flex: 3, minHeight: '400px' }}>
            <SmallStockChartCard title="Daily" data={dailyDataForCard} />
          </Box>
          {/* Right Column: Price Chart */}
          <Box className="price-chart-wrapper" sx={{ flex: 2, minHeight: '400px' }}>
            <PriceChartCard data={priceChartDataProp} />
          </Box>
        </Box>

        {/* --- NEW ROW 1: Small Charts & Cash/Debt (Left) | Metrics & SEC Filing (Right) --- */}
        <Box className="row" sx={{ alignItems: 'stretch' }}>
          {/* Left Column for charts */}
          <Box className="left-chart-stack-column">
            <div className="chart-large">
              <SmallStockChartCard title="1-Min (Last 2 Hrs)" data={oneMinDataForCard} />
            </div>
            <div className="chart-large">
              <SmallStockChartCard title="5-Min (Last Day)" data={fiveMinDataForCard} />
            </div>
            <div className="chart-small">
              <CashDebtChartCard data={cashDebtDataProp} />
            </div>
          </Box>

          {/* Right Column for Metrics and SEC Filing */}
          <Box className="right-info-column">
            <Box sx={{ mb: 2 }}> {/* Add margin bottom for spacing */}
              <MetricsCard data={metricsCardDataProp} marketCapFormatted={marketCapFormatted} />
            </Box>
            <SECFilingCard data={secFilingDataProp} />
          </Box>
        </Box>

        {/* Row 3: Suggestion Card */}
        <Box className="row">
          <SuggestionCard data={suggestionDataProp} />
        </Box>

        {/* Row 4: News Display (Left 3), News Input (Right 2) - Adjusted for 3:2 ratio and equal height */}
        <Box className="row news-row" sx={{ 
          alignItems: 'stretch',
          gap: '20px',  // Add gap between cards
          display: 'flex'
        }}>
          <Box className="news-column news-column-left" sx={{ 
            flex: 3, 
            display: 'flex',
            minHeight: '400px'  // Ensure minimum height
          }}>
            <NewsDisplayCard
              data={newsDisplayDataProp}
              onDelete={handleNewsDelete}
            />
          </Box>
          <Box className="news-column news-column-right" sx={{ 
            flex: 2, 
            display: 'flex',
            minHeight: '400px'  // Ensure minimum height
          }}>
            <NewsInputCard data={newsInputCardDataProp} onNewsSubmitted={handleNewsSubmittedCallback} />
          </Box>
        </Box>
      </Container>
      <Footer />
      <Snackbar
        open={!!statusMessage}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={statusMessage?.severity || 'info'} sx={{ width: '100%' }}>
          {statusMessage?.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default StockDetail;