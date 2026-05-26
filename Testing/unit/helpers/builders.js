function userBuilder(overrides = {}) {
  return {
    id: 1,
    username: 'tester',
    email: 'tester@example.com',
    password: '$2b$10$hash',
    role: 'user',
    status: 'active',
    banned_reason: null,
    ...overrides,
  };
}

module.exports = { userBuilder };
