import { NextResponse } from "next/server";
import { seedDatabase } from "@/lib/seed";

export async function GET() {
  try {
    seedDatabase();
    return NextResponse.json({
      success: true,
      message: "Exolent Express database initialized and seeded successfully.",
    });
  } catch (error: any) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to seed database." },
      { status: 500 }
    );
  }
}
