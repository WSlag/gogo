import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AppLayout } from '@/components/layout'
import { LoadingScreen } from '@/components/ui'
import { ProtectedRoute } from '@/components/auth'
import { onAuthChange } from '@/services/firebase/auth'
import { useAuthStore } from '@/store/authStore'

// Lazy load pages
const Home = lazy(() => import('@/pages/home/Home'))
const Login = lazy(() => import('@/pages/auth/Login'))
const OTPVerification = lazy(() => import('@/pages/auth/OTPVerification'))
const Register = lazy(() => import('@/pages/auth/Register'))
const Welcome = lazy(() => import('@/pages/auth/Welcome'))

// Legal
const Terms = lazy(() => import('@/pages/legal/Terms'))
const Privacy = lazy(() => import('@/pages/legal/Privacy'))

// Rides
const RideHome = lazy(() => import('@/pages/rides/RideHome'))
const LocationPicker = lazy(() => import('@/pages/rides/LocationPicker'))
const BookRide = lazy(() => import('@/pages/rides/BookRide'))
const RideTracking = lazy(() => import('@/pages/rides/RideTracking'))
const RideHistory = lazy(() => import('@/pages/rides/RideHistory'))

// Food
const FoodHome = lazy(() => import('@/pages/food/FoodHome'))
const RestaurantDetail = lazy(() => import('@/pages/food/RestaurantDetail'))
const Cart = lazy(() => import('@/pages/food/Cart'))
const Checkout = lazy(() => import('@/pages/food/Checkout'))

// Grocery
const GroceryHome = lazy(() => import('@/pages/grocery/GroceryHome'))
const StoreDetail = lazy(() => import('@/pages/grocery/StoreDetail'))

// Orders
const OrderList = lazy(() => import('@/pages/orders/OrderList'))
const OrderDetail = lazy(() => import('@/pages/orders/OrderDetail'))

// Wallet
const Wallet = lazy(() => import('@/pages/wallet/Wallet'))
const TopUp = lazy(() => import('@/pages/wallet/TopUp'))
const Transactions = lazy(() => import('@/pages/wallet/Transactions'))

// Account
const Profile = lazy(() => import('@/pages/account/Profile'))
const Settings = lazy(() => import('@/pages/account/Settings'))
const Addresses = lazy(() => import('@/pages/account/Addresses'))
const Support = lazy(() => import('@/pages/account/Support'))
const HelpCenter = lazy(() => import('@/pages/account/HelpCenter'))

// Driver Portal
const DriverDashboard = lazy(() => import('@/pages/driver/DriverDashboard'))
const DriverEarnings = lazy(() => import('@/pages/driver/DriverEarnings'))
const DriverRegistration = lazy(() => import('@/pages/driver/DriverRegistration'))
const DriverActiveRide = lazy(() => import('@/pages/driver/DriverActiveRide'))
const DriverHistory = lazy(() => import('@/pages/driver/DriverHistory'))

// Merchant Portal
const MerchantDashboard = lazy(() => import('@/pages/merchant/MerchantDashboard'))
const MerchantRegistration = lazy(() => import('@/pages/merchant/MerchantRegistration'))
const MerchantOrders = lazy(() => import('@/pages/merchant/MerchantOrders'))
const MerchantMenu = lazy(() => import('@/pages/merchant/MerchantMenu'))

// Admin Portal
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'))
const AdminUsers = lazy(() => import('@/pages/admin/AdminUsers'))
const AdminAnalytics = lazy(() => import('@/pages/admin/AdminAnalytics'))
const AdminDrivers = lazy(() => import('@/pages/admin/AdminDrivers'))
const AdminMerchants = lazy(() => import('@/pages/admin/AdminMerchants'))
const AdminApprovals = lazy(() => import('@/pages/admin/AdminApprovals'))
const AdminOrders = lazy(() => import('@/pages/admin/AdminOrders'))

// Driver Portal - Additional Pages
const DriverProfile = lazy(() => import('@/pages/driver/DriverProfile'))
const DriverStats = lazy(() => import('@/pages/driver/DriverStats'))

// Merchant Portal - Additional Pages
const MerchantSettings = lazy(() => import('@/pages/merchant/MerchantSettings'))
const MerchantEarnings = lazy(() => import('@/pages/merchant/MerchantEarnings'))
const MerchantAnalytics = lazy(() => import('@/pages/merchant/MerchantAnalytics'))

// Notifications
const Notifications = lazy(() => import('@/pages/notifications/Notifications'))

// Promos & Referral
const Promos = lazy(() => import('@/pages/promos/Promos'))
const Referral = lazy(() => import('@/pages/referral/Referral'))

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
})

// Auth listener component
function AuthListener({ children }: { children: React.ReactNode }) {
  const { setUser, setLoading } = useAuthStore()

  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      setUser(user)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [setUser, setLoading])

  return <>{children}</>
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthListener>
          <Suspense fallback={<LoadingScreen />}>
            <Routes>
              {/* Auth Routes (no layout, no protection) */}
              <Route path="/welcome" element={<Welcome />} />
              <Route path="/auth/login" element={<Login />} />
              <Route path="/auth/otp" element={<OTPVerification />} />
              <Route path="/auth/register" element={<Register />} />

              {/* Legal Routes (no layout) */}
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />

              {/* Main App Routes (with layout) */}
              <Route element={<AppLayout />}>
                {/* Public routes - users can browse without login */}
                <Route path="/" element={<Home />} />
                <Route path="/food" element={<FoodHome />} />
                <Route path="/food/restaurant/:id" element={<RestaurantDetail />} />
                <Route path="/grocery" element={<GroceryHome />} />
                <Route path="/grocery/store/:id" element={<StoreDetail />} />

                {/* Rides - browsable, auth required on booking action */}
                <Route path="/rides" element={<RideHome />} />
                <Route path="/rides/location" element={<LocationPicker />} />
                <Route path="/rides/book" element={<BookRide />} />
                <Route
                  path="/rides/tracking/:id"
                  element={
                    <ProtectedRoute requireProfile>
                      <RideTracking />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/rides/history"
                  element={
                    <ProtectedRoute>
                      <RideHistory />
                    </ProtectedRoute>
                  }
                />

                {/* Cart & Checkout - cart is browsable, checkout requires auth */}
                <Route path="/cart" element={<Cart />} />
                <Route
                  path="/checkout"
                  element={
                    <ProtectedRoute requireProfile>
                      <Checkout />
                    </ProtectedRoute>
                  }
                />

                {/* Orders */}
                <Route
                  path="/orders"
                  element={
                    <ProtectedRoute>
                      <OrderList />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/orders/:id"
                  element={
                    <ProtectedRoute>
                      <OrderDetail />
                    </ProtectedRoute>
                  }
                />

                {/* Wallet */}
                <Route
                  path="/wallet"
                  element={
                    <ProtectedRoute>
                      <Wallet />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/wallet/topup"
                  element={
                    <ProtectedRoute>
                      <TopUp />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/wallet/transactions"
                  element={
                    <ProtectedRoute>
                      <Transactions />
                    </ProtectedRoute>
                  }
                />

                {/* Account */}
                <Route
                  path="/account"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/account/settings"
                  element={
                    <ProtectedRoute>
                      <Settings />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/account/addresses"
                  element={
                    <ProtectedRoute>
                      <Addresses />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/account/support"
                  element={
                    <ProtectedRoute>
                      <Support />
                    </ProtectedRoute>
                  }
                />
                <Route path="/help" element={<HelpCenter />} />
              </Route>

              {/* Driver Portal Routes (no bottom nav layout) */}
              <Route path="/driver" element={<DriverDashboard />} />
              <Route path="/driver/register" element={<DriverRegistration />} />
              <Route path="/driver/earnings" element={<DriverEarnings />} />
              <Route path="/driver/active" element={<DriverActiveRide />} />
              <Route path="/driver/history" element={<DriverHistory />} />
              <Route path="/driver/profile" element={<DriverProfile />} />
              <Route path="/driver/stats" element={<DriverStats />} />

              {/* Merchant Portal Routes (no bottom nav layout) */}
              <Route path="/merchant" element={<MerchantDashboard />} />
              <Route path="/merchant/register" element={<MerchantRegistration />} />
              <Route path="/merchant/orders" element={<MerchantOrders />} />
              <Route path="/merchant/menu" element={<MerchantMenu />} />
              <Route path="/merchant/settings" element={<MerchantSettings />} />
              <Route path="/merchant/earnings" element={<MerchantEarnings />} />
              <Route path="/merchant/analytics" element={<MerchantAnalytics />} />

              {/* Admin Portal Routes */}
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/analytics" element={<AdminAnalytics />} />
              <Route path="/admin/drivers" element={<AdminDrivers />} />
              <Route path="/admin/merchants" element={<AdminMerchants />} />
              <Route path="/admin/approvals" element={<AdminApprovals />} />
              <Route path="/admin/orders" element={<AdminOrders />} />

              {/* Notifications */}
              <Route
                path="/notifications"
                element={
                  <ProtectedRoute>
                    <Notifications />
                  </ProtectedRoute>
                }
              />

              {/* Promos & Referral */}
              <Route path="/promos" element={<Promos />} />
              <Route
                path="/referral"
                element={
                  <ProtectedRoute>
                    <Referral />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Suspense>
        </AuthListener>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
