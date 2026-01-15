import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AppLayout } from '@/components/layout'
import { LoadingScreen } from '@/components/ui'
import { ProtectedRoute, RoleProtectedRoute } from '@/components/auth'
import { onAuthChange } from '@/services/firebase/auth'
import { useAuthStore } from '@/store/authStore'

// Lazy load pages
const Home = lazy(() => import('@/pages/home/Home'))
const Login = lazy(() => import('@/pages/auth/Login'))
const OTPVerification = lazy(() => import('@/pages/auth/OTPVerification'))
const Register = lazy(() => import('@/pages/auth/Register'))
const Welcome = lazy(() => import('@/pages/auth/Welcome'))
const Unauthorized = lazy(() => import('@/pages/auth/Unauthorized'))

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

// Pharmacy
const PharmacyHome = lazy(() => import('@/pages/pharmacy/PharmacyHome'))

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
const EditProfile = lazy(() => import('@/pages/account/EditProfile'))
const PaymentMethods = lazy(() => import('@/pages/account/PaymentMethods'))
const AccountNotifications = lazy(() => import('@/pages/account/AccountNotifications'))
const PrivacySecurity = lazy(() => import('@/pages/account/PrivacySecurity'))
const RateApp = lazy(() => import('@/pages/account/RateApp'))
const ShareApp = lazy(() => import('@/pages/account/ShareApp'))

// Driver Portal
const DriverDashboard = lazy(() => import('@/pages/driver/DriverDashboard'))
const DriverEarnings = lazy(() => import('@/pages/driver/DriverEarnings'))
const DriverRegistration = lazy(() => import('@/pages/driver/DriverRegistration'))
const DriverActiveRide = lazy(() => import('@/pages/driver/DriverActiveRide'))
const DriverActiveDelivery = lazy(() => import('@/pages/driver/DriverActiveDelivery'))
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
const SeedData = lazy(() => import('@/pages/admin/SeedData'))

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
              <Route path="/unauthorized" element={<Unauthorized />} />

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
                <Route path="/pharmacy" element={<PharmacyHome />} />
                <Route path="/pharmacy/store/:id" element={<StoreDetail />} />

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
                <Route
                  path="/account/edit"
                  element={
                    <ProtectedRoute>
                      <EditProfile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/account/payment"
                  element={
                    <ProtectedRoute>
                      <PaymentMethods />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/account/notifications"
                  element={
                    <ProtectedRoute>
                      <AccountNotifications />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/account/privacy"
                  element={
                    <ProtectedRoute>
                      <PrivacySecurity />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/rate"
                  element={
                    <ProtectedRoute>
                      <RateApp />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/share"
                  element={
                    <ProtectedRoute>
                      <ShareApp />
                    </ProtectedRoute>
                  }
                />
                <Route path="/help" element={<HelpCenter />} />
              </Route>

              {/* Driver Portal Routes (no bottom nav layout) */}
              {/* Registration is accessible to any authenticated user who wants to become a driver */}
              <Route
                path="/driver/register"
                element={
                  <ProtectedRoute>
                    <DriverRegistration />
                  </ProtectedRoute>
                }
              />
              {/* All other driver routes require driver or admin role */}
              <Route
                path="/driver"
                element={
                  <RoleProtectedRoute allowedRoles={['driver', 'admin']}>
                    <DriverDashboard />
                  </RoleProtectedRoute>
                }
              />
              <Route
                path="/driver/earnings"
                element={
                  <RoleProtectedRoute allowedRoles={['driver', 'admin']}>
                    <DriverEarnings />
                  </RoleProtectedRoute>
                }
              />
              <Route
                path="/driver/active"
                element={
                  <RoleProtectedRoute allowedRoles={['driver', 'admin']}>
                    <DriverActiveRide />
                  </RoleProtectedRoute>
                }
              />
              <Route
                path="/driver/delivery"
                element={
                  <RoleProtectedRoute allowedRoles={['driver', 'admin']}>
                    <DriverActiveDelivery />
                  </RoleProtectedRoute>
                }
              />
              <Route
                path="/driver/history"
                element={
                  <RoleProtectedRoute allowedRoles={['driver', 'admin']}>
                    <DriverHistory />
                  </RoleProtectedRoute>
                }
              />
              <Route
                path="/driver/profile"
                element={
                  <RoleProtectedRoute allowedRoles={['driver', 'admin']}>
                    <DriverProfile />
                  </RoleProtectedRoute>
                }
              />
              <Route
                path="/driver/stats"
                element={
                  <RoleProtectedRoute allowedRoles={['driver', 'admin']}>
                    <DriverStats />
                  </RoleProtectedRoute>
                }
              />

              {/* Merchant Portal Routes (no bottom nav layout) */}
              {/* Registration is accessible to any authenticated user who wants to become a merchant */}
              <Route
                path="/merchant/register"
                element={
                  <ProtectedRoute>
                    <MerchantRegistration />
                  </ProtectedRoute>
                }
              />
              {/* All other merchant routes require merchant or admin role */}
              <Route
                path="/merchant"
                element={
                  <RoleProtectedRoute allowedRoles={['merchant', 'admin']}>
                    <MerchantDashboard />
                  </RoleProtectedRoute>
                }
              />
              <Route
                path="/merchant/orders"
                element={
                  <RoleProtectedRoute allowedRoles={['merchant', 'admin']}>
                    <MerchantOrders />
                  </RoleProtectedRoute>
                }
              />
              <Route
                path="/merchant/menu"
                element={
                  <RoleProtectedRoute allowedRoles={['merchant', 'admin']}>
                    <MerchantMenu />
                  </RoleProtectedRoute>
                }
              />
              <Route
                path="/merchant/settings"
                element={
                  <RoleProtectedRoute allowedRoles={['merchant', 'admin']}>
                    <MerchantSettings />
                  </RoleProtectedRoute>
                }
              />
              <Route
                path="/merchant/earnings"
                element={
                  <RoleProtectedRoute allowedRoles={['merchant', 'admin']}>
                    <MerchantEarnings />
                  </RoleProtectedRoute>
                }
              />
              <Route
                path="/merchant/analytics"
                element={
                  <RoleProtectedRoute allowedRoles={['merchant', 'admin']}>
                    <MerchantAnalytics />
                  </RoleProtectedRoute>
                }
              />

              {/* Admin Portal Routes - admin role only */}
              <Route
                path="/admin"
                element={
                  <RoleProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </RoleProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <RoleProtectedRoute allowedRoles={['admin']}>
                    <AdminUsers />
                  </RoleProtectedRoute>
                }
              />
              <Route
                path="/admin/analytics"
                element={
                  <RoleProtectedRoute allowedRoles={['admin']}>
                    <AdminAnalytics />
                  </RoleProtectedRoute>
                }
              />
              <Route
                path="/admin/drivers"
                element={
                  <RoleProtectedRoute allowedRoles={['admin']}>
                    <AdminDrivers />
                  </RoleProtectedRoute>
                }
              />
              <Route
                path="/admin/merchants"
                element={
                  <RoleProtectedRoute allowedRoles={['admin']}>
                    <AdminMerchants />
                  </RoleProtectedRoute>
                }
              />
              <Route
                path="/admin/approvals"
                element={
                  <RoleProtectedRoute allowedRoles={['admin']}>
                    <AdminApprovals />
                  </RoleProtectedRoute>
                }
              />
              <Route
                path="/admin/orders"
                element={
                  <RoleProtectedRoute allowedRoles={['admin']}>
                    <AdminOrders />
                  </RoleProtectedRoute>
                }
              />
              <Route
                path="/admin/seed"
                element={
                  <RoleProtectedRoute allowedRoles={['admin']}>
                    <SeedData />
                  </RoleProtectedRoute>
                }
              />

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
