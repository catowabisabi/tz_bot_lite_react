import devPreview from './devPreview';

if (import.meta.env.DEV) {
  devPreview(<Card ...props />);
}