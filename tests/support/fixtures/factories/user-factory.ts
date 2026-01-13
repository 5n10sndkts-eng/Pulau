/**
 * UserFactory
 *
 * Pattern for generating and cleaning up test users.
 * In this project, we use mock data, so this factory simulates
 * the creation process.
 */
export class UserFactory {
  private createdUsers: any[] = [];

  async createUser(overrides = {}) {
    // In a real project, this would be an API call:
    // const response = await fetch(`${process.env.API_URL}/users`, { ... });

    // For now, we simulate a created user
    const user = {
      id: crypto.randomUUID(),
      email: `test-${Date.now()}@example.com`,
      name: 'Test Traveler',
      password: 'password123',
      ...overrides,
    };

    console.log(`[UserFactory] Simulated user creation: ${user.email}`);
    this.createdUsers.push(user);
    return user;
  }

  async cleanup() {
    // Delete all created users via API
    for (const user of this.createdUsers) {
      console.log(`[UserFactory] Simulated user cleanup: ${user.email}`);
    }
    this.createdUsers = [];
  }
}
