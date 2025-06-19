'use client'

import TravelOutfitCore from './TravelOutfitCore';
import { useAuth } from '@/lib/AuthContext';
import Link from 'next/link';
import { User, LogOut, Package } from 'lucide-react';

export default function Page() {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* 導航欄 */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">AI Outfit</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <Link
                    href="/closet"
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                  >
                    <Package className="w-4 h-4 mr-2" />
                    我的衣櫥
                  </Link>
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700">{user.email}</span>
                  </div>
                  <button
                    onClick={signOut}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    登出
                  </button>
                </>
              ) : (
                <Link
                  href="/auth"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  登入
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* 主要內容 */}
      <TravelOutfitCore />
    </div>
  );
}