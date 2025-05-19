import InputField from "../InputField/InputField.tsx";
import SelectField from "../SelectField/SelectField.tsx";
import { useEffect, useState} from "react";
import * as React from "react";
import type {ICreateTaskFormProps} from "./types.ts";
import './CreateTaskForm.css'

const CreateTaskForm: React.FC<ICreateTaskFormProps> = ({columns, handleAddTask, taskForEdit}) => {

    const [newTaskTitle, setNewTaskTitle] = useState<string>(taskForEdit ? taskForEdit.title : '')
    const [description, setDescription] = useState<string>(taskForEdit ? taskForEdit.description as string : '')
    const [selectedColumnId, setSelectedColumnId] = useState<string>(taskForEdit ? taskForEdit.columnId : '')

    useEffect(() => {
        if (columns.length > 0 && !columns.find(col => col.id === selectedColumnId)) {
            setSelectedColumnId(columns[0].id);
        }
    }, [columns, selectedColumnId]);

    const onSubmit = () => {
        handleAddTask(selectedColumnId, newTaskTitle, description)
    }

    const onDisableSubmit = () => {
        return newTaskTitle === '' || selectedColumnId === '' || description === ''
    }

    return(
        <div className='create-task-form'>
            <InputField
                type="text"
                label='Input Task name'
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="New task name"
            />
            <label>Description</label>
            <textarea
                value={description}
                rows={4}
                onChange={(e) => setDescription(e.target.value)}
                placeholder='Add Description'
            />
            <SelectField
                label='Select column'
                value={selectedColumnId}
                onChange={(e) => setSelectedColumnId(e.target.value)}
                options={columns}
            />
            <button disabled={onDisableSubmit()} onClick={onSubmit}>{taskForEdit ? 'Edit task ' : 'Add Task'}</button>
        </div>
    )
}

export default CreateTaskForm;