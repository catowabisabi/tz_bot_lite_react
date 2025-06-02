import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, Typography, Box } from '@mui/material';

interface StockData {
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

interface StockCardProps {
  data: StockData;
}

export const StockCard: React.FC<StockCardProps> = ({ data }) => {
  const changePercentage = parseFloat(data.close_change_percentage?.toString() || '0');
  const changeColor = changePercentage >= 0 ? '#4caf50' : '#f44336';

  return (
    <Link to={`/stock/${data.symbol}`} style={{ textDecoration: 'none' }}>
      <Card 
        sx={{ 
          height: '100%',
          backgroundColor: '#1e1e1e',
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '20px',
          '&:hover': {
            transform: 'translateY(-4px)',
            transition: 'transform 0.2s ease-in-out',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
          }
        }}
      >
        <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Symbol and Date */}
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h5" component="div">
              {data.symbol}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {data.today_date}
            </Typography>
          </Box>

          {/* Company Name */}
          <Typography 
            variant="body1" 
            sx={{ 
              mt: 1, 
              mb: 2,
              fontSize: { xs: '0.875rem', sm: '1rem' }
            }}
          >
            {data.name || 'NA'}
          </Typography>

          {/* Metrics Grid */}
          <Box 
            sx={{ 
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: { xs: 1, sm: 2 },
              mt: 'auto'
            }}
          >
            {/* Price and Change Row */}
            <Box 
              sx={{ 
                backgroundColor: 'rgba(25, 118, 210, 0.15)',
                padding: { xs: 0.5, sm: 1 },
                borderRadius: 1,
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
              >
                Price
              </Typography>
              <Typography 
                variant="body1"
                sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
              >
                ${data.day_close}
              </Typography>
            </Box>

            <Box 
              sx={{ 
                backgroundColor: 'rgba(76, 175, 80, 0.15)',
                padding: { xs: 0.5, sm: 1 },
                borderRadius: 1,
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
              >
                Change %
              </Typography>
              <Typography 
                variant="body1"
                sx={{ color: changeColor, fontSize: { xs: '0.875rem', sm: '1rem' } }}
              >
                {changePercentage.toFixed(2)}%
              </Typography>
            </Box>

            {/* Sector and Float Risk Row */}
            <Box 
              sx={{ 
                backgroundColor: 'rgba(255, 152, 0, 0.15)',
                padding: { xs: 0.5, sm: 1 },
                borderRadius: 1,
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
              >
                Sector
              </Typography>
              <Typography 
                variant="body1"
                sx={{ 
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  wordBreak: 'break-word'
                }}
              >
                {data.sector || 'NA'}
              </Typography>
            </Box>

            <Box 
              sx={{ 
                backgroundColor: 'rgba(244, 67, 54, 0.15)',
                padding: { xs: 0.5, sm: 1 },
                borderRadius: 1,
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
              >
                Float Risk
              </Typography>
              <Typography 
                variant="body1"
                sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
              >
                {data.float_risk || 'NA'}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Link>
  );
};
