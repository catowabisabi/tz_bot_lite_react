import React, { useState } from 'react';

interface NewsItem {
  summary: string;
  timestamp: string;
  uuid: string;
}

interface NewsDisplayProps {
  data: {
    raw_news?: NewsItem[];
    symbol?: string;
    target_document_id?: string;  // This will be the MongoDB ObjectId string
  };
  onDelete: (uuid: string, password: string, target_document_id: string) => void;
}

export const NewsDisplayCard = ({ data, onDelete }: NewsDisplayProps) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedUuid, setSelectedUuid] = useState('');
  const [deletePassword, setDeletePassword] = useState('');
  const [selectedNewsSummary, setSelectedNewsSummary] = useState('');

  const handleDelete = (uuid: string, summary: string) => {
    setSelectedUuid(uuid);
    setSelectedNewsSummary(summary);
    setDeletePassword('');
    setShowConfirm(true);
  };

  const confirmDelete = () => {
    if (selectedUuid && deletePassword && data.target_document_id) {
      // Pass the MongoDB ObjectId string directly
      onDelete(selectedUuid, deletePassword, data.target_document_id);
      setDeletePassword('');
    }
    setShowConfirm(false);
  };

  const rawNews = data.raw_news || [];

  return (
    <div className="card" style={{ 
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      padding: '20px',
      backgroundColor: '#1e1e1e',
      borderRadius: '8px',
      border: '1px solid #333'
    }}>
      <h3 className="card-title">Stored News Articles</h3>
      <div id="news-list-container" style={{
        flex: 1,
        overflowY: 'auto',
        marginTop: '10px'
      }}>
        {rawNews && rawNews.length > 0 ? (
          rawNews.map((news) => (
            <div key={news.uuid} className="news-item" style={{
              marginBottom: '15px',
              padding: '10px',
              backgroundColor: '#2a2a2a',
              borderRadius: '4px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start'
            }}>
              <div className="news-content" style={{ flex: 1 }}>
                <div className="news-timestamp" style={{
                  fontSize: '12px',
                  color: '#888',
                  marginBottom: '5px'
                }}>{news.timestamp}</div>
                <div className="news-text" style={{
                  fontSize: '14px',
                  lineHeight: '1.4'
                }}>{news.summary}</div>
              </div>
              <button
                className="delete-news-button"
                onClick={() => handleDelete(news.uuid, news.summary)}
                style={{
                  marginLeft: '10px',
                  padding: '4px 8px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                Delete
              </button>
            </div>
          ))
        ) : (
          <p style={{ textAlign: 'center', color: '#888' }}>沒有保存的新聞</p>
        )}
      </div>

      {showConfirm && (
        <div className="modal" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div className="modal-content" style={{
            backgroundColor: '#1e1e1e',
            padding: '20px',
            borderRadius: '8px',
            maxWidth: '500px',
            width: '90%',
            border: '1px solid #333'
          }}>
            <h4 style={{ margin: '0 0 15px 0' }}>Delete Confirmation</h4>
            <p>Are you sure you want to delete this news article?</p>
            <p style={{ 
              fontWeight: 'bold', 
              margin: '10px 0', 
              fontSize: '14px',
              padding: '10px',
              backgroundColor: '#2a2a2a',
              borderRadius: '4px'
            }}>{selectedNewsSummary}</p>
            <input
              type="password"
              placeholder="Enter password to delete..."
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              style={{
                width: 'calc(100% - 16px)',
                marginBottom: '20px',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #444',
                backgroundColor: '#2a2a2a',
                color: '#EBEBEB',
                fontSize: '14px',
                fontFamily: 'Arial, sans-serif',
              }}
            />
            <div style={{ 
              display: 'flex', 
              justifyContent: 'flex-end', 
              gap: '10px', 
              marginTop: '20px' 
            }}>
              <button 
                onClick={() => setShowConfirm(false)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#4a4a4a',
                  border: 'none',
                  borderRadius: '4px',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete} 
                disabled={!deletePassword.trim()}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#dc3545',
                  border: 'none',
                  borderRadius: '4px',
                  color: 'white',
                  cursor: deletePassword.trim() ? 'pointer' : 'not-allowed',
                  opacity: deletePassword.trim() ? 1 : 0.7,
                  fontSize: '14px'
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 