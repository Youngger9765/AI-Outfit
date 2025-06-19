import Link from 'next/link';
import { User as LucideUser, LogOut, Home } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface HeaderProps {
  active: 'home' | 'closet';
}

export default function Header({ active }: HeaderProps) {
  const { user } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/auth');
    } catch (error) {
      console.error('登出失敗:', error);
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* 左側：Logo 和導航 */}
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2 text-xl font-bold text-gray-900">
              <span>👗</span>
              <span>AI Outfit</span>
            </Link>
            <nav className="hidden md:flex space-x-6">
              <Link
                href="/"
                className={`flex items-center space-x-1 ${active === 'home' ? 'text-blue-600 font-medium' : 'text-gray-600 hover:text-gray-900'}`}
              >
                <Home size={16} />
                <span>首頁</span>
              </Link>
              <Link
                href="/closet"
                className={`flex items-center space-x-1 ${active === 'closet' ? 'text-blue-600 font-medium' : 'text-gray-600 hover:text-gray-900'}`}
              >
                <span>衣櫥</span>
              </Link>
            </nav>
          </div>

          {/* 右側：用戶資訊和登出 */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <LucideUser size={16} />
                  <span>{user.email}</span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-1 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <LogOut size={16} />
                  <span>登出</span>
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
    </header>
  );
} 