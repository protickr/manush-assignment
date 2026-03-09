export default () => ({
  app: {
    host: process.env.HOST || 'localhost',
    port: parseInt(process.env.PORT || '3000', 10),
  },
});
