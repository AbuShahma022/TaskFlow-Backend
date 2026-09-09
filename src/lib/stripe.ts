import Stripe from "stripe";
import config from "../config";

export const stripe : Stripe= new Stripe(config.stripe.secretKey);