import { Experience, ExperienceAvailability } from './types';

export interface ValidationError {
  field: string;
  message: string;
  pass: boolean;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

export function validateExperienceForPublishing(
  experience: Experience,
  availability: ExperienceAvailability[] = [], // Pass availability separately if not in experience object yet
): ValidationResult {
  const errors: ValidationError[] = [];

  // 1. Basic Information
  errors.push({
    field: 'Title',
    message: 'Title is required',
    pass: !!experience.title && experience.title.length > 5,
  });

  errors.push({
    field: 'Description',
    message: 'Description is required',
    pass: !!experience.description && experience.description.length > 20,
  });

  // 2. Pricing & Duration
  errors.push({
    field: 'Price',
    message: 'Price must be greater than 0',
    pass: experience.price.amount > 0,
  });

  errors.push({
    field: 'Duration',
    message: 'Duration must be set',
    pass: (experience.durationHours || 0) > 0,
  });

  // 3. Group Size
  errors.push({
    field: 'Group Size',
    message: 'Group size limits must be valid',
    pass:
      experience.groupSize.min > 0 &&
      experience.groupSize.max >= experience.groupSize.min,
  });

  // 4. Images
  errors.push({
    field: 'Images',
    message: 'At least 3 images are required',
    pass: experience.images.length >= 3,
  });

  // 5. Location
  errors.push({
    field: 'Location',
    message: 'Meeting point address is required',
    pass: !!experience.meetingPoint?.address,
  });

  // 6. Availability (We might need to fetch this or pass it in)
  // For now, if availability is passed, we check it. If not passed, we might assume check is done elsewhere or fail it.
  // In a real app we'd query the DB. Here we rely on what's passed.
  errors.push({
    field: 'Availability',
    message: 'At least one specific date or availability rule is required',
    pass: availability.length > 0,
  });

  const valid = errors.every((e) => e.pass);

  return { valid, errors };
}
