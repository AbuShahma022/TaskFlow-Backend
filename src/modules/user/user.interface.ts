export interface IUpdateProfile {
  name?: string;
}

export interface IChangePassword {
  currentPassword: string;
  newPassword: string;
}