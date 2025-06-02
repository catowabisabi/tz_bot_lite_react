import React from 'react';
import Plot from 'react-plotly.js';
import { safeFloat } from 'src/utils/helpers';
import { colors as themeColors } from 'src/styles/colors';
import type { Layout } from 'plotly.js';

export interface CashDebtData {
  cash_and_equivalents?: string;
  total_debt?: string;
  net_debt?: string;
  free_cash_flow?: string;
  operating_cash_flow?: string;
}

export const CashDebtChart: React.FC<{ data: CashDebtData }> = ({ data }) => {
  const cashAndEquivalents = safeFloat(data.cash_and_equivalents, 0);
  const totalDebt = safeFloat(data.total_debt, 0);
  // const netDebt = safeFloat(data.net_debt, 0); // No longer needed
  // const freeCashFlow = safeFloat(data.free_cash_flow, 0); // No longer needed
  // const operatingCashFlow = safeFloat(data.operating_cash_flow, 0); // No longer needed

  const axisFontColor = '#e0e0e0';
  const gridAndLineColor = '#444'; // A more visible dark grid/line

  const layout: Partial<Layout> = {
    plot_bgcolor: '#1e1e1e',
    paper_bgcolor: '#1e1e1e',
    font: { color: axisFontColor },
    autosize: true,
    dragmode: false,
    hovermode: 'closest',
    showlegend: false, // Simplified chart might not need a legend
    margin: { l: 60, r: 5, t: 10, b: 20, pad: 0 }, // Increased left margin, decreased right
    height: undefined, // Let the container control the height
    yaxis: {
      title: { text: 'Amount (USD)', font: { color: axisFontColor, size: 10 } },
      fixedrange: true,
      showgrid: false,
      zeroline: false,
      tickfont: { color: axisFontColor, size: 9 },
      gridcolor: gridAndLineColor,
      linecolor: gridAndLineColor,
      zerolinecolor: gridAndLineColor
    },
    xaxis: {
      fixedrange: true,
      showgrid: false,
      tickfont: { color: axisFontColor, size: 10 },
      gridcolor: gridAndLineColor,
      linecolor: gridAndLineColor,
      zerolinecolor: gridAndLineColor,
      automargin: true
    }
  };

  const traces = [
    {
      x: ['Cash', 'Debt'], // Shortened labels
      y: [cashAndEquivalents, totalDebt],
      type: 'bar' as const,
      marker: {
        color: [
          themeColors.positive, // Cash
          themeColors.negative, // Debt
        ]
      },
      // name: 'Balance Sheet' // Name might not be needed if no legend
    },
    // {
    //   x: ['Operating Cash Flow', 'Free Cash Flow'],
    //   y: [operatingCashFlow, freeCashFlow],
    //   type: 'bar' as const,
    //   marker: {
    //     color: [
    //       operatingCashFlow >= 0 ? themeColors.positive : themeColors.negative,
    //       freeCashFlow >= 0 ? themeColors.positive : themeColors.negative
    //     ]
    //   },
    //   name: 'Cash Flow'
    // }
  ];

  return (
    <div style={{ height: '100%', width: '100%' }}> {/* Container fills parent */}
      <Plot
        {...{
          data: traces,
          layout: layout,
          style: { width: '100%', height: '100%' },
          config: { 
            staticPlot: false, 
            displayModeBar: false,
            responsive: true,
          }
        } as any}
      />
    </div>
  );
};

export const CashDebtChartCard = ({ data }: { data: CashDebtData }) => {
  return (
    <div className="card" style={{ height: '100%', padding: '10px' }}>
      <h3 className="card-title" style={{ marginBottom: '5px', paddingBottom: '5px' }}>Cash vs Debt</h3>
      <div style={{ height: 'calc(100% - 30px)' }}> {/* Adjusted calculation */}
        <CashDebtChart data={data} />
      </div>
    </div>
  );
}; 