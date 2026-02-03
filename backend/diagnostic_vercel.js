/**
 * Vercel Deployment Diagnostic Script
 * Run this to check if your environment is properly configured
 */

require('dotenv').config({ path: __dirname + '/.env' });

console.log('\n=== VERCEL DEPLOYMENT DIAGNOSTICS ===\n');

// Check Node version
console.log('✓ Node Version:', process.version);
console.log('✓ Platform:', process.platform);
console.log('✓ Architecture:', process.arch);

console.log('\n--- Environment Variables ---');

// Critical variables
const criticalVars = ['MONGO_URI', 'JWT_SECRET', 'NODE_ENV'];
const optionalVars = ['FRONTEND_URL', 'PORT'];

criticalVars.forEach(varName => {
  if (process.env[varName]) {
    // Mask sensitive data
    let value = process.env[varName];
    if (varName === 'MONGO_URI') {
      value = value.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@');
    } else if (varName === 'JWT_SECRET') {
      value = '****' + value.slice(-4);
    }
    console.log(`✓ ${varName}: ${value}`);
  } else {
    console.log(`✗ ${varName}: MISSING (CRITICAL)`);
  }
});

optionalVars.forEach(varName => {
  if (process.env[varName]) {
    console.log(`✓ ${varName}: ${process.env[varName]}`);
  } else {
    console.log(`⚠ ${varName}: Not set (optional)`);
  }
});

console.log('\n--- Database Connection Test ---');

// Test MongoDB connection
const mongoose = require('mongoose');

if (!process.env.MONGO_URI) {
  console.log('✗ Cannot test database: MONGO_URI is missing');
  process.exit(1);
}

mongoose.set('strictQuery', false);

console.log('Attempting to connect to MongoDB...');

mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  family: 4
})
  .then(() => {
    console.log('✓ MongoDB connection successful!');
    console.log('✓ Database:', mongoose.connection.name);
    console.log('✓ Host:', mongoose.connection.host);
    
    // Test a simple query
    return mongoose.connection.db.admin().ping();
  })
  .then(() => {
    console.log('✓ Database ping successful!');
    console.log('\n=== ALL CHECKS PASSED ===\n');
    console.log('Your environment is properly configured for Vercel deployment.');
    console.log('\nNext steps:');
    console.log('1. Commit your changes: git add . && git commit -m "Fix Vercel deployment"');
    console.log('2. Push to GitHub: git push');
    console.log('3. Vercel will auto-deploy, or manually deploy from dashboard');
    console.log('4. Add environment variables in Vercel dashboard');
    process.exit(0);
  })
  .catch(err => {
    console.log('✗ Database connection failed!');
    console.log('Error:', err.message);
    console.log('\nTroubleshooting:');
    console.log('1. Check if MONGO_URI is correct');
    console.log('2. Verify MongoDB Atlas allows connections from anywhere (0.0.0.0/0)');
    console.log('3. Ensure your MongoDB user has proper permissions');
    process.exit(1);
  });
