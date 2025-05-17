import * as React from "react";

export interface IOption {
    id: string,
    title: string
}

export interface ISelectFiledProps {
    label: string;
    options: IOption[];
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    value: string;
}