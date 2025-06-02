import React from 'react';
import { safeGet } from 'src/utils/helpers';

interface StockData {
  suggestion: string;
}

export const SuggestionCard = ({ data }: { data: StockData }) => {
  const suggestion = safeGet(data, 'suggestion', 'No suggestion available');
  const suggestionParts = suggestion.split('\n\n');

  return (
    <div className="card">
      <h3 className="card-title">Trading Suggestion</h3>
      <div className="suggestion-container">
        <div className="suggestion-text">
          {suggestionParts.map((part: string, idx: number) => <p key={idx}>{part}</p>)}
        </div>
      </div>
    </div>
  );
};