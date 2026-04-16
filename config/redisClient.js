import Redis from "ioredis";

const redis = new Redis({
  host: process.env.REDIS_HOST || "redis",
  port: process.env.REDIS_PORT ? Number(process.env.REDIS_PORT) : 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  // optional: set lazyConnect: true
});

redis.on("error", (err) => {
  console.error("Redis error:", err);
});
redis.on("connect", () => {
  console.log("Connected to Redis");
});

export default redis;
