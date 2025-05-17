import * as React from "react";

export interface IInputFieldProps {
    type: string,
    value: string,
    label: string,
    rows?: number,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
    placeholder: string
}