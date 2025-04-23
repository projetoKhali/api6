export interface User {
    id: number;
    name: string;
    login: string;
    email: string;
    version_terms_agreement: string;
    permission_id: number;
    disabled_since?: string;
}

export interface NewUser extends User {
    password: string;
}