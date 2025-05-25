
import { useState } from 'react';
import MobileSimulator from '../components/MobileSimulator';
import GrafanaWebView from '../components/GrafanaWebView';

const Index = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* 좌측 모바일 시뮬레이터 */}
      <div className="flex-none w-[480px] min-w-[360px] bg-slate-100 flex items-center justify-center p-8">
        <MobileSimulator />
      </div>
      
      {/* 우측 Grafana 웹뷰 */}
      <div className="flex-1 bg-slate-900">
        <GrafanaWebView />
      </div>
    </div>
  );
};

export default Index;
