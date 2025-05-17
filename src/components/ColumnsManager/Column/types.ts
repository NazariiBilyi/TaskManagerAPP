import type {IColumn} from "../types.ts";
import type {ITask} from "./Task/types.ts";

export interface IColumnProps {
    column: IColumn,
    onDelete: (id: string) => void,
    onDeleteTask: (sourceId: string, targetId: string) => void,
    onToggleTaskSelect: (columnId: string, taskId: string) => void,
    onEditTask: (task: ITask, columnId: string) => void,
    setColumns: (columns: IColumn[]) => void,
    columns: IColumn[],
}