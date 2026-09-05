process.env.NODE_ENV = 'test';

import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import app from '../server.js';
import User from '../models/User.js';
import FarmerProfile from '../models/FarmerProfile.js';
import BuyerProfile from '../models/BuyerProfile.js';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Cart from '../models/Cart.js';
import Order from '../models/Order.js';
import Review from '../models/Review.js';
import Notification from '../models/Notification.js';

dotenv.config();

const PORT = 5001;
const BASE_URL = `http://localhost:${PORT}`;
const JWT_SECRET = process.env.JWT_SECRET || 'farm_connect_super_secret_jwt_key_2026';

let serverInstance;
let farmerUser, buyerUser, adminUser, rogueFarmerUser;
let farmerToken, buyerToken, adminToken, rogueFarmerToken;
let farmerProfileId, rogueFarmerProfileId, buyerProfileId;
let category1Id, category2Id;
let createdProductId, secondProductId;
let addressId1, addressId2;
let orderId1, orderId2;

const logSection = (title) => {
  console.log(`\n========================================`);
  console.log(` ${title}`);
  console.log(`========================================`);
};

const assertEqual = (actual, expected, testName) => {
  if (actual === expected) {
    console.log(`✅ PASS: ${testName}`);
  } else {
    console.error(`❌ FAIL: ${testName}`);
    console.error(`   Expected: ${expected}`);
    console.error(`   Actual:   ${actual}`);
    throw new Error(`Test failed: ${testName}`);
  }
};

const assertOk = (condition, testName, message = '') => {
  if (condition) {
    console.log(`✅ PASS: ${testName}`);
  } else {
    console.error(`❌ FAIL: ${testName} ${message}`);
    throw new Error(`Test failed: ${testName}`);
  }
};

async function setup() {
  logSection('SETUP TEST ENVIRONMENT');

  // Connect to MongoDB
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/farm_direct_access';
  await mongoose.connect(mongoUri, { family: 4 });
  console.log('MongoDB connected for tests');

  // Start HTTP server on test port
  await new Promise((resolve) => {
    serverInstance = app.listen(PORT, () => {
      console.log(`Test server listening on ${BASE_URL}`);
      resolve();
    });
  });

  // Clean up existing test data
  const testEmails = [
    'test_farmer_1@example.com',
    'test_buyer_1@example.com',
    'test_admin_1@example.com',
    'test_rogue_farmer@example.com',
    'new_test_buyer@example.com',
    'new_test_farmer@example.com',
    'rogue_admin@example.com',
  ];

  const existingUsers = await User.find({ email: { $in: testEmails } });
  const existingUserIds = existingUsers.map((u) => u._id);

  const existingFarmerProfiles = await FarmerProfile.find({ user: { $in: existingUserIds } });
  const existingFarmerProfileIds = existingFarmerProfiles.map((fp) => fp._id);

  await Cart.deleteMany({ buyer: { $in: existingUserIds } });
  await Order.deleteMany({ buyer: { $in: existingUserIds } });
  await Review.deleteMany({});
  await Notification.deleteMany({});
  await Product.deleteMany({ farmer: { $in: existingFarmerProfileIds } });
  await FarmerProfile.deleteMany({ user: { $in: existingUserIds } });
  await BuyerProfile.deleteMany({ user: { $in: existingUserIds } });
  await User.deleteMany({ email: { $in: testEmails } });
  await Category.deleteMany({ name: { $in: ['Grains & Cereals', 'Fresh Vegetables', 'Organic Pulses & Spices'] } });

  // Create Categories for testing
  const cat1 = await Category.create({ name: 'Grains & Cereals', description: 'Wheat, Rice, Pulses, etc.' });
  const cat2 = await Category.create({ name: 'Fresh Vegetables', description: 'Organic & Farm Fresh Vegetables' });
  category1Id = cat1._id.toString();
  category2Id = cat2._id.toString();

  // Create test users
  farmerUser = await User.create({
    name: 'Ramesh Farmer',
    email: 'test_farmer_1@example.com',
    password: 'password123',
    phone: '9876543210',
    role: 'farmer',
    isVerified: true,
  });

  buyerUser = await User.create({
    name: 'Suresh Buyer',
    email: 'test_buyer_1@example.com',
    password: 'password123',
    phone: '9123456789',
    role: 'buyer',
    isVerified: true,
  });

  adminUser = await User.create({
    name: 'Admin User',
    email: 'test_admin_1@example.com',
    password: 'password123',
    phone: '9999999999',
    role: 'admin',
    isVerified: true,
  });

  rogueFarmerUser = await User.create({
    name: 'Rogue Farmer',
    email: 'test_rogue_farmer@example.com',
    password: 'password123',
    phone: '9888888888',
    role: 'farmer',
    isVerified: true,
  });

  // Generate tokens
  farmerToken = jwt.sign({ id: farmerUser._id }, JWT_SECRET, { expiresIn: '1h' });
  buyerToken = jwt.sign({ id: buyerUser._id }, JWT_SECRET, { expiresIn: '1h' });
  adminToken = jwt.sign({ id: adminUser._id }, JWT_SECRET, { expiresIn: '1h' });
  rogueFarmerToken = jwt.sign({ id: rogueFarmerUser._id }, JWT_SECRET, { expiresIn: '1h' });

  // Create FarmerProfiles required for product tests
  const farmerProfile = await FarmerProfile.create({
    user: farmerUser._id,
    farmName: 'Green Valley Organic Farm',
    village: 'Kheda',
    district: 'Ludhiana',
    state: 'Punjab',
    pincode: '141001',
    farmingType: 'organic',
    verificationStatus: 'verified',
  });
  farmerProfileId = farmerProfile._id.toString();

  const rogueFarmerProfile = await FarmerProfile.create({
    user: rogueFarmerUser._id,
    farmName: 'Rogue Acres',
    village: 'Rampur',
    district: 'Amritsar',
    state: 'Punjab',
    pincode: '143001',
    farmingType: 'conventional',
    verificationStatus: 'verified',
  });
  rogueFarmerProfileId = rogueFarmerProfile._id.toString();

  console.log('Test setup completed successfully.');
}

async function testAdminAPIs() {
  logSection('ADMIN STRUCTURE & AUTH API TESTS');

  // 1. Admin Login & lastLogin update verification
  {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test_admin_1@example.com',
        password: 'password123',
      }),
    });
    const json = await res.json();
    assertEqual(res.status, 200, 'Admin Login returns 200');
    assertEqual(json.success, true, 'Admin Login success=true');
    assertOk(json.token, 'Admin Login returns JWT token');
    assertEqual(json.user.role, 'admin', 'Admin Login user role is admin');
    assertOk(Array.isArray(json.user.permissions), 'Admin permissions is an array');
    assertOk(json.user.permissions.includes('manage_users'), 'Admin permissions include manage_users');
    assertOk(json.user.lastLogin !== null, 'Admin lastLogin updated on login');
  }

  // 2. Farmer Login
  {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test_farmer_1@example.com',
        password: 'password123',
      }),
    });
    const json = await res.json();
    assertEqual(res.status, 200, 'Farmer Login returns 200');
    assertEqual(json.user.role, 'farmer', 'Farmer Login role is farmer');
    assertOk(json.user.lastLogin !== null, 'Farmer lastLogin updated');
  }

  // 3. Buyer Login
  {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test_buyer_1@example.com',
        password: 'password123',
      }),
    });
    const json = await res.json();
    assertEqual(res.status, 200, 'Buyer Login returns 200');
    assertEqual(json.user.role, 'buyer', 'Buyer Login role is buyer');
    assertOk(json.user.lastLogin !== null, 'Buyer lastLogin updated');
  }
}

async function testProductAPIs() {
  logSection('PRODUCT API TESTS');

  // --- CREATE PRODUCT TESTS ---

  // 1. Create Product — Missing required fields
  {
    const res = await fetch(`${BASE_URL}/api/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${farmerToken}`,
      },
      body: JSON.stringify({
        name: 'Organic Wheat',
        // category missing
        description: 'Fresh harvested wheat',
        price: 50,
        unit: 'kg',
        quantityAvailable: 100,
        images: ['https://example.com/wheat.jpg'],
      }),
    });
    const json = await res.json();
    assertEqual(res.status, 400, 'Create Product - Missing category returns 400');
    assertEqual(json.success, false, 'Create Product - Missing field success=false');
  }

  // 2. Create Product — Invalid Category ID
  {
    const res = await fetch(`${BASE_URL}/api/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${farmerToken}`,
      },
      body: JSON.stringify({
        name: 'Organic Wheat',
        category: 'invalid_category_id',
        description: 'Fresh harvested wheat',
        price: 50,
        unit: 'kg',
        quantityAvailable: 100,
        images: ['https://example.com/wheat.jpg'],
      }),
    });
    assertEqual(res.status, 400, 'Create Product - Invalid category ID format returns 400');
  }

  // 3. Create Product — Negative Price
  {
    const res = await fetch(`${BASE_URL}/api/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${farmerToken}`,
      },
      body: JSON.stringify({
        name: 'Organic Wheat',
        category: category1Id,
        description: 'Fresh harvested wheat',
        price: -50,
        unit: 'kg',
        quantityAvailable: 100,
        images: ['https://example.com/wheat.jpg'],
      }),
    });
    assertEqual(res.status, 400, 'Create Product - Negative price returns 400');
  }

  // 4. Create Product — Negative Quantity
  {
    const res = await fetch(`${BASE_URL}/api/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${farmerToken}`,
      },
      body: JSON.stringify({
        name: 'Organic Wheat',
        category: category1Id,
        description: 'Fresh harvested wheat',
        price: 50,
        unit: 'kg',
        quantityAvailable: -10,
        images: ['https://example.com/wheat.jpg'],
      }),
    });
    assertEqual(res.status, 400, 'Create Product - Negative quantity returns 400');
  }

  // 5. Create Product — Empty Images Array
  {
    const res = await fetch(`${BASE_URL}/api/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${farmerToken}`,
      },
      body: JSON.stringify({
        name: 'Organic Wheat',
        category: category1Id,
        description: 'Fresh harvested wheat',
        price: 50,
        unit: 'kg',
        quantityAvailable: 100,
        images: [],
      }),
    });
    assertEqual(res.status, 400, 'Create Product - Empty images array returns 400');
  }

  // 6. Create Product — Invalid Unit
  {
    const res = await fetch(`${BASE_URL}/api/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${farmerToken}`,
      },
      body: JSON.stringify({
        name: 'Organic Wheat',
        category: category1Id,
        description: 'Fresh harvested wheat',
        price: 50,
        unit: 'ton',
        quantityAvailable: 100,
        images: ['https://example.com/wheat.jpg'],
      }),
    });
    assertEqual(res.status, 400, 'Create Product - Invalid unit returns 400');
  }

  // 7. Create Product — Invalid Status
  {
    const res = await fetch(`${BASE_URL}/api/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${farmerToken}`,
      },
      body: JSON.stringify({
        name: 'Organic Wheat',
        category: category1Id,
        description: 'Fresh harvested wheat',
        price: 50,
        unit: 'kg',
        quantityAvailable: 100,
        images: ['https://example.com/wheat.jpg'],
        status: 'unknown_status',
      }),
    });
    assertEqual(res.status, 400, 'Create Product - Invalid status returns 400');
  }

  // 8. Create Product — Buyer Attempt
  {
    const res = await fetch(`${BASE_URL}/api/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${buyerToken}`,
      },
      body: JSON.stringify({
        name: 'Organic Wheat',
        category: category1Id,
        description: 'Fresh harvested wheat',
        price: 50,
        unit: 'kg',
        quantityAvailable: 100,
        images: ['https://example.com/wheat.jpg'],
      }),
    });
    assertEqual(res.status, 403, 'Create Product - Buyer attempt returns 403');
  }

  // 9. Create Product — Unauthenticated Attempt
  {
    const res = await fetch(`${BASE_URL}/api/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Organic Wheat',
        category: category1Id,
        description: 'Fresh harvested wheat',
        price: 50,
        unit: 'kg',
        quantityAvailable: 100,
        images: ['https://example.com/wheat.jpg'],
      }),
    });
    assertEqual(res.status, 401, 'Create Product - Unauthenticated attempt returns 401');
  }

  // 10. Create Product — Valid Farmer Creation (with automatic farmer assignment & location populating)
  {
    const res = await fetch(`${BASE_URL}/api/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${farmerToken}`,
      },
      body: JSON.stringify({
        name: 'Premium Sharbati Wheat',
        category: category1Id,
        description: '100% Organic certified Sharbati wheat grains from Punjab.',
        price: 45,
        unit: 'kg',
        quantityAvailable: 500,
        images: ['https://example.com/images/wheat1.jpg', 'https://example.com/images/wheat2.jpg'],
        isOrganic: true,
        harvestDate: '2026-04-15',
        farmer: rogueFarmerProfileId, // Client trying to assign another farmer profile
        rating: 4.8, // Client trying to forge rating
      }),
    });
    const json = await res.json();
    assertEqual(res.status, 201, 'Create Product - Valid creation returns 201');
    assertEqual(json.success, true, 'Create Product - Success true');
    assertOk(json.data._id, 'Create Product - Product ID generated');
    createdProductId = json.data._id;
    assertEqual(json.data.farmer._id, farmerProfileId, 'Create Product - Farmer profile set automatically (client override ignored)');
    assertEqual(json.data.location.village, 'Kheda', 'Create Product - Location village populated from profile');
    assertEqual(json.data.location.district, 'Ludhiana', 'Create Product - Location district populated from profile');
    assertEqual(json.data.location.state, 'Punjab', 'Create Product - Location state populated from profile');
    assertEqual(json.data.rating, 0, 'Create Product - Rating defaults to 0 (client override ignored)');
    assertEqual(json.data.status, 'active', 'Create Product - Status defaults to active');
  }

  // 11. Create Second Product by Rogue Farmer (for filtering & multi-farmer testing)
  {
    const res = await fetch(`${BASE_URL}/api/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${rogueFarmerToken}`,
      },
      body: JSON.stringify({
        name: 'Fresh Red Tomatoes',
        category: category2Id,
        description: 'Juicy and farm fresh red tomatoes.',
        price: 30,
        unit: 'kg',
        quantityAvailable: 200,
        images: ['https://example.com/images/tomato.jpg'],
        isOrganic: false,
      }),
    });
    const json = await res.json();
    assertEqual(res.status, 201, 'Create Product 2 - Rogue farmer creation returns 201');
    secondProductId = json.data._id;
  }

  // --- READ PRODUCT TESTS ---

  // 12. Get All Products
  {
    const res = await fetch(`${BASE_URL}/api/products`);
    const json = await res.json();
    assertEqual(res.status, 200, 'Get All Products returns 200');
    assertOk(json.count >= 2, 'Get All Products returns at least 2 products');
  }

  // 13. Search Products by Keyword, Price Range & Sorting
  {
    const res = await fetch(`${BASE_URL}/api/products?search=tomato&minPrice=10&maxPrice=100&sort=-price&page=1&limit=10`);
    const json = await res.json();
    assertEqual(res.status, 200, 'Search & Filter Products returns 200');
    assertOk(json.data.length >= 1, 'Search returned matching tomato product');
    assertEqual(json.data[0].name, 'Fresh Red Tomatoes', 'Search returned correct product');
  }

  // 14. Get Product by ID
  {
    const res = await fetch(`${BASE_URL}/api/products/${createdProductId}`);
    const json = await res.json();
    assertEqual(res.status, 200, 'Get Product by ID returns 200');
    assertEqual(json.data.name, 'Premium Sharbati Wheat', 'Get Product by ID returns correct product name');
    assertEqual(json.data.category._id, category1Id, 'Get Product by ID populates category');
  }

  // 15. Filter Products by Category
  {
    const res = await fetch(`${BASE_URL}/api/products?category=${category1Id}`);
    const json = await res.json();
    assertEqual(res.status, 200, 'Filter Products by Category returns 200');
    assertOk(json.data.every((p) => p.category._id === category1Id), 'All returned products match requested category');
  }

  // 16. Filter Products by Location (district)
  {
    const res = await fetch(`${BASE_URL}/api/products?district=Ludhiana`);
    const json = await res.json();
    assertEqual(res.status, 200, 'Filter Products by Location returns 200');
    assertOk(json.data.every((p) => p.location.district === 'Ludhiana'), 'All returned products match district Ludhiana');
  }

  // 17. Filter Products by Organic Status
  {
    const res = await fetch(`${BASE_URL}/api/products?isOrganic=true`);
    const json = await res.json();
    assertEqual(res.status, 200, 'Filter Products by Organic status returns 200');
    assertOk(json.data.every((p) => p.isOrganic === true), 'All returned products are organic');
  }

  // 18. Filter Products by Status
  {
    const res = await fetch(`${BASE_URL}/api/products?status=active`);
    const json = await res.json();
    assertEqual(res.status, 200, 'Filter Products by Status returns 200');
    assertOk(json.data.every((p) => p.status === 'active'), 'All returned products are active');
  }

  // --- UPDATE & TOGGLE PRODUCT TESTS ---

  // 19. Farmer Updates Own Product
  {
    const res = await fetch(`${BASE_URL}/api/products/${createdProductId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${farmerToken}`,
      },
      body: JSON.stringify({
        price: 52,
        quantityAvailable: 450,
      }),
    });
    const json = await res.json();
    assertEqual(res.status, 200, 'Update Product - Farmer updates own product returns 200');
    assertEqual(json.data.price, 52, 'Update Product - Price updated');
    assertEqual(json.data.quantityAvailable, 450, 'Update Product - Quantity updated');
  }

  // 20. Toggle Product Status (PATCH /api/products/:id/status)
  {
    const res = await fetch(`${BASE_URL}/api/products/${createdProductId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${farmerToken}`,
      },
      body: JSON.stringify({ status: 'inactive' }),
    });
    const json = await res.json();
    assertEqual(res.status, 200, 'Toggle Product Status returns 200');
    assertEqual(json.data.status, 'inactive', 'Product status toggled to inactive');

    // Reset back to active
    await fetch(`${BASE_URL}/api/products/${createdProductId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${farmerToken}`,
      },
      body: JSON.stringify({ status: 'active' }),
    });
  }

  // 21. Farmer Attempts to Update Another Farmer's Product
  {
    const res = await fetch(`${BASE_URL}/api/products/${createdProductId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${rogueFarmerToken}`,
      },
      body: JSON.stringify({
        price: 10,
      }),
    });
    assertEqual(res.status, 403, 'Update Product - Non-owner farmer update returns 403');
  }

  // 22. Buyer Attempts to Update Product
  {
    const res = await fetch(`${BASE_URL}/api/products/${createdProductId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${buyerToken}`,
      },
      body: JSON.stringify({
        price: 10,
      }),
    });
    assertEqual(res.status, 403, 'Update Product - Buyer update returns 403');
  }

  // 23. Stock / Status Logic: Setting quantity to 0 updates status to out_of_stock
  {
    const res = await fetch(`${BASE_URL}/api/products/${createdProductId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${farmerToken}`,
      },
      body: JSON.stringify({
        quantityAvailable: 0,
      }),
    });
    const json = await res.json();
    assertEqual(res.status, 200, 'Update Product - Quantity set to 0 returns 200');
    assertEqual(json.data.status, 'out_of_stock', 'Update Product - Status automatically updated to out_of_stock when quantity is 0');
  }

  // --- DELETE PRODUCT TESTS ---

  // 24. Buyer Attempts to Delete Product
  {
    const res = await fetch(`${BASE_URL}/api/products/${createdProductId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${buyerToken}` },
    });
    assertEqual(res.status, 403, 'Delete Product - Buyer attempt returns 403');
  }

  // 25. Farmer Attempts to Delete Another Farmer's Product
  {
    const res = await fetch(`${BASE_URL}/api/products/${createdProductId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${rogueFarmerToken}` },
    });
    assertEqual(res.status, 403, 'Delete Product - Non-owner farmer attempt returns 403');
  }

  // 26. Owning Farmer Deletes Own Product
  {
    const res = await fetch(`${BASE_URL}/api/products/${createdProductId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${farmerToken}` },
    });
    const json = await res.json();
    assertEqual(res.status, 200, 'Delete Product - Owning farmer delete returns 200');
    assertEqual(json.success, true, 'Delete Product - Success true');

    // Verify product deleted from MongoDB
    const checkRes = await fetch(`${BASE_URL}/api/products/${createdProductId}`);
    assertEqual(checkRes.status, 404, 'Delete Product - GET deleted product returns 404');
  }
}

async function testFarmerProfileAPIs() {
  logSection('FARMER PROFILE API TESTS');

  // 1. Create Farmer Profile — Missing required field
  {
    const res = await fetch(`${BASE_URL}/api/farmer-profiles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${farmerToken}`,
      },
      body: JSON.stringify({
        farmName: 'Green Acres Farm',
        village: 'Kheda',
        // district missing
        state: 'Punjab',
        pincode: '141001',
      }),
    });
    const json = await res.json();
    assertEqual(res.status, 400, 'Farmer Profile - Create missing required field returns 400');
    assertEqual(json.success, false, 'Farmer Profile - Create missing field success=false');
  }

  // 2. Get Logged-in Farmer Profile (/me)
  {
    const res = await fetch(`${BASE_URL}/api/farmer-profiles/me`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${farmerToken}` },
    });
    const json = await res.json();
    assertEqual(res.status, 200, 'Farmer Profile - Get own profile returns 200');
    assertEqual(json.data._id, farmerProfileId, 'Farmer Profile - Get own profile returned correct ID');
    assertEqual(json.data.user.email, 'test_farmer_1@example.com', 'Farmer Profile - User populated correctly');
  }

  // 3. Get Farmer Profile by ID
  {
    const res = await fetch(`${BASE_URL}/api/farmer-profiles/${farmerProfileId}`, {
      method: 'GET',
    });
    const json = await res.json();
    assertEqual(res.status, 200, 'Farmer Profile - Get by ID returns 200');
    assertEqual(json.data.farmName, 'Green Valley Organic Farm', 'Farmer Profile - Get by ID correct farmName');
  }

  // 4. Update Own Farmer Profile
  {
    const res = await fetch(`${BASE_URL}/api/farmer-profiles/me`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${farmerToken}`,
      },
      body: JSON.stringify({
        farmName: 'Green Valley Premium Organic Farm',
        bankDetails: {
          upiId: 'ramesh.updated@upi',
        },
      }),
    });
    const json = await res.json();
    assertEqual(res.status, 200, 'Farmer Profile - Update own profile returns 200');
    assertEqual(json.data.farmName, 'Green Valley Premium Organic Farm', 'Farmer Profile - Updated farmName persisted');
  }

  // 5. Attempt Unauthorized Update by another farmer
  {
    const res = await fetch(`${BASE_URL}/api/farmer-profiles/${farmerProfileId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${rogueFarmerToken}`,
      },
      body: JSON.stringify({
        farmName: 'Hacked Farm Name',
      }),
    });
    const json = await res.json();
    assertEqual(res.status, 403, 'Farmer Profile - Unauthorized update returns 403');
  }
}

async function testBuyerProfileAPIs() {
  logSection('BUYER PROFILE API TESTS');

  // 1. Create Buyer Profile — Valid request
  {
    const res = await fetch(`${BASE_URL}/api/buyer-profiles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${buyerToken}`,
      },
      body: JSON.stringify({
        preferredCategories: ['Vegetables', 'Fruits', 'Organic Spices'],
        deliveryAddresses: [
          {
            label: 'Home',
            address: '123 Park Avenue',
            city: 'Chandigarh',
            state: 'Punjab',
            pincode: '160001',
            isDefault: true,
          },
        ],
      }),
    });
    const json = await res.json();
    assertEqual(res.status, 201, 'Buyer Profile - Create valid buyer profile returns 201');
    buyerProfileId = json.data._id;
  }

  // 2. Get Logged-in Buyer Profile (/me)
  {
    const res = await fetch(`${BASE_URL}/api/buyer-profiles/me`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${buyerToken}` },
    });
    const json = await res.json();
    assertEqual(res.status, 200, 'Buyer Profile - Get own buyer profile returns 200');
    assertEqual(json.data._id, buyerProfileId, 'Buyer Profile - Get own profile correct ID');
  }
}

async function testAuthAndErrorHandling() {
  logSection('AUTHENTICATION & ERROR HANDLING TESTS');

  // 1. Unauthenticated Request
  {
    const res = await fetch(`${BASE_URL}/api/farmer-profiles/me`, {
      method: 'GET',
    });
    assertEqual(res.status, 401, 'Auth - Missing token returns 401');
  }

  // 2. Invalid Token Request
  {
    const res = await fetch(`${BASE_URL}/api/farmer-profiles/me`, {
      method: 'GET',
      headers: { Authorization: 'Bearer invalid_token_xyz' },
    });
    assertEqual(res.status, 401, 'Auth - Invalid token returns 401');
  }

  // 3. Admin Route standard user attempt
  {
    const res = await fetch(`${BASE_URL}/api/farmer-profiles/507f1f77bcf86cd799439011/verification-status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${buyerToken}`,
      },
      body: JSON.stringify({ verificationStatus: 'verified' }),
    });
    assertEqual(res.status, 403, 'Auth - Non-admin accessing admin route returns 403');
  }
}

async function testCartAPIs() {
  logSection('CART API TESTS');

  // 1. Get empty cart
  {
    const res = await fetch(`${BASE_URL}/api/cart`, {
      headers: { Authorization: `Bearer ${buyerToken}` },
    });
    const json = await res.json();
    assertEqual(res.status, 200, 'Cart - Buyer gets empty cart returns 200');
    assertEqual(json.cart.items.length, 0, 'Cart - Items array is empty');
  }

  // 2. Add product to cart
  {
    const res = await fetch(`${BASE_URL}/api/cart/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${buyerToken}`,
      },
      body: JSON.stringify({
        product: secondProductId,
        quantity: 2,
      }),
    });
    const json = await res.json();
    assertEqual(res.status, 201, 'Cart - Add valid product returns 201');
    assertEqual(json.cart.items.length, 1, 'Cart - Item count is 1');
    assertEqual(json.cart.items[0].quantity, 2, 'Cart - Item quantity is 2');
  }
}

async function testOrderAPIs() {
  logSection('ORDER API TESTS');

  // 1. Get Buyer Orders
  {
    const res = await fetch(`${BASE_URL}/api/orders?buyer=me`, {
      headers: { Authorization: `Bearer ${buyerToken}` },
    });
    const json = await res.json();
    assertEqual(res.status, 200, 'Order - GET /api/orders?buyer=me returns 200');
  }
}

async function testReviewAPIs() {
  logSection('REVIEW API TESTS');

  // 1. Unauthenticated attempt returns 401
  {
    const res = await fetch(`${BASE_URL}/api/reviews/product/${secondProductId}`);
    assertEqual(res.status, 200, 'Review - Public product reviews returns 200');
  }
}

async function testNotificationAPIs() {
  logSection('NOTIFICATION API TESTS');

  {
    const res = await fetch(`${BASE_URL}/api/notifications`, {
      headers: { Authorization: `Bearer ${farmerToken}` },
    });
    assertEqual(res.status, 200, 'Notification - Farmer get notifications returns 200');
  }
}

async function testNewFeatures() {
  logSection('NEW FEATURES: REGISTER, CATEGORY, ADMIN & ROLE CONSTRAINT TESTS');

  let newBuyerToken, newFarmerToken;

  // 1. Register Buyer -> 201
  {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'New Test Buyer',
        email: 'new_test_buyer@example.com',
        password: 'password123',
        phone: '9111111111',
        role: 'buyer',
      }),
    });
    const json = await res.json();
    assertEqual(res.status, 201, 'Register - Buyer registration returns 201');
    assertEqual(json.user.role, 'buyer', 'Register - Role is buyer');
    assertOk(Boolean(json.token), 'Register - JWT token returned');
    newBuyerToken = json.token;
  }

  // 2. Register Farmer -> 201
  {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'New Test Farmer',
        email: 'new_test_farmer@example.com',
        password: 'password123',
        phone: '9222222222',
        role: 'farmer',
      }),
    });
    const json = await res.json();
    assertEqual(res.status, 201, 'Register - Farmer registration returns 201');
    assertEqual(json.user.role, 'farmer', 'Register - Role is farmer');
    assertOk(Boolean(json.token), 'Register - JWT token returned');
    newFarmerToken = json.token;
  }

  // 3. Register Admin -> 400 (Admin registration blocked)
  {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Rogue Admin Attempt',
        email: 'rogue_admin@example.com',
        password: 'password123',
        phone: '9333333333',
        role: 'admin',
      }),
    });
    assertEqual(res.status, 400, 'Register - Public admin registration returns 400');
  }

  // 4. Register Duplicate Email -> 400
  {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Duplicate Email User',
        email: 'new_test_buyer@example.com',
        password: 'password123',
        phone: '9444444444',
        role: 'buyer',
      }),
    });
    assertEqual(res.status, 400, 'Register - Duplicate email registration returns 400');
  }

  // 5. Create Category (Admin Only) -> 201
  let newCatId;
  {
    const res = await fetch(`${BASE_URL}/api/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: 'Organic Pulses & Spices',
        description: 'Pure organic pulses and spices direct from fields',
      }),
    });
    const json = await res.json();
    assertEqual(res.status, 201, 'Category - Create category returns 201');
    assertEqual(json.data.slug, 'organic-pulses-spices', 'Category - Slug auto-generated from name');
    newCatId = json.data._id;
  }

  // 6. Get Categories (Public) -> 200
  {
    const res = await fetch(`${BASE_URL}/api/categories`);
    const json = await res.json();
    assertEqual(res.status, 200, 'Category - Public get categories returns 200');
    assertOk(json.data.length >= 3, 'Category - Active categories returned');
  }

  // 7. Prevent Unsafe Category Deletion -> 400 when category has products
  {
    const res = await fetch(`${BASE_URL}/api/categories/${category2Id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const json = await res.json();
    assertEqual(res.status, 400, 'Category - Unsafe deletion rejected when products exist');
  }

  // 8. Admin APIs: Get Users -> 200
  {
    const res = await fetch(`${BASE_URL}/api/admin/users`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const json = await res.json();
    assertEqual(res.status, 200, 'Admin API - Get users returns 200');
    assertOk(json.data.length > 0, 'Admin API - Users list populated');
  }

  // 9. Admin APIs: Dashboard Stats -> 200
  {
    const res = await fetch(`${BASE_URL}/api/admin/dashboard-stats`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const json = await res.json();
    assertEqual(res.status, 200, 'Admin API - Dashboard stats alias returns 200');
    assertOk(json.data.totalUsers >= 4, 'Admin API - Stats totalUsers populated');
  }

  // 10. Admin APIs: Verify Farmer -> 200
  {
    const res = await fetch(`${BASE_URL}/api/admin/farmers/${farmerProfileId}/verify`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ verificationStatus: 'verified' }),
    });
    const json = await res.json();
    assertEqual(res.status, 200, 'Admin API - Verify farmer returns 200');
  }
}

async function teardown() {
  logSection('CLEANUP & TEARDOWN');

  const testEmails = [
    'test_farmer_1@example.com',
    'test_buyer_1@example.com',
    'test_admin_1@example.com',
    'test_rogue_farmer@example.com',
    'new_test_buyer@example.com',
    'new_test_farmer@example.com',
    'rogue_admin@example.com',
  ];
  const users = await User.find({ email: { $in: testEmails } });
  const uIds = users.map((u) => u._id);

  const farmerProfiles = await FarmerProfile.find({ user: { $in: uIds } });
  const fpIds = farmerProfiles.map((fp) => fp._id);

  await Cart.deleteMany({ buyer: { $in: uIds } });
  await Order.deleteMany({ buyer: { $in: uIds } });
  await Review.deleteMany({});
  await Notification.deleteMany({});
  await Product.deleteMany({ farmer: { $in: fpIds } });
  await FarmerProfile.deleteMany({ user: { $in: uIds } });
  await BuyerProfile.deleteMany({ user: { $in: uIds } });
  await User.deleteMany({ email: { $in: testEmails } });
  await Category.deleteMany({ name: { $in: ['Grains & Cereals', 'Fresh Vegetables', 'Organic Pulses & Spices'] } });

  console.log('Test data cleaned up from MongoDB.');
  if (serverInstance) {
    serverInstance.close();
    console.log('Test server closed.');
  }
  await mongoose.connection.close();
  console.log('MongoDB connection closed.');
}

async function runAllTests() {
  try {
    await setup();
    await testAdminAPIs();
    await testProductAPIs();
    await testFarmerProfileAPIs();
    await testBuyerProfileAPIs();
    await testAuthAndErrorHandling();
    await testCartAPIs();
    await testOrderAPIs();
    await testReviewAPIs();
    await testNotificationAPIs();
    await testNewFeatures();
    logSection('ALL TESTS PASSED SUCCESSFULLY! 🎉');
    await teardown();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ TEST RUN FAILED:', error.message);
    try {
      await teardown();
    } catch (e) {
      // ignore
    }
    process.exit(1);
  }
}

runAllTests();
