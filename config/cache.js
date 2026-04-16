import redis from "./redisClient.js";

export async function cacheGet(key) {
  const v = await redis.get(key);
  return v ?? null;
}

export async function cacheSet(key, value, ttl = 300) {
  try {
    console.log(key, value)
    await redis.set(key, value, "EX", ttl);
    console.log(`OTP saved in Redis for key: ${key}, value: ${value}`);
  } catch (err) {
    console.error("cacheSet error:", err);
  }
}
