import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, query, orderBy, serverTimestamp } from "firebase/firestore";

export const dynamic = "force-dynamic";

// GET: Fetch all client testimonials from Firestore
export async function GET() {
  try {
    const q = query(collection(db, "reviews"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    const reviews = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return NextResponse.json({ success: true, reviews });
  } catch (error) {
    console.error("Error fetching reviews from Firestore:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch reviews from database." },
      { status: 500 }
    );
  }
}

// POST: Handle review submission and write directly to Firestore 'reviews' collection
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, rating, review, eventType, content } = body;

    const feedbackText = review || content;

    if (!name || !feedbackText) {
      return NextResponse.json(
        { success: false, error: "Name and Review feedback are required fields." },
        { status: 400 }
      );
    }

    const numRating = Math.min(Math.max(Number(rating) || 5, 1), 5);

    const docRef = await addDoc(collection(db, "reviews"), {
      name: name.trim(),
      eventType: eventType || "Signature Event",
      role: eventType || "Signature Event",
      content: feedbackText.trim(),
      review: feedbackText.trim(),
      rating: numRating,
      createdAt: serverTimestamp(),
    });

    return NextResponse.json(
      { success: true, id: docRef.id, message: "Review saved directly to Firestore database." },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("API Error saving review to Firestore:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
