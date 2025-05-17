import type {IColumn, ITaskForEdit} from "../ColumnsManager/types.ts";

export interface ICreateTaskFormProps {
    columns: IColumn[],
    taskForEdit: ITaskForEdit | null,
    handleAddTask: (columnId: string, taskName: string, description: string) => void,
}