import React from 'react';

interface SECData {
  sec_filing: string;
  sec_filing_analysis: {
    [key: string]: any; // Allow for dynamic keys from the API
    'Cash (USD)'?: string | number;
    'Debt (USD)'?: string | number | null;
    'Cash/Debt Ratio'?: string;
    'ATM Risk Level'?: string;
    'Risk Reason'?: string;
    'Trading Recommendation'?: string;
    'Recommendation Confidence'?: string;
    'Short Squeeze Risk'?: string;
    'Recommendation Reasons'?: string[];
  };
  sec_filing_analysis_summary: string;
  sec_filing_analysis_details: string;
  sec_filing_analysis_recommendation: string;
}

export const SECFilingCard = ({ data }: { data: SECData }) => {
  return (
    <div className="card">
      <h3 className="card-title">SEC Filing Analysis</h3>
      <div className="sec-filing-content">
        {/*
        <div className="sec-filing-section">
          <h4>Filing Content</h4>
          <div className="sec-filing-text">{data.sec_filing}</div>
        </div>
        */}

        <div className="sec-filing-section">
          <h4>Analysis</h4>
          <div className="sec-filing-summary">{data.sec_filing_analysis_summary || 'N/A'}</div>
          <div className="sec-filing-grid">
            {Object.entries(data.sec_filing_analysis || {})
              .filter(([key]) => 
                key !== 'Cash (USD)' && 
                key !== 'Debt (USD)' &&
                key.toUpperCase() !== 'CIK' && 
                key.toUpperCase() !== 'DATA DATE' // Corrected to filter 'Data Date'
              )
              .map(([key, value]) => (
              <React.Fragment key={key}>
                <div className="sec-filing-label">{key}:</div>
                <div className="sec-filing-value">
                  {Array.isArray(value) ? (
                    <ul>
                      {value.map((item, index) => (
                        <li key={index}>{String(item ?? 'N/A')}</li>
                      ))}
                    </ul>
                  ) : (
                    String(value ?? 'N/A') // Display N/A if value is null/undefined
                  )}
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="sec-filing-section">
          <h4>Detailed Analysis</h4>
          <div className="sec-filing-text">{data.sec_filing_analysis_details || 'N/A'}</div>
        </div>

        <div className="sec-filing-section">
          <h4>Recommendation</h4>
          <div className="sec-filing-text">{data.sec_filing_analysis_recommendation || 'N/A'}</div>
        </div>
      </div>
    </div>
  );
}; 