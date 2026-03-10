export default () => ({
  jwt: {
    secret: process.env.JWT_SECRET || 'defaultSecret',
    expiresIn: parseInt(process.env.JWT_EXPIRES_IN || '3600', 10),
  },
});
