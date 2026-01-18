import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, RefreshCw, Package, ShoppingCart } from 'lucide-react';
import { BottomNav } from './BottomNav';
import { Link, useNavigate, useLocation } from 'react-router-dom';

export function MainLayout({ children }: { children: React.ReactNode }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/products" className="flex items-center gap-3">
              <img src="/lp_logo.png" alt="Lucy's Perfumery" className="h-10 w-10 rounded-md" />
              <span className="font-semibold text-lg hidden sm:inline">Admin Panel</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              <Link to="/products">
                <Button
                  variant={location.pathname === '/products' ? 'default' : 'ghost'}
                  size="sm"
                  className="gap-2"
                >
                  <Package className="w-4 h-4" />
                  Products
                </Button>
              </Link>
              <Link to="/orders">
                <Button
                  variant={location.pathname === '/orders' ? 'default' : 'ghost'}
                  size="sm"
                  className="gap-2"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Orders
                </Button>
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleRefresh} title="Refresh app">
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline ml-2">Refresh</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
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
