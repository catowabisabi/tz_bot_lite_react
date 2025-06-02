import React from 'react';
import { safeGet, safeFloat } from 'src/utils/helpers';
import { colors as themeColors } from 'src/styles/colors';

interface MetricsCardProps {
  data: {
    day_close?: string;
    close_change_percentage?: string;
    day_low?: string;
    day_high?: string;
    float?: string;
    float_risk?: string;
  };
  marketCapFormatted: string;
}

// We will define these in App.css for better specificity
// const metricBgColors = [
//   '#2a2a2a', 
//   '#303030', 
//   '#2c2c2c', 
//   '#323232', 
//   '#2e2e2e', 
//   '#343434' 
// ];

const MetricsCard = ({ data, marketCapFormatted }: MetricsCardProps) => {
  const changePercentage = safeFloat(data?.close_change_percentage, 0);
  const changeColor = changePercentage >= 0 ? themeColors.positive : themeColors.negative;

  const metrics = [
    { title: 'Day Close', value: `$${safeGet(data, 'day_close', '0.00')}` },
    { title: 'Change %', value: `${changePercentage.toFixed(2)}%`, color: changeColor },
    { title: 'Day Range', value: `$${safeGet(data, 'day_low', '0.00')} - $${safeGet(data, 'day_high', '0.00')}` },
    { title: 'Market Cap', value: marketCapFormatted },
    { title: 'Float', value: safeGet(data, 'float', 'N/A') },
    { title: 'Float Risk', value: safeGet(data, 'float_risk', 'N/A') },
  ];

  return (
    <div className="card">
      <h3 className="card-title">Key Metrics</h3>
      <div className="metrics-grid">
        {metrics.map((metric, index) => (
          <div 
            key={metric.title} 
            // Apply a dynamic class like metric-bg-0, metric-bg-1, etc.
            className={`metric-container metric-bg-${index % 6}`} 
            // style={{ backgroundColor: metricBgColors[index % metricBgColors.length] }} // Removed inline style
          >
            <p className="metric-title">{metric.title}</p>
            <h4 className="metric-value" style={metric.color ? { color: metric.color } : {}}>
              {metric.value}
            </h4>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MetricsCard;
