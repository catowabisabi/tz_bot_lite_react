// utils.js

// 安全取值
export function safeGet(obj, key, defaultValue = 'N/A') {
  if (!obj) return defaultValue;
  const val = obj[key];
  return val === undefined || val === null ? defaultValue : val;
}

// 安全轉浮點數
export function safeFloat(value, defaultValue = 0) {
  const num = parseFloat(value);
  return Number.isNaN(num) ? defaultValue : num;
}

// 製作蠟燭圖資料結構 (React/Plotly.js 版)
export function createCandleFigure(dataList) {
  // dataList: Array of objects with keys: datetime, open, high, low, close
  // 這裡轉成 Plotly 需要的格式
  const x = dataList.map(item => item.datetime);
  const open = dataList.map(item => item.open);
  const high = dataList.map(item => item.high);
  const low = dataList.map(item => item.low);
  const close = dataList.map(item => item.close);

  return {
    data: [
      {
        x,
        open,
        high,
        low,
        close,
        type: 'candlestick',
        name: 'Price',
      }
    ],
    layout: {
      margin: { l: 20, r: 20, t: 40, b: 20 },
      xaxis: { rangeslider: { visible: false } },
      height: 400,
      template: 'plotly_white'
    }
  };
}

// 取得圖表資料，根據指定 key (預設 '1m_chart_data')
export function getChartData(dataDict, chartKey = '1m_chart_data') {
  const rawData = safeGet(dataDict, chartKey, []);
  return {
    timestamp: rawData.map(item => item.datetime),
    open: rawData.map(item => item.open),
    high: rawData.map(item => item.high),
    low: rawData.map(item => item.low),
    close: rawData.map(item => item.close),
    volume: rawData.map(item => item.volume),
  };
}

// JSON.stringify 的 replacer 模擬 Python JSONEncoder 的 datetime 和 ObjectId 轉換
// ObjectId 這邊用字串判斷，請根據實際用的 MongoDB lib 調整
export function jsonStringifyWithCustom(obj) {
  return JSON.stringify(obj, (key, value) => {
    // 假設 datetime 是 ISO 字串或 Date 物件
    if (value instanceof Date) {
      return value.toISOString();
    }
    // Mongo ObjectId 模擬（如果你的 ObjectId 有 toString 方法）
    if (value && typeof value === 'object' && typeof value.toString === 'function' && value._bsontype === 'ObjectID') {
      return value.toString();
    }
    return value;
  });
}
