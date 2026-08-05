// CJS compatibility wrapper to allow executing via `node scripts/migrateImagesToCloudinary.js` or `.mjs`
import("./migrateImagesToCloudinary.mjs").catch((err) => {
  console.error("❌ Fatal error executing script:", err);
  process.exit(1);
});
