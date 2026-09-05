export interface IRegisterUser {
  name: string;
  email: string;
  password: string;
}

export interface ILoginUser {
  email: string;
  password: string;
}

export interface IGoogleUser {
  googleId: string;
  email: string;
  name: string;
  avatar?: string;
}