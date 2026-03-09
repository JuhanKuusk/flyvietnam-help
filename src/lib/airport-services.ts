/**
 * Supabase database operations for Airport Services (Fast Track, VIP, Car Pickup)
 */

import { supabase } from "./supabase";

// Types for airport service bookings
export interface AirportServiceBooking {
  id: string;
  bookingNumber: string;
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
  status: "pending" | "confirmed" | "completed" | "cancelled";
  sourceDomain: string;
  userAgent?: string;
  ipAddress?: string;
  createdAt: string;
  updatedAt: string;
}

export type CreateAirportServiceBookingData = Omit<AirportServiceBooking, "id" | "createdAt" | "updatedAt">;

/**
 * Create a new airport service booking in the database
 */
export async function createAirportServiceBooking(
  booking: CreateAirportServiceBookingData
): Promise<AirportServiceBooking> {
  const { data, error } = await supabase
    .from("airport_service_bookings")
    .insert({
      booking_number: booking.bookingNumber,
      service_type: booking.serviceType,
      airport: booking.airport,
      flight_number: booking.flightNumber,
      flight_date: booking.flightDate,
      passenger_count: booking.passengerCount,
      include_porter: booking.includePorter,
      is_night_flight: booking.isNightFlight,
      full_name: booking.fullName,
      email: booking.email,
      phone: booking.phone,
      nationality: booking.nationality,
      pickup_address: booking.pickupAddress,
      special_requests: booking.specialRequests,
      total_price: booking.totalPrice,
      flight_data: booking.flightData,
      status: booking.status || "pending",
      source_domain: booking.sourceDomain || "flyvietnam.help",
      user_agent: booking.userAgent,
      ip_address: booking.ipAddress,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating airport service booking:", error);
    throw new Error(`Failed to create airport service booking: ${error.message}`);
  }

  return mapDbRowToBooking(data);
}

/**
 * Get count of airport service bookings created today
 * Used for generating unique booking numbers
 */
export async function getTodayBookingCount(): Promise<number> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayISO = today.toISOString();

  const { count, error } = await supabase
    .from("airport_service_bookings")
    .select("*", { count: "exact", head: true })
    .gte("created_at", todayISO);

  if (error) {
    console.error("Error getting today's booking count:", error);
    return 0;
  }

  return count || 0;
}

/**
 * Generate unique booking number in format: FT-YYYYMMDD-XXXX
 */
export async function generateBookingNumber(): Promise<string> {
  const count = await getTodayBookingCount();
  const today = new Date();
  const dateStr = today.toISOString().split("T")[0].replace(/-/g, "");
  const sequence = String(count + 1).padStart(4, "0");
  return `FT-${dateStr}-${sequence}`;
}

/**
 * Get a booking by booking number
 */
export async function getBookingByNumber(bookingNumber: string): Promise<AirportServiceBooking | null> {
  const { data, error } = await supabase
    .from("airport_service_bookings")
    .select("*")
    .eq("booking_number", bookingNumber)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null; // Not found
    }
    console.error("Error fetching booking:", error);
    throw new Error(`Failed to fetch booking: ${error.message}`);
  }

  return mapDbRowToBooking(data);
}

/**
 * Get all bookings (for admin)
 */
export async function getAllBookings(options?: {
  status?: string;
  limit?: number;
  offset?: number;
}): Promise<{ bookings: AirportServiceBooking[]; total: number }> {
  let query = supabase
    .from("airport_service_bookings")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  if (options?.status) {
    query = query.eq("status", options.status);
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 20) - 1);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error("Error fetching bookings:", error);
    throw new Error(`Failed to fetch bookings: ${error.message}`);
  }

  return {
    bookings: (data || []).map(mapDbRowToBooking),
    total: count || 0,
  };
}

/**
 * Update booking status
 */
export async function updateBookingStatus(
  bookingNumber: string,
  status: AirportServiceBooking["status"]
): Promise<AirportServiceBooking> {
  const { data, error } = await supabase
    .from("airport_service_bookings")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("booking_number", bookingNumber)
    .select()
    .single();

  if (error) {
    console.error("Error updating booking status:", error);
    throw new Error(`Failed to update booking status: ${error.message}`);
  }

  return mapDbRowToBooking(data);
}

/**
 * Map database row to TypeScript interface
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapDbRowToBooking(row: any): AirportServiceBooking {
  return {
    id: row.id,
    bookingNumber: row.booking_number,
    serviceType: row.service_type,
    airport: row.airport,
    flightNumber: row.flight_number,
    flightDate: row.flight_date,
    passengerCount: row.passenger_count,
    includePorter: row.include_porter,
    isNightFlight: row.is_night_flight,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    nationality: row.nationality,
    pickupAddress: row.pickup_address,
    specialRequests: row.special_requests,
    totalPrice: row.total_price,
    flightData: row.flight_data,
    status: row.status,
    sourceDomain: row.source_domain,
    userAgent: row.user_agent,
    ipAddress: row.ip_address,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
