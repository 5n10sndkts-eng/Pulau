import {
  Experience,
  ExperienceRecord,
  ExperienceImageRecord,
  ExperienceCategory,
  ExperienceStatus,
  Difficulty,
  PricePer,
  Provider,
} from './types';
import { experiences as mockExperiences, destinations } from './mockData';

// Helper to convert Legacy/UI Experience to DB Record
export function toExperienceRecord(exp: Experience): ExperienceRecord {
  return {
    id: exp.id,
    vendorId: exp.provider.id, // Assuming provider is the vendor
    title: exp.title,
    category: exp.category as ExperienceCategory,
    subcategory: exp.subcategory,
    destinationId:
      typeof exp.destination === 'string'
        ? exp.destination
        : (exp.destination as any).id,
    description: exp.description,
    priceAmount: exp.price.amount,
    priceCurrency: exp.price.currency,
    pricePer: exp.price.per as PricePer,
    durationHours: exp.durationHours || parseFloat(exp.duration) || 0,
    startTime: exp.startTime,
    groupSizeMin: exp.groupSize.min,
    groupSizeMax: exp.groupSize.max,
    difficulty: exp.difficulty as Difficulty,
    languages: exp.languages,
    status: (exp.status as ExperienceStatus) || ExperienceStatus.Active,
    meetingPointName: exp.meetingPoint?.name,
    meetingPointAddress: exp.meetingPoint?.address,
    meetingPointLat: exp.meetingPoint?.lat,
    meetingPointLng: exp.meetingPoint?.lng,
    meetingPointInstructions: exp.meetingPoint?.instructions,
    cancellationPolicy: exp.cancellation,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// Helper: Get Experiences by Vendor
export function getExperiencesByVendor(vendorId: string): Experience[] {
  return mockExperiences.filter((exp) => exp.provider.id === vendorId);
}

// Helper: Get Experiences by Category
export function getExperiencesByCategory(
  category: ExperienceCategory,
): Experience[] {
  return mockExperiences.filter((exp) => exp.category === category);
}

// Helper: Get Active Experiences
export function getActiveExperiences(): Experience[] {
  // In mock data, assume all are active unless otherwise specified
  return mockExperiences.filter(
    (exp) => !exp.status || exp.status === ExperienceStatus.Active,
  );
}
