
  const normalize = (str) => str.trim().toLowerCase();

export const computeRSI = (group) => {
    if (group.length < 2) return;

    // f5daa493-5054-4ad2-97b0-d9db95e7cdd6 contact time id
    // d4ebb79e-a0a8-4550-8bc4-e4336b8490a3 flight time id
    let sliced = group;
    if (group.length > 2) {
        sliced = group.slice(1, -1);
        
        // Copy attributes from group[0] to sliced[0] (except measurement-specific properties)
        const firstItem = group[0];
        const firstSlicedItem = sliced[0];
        
        // Preserve all non-measurement attributes from the first group item
        Object.keys(firstItem).forEach(key => {
            // Skip measurement-specific properties that should not be copied
            if (!['measurement', 'measurement_id', 'results', 'rsi', 'ft', 'power', 'pat', 'vfin', 'a_const'].includes(key)) {
                firstSlicedItem[key] = firstItem[key];
            }
        });
        
        // Mark first and last items for removal
        group[0]._shouldRemove = true;
        group[group.length - 1]._shouldRemove = true;
    }

    for (let i = 0; i < sliced.length - 1; i++) {
        const a = sliced[i];
        const b = sliced[i + 1];

        // Skip if either row is already marked as skipped
        if (a._shouldRemove || b._shouldRemove) continue;

        if (normalize(a.measurement_id) === "d4ebb79e-a0a8-4550-8bc4-e4336b8490a3" && normalize(b.measurement_id) === "f5daa493-5054-4ad2-97b0-d9db95e7cdd6") {
            b.rsi = a.results / b.results;
            b.ft = a.results; // Store the flight time value
            // console.log(b.ft, a.results, b.results, "trio1")
            a._shouldRemove = true;
        }

        if (normalize(a.measurement_id) === "f5daa493-5054-4ad2-97b0-d9db95e7cdd6" && normalize(b.measurement_id) === "d4ebb79e-a0a8-4550-8bc4-e4336b8490a3") {
            a.rsi = b.results / a.results;
            a.ft = b.results; // Store the flight time value
            b._shouldRemove = true;
            // console.log(a.ft, b.results, a.results, "trio2")
        }

        if (normalize(a.measurement_id) === "f5daa493-5054-4ad2-97b0-d9db95e7cdd6" && normalize(b.measurement_id) === "73e0ac8f-b5e8-44f3-9557-2db5bb98c8ce") {
            a.fd = b.results; // Store the flight time value
            b._shouldRemove = true;
        }

        if (normalize(b.measurement_id) === "f5daa493-5054-4ad2-97b0-d9db95e7cdd6" && normalize(a.measurement_id) === "73e0ac8f-b5e8-44f3-9557-2db5bb98c8ce") {
            b.fd = a.results; // Store the flight time value
            a._shouldRemove = true;
        }
    }
};


export  const computePower = (group) => {
    if (group.length < 2) return;

    // slice middle rows if group is large
    let sliced = group.length > 2 ? group.slice(1, -1) : group;

    for (let i = 0; i < sliced.length - 1; i++) {
        const a = sliced[i];
        const b = sliced[i + 1];

        // Skip if either row is already marked as skipped
        // if (a._skipRow || b._skipRow) continue;

        // console.log(a.results, b.results)

        const measA = normalize(a.measurement_id);
        const measB = normalize(b.measurement_id);

        // only calculate when we have both contact time & flight time
        // f5daa493-5054-4ad2-97b0-d9db95e7cdd6 contact time id
        // d4ebb79e-a0a8-4550-8bc4-e4336b8490a3 flight time id
        // tv - flighttime tc - contact time
        if (
        (measA === "f5daa493-5054-4ad2-97b0-d9db95e7cdd6" && measB === "d4ebb79e-a0a8-4550-8bc4-e4336b8490a3") ||
        (measA === "d4ebb79e-a0a8-4550-8bc4-e4336b8490a3" && measB === "f5daa493-5054-4ad2-97b0-d9db95e7cdd6")
        ) {
        let contactTime = measA === "f5daa493-5054-4ad2-97b0-d9db95e7cdd6" ? a.results : b.results;
        let flightTime = measA === "d4ebb79e-a0a8-4550-8bc4-e4336b8490a3" ? a.results : b.results;
        const g = 9.806
        const pc = 1

        // Power formula
        // ((g*g)*Tv*(Tv+Tc))/(4*Tc*Nj)
        // const power = (((g * g) * tv * (tv + tc)) / (4 * tc))/1000;
        const vfin_val = vfin(flightTime/1000, g)
        const a_val = a_const(a.parent_activity_id, contactTime/1000, vfin_val)
        // const power = ((pc*(a_val+g))*1.6)/(vfin_val/2) // fix this line
        // Modified power formula
        const power = (pc * ((a_val + g)*1.6) * vfin_val) / 2;

        // 0.681 flight time, 0,081 contanct time result 216.037

        // assign power to the row representing flight time
        if (measA === "f5daa493-5054-4ad2-97b0-d9db95e7cdd6") {
          a.power = power;
        }
        else {
          b.power = power;
        }

        }
    }
  };


export  const computePat = (group) => {
    if (group.length < 2) return;

    // slice middle rows if group is large
    let sliced = group.length > 2 ? group.slice(1, -1) : group;

    for (let i = 0; i < sliced.length - 1; i++) {
        const a = sliced[i];
        const b = sliced[i + 1];

        // Skip if either row is already marked as skipped
        // if (a._skipRow || b._skipRow) continue;

        const measA = normalize(a.measurement_id);
        const measB = normalize(b.measurement_id);

        const contact_id = "f5daa493-5054-4ad2-97b0-d9db95e7cdd6";
        const flight_id = "d4ebb79e-a0a8-4550-8bc4-e4336b8490a3";

        // only calculate when we have both contact time & flight time
        if (
            (measA === contact_id && measB === flight_id) ||
            (measA === flight_id && measB === contact_id)
        ) {
            let contactTime = (measA === contact_id ? a.results : b.results) / 1000; // convert ms to s
            let flightTime = (measA === flight_id ? a.results : b.results) / 1000; // convert ms to s
            const pc = 1; // weight
            const g = 9.806;

            // console.log("Raw values - Contact:", contactTime, "Flight:", flightTime);
            const vfin_val = vfin(flightTime, g)
            const a_val = a_const(a.parent_activity_id, contactTime, vfin_val)
            const pat = ((pc*(a_val+g))*1.6)/g
            // const pat = (pc*((flightTime*g)/(contactTime))+(pc*g))/9.806

            // console.log("Calculated PAT:", pat);

            // assign PAT to the appropriate row
            if (measA === contact_id) {
                a.pat = pat;
            } else {
                b.pat = pat;
            }
        }
    }
};


const activity_percentage_mapping = {
    "8ee36943-154d-4a39-a81a-be8fb9fe4fc0": 0.58,
    "af550580-8db6-49b5-b855-3da4a8f334e9": 0.77,
    "335df26d-6968-45f5-a7f9-19ac37ff0609": 0.58
}


const vfin = (ft, g) => g*(ft/2)

// A = Vfin / (x%tc)
const a_const = (activity_id, ct, vfin) => {
    const percentage = activity_percentage_mapping[activity_id];
    return vfin / (percentage * ct);
};

export const impulse = (pc, ft) => {
    const g = 9.806
    return pc * vfin(ft, g)
}
