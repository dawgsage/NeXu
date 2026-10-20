import { useState, useCallback, useEffect } from 'react';
import OfferFeed from '@/screens/OfferFeed';
import OfferDetails from '@/screens/OfferDetails';
import ActiveTrip from '@/screens/ActiveTrip';
import HistoryScreen from '@/screens/History';
import Profile from '@/screens/Profile';
import Login from '@/screens/Login';
import ShoppingList from '@/screens/ShoppingList';
import MerchantMenu from '@/screens/MerchantMenu';
import Landing, { type Role } from '@/screens/Landing';
import Onboarding from '@/screens/Onboarding';
import DriverDashboard from '@/screens/DriverDashboard';
import Earnings from '@/screens/Earnings';
import { fetchShoppingItems } from '@/lib/shopping';
import { LanguageProvider, useLang } from '@/lib/i18n';
import DriverBottomNav, { type DriverTab } from '@/components/DriverBottomNav';
import CustomerBottomNav, { type CustomerTab } from '@/components/CustomerBottomNav';
import Toast from '@/components/Toast';
import AdminApp from '@/admin/AdminApp';
import { type Order } from '@/lib/supabase';

type Screen =
  | 'onboarding' | 'landing' | 'login'
  | 'dashboard' | 'feed' | 'details' | 'trip' | 'history' | 'earnings' | 'profile'
  | 'shopping' | 'merchants'
  | 'customer-home' | 'customer-explore' | 'customer-cart' | 'customer-orders';

function AppInner() {
  const { t } = useLang();
  const [isAdmin, setIsAdmin] = useState(() => window.location.hash === '#/admin');

  useEffect(() => {
    const onHash = () => setIsAdmin(window.location.hash === '#/admin');
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const exitAdmin = useCallback(() => { window.location.hash = ''; setIsAdmin(false); }, []);

  const [screen, setScreen] = useState<Screen>('onboarding');
  const [role, setRole] = useState<Role>('rider');
  const [driverTab, setDriverTab] = useState<DriverTab>('dashboard');
  const [customerTab, setCustomerTab] = useState<CustomerTab>('home');
  const [cartCount, setCartCount] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [biometricEnabled, setBiometricEnabled] = useState(true);
  const [isOnline, setIsOnline] = useState(false);

  const handleSelectRole = useCallback((selectedRole: Role) => {
    if (selectedRole === 'admin' || selectedRole === 'developer') {
      window.location.hash = '#/admin';
      setIsAdmin(true);
      return;
    }
    setRole(selectedRole);
    setScreen('login');
  }, []);

  const handleUnlock = useCallback(() => {
    if (role === 'customer') {
      setScreen('customer-home');
      setCustomerTab('home');
    } else {
      setScreen('dashboard');
      setDriverTab('dashboard');
    }
  }, [role]);

  const handleSelectOrder = useCallback((order: Order) => {
    setSelectedOrder(order);
    setScreen('details');
  }, []);

  const handleAccepted = useCallback(async (order: Order) => {
    setActiveOrder(order);
    try {
      const items = await fetchShoppingItems(order.id);
      if (items.length > 0) {
        setScreen('shopping');
      } else {
        setScreen('trip');
      }
    } catch {
      setScreen('trip');
    }
  }, []);

  const handleDelivered = useCallback(() => {
    setToast(t('earningsAdded'));
    setActiveOrder(null);
    setSelectedOrder(null);
    setDriverTab('dashboard');
    setScreen('dashboard');
  }, [t]);

  const handleDriverTabChange = useCallback((newTab: DriverTab) => {
    setDriverTab(newTab);
    if (newTab === 'dashboard') setScreen('dashboard');
    else if (newTab === 'jobs') setScreen('feed');
    else if (newTab === 'earnings') setScreen('earnings');
    else if (newTab === 'profile') setScreen('profile');
  }, []);

  const handleCustomerTabChange = useCallback((newTab: CustomerTab) => {
    setCustomerTab(newTab);
    if (newTab === 'home') setScreen('customer-home');
    else if (newTab === 'explore') setScreen('merchants');
    else if (newTab === 'cart') setScreen('customer-cart');
    else if (newTab === 'orders') setScreen('history');
    else if (newTab === 'profile') setScreen('profile');
  }, []);

  if (isAdmin) {
    return <AdminApp onExit={exitAdmin} />;
  }

  const showDriverNav = screen === 'dashboard' || screen === 'feed' || screen === 'earnings' || screen === 'profile';
  const showCustomerNav = screen === 'customer-home' || screen === 'merchants' || screen === 'customer-cart' || screen === 'history' || screen === 'profile';

  if (screen === 'onboarding') {
    return <Onboarding onComplete={() => setScreen('landing')} />;
  }

  if (screen === 'landing') {
    return <Landing onSelectRole={handleSelectRole} />;
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-900">
      <div
        className="relative bg-[#F8F9FA] overflow-hidden shadow-2xl flex flex-col"
        style={{ width: '100%', maxWidth: '430px', height: '100dvh', maxHeight: '932px' }}
      >
        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          {screen === 'login' && <Login onUnlock={handleUnlock} />}

          {/* Driver screens */}
          {screen === 'dashboard' && (
            <DriverDashboard
              isOnline={isOnline}
              onToggleOnline={() => setIsOnline(v => !v)}
              onGoToJobs={() => { setDriverTab('jobs'); setScreen('feed'); }}
            />
          )}

          {screen === 'feed' && (
            <div className="flex flex-col h-full min-h-0">
              <div className="flex-1 overflow-hidden min-h-0">
                <OfferFeed onSelectOrder={handleSelectOrder} onOpenMerchants={() => setScreen('merchants')} />
              </div>
            </div>
          )}

          {screen === 'details' && selectedOrder && (
            <OfferDetails
              order={selectedOrder}
              onBack={() => { setScreen('feed'); setDriverTab('jobs'); }}
              onAccepted={handleAccepted}
            />
          )}

          {screen === 'shopping' && activeOrder && (
            <ShoppingList
              order={activeOrder}
              onBack={() => setScreen('trip')}
              onComplete={() => setScreen('trip')}
            />
          )}

          {screen === 'trip' && activeOrder && (
            <ActiveTrip order={activeOrder} onDelivered={handleDelivered} />
          )}

          {screen === 'earnings' && <Earnings />}

          {screen === 'history' && <HistoryScreen />}

          {screen === 'profile' && (
            <Profile
              biometricEnabled={biometricEnabled}
              onToggleBiometric={setBiometricEnabled}
            />
          )}

          {/* Customer screens */}
          {screen === 'customer-home' && (
            <MerchantMenu onBack={() => { setScreen('customer-home'); setCustomerTab('home'); }} />
          )}

          {screen === 'merchants' && (
            <MerchantMenu onBack={() => { setScreen('customer-home'); setCustomerTab('home'); }} />
          )}

          {screen === 'customer-cart' && (
            <div className="flex flex-col h-full bg-[#F8F9FA]">
              <div className="bg-white px-5 pt-12 pb-5 flex-shrink-0 border-b border-gray-100">
                <h1 className="text-[#2C3E50] text-2xl font-bold">Your Cart</h1>
                <p className="text-gray-400 text-sm mt-0.5">Review items before checkout</p>
              </div>
              <div className="flex-1 overflow-y-auto px-4 py-4">
                {cartCount === 0 ? (
                  <div className="flex flex-col items-center gap-3 py-16 text-center">
                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                      <span className="text-gray-300 text-2xl font-bold">0</span>
                    </div>
                    <p className="text-gray-500 font-medium">Your cart is empty</p>
                    <p className="text-gray-400 text-sm">Browse merchants to add items</p>
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">{cartCount} item(s) in cart</p>
                )}
              </div>
            </div>
          )}
        </div>

        {showDriverNav && role === 'rider' && (
          <DriverBottomNav active={driverTab} onChange={handleDriverTabChange} />
        )}
        {showCustomerNav && role === 'customer' && (
          <CustomerBottomNav active={customerTab} onChange={handleCustomerTabChange} cartCount={cartCount} />
        )}

        {toast && <Toast message={toast} onDone={() => setToast(null)} />}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppInner />
    </LanguageProvider>
  );
}
