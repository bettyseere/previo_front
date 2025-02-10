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

export type CreateDeviceActivity = {
    device_type_id: string
    activity_id: string
}

export type UpdateDeviceActivity = {
    device_type_id?: string
    activity_id?: string
}

export type DeviceActivity = {
    device_type_id: string
    activity_id: string
    created_at: Date
    updated_at: Date
}
