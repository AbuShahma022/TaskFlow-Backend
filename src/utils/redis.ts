import { redisClient } from "../lib/redis";

const setValue = async (
  key: string,
  value: string,
  expirationInSeconds: number,
) => {
  await redisClient.set(key, value, {
    EX: expirationInSeconds,
  });
};

const getValue = async (key: string) => {
  return await redisClient.get(key);
};

const deleteValue = async (key: string) => {
  await redisClient.del(key);
};

export const redisUtils = {
  setValue,
  getValue,
  deleteValue,
};