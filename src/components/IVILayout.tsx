'use client';

import React, { useState } from 'react';
import DrivingView from './DrivingView';
import NavMapView from './NavMapView';
import B2HControlPanel from './b2h/B2HControlPanel';
import { ZONE_WIDTH, IVI_RESOLUTION, MOCK_STATIONS } from '@/constants/config';

export type B2HScreen = 'main' | 'charging-search' | 'journey-planner';

export default function IVILayout() {
  /* Zone B 화면 상태를 IVILayout에서 관리하여 Zone A/C와 연동 */
  const [currentScreen, setCurrentScreen] = useState<B2HScreen>('main');

  const isChargingSearch = currentScreen === 'charging-search';
  const isJourneyPlanner = currentScreen === 'journey-planner';
  const showRoute = isChargingSearch || isJourneyPlanner;

  return (
    <div
      className="flex"
      style={{
        width: IVI_RESOLUTION.width,
        height: IVI_RESOLUTION.height,
        background: '#0a0e14',
      }}
    >
      {/* Zone A — 드라이빙 뷰 */}
      <div style={{ width: ZONE_WIDTH.zoneA, height: IVI_RESOLUTION.height, flexShrink: 0 }}>
        <DrivingView
          isChargingSearch={isChargingSearch}
          isJourneyPlanner={isJourneyPlanner}
        />
      </div>

      {/* 구분선 A|B */}
      <div style={{ width: 1, height: IVI_RESOLUTION.height, background: '#1e2a38', flexShrink: 0 }} />

      {/* Zone B — B2H Control */}
      <div style={{ width: ZONE_WIDTH.zoneB, height: IVI_RESOLUTION.height, flexShrink: 0 }}>
        <B2HControlPanel
          currentScreen={currentScreen}
          onScreenChange={setCurrentScreen}
        />
      </div>

      {/* 구분선 B|C */}
      <div style={{ width: 1, height: IVI_RESOLUTION.height, background: '#1e2a38', flexShrink: 0 }} />

      {/* Zone C — 내비게이션 맵 */}
      <div style={{ width: ZONE_WIDTH.zoneC, height: IVI_RESOLUTION.height, flexShrink: 0 }}>
        <NavMapView
          showRoute={showRoute}
          stations={showRoute ? MOCK_STATIONS : undefined}
          isJourneyPlanner={isJourneyPlanner}
        />
      </div>
    </div>
  );
}
