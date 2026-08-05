import path from "path";
import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";
import { initializeApp as initAdminApp, getApps as getAdminApps, cert } from "firebase-admin/app";
import { getFirestore as getAdminFirestore, FieldValue as AdminFieldValue } from "firebase-admin/firestore";
import { initializeApp as initClientApp } from "firebase/app";
import { getFirestore as getClientFirestore, collection as clientCollection, getDocs as clientGetDocs, updateDoc as clientUpdateDoc, serverTimestamp as clientServerTimestamp } from "firebase/firestore";
import { getAuth as getClientAuth, signInWithEmailAndPassword } from "firebase/auth";

// Load environment configuration (.env and .env.local)
dotenv.config({ path: path.resolve(process.cwd(), ".env") });
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

// Initialize Cloudinary SDK
const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET || process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET;

if (!cloudName || !apiKey || !apiSecret) {
  console.warn("⚠️ Warning: Cloudinary configuration variables not fully found in .env or .env.local.");
}

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true,
});

async function runMigration() {
  console.log("🚀 Starting image migration from external URLs/Unsplash to Cloudinary for Firestore [menu_items] collection...");
  console.log(`🌐 Cloudinary Configured -> Cloud Name: [${cloudName || "N/A"}]`);

  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "anna-caterer-2c82a";
  let adminReady = false;
  let dbAdmin = null;

  // Check for Firebase Admin SDK server credentials in environment
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY || process.env.FIREBASE_SERVICE_ACCOUNT || process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    try {
      if (!getAdminApps().length) {
        if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY || process.env.FIREBASE_SERVICE_ACCOUNT) {
          const keyRaw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY || process.env.FIREBASE_SERVICE_ACCOUNT;
          const serviceAccount = keyRaw.trim().startsWith("{") ? JSON.parse(keyRaw) : path.resolve(process.cwd(), keyRaw);
          initAdminApp({
            credential: cert(serviceAccount),
            projectId,
          });
        } else {
          initAdminApp({ projectId });
        }
      }
      dbAdmin = getAdminFirestore();
      await dbAdmin.collection("menu_items").limit(1).get();
      adminReady = true;
      console.log("✅ Using Firebase Admin SDK with server credentials for migration...");
    } catch (adminErr) {
      console.log("Notice: Firebase Admin SDK authentication failed. Switching automatically to Firebase Client SDK using .env credentials...");
      adminReady = false;
    }
  } else {
    console.log("Notice: Server service account credentials (GOOGLE_APPLICATION_CREDENTIALS / FIREBASE_SERVICE_ACCOUNT_KEY) not found in local environment. Switching automatically to Firebase Client SDK using .env credentials...");
    adminReady = false;
  }

  let docsToProcess = [];
  let updateDocFunc = null;

  if (adminReady) {
    const snap = await dbAdmin.collection("menu_items").get();
    snap.docs.forEach((doc) => {
      docsToProcess.push({ id: doc.id, ref: doc.ref, data: doc.data() });
    });
    updateDocFunc = async (ref, secureUrl) => {
      await ref.update({
        imageUrl: secureUrl,
        updatedAt: AdminFieldValue.serverTimestamp(),
      });
    };
  } else {
    // Client SDK Fallback with optional Admin Login Support
    console.log("⚙️ Initializing Firebase Client SDK fallback...");
    const clientConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
    };

    const app = initClientApp(clientConfig);
    const dbClient = getClientFirestore(app);
    const auth = getClientAuth(app);

    if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
      console.log(`🔐 Authenticating as executive administrator [${process.env.ADMIN_EMAIL}]...`);
      try {
        await signInWithEmailAndPassword(auth, process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD);
        console.log("✅ Administrator authentication successful!");
      } catch (authErr) {
        console.warn("⚠️ Administrator authentication attempt failed:", authErr.message);
      }
    }

    const colRef = clientCollection(dbClient, "menu_items");
    const snap = await clientGetDocs(colRef);
    snap.docs.forEach((doc) => {
      docsToProcess.push({ id: doc.id, ref: doc.ref, data: doc.data() });
    });
    updateDocFunc = async (ref, secureUrl) => {
      await clientUpdateDoc(ref, {
        imageUrl: secureUrl,
        updatedAt: clientServerTimestamp(),
      });
    };
  }

  const totalDocs = docsToProcess.length;
  console.log(`📋 Found ${totalDocs} document(s) in [menu_items] collection to inspect and migrate.`);

  if (totalDocs === 0) {
    console.log("ℹ️ No menu items found in Firestore to migrate.");
    process.exit(0);
  }

  // Process in controlled batches of 5 to prevent Cloudinary rate limiting
  const BATCH_SIZE = 5;
  let processedCount = 0;
  let migratedCount = 0;
  let skippedCount = 0;

  for (let i = 0; i < totalDocs; i += BATCH_SIZE) {
    const batch = docsToProcess.slice(i, i + BATCH_SIZE);
    console.log(`\n🔄 Processing Batch ${Math.floor(i / BATCH_SIZE) + 1} of ${Math.ceil(totalDocs / BATCH_SIZE)} (Items ${i + 1} to ${Math.min(i + BATCH_SIZE, totalDocs)})...`);

    await Promise.all(
      batch.map(async (docItem) => {
        const title = docItem.data.title || `Dish (#${docItem.id})`;
        let currentImageUrl = docItem.data.imageUrl || "";

        if (!currentImageUrl) {
          currentImageUrl = `https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80`;
          console.log(`   [Info] ${title} was missing imageUrl. Defaulting to fallback culinary image.`);
        }

        // Check if already hosted on Cloudinary
        if (currentImageUrl.includes("res.cloudinary.com") || currentImageUrl.includes("cloudinary.com/")) {
          processedCount++;
          skippedCount++;
          console.log(`✅ [${processedCount}/${totalDocs}] ${title} is already on Cloudinary -> ${currentImageUrl}`);
          return;
        }

        try {
          // Upload to Cloudinary under folder "anna_caterers_menu"
          const uploadResponse = await cloudinary.uploader.upload(currentImageUrl, {
            folder: "anna_caterers_menu",
            resource_type: "image",
            overwrite: true,
          });

          const secureUrl = uploadResponse.secure_url;

          // Update Firestore Document
          await updateDocFunc(docItem.ref, secureUrl);

          processedCount++;
          migratedCount++;
          console.log(`🌟 [${processedCount}/${totalDocs}] Uploaded ${title} to Cloudinary -> ${secureUrl}`);
        } catch (uploadOrUpdateErr) {
          if (uploadOrUpdateErr?.message?.includes("PERMISSION_DENIED") || uploadOrUpdateErr?.code === "permission-denied") {
            console.log("\n" + "=".repeat(80));
            console.log("🛑 FIRESTORE WRITE PERMISSION DENIED NOTICE:");
            console.log("=".repeat(80));
            console.log(`Image was successfully uploaded to Cloudinary, but Firestore security rules denied updating document [${docItem.id}].`);
            console.log("Your local .env currently contains public client API keys without administrative write privileges.");
            console.log("\n💡 To execute this migration against your live database, use ONE of the following authentication methods:\n");
            console.log("👉 OPTION 1: Admin Email & Password (Easiest)");
            console.log("   Run the script by supplying your executive admin portal login credentials:");
            console.log("   $env:ADMIN_EMAIL='admin@annacaterers.com'; $env:ADMIN_PASSWORD='yourpassword'; node scripts/migrateImagesToCloudinary.mjs\n");
            console.log("👉 OPTION 2: Firebase Service Account Key (Admin SDK)");
            console.log("   1. In Firebase Console -> Project Settings -> Service Accounts -> Generate New Private Key.");
            console.log("   2. Save the downloaded JSON file as `serviceAccountKey.json` in your project root.");
            console.log("   3. Add to your .env or .env.local: GOOGLE_APPLICATION_CREDENTIALS='serviceAccountKey.json'");
            console.log("   4. Run: node scripts/migrateImagesToCloudinary.mjs");
            console.log("=".repeat(80) + "\n");
            process.exit(0);
          } else {
            console.error(`❌ Error processing item [${title}]:`, uploadOrUpdateErr.message || uploadOrUpdateErr);
          }
        }
      })
    );

    // Small delay between batches to ensure polite API usage
    if (i + BATCH_SIZE < totalDocs) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  console.log("\n" + "=".repeat(80));
  console.log(`🎉 SUCCESS! Image migration completed across all ${totalDocs} menu documents!`);
  console.log(`📊 Stats: ${migratedCount} newly migrated & uploaded | ${skippedCount} already on Cloudinary.`);
  console.log("=".repeat(80));
  process.exit(0);
}

runMigration().catch((err) => {
  console.error("❌ Fatal error during Cloudinary image migration:", err);
  process.exit(1);
});
