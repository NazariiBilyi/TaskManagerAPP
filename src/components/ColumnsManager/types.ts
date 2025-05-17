import type {ITask} from "./Column/Task/types.ts";

export interface IColumn {
    id: string,
    title: string,
    tasks: ITask[]
}

export interface ITaskForEdit extends ITask {
    columnId: string
}

export interface IMoveTaskArgs {
    movedCardIndexInSourceColumn: number,
    sourceColumnId: string,
    destinationColumnId: string,
    movedCardIndexInDestinationColumn?: number,
}

export interface IReorderTaskArgs {
    columnId: string,
    startIndex: number,
    finishIndex: number,
}