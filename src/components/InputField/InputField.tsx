import './InputField.css'
import type {IInputFieldProps} from "./types.ts";
import * as React from "react";

const InputField: React.FC<IInputFieldProps> = (props) => {
    return(
        <div>
            <label>{props.label}</label>
            <input
                {...props}
                className='custom-input'
            />
        </div>

    )
}

export default InputField