'use client';

import { useState, useEffect, useCallback } from 'react';
import { IVI_RESOLUTION } from '@/constants/config';

export function useIVIScale() {
  const [scale, setScale] = useState(1);

  const calculateScale = useCallback(() => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const scaleX = vw / IVI_RESOLUTION.width;
    const scaleY = vh / IVI_RESOLUTION.height;
    return Math.min(scaleX, scaleY);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setScale(calculateScale());
    };

    // 초기 계산
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [calculateScale]);

  return { scale };
}
