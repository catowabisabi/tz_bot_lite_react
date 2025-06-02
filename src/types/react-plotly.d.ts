declare module 'react-plotly.js' {
  import React from 'react';
  
  interface PlotData {
    x: (string | number)[];
    y: (string | number)[];
    text?: (string | number)[];
    textposition?: string;
    type?: string;
    mode?: string;
    marker?: {
      color?: string | string[];
      size?: number;
    };
    line?: {
      color?: string;
      width?: number;
      dash?: string;
    };
    name?: string;
    opacity?: number;
    showlegend?: boolean;
  }

  interface PlotLayout {
    title?: string | { text: string };
    xaxis?: { title?: string; range?: number[] };
    yaxis?: { title?: string; range?: number[] };
    template?: string;
    height?: number;
    legend?: {
      orientation?: string;
      yanchor?: string;
      y?: number;
      xanchor?: string;
      x?: number;
    };
  }

  interface PlotParams {
    data: PlotData[];
    layout?: Partial<PlotLayout>;
    style?: React.CSSProperties;
  }

  class Plot extends React.Component<PlotParams> {}
  export default Plot;
} 