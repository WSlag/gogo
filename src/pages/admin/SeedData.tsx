import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Database, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { Button, Card } from '@/components/ui'
import { seedDatabase, seedDataCounts, type SeedProgress } from '@/utils/seedData'

export default function SeedData() {
  const navigate = useNavigate()
  const [progress, setProgress] = useState<SeedProgress>({
    status: 'idle',
    message: '',
    progress: 0,
  })

  const handleSeed = async () => {
    try {
      await seedDatabase(setProgress)
    } catch (error) {
      console.error('Seed failed:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white shadow-sm">
        <div className="flex items-center gap-3 px-4 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-semibold">Seed Test Data</h1>
        </div>
      </header>

      <div className="p-4 space-y-4">
        {/* Info Card */}
        <Card>
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
              <Database className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Database Seeder</h2>
              <p className="mt-1 text-sm text-gray-500">
                This will populate your Firestore database with test data for development and testing purposes.
              </p>
            </div>
          </div>
        </Card>

        {/* Data Summary */}
        <Card>
          <h3 className="font-semibold text-gray-900 mb-3">Data to be seeded:</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900">{seedDataCounts.merchants}</p>
              <p className="text-sm text-gray-500">Merchants</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900">{seedDataCounts.products}</p>
              <p className="text-sm text-gray-500">Products</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900">{seedDataCounts.drivers}</p>
              <p className="text-sm text-gray-500">Drivers</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900">{seedDataCounts.promos}</p>
              <p className="text-sm text-gray-500">Promo Codes</p>
            </div>
          </div>
        </Card>

        {/* Restaurants Preview */}
        <Card>
          <h3 className="font-semibold text-gray-900 mb-3">Restaurants ({seedDataCounts.restaurants}):</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center text-xs">JB</span>
              <span>Jollibee - SM Mall of Asia</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center text-xs">MI</span>
              <span>Mang Inasal - Makati</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center text-xs">CK</span>
              <span>Chowking - BGC</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-xs">SB</span>
              <span>Starbucks - Ayala Triangle</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center text-xs">MD</span>
              <span>McDonald's - Greenbelt</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center text-xs">TT</span>
              <span>Tokyo Tokyo - SM Megamall</span>
            </div>
          </div>
        </Card>

        {/* Grocery Stores Preview */}
        <Card>
          <h3 className="font-semibold text-gray-900 mb-3">Grocery Stores ({seedDataCounts.groceryStores}):</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs">SM</span>
              <span>SM Supermarket - Cotabato</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center text-xs">PG</span>
              <span>Puregold - Cotabato</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-xs">RS</span>
              <span>Robinsons Supermarket</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-xs">MF</span>
              <span>Metro Fresh Market</span>
            </div>
          </div>
        </Card>

        {/* Pharmacy Stores Preview */}
        <Card>
          <h3 className="font-semibold text-gray-900 mb-3">Pharmacy Stores ({seedDataCounts.pharmacyStores}):</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center text-xs">MD</span>
              <span>Mercury Drug - Cotabato</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs">WS</span>
              <span>Watsons - SM City Cotabato</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 bg-pink-100 rounded-full flex items-center justify-center text-xs">RP</span>
              <span>Rose Pharmacy - Cotabato</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-xs">GD</span>
              <span>Generika Drugstore</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center text-xs">TG</span>
              <span>TGP (The Generics Pharmacy)</span>
            </div>
          </div>
        </Card>

        {/* Progress */}
        {progress.status !== 'idle' && (
          <Card>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                {progress.status === 'seeding' && (
                  <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
                )}
                {progress.status === 'success' && (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                )}
                {progress.status === 'error' && (
                  <AlertCircle className="h-5 w-5 text-red-600" />
                )}
                <span className={`font-medium ${
                  progress.status === 'success' ? 'text-green-600' :
                  progress.status === 'error' ? 'text-red-600' :
                  'text-gray-900'
                }`}>
                  {progress.status === 'seeding' ? 'Seeding...' :
                   progress.status === 'success' ? 'Complete!' :
                   'Error'}
                </span>
              </div>

              <p className="text-sm text-gray-600">{progress.message}</p>

              {progress.status === 'seeding' && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress.progress}%` }}
                  />
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Actions */}
        <div className="space-y-3">
          <Button
            fullWidth
            onClick={handleSeed}
            disabled={progress.status === 'seeding'}
          >
            {progress.status === 'seeding' ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Seeding Database...
              </>
            ) : progress.status === 'success' ? (
              'Seed Again'
            ) : (
              'Seed Database'
            )}
          </Button>

          {progress.status === 'success' && (
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={() => navigate('/food')}
              >
                View Food
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/grocery')}
              >
                View Grocery
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/pharmacy')}
              >
                View Pharmacy
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/merchant')}
              >
                Merchant
              </Button>
            </div>
          )}
        </div>

        {/* Instructions */}
        <Card>
          <h3 className="font-semibold text-gray-900 mb-2">Testing Instructions:</h3>
          <ol className="text-sm text-gray-600 space-y-2 list-decimal list-inside">
            <li>Click "Seed Database" to populate test data</li>
            <li>Go to <strong>Food</strong> page to see restaurants</li>
            <li>Go to <strong>Grocery</strong> page to see grocery stores</li>
            <li>Go to <strong>Pharmacy</strong> page to see pharmacy stores</li>
            <li>Select a store to see products with customization options</li>
            <li>Add items to cart and place an order</li>
            <li>Go to <strong>Merchant Dashboard</strong> to see incoming orders</li>
            <li>Accept or reject orders as the merchant</li>
          </ol>
        </Card>
      </div>
    </div>
  )
}
