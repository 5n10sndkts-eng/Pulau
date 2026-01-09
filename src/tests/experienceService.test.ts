import { experienceService } from '../lib/experienceService'
import { describe, it, expect } from 'vitest'

describe('experienceService', () => {
  it('should be defined', () => {
    expect(experienceService).toBeDefined()
  })

  it('should have required methods', () => {
    expect(experienceService.getExperiences).toBeDefined()
    expect(experienceService.getExperienceById).toBeDefined()
    expect(experienceService.getExperiencesByCategory).toBeDefined()
    expect(experienceService.searchExperiences).toBeDefined()
    expect(experienceService.getExperiencesByDestination).toBeDefined()
  })
})
