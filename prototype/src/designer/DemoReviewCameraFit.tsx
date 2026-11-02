import { useEffect } from 'react';
import { useDesigner } from './store';

/** Fits the Hookoh demo phone frame inside the app canvas column (beside review panel). */
export function DemoReviewCameraFit() {
  const { fitAll } = useDesigner();
  useEffect(() => {
    const t = window.setTimeout(() => fitAll(), 120);
    return () => window.clearTimeout(t);
  }, [fitAll]);
  return null;
}
