import './Column.css'
import {useEffect, useRef } from "react";
import Task from "./Task/Task.tsx";
import type {ITask} from "./Task/types.ts";
import type {IColumn} from "../types.ts";
import type {IColumnProps} from "./types.ts";
import * as React from "react";
import invariant from "tiny-invariant";
import {draggable, dropTargetForElements} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import {combine} from "@atlaskit/pragmatic-drag-and-drop/combine";

const Column: React.FC<IColumnProps> = ({ column, onDelete, onDeleteTask, onToggleTaskSelect, setColumns, columns, onEditTask }) => {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const columnEl = ref.current;
        invariant(columnEl);

        return combine(
            dropTargetForElements({
                element: columnEl,
                getData: () => ({ columnId: column.id }),
                onDragEnter: () => columnEl.classList.add('column-hover'),
                onDragLeave: () => columnEl.classList.remove('column-hover'),
                onDrop: () => {
                    columnEl.classList.remove('column-hover')
                },
            }),
            draggable({
                element: document.querySelector(`[data-column-id="${column.id}"]`) as HTMLDivElement,
                getInitialData: () => ({
                    type: "column",
                    columnId: column.id,
                }),
            }));
    }, [column]);

    const handleToggleTaskStatus = (taskId: string) => {
        setColumns(columns.map((col: IColumn) =>
            col.id === column.id
                ? {
                    ...col,
                    tasks: col.tasks.map((task: ITask) =>
                        task.id === taskId
                            ? { ...task, status: task.status === 'done' ? 'not done' : 'done' }
                            : task
                    ),
                }
                : col
        ));
    };

    const selectAllTasks = () => {
        const allSelected = column.tasks.every(task => task.selected);
        setColumns(columns.map((col: IColumn) =>
            col.id === column.id
                ? {
                    ...col,
                    tasks: col.tasks.map(task => ({
                        ...task,
                        selected: !allSelected,
                    })),
                }
                : col
        ));
    };

    return (
        <div className="column" ref={ref} data-column-id={column.id}>
            <div className="column-header">
                <h2>{column.title}</h2>
                <button className="select-all-btn" onClick={selectAllTasks} disabled={column.tasks.length === 0}>
                    {column.tasks.every(task => task.selected) ? 'Deselect All' : 'Select All'}
                </button>
                <button className="delete-btn" onClick={() => onDelete(column.id)}>×</button>
            </div>
            <div className="column-body" >
                {column.tasks.map((task: ITask, index) => (
                    <Task
                        key={task.title + index}
                        task={task}
                        index={index}
                        columnId={column.id}
                        onToggleStatus={handleToggleTaskStatus}
                        onEditTask={onEditTask}
                        onDelete={(taskId) => onDeleteTask(column.id, taskId)}
                        onToggleSelect={(taskId) => onToggleTaskSelect(column.id, taskId)}
                    />
                ))}
            </div>
        </div>
    );
};

export default Column