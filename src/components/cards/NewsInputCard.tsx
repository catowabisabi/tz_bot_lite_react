import React, { useState } from 'react';
import { safeGet } from 'src/utils/helpers';

interface NewsInputProps {
  data: {
    symbol?: string;
    target_document_id?: string;
  };
  onNewsSubmitted?: () => void;
}

export const NewsInputCard = ({ data, onNewsSubmitted }: NewsInputProps) => {
  const [password, setPassword] = useState('');
  const [newsText, setNewsText] = useState('');
  const [warning, setWarning] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const symbol = safeGet(data, 'symbol', '');
  const targetDocumentId = safeGet(data, 'target_document_id', '');

  // Add debug logging when component mounts or data changes
  React.useEffect(() => {
    //console.log('NewsInputCard data:', data);
    if (!targetDocumentId) {
      console.warn('Missing document ID in NewsInputCard. This will prevent adding news.');
    }
  }, [data, targetDocumentId]);

  const handleSubmit = async () => {
    let currentWarning = '';
    if (!password.trim() && !newsText.trim()) {
      currentWarning = 'Please enter password and news article.';
    } else if (!password.trim()) {
      currentWarning = 'Password is required.';
    } else if (!newsText.trim()) {
      currentWarning = 'News article text is required.';
    } else if (!targetDocumentId) {
      currentWarning = 'Document ID is missing. Cannot submit news. Please try refreshing the page.';
    }

    if (currentWarning) {
      setWarning(currentWarning);
      setSuccessMessage('');
      return;
    }
    
    setWarning('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      const response = await fetch(`https://fastapi.enomars.org/api/stocks/${symbol}/add-news`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password: password,
          news: newsText,
          target_document_id: targetDocumentId,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setSuccessMessage(result.message || 'News successfully added!');
        setNewsText('');
        if (onNewsSubmitted) {
          onNewsSubmitted();
        }
      } else {
        let errorMessage = 'Failed to add news.';
        if (result.detail) {
          if (Array.isArray(result.detail) && result.detail.length > 0 && result.detail[0].msg) {
            errorMessage = result.detail[0].msg;
          } else if (typeof result.detail === 'string') {
            errorMessage = result.detail;
          }
        }
        setWarning(errorMessage);
      }
    } catch (error) {
      console.error("Error submitting news:", error);
      setWarning('An unexpected error occurred. Please try again.');
    }
    setIsLoading(false);
  };

  return (
    <div className="card">
      <h3 className="card-title">Add News Analysis</h3>
      <div>
        <input
          type="password"
          placeholder="Enter password..."
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (warning && e.target.value.trim()) setWarning('');
            if (successMessage) setSuccessMessage('');
          }}
          style={{
            width: '100%',
            marginBottom: '10px',
            padding: '8px',
            borderRadius: '4px',
            border: '1px solid #444',
            backgroundColor: '#1e1e1e',
            color: '#EBEBEB',
            fontSize: '12px',
            fontFamily: 'Arial, sans-serif',
          }}
          disabled={isLoading}
        />
        <textarea
          placeholder="Paste news article text here..."
          value={newsText}
          onChange={(e) => {
            setNewsText(e.target.value);
            if (warning && e.target.value.trim()) setWarning('');
            if (successMessage) setSuccessMessage('');
          }}
          style={{
            width: '100%',
            height: '200px',
            padding: '10px 20px',
            backgroundColor: '#1e1e1e',
            color: '#EBEBEB',
            fontSize: '12px',
            fontFamily: 'Arial, sans-serif',
            border: '1px solid #444',
            borderRadius: '6px',
            marginBottom: '10px',
          }}
          disabled={isLoading}
        />
        <button
          onClick={handleSubmit}
          className="submit-button"
          disabled={isLoading}
        >
          {isLoading ? 'Submitting...' : 'Submit News'}
        </button>
        {warning && <p style={{ color: 'red', marginTop: '10px' }}>{warning}</p>}
        {successMessage && <p style={{ color: 'green', marginTop: '10px' }}>{successMessage}</p>}
      </div>
      <div
        style={{ display: 'none' }}
        data-symbol={symbol}
        data-target-id={targetDocumentId}
      />
    </div>
  );
}; 