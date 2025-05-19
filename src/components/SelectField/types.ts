import type {ChangeEventHandler} from "react";

export interface IOption {
    id: string,
    title: string
}

export interface ISelectFiledProps {
    label: string;
    options: IOption[];
    onChange: ChangeEventHandler<HTMLSelectElement>;
    value: string;
}