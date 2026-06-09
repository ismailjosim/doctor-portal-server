const getJwtSecret = () => {
  if (process.env.JWT_TOKEN_SECRET) {
    return process.env.JWT_TOKEN_SECRET;
  }

  if (process.env.NODE_ENV !== 'production') {
    console.warn('JWT_TOKEN_SECRET is missing. Using local development JWT secret.'.yellow);
    return 'doctors-portal-local-jwt-secret';
  }

  throw new Error('JWT_TOKEN_SECRET is required in production.');
};

module.exports = {
  getJwtSecret,
};
