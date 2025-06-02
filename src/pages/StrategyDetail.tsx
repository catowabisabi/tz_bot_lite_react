import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Container, CircularProgress, Alert } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

interface StrategyDetailData {
  名稱: string;
  說明: string;
  簡介?: string;
  大機會出現時間?: string;
  為什麼會出現?: string;
  心理原因?: string;
  圖表型態?: string;
  參數說明?: string;
  止損設定?: string;
  理想風險報酬比?: string;
  不應進場條件?: string;
}

// 修正後的圖片路徑生成函數
const getFriendlyFilename = (name: string) => {
  return name
    .trim() // 去除前後空格
    .replace(/\s+/g, '_') // 空格替換為下劃線
    .replace(/[^\w\u4e00-\u9fff]/g, '') // 保留中文字符、英文字母、數字和下劃線
    .toLowerCase();
};

// 嘗試多個可能的圖片路徑
const getImagePaths = (strategyName: string) => {
  const friendlyName = getFriendlyFilename(strategyName);
  
  return [
    // React public 資料夾的正確路徑（不包含 /public）
    `/assets/strategies/${friendlyName}.png`,
    `/assets/strategies/${friendlyName}.jpg`,
    `/assets/strategies/${friendlyName}.jpeg`,
    // 嘗試原始名稱
    `/assets/strategies/${encodeURIComponent(strategyName)}.png`,
    // 嘗試不轉換大小寫
    `/assets/strategies/${strategyName.replace(/\s+/g, '_')}.png`,
    // 最終的後備圖片
    `/assets/strategies/strategy_none.png`
  ];
};

export const StrategyDetail: React.FC = () => {
  const { strategyName } = useParams<{ strategyName: string }>();
  const navigate = useNavigate();
  
  const [strategy, setStrategy] = useState<StrategyDetailData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [imagePaths, setImagePaths] = useState<string[]>([]);

  useEffect(() => {
    if (!strategyName) {
      setError('Strategy name is missing from URL.');
      setLoading(false);
      return;
    }

    const fetchStrategyDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`https://fastapi.enomars.org/api/strategy/${encodeURIComponent(strategyName)}`);
        if (!response.ok) {
          if (response.status === 404) {
            setError('Strategy not found.');
          } else {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          setStrategy(null);
        } else {
          const json = await response.json();
          if (json.status === 'success' && json.data && json.data.strategy) {
            const data: StrategyDetailData = json.data.strategy;
            setStrategy(data);
            
            // 設置圖片路徑列表
            const paths = getImagePaths(data.名稱);
            setImagePaths(paths);
            setCurrentImageIndex(0);
            
            //console.log('[StrategyDetail] Strategy name:', data.名稱);
            //console.log('[StrategyDetail] Generated image paths:', paths);
          } else {
            console.error('Unexpected API response structure:', json);
            setError('Failed to parse strategy details from API response.');
            setStrategy(null);
          }
        }
      } catch (err) {
        console.error(`Error fetching strategy ${strategyName}:`, err);
        setError(err instanceof Error ? err.message : 'Failed to fetch strategy details.');
        setStrategy(null);
      } finally {
        setLoading(false);
      }
    };

    fetchStrategyDetail();
  }, [strategyName]);

  const handleImageError = () => {
    //(`[StrategyDetail] Image failed to load: ${imagePaths[currentImageIndex]}`);
    
    // 嘗試下一個圖片路徑
    if (currentImageIndex < imagePaths.length - 1) {
      //console.log(`[StrategyDetail] Trying next image path: ${imagePaths[currentImageIndex + 1]}`);
      setCurrentImageIndex(prev => prev + 1);
    } else {
      //console.log('[StrategyDetail] All image paths failed, showing placeholder');
    }
  };

  const handleBack = () => {
    navigate('/?tab=2');
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error && !strategy) {
    return (
      <Container>
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Button 
            onClick={handleBack}
            startIcon={<ArrowBackIcon />}
            sx={{ mb: 2 }}
          >
            Back to Strategies
          </Button>
          <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
        </Box>
      </Container>
    );
  }
  
  if (!strategy) {
    return (
      <Container>
        <Box sx={{ py: 4 , textAlign: 'center'}}>
          <Button 
            onClick={handleBack}
            startIcon={<ArrowBackIcon />}
            sx={{ mb: 2 }}
          >
            Back to Strategies
          </Button>
          <Typography variant="h5" color="error" sx={{ mt: 2 }}>
            Strategy details could not be loaded or strategy not found.
          </Typography>
        </Box>
      </Container>
    );
  }

  // 獲取當前要顯示的圖片路徑
  const currentImagePath = imagePaths[currentImageIndex] || '/assets/strategies/strategy_none.png';
  const isLastImage = currentImageIndex >= imagePaths.length - 1;

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        <Button 
          onClick={handleBack}
          startIcon={<ArrowBackIcon />}
          sx={{ mb: 3 }}
        >
          Back to Strategies
        </Button>
        
        <Typography variant="h4" sx={{ mb: 3 }}>
          {strategy.名稱}
        </Typography>

        {error && !loading && (
           strategy && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>
        )}

        <Box className="s-card-container">
          <Box className="s-card image-card" sx={{
            backgroundColor: 'background.paper',
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            overflow: 'hidden', 
            p: 0,
            minHeight: '300px', // 確保容器有最小高度
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {imagePaths.length > 0 ? (
              <img
                key={`${currentImagePath}-${currentImageIndex}`} // 使用索引作為 key 確保重新渲染
                src={currentImagePath}
                onError={handleImageError}
                onLoad={() => console.log(`[StrategyDetail] Image loaded successfully: ${currentImagePath}`)}
                alt={strategy.名稱}
                style={{
                  width: '100%',
                  height: 'auto',
                  objectFit: 'contain',
                  display: 'block',
                  padding: isLastImage ? '20px' : '0', // 只有在顯示後備圖片時才加 padding
                }}
              />
            ) : (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography color="text.secondary">
                  無法載入策略圖片
                </Typography>
              </Box>
            )}
          </Box>

          

          {[
            { title: "說明", key: "說明" },
            { title: "簡介", key: "簡介" },
            { title: "大機會出現時間", key: "大機會出現時間" },
            { title: "為什麼會出現", key: "為什麼會出現" },
            { title: "心理原因", key: "心理原因" },
            { title: "圖表型態", key: "圖表型態" },
            { title: "參數說明", key: "參數說明" },
            { title: "止損設定", key: "止損設定" },
            { title: "理想風險報酬比", key: "理想風險報酬比" },
            { title: "不應進場條件", key: "不應進場條件" }
          ].map(({ title, key }) => (
            strategy[key as keyof StrategyDetailData] && (
              <Box
                key={key}
                className="s-card"
                sx={{
                  backgroundColor: 'background.paper',
                  p: 3,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider'
                }}
              >
                <Typography variant="h6" className="card-title">
                  {title}
                </Typography>
                <Typography className="card-text">
                  {strategy[key as keyof StrategyDetailData]}
                </Typography>
              </Box>
            )
          ))}
        </Box>
      </Box>
    </Container>
  );
};