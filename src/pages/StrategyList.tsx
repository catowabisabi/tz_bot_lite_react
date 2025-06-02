import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';

interface StrategyInfo {
  名稱: string;
  說明: string;
  // Add a type field if your API provides it for categorization
  // type?: 'short' | 'long' | string;
}

// Interface for the expected API response structure
interface ApiResponse {
  status: string;
  data: {
    long_strategies: StrategyInfo[];
    short_strategies: StrategyInfo[];
  };
}

const StrategyCard: React.FC<{ strategy: StrategyInfo }> = ({ strategy }) => (
  <Link 
    to={`/strategy/${encodeURIComponent(strategy.名稱)}`}
    style={{ textDecoration: 'none' }}
  >
    <Box className="s-card" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" className="card-title">{strategy.名稱}</Typography>
      <Typography className="card-text" sx={{ flexGrow: 1 }}>{strategy.說明}</Typography>
    </Box>
  </Link>
);

export const StrategyList: React.FC = () => {
  const [shortStrategies, setShortStrategies] = useState<StrategyInfo[]>([]);
  const [longStrategies, setLongStrategies] = useState<StrategyInfo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStrategies = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('https://fastapi.enomars.org/api/strategies');
        if (!response.ok) {
          // Attempt to get more detailed error message if possible
          let errorBody = `HTTP error! status: ${response.status}`;
          try {
            const text = await response.text(); // Get raw text to see what was returned
            errorBody += ` - ${text.substring(0, 200)}`; // Show first 200 chars
          } catch (e) {
            // Ignore if can't read text body
          }
          throw new Error(errorBody);
        }
        
        const result: ApiResponse = await response.json();

        if (result.status === 'success' && result.data) {
          setShortStrategies(result.data.short_strategies || []);
          setLongStrategies(result.data.long_strategies || []);
        } else {
          throw new Error('API returned success false or data is missing.');
        }

      } catch (err) {
        console.error("Error fetching strategies:", err);
        setError(err instanceof Error ? err.message : 'Failed to fetch strategies.');
      } finally {
        setLoading(false);
      }
    };

    fetchStrategies();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', backgroundColor: "#121212" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ padding: '20px', textAlign: 'center', backgroundColor: "#121212", minHeight: "100vh" }}>
        <Alert severity="error">Error fetching strategies: {error}</Alert>
      </Box>
    );
  }

  return (
    <Box style={{ backgroundColor: "#121212", minHeight: "100vh", paddingBottom: "40px" }}>
      <Typography variant="h4" component="h2" style={{ margin: '20px auto', color: 'white', maxWidth: '1200px', textAlign: 'center' }}>
        📊 日內多空策略
      </Typography>

      {(shortStrategies.length === 0 && longStrategies.length === 0 && !loading) && (
        <Typography style={{color: 'white', textAlign: 'center', marginTop: '20px'}}>
            No strategies found.
        </Typography>
      )}

      {shortStrategies.length > 0 && (
        <>
          <Typography variant="h5" component="h4" style={{ margin: '30px auto 10px auto', color: 'white', maxWidth: '1200px' }}>
            🥷 空頭策略
          </Typography>
          <Box className="s-card-container">
            {shortStrategies.map(strategy => (
              <StrategyCard key={strategy.名稱} strategy={strategy} />
            ))}
          </Box>
        </>
      )}

      {shortStrategies.length > 0 && longStrategies.length > 0 && (
        <Box style={{ height: '50px' }} /> 
      )}

      {longStrategies.length > 0 && (
        <>
          <Typography variant="h5" component="h4" style={{ margin: '30px auto 10px auto', color: 'white', maxWidth: '1200px' }}>
            🐱 多頭策略
          </Typography>
          <Box className="s-card-container">
            {longStrategies.map(strategy => (
              <StrategyCard key={strategy.名稱} strategy={strategy} />
            ))}
          </Box>
        </>
      )}
    </Box>
  );
}; 