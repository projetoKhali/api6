export interface User {
  id?: number;
  name: string;
  login: string;
  email: string;
  version_terms: string;
  permission_id: number;
  disabled_since?: string;
}

export type NewUser = Omit<User, 'id'> & {
  password: string;
};
