import React from 'react';
import Plot from 'react-plotly.js';
import { safeFloat, safeGet } from '../../utils/helpers';
import { colors } from '../../styles/colors';
import { Box, Typography } from '@mui/material';
import type { Layout, Config } from 'plotly.js';
import '../../styles/strategy.css';
import CssBaseline from '@mui/material/CssBaseline';

export interface PriceChartData {
  symbol?: string;
  day_low?: string;
  yesterday_close?: string;
  day_close?: string;
  day_high?: string;
  market_open_high?: string;
  market_open_low?: string;
  key_levels?: number[];
}

export const PriceChart = ({ data }: { data: PriceChartData }) => {
  const dayLow = safeFloat(data.day_low, 0);
  const yesterdayClose = safeFloat(data.yesterday_close, 0);
  const dayClose = safeFloat(data.day_close, 0);
  const dayHigh = safeFloat(data.day_high, 0);
  const marketOpenHigh = safeFloat(data.market_open_high, 0);
  const marketOpenLow = safeFloat(data.market_open_low, 0);
  const keyLevels = data.key_levels || [];

  const xPositions = ['Yesterday Close', 'Day Low', 'Day High', 'Day Close'];
  const xRange = ['Yesterday Close', 'Day Close'];
  const allValues = [yesterdayClose, dayLow, dayHigh, dayClose, ...keyLevels];
  const minPrice = Math.min(...allValues) * 0.95;
  const maxPrice = Math.max(...allValues) * 1.05;

  const layout: Partial<Layout> = {
    autosize: true,
    plot_bgcolor: '#1e1e1e',
    paper_bgcolor: '#1e1e1e',
    margin: {
      l: 50,
      r: 50,
      t: 70,
      b: 30,
      pad: 4
    },
    showlegend: true,
    legend: {
      orientation: 'h',
      yanchor: 'bottom',
      y: 1.05,
      xanchor: 'center',
      x: 0.5,
      bgcolor: '#1e1e1e',
      bordercolor: '#444',
      borderwidth: 1,
      font: { color: '#e0e0e0' }
    },
    yaxis: {
      title: { 
        text: 'Price (USD)',
        font: { color: '#e0e0e0' }
      },
      range: [minPrice, maxPrice],
      fixedrange: true,
      gridcolor: '#2a2a2a',
      zerolinecolor: '#2a2a2a',
      showgrid: true,
      showline: true,
      linecolor: '#444',
      linewidth: 1,
      tickfont: {
        color: '#e0e0e0',
        size: 12
      }
    },
    xaxis: {
      fixedrange: true,
      gridcolor: '#2a2a2a',
      zerolinecolor: '#2a2a2a',
      showgrid: true,
      showline: true,
      linecolor: '#444',
      linewidth: 1,
      tickfont: {
        color: '#e0e0e0',
        size: 12
      }
    }
  };

  const config: Partial<Config> = {
    displayModeBar: false,
    responsive: true
  };

  const traces: any[] = [
    // Main price movement line
    {
      x: xPositions,
      y: [yesterdayClose, dayLow, dayHigh, dayClose],
      mode: 'lines+markers',
      marker: {
        color: [colors.neutral, colors.negative, colors.warning, colors.positive],
        size: 12
      },
      line: { color: colors.neutral, width: 1 },
      name: 'Price Movement',
      showlegend: false
    },
    // Individual price points for legend
    {
      x: ['Yesterday Close'],
      y: [yesterdayClose],
      mode: 'markers',
      marker: { color: colors.neutral, size: 12 },
      name: `Yesterday Close (${yesterdayClose})`,
      showlegend: true
    },
    {
      x: ['Day Low'],
      y: [dayLow],
      mode: 'markers',
      marker: { color: colors.negative, size: 12 },
      name: `Day Low (${dayLow})`,
      showlegend: true
    },
    {
      x: ['Day High'],
      y: [dayHigh],
      mode: 'markers',
      marker: { color: colors.warning, size: 12 },
      name: `Day High (${dayHigh})`,
      showlegend: true
    },
    {
      x: ['Day Close'],
      y: [dayClose],
      mode: 'markers',
      marker: { color: colors.positive, size: 12 },
      name: `Day Close (${dayClose})`,
      showlegend: true
    },
    // Market open levels
    {
      x: xRange,
      y: [marketOpenHigh, marketOpenHigh],
      mode: 'lines',
      line: { color: colors.warning, width: 2, dash: 'dash' }, 
      name: `Market Open High (${marketOpenHigh})`,
      showlegend: true
    },
    {
      x: xRange,
      y: [marketOpenLow, marketOpenLow],
      mode: 'lines',
      line: { color: colors.positive, width: 2, dash: 'dash' }, 
      name: `Market Open Low (${marketOpenLow})`,
      showlegend: true
    },
    // Key levels
    ...keyLevels.map((level, i) => ({
      x: xRange,
      y: [level, level],
      mode: 'lines',
      line: { color: 'purple', width: 1.5, dash: 'dot' }, 
      name: `Key Level (${level})`,
      opacity: 0.7,
      showlegend: i === 0
    }))
  ];

  return (
    <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>
        <Plot
          {...{
            data: traces,
            layout: layout,
            config: config,
            style: { width: '100%', height: '100%' }
          } as any}
        />
    </Box>
  );
};

export const PriceChartCard = ({ data }: { data: PriceChartData }) => {
  return (
    <Box 
      className="card"
      sx={{ 
        height: '100%', 
        minHeight: 400,
      }}
    >
      <Typography 
        variant="h6"
        className="card-title"
        sx={{ 
          // sx props for color, fontWeight, mb are handled by "card-title" class
        }}
      >
        {safeGet(data, 'symbol', '')} Price Chart
      </Typography>
      <Box sx={{ flexGrow: 1, position: 'relative' }}> 
        <PriceChart data={data} />
      </Box>
    </Box>
  );
}; 