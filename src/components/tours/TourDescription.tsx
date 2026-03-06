"use client";

import type { Tour } from "@/types/tours";
import { useLanguage } from "@/contexts/LanguageContext";

// Tour translation type
interface TourTranslation {
  name?: string;
  description?: string;
  location?: string;
  duration?: string;
  highlights?: string[];
  included?: string[];
  excluded?: string[];
  fullDescription?: string;
  itinerary?: Array<{
    title?: string;
    description?: string;
    activities?: string[];
    meals?: string[];
  }>;
}

interface TourDescriptionProps {
  tour: Tour;
}

export function TourDescription({ tour }: TourDescriptionProps) {
  const { t } = useLanguage();

  // Get translated tour content if available
  const toursTranslations = (t as Record<string, unknown>).tours as Record<string, TourTranslation> | undefined;
  const tourTranslation = toursTranslations?.[tour.id];

  // Use translations with fallback to original
  const displayFullDescription = tourTranslation?.fullDescription || tour.fullDescription;

  return (
    <section className="bg-white rounded-xl shadow-sm p-6 sm:p-8">
      <div
        className="prose prose-lg max-w-none
          prose-headings:text-gray-900 prose-headings:font-bold prose-headings:mt-6 prose-headings:mb-3
          prose-h3:text-xl prose-h3:border-b prose-h3:border-gray-200 prose-h3:pb-2
          prose-p:text-gray-700 prose-p:leading-relaxed prose-p:text-base
          prose-ul:my-4 prose-ul:space-y-2
          prose-li:text-gray-700 prose-li:leading-relaxed
          prose-strong:text-gray-900
          [&>h3:first-child]:mt-0"
        dangerouslySetInnerHTML={{ __html: displayFullDescription }}
      />
    </section>
  );
}
