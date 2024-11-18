export type User = {
    id: string
    first_name: string
    last_name?: string
    email?: string
    user_type?: string
}

export type Tokens = {
    access_token: string
    refresh_token: string
}

export type Login = {
    email: string
    password: string
}

export type ResetPasswordRequest = {
    email: string
}

export type ResetPassword = {
    confirm_password: string
    password: string
}