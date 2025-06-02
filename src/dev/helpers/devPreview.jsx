// devPreview.jsx

// This is to preview the component in the browser
import { createRoot } from 'react-dom/client';

export default function devPreview(component) {
  const root = document.createElement('div');
  root.id = 'root';
  document.body.appendChild(root);

  const rootEl = createRoot(document.getElementById('root'));
  rootEl.render(component);
}