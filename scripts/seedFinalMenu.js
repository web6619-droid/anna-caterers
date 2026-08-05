const admin = require('firebase-admin');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const cloudinary = require('cloudinary').v2;
require('dotenv').config({ path: '.env' });


// Compatibility shim for firebase-admin v14 modular syntax vs legacy properties
admin.firestore = () => getFirestore();
admin.firestore.FieldValue = FieldValue;
admin.credential = { cert: admin.cert };
Object.defineProperty(admin, 'apps', { get: () => admin.getApps() });

// Initialize Firebase
if (!admin.apps.length) {
  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'anna-caterer-2c82a';
  if (process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: projectId,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    const keyRaw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY || process.env.GOOGLE_APPLICATION_CREDENTIALS;
    if (keyRaw && keyRaw.trim().startsWith('{')) {
      admin.initializeApp({ credential: admin.credential.cert(JSON.parse(keyRaw)), projectId });
    } else {
      admin.initializeApp({ projectId });
    }
  } else {
    admin.initializeApp({ projectId });
  }
}
const db = admin.firestore();

// Initialize Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY || process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET || process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET,
});

// Set this to 'menu' or 'menu_items' based on your frontend check
const TARGET_COLLECTION = 'menu_items'; 

const menuData = [
  // BEVERAGES (Lunch & Dinner)
  ...['Watermelon Juice', 'Pineapple Juice', 'Papaya Juice', 'Grape Juice', 'Shamam Juice', 'Mango Juice', 'Mojitos', 'Fresh Lime'].map(title => ({
    title, category: 'Beverages', subCategory: null, suitableMeals: ['Lunch', 'Dinner'], price: 50, unit: 'glass', description: `Refreshing ${title.toLowerCase()} served chilled.`
  })),

  // STARTERS & LIVE COUNTERS (Lunch & Dinner)
  ...['Pizza', 'Burger', 'Sandwich', 'Momos', 'Chicken Roll', 'Chicken Nuggets', 'Veg Samosa', 'Fish Fingers', 'Cheese Balls', 'Veg Roll', 'French Fries'].map(title => ({
    title, category: 'Starter', subCategory: null, suitableMeals: ['Lunch', 'Dinner'], price: 120, unit: 'plate', description: `Delicious, freshly prepared ${title.toLowerCase()}.`
  })),

  // MAIN COURSE - 1ST COURSE (Lunch & Dinner)
  ...['Appam', 'Coin Porotta', 'Nool Porotta', 'Romali Rotti', 'Ediyappam', 'Porotta'].map(title => ({
    title, category: 'Main Course', subCategory: '1st Course', suitableMeals: ['Lunch', 'Dinner'], price: 20, unit: 'piece', description: `Soft and traditional ${title}.`
  })),
  ...['Duck Mappas', 'Chicken Kuruma', 'Beef Kuruma', 'Beef Stew', 'Chicken Stew', 'Mutton Stew', 'Fish Molly', 'Pork Mustard', 'Korean Pork'].map(title => ({
    title, category: 'Main Course', subCategory: '1st Course', suitableMeals: ['Lunch', 'Dinner'], price: 180, unit: 'portion', description: `Rich and authentic ${title}.`
  })),
  ...['Broasted Chicken', 'Al Fahm', 'Chicken Shawaya', 'Chicken Kondattam', 'Beef Kondattam', 'Dragon Chicken', 'Garlic Chicken'].map(title => ({
    title, category: 'Main Course', subCategory: '1st Course', suitableMeals: ['Lunch', 'Dinner'], price: 220, unit: 'portion', description: `Premium ${title}, perfectly spiced.`
  })),
  ...['Beef Cutlet', 'Chicken Cutlet', 'Fish Cutlet', 'Kanthari Cutlet'].map(title => ({
    title, category: 'Main Course', subCategory: '1st Course', suitableMeals: ['Lunch', 'Dinner'], price: 40, unit: 'piece', description: `Crispy, golden-fried ${title}.`
  })),

  // MAIN COURSE - 2ND COURSE (Dinner Only)
  ...['Fried Rice', 'Ghee Rice', 'Pulav Rice', 'Chicken Roast', 'Pepper Chicken', 'Beef Roast', 'Chilly Chicken', 'Al Fahm Mandhi', 'Shawaya Mandhi'].map(title => ({
    title, category: 'Main Course', subCategory: '2nd Course', suitableMeals: ['Dinner'], price: 180, unit: 'plate', description: `Classic ${title}, perfect for dinner.`
  })),

  // MAIN COURSE - 2ND COURSE (Lunch & Dinner)
  ...['Chicken Dum Biryani', 'Beef Dum Biryani', 'Mutton Dum Biryani'].map(title => ({
    title, category: 'Main Course', subCategory: '2nd Course', suitableMeals: ['Lunch', 'Dinner'], price: 250, unit: 'plate', description: `Aromatic and rich ${title}.`
  })),

  // MAIN COURSE - 2ND COURSE (Lunch Only - Sadhya)
  {
    title: 'Traditional Plain Rice Spread', category: 'Main Course', subCategory: '2nd Course', suitableMeals: ['Lunch'], price: 300, unit: 'leaf', description: 'Plain Rice served with Angamaly Manga Curry, Fish Vattichathu, Chicken 65 / Beef Roast Chaps, Aviyal, Thoran, Kondattam, Chamanthi, Salad & Pickle.'
  },

  // DESSERTS & COUNTERS (Lunch & Dinner)
  ...['Ice Cream with Tender Coconut Pudding', 'Ice Cream with Strawberry Pudding', 'Ice Cream with Chocolate Pudding', 'Turkish Ice Cream', 'Pistachio Kunafa', 'Luqaimat', 'Baklava', 'Tender Coconut Pudding', 'Fruit Salad', 'Carrot Halwa', 'Brownie', 'Pastry Counter', 'Salad Counter', 'Tea Counter'].map(title => ({
    title, category: 'Dessert', subCategory: null, suitableMeals: ['Lunch', 'Dinner'], price: 100, unit: 'portion', description: `Delightful ${title} to complete your meal.`
  }))
];

async function seedDatabase() {
  if (!process.env.FIREBASE_CLIENT_EMAIL && !process.env.GOOGLE_APPLICATION_CREDENTIALS && !process.env.FIREBASE_SERVICE_ACCOUNT_KEY && !process.env.FIREBASE_PRIVATE_KEY) {
    console.log("\n" + "=".repeat(80));
    console.log("🛑 FIRESTORE ADMIN CREDENTIALS REQUIRED NOTICE:");
    console.log("=".repeat(80));
    console.log(`To clear [${TARGET_COLLECTION}] and seed new menu items via Firebase Admin SDK, please ensure your service account credentials are in .env.local:`);
    console.log("1. In Firebase Console -> Project Settings -> Service Accounts -> Generate New Private Key.");
    console.log("2. Open the downloaded JSON file and paste these three variables into your .env.local file:");
    console.log("   FIREBASE_PROJECT_ID='anna-caterer-2c82a'");
    console.log("   FIREBASE_CLIENT_EMAIL='your-service-account-email@...'");
    console.log("   FIREBASE_PRIVATE_KEY='-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----\\n'");
    console.log("3. Re-run the command: node scripts/seedFinalMenu.js");
    console.log("=".repeat(80) + "\n");
    return;
  }

  try {
    console.log(`Clearing collection: ${TARGET_COLLECTION}...`);
    const snapshot = await db.collection(TARGET_COLLECTION).get();
    const batchDelete = db.batch();
    snapshot.docs.forEach((doc) => batchDelete.delete(doc.ref));
    await batchDelete.commit();
    console.log('Old dummy data cleared.');

    console.log(`Starting upload of ${menuData.length} items...`);
    
    for (let i = 0; i < menuData.length; i++) {
      const item = menuData[i];
      const unsplashUrl = `https://placehold.co/800x600/1e1e1e/eab308.png?text=${encodeURIComponent(item.title)}`;
      
      console.log(`[${i + 1}/${menuData.length}] Uploading image for: ${item.title}`);
      
      // Upload to Cloudinary
      const cloudinaryRes = await cloudinary.uploader.upload(unsplashUrl, {
        folder: 'anna_caterers_menu',
      });

      // Save to Firestore
      await db.collection(TARGET_COLLECTION).add({
        ...item,
        imageUrl: cloudinaryRes.secure_url,
        imagePublicId: cloudinaryRes.public_id,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }
    
    console.log('✅ Database successfully seeded with permanent Cloudinary images!');
  } catch (error) {
    if (error.message && (error.message.includes("Could not load the default credentials") || error.message.includes("PERMISSION_DENIED"))) {
      console.log("\n" + "=".repeat(80));
      console.log("🛑 FIRESTORE ADMIN CREDENTIALS REQUIRED NOTICE:");
      console.log("=".repeat(80));
      console.log("To execute this live write and delete from the [menu_items] collection via Firebase Admin SDK, please ensure your service account credentials are placed in your .env.local file:");
      console.log("1. In Firebase Console -> Project Settings -> Service Accounts -> Generate New Private Key.");
      console.log("2. Open the downloaded JSON file and paste these three variables into your .env.local file:");
      console.log("   FIREBASE_PROJECT_ID='anna-caterer-2c82a'");
      console.log("   FIREBASE_CLIENT_EMAIL='your-service-account-email@...'");
      console.log("   FIREBASE_PRIVATE_KEY='-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----\\n'");
      console.log("3. Re-run the command: node scripts/seedFinalMenu.js");
      console.log("=".repeat(80) + "\n");
    } else {
      console.error('Error seeding database:', error);
    }
  }
}

seedDatabase();
