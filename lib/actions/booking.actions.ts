"use server";

import mongoose from "mongoose";
import Booking from "@/database/booking.model";
import connectDB from "@/lib/mongodb";

export const createBooking = async ({
  eventId,
  email,
  slug,
}: {
  eventId: string;
  email: string;
  slug?: string;
}) => {
  try {
    await connectDB();

    await Booking.create({
      eventId: new mongoose.Types.ObjectId(eventId), // REQUIRED
      email,
    });

    return { success: true };
  } catch (error: any) {
    // Handle duplicate booking
    if (error.code === 11000) {
      return { success: false, message: "You have already booked this event" };
    }

    console.error("Create booking failed:", error);
    return { success: false, message: error.message };
  }
};
export const getBookingCountByEventId = async (eventId: string) => {
  try {
    await connectDB();

    const count = await Booking.countDocuments({
      eventId: new mongoose.Types.ObjectId(eventId),
    });

    return count;
  } catch (error) {
    console.error("Failed to fetch booking count:", error);
    return 0;
  }
};
