import { PopupType } from "./Common";

export type Device = {
    id?: string
    company?: string
    owner?: string
    mac_address: string
    serial_number: string
    crated_at?: Date
    updated_at?: Date
    popup: PopupType
}

export type UpdateDevice = {
    popup: PopupType
}