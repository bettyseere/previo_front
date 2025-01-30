// measurement attributes
export type name_and_description = {
    name: string
    language_code: string
    description: string
    units?: string
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

type units = {
    it?: string
    en?: string
    es?: string
    fr?: string
    de?: string
}

export type CreateMeasurementAttribute = {
    names_and_descriptions: [name_and_description]
}

export type MeasurementAttribute = {
    id: string
    name: name
    description: description
    units: units
    created_at: Date
    updated_at: Date
}


// measurements
export type CreateMeasurement = {
    sub_activity: string
    athlete: string
    device: string
    value: string
}

export type UpdateMeasurement = {
    sub_activity?: string
    athlete?: string
    device?: string
    value?: string
}

export type Measurement = {
    id: string
    sub_activity: string
    athlete: string
    device: string
    created_at: Date
    updated_at: Date
    results: [Result]
}

// measurement results
export type CreateResult = {
    measurement_id: string
    attribute_id: string
    value: string
}

export type UpdateResult = {
    measurement_id?: string
    attribute_id?: string
    value?: string
}

export type Result = {
    id: string
    measurement_id: string
    attribute_id: string
    value: string
    created_at: Date
    updated_at: Date
}