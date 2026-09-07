export interface ICreateOrganizationInvitation {
  email: string;
}

export interface IRespondToOrganizationInvitation {
  status: "ACCEPTED" | "REJECTED";
}