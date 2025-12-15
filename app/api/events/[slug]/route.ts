import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Event from "@/database/event.model";

/**
 * GET /api/events/[slug]
 * Fetches a single event by its slug
 *
 * @param request - NextRequest object
 * @param params - Route parameters containing the slug
 * @returns Event data with 200 status, or error with appropriate status code
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    // Extract slug from params
    const { slug } = await params;

    // Validate slug parameter
    if (!slug || typeof slug !== "string") {
      return NextResponse.json(
        { message: "Slug parameter is required and must be a valid string" },
        { status: 400 }
      );
    }

    // Validate slug format (URL-friendly: lowercase alphanumeric with hyphens)
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!slugRegex.test(slug)) {
      return NextResponse.json(
        {
          message:
            "Invalid slug format. Slug must contain only lowercase letters, numbers, and hyphens",
        },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // Query event by slug
    const event = await Event.findOne({ slug }).lean();

    // Handle event not found
    if (!event) {
      return NextResponse.json(
        { message: `Event with slug '${slug}' not found` },
        { status: 404 }
      );
    }

    // Return event data
    return NextResponse.json(
      {
        message: "Event fetched successfully",
        event,
      },
      { status: 200 }
    );
  } catch (error) {
    // Log error for debugging (in production, use proper logging service)
    console.error("Error fetching event by slug:", error);

    // Handle unexpected errors
    return NextResponse.json(
      {
        message: "An unexpected error occurred while fetching the event",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
