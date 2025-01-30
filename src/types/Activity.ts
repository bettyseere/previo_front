import { MeasurementAttribute } from "./Measurements"

export type name_and_description = {
    name: string
    language_code: string
    description: string
}

type name = {
    it?: string
    en?: string
    es?: string
    fr?: string
    de?: string
}

type description = {
    it?: string
    en?: string
    es?: string
    fr?: string
    de?: string
}

export type CreateActivity = {
    names_and_descriptions: [name_and_description]
}

export type Activity = {
    id: string
    name: name
    description: description
    sub_activities: [SubActivity]
    created_at: Date
    updated_at: Date
}


// sub activities

export type CreateSubActivity = {
    activity_id: string
    names_and_descriptions: [name_and_description]
}

export type SubActivity = {
    id: string
    activity_id?: string
    name: name
    description: description
}

// sub activity attributes
export type CreateActivityAttribute = {
    sub_activity_id?: string
    attribute_id?: [string]
}

export type ActivityAttribute = {
    sub_activity: SubActivity
    attribute: MeasurementAttribute
}