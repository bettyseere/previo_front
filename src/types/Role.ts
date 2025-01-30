export type CreateRole = {
    name: string,
    description: string
}


export type UpdateRole = {
    name?: string,
    description?: string
}

export type Role = {
    id: string,
    name: string,
    description: string,
    created_at: Date,
    updated_at: Date
}

