import { NextResponse } from "next/server";

// In-memory array to simulate database persistence during active server runs
// In production, you would insert into PostgreSQL, MongoDB, or Firebase Firestore here.
const reviewsDatabase = [
  {
    id: 1,
    stars: "★★★★★",
    quote: "We brought them in to cater our cricket club's end-of-season banquet. The menu was hearty, premium, and absolutely spot-on for the team. Highly recommended!",
    initial: "V",
    author: "Vikram M.",
    role: "Sports Club Banquet",
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    stars: "★★★★★",
    quote: "I hosted a cozy holiday party for 10 people and wanted fine dining brought directly to my home. The customized spread was immaculate. A true luxury experience.",
    initial: "A",
    author: "Anjali K.",
    role: "Private Holiday Gathering",
    createdAt: new Date().toISOString(),
  },
];

// GET: Fetch all client testimonials
export async function GET() {
  return NextResponse.json({ success: true, reviews: reviewsDatabase });
}

// POST: Handle review submission from the modal and return the formatted card object
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, rating, review, eventType } = body;

    if (!name || !review) {
      return NextResponse.json(
        { success: false, error: "Name and Review are required fields." },
        { status: 400 }
      );
    }

    const numRating = Math.min(Math.max(Number(rating) || 5, 1), 5);
    const starString = "★".repeat(numRating) + "☆".repeat(5 - numRating);
    const initial = name.trim().charAt(0).toUpperCase() || "C";

    const newReviewRecord = {
      id: reviewsDatabase.length + 1,
      stars: starString,
      quote: review.trim(),
      initial,
      author: name.trim(),
      role: eventType || "Signature Event",
      createdAt: new Date().toISOString(),
    };

    // Prepend to our storage so newest appears first
    reviewsDatabase.unshift(newReviewRecord);

    // Return 201 Created with the new object so frontend can immediately render it!
    return NextResponse.json(
      { success: true, newReview: newReviewRecord },
      { status: 201 }
    );
  } catch (error) {
    console.error("API Error processing review:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
