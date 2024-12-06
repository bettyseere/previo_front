import { PopupType } from "./Common";

export type DeviceType = {
    id?: string
    name: string
    crated_at?: Date
    updated_at?: Date
    popup: PopupType
}

export type UpdateDevice = {
    popup: PopupType
}
