"use client";

import { useState, useCallback, useEffect, MouseEvent } from "react";
import { FlightInfo } from "./flight-info";

// Helper to make entire date input clickable
const handleDateInputClick = (e: MouseEvent<HTMLInputElement>) => {
  const input = e.currentTarget;
  if ('showPicker' in input && typeof input.showPicker === 'function') {
    try {
      input.showPicker();
    } catch {
      // Some browsers may throw if already showing
    }
  }
};

// Service types for Fast Track
type ServiceType = "arrival_fast_track" | "arrival_vip" | "departure_fast_track" | "departure_vip" | "car_pickup";

// Airport options
const AIRPORTS = [
  { code: "HAN", name: "Hanoi - Noi Bai International Airport" },
  { code: "SGN", name: "Ho Chi Minh City - Tan Son Nhat International Airport" },
  { code: "DAD", name: "Da Nang International Airport" },
];

// Service pricing
const SERVICE_PRICES: Record<ServiceType, Record<string, number>> = {
  arrival_fast_track: { HAN: 35, SGN: 35, DAD: 35 },
  arrival_vip: { HAN: 55, SGN: 55, DAD: 55 },
  departure_fast_track: { HAN: 55, SGN: 45, DAD: 45 },
  departure_vip: { HAN: 75, SGN: 65, DAD: 65 },
  car_pickup: { HAN: 25, SGN: 25, DAD: 25 },
};

// Night surcharge (11PM - 6AM)
const NIGHT_SURCHARGE = 8;

// All countries for nationality selector
const ALL_COUNTRIES = [
  { code: "AF", name: "Afghanistan" },
  { code: "AL", name: "Albania" },
  { code: "DZ", name: "Algeria" },
  { code: "AR", name: "Argentina" },
  { code: "AU", name: "Australia" },
  { code: "AT", name: "Austria" },
  { code: "BD", name: "Bangladesh" },
  { code: "BE", name: "Belgium" },
  { code: "BR", name: "Brazil" },
  { code: "CA", name: "Canada" },
  { code: "CL", name: "Chile" },
  { code: "CN", name: "China" },
  { code: "CO", name: "Colombia" },
  { code: "HR", name: "Croatia" },
  { code: "CZ", name: "Czech Republic" },
  { code: "DK", name: "Denmark" },
  { code: "EG", name: "Egypt" },
  { code: "FI", name: "Finland" },
  { code: "FR", name: "France" },
  { code: "DE", name: "Germany" },
  { code: "GR", name: "Greece" },
  { code: "HK", name: "Hong Kong" },
  { code: "HU", name: "Hungary" },
  { code: "IN", name: "India" },
  { code: "ID", name: "Indonesia" },
  { code: "IE", name: "Ireland" },
  { code: "IL", name: "Israel" },
  { code: "IT", name: "Italy" },
  { code: "JP", name: "Japan" },
  { code: "KR", name: "South Korea" },
  { code: "MY", name: "Malaysia" },
  { code: "MX", name: "Mexico" },
  { code: "NL", name: "Netherlands" },
  { code: "NZ", name: "New Zealand" },
  { code: "NO", name: "Norway" },
  { code: "PK", name: "Pakistan" },
  { code: "PH", name: "Philippines" },
  { code: "PL", name: "Poland" },
  { code: "PT", name: "Portugal" },
  { code: "RO", name: "Romania" },
  { code: "RU", name: "Russia" },
  { code: "SA", name: "Saudi Arabia" },
  { code: "SG", name: "Singapore" },
  { code: "ZA", name: "South Africa" },
  { code: "ES", name: "Spain" },
  { code: "SE", name: "Sweden" },
  { code: "CH", name: "Switzerland" },
  { code: "TW", name: "Taiwan" },
  { code: "TH", name: "Thailand" },
  { code: "TR", name: "Turkey" },
  { code: "UA", name: "Ukraine" },
  { code: "AE", name: "United Arab Emirates" },
  { code: "GB", name: "United Kingdom" },
  { code: "US", name: "United States" },
  { code: "VN", name: "Vietnam" },
].sort((a, b) => a.name.localeCompare(b.name));

interface FastTrackBookingFormProps {
  onSuccess?: () => void;
}

export function FastTrackBookingForm({ onSuccess }: FastTrackBookingFormProps) {
  // Form state
  const [serviceType, setServiceType] = useState<ServiceType>("arrival_fast_track");
  const [airport, setAirport] = useState("");
  const [flightNumber, setFlightNumber] = useState("");
  const [flightDate, setFlightDate] = useState("");
  const [passengerCount, setPassengerCount] = useState(1);
  const [includePorter, setIncludePorter] = useState(false);
  const [isNightFlight, setIsNightFlight] = useState(false);

  // Personal info
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [nationality, setNationality] = useState("");

  // Car pickup specific
  const [pickupAddress, setPickupAddress] = useState("");

  // Special requests
  const [specialRequests, setSpecialRequests] = useState("");

  // Form state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  // Flight info from API
  const [flightData, setFlightData] = useState<{
    arrivalAirport: string;
    arrivalAirportCode: string;
    departureAirport: string;
    departureAirportCode: string;
    arrivalDate: string;
    flightNumber: string;
  } | null>(null);

  // Check if date is selected
  const isDateSelected = flightDate && flightDate.length > 0;

  // Auto-detect night flight based on flight data
  useEffect(() => {
    if (flightData?.arrivalDate) {
      const arrivalTime = new Date(flightData.arrivalDate);
      const hours = arrivalTime.getHours();
      // Night hours: 11PM (23:00) to 6AM
      setIsNightFlight(hours >= 23 || hours < 6);
    }
  }, [flightData]);

  // Auto-set airport from flight data
  useEffect(() => {
    if (flightData?.arrivalAirportCode) {
      const vietnamAirports = ["HAN", "SGN", "DAD", "CXR", "PQC", "HPH", "VDO"];
      if (vietnamAirports.includes(flightData.arrivalAirportCode)) {
        // Map to our supported airports
        if (flightData.arrivalAirportCode === "HAN") setAirport("HAN");
        else if (flightData.arrivalAirportCode === "SGN") setAirport("SGN");
        else if (flightData.arrivalAirportCode === "DAD") setAirport("DAD");
        else setAirport("SGN"); // Default to SGN for other airports
      }
    }
  }, [flightData]);

  // Handle flight data callback
  const handleFlightData = useCallback((data: typeof flightData) => {
    setFlightData(data);
  }, []);

  // Calculate total price
  const calculatePrice = () => {
    if (!airport) return 0;
    let price = SERVICE_PRICES[serviceType]?.[airport] || 0;

    // Porter service adds $10 per person
    if (includePorter) {
      price += 10 * passengerCount;
    }

    // Night surcharge
    if (isNightFlight) {
      price += NIGHT_SURCHARGE;
    }

    // Multiply by passenger count for main service
    return price * passengerCount;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/airport-services/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceType,
          airport,
          flightNumber,
          flightDate,
          passengerCount,
          includePorter,
          isNightFlight,
          fullName,
          email,
          phone,
          nationality,
          pickupAddress: serviceType === "car_pickup" ? pickupAddress : null,
          specialRequests,
          totalPrice: calculatePrice(),
          flightData,
        }),
      });

      if (response.ok) {
        setIsSuccess(true);
        onSuccess?.();
      } else {
        const data = await response.json();
        setError(data.error || "Something went wrong. Please try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Service type labels
  const serviceLabels: Record<ServiceType, { title: string; description: string }> = {
    arrival_fast_track: {
      title: "Arrival Fast Track",
      description: "Skip immigration lines, meet at gate with name board",
    },
    arrival_vip: {
      title: "Arrival VIP Service",
      description: "Fast Track + luggage assistance + escort to exit",
    },
    departure_fast_track: {
      title: "Departure Fast Track",
      description: "Check-in assistance + security fast lane",
    },
    departure_vip: {
      title: "Departure VIP Service",
      description: "Full departure assistance + lounge escort",
    },
    car_pickup: {
      title: "Airport Car Pickup",
      description: "Private car waiting at arrivals hall",
    },
  };

  if (isSuccess) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Booking Submitted!</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          We&apos;ve received your booking request. Our team will contact you within 2 hours to confirm your service.
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-500">
          Confirmation will be sent to: <strong>{email}</strong>
        </p>
        <button
          onClick={() => {
            setIsSuccess(false);
            setFlightNumber("");
            setFlightDate("");
            setFlightData(null);
          }}
          className="mt-6 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors"
        >
          Book Another Service
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-2xl p-6 md:p-8 shadow-lg">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
        Book Airport Fast Track Service
      </h2>

      {/* Service Type Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Select Service Type <span className="text-red-500">*</span>
        </label>
        <div className="grid gap-3">
          {(Object.keys(serviceLabels) as ServiceType[]).map((type) => (
            <label
              key={type}
              className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                serviceType === type
                  ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20"
                  : "border-gray-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-700"
              }`}
            >
              <input
                type="radio"
                name="serviceType"
                value={type}
                checked={serviceType === type}
                onChange={(e) => setServiceType(e.target.value as ServiceType)}
                className="mt-1 w-4 h-4 text-emerald-600"
              />
              <div className="flex-1">
                <span className="font-semibold text-gray-900 dark:text-white">
                  {serviceLabels[type].title}
                </span>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  {serviceLabels[type].description}
                </p>
              </div>
              {airport && (
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                  ${SERVICE_PRICES[type]?.[airport] || 0}
                </span>
              )}
            </label>
          ))}
        </div>
      </div>

      {/* Airport Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Airport <span className="text-red-500">*</span>
        </label>
        <select
          value={airport}
          onChange={(e) => setAirport(e.target.value)}
          required
          className="w-full px-4 py-3 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        >
          <option value="">Select airport...</option>
          {AIRPORTS.map((apt) => (
            <option key={apt.code} value={apt.code}>
              {apt.name}
            </option>
          ))}
        </select>
      </div>

      {/* Flight Information */}
      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <span className="text-xl">✈️</span> Flight Information
        </h3>

        <div className="flex gap-3 mb-4">
          {/* Date input - required first */}
          <div className="relative">
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              Flight Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={flightDate}
              onChange={(e) => setFlightDate(e.target.value)}
              onClick={handleDateInputClick}
              min={new Date().toISOString().split("T")[0]}
              required
              className={`w-36 sm:w-44 px-3 py-3 rounded-lg border text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer ${
                !isDateSelected
                  ? "bg-yellow-50 dark:bg-yellow-900/30 border-yellow-400 dark:border-yellow-500 ring-2 ring-yellow-300 dark:ring-yellow-600"
                  : "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
              }`}
            />
            {!isDateSelected && (
              <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold">
                !
              </div>
            )}
          </div>

          {/* Flight number */}
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              Flight Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={flightNumber}
              onChange={(e) => setFlightNumber(e.target.value.toUpperCase())}
              placeholder={isDateSelected ? "e.g. VN123" : "Select date first"}
              disabled={!isDateSelected}
              required
              className={`w-full px-4 py-3 rounded-lg border text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                !isDateSelected
                  ? "bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 cursor-not-allowed opacity-60"
                  : "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
              }`}
            />
          </div>
        </div>

        {!isDateSelected && (
          <p className="text-xs text-yellow-600 dark:text-yellow-400 font-medium mb-3">
            Please select your flight date first
          </p>
        )}

        {/* Flight Info Display */}
        {flightNumber && flightNumber.length >= 3 && isDateSelected && (
          <FlightInfo
            flightNumber={flightNumber}
            date={flightDate}
            onFlightData={handleFlightData}
          />
        )}
      </div>

      {/* Number of Passengers */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Number of Passengers <span className="text-red-500">*</span>
        </label>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setPassengerCount(Math.max(1, passengerCount - 1))}
            className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            -
          </button>
          <span className="text-2xl font-bold text-gray-900 dark:text-white w-12 text-center">
            {passengerCount}
          </span>
          <button
            type="button"
            onClick={() => setPassengerCount(Math.min(10, passengerCount + 1))}
            className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            +
          </button>
        </div>
      </div>

      {/* Additional Options */}
      <div className="mb-6 space-y-3">
        {/* Porter Service */}
        {(serviceType.includes("arrival") || serviceType.includes("departure")) && (
          <label className="flex items-center gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 cursor-pointer">
            <input
              type="checkbox"
              checked={includePorter}
              onChange={(e) => setIncludePorter(e.target.checked)}
              className="w-5 h-5 rounded text-amber-600"
            />
            <div className="flex-1">
              <span className="font-medium text-amber-800 dark:text-amber-300">
                Add Baggage Porter Service
              </span>
              <p className="text-xs text-amber-600 dark:text-amber-400">
                +$10 per passenger
              </p>
            </div>
          </label>
        )}

        {/* Night Flight */}
        <label className="flex items-center gap-3 p-3 rounded-lg bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 cursor-pointer">
          <input
            type="checkbox"
            checked={isNightFlight}
            onChange={(e) => setIsNightFlight(e.target.checked)}
            className="w-5 h-5 rounded text-gray-600"
          />
          <div className="flex-1">
            <span className="font-medium text-gray-800 dark:text-gray-300">
              Night Service (11PM - 6AM)
            </span>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              +${NIGHT_SURCHARGE} surcharge
            </p>
          </div>
        </label>
      </div>

      {/* Car Pickup Address */}
      {serviceType === "car_pickup" && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Destination Address <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={pickupAddress}
            onChange={(e) => setPickupAddress(e.target.value)}
            placeholder="Hotel name or address in Vietnam"
            required
            className="w-full px-4 py-3 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>
      )}

      {/* Personal Information */}
      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
          Contact Information
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Full Name (as on passport) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="John Smith"
              required
              className="w-full px-4 py-3 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full px-4 py-3 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Phone (WhatsApp) <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 234 567 8900"
                required
                className="w-full px-4 py-3 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nationality <span className="text-red-500">*</span>
            </label>
            <select
              value={nationality}
              onChange={(e) => setNationality(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="">Select nationality...</option>
              {ALL_COUNTRIES.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Special Requests */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Special Requests (optional)
        </label>
        <textarea
          value={specialRequests}
          onChange={(e) => setSpecialRequests(e.target.value)}
          placeholder="Any special requirements or notes..."
          rows={3}
          className="w-full px-4 py-3 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none"
        />
      </div>

      {/* Price Summary */}
      {airport && (
        <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-700 dark:text-gray-300">
              {serviceLabels[serviceType].title} x {passengerCount}
            </span>
            <span className="font-medium text-gray-900 dark:text-white">
              ${(SERVICE_PRICES[serviceType]?.[airport] || 0) * passengerCount}
            </span>
          </div>
          {includePorter && (
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-700 dark:text-gray-300">
                Porter Service x {passengerCount}
              </span>
              <span className="font-medium text-gray-900 dark:text-white">
                ${10 * passengerCount}
              </span>
            </div>
          )}
          {isNightFlight && (
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-700 dark:text-gray-300">
                Night Surcharge
              </span>
              <span className="font-medium text-gray-900 dark:text-white">
                ${NIGHT_SURCHARGE}
              </span>
            </div>
          )}
          <div className="border-t border-emerald-300 dark:border-emerald-700 pt-2 mt-2">
            <div className="flex justify-between items-center">
              <span className="font-bold text-gray-900 dark:text-white">Total</span>
              <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                ${calculatePrice()} USD
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting || !airport || !flightNumber || !flightDate || !fullName || !email || !phone || !nationality}
        className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors text-lg shadow-lg"
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Processing...
          </span>
        ) : (
          `Book Now - $${calculatePrice()} USD`
        )}
      </button>

      {/* Trust Badges */}
      <div className="mt-6 flex items-center justify-center gap-4 text-sm text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-1">
          <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          Secure Booking
        </div>
        <div className="flex items-center gap-1">
          <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          24/7 Support
        </div>
      </div>
    </form>
  );
}
