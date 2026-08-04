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
    // 1. Authenticate Request via Authorization header or session cookie
    const authHeader = req.headers.get("Authorization");
    const cookieHeader = req.headers.get("cookie") || "";
    const sessionTokenMatch = cookieHeader.match(/(?:^|;\s*)(?:__session|session)=([^;]+)/);
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.split("Bearer ")[1]
      : sessionTokenMatch
      ? sessionTokenMatch[1]
      : null;

    if (!token && process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Unauthorized: Missing identity token or session cookie" }, { status: 401 });
    }

    if (token) {
      const adminAuth = getAdminAuth();
      if (!adminAuth) {
        return NextResponse.json({ error: "Server Configuration Error: Firebase Admin SDK credentials not configured in environment" }, { status: 500 });
      }
      try {
        await adminAuth.verifyIdToken(token);
      } catch (authError) {
        if (process.env.NODE_ENV === "production") {
          return NextResponse.json({ error: "Unauthorized: Invalid or expired session token" }, { status: 401 });
        }
      }
    }

    // 2. Parse signature parameters from client request
    const body = await req.json();
    const { paramsToSign } = body;

    if (!paramsToSign) {
      return NextResponse.json({ error: "Bad Request: Missing parameters to sign" }, { status: 400 });
    }

    // 3. SECURITY MANDATE: Server-Side Folder Confinement Guardrail
    // Forcefully set or overwrite folder to 'annacaterers' so client cannot tamper or upload elsewhere
    const securedParamsToSign = {
      ...paramsToSign,
      folder: "annacaterers",
    };

    // 4. Generate Cryptographic Signature via server secret
    const signature = cloudinary.utils.api_sign_request(
      securedParamsToSign,
      process.env.CLOUDINARY_API_SECRET!
    );

    return NextResponse.json({ signature }, { status: 200 });
  } catch (error: unknown) {
    console.error("Signature API Error:", error);
    return NextResponse.json({ error: "Internal Server Error during Cloudinary signature signing" }, { status: 500 });
  }
}
