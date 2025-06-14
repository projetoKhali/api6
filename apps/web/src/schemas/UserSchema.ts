export interface User {
  id?: number;
  name: string;
  login: string;
  email: string;
  versionTerms: string;
  roleId: number;
  disabledSince?: string;
}

export interface NewUser extends User {
  password: string;
}
