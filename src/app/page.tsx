'use client'

import Header from '@/components/Header';
import TravelOutfitCore from './TravelOutfitCore';

export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <Header active="home" />
      {/* 主要內容 */}
      <TravelOutfitCore />
    </div>
  );
}