process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key-pour-les-tests-unitaires-unchk';
process.env.JWT_EXPIRES_IN = '15m';
process.env.REFRESH_TOKEN_EXPIRES_IN = '7d';
process.env.PORT = '3002';
process.env.REDIS_URL = '';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://test_user:test_password@localhost:5432/unchk_test';
