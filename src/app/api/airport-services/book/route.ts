import { NextRequest, NextResponse } from "next/server";
import {
  createAirportServiceBooking,
  generateBookingNumber,
} from "@/lib/airport-services";

interface BookingRequestBody {
  serviceType: "arrival_fast_track" | "arrival_vip" | "departure_fast_track" | "departure_vip" | "car_pickup";
  airport: string;
  flightNumber: string;
  flightDate: string;
  passengerCount: number;
  includePorter: boolean;
  isNightFlight: boolean;
  fullName: string;
  email: string;
  phone: string;
  nationality: string;
  pickupAddress?: string;
  specialRequests?: string;
  totalPrice: number;
  flightData?: {
    arrivalAirport: string;
    arrivalAirportCode: string;
    departureAirport: string;
    departureAirportCode: string;
    arrivalDate: string;
    flightNumber: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: BookingRequestBody = await request.json();

    // Validate required fields
    if (
      !body.serviceType ||
      !body.airport ||
      !body.flightNumber ||
      !body.flightDate ||
      !body.fullName ||
      !body.email ||
      !body.phone ||
      !body.nationality
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    // Validate service type
    const validServiceTypes = [
      "arrival_fast_track",
      "arrival_vip",
      "departure_fast_track",
      "departure_vip",
      "car_pickup",
    ];
    if (!validServiceTypes.includes(body.serviceType)) {
      return NextResponse.json(
        { error: "Invalid service type" },
        { status: 400 }
      );
    }

    // Validate airport
    const validAirports = ["HAN", "SGN", "DAD"];
    if (!validAirports.includes(body.airport)) {
      return NextResponse.json(
        { error: "Invalid airport" },
        { status: 400 }
      );
    }

    // Validate car pickup has address
    if (body.serviceType === "car_pickup" && !body.pickupAddress) {
      return NextResponse.json(
        { error: "Pickup address is required for car service" },
        { status: 400 }
      );
    }

    // Generate unique booking number
    const bookingNumber = await generateBookingNumber();

    // Get client information
    const userAgent = request.headers.get("user-agent") || "";
    const ipAddress =
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      request.headers.get("x-real-ip") ||
      "unknown";

    // Create booking in database
    const booking = await createAirportServiceBooking({
      bookingNumber,
      serviceType: body.serviceType,
      airport: body.airport,
      flightNumber: body.flightNumber.toUpperCase(),
      flightDate: body.flightDate,
      passengerCount: body.passengerCount || 1,
      includePorter: body.includePorter || false,
      isNightFlight: body.isNightFlight || false,
      fullName: body.fullName,
      email: body.email.toLowerCase(),
      phone: body.phone,
      nationality: body.nationality,
      pickupAddress: body.pickupAddress,
      specialRequests: body.specialRequests,
      totalPrice: body.totalPrice,
      flightData: body.flightData,
      status: "pending",
      sourceDomain: "flyvietnam.help",
      userAgent,
      ipAddress,
    });

    // TODO: Send confirmation email
    // sendAirportServiceConfirmationEmail(booking).catch((error) => {
    //   console.error("Failed to send confirmation email:", error);
    // });

    // Log for now
    console.log("Airport service booking created:", {
      bookingNumber: booking.bookingNumber,
      serviceType: booking.serviceType,
      airport: booking.airport,
      flightNumber: booking.flightNumber,
      fullName: booking.fullName,
      email: booking.email,
      totalPrice: booking.totalPrice,
    });

    return NextResponse.json({
      success: true,
      bookingNumber: booking.bookingNumber,
      message: "Booking submitted successfully. We will contact you within 2 hours to confirm.",
    });
  } catch (error) {
    console.error("Error creating airport service booking:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to submit booking",
      },
      { status: 500 }
    );
  }
}

// Get booking by number
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const bookingNumber = searchParams.get("bookingNumber");

  if (!bookingNumber) {
    return NextResponse.json(
      { error: "Booking number required" },
      { status: 400 }
    );
  }

  try {
    const { getBookingByNumber } = await import("@/lib/airport-services");
    const booking = await getBookingByNumber(bookingNumber);

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    // Return limited info for public access
    return NextResponse.json({
      bookingNumber: booking.bookingNumber,
      serviceType: booking.serviceType,
      airport: booking.airport,
      flightNumber: booking.flightNumber,
      flightDate: booking.flightDate,
      status: booking.status,
    });
  } catch (error) {
    console.error("Error fetching airport service booking:", error);
    return NextResponse.json(
      { error: "Failed to fetch booking" },
      { status: 500 }
    );
  }
}
