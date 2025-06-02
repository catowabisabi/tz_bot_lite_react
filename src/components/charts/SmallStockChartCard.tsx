import React from 'react';
import Plot from 'react-plotly.js';
import { colors as themeColors } from '../../styles/colors';
import type { Layout } from 'plotly.js';

// Updated to support candlestick data
interface CandlestickDataPoint {
  time: string; // ISO date string
  open: number;
  high: number;
  low: number;
  close: number;
}

interface ChartData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface SmallStockChartCardProps {
  title: string;
  data: ChartData[];
}

// Renamed to baseLayout and included margin and rangeslider directly
const baseLayout: Partial<Layout> = {
  plot_bgcolor: '#1e1e1e',
  paper_bgcolor: '#1e1e1e',
  font: { color: '#e0e0e0' },
  showlegend: false,
  margin: { l: 10, r: 50, t: 10, b: 30 },
  xaxis: {
    gridcolor: '#333',
    showgrid: true,
    fixedrange: true,
    tickfont: { color: '#e0e0e0', size: 10 },
    type: 'date' as const,
    rangeslider: { visible: false }, 
  },
  yaxis: {
    gridcolor: '#333',
    showgrid: true,
    fixedrange: true,
    tickfont: { color: '#e0e0e0', size: 10 },
    side: 'right' as const,
  },
};

const SmallStockChartCard: React.FC<SmallStockChartCardProps> = ({ title, data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="card">
        <h3 className="card-title">{title}</h3>
        <div className="card-content">
          <div className="plotly-chart-container">
            <div className="no-data-message">No data available</div>
          </div>
        </div>
      </div>
    );
  }

  // Directly use baseLayout, or create a new object if modifications are needed per-instance
  const plotLayout: Partial<Layout> = {
    ...baseLayout,
    // If you needed to override something from baseLayout for a specific chart, you could do it here.
    // For example: 
    // margin: { ...baseLayout.margin, t: 20 }, 
    // xaxis: { ...baseLayout.xaxis, rangeslider: {visible: true} }
  };

  const plotProps = {
    data: [{
      x: data.map(item => new Date(item.time).toISOString()),
      open: data.map(item => item.open),
      high: data.map(item => item.high),
      low: data.map(item => item.low),
      close: data.map(item => item.close),
      type: 'candlestick',
      increasing: { line: { color: themeColors.positive } },
      decreasing: { line: { color: themeColors.negative } },
    }],
    layout: plotLayout,
    config: {
      displayModeBar: false,
      responsive: true,
    },
    style: {
      width: '100%',
      height: '100%',
    },
    useResizeHandler: true,
  };

  return (
    <div className="card">
      <h3 className="card-title">{title}</h3>
      <div className="card-content">
        <div className="plotly-chart-container">
          <Plot {...plotProps as any} />
        </div>
      </div>
    </div>
  );
};

export default SmallStockChartCard; 