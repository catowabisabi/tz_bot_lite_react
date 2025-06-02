import { colors } from './colors';

export const plotlyLayout = {
    height: 250,
    autosize: true,
    template: { layout: { colorway: ['#00ff00', '#ff0000'] } },
    plot_bgcolor: colors.background,
    paper_bgcolor: colors.background,
    font: {
      color: colors.text,
      family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    },
    margin: {
      l: 50,
      r: 50,
      t: 30,
      b: 30,
      pad: 4
    },
    showlegend: false,
    dragmode: false,
    hovermode: false,
    yaxis: {
      gridcolor: '#e0e0e0',
      zerolinecolor: '#333',
      showgrid: true,
      showline: true,
      linecolor: '#e0e0e0',
      linewidth: 1,
      tickfont: {
        color: colors.text
      },
      tickformat: '.2f'
    },
    xaxis: {
      gridcolor: '#e0e0e0',
      zerolinecolor: '#333',
      showgrid: true,
      showline: true,
      linecolor: '#e0e0e0',
      linewidth: 1,
      tickfont: {
        color: colors.text
      }
    }
} as const; 