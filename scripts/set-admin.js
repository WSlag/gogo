// Run this script with: node scripts/set-admin.js
const admin = require('firebase-admin');
const serviceAccount = require('../functions/lib/index.js');

// Initialize with application default credentials
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: 'gogoph-app'
});

const USER_ID = '92dG2KStr7MfcF3skUKcqARCzD62';

async function setAdmin() {
  try {
    await admin.auth().setCustomUserClaims(USER_ID, { role: 'admin' });
    console.log('✅ SUCCESS! Admin claims set for user:', USER_ID);
    console.log('');
    console.log('Now sign out and sign back in to your app.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

setAdmin();
