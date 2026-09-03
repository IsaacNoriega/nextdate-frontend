import { Profile, UpdateProfileInput } from '../services/profileService';

describe('Profile Service Types & Avatar Handling', () => {
  it('should support avatarUrl in Profile model', () => {
    const mockProfile: Profile = {
      id: 'prof-123',
      userId: 'user-456',
      username: 'isaac_noriega',
      birthdate: '1998-10-20',
      gender: 'MALE',
      bio: 'Foodie & Explorer',
      avatarUrl: 'data:image/jpeg;base64,/9j/4AAQSkZJRg...',
      latitude: 20.6736,
      longitude: -103.3698,
      active: true,
      dietaryPreference: 'NONE',
      preferredPriceRange: 'MODERATE',
      interests: ['FOOD_DRINK', 'CULTURE'],
    };

    expect(mockProfile.avatarUrl).toBeDefined();
    expect(mockProfile.avatarUrl).toContain('data:image/jpeg;base64');
  });

  it('should create valid update profile payload with avatarUrl', () => {
    const updatePayload: UpdateProfileInput = {
      id: 'prof-123',
      userId: 'user-456',
      username: 'isaac_updated',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
    };

    expect(updatePayload.avatarUrl).toBe('https://images.unsplash.com/photo-1534528741775-53994a69daeb');
  });
});
