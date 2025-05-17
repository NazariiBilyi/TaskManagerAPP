import InputField from "../InputField/InputField.tsx";
import {useState} from "react";
import type {ICreateColumnFormProps} from "./types.ts";
import * as React from "react";

const CreateColumnForm: React.FC<ICreateColumnFormProps> = ({handleAddColumn}) => {

    const [newColumnTitle, setNewColumnTitle] = useState<string>('');

    const onSubmit = () => {
        handleAddColumn(newColumnTitle)
    }

    return(
        <div>
            <InputField
                label='Input Column name'
                type="text"
                value={newColumnTitle}
                onChange={(e) => setNewColumnTitle(e.target.value)}
                placeholder="New column name"
            />
            <button disabled={newColumnTitle.length === 0} onClick={onSubmit}>Add Column</button>
        </div>
    )
}

export default CreateColumnForm;