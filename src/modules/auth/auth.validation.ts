import { z } from "zod";

const registerSchema = z.object({
  body: z.object({
    name: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters long")
      .max(100, "Name must not exceed 100 characters"),

    email: z
      .string()
      .trim()
      .email("Invalid email address")
      .toLowerCase(),

    password: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .max(100, "Password must not exceed 100 characters"),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z
      .string()
      .trim()
      .email("Invalid email address")
      .toLowerCase(),

    password: z
      .string()
      .min(1, "Password is required"),
  }),
});

const verifyEmailSchema = z.object({
  body: z.object({
    otp: z
      .string()
      .regex(/^\d{6}$/, "OTP must be exactly 6 digits"),
  }),
});

const forgotPasswordSchema = z.object({
  body: z.object({
    email: z
      .string()
      .trim()
      .email("Invalid email address")
      .toLowerCase(),
  }),
});

const verifyResetOTPSchema = z.object({
  body: z.object({
    email: z.string().trim().email("Invalid email address").toLowerCase(),
    otp: z.string().regex(/^\d{6}$/, "OTP must be exactly 6 digits"),
  }),
});

const resetPasswordSchema = z.object({
  body: z.object({
    email: z.string().trim().email("Invalid email address").toLowerCase(),
    otp: z.string().regex(/^\d{6}$/, "OTP must be exactly 6 digits"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .max(100, "Password must not exceed 100 characters"),
  }),
});

const googleLoginSchema = z.object({
  body: z.object({
    idToken: z.string().min(1, "Google ID token is required"),
  }),
});

export const authValidation = {
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  forgotPasswordSchema,
  verifyResetOTPSchema,
  resetPasswordSchema,
  googleLoginSchema,
};