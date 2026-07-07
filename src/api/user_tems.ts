export type Team = {
    id: string;
    name: string;
};

export type TeamRole = {
    id: string;
    name: string;
    description: string;
};

export type TeamMember = {
    team: Team;
    role: TeamRole | null;
    access_type: string | string;
};