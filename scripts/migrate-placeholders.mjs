import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";

// Load environment configuration
dotenv.config({ path: path.resolve(process.cwd(), ".env") });
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (!cloudName || cloudName === "your_cloud_name_here" || !apiKey || !apiSecret) {
  console.error("❌ CLOUDINARY CREDENTIALS MISSING!");
  process.exit(1);
}

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
});

const TARGET_FOLDER = "annacaterers";

// Updated list with valid, reliable high-resolution URLs for all 10 placeholder items
const placeholderUrls = [
  { id: "signature-weddings", url: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
  { id: "birthday-celebrations", url: "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
  { id: "baptisms-christenings", url: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
  { id: "corporate-galas", url: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
  { id: "private-dining", url: "https://images.unsplash.com/photo-1544148103-0773bf10d330?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
  { id: "cultural-feasts", url: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
  { id: "gallery-1", url: "https://images.unsplash.com/photo-1555244162-803834f70033?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
  { id: "gallery-2", url: "https://images.unsplash.com/photo-1519741497674-611481863552?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
  { id: "gallery-3", url: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
  { id: "gallery-4", url: "https://images.unsplash.com/photo-1478146896981-b80fe463b330?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" }
];

async function runMigration() {
  console.log(`🚀 Starting programmatic migration of placeholder assets into Cloudinary folder [${TARGET_FOLDER}]...`);
  const mapping = {};

  for (const item of placeholderUrls) {
    try {
      console.log(`📤 Uploading [${item.id}] to Cloudinary...`);
      const res = await cloudinary.uploader.upload(item.url, {
        folder: TARGET_FOLDER,
        public_id: item.id,
        overwrite: true,
        resource_type: "image",
      });
      console.log(`✅ Success: ${res.public_id} -> ${res.secure_url}`);
      mapping[item.id] = {
        public_id: res.public_id,
        secure_url: res.secure_url,
      };
    } catch (err) {
      console.error(`❌ Failed to migrate ${item.id}:`, err);
    }
  }

  const outputPath = path.resolve(process.cwd(), "src/data/cloudinary-mapping.json");
  fs.writeFileSync(outputPath, JSON.stringify(mapping, null, 2));
  console.log(`🎉 Migration complete! Asset mapping saved cleanly to: ${outputPath}`);
}

runMigration().catch(console.error);
