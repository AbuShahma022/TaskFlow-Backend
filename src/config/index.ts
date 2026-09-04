import dotenv from "dotenv";
import path from "path";

dotenv.config({
    path: path.join(process.cwd(), ".env"),
});

const config = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT) || 5000,
  appUrl: process.env.APP_URL,

  databaseUrl: process.env.DATABASE_URL,

  bcryptSaltRounds: Number(process.env.BCRYPT_SALT_ROUNDS) || 10,
   jwt: {
    accessTokenSecret: process.env.JWT_ACCESS_SECRET!,
    accessTokenExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN!,

    refreshTokenSecret: process.env.JWT_REFRESH_SECRET!,
    refreshTokenExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN!,
  },
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY!,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
  },
} as const;

export default config;