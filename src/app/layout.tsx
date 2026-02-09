'use client';

import './globals.css';
import { useIVIScale } from '@/hooks/useIVIScale';
import { IVI_RESOLUTION } from '@/constants/config';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { scale } = useIVIScale();

  return (
    <html lang="ko">
      <head>
        <title>B2H Control — Tesla Model 3 IVI</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <div
          style={{
            width: IVI_RESOLUTION.width,
            height: IVI_RESOLUTION.height,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            overflow: 'hidden',
            background: '#0a0e14',
          }}
        >
          {children}
        </div>
      </body>
    </html>
  );
}
