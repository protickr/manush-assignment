export default () => ({
  redis: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT || '6379'),
    ttl: parseInt(process.env.CACHE_TTL || '3600'),
  },
});
