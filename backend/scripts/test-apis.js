process.env.NODE_ENV = 'test';

import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import app from '../server.js';
import User from '../models/User.js';
import FarmerProfile from '../models/FarmerProfile.js';
import BuyerProfile from '../models/BuyerProfile.js';

dotenv.config();

const PORT = 5001;
const BASE_URL = `http://localhost:${PORT}`;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';

let serverInstance;
let farmerUser, buyerUser, adminUser, rogueFarmerUser;
let farmerToken, buyerToken, adminToken, rogueFarmerToken;
let farmerProfileId, buyerProfileId;
let addressId1, addressId2;

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
  await mongoose.connect(mongoUri);
  console.log('MongoDB connected for tests');

  // Start HTTP server on test port
  await new Promise((resolve) => {
    serverInstance = app.listen(PORT, () => {
      console.log(`Test server listening on ${BASE_URL}`);
      resolve();
    });
  });

  // Clean up existing test users and profiles
  const testEmails = [
    'test_farmer_1@example.com',
    'test_buyer_1@example.com',
    'test_admin_1@example.com',
    'test_rogue_farmer@example.com',
  ];

  const existingUsers = await User.find({ email: { $in: testEmails } });
  const existingUserIds = existingUsers.map((u) => u._id);

  await FarmerProfile.deleteMany({ user: { $in: existingUserIds } });
  await BuyerProfile.deleteMany({ user: { $in: existingUserIds } });
  await User.deleteMany({ email: { $in: testEmails } });

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

  console.log('Test users and tokens created successfully.');
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

  // 2. Create Farmer Profile — Valid request
  {
    const res = await fetch(`${BASE_URL}/api/farmer-profiles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${farmerToken}`,
      },
      body: JSON.stringify({
        farmName: 'Green Valley Organic Farm',
        farmDescription: 'Organic wheat and paddy farm',
        village: 'Kheda',
        district: 'Ludhiana',
        state: 'Punjab',
        pincode: '141001',
        farmingType: 'organic',
        cropsGrown: ['Wheat', 'Rice', 'Mustard'],
        verificationDocs: ['doc1.pdf', 'doc2.pdf'],
        bankDetails: {
          accountNumber: '1234567890',
          ifsc: 'SBIN0001234',
          upiId: 'ramesh@upi',
        },
        // Attempting to bypass verificationStatus and rating
        verificationStatus: 'verified',
        rating: 5,
      }),
    });
    const json = await res.json();
    assertEqual(res.status, 201, 'Farmer Profile - Create valid profile returns 201');
    assertEqual(json.success, true, 'Farmer Profile - Create valid profile success=true');
    assertOk(json.data._id, 'Farmer Profile - Profile ID generated');
    farmerProfileId = json.data._id;
    assertEqual(json.data.verificationStatus, 'pending', 'Farmer Profile - verificationStatus defaulted to pending');
    assertEqual(json.data.rating, 0, 'Farmer Profile - rating defaulted to 0');
    assertEqual(json.data.bankDetails.accountNumber, '1234567890', 'Farmer Profile - bankDetails saved');
  }

  // 3. Create Duplicate Farmer Profile
  {
    const res = await fetch(`${BASE_URL}/api/farmer-profiles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${farmerToken}`,
      },
      body: JSON.stringify({
        farmName: 'Duplicate Farm',
        village: 'Kheda',
        district: 'Ludhiana',
        state: 'Punjab',
        pincode: '141001',
      }),
    });
    const json = await res.json();
    assertEqual(res.status, 400, 'Farmer Profile - Duplicate profile creation returns 400');
    assertEqual(json.success, false, 'Farmer Profile - Duplicate profile creation success=false');
  }

  // 4. Get Logged-in Farmer Profile (/me)
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

  // 5. Get Farmer Profile by ID
  {
    const res = await fetch(`${BASE_URL}/api/farmer-profiles/${farmerProfileId}`, {
      method: 'GET',
    });
    const json = await res.json();
    assertEqual(res.status, 200, 'Farmer Profile - Get by ID returns 200');
    assertEqual(json.data.farmName, 'Green Valley Organic Farm', 'Farmer Profile - Get by ID correct farmName');
  }

  // 6. Update Own Farmer Profile
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
    assertEqual(json.data.bankDetails.upiId, 'ramesh.updated@upi', 'Farmer Profile - Updated upiId persisted');
  }

  // 7. Attempt Unauthorized Update by another farmer
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
    assertEqual(json.success, false, 'Farmer Profile - Unauthorized update success=false');
  }

  // 8. Attempt Farmer to Modify Protected Fields (verificationStatus, rating, totalOrders, totalRevenue)
  {
    const res = await fetch(`${BASE_URL}/api/farmer-profiles/me`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${farmerToken}`,
      },
      body: JSON.stringify({
        verificationStatus: 'verified',
        rating: 5,
        totalOrders: 100,
        totalRevenue: 50000,
      }),
    });
    const json = await res.json();
    assertEqual(res.status, 200, 'Farmer Profile - Update protected fields request handled');
    assertEqual(json.data.verificationStatus, 'pending', 'Farmer Profile - verificationStatus remained pending');
    assertEqual(json.data.rating, 0, 'Farmer Profile - rating remained 0');
    assertEqual(json.data.totalOrders, 0, 'Farmer Profile - totalOrders remained 0');
  }

  // 9. Admin Updates Verification Status
  {
    const res = await fetch(`${BASE_URL}/api/farmer-profiles/${farmerProfileId}/verification-status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        verificationStatus: 'verified',
      }),
    });
    const json = await res.json();
    assertEqual(res.status, 200, 'Farmer Profile - Admin update verification status returns 200');
    assertEqual(json.data.verificationStatus, 'verified', 'Farmer Profile - Admin updated status to verified');
  }

  // 10. Get Verified Farmers
  {
    const res = await fetch(`${BASE_URL}/api/farmer-profiles/verified`);
    const json = await res.json();
    assertEqual(res.status, 200, 'Farmer Profile - Get verified farmers returns 200');
    assertOk(json.count >= 1, 'Farmer Profile - Verified farmers list contains at least 1 verified farmer');
  }

  // 11. Delete Farmer Profile
  {
    const res = await fetch(`${BASE_URL}/api/farmer-profiles/me`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${farmerToken}` },
    });
    const json = await res.json();
    assertEqual(res.status, 200, 'Farmer Profile - Delete profile returns 200');
    assertEqual(json.success, true, 'Farmer Profile - Delete profile success=true');

    // Verify deleted
    const checkRes = await fetch(`${BASE_URL}/api/farmer-profiles/me`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${farmerToken}` },
    });
    assertEqual(checkRes.status, 404, 'Farmer Profile - Get deleted profile returns 404');
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
    assertEqual(json.success, true, 'Buyer Profile - Create buyer profile success=true');
    assertOk(json.data._id, 'Buyer Profile - Profile ID generated');
    buyerProfileId = json.data._id;
    assertEqual(json.data.deliveryAddresses.length, 1, 'Buyer Profile - Delivery address added on creation');
    addressId1 = json.data.deliveryAddresses[0]._id;
  }

  // 2. Create Duplicate Buyer Profile
  {
    const res = await fetch(`${BASE_URL}/api/buyer-profiles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${buyerToken}`,
      },
      body: JSON.stringify({
        preferredCategories: ['Grains'],
      }),
    });
    const json = await res.json();
    assertEqual(res.status, 400, 'Buyer Profile - Duplicate buyer profile returns 400');
    assertEqual(json.success, false, 'Buyer Profile - Duplicate buyer profile success=false');
  }

  // 3. Get Logged-in Buyer Profile (/me)
  {
    const res = await fetch(`${BASE_URL}/api/buyer-profiles/me`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${buyerToken}` },
    });
    const json = await res.json();
    assertEqual(res.status, 200, 'Buyer Profile - Get own buyer profile returns 200');
    assertEqual(json.data._id, buyerProfileId, 'Buyer Profile - Get own profile correct ID');
    assertEqual(json.data.user.email, 'test_buyer_1@example.com', 'Buyer Profile - User populated');
  }

  // 4. Get Buyer Profile by ID
  {
    const res = await fetch(`${BASE_URL}/api/buyer-profiles/${buyerProfileId}`, {
      method: 'GET',
    });
    const json = await res.json();
    assertEqual(res.status, 200, 'Buyer Profile - Get buyer profile by ID returns 200');
  }

  // 5. Update Buyer Profile
  {
    const res = await fetch(`${BASE_URL}/api/buyer-profiles/me`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${buyerToken}`,
      },
      body: JSON.stringify({
        preferredCategories: ['Vegetables', 'Exotic Fruits', 'Pulses'],
      }),
    });
    const json = await res.json();
    assertEqual(res.status, 200, 'Buyer Profile - Update buyer profile returns 200');
    assertEqual(json.data.preferredCategories.length, 3, 'Buyer Profile - Preferred categories updated');
  }

  // 6. Attempt Unauthorized Update by another user
  {
    const res = await fetch(`${BASE_URL}/api/buyer-profiles/${buyerProfileId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${farmerToken}`,
      },
      body: JSON.stringify({
        preferredCategories: ['Hacked'],
      }),
    });
    const json = await res.json();
    assertEqual(res.status, 403, 'Buyer Profile - Unauthorized update returns 403');
  }

  // 7. Add Delivery Address
  {
    const res = await fetch(`${BASE_URL}/api/buyer-profiles/addresses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${buyerToken}`,
      },
      body: JSON.stringify({
        label: 'Office',
        address: '456 Tech Park, Sector 62',
        city: 'Mohali',
        state: 'Punjab',
        pincode: '160062',
        isDefault: false,
      }),
    });
    const json = await res.json();
    assertEqual(res.status, 201, 'Buyer Profile - Add delivery address returns 201');
    assertEqual(json.data.length, 2, 'Buyer Profile - Addresses count is now 2');
    addressId2 = json.data[1]._id;
  }

  // 8. Update Delivery Address
  {
    const res = await fetch(`${BASE_URL}/api/buyer-profiles/addresses/${addressId2}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${buyerToken}`,
      },
      body: JSON.stringify({
        label: 'Work / Office',
        city: 'SAS Nagar Mohali',
      }),
    });
    const json = await res.json();
    assertEqual(res.status, 200, 'Buyer Profile - Update delivery address returns 200');
    const updatedAddr = json.data.find((a) => a._id === addressId2);
    assertEqual(updatedAddr.label, 'Work / Office', 'Buyer Profile - Address label updated');
  }

  // 9. Set Default Delivery Address
  {
    const res = await fetch(`${BASE_URL}/api/buyer-profiles/addresses/${addressId2}/default`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${buyerToken}` },
    });
    const json = await res.json();
    assertEqual(res.status, 200, 'Buyer Profile - Set default delivery address returns 200');
    const addr1 = json.data.find((a) => a._id === addressId1);
    const addr2 = json.data.find((a) => a._id === addressId2);
    assertEqual(addr2.isDefault, true, 'Buyer Profile - Address 2 is default');
    assertEqual(addr1.isDefault, false, 'Buyer Profile - Address 1 is not default');
  }

  // 10. Delete Delivery Address
  {
    const res = await fetch(`${BASE_URL}/api/buyer-profiles/addresses/${addressId1}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${buyerToken}` },
    });
    const json = await res.json();
    assertEqual(res.status, 200, 'Buyer Profile - Delete delivery address returns 200');
    assertEqual(json.data.length, 1, 'Buyer Profile - Delivery address count decreased to 1');
  }

  // 11. Add Product to Wishlist — Invalid Product ID Format
  {
    const res = await fetch(`${BASE_URL}/api/buyer-profiles/wishlist`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${buyerToken}`,
      },
      body: JSON.stringify({
        productId: 'invalid_object_id_string',
      }),
    });
    const json = await res.json();
    assertEqual(res.status, 400, 'Buyer Profile - Invalid wishlist product ID format returns 400');
  }

  // 12. Add Product to Wishlist — Valid ObjectId
  const sampleProductId = new mongoose.Types.ObjectId().toString();
  {
    const res = await fetch(`${BASE_URL}/api/buyer-profiles/wishlist`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${buyerToken}`,
      },
      body: JSON.stringify({
        productId: sampleProductId,
      }),
    });
    const json = await res.json();
    assertEqual(res.status, 200, 'Buyer Profile - Add product to wishlist returns 200');
    assertOk(json.data.includes(sampleProductId), 'Buyer Profile - Product added to wishlist array');
  }

  // 13. Remove Product from Wishlist
  {
    const res = await fetch(`${BASE_URL}/api/buyer-profiles/wishlist/${sampleProductId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${buyerToken}` },
    });
    const json = await res.json();
    assertEqual(res.status, 200, 'Buyer Profile - Remove product from wishlist returns 200');
    assertOk(!json.data.includes(sampleProductId), 'Buyer Profile - Product removed from wishlist array');
  }

  // 14. Delete Buyer Profile
  {
    const res = await fetch(`${BASE_URL}/api/buyer-profiles/me`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${buyerToken}` },
    });
    const json = await res.json();
    assertEqual(res.status, 200, 'Buyer Profile - Delete buyer profile returns 200');

    const checkRes = await fetch(`${BASE_URL}/api/buyer-profiles/me`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${buyerToken}` },
    });
    assertEqual(checkRes.status, 404, 'Buyer Profile - Get deleted buyer profile returns 404');
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

  // 4. Invalid ObjectId in GET Profile
  {
    const res = await fetch(`${BASE_URL}/api/farmer-profiles/invalid-id-format`, {
      method: 'GET',
    });
    assertEqual(res.status, 400, 'Error Handling - Invalid ObjectId format returns 400');
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

  await FarmerProfile.deleteMany({ user: { $in: uIds } });
  await BuyerProfile.deleteMany({ user: { $in: uIds } });
  await User.deleteMany({ email: { $in: testEmails } });

  console.log('Test data cleaned up from MongoDB.');

  if (serverInstance) {
    await new Promise((resolve) => serverInstance.close(resolve));
    console.log('Test server closed.');
  }

  await mongoose.connection.close();
  console.log('MongoDB connection closed.');
}

async function runAllTests() {
  try {
    await setup();
    await testFarmerProfileAPIs();
    await testBuyerProfileAPIs();
    await testAuthAndErrorHandling();
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
