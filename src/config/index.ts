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
  redis_user: process.env.REDIS_USER!,
  redis_password: process.env.REDIS_PASSWORD!,
  redis_host: process.env.REDIS_HOST!,
  redis_port: Number(process.env.REDIS_PORT)!,
  smtp_user: process.env.SMTP_USER!,
  smtp_password: process.env.SMTP_PASSWORD!,
  email_sender: process.env.EMAIL_SENDER!,
  cloudinary_cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  cloudinary_api_key: process.env.CLOUDINARY_API_KEY!,
  cloudinary_api_secret: process.env.CLOUDINARY_API_SECRET!,
  
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID!,
  },
  jwt: {
    accessTokenSecret: process.env.JWT_ACCESS_SECRET!,
    accessTokenExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN!,

    refreshTokenSecret: process.env.JWT_REFRESH_SECRET!,
    refreshTokenExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN!,
  },
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY!,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
    proPriceId: process.env.STRIPE_PRO_PRICE_ID!,
  },

} as const;

export default config;
