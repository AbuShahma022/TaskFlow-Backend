export interface IGetSubscription {
  organizationId: string;
}

export interface IUpdateSubscriptionPlan {
  plan: "FREE" | "PRO";
}