import mongoose from 'mongoose';
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

const PORT = 5004;
const BASE_URL = `http://localhost:${PORT}`;

let server;

const logSection = (title) => {
  console.log(`\n========================================`);
  console.log(` ${title}`);
  console.log(`========================================`);
};

const logPass = (msg) => console.log(`✅ PASS: ${msg}`);
const logFail = (msg) => {
  console.error(`❌ FAIL: ${msg}`);
  throw new Error(`Test failed: ${msg}`);
};

const assertEqual = (actual, expected, testName) => {
  if (actual === expected) {
    logPass(testName);
  } else {
    logFail(`${testName} (Expected: ${expected}, Got: ${actual})`);
  }
};

const assertOk = (condition, testName) => {
  if (condition) {
    logPass(testName);
  } else {
    logFail(testName);
  }
};

async function runFullRegression() {
  logSection('STARTING COMPREHENSIVE FULL REGRESSION SUITE');

  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/farm_direct_access';
  console.log('Connecting to MongoDB...');
  await mongoose.connect(mongoUri, { family: 4 });
  console.log('MongoDB connected for full regression tests.');

  await new Promise((resolve) => {
    server = app.listen(PORT, resolve);
  });
  console.log(`Regression test server listening on ${BASE_URL}\n`);

  const ts = Date.now();
  const farmerEmail = `reg_farmer_${ts}@example.com`;
  const farmer2Email = `reg_farmer2_${ts}@example.com`;
  const buyerEmail = `reg_buyer_${ts}@example.com`;
  const buyer2Email = `reg_buyer2_${ts}@example.com`;
  const adminEmail = `reg_admin_${ts}@example.com`;
  const password = 'Password123!';

  let farmerToken, farmer2Token, buyerToken, buyer2Token, adminToken;
  let farmerUserId, farmer2UserId, buyerUserId, buyer2UserId, adminUserId;
  let farmerProfileId, farmer2ProfileId, buyerProfileId, buyer2ProfileId;
  let category1Id, category2Id;
  let product1Id, product2Id;
  let order1Id, order2Id;

  try {
    // -------------------------------------------------------------------
    // MODULE 1: AUTHENTICATION (SIGNUP & LOGIN)
    // -------------------------------------------------------------------
    logSection('MODULE 1: AUTHENTICATION (SIGNUP & LOGIN)');

    // 1. Farmer Signup
    {
      const res = await fetch(`${BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Farmer Harjeet',
          email: farmerEmail,
          password,
          role: 'farmer',
          phone: '9811111111',
        }),
      });
      const json = await res.json();
      assertEqual(res.status, 201, 'Auth - Valid Farmer Signup returns 201');
      assertEqual(json.user.role, 'farmer', 'Auth - Signup assigns farmer role');
      assertOk(Boolean(json.token), 'Auth - Signup returns JWT token');
      farmerToken = json.token;
      farmerUserId = json.user._id || json.user.id;
    }

    // Second Farmer Signup for multi-farmer testing
    {
      const res = await fetch(`${BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Farmer Kuldeep',
          email: farmer2Email,
          password,
          role: 'farmer',
          phone: '9822222222',
        }),
      });
      const json = await res.json();
      farmer2Token = json.token;
      farmer2UserId = json.user._id || json.user.id;
    }

    // 2. Buyer Signup
    {
      const res = await fetch(`${BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Buyer Simran',
          email: buyerEmail,
          password,
          role: 'buyer',
          phone: '9833333333',
        }),
      });
      const json = await res.json();
      assertEqual(res.status, 201, 'Auth - Valid Buyer Signup returns 201');
      assertEqual(json.user.role, 'buyer', 'Auth - Signup assigns buyer role');
      assertOk(Boolean(json.token), 'Auth - Signup returns JWT token');
      buyerToken = json.token;
      buyerUserId = json.user._id || json.user.id;
    }

    // Second Buyer Signup for isolation testing
    {
      const res = await fetch(`${BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Buyer Aman',
          email: buyer2Email,
          password,
          role: 'buyer',
          phone: '9844444444',
        }),
      });
      const json = await res.json();
      buyer2Token = json.token;
      buyer2UserId = json.user._id || json.user.id;
    }

    // 3. Duplicate Email Signup Validation
    {
      const res = await fetch(`${BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Duplicate User',
          email: buyerEmail,
          password,
          role: 'buyer',
          phone: '9855555555',
        }),
      });
      assertEqual(res.status, 400, 'Auth - Duplicate email signup returns 400');
    }

    // 4. Invalid Email Format Validation
    {
      const res = await fetch(`${BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Invalid Email User',
          email: 'invalid-email-format',
          password,
          role: 'buyer',
          phone: '9866666666',
        }),
      });
      assertEqual(res.status, 400, 'Auth - Invalid email format returns 400');
    }

    // 5. Admin User (created directly for admin testing)
    const adminUserObj = await User.create({
      name: 'System Admin',
      email: adminEmail,
      password: password,
      role: 'admin',
      phone: '9999999999',
      isVerified: true,
    });
    adminUserId = adminUserObj._id.toString();

    // 6. Farmer Login
    {
      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: farmerEmail, password }),
      });
      const json = await res.json();
      assertEqual(res.status, 200, 'Auth - Farmer login returns 200');
      assertEqual(json.user.role, 'farmer', 'Auth - Farmer login returns farmer role');
      assertOk(Boolean(json.token), 'Auth - Farmer login returns JWT');
    }

    // 7. Buyer Login
    {
      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: buyerEmail, password }),
      });
      const json = await res.json();
      assertEqual(res.status, 200, 'Auth - Buyer login returns 200');
      assertEqual(json.user.role, 'buyer', 'Auth - Buyer login returns buyer role');
      assertOk(Boolean(json.token), 'Auth - Buyer login returns JWT');
    }

    // 8. Admin Login
    {
      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: adminEmail, password }),
      });
      const json = await res.json();
      assertEqual(res.status, 200, 'Auth - Admin login returns 200');
      assertEqual(json.user.role, 'admin', 'Auth - Admin login returns admin role');
      adminToken = json.token;
    }

    // 9. Incorrect Password Login
    {
      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: farmerEmail, password: 'WrongPassword123!' }),
      });
      assertEqual(res.status, 401, 'Auth - Incorrect password returns 401');
    }

    // -------------------------------------------------------------------
    // MODULE 2: CATEGORY APIS
    // -------------------------------------------------------------------
    logSection('MODULE 2: CATEGORY APIS');

    // Admin creates Category 1 (Grains)
    {
      const res = await fetch(`${BASE_URL}/api/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          name: `Organic Grains ${ts}`,
          description: 'High quality organic grains and cereals',
        }),
      });
      const json = await res.json();
      assertEqual(res.status, 201, 'Category - Admin create category returns 201');
      category1Id = json.data._id;
    }

    // Admin creates Category 2 (Vegetables)
    {
      const res = await fetch(`${BASE_URL}/api/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          name: `Fresh Veggies ${ts}`,
          description: 'Farm fresh green vegetables',
        }),
      });
      const json = await res.json();
      category2Id = json.data._id;
    }

    // Public Get Categories
    {
      const res = await fetch(`${BASE_URL}/api/categories`);
      const json = await res.json();
      assertEqual(res.status, 200, 'Category - GET /api/categories returns 200');
      assertOk(json.data.length >= 2, 'Category - Returns created categories');
    }

    // -------------------------------------------------------------------
    // MODULE 3: PROFILES (FARMER & BUYER)
    // -------------------------------------------------------------------
    logSection('MODULE 3: PROFILES (FARMER & BUYER)');

    // 1. Create Farmer Profile 1
    {
      const res = await fetch(`${BASE_URL}/api/farmer-profiles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${farmerToken}`,
        },
        body: JSON.stringify({
          farmName: 'Harjeet Organic Farms',
          village: 'Jagraon',
          district: 'Ludhiana',
          state: 'Punjab',
          pincode: '142026',
          farmingType: 'organic',
          cropsGrown: ['Wheat', 'Mustard'],
        }),
      });
      const json = await res.json();
      assertEqual(res.status, 201, 'Profile - Farmer profile created returns 201');
      farmerProfileId = json.data._id;
    }

    // Create Farmer Profile 2
    {
      const fp2 = await FarmerProfile.create({
        user: farmer2UserId,
        farmName: 'Kuldeep Farm Estate',
        village: 'Nakodar',
        district: 'Jalandhar',
        state: 'Punjab',
        pincode: '144040',
        farmingType: 'conventional',
      });
      farmer2ProfileId = fp2._id.toString();
    }

    // 2. GET Own Farmer Profile (/me)
    {
      const res = await fetch(`${BASE_URL}/api/farmer-profiles/me`, {
        headers: { Authorization: `Bearer ${farmerToken}` },
      });
      const json = await res.json();
      assertEqual(res.status, 200, 'Profile - GET /api/farmer-profiles/me returns 200');
      assertEqual(json.data._id, farmerProfileId, 'Profile - Correct farmer profile returned');
    }

    // 3. Create Buyer Profile 1
    {
      const res = await fetch(`${BASE_URL}/api/buyer-profiles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${buyerToken}`,
        },
        body: JSON.stringify({
          buyerType: 'retail',
          deliveryAddresses: [
            {
              label: 'Home',
              address: '77 Sector 17',
              city: 'Chandigarh',
              state: 'Punjab',
              pincode: '160017',
              isDefault: true,
            },
          ],
        }),
      });
      const json = await res.json();
      assertEqual(res.status, 201, 'Profile - Buyer profile created returns 201');
      buyerProfileId = json.data._id;
    }

    // Create Buyer Profile 2
    {
      const bp2 = await BuyerProfile.create({
        user: buyer2UserId,
        buyerType: 'wholesale',
        deliveryAddresses: [
          {
            label: 'Store',
            address: 'Market Yard Gate 2',
            city: 'Ludhiana',
            state: 'Punjab',
            pincode: '141001',
            isDefault: true,
          },
        ],
      });
      buyer2ProfileId = bp2._id.toString();
    }

    // 4. GET Own Buyer Profile (/me)
    {
      const res = await fetch(`${BASE_URL}/api/buyer-profiles/me`, {
        headers: { Authorization: `Bearer ${buyerToken}` },
      });
      const json = await res.json();
      assertEqual(res.status, 200, 'Profile - GET /api/buyer-profiles/me returns 200');
      assertEqual(json.data._id, buyerProfileId, 'Profile - Correct buyer profile returned');
    }

    // -------------------------------------------------------------------
    // MODULE 4: FARMER ADD PRODUCT & MY PRODUCTS
    // -------------------------------------------------------------------
    logSection('MODULE 4: FARMER ADD PRODUCT & MY PRODUCTS');

    // 1. Farmer 1 creates Product 1 (Sharbati Golden Wheat)
    {
      const res = await fetch(`${BASE_URL}/api/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${farmerToken}`,
        },
        body: JSON.stringify({
          name: 'Sharbati Golden Wheat Grains',
          category: category1Id,
          description: 'A-grade 100% natural golden wheat grains directly harvested from Ludhiana fields.',
          price: 50,
          unit: 'kg',
          quantityAvailable: 200,
          isOrganic: true,
          images: ['https://example.com/wheat_golden.jpg'],
        }),
      });
      const json = await res.json();
      assertEqual(res.status, 201, 'Product - Farmer create product returns 201');
      assertEqual(json.data.farmer._id, farmerProfileId, 'Product - Linked to correct FarmerProfile');
      assertEqual(json.data.location.district, 'Ludhiana', 'Product - Location populated from FarmerProfile');
      product1Id = json.data._id;
    }

    // 2. Farmer 2 creates Product 2 (Fresh Green Spinach)
    {
      const res = await fetch(`${BASE_URL}/api/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${farmer2Token}`,
        },
        body: JSON.stringify({
          name: 'Fresh Green Farm Spinach',
          category: category2Id,
          description: 'Crisp pesticide-free green spinach leaves harvested daily.',
          price: 25,
          unit: 'kg',
          quantityAvailable: 150,
          isOrganic: false,
          images: ['https://example.com/spinach.jpg'],
        }),
      });
      const json = await res.json();
      assertEqual(res.status, 201, 'Product - Farmer 2 create product returns 201');
      product2Id = json.data._id;
    }

    // 3. GET My Products (`/api/products?farmer=me`)
    {
      const res = await fetch(`${BASE_URL}/api/products?farmer=me`, {
        headers: { Authorization: `Bearer ${farmerToken}` },
      });
      const json = await res.json();
      assertEqual(res.status, 200, 'Product - GET /api/products?farmer=me returns 200');
      assertOk(json.data.some((p) => p._id === product1Id), 'Product - Farmer 1 product listed in My Products');
      assertOk(!json.data.some((p) => p._id === product2Id), 'Product - Farmer 1 does NOT see Farmer 2 product in My Products');
    }

    // -------------------------------------------------------------------
    // MODULE 5: MARKETPLACE, SEARCH BAR & PRODUCT DETAILS
    // -------------------------------------------------------------------
    logSection('MODULE 5: MARKETPLACE, SEARCH BAR & PRODUCT DETAILS');

    // 1. Marketplace GET active products
    {
      const res = await fetch(`${BASE_URL}/api/products?status=active`);
      const json = await res.json();
      assertEqual(res.status, 200, 'Marketplace - GET /api/products?status=active returns 200');
      assertOk(json.data.length >= 2, 'Marketplace - Active products returned');
    }

    // 2. Search Bar - Exact Product Name
    {
      const res = await fetch(`${BASE_URL}/api/products?search=Sharbati%20Golden%20Wheat%20Grains&status=active`);
      const json = await res.json();
      assertEqual(res.status, 200, 'Search - Exact product name search returns 200');
      assertOk(json.data.some((p) => p._id === product1Id), 'Search - Includes exact product');
      assertOk(!json.data.some((p) => p._id === product2Id), 'Search - Excludes non-matching spinach product');
    }

    // 3. Search Bar - Partial Keyword Search
    {
      const res = await fetch(`${BASE_URL}/api/products?search=Spinach&status=active`);
      const json = await res.json();
      assertEqual(res.status, 200, 'Search - Partial keyword search returns 200');
      assertOk(json.data.some((p) => p._id === product2Id), 'Search - Includes matching spinach product');
      assertOk(!json.data.some((p) => p._id === product1Id), 'Search - Excludes non-matching wheat product');
    }

    // 4. Search Bar - Category Filter
    {
      const res = await fetch(`${BASE_URL}/api/products?category=${category1Id}&status=active`);
      const json = await res.json();
      assertEqual(res.status, 200, 'Search - Category filter returns 200');
      assertOk(json.data.every((p) => (p.category._id || p.category) === category1Id), 'Search - All products match category');
    }

    // 5. Search Bar - Organic Only Filter
    {
      const res = await fetch(`${BASE_URL}/api/products?isOrganic=true&status=active`);
      const json = await res.json();
      assertEqual(res.status, 200, 'Search - Organic filter returns 200');
      assertOk(json.data.every((p) => p.isOrganic === true), 'Search - All products are organic');
    }

    // 6. Search Bar - Price Range Filter
    {
      const res = await fetch(`${BASE_URL}/api/products?minPrice=20&maxPrice=30&status=active`);
      const json = await res.json();
      assertEqual(res.status, 200, 'Search - Price range filter returns 200');
      assertOk(json.data.some((p) => p._id === product2Id), 'Search - Includes spinach (₹25)');
      assertOk(!json.data.some((p) => p._id === product1Id), 'Search - Excludes wheat (₹50)');
    }

    // 7. Search Bar - No Matching Results
    {
      const res = await fetch(`${BASE_URL}/api/products?search=NonExistentExoticFruit999&status=active`);
      const json = await res.json();
      assertEqual(res.status, 200, 'Search - Non-matching query returns 200');
      assertEqual(json.data.length, 0, 'Search - Non-matching query returns empty array');
    }

    // 8. Search Bar - Empty Search (Restores normal list)
    {
      const res = await fetch(`${BASE_URL}/api/products?status=active`);
      const json = await res.json();
      assertEqual(res.status, 200, 'Search - Empty search restores normal list returns 200');
      assertOk(json.data.length >= 2, 'Search - Restores all active products');
    }

    // 9. Product Details API
    {
      const res = await fetch(`${BASE_URL}/api/products/${product1Id}`);
      const json = await res.json();
      assertEqual(res.status, 200, 'Product Details - GET /api/products/:id returns 200');
      assertEqual(json.data.name, 'Sharbati Golden Wheat Grains', 'Product Details - Name matches');
      assertEqual(json.data.price, 50, 'Product Details - Price matches');
      assertEqual(json.data.quantityAvailable, 200, 'Product Details - Quantity matches');
      assertEqual(json.data.farmer.farmName, 'Harjeet Organic Farms', 'Product Details - Farmer info populated');
    }

    // -------------------------------------------------------------------
    // MODULE 6: CART APIS
    // -------------------------------------------------------------------
    logSection('MODULE 6: CART APIS');

    // 1. Get empty cart
    {
      const res = await fetch(`${BASE_URL}/api/cart`, {
        headers: { Authorization: `Bearer ${buyerToken}` },
      });
      const json = await res.json();
      assertEqual(res.status, 200, 'Cart - GET empty cart returns 200');
      assertEqual(json.cart.items.length, 0, 'Cart - Items array empty');
    }

    // 2. Add Product 1 to cart (Quantity: 10)
    {
      const res = await fetch(`${BASE_URL}/api/cart/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${buyerToken}`,
        },
        body: JSON.stringify({ productId: product1Id, quantity: 10 }),
      });
      const json = await res.json();
      assertEqual(res.status, 201, 'Cart - Add product returns 201');
      assertEqual(json.cart.items.length, 1, 'Cart - Contains 1 item');
    }

    // 3. Add Product 2 to cart (Quantity: 4)
    {
      const res = await fetch(`${BASE_URL}/api/cart/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${buyerToken}`,
        },
        body: JSON.stringify({ productId: product2Id, quantity: 4 }),
      });
      const json = await res.json();
      assertEqual(res.status, 201, 'Cart - Add second product returns 201');
      assertEqual(json.cart.items.length, 2, 'Cart - Contains 2 items');
    }

    // 4. Update cart item quantity
    {
      const res = await fetch(`${BASE_URL}/api/cart/items/${product2Id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${buyerToken}`,
        },
        body: JSON.stringify({ quantity: 6 }),
      });
      const json = await res.json();
      assertEqual(res.status, 200, 'Cart - Update quantity returns 200');
      const item2 = json.cart.items.find((i) => (i.product._id || i.product) === product2Id);
      assertEqual(item2.quantity, 6, 'Cart - Quantity updated to 6');
    }

    // 5. Remove Product 2 from cart
    {
      const res = await fetch(`${BASE_URL}/api/cart/items/${product2Id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${buyerToken}` },
      });
      const json = await res.json();
      assertEqual(res.status, 200, 'Cart - Remove item returns 200');
      assertEqual(json.cart.items.length, 1, 'Cart - Item removed, 1 item remaining');
    }

    // -------------------------------------------------------------------
    // MODULE 7: ORDER CREATION & CHECKOUT
    // -------------------------------------------------------------------
    logSection('MODULE 7: ORDER CREATION & CHECKOUT');

    // Checkout for Buyer 1 (Product 1, Qty 10 @ ₹50 = ₹500)
    {
      const res = await fetch(`${BASE_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${buyerToken}`,
        },
        body: JSON.stringify({
          deliveryAddress: {
            address: '77 Sector 17',
            city: 'Chandigarh',
            state: 'Punjab',
            pincode: '160017',
          },
          paymentMethod: 'COD',
        }),
      });
      const json = await res.json();
      assertEqual(res.status, 201, 'Order - Checkout returns 201');
      assertOk(json.orders.length > 0, 'Order - Created order array returned');
      order1Id = json.orders[0]._id;
    }

    // Verify Order 1 in MongoDB
    {
      const dbOrder = await Order.findById(order1Id);
      assertOk(Boolean(dbOrder), 'Order - Order document saved in MongoDB');
      assertEqual(dbOrder.buyer.toString(), buyerUserId, 'Order - Linked to correct buyer');
      assertEqual(dbOrder.farmer.toString(), farmerProfileId, 'Order - Linked to correct farmer');
      assertEqual(dbOrder.totalAmount, 500, 'Order - Total amount is ₹500');
      assertEqual(dbOrder.orderStatus, 'pending', 'Order - Initial status is pending');
    }

    // Verify Product 1 Stock Reduction in MongoDB (Original 200 - 10 = 190)
    {
      const dbProduct = await Product.findById(product1Id);
      assertEqual(dbProduct.quantityAvailable, 190, 'Order - Product stock reduced from 200 to 190 in MongoDB');
    }

    // Create Order 2 for Buyer 2 (Product 2, Qty 20 @ ₹25 = ₹500)
    {
      // Add Product 2 to Buyer 2 cart
      await fetch(`${BASE_URL}/api/cart/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${buyer2Token}`,
        },
        body: JSON.stringify({ productId: product2Id, quantity: 20 }),
      });

      // Checkout Buyer 2
      const res = await fetch(`${BASE_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${buyer2Token}`,
        },
        body: JSON.stringify({
          deliveryAddress: {
            address: 'Market Yard Gate 2',
            city: 'Ludhiana',
            state: 'Punjab',
            pincode: '141001',
          },
          paymentMethod: 'online',
        }),
      });
      const json = await res.json();
      order2Id = json.orders[0]._id;
    }

    // -------------------------------------------------------------------
    // MODULE 8: BUYER ORDER HISTORY & ISOLATION
    // -------------------------------------------------------------------
    logSection('MODULE 8: BUYER ORDER HISTORY & ISOLATION');

    // 1. GET Buyer 1 Orders (`/api/orders/my-orders`)
    {
      const res = await fetch(`${BASE_URL}/api/orders/my-orders`, {
        headers: { Authorization: `Bearer ${buyerToken}` },
      });
      const json = await res.json();
      assertEqual(res.status, 200, 'Order History - GET /api/orders/my-orders returns 200');
      assertOk(json.orders.some((o) => o._id === order1Id), 'Order History - Buyer 1 sees Order 1');
      assertOk(!json.orders.some((o) => o._id === order2Id), 'Order Isolation - Buyer 1 CANNOT see Buyer 2 order!');
    }

    // 2. GET Buyer 2 Orders (`/api/orders/my-orders`)
    {
      const res = await fetch(`${BASE_URL}/api/orders/my-orders`, {
        headers: { Authorization: `Bearer ${buyer2Token}` },
      });
      const json = await res.json();
      assertEqual(res.status, 200, 'Order History - GET Buyer 2 orders returns 200');
      assertOk(json.orders.some((o) => o._id === order2Id), 'Order History - Buyer 2 sees Order 2');
      assertOk(!json.orders.some((o) => o._id === order1Id), 'Order Isolation - Buyer 2 CANNOT see Buyer 1 order!');
    }

    // 3. GET Single Order by ID (`/api/orders/:id`)
    {
      const res = await fetch(`${BASE_URL}/api/orders/${order1Id}`, {
        headers: { Authorization: `Bearer ${buyerToken}` },
      });
      const json = await res.json();
      assertEqual(res.status, 200, 'Order Details - GET /api/orders/:id returns 200');
      assertEqual(json.order._id, order1Id, 'Order Details - Returns correct order');
    }

    // 4. Buyer 2 attempts to view Buyer 1's order -> 403
    {
      const res = await fetch(`${BASE_URL}/api/orders/${order1Id}`, {
        headers: { Authorization: `Bearer ${buyer2Token}` },
      });
      assertEqual(res.status, 403, 'Order Security - Buyer cannot view another buyer\'s order (returns 403)');
    }

    // -------------------------------------------------------------------
    // MODULE 9: FARMER ORDERS REGRESSION & STATUS TRANSITIONS
    // -------------------------------------------------------------------
    logSection('MODULE 9: FARMER ORDERS REGRESSION & STATUS TRANSITIONS');

    // 1. GET Farmer 1 Orders (`/api/orders/farmer`)
    {
      const res = await fetch(`${BASE_URL}/api/orders/farmer`, {
        headers: { Authorization: `Bearer ${farmerToken}` },
      });
      const json = await res.json();
      assertEqual(res.status, 200, 'Farmer Orders - GET /api/orders/farmer returns 200');
      assertOk(json.orders.some((o) => o._id === order1Id), 'Farmer Orders - Farmer 1 sees Order 1 for their produce');
      assertOk(!json.orders.some((o) => o._id === order2Id), 'Farmer Isolation - Farmer 1 CANNOT see Farmer 2 orders!');
    }

    // 2. Farmer 1 Status Transition Sequence for Order 1:
    // Accept (pending -> accepted)
    {
      const res = await fetch(`${BASE_URL}/api/orders/${order1Id}/accept`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${farmerToken}` },
      });
      const json = await res.json();
      assertEqual(res.status, 200, 'Farmer Order Workflow - Accept order returns 200');
      assertEqual(json.order.orderStatus, 'accepted', 'Order status updated to accepted');
    }

    // Process (accepted -> processing)
    {
      const res = await fetch(`${BASE_URL}/api/orders/${order1Id}/process`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${farmerToken}` },
      });
      const json = await res.json();
      assertEqual(res.status, 200, 'Farmer Order Workflow - Process order returns 200');
      assertEqual(json.order.orderStatus, 'processing', 'Order status updated to processing');
    }

    // Ship (processing -> shipped)
    {
      const res = await fetch(`${BASE_URL}/api/orders/${order1Id}/ship`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${farmerToken}` },
      });
      const json = await res.json();
      assertEqual(res.status, 200, 'Farmer Order Workflow - Ship order returns 200');
      assertEqual(json.order.orderStatus, 'shipped', 'Order status updated to shipped');
    }

    // Deliver (shipped -> delivered)
    {
      const res = await fetch(`${BASE_URL}/api/orders/${order1Id}/deliver`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${farmerToken}` },
      });
      const json = await res.json();
      assertEqual(res.status, 200, 'Farmer Order Workflow - Deliver order returns 200');
      assertEqual(json.order.orderStatus, 'delivered', 'Order status updated to delivered');
    }

    // -------------------------------------------------------------------
    // MODULE 10: REVIEWS & NOTIFICATIONS
    // -------------------------------------------------------------------
    logSection('MODULE 10: REVIEWS & NOTIFICATIONS');

    // 1. Post Review after delivery
    {
      const res = await fetch(`${BASE_URL}/api/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${buyerToken}`,
        },
        body: JSON.stringify({
          product: product1Id,
          order: order1Id,
          rating: 5,
          comment: 'Excellent Sharbati wheat grains, high quality packaging!',
        }),
      });
      const json = await res.json();
      assertEqual(res.status, 201, 'Review - Post review after delivery returns 201');
    }

    // 2. Get Product Reviews (Public)
    {
      const res = await fetch(`${BASE_URL}/api/reviews?product=${product1Id}`);
      const json = await res.json();
      assertEqual(res.status, 200, 'Review - GET /api/reviews?product=:id returns 200');
      assertOk(json.reviews.length >= 1, 'Review - Product reviews returned');
    }

    // 3. Get Farmer Notifications
    {
      const res = await fetch(`${BASE_URL}/api/notifications`, {
        headers: { Authorization: `Bearer ${farmerToken}` },
      });
      const json = await res.json();
      assertEqual(res.status, 200, 'Notification - GET /api/notifications returns 200');
      assertOk((json.notifications || json.data || []).length > 0, 'Notification - Farmer received order notifications');
    }

    // -------------------------------------------------------------------
    // MODULE 11: USER PROFILE & ADMIN APIS
    // -------------------------------------------------------------------
    logSection('MODULE 11: USER PROFILE & ADMIN APIS');

    // 1. GET User Profile
    {
      const res = await fetch(`${BASE_URL}/api/users/profile`, {
        headers: { Authorization: `Bearer ${buyerToken}` },
      });
      const json = await res.json();
      assertEqual(res.status, 200, 'User Profile - GET /api/users/profile returns 200');
      assertEqual(json.data.email, buyerEmail, 'User Profile - Email matches');
    }

    // 2. Admin GET Users
    {
      const res = await fetch(`${BASE_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const json = await res.json();
      assertEqual(res.status, 200, 'Admin - GET /api/admin/users returns 200');
      assertOk(json.data.length >= 4, 'Admin - Users listed');
    }

    // 3. Admin GET Dashboard Stats
    {
      const res = await fetch(`${BASE_URL}/api/admin/dashboard-stats`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const json = await res.json();
      assertEqual(res.status, 200, 'Admin - GET /api/admin/dashboard-stats returns 200');
      assertOk(json.data.totalUsers >= 4, 'Admin - Dashboard stats populated');
    }

    // -------------------------------------------------------------------
    // CLEANUP TEST DATA
    // -------------------------------------------------------------------
    logSection('CLEANUP & TEARDOWN');
    await Order.deleteMany({ _id: { $in: [order1Id, order2Id] } });
    await Cart.deleteMany({ buyer: { $in: [buyerUserId, buyer2UserId] } });
    await Review.deleteMany({ product: { $in: [product1Id, product2Id] } });
    await Notification.deleteMany({ receiver: { $in: [farmerUserId, farmer2UserId, buyerUserId, buyer2UserId] } });
    await Product.deleteMany({ _id: { $in: [product1Id, product2Id] } });
    await FarmerProfile.deleteMany({ _id: { $in: [farmerProfileId, farmer2ProfileId] } });
    await BuyerProfile.deleteMany({ _id: { $in: [buyerProfileId, buyer2ProfileId] } });
    await User.deleteMany({ _id: { $in: [farmerUserId, farmer2UserId, buyerUserId, buyer2UserId, adminUserId] } });
    await Category.deleteMany({ _id: { $in: [category1Id, category2Id] } });
    logPass('All test data cleaned up successfully');

    logSection('🎉 ALL COMPREHENSIVE REGRESSION TESTS PASSED SUCCESSFULLY!');
  } finally {
    if (server) server.close();
    await mongoose.disconnect();
  }
}

runFullRegression().catch((err) => {
  console.error('\n❌ REGRESSION TEST FAILED:', err);
  if (server) server.close();
  mongoose.disconnect();
  process.exit(1);
});
