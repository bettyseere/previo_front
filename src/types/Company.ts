import { PopupType } from "./Common";

export type Company = {
    id?: string
    name: string
    country: string
    city: string
    address: string
    piva: string
    cap: string
    crated_at?: Date
    updated_at?: Date
    popup: PopupType
}

export type UpdateCompany = {
    popup: PopupType
}