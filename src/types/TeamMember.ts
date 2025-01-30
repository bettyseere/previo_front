export type CreateTeamMember = {
    user_id: string
    team_id: string
    role_id: string
    access_type: string
}


export type CreateTeamMembers = {
    team_members: CreateTeamMember
}


export type UpdateTeamMember = {
    role_id: string
}


type Role = {
    id: string,
    name: string,
    description: string
    created_at: Date
    updated_at: Date
    }


export type TeamMember = {
    role: Role
    team_id: string
    user_id: string
    created_at: string
    access_type: string
    updated_at: string
}
