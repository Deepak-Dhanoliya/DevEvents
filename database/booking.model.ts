import { Schema, model, models, Document, Types } from "mongoose";
import Event from "./event.model";

/**
 * Booking document interface
 */
export interface IBooking extends Document {
  eventId: Types.ObjectId;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Booking schema
 */
const BookingSchema = new Schema<IBooking>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: [true, "Event ID is required"],
      index: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      index: true,
      validate: {
        validator: (email: string) => {
          const emailRegex =
            /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
          return emailRegex.test(email);
        },
        message: "Please provide a valid email address",
      },
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Validate that referenced Event exists before saving
 * Mongoose v7 compatible (async + throw)
 */
BookingSchema.pre("save", async function () {
  const booking = this as IBooking;

  if (booking.isNew || booking.isModified("eventId")) {
    const eventExists = await Event.exists({ _id: booking.eventId });

    if (!eventExists) {
      throw new Error(`Event with ID ${booking.eventId} does not exist`);
    }
  }
});

/**
 * Indexes
 */
BookingSchema.index({ eventId: 1, createdAt: -1 });
BookingSchema.index(
  { eventId: 1, email: 1 },
  { unique: true, name: "uniq_event_email" }
);

/**
 * Model
 */
const Booking = models.Booking || model<IBooking>("Booking", BookingSchema);

export default Booking;
