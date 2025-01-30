import Select from "react-select";
import { Controller } from "react-hook-form";

interface Props {
    options: any[];
    onSelect: (value: any) => void;
    name: string;
    control: any;
    isMulti?: boolean;
    required?: boolean;
}

export default function Dropdown({ options, onSelect, name, control, isMulti = false, required = false }: Props) {
    return (
    <Controller
        name={name}
        control={control}
        rules={{ required }}
        render={({ field, fieldState }) => (
        <div>
            <Select
                {...field}
                options={options}
                isMulti={isMulti}
                className=""
                onChange={(selected) => {
                    const selectedValue = isMulti
                    ? selected.map((item) => item.value) // Get array of values for multi-select
                    : selected?.value;
                    field.onChange(selectedValue);
                    onSelect(selectedValue);
                }}
                value={
                isMulti
                    ? options.filter((option) => field.value?.includes(option.value)) // Get full option list for multi-select
                    : options.find((option) => option.value === field.value) // Get full object for single select
                }
                defaultValue={null}
                styles={{
                    control: (base) => ({
                    ...base,
                    borderColor: fieldState.error ? "red" : base.borderColor,
                    }),
                }}
            />
            {fieldState.error && <span className="text-red-500 text-sm">This field is required</span>}
        </div>
        )}
    />
    );
}
