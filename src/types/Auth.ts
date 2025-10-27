export type User = {
    id: string
    first_name: string
    last_name?: string
    email?: string
    user_type?: string
    company?: string
    address?: string
    country?: string
    height?: string
    weight?: string
    gender?: string
    birth_date?: string
    admin_view?: boolean
    admin_check?: boolean
    city?: string
    teams?: [any]
    devices?: [any]
    has_permission: boolean
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
    // redirect_url: string
}

export type UpdateUserInfo = {
    first_name?: string,
    last_name?: string,
    address?: string,
    country?: string,
    height?: string
    weight?: string
    gender?: string
    birth_date?: string
    city?: string
}


export type ResetPassword = {
    confirm_password: string
    password: string
}

export type CreateUserAccount = {
    first_name: string
    last_name: string
    height?: string
    weight?: string
    gender?: string
    password: string
}


export type ChangePassword = {
    old_password: string
    new_password: string
}