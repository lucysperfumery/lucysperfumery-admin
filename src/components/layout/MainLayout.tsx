import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { BottomNav } from './BottomNav';
import { Link, useNavigate } from 'react-router-dom';

export function MainLayout({ children }: { children: React.ReactNode }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/products" className="flex items-center gap-3">
            <img src="/lp_logo.png" alt="Lucy's Perfumery" className="h-10 w-10 rounded-md" />
            <span className="font-semibold text-lg hidden sm:inline">Admin Panel</span>
          </Link>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 pb-24 md:pb-6">
        {children}
      </main>

      {/* Bottom Navigation (Mobile) */}
      <BottomNav />
    </div>
  );
}
