import { Link, useLocation } from 'react-router-dom';
import { Package, ShoppingBag } from 'lucide-react';

export function BottomNav() {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 md:hidden z-50">
      <div className="grid grid-cols-2 h-16">
        <Link
          to="/products"
          className={`flex flex-col items-center justify-center gap-1 ${
            isActive('/products')
              ? 'text-primary'
              : 'text-neutral-600 dark:text-neutral-400'
          }`}
        >
          <Package className="w-5 h-5" />
          <span className="text-xs font-medium">Products</span>
        </Link>
        <Link
          to="/orders"
          className={`flex flex-col items-center justify-center gap-1 ${
            isActive('/orders')
              ? 'text-primary'
              : 'text-neutral-600 dark:text-neutral-400'
          }`}
        >
          <ShoppingBag className="w-5 h-5" />
          <span className="text-xs font-medium">Orders</span>
        </Link>
      </div>
    </nav>
  );
}
