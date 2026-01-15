// App configuration
// Toggle these settings for testing vs production

export const APP_CONFIG = {
  // Auth & Role Settings
  // PRODUCTION: These are set to false - admin approval required
  AUTO_APPROVE_DRIVERS: false,
  AUTO_APPROVE_MERCHANTS: false,

  // Document Verification
  // PRODUCTION: Document verification is required
  SKIP_DOCUMENT_VERIFICATION: false,

  // Default role for new users
  DEFAULT_ROLE: 'customer' as const,

  // Testing mode - enables additional logging and bypasses some checks
  // Only enabled in development environment
  IS_TESTING: import.meta.env.DEV,

  // PRODUCTION: Authentication is required
  SKIP_AUTH: false,

  // Test user IDs (only used when IS_TESTING is true)
  TEST_USER_ID: 'test-user-001',
  TEST_DRIVER_ID: 'test_driver_car_001', // Maria Santos - Toyota Vios

  // Available test driver IDs:
  // - test_driver_motorcycle_001 (Juan - Honda Click 125i)
  // - test_driver_car_001 (Maria - Toyota Vios)
  // - test_driver_taxi_001 (Pedro - Toyota Innova)
  // - test_driver_premium_001 (Carlo - Honda Accord)
  // - test_driver_van_001 (Roberto - Toyota HiAce)
}

// Role hierarchy for permission checks
export const ROLE_HIERARCHY = {
  admin: 4,
  merchant: 3,
  driver: 2,
  customer: 1,
} as const

// Check if a role has at least the required level
export function hasMinimumRole(userRole: string | null, requiredRole: keyof typeof ROLE_HIERARCHY): boolean {
  if (!userRole) return false
  const userLevel = ROLE_HIERARCHY[userRole as keyof typeof ROLE_HIERARCHY] || 0
  const requiredLevel = ROLE_HIERARCHY[requiredRole]
  return userLevel >= requiredLevel
}
