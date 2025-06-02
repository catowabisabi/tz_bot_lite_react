import React from 'react';

interface ChartData {
  symbol?: string;
}

interface ChartContainerProps {
  interval?: string;
  name: string;
  chartId: string;
  data: ChartData;
}

export const ChartContainer = ({ interval = '1min', name, chartId, data }: ChartContainerProps) => {
  return (
    <div className="chart-container">
      <div className="card">
        <div className="chart-header">
          <h5 className="card-title">{name.toUpperCase()}</h5>
        </div>
        <div>
          {/* TradingView Widget will be integrated here */}
          <div
            id={`${chartId}-graph`}
            style={{
              height: '400px',
              backgroundColor: '#1e1e1e'
            }}
          />
        </div>
      </div>
    </div>
  );
};

export const RowChartContainer = ({ data }: { data: ChartData }) => {
  return (
    <div>
      <div className="row">
        <ChartContainer
          interval="1min"
          name="1 MIN (last 3 hrs)"
          chartId="chart1"
          data={data}
        />
        <ChartContainer
          interval="5min"
          name="5 MIN"
          chartId="chart2"
          data={data}
        />
      </div>
      <div className="row">
        <ChartContainer
          interval="1day"
          name="Daily"
          chartId="chart3"
          data={data}
        />
      </div>
    </div>
  );
}; 