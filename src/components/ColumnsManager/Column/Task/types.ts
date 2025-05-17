export interface ITask {
    id: string,
    title: string,
    selected: boolean,
    status?: string;
    description?: string;
}

export interface ITaskProps {
    task: ITask,
    onDelete: (id: string) => void,
    onToggleSelect: (id: string) => void,
    onToggleStatus: (id: string) => void,
    onEditTask: (task: ITask, columnId: string) => void,
    index: number,
    columnId: string
}