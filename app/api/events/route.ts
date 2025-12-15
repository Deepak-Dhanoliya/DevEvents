import connectDB from "@/lib/mongodb";
import { v2 as cloudinary } from "cloudinary";

import { NextRequest, NextResponse } from "next/server";
import Event from "@/database/event.model";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    // getting the form data
    const formData = await req.formData();
    let event;
    try {
      event = Object.fromEntries(formData.entries());
    } catch (e) {
      return NextResponse.json(
        { message: "Invalid JSON format" },
        { status: 400 }
      );
    }

    // getting the image from formdata
    const file = formData.get("image") as File;
    if (!file) {
      return NextResponse.json(
        { message: "Image file is required" },
        { status: 400 }
      );
    }

    const tags = JSON.parse(formData.get("tags") as string);
    const agenda = JSON.parse(formData.get("agenda") as string);

    // convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // upload using upload stream
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { resource_type: "image", folder: "DevEvent" },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
      uploadStream.end(buffer);
    });

    // store url in image field
    event.image = (uploadResult as { secure_url: string }).secure_url;

    const createdEvent = await Event.create({
      ...event,
      tags: tags,
      agenda: agenda,
    });
    
    return NextResponse.json(
      { message: "Event created successfully", event: createdEvent },
      { status: 201 }
    );
  } catch (e) {
    console.log(e);
    NextResponse.json(
      {
        message: "Event creation failed",
        error: e instanceof Error ? e.message : "Unknown",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await connectDB();
    const events = await Event.find().sort({ createdAt: -1 });
    return NextResponse.json(
      { message: "Event fetched successfully", events },
      { status: 200 }
    );
  } catch (e) {
    return NextResponse.json(
      { message: "Event fetching failed", error: e },
      { status: 500 }
    );
  }
}
