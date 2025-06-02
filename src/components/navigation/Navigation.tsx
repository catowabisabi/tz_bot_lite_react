import React from 'react';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export const Header = ({ title, subtitle }: HeaderProps) => {
  return (
    <div className="header">
      <h1 className="header-title">{title}</h1>
      {subtitle && <p className="header-date">{subtitle}</p>}
    </div>
  );
};

export const Footer = () => {
  return (
    <div className="footer">
      <p className="footer-text">© 2025 Stock Analytics Dashboard</p>
    </div>
  );
};

interface BackButtonProps {
  onClick: () => void;
}

export const BackButton = ({ onClick }: BackButtonProps) => {
  return (
    <button onClick={onClick} className="back-button">
      Back to Stock List
    </button>
  );
};

export const BackButtonStrategy = ({ onClick }: BackButtonProps) => {
  return (
    <button onClick={onClick} className="back-button">
      Back to Strategy List
    </button>
  );
}; 