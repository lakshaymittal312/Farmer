import mongoose from 'mongoose';
import dotenv from 'dotenv';
import app from '../server.js';
import User from '../models/User.js';
import FarmerProfile from '../models/FarmerProfile.js';
import Product from '../models/Product.js';
import Category from '../models/Category.js';

dotenv.config();

const PORT = 5002;
const BASE_URL = `http://localhost:${PORT}`;

let server;

async function runVerification() {
  console.log('--- STARTING FARMER PRODUCT FLOW VERIFICATION ---');
  
  // 1. Connect DB
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  // 2. Start server
  await new Promise((resolve) => {
    server = app.listen(PORT, resolve);
  });
  console.log(`Server listening at ${BASE_URL}`);

  try {
    // 3. Setup test category
    let category = await Category.findOne({ name: 'Fresh Vegetables' });
    if (!category) {
      category = await Category.create({ name: 'Fresh Vegetables', description: 'Fresh farm vegetables' });
    }
    console.log(`Category ready: ${category.name} (${category._id})`);

    // 4. Register/Login Farmer User
    const email = `testfarmer_${Date.now()}@example.com`;
    const password = 'Password123!';
    
    const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Farmer John',
        email,
        password,
        role: 'farmer',
        phone: '9876543210'
      })
    });
    const regData = await regRes.json();
    console.log('Register response:', regData.success ? 'SUCCESS' : regData.message);
    const token = regData.token;

    // Create FarmerProfile for this user if not present
    let farmerProfile = await FarmerProfile.findOne({ user: regData.user._id || regData.user.id });
    if (!farmerProfile) {
      farmerProfile = await FarmerProfile.create({
        user: regData.user._id || regData.user.id,
        farmName: 'Green Acres Farm',
        village: 'Khanna',
        district: 'Ludhiana',
        state: 'Punjab',
        pincode: '141401'
      });
    }
    console.log(`FarmerProfile ready: ${farmerProfile.farmName} (${farmerProfile._id})`);

    // 5. TEST: ADD PRODUCT (POST /api/products)
    const productPayload = {
      name: 'Fresh Organic Tomatoes',
      category: category._id.toString(),
      description: 'Vine ripened organic red tomatoes harvested fresh daily',
      price: 45,
      unit: 'kg',
      quantityAvailable: 150,
      isOrganic: true,
      harvestDate: '2026-09-24',
      images: ['https://example.com/tomatoes.jpg']
    };

    console.log('\n--- TESTING ADD PRODUCT ---');
    const createRes = await fetch(`${BASE_URL}/api/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(productPayload)
    });
    const createData = await createRes.json();
    console.log('Add Product API Response Status:', createRes.status);
    console.log('Add Product API Response Body:', JSON.stringify(createData, null, 2));

    if (!createData.success) {
      throw new Error(`Add Product failed: ${createData.message}`);
    }

    const createdProductId = createData.data._id;
    console.log('Product created with ID:', createdProductId);

    // 6. VERIFY IN MONGODB
    console.log('\n--- VERIFYING PRODUCT IN MONGODB ---');
    const dbProduct = await Product.findById(createdProductId);
    if (!dbProduct) {
      throw new Error('Product NOT found in MongoDB!');
    }
    console.log('MongoDB product found:');
    console.log('- Name:', dbProduct.name);
    console.log('- Category:', dbProduct.category.toString());
    console.log('- Description:', dbProduct.description);
    console.log('- Price:', dbProduct.price);
    console.log('- Unit:', dbProduct.unit);
    console.log('- Quantity:', dbProduct.quantityAvailable);
    console.log('- FarmerProfile Ref:', dbProduct.farmer.toString());
    console.log('- Status:', dbProduct.status);
    console.log('- Location:', JSON.stringify(dbProduct.location));
    console.log('- Created At:', dbProduct.createdAt);

    if (dbProduct.farmer.toString() !== farmerProfile._id.toString()) {
      throw new Error(`Farmer reference mismatch! Expected ${farmerProfile._id}, got ${dbProduct.farmer}`);
    }
    if (dbProduct.price !== 45) {
      throw new Error(`Price mismatch! Expected 45, got ${dbProduct.price}`);
    }
    if (dbProduct.quantityAvailable !== 150) {
      throw new Error(`Quantity mismatch! Expected 150, got ${dbProduct.quantityAvailable}`);
    }
    if (dbProduct.status !== 'active') {
      throw new Error(`Status mismatch! Expected active, got ${dbProduct.status}`);
    }

    // 7. TEST MY PRODUCTS API (GET /api/products?farmer=me)
    console.log('\n--- TESTING MY PRODUCTS API ---');
    const myProductsRes = await fetch(`${BASE_URL}/api/products?farmer=me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const myProductsData = await myProductsRes.json();
    console.log('My Products API Status:', myProductsRes.status);
    console.log('My Products Count:', myProductsData.count);

    const foundInMyProducts = myProductsData.data.find(p => p._id === createdProductId);
    if (!foundInMyProducts) {
      throw new Error('Newly created product NOT found in My Products API response!');
    }
    console.log('Product found in My Products list successfully:', foundInMyProducts.name);

    // 8. NEGATIVE TESTING
    console.log('\n--- TESTING NEGATIVE CASES ---');

    // Case 1: Unauthenticated request
    const unauthRes = await fetch(`${BASE_URL}/api/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productPayload)
    });
    console.log('Unauthenticated request status:', unauthRes.status, '(Expected 401)');

    // Case 2: Missing required field (e.g. empty name)
    const emptyNamePayload = { ...productPayload, name: '' };
    const emptyNameRes = await fetch(`${BASE_URL}/api/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(emptyNamePayload)
    });
    console.log('Empty name request status:', emptyNameRes.status, '(Expected 400)');

    // Case 3: Invalid category ID
    const invalidCategoryPayload = { ...productPayload, category: '123invalid' };
    const invalidCatRes = await fetch(`${BASE_URL}/api/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(invalidCategoryPayload)
    });
    console.log('Invalid category request status:', invalidCatRes.status, '(Expected 400)');

    // Cleanup created test product
    await Product.findByIdAndDelete(createdProductId);
    await User.findByIdAndDelete(regData.user._id || regData.user.id);
    await FarmerProfile.findByIdAndDelete(farmerProfile._id);

    console.log('\n✅ ALL FARMER PRODUCT FLOW TESTS PASSED!');
  } finally {
    if (server) server.close();
    await mongoose.disconnect();
  }
}

runVerification().catch(err => {
  console.error('\n❌ VERIFICATION FAILED:', err);
  if (server) server.close();
  mongoose.disconnect();
  process.exit(1);
});
