import './SelectField.css'
import type {ISelectFiledProps} from "./types.ts";
import * as React from "react";

const SelectField: React.FC<ISelectFiledProps> = (props) => {
    const {options} = props

    return(
        <div>
            <label>{props.label}</label>
            <select
                {...props}
                className='custom-input'
            >
                {options.map((option) => (
                    <option key={option.id} value={option.id}>{option.title}</option>
                ))}
            </select>
        </div>

    )
}

export default SelectField