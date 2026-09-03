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
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';

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
  await Category.deleteMany({ name: { $in: ['Grains & Cereals', 'Fresh Vegetables'] } });

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

  // 13. Get Product by ID
  {
    const res = await fetch(`${BASE_URL}/api/products/${createdProductId}`);
    const json = await res.json();
    assertEqual(res.status, 200, 'Get Product by ID returns 200');
    assertEqual(json.data.name, 'Premium Sharbati Wheat', 'Get Product by ID returns correct product name');
    assertEqual(json.data.category._id, category1Id, 'Get Product by ID populates category');
  }

  // 14. Filter Products by Category
  {
    const res = await fetch(`${BASE_URL}/api/products?category=${category1Id}`);
    const json = await res.json();
    assertEqual(res.status, 200, 'Filter Products by Category returns 200');
    assertOk(json.data.every((p) => p.category._id === category1Id), 'All returned products match requested category');
  }

  // 15. Filter Products by Location (district)
  {
    const res = await fetch(`${BASE_URL}/api/products?district=Ludhiana`);
    const json = await res.json();
    assertEqual(res.status, 200, 'Filter Products by Location returns 200');
    assertOk(json.data.every((p) => p.location.district === 'Ludhiana'), 'All returned products match district Ludhiana');
  }

  // 16. Filter Products by Organic Status
  {
    const res = await fetch(`${BASE_URL}/api/products?isOrganic=true`);
    const json = await res.json();
    assertEqual(res.status, 200, 'Filter Products by Organic status returns 200');
    assertOk(json.data.every((p) => p.isOrganic === true), 'All returned products are organic');
  }

  // 17. Filter Products by Status
  {
    const res = await fetch(`${BASE_URL}/api/products?status=active`);
    const json = await res.json();
    assertEqual(res.status, 200, 'Filter Products by Status returns 200');
    assertOk(json.data.every((p) => p.status === 'active'), 'All returned products are active');
  }

  // --- UPDATE PRODUCT TESTS ---

  // 18. Farmer Updates Own Product
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

  // 19. Farmer Attempts to Update Another Farmer's Product
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

  // 20. Buyer Attempts to Update Product
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

  // 21. Protected Fields (farmer, rating, createdAt) Cannot Be Mutated on Update
  {
    const res = await fetch(`${BASE_URL}/api/products/${createdProductId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${farmerToken}`,
      },
      body: JSON.stringify({
        farmer: rogueFarmerProfileId,
        rating: 5,
        createdAt: '2020-01-01T00:00:00.000Z',
      }),
    });
    const json = await res.json();
    assertEqual(res.status, 200, 'Update Product - Protected fields update handled');
    assertEqual(json.data.farmer._id, farmerProfileId, 'Update Product - Farmer ownership remained unchanged');
    assertEqual(json.data.rating, 0, 'Update Product - Rating remained unchanged');
    assertOk(json.data.createdAt !== '2020-01-01T00:00:00.000Z', 'Update Product - createdAt remained unchanged');
  }

  // 22. Stock / Status Logic: Setting quantity to 0 updates status to out_of_stock
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

  // 23. Buyer Attempts to Delete Product
  {
    const res = await fetch(`${BASE_URL}/api/products/${createdProductId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${buyerToken}` },
    });
    assertEqual(res.status, 403, 'Delete Product - Buyer attempt returns 403');
  }

  // 24. Unauthenticated Attempt to Delete Product
  {
    const res = await fetch(`${BASE_URL}/api/products/${createdProductId}`, {
      method: 'DELETE',
    });
    assertEqual(res.status, 401, 'Delete Product - Unauthenticated attempt returns 401');
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

async function teardown() {
  logSection('CLEANUP & TEARDOWN');

  const testEmails = [
    'test_farmer_1@example.com',
    'test_buyer_1@example.com',
    'test_admin_1@example.com',
    'test_rogue_farmer@example.com',
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
  await Category.deleteMany({ name: { $in: ['Grains & Cereals', 'Fresh Vegetables'] } });

  console.log('Test data cleaned up from MongoDB.');

  if (serverInstance) {
    await new Promise((resolve) => serverInstance.close(resolve));
    console.log('Test server closed.');
  }

  await mongoose.connection.close();
  console.log('MongoDB connection closed.');
}

async function testCartAPIs() {
  logSection('CART API TESTS');

  // Ensure active products exist for Cart & Order testing
  const prod1 = await Product.create({
    name: 'Organic Wheat Grain',
    category: category1Id,
    description: 'Farm fresh organic wheat',
    price: 500,
    unit: 'kg',
    quantityAvailable: 50,
    images: ['https://example.com/wheat.jpg'],
    farmer: farmerProfileId,
    location: { village: 'Kheda', district: 'Ludhiana', state: 'Punjab' },
    status: 'active',
  });
  createdProductId = prod1._id.toString();

  const prod2 = await Product.create({
    name: 'Fresh Tomatoes',
    category: category2Id,
    description: 'Juicy red tomatoes',
    price: 150,
    unit: 'kg',
    quantityAvailable: 30,
    images: ['https://example.com/tomato.jpg'],
    farmer: rogueFarmerProfileId,
    location: { village: 'Rampur', district: 'Amritsar', state: 'Punjab' },
    status: 'active',
  });
  secondProductId = prod2._id.toString();

  // 1. Get empty cart
  {
    const res = await fetch(`${BASE_URL}/api/cart`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${buyerToken}` },
    });
    const json = await res.json();
    assertEqual(res.status, 200, 'Cart - Buyer gets empty cart returns 200');
    assertEqual(json.success, true, 'Cart - Success true');
    assertEqual(json.cart.items.length, 0, 'Cart - Items array is empty');
    assertEqual(json.cart.calculatedCartTotal, 0, 'Cart - Dynamic total is 0');
  }

  // 2. Add valid product
  {
    const res = await fetch(`${BASE_URL}/api/cart/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${buyerToken}`,
      },
      body: JSON.stringify({ product: createdProductId, quantity: 2 }),
    });
    const json = await res.json();
    assertEqual(res.status, 201, 'Cart - Add valid product returns 201');
    assertEqual(json.cart.items.length, 1, 'Cart - Item count is 1');
    assertEqual(json.cart.items[0].quantity, 2, 'Cart - Item quantity is 2');
    assertEqual(json.cart.items[0].priceAtAdd, 500, 'Cart - priceAtAdd stored correctly');
  }

  // 3. Add same product again (quantity increase)
  {
    const res = await fetch(`${BASE_URL}/api/cart/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${buyerToken}`,
      },
      body: JSON.stringify({ product: createdProductId, quantity: 3 }),
    });
    const json = await res.json();
    assertEqual(res.status, 201, 'Cart - Add same product again increases quantity');
    assertEqual(json.cart.items.length, 1, 'Cart - No duplicate item entries created');
    assertEqual(json.cart.items[0].quantity, 5, 'Cart - Quantity updated to 5');
  }

  // 4. Update cart item quantity
  {
    const res = await fetch(`${BASE_URL}/api/cart/items/${createdProductId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${buyerToken}`,
      },
      body: JSON.stringify({ quantity: 4 }),
    });
    const json = await res.json();
    assertEqual(res.status, 200, 'Cart - Update item quantity returns 200');
    assertEqual(json.cart.items[0].quantity, 4, 'Cart - Quantity updated to 4');
  }

  // 5. Invalid product ID
  {
    const res = await fetch(`${BASE_URL}/api/cart/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${buyerToken}`,
      },
      body: JSON.stringify({ product: 'invalid_id', quantity: 1 }),
    });
    assertEqual(res.status, 400, 'Cart - Invalid product ID returns 400');
  }

  // 6. Non-existing product
  {
    const res = await fetch(`${BASE_URL}/api/cart/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${buyerToken}`,
      },
      body: JSON.stringify({ product: '507f1f77bcf86cd799439011', quantity: 1 }),
    });
    assertEqual(res.status, 404, 'Cart - Non-existing product returns 404');
  }

  // 7. Quantity = 0
  {
    const res = await fetch(`${BASE_URL}/api/cart/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${buyerToken}`,
      },
      body: JSON.stringify({ product: createdProductId, quantity: 0 }),
    });
    assertEqual(res.status, 400, 'Cart - Quantity = 0 returns 400');
  }

  // 8. Negative quantity
  {
    const res = await fetch(`${BASE_URL}/api/cart/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${buyerToken}`,
      },
      body: JSON.stringify({ product: createdProductId, quantity: -5 }),
    });
    assertEqual(res.status, 400, 'Cart - Negative quantity returns 400');
  }

  // 9. Unauthorized role access (Farmer attempting cart add)
  {
    const res = await fetch(`${BASE_URL}/api/cart/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${farmerToken}`,
      },
      body: JSON.stringify({ product: createdProductId, quantity: 1 }),
    });
    assertEqual(res.status, 403, 'Cart - Farmer role accessing cart returns 403');
  }

  // 10. Unauthenticated access
  {
    const res = await fetch(`${BASE_URL}/api/cart`, {
      method: 'GET',
    });
    assertEqual(res.status, 401, 'Cart - Unauthenticated request returns 401');
  }

  // 11. Price change detection
  {
    // Update product price in DB to 600 (was 500)
    await Product.findByIdAndUpdate(createdProductId, { price: 600 });

    const res = await fetch(`${BASE_URL}/api/cart`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${buyerToken}` },
    });
    const json = await res.json();
    assertEqual(res.status, 200, 'Cart - Get cart after price change returns 200');
    const item = json.cart.items[0];
    assertEqual(item.priceAtAdd, 500, 'Cart - priceAtAdd remains 500');
    assertEqual(item.currentPrice, 600, 'Cart - currentPrice reflects updated 600');
    assertEqual(item.priceChanged, true, 'Cart - priceChanged set to true');
    assertEqual(json.cart.calculatedCartTotal, 4 * 600, 'Cart - Total calculated using current price');

    // Restore original price 500
    await Product.findByIdAndUpdate(createdProductId, { price: 500 });
  }

  // 12. Remove cart item
  {
    const res = await fetch(`${BASE_URL}/api/cart/items/${createdProductId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${buyerToken}` },
    });
    const json = await res.json();
    assertEqual(res.status, 200, 'Cart - Remove item returns 200');
    assertEqual(json.cart.items.length, 0, 'Cart - Item removed successfully');
  }

  // 13. Clear cart
  {
    // Add product again to clear
    await fetch(`${BASE_URL}/api/cart/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${buyerToken}`,
      },
      body: JSON.stringify({ product: createdProductId, quantity: 1 }),
    });

    const res = await fetch(`${BASE_URL}/api/cart`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${buyerToken}` },
    });
    const json = await res.json();
    assertEqual(res.status, 200, 'Cart - Clear cart returns 200');
    assertEqual(json.cart.items.length, 0, 'Cart - Cart items empty');
  }
}

async function testOrderAPIs() {
  logSection('ORDER API TESTS');

  // 1. Empty cart checkout attempt
  {
    const res = await fetch(`${BASE_URL}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${buyerToken}`,
      },
      body: JSON.stringify({
        deliveryAddress: {
          label: 'Home',
          address: '789 Main St',
          city: 'Ludhiana',
          state: 'Punjab',
          pincode: '141001',
        },
      }),
    });
    assertEqual(res.status, 400, 'Order - Empty cart checkout returns 400');
  }

  // Setup multi-farmer items in cart for multi-farmer order testing
  // Re-create product 1 for Farmer 1 (since original createdProductId was deleted in testProductAPIs)
  const p1 = await Product.create({
    name: 'Organic Wheat Grain',
    category: category1Id,
    description: 'High quality organic wheat',
    price: 100,
    unit: 'kg',
    quantityAvailable: 50,
    images: ['http://example.com/wheat.jpg'],
    farmer: farmerProfileId,
    location: { village: 'Samrala', district: 'Ludhiana', state: 'Punjab' },
    status: 'active',
  });
  createdProductId = p1._id.toString();

  await Product.findByIdAndUpdate(secondProductId, { quantityAvailable: 20, price: 150, status: 'active' });

  // 2. Add product 1 and product 2 to cart
  await fetch(`${BASE_URL}/api/cart/items`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${buyerToken}`,
    },
    body: JSON.stringify({ product: createdProductId, quantity: 2 }),
  });

  await fetch(`${BASE_URL}/api/cart/items`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${buyerToken}`,
    },
    body: JSON.stringify({ product: secondProductId, quantity: 3 }),
  });

  // 3. Valid multi-farmer checkout
  {
    const res = await fetch(`${BASE_URL}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${buyerToken}`,
      },
      body: JSON.stringify({
        deliveryAddress: {
          label: 'Farm House',
          address: '456 Green Road',
          city: 'Ludhiana',
          state: 'Punjab',
          pincode: '141002',
        },
        paymentMethod: 'COD',
      }),
    });
    const json = await res.json();
    assertEqual(res.status, 201, 'Order - Valid multi-farmer checkout returns 201');
    assertEqual(json.success, true, 'Order - Checkout success=true');
    assertOk(Array.isArray(json.orders), 'Order - Returns array of generated orders');
    assertEqual(json.orders.length, 2, 'Order - Multi-farmer cart split into 2 separate orders');

    // Verify totals and snapshots
    const o1 = json.orders.find((o) => o.farmer.toString() === farmerProfileId);
    const o2 = json.orders.find((o) => o.farmer.toString() === rogueFarmerProfileId);

    assertOk(o1, 'Order 1 exists for Farmer 1');
    assertOk(o2, 'Order 2 exists for Rogue Farmer 2');

    orderId1 = o1._id;
    orderId2 = o2._id;

    assertEqual(o1.totalAmount, 2 * 100, 'Order 1 total calculated correctly on backend (200)');
    assertEqual(o2.totalAmount, 3 * 150, 'Order 2 total calculated correctly on backend (450)');

    assertEqual(o1.items[0].name, 'Organic Wheat Grain', 'Order 1 item snapshot name accurate');
    assertEqual(o1.items[0].price, 100, 'Order 1 item snapshot price accurate');

    assertEqual(o1.deliveryAddress.address, '456 Green Road', 'Order delivery address snapshot accurate');
  }

  // 4. Verify cart cleared after checkout
  {
    const res = await fetch(`${BASE_URL}/api/cart`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${buyerToken}` },
    });
    const json = await res.json();
    assertEqual(json.cart.items.length, 0, 'Order - Cart cleared after successful checkout');
  }

  // 5. Verify stock decremented
  {
    const p1 = await Product.findById(createdProductId);
    const p2 = await Product.findById(secondProductId);
    assertEqual(p1.quantityAvailable, 48, 'Order - Stock for product 1 decremented from 50 to 48');
    assertEqual(p2.quantityAvailable, 17, 'Order - Stock for product 2 decremented from 20 to 17');
  }

  // 6. Insufficient stock checkout protection
  {
    // Set stock of product 1 to 1
    await Product.findByIdAndUpdate(createdProductId, { quantityAvailable: 1 });

    // Add quantity 5 to cart
    await fetch(`${BASE_URL}/api/cart/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${buyerToken}`,
      },
      body: JSON.stringify({ product: createdProductId, quantity: 5 }),
    });

    const res = await fetch(`${BASE_URL}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${buyerToken}`,
      },
      body: JSON.stringify({
        deliveryAddress: {
          address: '456 Green Road',
          city: 'Ludhiana',
          state: 'Punjab',
          pincode: '141002',
        },
      }),
    });
    assertEqual(res.status, 400, 'Order - Insufficient stock checkout returns 400');

    // Clean up cart
    await fetch(`${BASE_URL}/api/cart`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${buyerToken}` },
    });
    // Reset stock to 48
    await Product.findByIdAndUpdate(createdProductId, { quantityAvailable: 48 });
  }

  // 7. Get Buyer Orders
  {
    const res = await fetch(`${BASE_URL}/api/orders/my-orders`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${buyerToken}` },
    });
    const json = await res.json();
    assertEqual(res.status, 200, 'Order - Buyer get my-orders returns 200');
    assertOk(json.orders.length >= 2, 'Order - Buyer my-orders count >= 2');
  }

  // 8. Get Single Order by ID (Owner Buyer)
  {
    const res = await fetch(`${BASE_URL}/api/orders/${orderId1}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${buyerToken}` },
    });
    const json = await res.json();
    assertEqual(res.status, 200, 'Order - Buyer get single order returns 200');
    assertEqual(json.order._id, orderId1, 'Order - Correct single order returned');
  }

  // 9. Unauthorized view of order (Other user trying to view)
  {
    const res = await fetch(`${BASE_URL}/api/orders/${orderId1}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${rogueFarmerToken}` },
    });
    assertEqual(res.status, 403, 'Order - Non-owner viewing order returns 403');
  }

  // 10. Buyer cancels pending order (Order 1)
  {
    const res = await fetch(`${BASE_URL}/api/orders/${orderId1}/cancel`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${buyerToken}`,
      },
      body: JSON.stringify({ reason: 'Changed my mind' }),
    });
    const json = await res.json();
    assertEqual(res.status, 200, 'Order - Buyer cancel pending order returns 200');
    assertEqual(json.order.orderStatus, 'cancelled', 'Order - Status updated to cancelled');
    assertOk(
      json.order.statusHistory.some((h) => h.status === 'cancelled'),
      'Order - statusHistory includes cancelled'
    );

    // Verify stock was restored from 48 back to 50
    const p1 = await Product.findById(createdProductId);
    assertEqual(p1.quantityAvailable, 50, 'Order - Stock restored on cancellation');
  }

  // 11. Farmer views own orders (Farmer 2 views order 2)
  {
    const res = await fetch(`${BASE_URL}/api/orders/farmer`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${rogueFarmerToken}` },
    });
    const json = await res.json();
    assertEqual(res.status, 200, 'Order - Farmer get farmer orders returns 200');
    assertOk(json.orders.some((o) => o._id === orderId2), 'Order - Farmer orders list includes order 2');
  }

  // 12. Farmer 2 accepts Order 2 (pending -> accepted)
  {
    const res = await fetch(`${BASE_URL}/api/orders/${orderId2}/accept`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${rogueFarmerToken}` },
    });
    const json = await res.json();
    assertEqual(res.status, 200, 'Order - Farmer accept pending order returns 200');
    assertEqual(json.order.orderStatus, 'accepted', 'Order - Status updated to accepted');
  }

  // 13. Farmer 2 starts processing Order 2 (accepted -> processing)
  {
    const res = await fetch(`${BASE_URL}/api/orders/${orderId2}/process`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${rogueFarmerToken}` },
    });
    const json = await res.json();
    assertEqual(res.status, 200, 'Order - Farmer process accepted order returns 200');
    assertEqual(json.order.orderStatus, 'processing', 'Order - Status updated to processing');
  }

  // 14. Buyer attempts cancel after processing (Should Fail)
  {
    const res = await fetch(`${BASE_URL}/api/orders/${orderId2}/cancel`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${buyerToken}` },
    });
    assertEqual(res.status, 400, 'Order - Cancel after processing returns 400');
  }

  // 15. Farmer 2 ships Order 2 (processing -> shipped)
  {
    const res = await fetch(`${BASE_URL}/api/orders/${orderId2}/ship`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${rogueFarmerToken}` },
    });
    const json = await res.json();
    assertEqual(res.status, 200, 'Order - Farmer ship processing order returns 200');
    assertEqual(json.order.orderStatus, 'shipped', 'Order - Status updated to shipped');
  }

  // 16. Farmer 2 marks Order 2 delivered (shipped -> delivered)
  {
    const res = await fetch(`${BASE_URL}/api/orders/${orderId2}/deliver`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${rogueFarmerToken}` },
    });
    const json = await res.json();
    assertEqual(res.status, 200, 'Order - Deliver shipped order returns 200');
    assertEqual(json.order.orderStatus, 'delivered', 'Order - Status updated to delivered');
  }

  // 17. Invalid status transition (attempting deliver again on delivered order)
  {
    const res = await fetch(`${BASE_URL}/api/orders/${orderId2}/deliver`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${rogueFarmerToken}` },
    });
    assertEqual(res.status, 400, 'Order - Invalid status transition returns 400');
  }

  // 18. Farmer 1 attempting to modify Farmer 2's order
  {
    const res = await fetch(`${BASE_URL}/api/orders/${orderId2}/process`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${farmerToken}` },
    });
    assertEqual(res.status, 403, 'Order - Cross-farmer modification returns 403');
  }

  // 19. Historical Snapshot Preservation Test
  {
    // Change product price and unit in DB
    await Product.findByIdAndUpdate(secondProductId, { price: 999, unit: 'quintal' });

    const res = await fetch(`${BASE_URL}/api/orders/${orderId2}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${buyerToken}` },
    });
    const json = await res.json();
    assertEqual(json.order.items[0].price, 150, 'Data Integrity - Historical order item price snapshot preserved (150)');
    assertEqual(json.order.items[0].unit, 'kg', 'Data Integrity - Historical order item unit snapshot preserved (kg)');
  }
}

async function testReviewAPIs() {
  logSection('REVIEW API TESTS');

  let reviewId;

  // 1. Unauthenticated create review -> 401
  {
    const res = await fetch(`${BASE_URL}/api/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        product: secondProductId,
        order: orderId2,
        rating: 5,
        comment: 'Unauth attempt',
      }),
    });
    assertEqual(res.status, 401, 'Review - Unauthenticated attempt returns 401');
  }

  // 2. Farmer attempts to create review -> 403
  {
    const res = await fetch(`${BASE_URL}/api/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${farmerToken}`,
      },
      body: JSON.stringify({
        product: secondProductId,
        order: orderId2,
        rating: 5,
        comment: 'Farmer attempt',
      }),
    });
    assertEqual(res.status, 403, 'Review - Farmer role creation attempt returns 403');
  }

  // 3. Buyer attempts review before delivery -> 400
  {
    const pendingOrder = await Order.create({
      buyer: buyerUser._id,
      farmer: rogueFarmerProfileId,
      items: [
        {
          product: secondProductId,
          name: 'Organically Grown Wheat',
          price: 150,
          quantity: 1,
          unit: 'kg',
        },
      ],
      deliveryAddress: {
        address: '123 Main St',
        city: 'Ludhiana',
        state: 'Punjab',
        pincode: '141001',
      },
      totalAmount: 150,
      paymentStatus: 'pending',
      paymentMethod: 'COD',
      orderStatus: 'pending',
    });

    const res = await fetch(`${BASE_URL}/api/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${buyerToken}`,
      },
      body: JSON.stringify({
        product: secondProductId,
        order: pendingOrder._id.toString(),
        rating: 5,
        comment: 'Undelivered order attempt',
      }),
    });
    assertEqual(res.status, 400, 'Review - Buyer attempts review on non-delivered order returns 400');
  }

  // 4. Order does not exist -> 404
  {
    const fakeId = new mongoose.Types.ObjectId().toString();
    const res = await fetch(`${BASE_URL}/api/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${buyerToken}`,
      },
      body: JSON.stringify({
        product: secondProductId,
        order: fakeId,
        rating: 5,
      }),
    });
    assertEqual(res.status, 404, 'Review - Non-existent order returns 404');
  }

  // 5. Product does not exist -> 404
  {
    const fakeId = new mongoose.Types.ObjectId().toString();
    const deliveredOrderWithFakeProduct = await Order.create({
      buyer: buyerUser._id,
      farmer: rogueFarmerProfileId,
      items: [
        {
          product: fakeId,
          name: 'Deleted Product',
          price: 100,
          quantity: 1,
          unit: 'kg',
        },
      ],
      deliveryAddress: {
        address: '123 Main St',
        city: 'Ludhiana',
        state: 'Punjab',
        pincode: '141001',
      },
      totalAmount: 100,
      paymentStatus: 'paid',
      paymentMethod: 'COD',
      orderStatus: 'delivered',
    });

    const res = await fetch(`${BASE_URL}/api/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${buyerToken}`,
      },
      body: JSON.stringify({
        product: fakeId,
        order: deliveredOrderWithFakeProduct._id.toString(),
        rating: 5,
      }),
    });
    assertEqual(res.status, 404, 'Review - Non-existent product returns 404');
  }

  // 6. Product not present in order -> 400
  {
    const res = await fetch(`${BASE_URL}/api/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${buyerToken}`,
      },
      body: JSON.stringify({
        product: createdProductId,
        order: orderId2,
        rating: 5,
      }),
    });
    assertEqual(res.status, 400, 'Review - Product not in order returns 400');
  }

  // 7. Invalid ratings (0, 6, -1, 5.5) -> 400
  const invalidRatings = [0, 6, -1, 5.5];
  for (const invalidRating of invalidRatings) {
    const res = await fetch(`${BASE_URL}/api/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${buyerToken}`,
      },
      body: JSON.stringify({
        product: secondProductId,
        order: orderId2,
        rating: invalidRating,
      }),
    });
    assertEqual(res.status, 400, `Review - Rating ${invalidRating} returns 400`);
  }

  // 8. Buyer creates valid review for delivered order (orderId2) -> 201
  {
    const res = await fetch(`${BASE_URL}/api/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${buyerToken}`,
      },
      body: JSON.stringify({
        product: secondProductId,
        order: orderId2,
        rating: 5,
        comment: 'Fresh and great quality wheat!',
      }),
    });
    const json = await res.json();
    assertEqual(res.status, 201, 'Review - Buyer creates valid review returns 201');
    assertOk(json.success, 'Review - Creation success true');
    reviewId = json.review._id;

    // Check Product.rating and FarmerProfile.rating recalculation
    const prod = await Product.findById(secondProductId);
    assertEqual(prod.rating, 5, 'Review - Product rating updated to 5');
    const farmerProf = await FarmerProfile.findById(rogueFarmerProfileId);
    assertEqual(farmerProf.rating, 5, 'Review - FarmerProfile rating updated to 5');
  }

  // 9. Duplicate review attempt for same product & order -> 400
  {
    const res = await fetch(`${BASE_URL}/api/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${buyerToken}`,
      },
      body: JSON.stringify({
        product: secondProductId,
        order: orderId2,
        rating: 4,
      }),
    });
    assertEqual(res.status, 400, 'Review - Duplicate review returns 400');
  }

  // 10. Get product reviews -> 200
  {
    const res = await fetch(`${BASE_URL}/api/reviews/product/${secondProductId}`);
    const json = await res.json();
    assertEqual(res.status, 200, 'Review - Get product reviews returns 200');
    assertOk(json.reviews.length >= 1, 'Review - Product reviews contains created review');
  }

  // 11. Get my reviews -> 200
  {
    const res = await fetch(`${BASE_URL}/api/reviews/my-reviews`, {
      headers: { Authorization: `Bearer ${buyerToken}` },
    });
    const json = await res.json();
    assertEqual(res.status, 200, 'Review - Get my reviews returns 200');
    assertOk(json.reviews.length >= 1, 'Review - My reviews contains created review');
  }

  // 12. Get single review -> 200
  {
    const res = await fetch(`${BASE_URL}/api/reviews/${reviewId}`);
    const json = await res.json();
    assertEqual(res.status, 200, 'Review - Get review by ID returns 200');
    assertEqual(json.review.rating, 5, 'Review - Correct rating in single review');
  }

  // 13. Edit review rating & comment (Owner buyer) -> 200
  {
    const res = await fetch(`${BASE_URL}/api/reviews/${reviewId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${buyerToken}`,
      },
      body: JSON.stringify({
        rating: 3,
        comment: 'Updated to 3 stars',
      }),
    });
    const json = await res.json();
    assertEqual(res.status, 200, 'Review - Edit review returns 200');
    assertEqual(json.review.rating, 3, 'Review - Updated rating persisted');

    // Check recalculated ratings
    const prod = await Product.findById(secondProductId);
    assertEqual(prod.rating, 3, 'Review - Product rating recalculated to 3 after edit');
    const farmerProf = await FarmerProfile.findById(rogueFarmerProfileId);
    assertEqual(farmerProf.rating, 3, 'Review - FarmerProfile rating recalculated to 3 after edit');
  }

  // 14. Non-owner attempts to edit review -> 403
  {
    const res = await fetch(`${BASE_URL}/api/reviews/${reviewId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${farmerToken}`,
      },
      body: JSON.stringify({ rating: 1 }),
    });
    assertEqual(res.status, 403, 'Review - Non-owner edit attempt returns 403');
  }

  // 15. Create second delivered order & second review for average calculation
  let reviewId2;
  {
    const order3 = await Order.create({
      buyer: buyerUser._id,
      farmer: rogueFarmerProfileId,
      items: [
        {
          product: secondProductId,
          name: 'Organically Grown Wheat',
          price: 150,
          quantity: 1,
          unit: 'kg',
        },
      ],
      deliveryAddress: {
        address: '123 Main St',
        city: 'Ludhiana',
        state: 'Punjab',
        pincode: '141001',
      },
      totalAmount: 150,
      paymentStatus: 'paid',
      paymentMethod: 'COD',
      orderStatus: 'delivered',
    });

    const res = await fetch(`${BASE_URL}/api/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${buyerToken}`,
      },
      body: JSON.stringify({
        product: secondProductId,
        order: order3._id.toString(),
        rating: 5,
        comment: 'Second purchase review',
      }),
    });
    const json = await res.json();
    assertEqual(res.status, 201, 'Review - Second order review created returns 201');
    reviewId2 = json.review._id;

    // Ratings should now be (3 + 5) / 2 = 4
    const prod = await Product.findById(secondProductId);
    assertEqual(prod.rating, 4, 'Review - Product rating recalculated to 4 (average of 3 and 5)');
    const farmerProf = await FarmerProfile.findById(rogueFarmerProfileId);
    assertEqual(farmerProf.rating, 4, 'Review - FarmerProfile rating recalculated to 4 (average of 3 and 5)');
  }

  // 16. Non-owner attempts delete -> 403
  {
    const res = await fetch(`${BASE_URL}/api/reviews/${reviewId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${farmerToken}` },
    });
    assertEqual(res.status, 403, 'Review - Non-owner delete attempt returns 403');
  }

  // 17. Delete review 1 -> 200 and rating recalculated to 5 (only review 2 remains)
  {
    const res = await fetch(`${BASE_URL}/api/reviews/${reviewId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${buyerToken}` },
    });
    assertEqual(res.status, 200, 'Review - Delete review 1 returns 200');

    const prod = await Product.findById(secondProductId);
    assertEqual(prod.rating, 5, 'Review - Product rating updated to 5 after review 1 deleted');
  }

  // 18. Delete review 2 -> 200 and rating recalculated to 0 (no reviews remain)
  {
    const res = await fetch(`${BASE_URL}/api/reviews/${reviewId2}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${buyerToken}` },
    });
    assertEqual(res.status, 200, 'Review - Delete review 2 returns 200');

    const prod = await Product.findById(secondProductId);
    assertEqual(prod.rating, 0, 'Review - Product rating becomes 0 when no reviews remain');
    const farmerProf = await FarmerProfile.findById(rogueFarmerProfileId);
    assertEqual(farmerProf.rating, 0, 'Review - FarmerProfile rating becomes 0 when no reviews remain');
  }
}

async function testNotificationAPIs() {
  logSection('NOTIFICATION API TESTS');

  // 1. Get notifications for Farmer 2 (should have received order_placed notification from order 2)
  let farmerNotificationId;
  {
    const res = await fetch(`${BASE_URL}/api/notifications`, {
      headers: { Authorization: `Bearer ${rogueFarmerToken}` },
    });
    const json = await res.json();
    assertEqual(res.status, 200, 'Notification - Farmer get notifications returns 200');
    assertOk(json.notifications.length > 0, 'Notification - Farmer has received order_placed notification');
    const orderPlacedNotif = json.notifications.find((n) => n.type === 'order_placed');
    assertOk(Boolean(orderPlacedNotif), 'Notification - order_placed type exists');
    assertEqual(orderPlacedNotif.isRead, false, 'Notification - Default isRead is false');
    farmerNotificationId = orderPlacedNotif._id;
  }

  // 2. Get unread count for Farmer 2
  {
    const res = await fetch(`${BASE_URL}/api/notifications/unread-count`, {
      headers: { Authorization: `Bearer ${rogueFarmerToken}` },
    });
    const json = await res.json();
    assertEqual(res.status, 200, 'Notification - Unread count returns 200');
    assertOk(json.count > 0, 'Notification - Unread count > 0');
  }

  // 3. Non-receiver attempts to mark notification as read -> 403
  {
    const res = await fetch(`${BASE_URL}/api/notifications/${farmerNotificationId}/read`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${buyerToken}` },
    });
    assertEqual(res.status, 403, 'Notification - Non-receiver mark read attempt returns 403');
  }

  // 4. Mark single notification as read -> 200
  {
    const res = await fetch(`${BASE_URL}/api/notifications/${farmerNotificationId}/read`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${rogueFarmerToken}` },
    });
    const json = await res.json();
    assertEqual(res.status, 200, 'Notification - Mark read returns 200');
    assertEqual(json.notification.isRead, true, 'Notification - isRead set to true');
  }

  // 5. Mark all as read for Farmer 2 -> 200
  {
    const res = await fetch(`${BASE_URL}/api/notifications/read-all`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${rogueFarmerToken}` },
    });
    const json = await res.json();
    assertEqual(res.status, 200, 'Notification - Mark all as read returns 200');

    const countRes = await fetch(`${BASE_URL}/api/notifications/unread-count`, {
      headers: { Authorization: `Bearer ${rogueFarmerToken}` },
    });
    const countJson = await countRes.json();
    assertEqual(countJson.count, 0, 'Notification - Unread count is 0 after mark-all-as-read');
  }

  // 6. Non-receiver attempts to delete notification -> 403
  {
    const res = await fetch(`${BASE_URL}/api/notifications/${farmerNotificationId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${buyerToken}` },
    });
    assertEqual(res.status, 403, 'Notification - Non-receiver delete attempt returns 403');
  }

  // 7. Receiver deletes notification -> 200
  {
    const res = await fetch(`${BASE_URL}/api/notifications/${farmerNotificationId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${rogueFarmerToken}` },
    });
    assertEqual(res.status, 200, 'Notification - Delete notification returns 200');
  }

  // 8. Test Buyer Notifications for order_accepted, order_shipped, order_delivered
  {
    const res = await fetch(`${BASE_URL}/api/notifications`, {
      headers: { Authorization: `Bearer ${buyerToken}` },
    });
    const json = await res.json();
    assertEqual(res.status, 200, 'Notification - Buyer get notifications returns 200');
    const types = json.notifications.map((n) => n.type);
    assertOk(types.includes('order_accepted'), 'Notification - Buyer received order_accepted');
    assertOk(types.includes('order_shipped'), 'Notification - Buyer received order_shipped');
    assertOk(types.includes('order_delivered'), 'Notification - Buyer received order_delivered');
  }

  // 9. Low Stock Notification Test
  {
    await fetch(`${BASE_URL}/api/products/${secondProductId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${rogueFarmerToken}`,
      },
      body: JSON.stringify({ quantityAvailable: 3 }),
    });

    const res = await fetch(`${BASE_URL}/api/notifications`, {
      headers: { Authorization: `Bearer ${rogueFarmerToken}` },
    });
    const json = await res.json();
    const lowStockNotif = json.notifications.find((n) => n.type === 'product_low_stock');
    assertOk(Boolean(lowStockNotif), 'Notification - Low stock notification generated when quantity <= 5');
  }

  // 10. Verification Update Notification Test
  {
    await fetch(`${BASE_URL}/api/farmer-profiles/${farmerProfileId}/verification-status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ verificationStatus: 'verified' }),
    });

    const res = await fetch(`${BASE_URL}/api/notifications`, {
      headers: { Authorization: `Bearer ${farmerToken}` },
    });
    const json = await res.json();
    const verifyNotif = json.notifications.find((n) => n.type === 'verification_update');
    assertOk(Boolean(verifyNotif), 'Notification - Verification update notification generated for farmer');
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

  // 7. Update Category (Admin Only) -> 200
  {
    const res = await fetch(`${BASE_URL}/api/categories/${newCatId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        description: 'Updated category description',
      }),
    });
    const json = await res.json();
    assertEqual(res.status, 200, 'Category - Update category returns 200');
    assertEqual(json.data.description, 'Updated category description', 'Category - Description updated');
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

  // 9. Admin APIs: Update User Status -> 200
  {
    const res = await fetch(`${BASE_URL}/api/admin/users/${buyerUser._id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ isActive: true }),
    });
    const json = await res.json();
    assertEqual(res.status, 200, 'Admin API - Update user status returns 200');
  }

  // 10. Admin APIs: Get Farmers -> 200
  {
    const res = await fetch(`${BASE_URL}/api/admin/farmers`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const json = await res.json();
    assertEqual(res.status, 200, 'Admin API - Get farmers returns 200');
    assertOk(json.data.length > 0, 'Admin API - Farmers list populated');
  }

  // 11. Admin APIs: Get Buyers -> 200
  {
    const res = await fetch(`${BASE_URL}/api/admin/buyers`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const json = await res.json();
    assertEqual(res.status, 200, 'Admin API - Get buyers returns 200');
  }

  // 12. Admin APIs: Analytics Summary -> 200
  {
    const res = await fetch(`${BASE_URL}/api/admin/analytics`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const json = await res.json();
    assertEqual(res.status, 200, 'Admin API - Analytics summary returns 200');
    assertOk(json.data.totalUsers >= 4, 'Admin API - Analytics totalUsers >= 4');
  }

  // 13. Role Constraint Checks: Buyer user trying to create FarmerProfile -> 403
  {
    const res = await fetch(`${BASE_URL}/api/farmer-profiles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${newBuyerToken}`,
      },
      body: JSON.stringify({
        farmName: 'Fake Farm',
        village: 'V1',
        district: 'D1',
        state: 'S1',
        pincode: '100001',
      }),
    });
    assertEqual(res.status, 403, 'Role Constraint - Buyer creating FarmerProfile returns 403');
  }

  // 14. Role Constraint Checks: Farmer user trying to create BuyerProfile -> 403
  {
    const res = await fetch(`${BASE_URL}/api/buyer-profiles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${newFarmerToken}`,
      },
      body: JSON.stringify({
        preferredCategories: ['Grains'],
      }),
    });
    assertEqual(res.status, 403, 'Role Constraint - Farmer creating BuyerProfile returns 403');
  }
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
