import React from 'react';
import { safeGet } from 'src/utils/helpers';

interface CompanyData {
  symbol?: string;
  name?: string;
  sector?: string;
  industry?: string;
  countryDomicile?: string;
  securityType?: string;
  isin?: string;
}

export const CompanyInfoCard = ({ data }: { data: CompanyData }) => (
  <div className="card">
    <h3 className="card-title">Company Information</h3>
    <div className="info-list">
      <div className="info-item">
        <span className="info-label">Symbol:</span>
        <span className="info-value">{safeGet(data, 'symbol', 'N/A')}</span>
      </div>
      <div className="info-item">
        <span className="info-label">Name:</span>
        <span className="info-value">{safeGet(data, 'name', 'N/A')}</span>
      </div>
      <div className="info-item">
        <span className="info-label">Sector:</span>
        <span className="info-value">{safeGet(data, 'sector', 'N/A')}</span>
      </div>
      <div className="info-item">
        <span className="info-label">Industry:</span>
        <span className="info-value">{safeGet(data, 'industry', 'N/A')}</span>
      </div>
      {/*
      <div className="info-item">
        <span className="info-label">Country:</span>
        <span className="info-value">{safeGet(data, 'countryDomicile', 'N/A')}</span>
      </div>
      <div className="info-item">
        <span className="info-label">Security Type:</span>
        <span className="info-value">{safeGet(data, 'securityType', 'N/A')}</span>
      </div>
      <div className="info-item">
        <span className="info-label">ISIN:</span>
        <span className="info-value">{safeGet(data, 'isin', 'N/A')}</span>
      </div>
      */}
    </div>
  </div>
);
