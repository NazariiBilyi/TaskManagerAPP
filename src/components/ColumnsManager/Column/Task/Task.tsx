import type {ITaskProps} from "./types.ts";
import * as React from "react";
import './Task.css'
import {useEffect, useRef, useState} from "react";
import {draggable, dropTargetForElements} from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import {combine} from "@atlaskit/pragmatic-drag-and-drop/combine";
import invariant from "tiny-invariant";
import {
    attachClosestEdge,
    extractClosestEdge,
} from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import DropIndicator from "../../../DropIndicator/DropIndicator.tsx";
import type {Edge} from "@atlaskit/pragmatic-drag-and-drop-hitbox/types";

const Task: React.FC<ITaskProps> = ({ task, onDelete, onToggleSelect, onToggleStatus, onEditTask, columnId, searchText }) => {

    const ref = useRef<HTMLDivElement>(null);

    const [closestEdge, setClosestEdge] = useState<Edge | null>(null)

    useEffect(() => {
        const cardEl = ref.current;
        invariant(cardEl);

        return combine(
            draggable({
                element: cardEl,
                getInitialData: () => ({ type: "task", taskId: task.id }),
            }),
            dropTargetForElements({
                element: cardEl,
                getData: ({ input, element }) => {
                    const data = { type: "task", taskId: task.id };

                    return attachClosestEdge(data, {
                        input,
                        element,
                        allowedEdges: ["top", "bottom"],
                    });
                },
                onDragEnter: (args) => {
                    ref?.current?.classList.add('task-hover');
                    if (args.source.data.taskId !== task.id) {
                        setClosestEdge(extractClosestEdge(args.self.data));
                    }
                },
                onDrag: (args) => {
                    if (args.source.data.cardId !== task.id) {
                        setClosestEdge(extractClosestEdge(args.self.data));
                    }
                },
                onDragLeave: () => {
                    ref?.current?.classList.remove('task-hover');
                    setClosestEdge(null);
                },
                canDrop: ({ source }) => {
                    return source.data.type === "task" || source.data.type === "column";
                },
                onDrop: () => {
                    setClosestEdge(null);
                    ref?.current?.classList.remove('task-hover');
                }
            })
        );
    }, [task.id]);

    const getHighlightedText = () => {
        if (!searchText) return task.title;

        const regex = new RegExp(`(${searchText})`, 'gi');
        const parts = task.title.split(regex);

        return parts.map((part, i) =>
            regex.test(part) ? <div className='highlight-text' key={i}>{part}</div> : part
        );
    };

    return (
        <div className={`task ${task.status === 'done' ? 'task-done' : ''}`} data-task-id={task.id} ref={ref}>
            <div className="task-header">
                <input
                    type="checkbox"
                    checked={task.selected}
                    onChange={() => onToggleSelect(task.id)}
                />
                <span className="task-title">{getHighlightedText()}</span>
                <button className="task-edit" onClick={() => onEditTask(task, columnId)}>Edit</button>
                <button className="task-delete" onClick={() => onDelete(task.id)}>×</button>
            </div>
            <div>Task description</div>
            <div className='task-description'>{task.description}</div>
            <div className="task-footer">
                <span className="task-status">Status: {task.status === 'done' ? 'Done' : 'Not done'}</span>
                <button className="status-toggle" onClick={() => onToggleStatus(task.id)}>
                    Mark {task.status === 'done' ? 'Not done' : 'Done'}
                </button>
            </div>
            {closestEdge && <DropIndicator edge={closestEdge} gap="8px" />}
        </div>
    );
};

export default Task;