export type CompanyUserInvite = {
    notes?: string,
    email: string,
    company_id: string,
    user_type: string,
    team?: string
    role?: string
}

export type SuperUserInvite = {
    notes?: string,
    email: string
}
