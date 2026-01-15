/**
 * Browser-based seed data utility for testing
 * Can be called from the admin panel or browser console
 */

import {
  setDocument,
  getDocuments,
  deleteDocument,
  collections,
  GeoPoint,
  Timestamp,
  where,
} from '@/services/firebase/firestore'

// Merchant seed data
const merchants = [
  {
    id: 'merchant-001',
    name: 'Jollibee - KCC Mall Cotabato',
    description: 'The most famous Filipino fast food chain',
    type: 'restaurant',
    category: 'Fast Food',
    cuisine: ['Filipino', 'Fast Food', 'Chicken'],
    address: 'KCC Mall of Cotabato, Cotabato City',
    coordinates: new GeoPoint(7.2236, 124.2464),
    phone: '+639171234567',
    email: 'jollibee.cotabato@example.com',
    rating: 4.5,
    reviewCount: 2500,
    priceRange: '₱',
    deliveryFee: 39,
    deliveryTime: '20-30 min',
    minOrder: 99,
    isOpen: true,
    isFeatured: true,
    verified: true,
    status: 'active',
    image: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=800',
    coverImage: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=1200',
    openingHours: {
      monday: { open: '06:00', close: '22:00' },
      tuesday: { open: '06:00', close: '22:00' },
      wednesday: { open: '06:00', close: '22:00' },
      thursday: { open: '06:00', close: '22:00' },
      friday: { open: '06:00', close: '23:00' },
      saturday: { open: '06:00', close: '23:00' },
      sunday: { open: '06:00', close: '22:00' },
    },
  },
  {
    id: 'merchant-002',
    name: 'Mang Inasal - Cotabato',
    description: 'Unlimited rice with grilled chicken',
    type: 'restaurant',
    category: 'Filipino',
    cuisine: ['Filipino', 'BBQ', 'Chicken'],
    address: 'Sinsuat Avenue, Cotabato City',
    coordinates: new GeoPoint(7.2200, 124.2450),
    phone: '+639181234567',
    email: 'manginasal.cotabato@example.com',
    rating: 4.3,
    reviewCount: 1800,
    priceRange: '₱',
    deliveryFee: 49,
    deliveryTime: '25-35 min',
    minOrder: 150,
    isOpen: true,
    isFeatured: true,
    verified: true,
    status: 'active',
    image: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=800',
    coverImage: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1200',
    openingHours: {
      monday: { open: '10:00', close: '21:00' },
      tuesday: { open: '10:00', close: '21:00' },
      wednesday: { open: '10:00', close: '21:00' },
      thursday: { open: '10:00', close: '21:00' },
      friday: { open: '10:00', close: '22:00' },
      saturday: { open: '10:00', close: '22:00' },
      sunday: { open: '10:00', close: '21:00' },
    },
  },
  {
    id: 'merchant-003',
    name: 'Chowking - Cotabato',
    description: 'Chinese-Filipino fast food favorites',
    type: 'restaurant',
    category: 'Chinese',
    cuisine: ['Chinese', 'Filipino', 'Dim Sum'],
    address: 'Makakua Street, Cotabato City',
    coordinates: new GeoPoint(7.2180, 124.2420),
    phone: '+639191234567',
    email: 'chowking.cotabato@example.com',
    rating: 4.2,
    reviewCount: 1200,
    priceRange: '₱',
    deliveryFee: 45,
    deliveryTime: '20-30 min',
    minOrder: 120,
    isOpen: true,
    isFeatured: false,
    verified: true,
    status: 'active',
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800',
    coverImage: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=1200',
    openingHours: {
      monday: { open: '09:00', close: '21:00' },
      tuesday: { open: '09:00', close: '21:00' },
      wednesday: { open: '09:00', close: '21:00' },
      thursday: { open: '09:00', close: '21:00' },
      friday: { open: '09:00', close: '22:00' },
      saturday: { open: '09:00', close: '22:00' },
      sunday: { open: '09:00', close: '21:00' },
    },
  },
  {
    id: 'merchant-004',
    name: 'Kape Kutawato',
    description: 'Local coffee shop serving Mindanao brews and pastries',
    type: 'restaurant',
    category: 'Coffee & Tea',
    cuisine: ['Coffee', 'Beverages', 'Pastries', 'Local'],
    address: 'Quezon Avenue, Cotabato City',
    coordinates: new GeoPoint(7.2150, 124.2500),
    phone: '+639201234567',
    email: 'kapekutawato@example.com',
    rating: 4.5,
    reviewCount: 580,
    priceRange: '₱₱',
    deliveryFee: 49,
    deliveryTime: '15-25 min',
    minOrder: 200,
    isOpen: true,
    isFeatured: true,
    verified: true,
    status: 'active',
    image: 'https://images.unsplash.com/photo-1453614512568-c4024d13c247?w=800',
    coverImage: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1200',
    openingHours: {
      monday: { open: '07:00', close: '21:00' },
      tuesday: { open: '07:00', close: '21:00' },
      wednesday: { open: '07:00', close: '21:00' },
      thursday: { open: '07:00', close: '21:00' },
      friday: { open: '07:00', close: '22:00' },
      saturday: { open: '08:00', close: '22:00' },
      sunday: { open: '08:00', close: '21:00' },
    },
  },
  {
    id: 'merchant-005',
    name: "McDonald's - Cotabato",
    description: 'World famous burgers and fries',
    type: 'restaurant',
    category: 'Fast Food',
    cuisine: ['Fast Food', 'Burgers', 'American'],
    address: 'Don Rufino Alonzo Street, Cotabato City',
    coordinates: new GeoPoint(7.2100, 124.2480),
    phone: '+639211234567',
    email: 'mcdo.cotabato@example.com',
    rating: 4.4,
    reviewCount: 2800,
    priceRange: '₱',
    deliveryFee: 0,
    deliveryTime: '15-25 min',
    minOrder: 100,
    isOpen: true,
    isFeatured: true,
    verified: true,
    status: 'active',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800',
    coverImage: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=1200',
    openingHours: {
      monday: { open: '06:00', close: '23:00' },
      tuesday: { open: '06:00', close: '23:00' },
      wednesday: { open: '06:00', close: '23:00' },
      thursday: { open: '06:00', close: '23:00' },
      friday: { open: '06:00', close: '00:00' },
      saturday: { open: '06:00', close: '00:00' },
      sunday: { open: '06:00', close: '23:00' },
    },
  },
  {
    id: 'merchant-006',
    name: 'Greenwich - KCC Mall Cotabato',
    description: 'Pizza, pasta, and Filipino favorites',
    type: 'restaurant',
    category: 'Pizza',
    cuisine: ['Pizza', 'Pasta', 'Filipino'],
    address: 'KCC Mall of Cotabato, Cotabato City',
    coordinates: new GeoPoint(7.2230, 124.2460),
    phone: '+639221234567',
    email: 'greenwich.cotabato@example.com',
    rating: 4.3,
    reviewCount: 980,
    priceRange: '₱₱',
    deliveryFee: 55,
    deliveryTime: '25-35 min',
    minOrder: 150,
    isOpen: true,
    isFeatured: false,
    verified: true,
    status: 'active',
    image: 'https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?w=800',
    coverImage: 'https://images.unsplash.com/photo-1580822184713-fc5400e7fe10?w=1200',
    openingHours: {
      monday: { open: '10:00', close: '21:00' },
      tuesday: { open: '10:00', close: '21:00' },
      wednesday: { open: '10:00', close: '21:00' },
      thursday: { open: '10:00', close: '21:00' },
      friday: { open: '10:00', close: '22:00' },
      saturday: { open: '10:00', close: '22:00' },
      sunday: { open: '10:00', close: '21:00' },
    },
  },
]

// Products seed data with options and addons
const products = [
  // Jollibee Products
  {
    id: 'product-001',
    merchantId: 'merchant-001',
    name: 'Chickenjoy 1pc with Rice',
    description: 'Crispylicious, juicylicious Chickenjoy with steamed rice and gravy',
    price: 99,
    originalPrice: 99,
    category: 'Chicken',
    image: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=400',
    isAvailable: true,
    isFeatured: true,
    preparationTime: 10,
    calories: 450,
    tags: ['bestseller', 'chicken'],
    options: [
      {
        name: 'Chicken Part',
        required: true,
        maxSelect: 1,
        choices: [
          { name: 'Thigh', price: 0 },
          { name: 'Leg', price: 0 },
          { name: 'Breast', price: 10 },
        ],
      },
      {
        name: 'Rice Size',
        required: true,
        maxSelect: 1,
        choices: [
          { name: 'Regular Rice', price: 0 },
          { name: 'Extra Rice', price: 15 },
        ],
      },
    ],
    addons: [
      { name: 'Extra Gravy', price: 15 },
      { name: 'Mashed Potato', price: 35 },
      { name: 'Coleslaw', price: 25 },
    ],
  },
  {
    id: 'product-002',
    merchantId: 'merchant-001',
    name: 'Chickenjoy 2pc with Rice',
    description: 'Double the crispylicious, juicylicious Chickenjoy with steamed rice',
    price: 175,
    originalPrice: 175,
    category: 'Chicken',
    image: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=400',
    isAvailable: true,
    isFeatured: true,
    preparationTime: 12,
    calories: 750,
    tags: ['bestseller', 'chicken', 'value'],
    options: [
      {
        name: 'Rice Size',
        required: true,
        maxSelect: 1,
        choices: [
          { name: 'Regular Rice', price: 0 },
          { name: 'Extra Rice', price: 15 },
        ],
      },
    ],
    addons: [
      { name: 'Extra Gravy', price: 15 },
      { name: 'Mashed Potato', price: 35 },
    ],
  },
  {
    id: 'product-003',
    merchantId: 'merchant-001',
    name: 'Jolly Spaghetti',
    description: 'Sweet-style spaghetti with hotdog, ground meat, and cheese',
    price: 65,
    originalPrice: 65,
    category: 'Pasta',
    image: 'https://images.unsplash.com/photo-1551892374-ecf8754cf8b0?w=400',
    isAvailable: true,
    isFeatured: true,
    preparationTime: 8,
    calories: 380,
    tags: ['pasta', 'kids-favorite'],
    options: [
      {
        name: 'Size',
        required: true,
        maxSelect: 1,
        choices: [
          { name: 'Regular', price: 0 },
          { name: 'Large', price: 30 },
        ],
      },
    ],
    addons: [
      { name: 'Extra Cheese', price: 15 },
      { name: 'Extra Hotdog', price: 20 },
    ],
  },
  {
    id: 'product-004',
    merchantId: 'merchant-001',
    name: 'Burger Steak 2pc',
    description: 'Beefy burger patties with mushroom gravy and rice',
    price: 115,
    originalPrice: 115,
    category: 'Rice Meals',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
    isAvailable: true,
    isFeatured: false,
    preparationTime: 12,
    calories: 520,
    tags: ['beef', 'rice-meal'],
    options: [],
    addons: [
      { name: 'Extra Rice', price: 15 },
      { name: 'Egg', price: 25 },
    ],
  },
  {
    id: 'product-005',
    merchantId: 'merchant-001',
    name: 'Yumburger',
    description: 'Classic beefy burger with special Jollibee dressing',
    price: 45,
    originalPrice: 45,
    category: 'Burgers',
    image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400',
    isAvailable: true,
    isFeatured: true,
    preparationTime: 5,
    calories: 280,
    tags: ['burger', 'value-meal'],
    options: [],
    addons: [
      { name: 'Cheese', price: 15 },
      { name: 'Bacon', price: 25 },
      { name: 'Egg', price: 20 },
    ],
  },
  {
    id: 'product-006',
    merchantId: 'merchant-001',
    name: 'Peach Mango Pie',
    description: 'Crispy pie filled with sweet peach and mango',
    price: 39,
    originalPrice: 39,
    category: 'Desserts',
    image: 'https://images.unsplash.com/photo-1519915028121-7d3463d20b13?w=400',
    isAvailable: true,
    isFeatured: false,
    preparationTime: 2,
    calories: 220,
    tags: ['dessert', 'pie'],
    options: [],
    addons: [],
  },

  // Mang Inasal Products
  {
    id: 'product-007',
    merchantId: 'merchant-002',
    name: 'Chicken Inasal Paa (Large)',
    description: 'Grilled chicken leg marinated in signature inasal sauce with unlimited rice',
    price: 175,
    originalPrice: 175,
    category: 'Chicken',
    image: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400',
    isAvailable: true,
    isFeatured: true,
    preparationTime: 15,
    calories: 550,
    tags: ['bestseller', 'grilled', 'unlimited-rice'],
    options: [
      {
        name: 'Spice Level',
        required: false,
        maxSelect: 1,
        choices: [
          { name: 'Regular', price: 0 },
          { name: 'Extra Spicy', price: 0 },
        ],
      },
    ],
    addons: [
      { name: 'Extra Chicken Oil', price: 10 },
      { name: 'Soup', price: 25 },
    ],
  },
  {
    id: 'product-008',
    merchantId: 'merchant-002',
    name: 'Chicken Inasal Pecho',
    description: 'Grilled chicken breast with unlimited rice',
    price: 165,
    originalPrice: 165,
    category: 'Chicken',
    image: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400',
    isAvailable: true,
    isFeatured: false,
    preparationTime: 15,
    calories: 480,
    tags: ['grilled', 'unlimited-rice'],
    options: [],
    addons: [
      { name: 'Extra Chicken Oil', price: 10 },
    ],
  },
  {
    id: 'product-009',
    merchantId: 'merchant-002',
    name: 'Pork BBQ (2 sticks)',
    description: 'Tender grilled pork skewers with rice',
    price: 125,
    originalPrice: 125,
    category: 'Pork',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400',
    isAvailable: true,
    isFeatured: true,
    preparationTime: 12,
    calories: 480,
    tags: ['pork', 'bbq', 'grilled'],
    options: [],
    addons: [
      { name: 'Extra Stick', price: 45 },
    ],
  },
  {
    id: 'product-010',
    merchantId: 'merchant-002',
    name: 'Halo-Halo',
    description: 'Filipino shaved ice dessert with sweet beans, jellies, and leche flan',
    price: 79,
    originalPrice: 79,
    category: 'Desserts',
    image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400',
    isAvailable: true,
    isFeatured: false,
    preparationTime: 5,
    calories: 320,
    tags: ['dessert', 'refreshing'],
    options: [
      {
        name: 'Size',
        required: true,
        maxSelect: 1,
        choices: [
          { name: 'Regular', price: 0 },
          { name: 'Super', price: 30 },
        ],
      },
    ],
    addons: [
      { name: 'Extra Ice Cream', price: 25 },
      { name: 'Extra Leche Flan', price: 20 },
    ],
  },

  // Chowking Products
  {
    id: 'product-011',
    merchantId: 'merchant-003',
    name: 'Chao Fan with Siomai',
    description: 'Chinese-style fried rice with steamed pork dumplings',
    price: 99,
    originalPrice: 99,
    category: 'Rice Meals',
    image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400',
    isAvailable: true,
    isFeatured: true,
    preparationTime: 10,
    calories: 450,
    tags: ['chinese', 'rice'],
    options: [
      {
        name: 'Siomai Count',
        required: true,
        maxSelect: 1,
        choices: [
          { name: '2 pcs', price: 0 },
          { name: '4 pcs', price: 40 },
        ],
      },
    ],
    addons: [
      { name: 'Extra Siomai (2pcs)', price: 40 },
    ],
  },
  {
    id: 'product-012',
    merchantId: 'merchant-003',
    name: 'Lauriat with Drink',
    description: 'Complete Chinese meal with rice, main dish, and sides',
    price: 185,
    originalPrice: 185,
    category: 'Lauriat',
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400',
    isAvailable: true,
    isFeatured: true,
    preparationTime: 15,
    calories: 680,
    tags: ['chinese', 'value-meal'],
    options: [
      {
        name: 'Main Dish',
        required: true,
        maxSelect: 1,
        choices: [
          { name: 'Sweet & Sour Pork', price: 0 },
          { name: 'Beef Broccoli', price: 20 },
          { name: 'Chicken Chop Suey', price: 0 },
        ],
      },
    ],
    addons: [],
  },

  // Starbucks Products
  {
    id: 'product-013',
    merchantId: 'merchant-004',
    name: 'Caramel Macchiato',
    description: 'Espresso with vanilla syrup, steamed milk, and caramel drizzle',
    price: 195,
    originalPrice: 195,
    category: 'Espresso',
    image: 'https://images.unsplash.com/photo-1485808191679-5f86510681a2?w=400',
    isAvailable: true,
    isFeatured: true,
    preparationTime: 5,
    calories: 250,
    tags: ['coffee', 'bestseller'],
    options: [
      {
        name: 'Size',
        required: true,
        maxSelect: 1,
        choices: [
          { name: 'Tall', price: 0 },
          { name: 'Grande', price: 30 },
          { name: 'Venti', price: 50 },
        ],
      },
      {
        name: 'Milk',
        required: false,
        maxSelect: 1,
        choices: [
          { name: 'Regular Milk', price: 0 },
          { name: 'Oat Milk', price: 30 },
          { name: 'Soy Milk', price: 25 },
        ],
      },
    ],
    addons: [
      { name: 'Extra Shot', price: 40 },
      { name: 'Whipped Cream', price: 20 },
    ],
  },
  {
    id: 'product-014',
    merchantId: 'merchant-004',
    name: 'Java Chip Frappuccino',
    description: 'Coffee blended with chocolate chips and ice, topped with whipped cream',
    price: 215,
    originalPrice: 215,
    category: 'Frappuccino',
    image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400',
    isAvailable: true,
    isFeatured: true,
    preparationTime: 7,
    calories: 440,
    tags: ['blended', 'chocolate'],
    options: [
      {
        name: 'Size',
        required: true,
        maxSelect: 1,
        choices: [
          { name: 'Tall', price: 0 },
          { name: 'Grande', price: 30 },
          { name: 'Venti', price: 50 },
        ],
      },
    ],
    addons: [
      { name: 'Extra Whip', price: 20 },
      { name: 'Chocolate Drizzle', price: 15 },
    ],
  },
  {
    id: 'product-015',
    merchantId: 'merchant-004',
    name: 'Butter Croissant',
    description: 'Flaky, buttery French pastry',
    price: 95,
    originalPrice: 95,
    category: 'Bakery',
    image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400',
    isAvailable: true,
    isFeatured: false,
    preparationTime: 2,
    calories: 280,
    tags: ['pastry', 'breakfast'],
    options: [],
    addons: [
      { name: 'Butter', price: 15 },
      { name: 'Jam', price: 20 },
    ],
  },

  // McDonald's Products
  {
    id: 'product-016',
    merchantId: 'merchant-005',
    name: 'Big Mac',
    description: 'Two beef patties, special sauce, lettuce, cheese, pickles, onions on a sesame seed bun',
    price: 185,
    originalPrice: 185,
    category: 'Burgers',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
    isAvailable: true,
    isFeatured: true,
    preparationTime: 8,
    calories: 590,
    tags: ['burger', 'bestseller'],
    options: [],
    addons: [
      { name: 'Extra Patty', price: 50 },
      { name: 'Bacon', price: 30 },
    ],
  },
  {
    id: 'product-017',
    merchantId: 'merchant-005',
    name: 'McChicken',
    description: 'Crispy chicken patty with lettuce and mayo',
    price: 85,
    originalPrice: 85,
    category: 'Burgers',
    image: 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=400',
    isAvailable: true,
    isFeatured: false,
    preparationTime: 5,
    calories: 400,
    tags: ['chicken', 'burger'],
    options: [],
    addons: [
      { name: 'Cheese', price: 20 },
    ],
  },
  {
    id: 'product-018',
    merchantId: 'merchant-005',
    name: 'French Fries',
    description: 'Golden, crispy, and perfectly salted',
    price: 55,
    originalPrice: 55,
    category: 'Sides',
    image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400',
    isAvailable: true,
    isFeatured: true,
    preparationTime: 3,
    calories: 320,
    tags: ['sides', 'fries'],
    options: [
      {
        name: 'Size',
        required: true,
        maxSelect: 1,
        choices: [
          { name: 'Regular', price: 0 },
          { name: 'Medium', price: 20 },
          { name: 'Large', price: 35 },
          { name: 'BFF Fries', price: 85 },
        ],
      },
    ],
    addons: [],
  },
  {
    id: 'product-019',
    merchantId: 'merchant-005',
    name: 'McFlurry Oreo',
    description: 'Soft serve ice cream with Oreo cookie pieces',
    price: 69,
    originalPrice: 69,
    category: 'Desserts',
    image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400',
    isAvailable: true,
    isFeatured: false,
    preparationTime: 3,
    calories: 340,
    tags: ['dessert', 'ice-cream'],
    options: [],
    addons: [
      { name: 'Extra Oreo', price: 20 },
    ],
  },

  // Tokyo Tokyo Products
  {
    id: 'product-020',
    merchantId: 'merchant-006',
    name: 'Beef Misono',
    description: 'Beef strips with vegetables in special sauce, served with rice',
    price: 159,
    originalPrice: 159,
    category: 'Bento',
    image: 'https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?w=400',
    isAvailable: true,
    isFeatured: true,
    preparationTime: 12,
    calories: 520,
    tags: ['japanese', 'beef', 'bento'],
    options: [
      {
        name: 'Rice Amount',
        required: true,
        maxSelect: 1,
        choices: [
          { name: 'Regular', price: 0 },
          { name: 'Extra Rice', price: 20 },
        ],
      },
    ],
    addons: [
      { name: 'Miso Soup', price: 35 },
      { name: 'Gyoza (3pcs)', price: 55 },
    ],
  },
  {
    id: 'product-021',
    merchantId: 'merchant-006',
    name: 'Chicken Teriyaki Bento',
    description: 'Grilled chicken with teriyaki glaze, served with rice and sides',
    price: 145,
    originalPrice: 145,
    category: 'Bento',
    image: 'https://images.unsplash.com/photo-1580822184713-fc5400e7fe10?w=400',
    isAvailable: true,
    isFeatured: true,
    preparationTime: 10,
    calories: 480,
    tags: ['japanese', 'chicken', 'bento'],
    options: [],
    addons: [
      { name: 'Miso Soup', price: 35 },
    ],
  },
  {
    id: 'product-022',
    merchantId: 'merchant-006',
    name: 'Tempura Udon',
    description: 'Thick wheat noodles in savory broth with crispy tempura',
    price: 175,
    originalPrice: 175,
    category: 'Noodles',
    image: 'https://images.unsplash.com/photo-1618841557871-b4664fbf0cb3?w=400',
    isAvailable: true,
    isFeatured: false,
    preparationTime: 10,
    calories: 450,
    tags: ['japanese', 'noodles', 'tempura'],
    options: [],
    addons: [
      { name: 'Extra Tempura', price: 45 },
    ],
  },
]

// Grocery stores seed data
const groceryMerchants = [
  {
    id: 'grocery-001',
    name: 'SM Supermarket - Cotabato',
    description: 'Your one-stop shop for fresh groceries and household essentials',
    type: 'grocery',
    category: 'Supermarket',
    categories: ['Supermarket', 'Fresh Produce', 'Household'],
    address: 'SM City Cotabato, Cotabato City',
    coordinates: new GeoPoint(7.2236, 124.2464),
    phone: '+639171234001',
    email: 'sm.supermarket@example.com',
    rating: 4.5,
    reviewCount: 2500,
    priceRange: '₱₱',
    deliveryFee: 69,
    deliveryTime: '45-60 min',
    estimatedDelivery: '45-60 min',
    minOrder: 500,
    isOpen: true,
    isFeatured: true,
    verified: true,
    status: 'active',
    image: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800',
    coverImage: 'https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=1200',
    openingHours: {
      monday: { open: '08:00', close: '21:00' },
      tuesday: { open: '08:00', close: '21:00' },
      wednesday: { open: '08:00', close: '21:00' },
      thursday: { open: '08:00', close: '21:00' },
      friday: { open: '08:00', close: '22:00' },
      saturday: { open: '08:00', close: '22:00' },
      sunday: { open: '09:00', close: '21:00' },
    },
  },
  {
    id: 'grocery-002',
    name: 'Puregold - Cotabato',
    description: 'Always fresh, always affordable groceries',
    type: 'grocery',
    category: 'Supermarket',
    categories: ['Supermarket', 'Convenience'],
    address: 'Puregold Cotabato, Cotabato City',
    coordinates: new GeoPoint(7.2200, 124.2500),
    phone: '+639171234002',
    email: 'puregold.cotabato@example.com',
    rating: 4.3,
    reviewCount: 1800,
    priceRange: '₱',
    deliveryFee: 59,
    deliveryTime: '30-45 min',
    estimatedDelivery: '30-45 min',
    minOrder: 300,
    isOpen: true,
    isFeatured: true,
    verified: true,
    status: 'active',
    image: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800',
    coverImage: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200',
    openingHours: {
      monday: { open: '07:00', close: '22:00' },
      tuesday: { open: '07:00', close: '22:00' },
      wednesday: { open: '07:00', close: '22:00' },
      thursday: { open: '07:00', close: '22:00' },
      friday: { open: '07:00', close: '23:00' },
      saturday: { open: '07:00', close: '23:00' },
      sunday: { open: '08:00', close: '22:00' },
    },
  },
  {
    id: 'grocery-003',
    name: 'Robinsons Supermarket',
    description: 'Quality products at great prices every day',
    type: 'grocery',
    category: 'Supermarket',
    categories: ['Supermarket', 'Fresh Produce', 'Bakery'],
    address: 'Robinsons Place Cotabato',
    coordinates: new GeoPoint(7.2180, 124.2420),
    phone: '+639171234003',
    email: 'robinsons.cotabato@example.com',
    rating: 4.4,
    reviewCount: 1500,
    priceRange: '₱₱',
    deliveryFee: 65,
    deliveryTime: '40-55 min',
    estimatedDelivery: '40-55 min',
    minOrder: 400,
    isOpen: true,
    isFeatured: false,
    verified: true,
    status: 'active',
    image: 'https://images.unsplash.com/photo-1608686207856-001b95cf60ca?w=800',
    coverImage: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=1200',
    openingHours: {
      monday: { open: '09:00', close: '21:00' },
      tuesday: { open: '09:00', close: '21:00' },
      wednesday: { open: '09:00', close: '21:00' },
      thursday: { open: '09:00', close: '21:00' },
      friday: { open: '09:00', close: '22:00' },
      saturday: { open: '09:00', close: '22:00' },
      sunday: { open: '10:00', close: '21:00' },
    },
  },
  {
    id: 'grocery-004',
    name: 'Metro Fresh Market',
    description: 'Fresh produce direct from local farmers',
    type: 'grocery',
    category: 'Fresh Market',
    categories: ['Fresh Produce', 'Meat & Seafood', 'Local Products'],
    address: 'Metro Cotabato Market',
    coordinates: new GeoPoint(7.2250, 124.2480),
    phone: '+639171234004',
    email: 'metro.fresh@example.com',
    rating: 4.6,
    reviewCount: 980,
    priceRange: '₱',
    deliveryFee: 49,
    deliveryTime: '25-40 min',
    estimatedDelivery: '25-40 min',
    minOrder: 200,
    isOpen: true,
    isFeatured: true,
    verified: true,
    status: 'active',
    image: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=800',
    coverImage: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200',
    openingHours: {
      monday: { open: '05:00', close: '18:00' },
      tuesday: { open: '05:00', close: '18:00' },
      wednesday: { open: '05:00', close: '18:00' },
      thursday: { open: '05:00', close: '18:00' },
      friday: { open: '05:00', close: '19:00' },
      saturday: { open: '05:00', close: '19:00' },
      sunday: { open: '06:00', close: '17:00' },
    },
  },
]

// Grocery products seed data
const groceryProducts = [
  // SM Supermarket Products - Fruits & Vegetables
  {
    id: 'grocery-product-001',
    merchantId: 'grocery-001',
    name: 'Fresh Bananas (1kg)',
    description: 'Sweet and ripe local bananas, perfect for snacking or cooking',
    price: 60,
    originalPrice: 60,
    category: 'Fruits & Vegetables',
    image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400',
    isAvailable: true,
    isFeatured: true,
    tags: ['fresh', 'fruits', 'local'],
    options: [
      {
        name: 'Ripeness',
        required: false,
        maxSelect: 1,
        choices: [
          { name: 'Ripe (Yellow)', price: 0 },
          { name: 'Semi-ripe (Green-Yellow)', price: 0 },
        ],
      },
    ],
    addons: [],
  },
  {
    id: 'grocery-product-002',
    merchantId: 'grocery-001',
    name: 'Red Apples (1kg)',
    description: 'Imported red apples, crisp and sweet',
    price: 180,
    originalPrice: 200,
    salePrice: 180,
    category: 'Fruits & Vegetables',
    image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400',
    isAvailable: true,
    isFeatured: true,
    tags: ['fresh', 'fruits', 'imported'],
    options: [],
    addons: [],
  },
  {
    id: 'grocery-product-003',
    merchantId: 'grocery-001',
    name: 'Fresh Tomatoes (500g)',
    description: 'Locally grown tomatoes, perfect for cooking',
    price: 45,
    originalPrice: 45,
    category: 'Fruits & Vegetables',
    image: 'https://images.unsplash.com/photo-1546470427-0d4db154ceb8?w=400',
    isAvailable: true,
    isFeatured: false,
    tags: ['fresh', 'vegetables', 'local'],
    options: [],
    addons: [],
  },
  // SM Supermarket - Meat & Seafood
  {
    id: 'grocery-product-004',
    merchantId: 'grocery-001',
    name: 'Chicken Breast (1kg)',
    description: 'Fresh boneless chicken breast, lean and healthy',
    price: 220,
    originalPrice: 220,
    category: 'Meat & Seafood',
    image: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400',
    isAvailable: true,
    isFeatured: true,
    tags: ['meat', 'chicken', 'fresh'],
    options: [
      {
        name: 'Cut Style',
        required: false,
        maxSelect: 1,
        choices: [
          { name: 'Whole Breast', price: 0 },
          { name: 'Sliced', price: 10 },
          { name: 'Cubed', price: 10 },
        ],
      },
    ],
    addons: [],
  },
  {
    id: 'grocery-product-005',
    merchantId: 'grocery-001',
    name: 'Pork Belly (1kg)',
    description: 'Fresh pork belly, perfect for liempo or lechon kawali',
    price: 350,
    originalPrice: 350,
    category: 'Meat & Seafood',
    image: 'https://images.unsplash.com/photo-1602470520998-f4a52199a3d6?w=400',
    isAvailable: true,
    isFeatured: true,
    tags: ['meat', 'pork', 'fresh'],
    options: [
      {
        name: 'Thickness',
        required: true,
        maxSelect: 1,
        choices: [
          { name: 'Thin Sliced', price: 0 },
          { name: 'Thick Cut', price: 0 },
          { name: 'Whole Slab', price: 0 },
        ],
      },
    ],
    addons: [],
  },
  {
    id: 'grocery-product-006',
    merchantId: 'grocery-001',
    name: 'Fresh Tilapia (1kg)',
    description: 'Locally raised tilapia, cleaned and ready to cook',
    price: 140,
    originalPrice: 140,
    category: 'Meat & Seafood',
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400',
    isAvailable: true,
    isFeatured: false,
    tags: ['seafood', 'fish', 'fresh'],
    options: [
      {
        name: 'Preparation',
        required: true,
        maxSelect: 1,
        choices: [
          { name: 'Whole (Cleaned)', price: 0 },
          { name: 'Filleted', price: 20 },
        ],
      },
    ],
    addons: [],
  },
  // SM Supermarket - Dairy & Eggs
  {
    id: 'grocery-product-007',
    merchantId: 'grocery-001',
    name: 'Fresh Milk 1L',
    description: 'Alaska Fresh Milk, rich in calcium and vitamins',
    price: 95,
    originalPrice: 95,
    category: 'Dairy & Eggs',
    image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400',
    isAvailable: true,
    isFeatured: true,
    tags: ['dairy', 'milk', 'fresh'],
    options: [
      {
        name: 'Type',
        required: true,
        maxSelect: 1,
        choices: [
          { name: 'Full Cream', price: 0 },
          { name: 'Low Fat', price: 0 },
          { name: 'Chocolate', price: 10 },
        ],
      },
    ],
    addons: [],
  },
  {
    id: 'grocery-product-008',
    merchantId: 'grocery-001',
    name: 'Fresh Eggs (12pcs)',
    description: 'Farm fresh eggs, perfect for any meal',
    price: 120,
    originalPrice: 120,
    category: 'Dairy & Eggs',
    image: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400',
    isAvailable: true,
    isFeatured: true,
    tags: ['dairy', 'eggs', 'fresh'],
    options: [
      {
        name: 'Size',
        required: true,
        maxSelect: 1,
        choices: [
          { name: 'Medium', price: 0 },
          { name: 'Large', price: 15 },
          { name: 'Extra Large', price: 25 },
        ],
      },
    ],
    addons: [],
  },
  // SM Supermarket - Beverages
  {
    id: 'grocery-product-009',
    merchantId: 'grocery-001',
    name: 'Coca-Cola 1.5L',
    description: 'Classic Coca-Cola, ice cold refreshment',
    price: 65,
    originalPrice: 65,
    category: 'Beverages',
    image: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400',
    isAvailable: true,
    isFeatured: false,
    tags: ['beverage', 'soda', 'cold'],
    options: [],
    addons: [],
  },
  {
    id: 'grocery-product-010',
    merchantId: 'grocery-001',
    name: 'Nescafe 3in1 (10 sachets)',
    description: 'Instant coffee with creamer and sugar',
    price: 120,
    originalPrice: 120,
    category: 'Beverages',
    image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400',
    isAvailable: true,
    isFeatured: true,
    tags: ['beverage', 'coffee', 'instant'],
    options: [
      {
        name: 'Variant',
        required: true,
        maxSelect: 1,
        choices: [
          { name: 'Original', price: 0 },
          { name: 'Brown & Creamy', price: 0 },
          { name: 'Creamy White', price: 0 },
        ],
      },
    ],
    addons: [],
  },
  // SM Supermarket - Snacks
  {
    id: 'grocery-product-011',
    merchantId: 'grocery-001',
    name: 'Piattos Cheese (Big)',
    description: 'Crispy potato chips with cheese flavor',
    price: 55,
    originalPrice: 55,
    category: 'Snacks',
    image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400',
    isAvailable: true,
    isFeatured: false,
    tags: ['snack', 'chips', 'cheese'],
    options: [],
    addons: [],
  },
  {
    id: 'grocery-product-012',
    merchantId: 'grocery-001',
    name: 'Oreo Cookies',
    description: 'Classic chocolate sandwich cookies with cream filling',
    price: 45,
    originalPrice: 45,
    category: 'Snacks',
    image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400',
    isAvailable: true,
    isFeatured: true,
    tags: ['snack', 'cookies', 'chocolate'],
    options: [
      {
        name: 'Flavor',
        required: true,
        maxSelect: 1,
        choices: [
          { name: 'Original', price: 0 },
          { name: 'Double Stuf', price: 10 },
          { name: 'Golden', price: 5 },
        ],
      },
    ],
    addons: [],
  },
  // SM Supermarket - Household
  {
    id: 'grocery-product-013',
    merchantId: 'grocery-001',
    name: 'Tide Powder 1kg',
    description: 'Powerful laundry detergent for tough stains',
    price: 180,
    originalPrice: 180,
    category: 'Household',
    image: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=400',
    isAvailable: true,
    isFeatured: false,
    tags: ['household', 'laundry', 'cleaning'],
    options: [],
    addons: [],
  },
  {
    id: 'grocery-product-014',
    merchantId: 'grocery-001',
    name: 'Joy Dishwashing 500ml',
    description: 'Effective grease-cutting dishwashing liquid',
    price: 95,
    originalPrice: 95,
    category: 'Household',
    image: 'https://images.unsplash.com/photo-1585441695325-21557ef66ca9?w=400',
    isAvailable: true,
    isFeatured: false,
    tags: ['household', 'kitchen', 'cleaning'],
    options: [
      {
        name: 'Scent',
        required: false,
        maxSelect: 1,
        choices: [
          { name: 'Lemon', price: 0 },
          { name: 'Antibac', price: 5 },
        ],
      },
    ],
    addons: [],
  },

  // Puregold Products
  {
    id: 'grocery-product-015',
    merchantId: 'grocery-002',
    name: 'Lucky Me Pancit Canton (6-pack)',
    description: 'Classic instant noodles, Filipino favorite',
    price: 85,
    originalPrice: 85,
    category: 'Instant Food',
    image: 'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=400',
    isAvailable: true,
    isFeatured: true,
    tags: ['instant', 'noodles', 'filipino'],
    options: [
      {
        name: 'Flavor',
        required: true,
        maxSelect: 1,
        choices: [
          { name: 'Original', price: 0 },
          { name: 'Chilimansi', price: 0 },
          { name: 'Kalamansi', price: 0 },
          { name: 'Extra Hot', price: 0 },
        ],
      },
    ],
    addons: [],
  },
  {
    id: 'grocery-product-016',
    merchantId: 'grocery-002',
    name: 'Rice (5kg)',
    description: 'Premium quality rice, perfect for everyday meals',
    price: 280,
    originalPrice: 300,
    salePrice: 280,
    category: 'Rice & Grains',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400',
    isAvailable: true,
    isFeatured: true,
    tags: ['rice', 'staple', 'grain'],
    options: [
      {
        name: 'Type',
        required: true,
        maxSelect: 1,
        choices: [
          { name: 'Sinandomeng', price: 0 },
          { name: 'Jasmine', price: 30 },
          { name: 'Dinorado', price: 50 },
        ],
      },
    ],
    addons: [],
  },
  {
    id: 'grocery-product-017',
    merchantId: 'grocery-002',
    name: 'Cooking Oil 1L',
    description: 'Pure vegetable cooking oil',
    price: 85,
    originalPrice: 85,
    category: 'Cooking Essentials',
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400',
    isAvailable: true,
    isFeatured: false,
    tags: ['cooking', 'oil', 'essential'],
    options: [
      {
        name: 'Brand',
        required: true,
        maxSelect: 1,
        choices: [
          { name: 'Baguio Oil', price: 0 },
          { name: 'Golden Fiesta', price: 10 },
          { name: 'Canola', price: 25 },
        ],
      },
    ],
    addons: [],
  },
  {
    id: 'grocery-product-018',
    merchantId: 'grocery-002',
    name: 'Spam Classic 340g',
    description: 'Classic luncheon meat, ready to eat',
    price: 195,
    originalPrice: 195,
    category: 'Canned Goods',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
    isAvailable: true,
    isFeatured: true,
    tags: ['canned', 'meat', 'ready-to-eat'],
    options: [],
    addons: [],
  },

  // Metro Fresh Market Products
  {
    id: 'grocery-product-019',
    merchantId: 'grocery-004',
    name: 'Fresh Kangkong (bundle)',
    description: 'Locally grown water spinach, fresh from the farm',
    price: 25,
    originalPrice: 25,
    category: 'Leafy Greens',
    image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400',
    isAvailable: true,
    isFeatured: true,
    tags: ['vegetables', 'leafy', 'local', 'fresh'],
    options: [],
    addons: [],
  },
  {
    id: 'grocery-product-020',
    merchantId: 'grocery-004',
    name: 'Fresh Pechay (500g)',
    description: 'Crisp and fresh bok choy from local farms',
    price: 35,
    originalPrice: 35,
    category: 'Leafy Greens',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400',
    isAvailable: true,
    isFeatured: false,
    tags: ['vegetables', 'leafy', 'local', 'fresh'],
    options: [],
    addons: [],
  },
  {
    id: 'grocery-product-021',
    merchantId: 'grocery-004',
    name: 'Native Chicken (whole)',
    description: 'Free-range native chicken, more flavorful',
    price: 380,
    originalPrice: 380,
    category: 'Meat & Poultry',
    image: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=400',
    isAvailable: true,
    isFeatured: true,
    tags: ['meat', 'chicken', 'native', 'fresh'],
    options: [
      {
        name: 'Preparation',
        required: true,
        maxSelect: 1,
        choices: [
          { name: 'Whole (Cleaned)', price: 0 },
          { name: 'Cut into pieces', price: 20 },
        ],
      },
    ],
    addons: [],
  },
  {
    id: 'grocery-product-022',
    merchantId: 'grocery-004',
    name: 'Fresh Bangus (Milkfish) 1kg',
    description: 'Premium quality milkfish, deboned available',
    price: 180,
    originalPrice: 180,
    category: 'Seafood',
    image: 'https://images.unsplash.com/photo-1510130387422-82bed34b37e9?w=400',
    isAvailable: true,
    isFeatured: true,
    tags: ['seafood', 'fish', 'fresh', 'local'],
    options: [
      {
        name: 'Preparation',
        required: true,
        maxSelect: 1,
        choices: [
          { name: 'Whole', price: 0 },
          { name: 'Deboned (Boneless)', price: 40 },
          { name: 'Butterfly Cut', price: 30 },
        ],
      },
    ],
    addons: [
      { name: 'Marinate (Daing style)', price: 25, isAvailable: true },
    ],
  },
  {
    id: 'grocery-product-023',
    merchantId: 'grocery-004',
    name: 'Fresh Shrimp (500g)',
    description: 'Medium-sized shrimp, fresh catch of the day',
    price: 280,
    originalPrice: 280,
    category: 'Seafood',
    image: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=400',
    isAvailable: true,
    isFeatured: false,
    tags: ['seafood', 'shrimp', 'fresh'],
    options: [
      {
        name: 'Cleaning',
        required: false,
        maxSelect: 1,
        choices: [
          { name: 'As is', price: 0 },
          { name: 'Cleaned & Deveined', price: 30 },
        ],
      },
    ],
    addons: [],
  },
  {
    id: 'grocery-product-024',
    merchantId: 'grocery-004',
    name: 'Calamansi (500g)',
    description: 'Fresh Philippine lime, essential for Filipino cooking',
    price: 40,
    originalPrice: 40,
    category: 'Fruits',
    image: 'https://images.unsplash.com/photo-1590502593747-42a996133562?w=400',
    isAvailable: true,
    isFeatured: false,
    tags: ['fruits', 'citrus', 'local', 'fresh'],
    options: [],
    addons: [],
  },
]

// Drivers seed data
const drivers = [
  {
    id: 'driver-001',
    firstName: 'Juan',
    lastName: 'Dela Cruz',
    phone: '+639123456789',
    email: 'juan.driver@gogo.ph',
    profileImage: 'https://randomuser.me/api/portraits/men/1.jpg',
    vehicleType: 'motorcycle',
    vehicleInfo: {
      make: 'Honda',
      model: 'Click 125i',
      year: 2022,
      color: 'Black',
      plateNumber: 'ABC 1234',
    },
    licenseNumber: 'N01-12-345678',
    status: 'available',
    location: new GeoPoint(14.5547, 121.0244),
    rating: 4.8,
    totalDeliveries: 523,
    totalEarnings: 125000,
    isVerified: true,
    isOnline: true,
  },
  {
    id: 'driver-002',
    firstName: 'Maria',
    lastName: 'Santos',
    phone: '+639234567890',
    email: 'maria.driver@gogo.ph',
    profileImage: 'https://randomuser.me/api/portraits/women/2.jpg',
    vehicleType: 'motorcycle',
    vehicleInfo: {
      make: 'Yamaha',
      model: 'Mio i 125',
      year: 2023,
      color: 'Red',
      plateNumber: 'XYZ 5678',
    },
    licenseNumber: 'N01-23-456789',
    status: 'available',
    location: new GeoPoint(14.5600, 121.0300),
    rating: 4.9,
    totalDeliveries: 892,
    totalEarnings: 285000,
    isVerified: true,
    isOnline: true,
  },
  {
    id: 'driver-003',
    firstName: 'Pedro',
    lastName: 'Reyes',
    phone: '+639345678901',
    email: 'pedro.driver@gogo.ph',
    profileImage: 'https://randomuser.me/api/portraits/men/3.jpg',
    vehicleType: 'motorcycle',
    vehicleInfo: {
      make: 'Suzuki',
      model: 'Raider 150',
      year: 2021,
      color: 'Blue',
      plateNumber: 'DEF 9012',
    },
    licenseNumber: 'N01-34-567890',
    status: 'available',
    location: new GeoPoint(14.5400, 121.0100),
    rating: 4.7,
    totalDeliveries: 234,
    totalEarnings: 95000,
    isVerified: true,
    isOnline: false,
  },
]

// Pharmacy stores seed data
const pharmacyMerchants = [
  {
    id: 'pharmacy-001',
    name: 'Mercury Drug - Cotabato',
    description: 'Your trusted health partner since 1945. Widest selection of medicines and health products.',
    type: 'pharmacy',
    category: 'Pharmacy',
    categories: ['Medicines', 'Vitamins', 'Personal Care', 'Baby Care'],
    address: 'Mercury Drug Cotabato City',
    coordinates: new GeoPoint(7.2047, 124.2530),
    phone: '+639171234501',
    email: 'mercury.cotabato@example.com',
    rating: 4.8,
    reviewCount: 2500,
    priceRange: '₱₱',
    deliveryFee: 49,
    deliveryTime: '20-30 min',
    estimatedDelivery: '20-30 min',
    minOrder: 200,
    isOpen: true,
    isFeatured: true,
    verified: true,
    status: 'active',
    image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=800',
    coverImage: 'https://images.unsplash.com/photo-1576671081837-49000212a370?w=1200',
    openingHours: {
      monday: { open: '07:00', close: '22:00' },
      tuesday: { open: '07:00', close: '22:00' },
      wednesday: { open: '07:00', close: '22:00' },
      thursday: { open: '07:00', close: '22:00' },
      friday: { open: '07:00', close: '22:00' },
      saturday: { open: '08:00', close: '22:00' },
      sunday: { open: '08:00', close: '21:00' },
    },
  },
  {
    id: 'pharmacy-002',
    name: 'Watsons - SM City Cotabato',
    description: 'Look good, feel great. Health, wellness, and beauty products.',
    type: 'pharmacy',
    category: 'Pharmacy',
    categories: ['Personal Care', 'Vitamins', 'Beauty', 'Medicines'],
    address: 'SM City Cotabato, Cotabato City',
    coordinates: new GeoPoint(7.2236, 124.2464),
    phone: '+639171234502',
    email: 'watsons.cotabato@example.com',
    rating: 4.6,
    reviewCount: 1800,
    priceRange: '₱₱',
    deliveryFee: 59,
    deliveryTime: '25-35 min',
    estimatedDelivery: '25-35 min',
    minOrder: 300,
    isOpen: true,
    isFeatured: true,
    verified: true,
    status: 'active',
    image: 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=800',
    coverImage: 'https://images.unsplash.com/photo-1576671081837-49000212a370?w=1200',
    openingHours: {
      monday: { open: '10:00', close: '21:00' },
      tuesday: { open: '10:00', close: '21:00' },
      wednesday: { open: '10:00', close: '21:00' },
      thursday: { open: '10:00', close: '21:00' },
      friday: { open: '10:00', close: '22:00' },
      saturday: { open: '10:00', close: '22:00' },
      sunday: { open: '10:00', close: '21:00' },
    },
  },
  {
    id: 'pharmacy-003',
    name: 'Rose Pharmacy - Cotabato',
    description: 'Quality medicines at affordable prices. Your neighborhood pharmacy.',
    type: 'pharmacy',
    category: 'Pharmacy',
    categories: ['Medicines', 'Medical Supplies'],
    address: 'Rose Pharmacy Cotabato',
    coordinates: new GeoPoint(7.2100, 124.2450),
    phone: '+639171234503',
    email: 'rose.cotabato@example.com',
    rating: 4.5,
    reviewCount: 1200,
    priceRange: '₱',
    deliveryFee: 39,
    deliveryTime: '20-30 min',
    estimatedDelivery: '20-30 min',
    minOrder: 150,
    isOpen: true,
    isFeatured: true,
    verified: true,
    status: 'active',
    image: 'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=800',
    coverImage: 'https://images.unsplash.com/photo-1576671081837-49000212a370?w=1200',
    openingHours: {
      monday: { open: '08:00', close: '21:00' },
      tuesday: { open: '08:00', close: '21:00' },
      wednesday: { open: '08:00', close: '21:00' },
      thursday: { open: '08:00', close: '21:00' },
      friday: { open: '08:00', close: '22:00' },
      saturday: { open: '08:00', close: '22:00' },
      sunday: { open: '08:00', close: '20:00' },
    },
  },
  {
    id: 'pharmacy-004',
    name: 'Generika Drugstore',
    description: 'Branded generics you can trust. Affordable medicine for everyone.',
    type: 'pharmacy',
    category: 'Pharmacy',
    categories: ['Medicines', 'Vitamins'],
    address: 'Generika Cotabato',
    coordinates: new GeoPoint(7.2080, 124.2480),
    phone: '+639171234504',
    email: 'generika.cotabato@example.com',
    rating: 4.4,
    reviewCount: 800,
    priceRange: '₱',
    deliveryFee: 35,
    deliveryTime: '25-40 min',
    estimatedDelivery: '25-40 min',
    minOrder: 100,
    isOpen: true,
    isFeatured: false,
    verified: true,
    status: 'active',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800',
    coverImage: 'https://images.unsplash.com/photo-1576671081837-49000212a370?w=1200',
    openingHours: {
      monday: { open: '08:00', close: '20:00' },
      tuesday: { open: '08:00', close: '20:00' },
      wednesday: { open: '08:00', close: '20:00' },
      thursday: { open: '08:00', close: '20:00' },
      friday: { open: '08:00', close: '21:00' },
      saturday: { open: '08:00', close: '21:00' },
      sunday: { open: '09:00', close: '19:00' },
    },
  },
  {
    id: 'pharmacy-005',
    name: 'TGP (The Generics Pharmacy)',
    description: 'Ang Tunay na Katuwang ng Pamilyang Pilipino. Quality generics at low prices.',
    type: 'pharmacy',
    category: 'Pharmacy',
    categories: ['Medicines', 'Vitamins', 'Medical Supplies'],
    address: 'TGP Cotabato',
    coordinates: new GeoPoint(7.2150, 124.2510),
    phone: '+639171234505',
    email: 'tgp.cotabato@example.com',
    rating: 4.3,
    reviewCount: 650,
    priceRange: '₱',
    deliveryFee: 29,
    deliveryTime: '30-45 min',
    estimatedDelivery: '30-45 min',
    minOrder: 100,
    isOpen: true,
    isFeatured: false,
    verified: true,
    status: 'active',
    image: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=800',
    coverImage: 'https://images.unsplash.com/photo-1576671081837-49000212a370?w=1200',
    openingHours: {
      monday: { open: '07:00', close: '21:00' },
      tuesday: { open: '07:00', close: '21:00' },
      wednesday: { open: '07:00', close: '21:00' },
      thursday: { open: '07:00', close: '21:00' },
      friday: { open: '07:00', close: '22:00' },
      saturday: { open: '07:00', close: '22:00' },
      sunday: { open: '08:00', close: '20:00' },
    },
  },
]

// Pharmacy products seed data
const pharmacyProducts = [
  // Mercury Drug Products - Medicines
  {
    id: 'pharmacy-product-001',
    merchantId: 'pharmacy-001',
    name: 'Biogesic Paracetamol 500mg (10 tablets)',
    description: 'For relief of minor aches, pains, and fever. Safe for adults and children.',
    price: 35,
    category: 'Medicines',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400',
    isAvailable: true,
    isFeatured: true,
    tags: ['medicine', 'pain-relief', 'fever'],
  },
  {
    id: 'pharmacy-product-002',
    merchantId: 'pharmacy-001',
    name: 'Neozep Forte (10 tablets)',
    description: 'For relief of clogged nose, headache, body aches and fever due to colds and flu.',
    price: 75,
    category: 'Medicines',
    image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400',
    isAvailable: true,
    isFeatured: true,
    tags: ['medicine', 'cold', 'flu'],
  },
  {
    id: 'pharmacy-product-003',
    merchantId: 'pharmacy-001',
    name: 'Kremil-S Tablet (10 tablets)',
    description: 'Antacid for relief of hyperacidity, heartburn, and upset stomach.',
    price: 55,
    category: 'Medicines',
    image: 'https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=400',
    isAvailable: true,
    isFeatured: false,
    tags: ['medicine', 'antacid', 'stomach'],
  },
  {
    id: 'pharmacy-product-004',
    merchantId: 'pharmacy-001',
    name: 'Bioflu (10 capsules)',
    description: 'For relief of flu symptoms including fever, body pain, and colds.',
    price: 120,
    category: 'Medicines',
    image: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400',
    isAvailable: true,
    isFeatured: true,
    tags: ['medicine', 'flu', 'cold'],
  },
  // Mercury Drug - Vitamins
  {
    id: 'pharmacy-product-005',
    merchantId: 'pharmacy-001',
    name: 'Enervon C (30 tablets)',
    description: 'Multivitamins with Vitamin C for daily immunity boost and energy.',
    price: 295,
    category: 'Vitamins',
    image: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=400',
    isAvailable: true,
    isFeatured: true,
    tags: ['vitamins', 'immunity', 'energy'],
    options: [
      {
        name: 'Pack Size',
        required: true,
        choices: [
          { name: '30 tablets', price: 0 },
          { name: '100 tablets', price: 550 },
        ],
      },
    ],
  },
  {
    id: 'pharmacy-product-006',
    merchantId: 'pharmacy-001',
    name: 'Centrum Silver Adults 50+ (30 tablets)',
    description: 'Complete multivitamin specially formulated for adults 50 and older.',
    price: 695,
    salePrice: 650,
    category: 'Vitamins',
    image: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=400',
    isAvailable: true,
    isFeatured: false,
    tags: ['vitamins', 'senior', 'health'],
  },
  // Mercury Drug - Personal Care
  {
    id: 'pharmacy-product-007',
    merchantId: 'pharmacy-001',
    name: 'Betadine Antiseptic Solution 60ml',
    description: 'For first aid treatment of minor cuts, wounds, and burns.',
    price: 145,
    category: 'Personal Care',
    image: 'https://images.unsplash.com/photo-1583947581924-860bda6a26df?w=400',
    isAvailable: true,
    isFeatured: false,
    tags: ['first-aid', 'antiseptic', 'wound-care'],
    options: [
      {
        name: 'Size',
        required: true,
        choices: [
          { name: '60ml', price: 0 },
          { name: '120ml', price: 95 },
        ],
      },
    ],
  },
  {
    id: 'pharmacy-product-008',
    merchantId: 'pharmacy-001',
    name: 'Band-Aid Assorted (30 pieces)',
    description: 'Flexible fabric bandages for minor cuts and scrapes.',
    price: 125,
    category: 'Medical Supplies',
    image: 'https://images.unsplash.com/photo-1583947581924-860bda6a26df?w=400',
    isAvailable: true,
    isFeatured: true,
    tags: ['first-aid', 'bandage', 'wound-care'],
  },
  // Mercury Drug - Baby Care
  {
    id: 'pharmacy-product-009',
    merchantId: 'pharmacy-001',
    name: 'Ceelin Vitamin C Syrup 120ml',
    description: 'Vitamin C supplement for children. Strengthens immunity.',
    price: 195,
    category: 'Baby Care',
    image: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=400',
    isAvailable: true,
    isFeatured: true,
    tags: ['vitamins', 'children', 'immunity'],
  },
  {
    id: 'pharmacy-product-010',
    merchantId: 'pharmacy-001',
    name: 'Pampers Baby Dry Medium (28 pcs)',
    description: 'Up to 12 hours of dryness. Soft and comfortable.',
    price: 395,
    category: 'Baby Care',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400',
    isAvailable: true,
    isFeatured: false,
    tags: ['baby', 'diapers', 'essentials'],
    options: [
      {
        name: 'Size',
        required: true,
        choices: [
          { name: 'Small', price: -30 },
          { name: 'Medium', price: 0 },
          { name: 'Large', price: 30 },
          { name: 'XL', price: 50 },
        ],
      },
    ],
  },

  // Watsons Products
  {
    id: 'pharmacy-product-011',
    merchantId: 'pharmacy-002',
    name: 'Watsons Facial Cotton 100 pcs',
    description: '100% pure cotton pads for gentle facial cleansing.',
    price: 89,
    salePrice: 79,
    category: 'Personal Care',
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400',
    isAvailable: true,
    isFeatured: true,
    tags: ['personal-care', 'beauty', 'cotton'],
  },
  {
    id: 'pharmacy-product-012',
    merchantId: 'pharmacy-002',
    name: 'Berocca Performance (10 tablets)',
    description: 'Effervescent vitamins for mental sharpness and physical energy.',
    price: 450,
    category: 'Vitamins',
    image: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=400',
    isAvailable: true,
    isFeatured: true,
    tags: ['vitamins', 'energy', 'performance'],
    options: [
      {
        name: 'Flavor',
        required: true,
        choices: [
          { name: 'Orange', price: 0 },
          { name: 'Mixed Berries', price: 0 },
        ],
      },
    ],
  },
  {
    id: 'pharmacy-product-013',
    merchantId: 'pharmacy-002',
    name: 'Strepsils Lozenges (24 tablets)',
    description: 'Fast-acting sore throat relief with antibacterial action.',
    price: 195,
    category: 'Medicines',
    image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400',
    isAvailable: true,
    isFeatured: false,
    tags: ['medicine', 'throat', 'lozenges'],
    options: [
      {
        name: 'Variant',
        required: true,
        choices: [
          { name: 'Original', price: 0 },
          { name: 'Honey & Lemon', price: 0 },
          { name: 'Cool Breeze', price: 0 },
        ],
      },
    ],
  },
  {
    id: 'pharmacy-product-014',
    merchantId: 'pharmacy-002',
    name: 'Nivea Creme 60ml',
    description: 'Classic moisturizing cream for face, body, and hands.',
    price: 125,
    category: 'Personal Care',
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400',
    isAvailable: true,
    isFeatured: true,
    tags: ['personal-care', 'skin', 'moisturizer'],
    options: [
      {
        name: 'Size',
        required: true,
        choices: [
          { name: '60ml', price: 0 },
          { name: '150ml', price: 95 },
          { name: '400ml', price: 275 },
        ],
      },
    ],
  },

  // Rose Pharmacy Products
  {
    id: 'pharmacy-product-015',
    merchantId: 'pharmacy-003',
    name: 'Alaxan FR (10 tablets)',
    description: 'For headaches, toothaches, muscle pain, and body aches.',
    price: 95,
    category: 'Medicines',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400',
    isAvailable: true,
    isFeatured: true,
    tags: ['medicine', 'pain-relief', 'headache'],
  },
  {
    id: 'pharmacy-product-016',
    merchantId: 'pharmacy-003',
    name: 'Diatabs (8 capsules)',
    description: 'For relief of acute diarrhea. Safe and effective.',
    price: 45,
    category: 'Medicines',
    image: 'https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=400',
    isAvailable: true,
    isFeatured: false,
    tags: ['medicine', 'diarrhea', 'stomach'],
  },
  {
    id: 'pharmacy-product-017',
    merchantId: 'pharmacy-003',
    name: 'Alcohol 70% 500ml',
    description: 'Isopropyl alcohol for disinfection and sanitizing.',
    price: 85,
    category: 'Medical Supplies',
    image: 'https://images.unsplash.com/photo-1583947581924-860bda6a26df?w=400',
    isAvailable: true,
    isFeatured: true,
    tags: ['disinfectant', 'sanitizer', 'medical'],
    options: [
      {
        name: 'Size',
        required: true,
        choices: [
          { name: '250ml', price: -35 },
          { name: '500ml', price: 0 },
          { name: '1 Liter', price: 65 },
        ],
      },
    ],
  },
  {
    id: 'pharmacy-product-018',
    merchantId: 'pharmacy-003',
    name: 'Face Mask KN95 (10 pcs)',
    description: 'High-filtration protective face masks. 5-layer protection.',
    price: 150,
    salePrice: 120,
    category: 'Medical Supplies',
    image: 'https://images.unsplash.com/photo-1584634731339-252c581abfc5?w=400',
    isAvailable: true,
    isFeatured: true,
    tags: ['protection', 'mask', 'medical'],
  },

  // Generika Products
  {
    id: 'pharmacy-product-019',
    merchantId: 'pharmacy-004',
    name: 'Paracetamol 500mg Generic (100 tablets)',
    description: 'Generic paracetamol for pain and fever relief at affordable price.',
    price: 85,
    category: 'Medicines',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400',
    isAvailable: true,
    isFeatured: true,
    tags: ['generic', 'medicine', 'pain-relief'],
  },
  {
    id: 'pharmacy-product-020',
    merchantId: 'pharmacy-004',
    name: 'Amoxicillin 500mg (10 capsules)',
    description: 'Generic antibiotic. Prescription required.',
    price: 65,
    category: 'Medicines',
    image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400',
    isAvailable: true,
    isFeatured: false,
    tags: ['generic', 'medicine', 'antibiotic', 'prescription'],
  },
  {
    id: 'pharmacy-product-021',
    merchantId: 'pharmacy-004',
    name: 'Losartan 50mg (30 tablets)',
    description: 'Generic for high blood pressure. Prescription required.',
    price: 195,
    category: 'Medicines',
    image: 'https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=400',
    isAvailable: true,
    isFeatured: true,
    tags: ['generic', 'medicine', 'hypertension', 'prescription'],
  },
  {
    id: 'pharmacy-product-022',
    merchantId: 'pharmacy-004',
    name: 'Metformin 500mg (100 tablets)',
    description: 'Generic diabetes medication. Prescription required.',
    price: 180,
    category: 'Medicines',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400',
    isAvailable: true,
    isFeatured: false,
    tags: ['generic', 'medicine', 'diabetes', 'prescription'],
  },

  // TGP Products
  {
    id: 'pharmacy-product-023',
    merchantId: 'pharmacy-005',
    name: 'Ascorbic Acid 500mg (100 tablets)',
    description: 'Vitamin C for immunity. Affordable generic brand.',
    price: 120,
    category: 'Vitamins',
    image: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=400',
    isAvailable: true,
    isFeatured: true,
    tags: ['vitamins', 'generic', 'immunity'],
  },
  {
    id: 'pharmacy-product-024',
    merchantId: 'pharmacy-005',
    name: 'Mefenamic Acid 500mg (10 capsules)',
    description: 'Pain reliever for menstrual cramps and body pain.',
    price: 45,
    category: 'Medicines',
    image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400',
    isAvailable: true,
    isFeatured: true,
    tags: ['generic', 'medicine', 'pain-relief'],
  },
  {
    id: 'pharmacy-product-025',
    merchantId: 'pharmacy-005',
    name: 'Omeprazole 20mg (14 capsules)',
    description: 'For acidity, heartburn, and GERD. Generic brand.',
    price: 75,
    category: 'Medicines',
    image: 'https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=400',
    isAvailable: true,
    isFeatured: false,
    tags: ['generic', 'medicine', 'antacid'],
  },
  {
    id: 'pharmacy-product-026',
    merchantId: 'pharmacy-005',
    name: 'Digital Thermometer',
    description: 'Accurate body temperature measurement. Battery included.',
    price: 150,
    category: 'Medical Supplies',
    image: 'https://images.unsplash.com/photo-1584634731339-252c581abfc5?w=400',
    isAvailable: true,
    isFeatured: true,
    tags: ['medical-device', 'thermometer', 'health'],
  },
]

// Promo codes
const promos = [
  {
    id: 'promo-001',
    code: 'WELCOME50',
    description: '50% off your first order!',
    type: 'percentage',
    value: 50,
    maxDiscount: 100,
    minOrderAmount: 0,
    usageLimit: 1,
    usageCount: 0,
    validFrom: Timestamp.now(),
    validUntil: Timestamp.fromDate(new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)),
    applicableTo: ['food', 'grocery'],
    isActive: true,
  },
  {
    id: 'promo-002',
    code: 'FREESHIP',
    description: 'Free delivery on orders over ₱500',
    type: 'fixed',
    value: 59,
    maxDiscount: 59,
    minOrderAmount: 500,
    usageLimit: 3,
    usageCount: 0,
    validFrom: Timestamp.now(),
    validUntil: Timestamp.fromDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
    applicableTo: ['food', 'grocery'],
    isActive: true,
  },
  {
    id: 'promo-003',
    code: 'PAYDAY20',
    description: '20% off on all orders (max ₱150)',
    type: 'percentage',
    value: 20,
    maxDiscount: 150,
    minOrderAmount: 300,
    usageLimit: 2,
    usageCount: 0,
    validFrom: Timestamp.now(),
    validUntil: Timestamp.fromDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
    applicableTo: ['food', 'grocery'],
    isActive: true,
  },
]

export interface SeedProgress {
  status: 'idle' | 'seeding' | 'success' | 'error'
  message: string
  progress: number
}

// Helper to clear all documents of a specific type before seeding
async function clearMerchantsByType(
  type: 'restaurant' | 'grocery' | 'pharmacy',
  onProgress?: (message: string) => void
): Promise<number> {
  const existingMerchants = await getDocuments(collections.merchants, [
    where('type', '==', type),
  ])

  let deletedCount = 0
  for (const merchant of existingMerchants) {
    await deleteDocument(collections.merchants, merchant.id as string)
    deletedCount++
    onProgress?.(`Deleted ${type} merchant: ${(merchant as { name?: string }).name || merchant.id}`)
  }

  return deletedCount
}

// Clear all products for merchants of a specific type
async function clearProductsByMerchantIds(
  merchantIds: string[],
  onProgress?: (message: string) => void
): Promise<number> {
  if (merchantIds.length === 0) return 0

  let deletedCount = 0
  for (const merchantId of merchantIds) {
    const products = await getDocuments(collections.products, [
      where('merchantId', '==', merchantId),
    ])

    for (const product of products) {
      await deleteDocument(collections.products, product.id as string)
      deletedCount++
    }
    onProgress?.(`Deleted ${products.length} products for merchant: ${merchantId}`)
  }

  return deletedCount
}

export async function clearAndSeedDatabase(
  onProgress?: (progress: SeedProgress) => void
): Promise<void> {
  const updateProgress = (status: SeedProgress['status'], message: string, progress: number) => {
    onProgress?.({ status, message, progress })
  }

  try {
    updateProgress('seeding', 'Clearing existing data...', 0)

    // Get existing merchant IDs for each type before deleting
    const existingRestaurants = await getDocuments(collections.merchants, [
      where('type', '==', 'restaurant'),
    ])
    const existingGrocery = await getDocuments(collections.merchants, [
      where('type', '==', 'grocery'),
    ])
    const existingPharmacy = await getDocuments(collections.merchants, [
      where('type', '==', 'pharmacy'),
    ])

    const allExistingMerchantIds = [
      ...existingRestaurants.map(m => m.id as string),
      ...existingGrocery.map(m => m.id as string),
      ...existingPharmacy.map(m => m.id as string),
    ]

    // Clear products first
    updateProgress('seeding', 'Clearing existing products...', 5)
    const deletedProducts = await clearProductsByMerchantIds(
      allExistingMerchantIds,
      (msg) => updateProgress('seeding', msg, 10)
    )
    updateProgress('seeding', `Cleared ${deletedProducts} existing products`, 15)

    // Clear merchants
    updateProgress('seeding', 'Clearing existing merchants...', 20)
    const deletedRestaurants = await clearMerchantsByType('restaurant', (msg) => updateProgress('seeding', msg, 22))
    const deletedGrocery = await clearMerchantsByType('grocery', (msg) => updateProgress('seeding', msg, 24))
    const deletedPharmacy = await clearMerchantsByType('pharmacy', (msg) => updateProgress('seeding', msg, 26))

    updateProgress('seeding', `Cleared ${deletedRestaurants + deletedGrocery + deletedPharmacy} existing merchants`, 30)

    // Now seed the new data
    await seedDatabase((progress) => {
      // Remap progress from 0-100 to 30-100
      const remappedProgress = 30 + (progress.progress * 0.7)
      updateProgress(progress.status, progress.message, remappedProgress)
    })

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred'
    updateProgress('error', `Failed to clear and seed database: ${message}`, 0)
    throw error
  }
}

export async function seedDatabase(
  onProgress?: (progress: SeedProgress) => void
): Promise<void> {
  const updateProgress = (status: SeedProgress['status'], message: string, progress: number) => {
    onProgress?.({ status, message, progress })
  }

  try {
    updateProgress('seeding', 'Starting database seed...', 0)

    // Seed restaurant merchants
    updateProgress('seeding', 'Seeding restaurant merchants...', 5)
    for (let i = 0; i < merchants.length; i++) {
      const merchant = merchants[i]
      await setDocument(collections.merchants, merchant.id, {
        ...merchant,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      })
      updateProgress('seeding', `Seeded restaurant: ${merchant.name}`, 5 + (i / merchants.length) * 10)
    }

    // Seed grocery merchants
    updateProgress('seeding', 'Seeding grocery stores...', 15)
    for (let i = 0; i < groceryMerchants.length; i++) {
      const merchant = groceryMerchants[i]
      await setDocument(collections.merchants, merchant.id, {
        ...merchant,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      })
      updateProgress('seeding', `Seeded grocery store: ${merchant.name}`, 15 + (i / groceryMerchants.length) * 10)
    }

    // Seed restaurant products
    updateProgress('seeding', 'Seeding restaurant products...', 25)
    for (let i = 0; i < products.length; i++) {
      const product = products[i]
      await setDocument(collections.products, product.id, {
        ...product,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      })
      updateProgress('seeding', `Seeded product: ${product.name}`, 25 + (i / products.length) * 20)
    }

    // Seed grocery products
    updateProgress('seeding', 'Seeding grocery products...', 40)
    for (let i = 0; i < groceryProducts.length; i++) {
      const product = groceryProducts[i]
      await setDocument(collections.products, product.id, {
        ...product,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      })
      updateProgress('seeding', `Seeded grocery product: ${product.name}`, 40 + (i / groceryProducts.length) * 10)
    }

    // Seed pharmacy merchants
    updateProgress('seeding', 'Seeding pharmacy stores...', 50)
    for (let i = 0; i < pharmacyMerchants.length; i++) {
      const merchant = pharmacyMerchants[i]
      await setDocument(collections.merchants, merchant.id, {
        ...merchant,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      })
      updateProgress('seeding', `Seeded pharmacy: ${merchant.name}`, 50 + (i / pharmacyMerchants.length) * 5)
    }

    // Seed pharmacy products
    updateProgress('seeding', 'Seeding pharmacy products...', 55)
    for (let i = 0; i < pharmacyProducts.length; i++) {
      const product = pharmacyProducts[i]
      await setDocument(collections.products, product.id, {
        ...product,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      })
      updateProgress('seeding', `Seeded pharmacy product: ${product.name}`, 55 + (i / pharmacyProducts.length) * 10)
    }

    // Seed drivers
    updateProgress('seeding', 'Seeding drivers...', 65)
    for (let i = 0; i < drivers.length; i++) {
      const driver = drivers[i]
      await setDocument(collections.drivers, driver.id, {
        ...driver,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      })
      updateProgress('seeding', `Seeded driver: ${driver.firstName} ${driver.lastName}`, 65 + (i / drivers.length) * 20)
    }

    // Seed promos
    updateProgress('seeding', 'Seeding promo codes...', 85)
    for (let i = 0; i < promos.length; i++) {
      const promo = promos[i]
      await setDocument(collections.promos, promo.id, {
        ...promo,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      })
      updateProgress('seeding', `Seeded promo: ${promo.code}`, 85 + (i / promos.length) * 15)
    }

    const totalMerchants = merchants.length + groceryMerchants.length + pharmacyMerchants.length
    const totalProducts = products.length + groceryProducts.length + pharmacyProducts.length
    updateProgress('success', `Database seeded successfully! ${totalMerchants} merchants (${merchants.length} restaurants, ${groceryMerchants.length} grocery stores, ${pharmacyMerchants.length} pharmacies), ${totalProducts} products, ${drivers.length} drivers, ${promos.length} promos`, 100)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred'
    updateProgress('error', `Failed to seed database: ${message}`, 0)
    throw error
  }
}

// Export counts for UI display
export const seedDataCounts = {
  merchants: merchants.length + groceryMerchants.length + pharmacyMerchants.length,
  restaurants: merchants.length,
  groceryStores: groceryMerchants.length,
  pharmacyStores: pharmacyMerchants.length,
  products: products.length + groceryProducts.length + pharmacyProducts.length,
  restaurantProducts: products.length,
  groceryProducts: groceryProducts.length,
  pharmacyProducts: pharmacyProducts.length,
  drivers: drivers.length,
  promos: promos.length,
}
