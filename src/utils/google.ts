import { OAuth2Client } from "google-auth-library";
import config from "../config";

const googleClient = new OAuth2Client(config.google.clientId);

const verifyGoogleToken = async (idToken: string) => {
  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: config.google.clientId,
  });

  const payload = ticket.getPayload();

  if (!payload) {
    throw new Error("Invalid Google ID token");
  }

  return payload;
};

export const googleUtils = {
  verifyGoogleToken,
};