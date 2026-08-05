import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { getAdminAuth } from "@/lib/firebase-admin";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: Request) {
  try {
    // 1. Verify Administrative Authorization
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized: Missing authentication credentials" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    const adminAuth = getAdminAuth();
    if (!adminAuth) {
      return NextResponse.json({ error: "Server Configuration Error: Firebase Admin SDK credentials not configured in environment" }, { status: 500 });
    }

    try {
      await adminAuth.verifyIdToken(token);
    } catch {
      return NextResponse.json({ error: "Unauthorized: Expired or invalid admin session" }, { status: 401 });
    }

    // 2. Validate request payload
    const { public_id, publicId, resource_type, resourceType } = await req.json();
    const targetId = public_id || publicId;
    if (!targetId || typeof targetId !== "string") {
      return NextResponse.json({ error: "Bad Request: A valid public_id or publicId string is required" }, { status: 400 });
    }

    const targetType = resource_type || resourceType || "image";

    // 3. SECURITY MANDATE: Strict Folder Confinement Guardrail
    // Reject any targetId that does not strictly reside within our project folder namespaces ("annacaterers" or "anna_caterers")
    if (!targetId.startsWith("annacaterers") && !targetId.startsWith("anna_caterers")) {
      console.warn(`Unauthorized asset deletion attempt outside project bounds for asset: ${targetId}`);
      return NextResponse.json(
        { error: "Forbidden: Asset is out of scope. Can only destroy resources within project vaults." },
        { status: 403 }
      );
    }

    // 4. Invoke secure server-to-server Cloudinary destroy request supporting image and video types
    let result = await cloudinary.uploader.destroy(targetId, {
      resource_type: targetType,
      invalidate: true, // Purge cached CDN replicas across edge nodes immediately
    });

    // If item was recorded as image but actually exists as video on Cloudinary, gracefully retry as video
    if (result.result === "not found" && targetType === "image") {
      result = await cloudinary.uploader.destroy(targetId, {
        resource_type: "video",
        invalidate: true,
      });
    }

    if (result.result !== "ok" && result.result !== "not found") {
      return NextResponse.json({ error: "CDN asset destruction failed", details: result }, { status: 502 });
    }

    return NextResponse.json(
      { success: true, message: `Asset [${public_id}] destroyed successfully from CDN edge network.`, result },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Asset Deletion Endpoint Error:", error);
    return NextResponse.json({ error: "Internal Server Error during asset removal" }, { status: 500 });
  }
}
