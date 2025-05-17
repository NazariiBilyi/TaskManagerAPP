import {useCallback, useEffect, useState} from 'react';
import './ColumnsManager.css';
import Column from "./Column/Column.tsx";
import DialogComponent from "./DialogComponent/DialogComponent.tsx";
import type {IColumn, IReorderTaskArgs, IMoveTaskArgs, ITaskForEdit} from "./types.ts";
import type {ITask} from "./Column/Task/types.ts";
import CreateColumnForm from "../CreateColumnForm/CreateColumnForm.tsx";
import CreateTaskForm from "../CreateTaskForm/CreateTaskForm.tsx";
import InputField from "../InputField/InputField.tsx";
import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { getReorderDestinationIndex } from "@atlaskit/pragmatic-drag-and-drop-hitbox/util/get-reorder-destination-index";
import { reorder } from "@atlaskit/pragmatic-drag-and-drop/reorder";
import {extractClosestEdge} from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";

const ColumnsManager = () => {
    const [columns, setColumns] = useState<IColumn[]>();

    const [dialogType, setDialogType] = useState<string>('');
    const [searchText, setSearchText] = useState<string>('')
    const [selectAllChecked, setSelectAllChecked] = useState<boolean>(false);
    const [taskForEdit, setTaskForEdit] = useState<ITaskForEdit | null>(null)

    useEffect(() => {
        const savedColumns = localStorage.getItem('columns');
        if (savedColumns) {
            try {
                setColumns(JSON.parse(savedColumns));
            } catch (error) {
                console.error('Failed to load columns from localStorage', error);
            }
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('columns', JSON.stringify(columns));
    }, [columns]);

    const moveTask = useCallback(
        ({
             movedCardIndexInSourceColumn,
             sourceColumnId,
             destinationColumnId,
             movedCardIndexInDestinationColumn,
         }: IMoveTaskArgs) => {
            const sourceColumnData = columns?.find(col => col.id === sourceColumnId)
            const sourceColumnDataIndex = columns?.findIndex(col => col.id === sourceColumnId)

            const destinationColumnData = columns?.find(col => col.id === destinationColumnId)
            const destinationColumnDataIndex = columns?.findIndex(col => col.id === destinationColumnId)

            const taskToMove = sourceColumnData?.tasks[movedCardIndexInSourceColumn];

            const newSourceColumnData = {
                ...sourceColumnData,
                tasks: sourceColumnData?.tasks.filter(
                    (task) => task.id !== taskToMove?.id
                ),
            };

            const newDestinationCards = Array.from(destinationColumnData?.tasks ?? []);

            const newIndexInDestination = movedCardIndexInDestinationColumn ?? 0;

            newDestinationCards.splice(newIndexInDestination, 0, taskToMove as ITask);

            const newFinishColumnData = {
                ...destinationColumnData,
                tasks: newDestinationCards,
            };

            const newColumnsData = [...columns as IColumn[]];
            newColumnsData[sourceColumnDataIndex as number] = newSourceColumnData as IColumn
            newColumnsData[destinationColumnDataIndex as number] = newFinishColumnData as IColumn

            setColumns(newColumnsData);
        },
        [columns]
    );

    const reorderTask = useCallback(
        ({ columnId, startIndex, finishIndex }: IReorderTaskArgs) => {
            // Get the source column data
            const sourceColumnData = columns?.find(col => col.id === columnId)
            const columnIndex = columns?.findIndex(col => col.id === columnId)

            // Call the reorder function to get a new array
            // of cards with the moved card's new position
            const updatedItems = reorder({
                list: sourceColumnData?.tasks as ITask[],
                startIndex,
                finishIndex,
            });

            // Create a new object for the source column
            // with the updated list of cards
            const updatedSourceColumn = {
                ...sourceColumnData,
                tasks: updatedItems,
            };

            // Update columns state

            const newColumns = [...columns as IColumn[]];

            newColumns[columnIndex as number] = updatedSourceColumn as IColumn;

            setColumns(newColumns);
        },
        [columns]
    );

    const swapArrayElements = <T,>(arr: T[], index1: number, index2: number): T[] => {
        const newArr = [...arr];
        [newArr[index1], newArr[index2]] = [newArr[index2], newArr[index1]];
        return newArr;
    };

    const handleDrop = useCallback(({ source, location }) => {
        // Early return if there are no drop targets in the current location
        const destination = location.current.dropTargets.length;
        if (!destination) {
            return;
        }

        if(source.data.type === 'column') {
            const draggedColumnIndex = columns?.findIndex(col => col.id === location.initial.dropTargets[0].data.columnId);
            const targetColumnIndex = columns?.findIndex(col => col.id === location.current.dropTargets[0].data.columnId);
            const columnsArray = [...columns as IColumn[]];
            setColumns(swapArrayElements(columnsArray, draggedColumnIndex as number, targetColumnIndex as number));
        }

        if (source.data.type === "task") {
            const draggedTaskId = source.data.taskId;

            const [, sourceColumnRecord] = location.initial.dropTargets;

            const sourceColumnId = sourceColumnRecord.data.columnId;

            const sourceColumnData = columns?.find(col => col.id === sourceColumnId)

            const draggedTaskIndex = sourceColumnData?.tasks.findIndex(
                (task) => task.id === draggedTaskId
            );

            if (location.current.dropTargets.length === 1) {

                const [destinationColumnRecord] = location.current.dropTargets;

                const destinationColumnId = destinationColumnRecord.data.columnId;

                if (sourceColumnId === destinationColumnId) {
                    const destinationIndex = getReorderDestinationIndex({
                        startIndex: draggedTaskIndex as number,
                        indexOfTarget: sourceColumnData?.tasks?.length as number - 1,
                        closestEdgeOfTarget: null,
                        axis: "vertical",
                    });

                    reorderTask({
                        columnId: sourceColumnData?.id as string,
                        startIndex: draggedTaskIndex as number,
                        finishIndex: destinationIndex,
                    });
                    return;
                }

                moveTask({
                    movedCardIndexInSourceColumn: draggedTaskIndex as number,
                    sourceColumnId,
                    destinationColumnId,
                });
                return;
            }

            if (location.current.dropTargets.length === 2) {
                const [destinationCardRecord, destinationColumnRecord] =
                    location.current.dropTargets;
                const destinationColumnId = destinationColumnRecord.data.columnId;

                const destinationColumn = columns?.find(col => col.id === destinationColumnId);

                const indexOfTarget = destinationColumn?.tasks.findIndex(
                    (task) => task.id === destinationCardRecord.data.taskId
                );

                const closestEdgeOfTarget = extractClosestEdge(
                    destinationCardRecord.data
                );

                if (sourceColumnId === destinationColumnId) {

                    const destinationIndex = getReorderDestinationIndex({
                        startIndex: draggedTaskIndex as number,
                        indexOfTarget: indexOfTarget as number,
                        closestEdgeOfTarget,
                        axis: "vertical",
                    });

                        // Perform the card reordering within the same column
                    reorderTask({
                        columnId: sourceColumnId,
                        startIndex: draggedTaskIndex as number,
                        finishIndex: destinationIndex,
                    });

                    return;
                }
                const destinationIndex =
                    closestEdgeOfTarget === "bottom"
                        ? indexOfTarget as number + 1
                        : indexOfTarget;

                moveTask({
                    movedCardIndexInSourceColumn: draggedTaskIndex as number,
                    sourceColumnId,
                    destinationColumnId,
                    movedCardIndexInDestinationColumn: destinationIndex,
                });
            }
        }
    },[columns, moveTask, reorderTask])

    useEffect(() => {
        return monitorForElements({
            onDrop: handleDrop,
        });
    }, [handleDrop]);

    const onFilterTasks = (tasks: ITask[]) => {
        return tasks?.filter((task) => task.title.toLowerCase().includes(searchText.toLowerCase()))
    }

    const handleOpenDialog = (type: string) => () => {
        setDialogType(type)
    };

    const handleAddColumn = (newColumnTitle: string) => {
        if (!newColumnTitle.trim()) return;
        const newColumn = {
            id: Date.now().toString(),
            title: newColumnTitle,
            tasks: [],
        };
        setColumns([...columns as IColumn[], newColumn]);
        setDialogType('')
    }

    const handleAddTask = (selectedColumnId: string, newTaskTitle: string, description: string) => {

        if (!newTaskTitle.trim() || !selectedColumnId) return;

        const updatedColumns = columns?.map((col) => {
            // Remove the old task if we're editing (from ANY column)
            if (taskForEdit) {
                return {
                    ...col,
                    tasks: col.tasks.filter((task) => task.id !== taskForEdit.id),
                };
            }
            return col;
        }).map((col) => {
            // Add the updated or new task to the target column
            if (col.id === selectedColumnId) {
                const newTask = taskForEdit
                    ? {
                        ...taskForEdit,
                        title: newTaskTitle,
                        description: description,
                    }
                    : {
                        id: Date.now().toString(),
                        title: newTaskTitle,
                        description: description,
                        selected: false,
                        status: 'not done',
                    };
                return { ...col, tasks: [...col.tasks, newTask] };
            }
            return col;
        });

        setColumns(updatedColumns);
        setDialogType('');
    };

    const handleDeleteTask = (columnId: string, taskId: string) => {
        const newColumns = columns?.map((col) =>
            col.id === columnId
                ? { ...col, tasks: col.tasks.filter((task) => task.id !== taskId) }
                : col
        )
        setColumns(newColumns);
    };

    const handleToggleTaskSelect = (columnId: string, taskId: string) => {
        const newColumns = columns?.map((col) =>
            col.id === columnId
                ? {
                    ...col,
                    tasks: col.tasks.map((task) =>
                        task.id === taskId ? { ...task, selected: !task.selected } : task
                    ),
                }
                : col
        )
        setColumns(newColumns);
    };

    const handleDeleteSelectedTasks = () => {
        setColumns(columns?.map((col) => ({
            ...col,
            tasks: col.tasks.filter((task) => !task.selected),
        })));
    };

    const isDeleteSelectedTaskButtonDisabled = () => {
        return columns?.every((col) => col?.tasks?.every((task) => !task.selected));
    }

    const selectAllTasks = (checked: boolean) => {
        setSelectAllChecked(checked);
        setColumns(columns?.map((col) => ({
            ...col,
            tasks: col.tasks.map((task) => ({
                ...task,
                selected: checked,
            })),
        })));
    };

    const markTasksAsDone = () => {
        setColumns(columns?.map(col => ({
            ...col,
            tasks: col.tasks.map(task =>
                task.selected ? { ...task, status: 'done' } : task
            ),
        })));
    };

    const markTasksAsNotDone = () => {
        setColumns(columns?.map(col => ({
            ...col,
            tasks: col.tasks.map(task =>
                task.selected ? { ...task, status: 'not done' } : task
            ),
        })));
    };


    const onRenderDialogForm = () => {
        switch (dialogType) {
            case 'column':
                return <CreateColumnForm handleAddColumn={handleAddColumn} />
            case 'task':
                 return <CreateTaskForm taskForEdit={taskForEdit} columns={columns || []} handleAddTask={handleAddTask} />
            default:
               return <div>Invalid dialog type</div>
        }
    }

    const onEditTask = (task: ITask, columnId: string) => {
        setDialogType('task')
        setTaskForEdit({
            ...task,
            columnId
        })
    }

    return (
        <div className="columns-container">
            <InputField type='text' value={searchText} label={'Type to search the task'} onChange={(e) => setSearchText(e.target.value)} placeholder='Search' />
            <div className="buttons-wrapper">
                <button className="add-column-btn" onClick={handleOpenDialog('column')}>
                    + Add Column
                </button>
                <div className="select-all-container">
                    <input
                        type="checkbox"
                        id="select-all"
                        checked={selectAllChecked}
                        onChange={(e) => selectAllTasks(e.target.checked)}
                    />
                    <label htmlFor="select-all">Select All Tasks</label>
                </div>
                <div className="add-task-container">
                    <button disabled={columns?.length === 0} onClick={handleOpenDialog('task')}>Add Task</button>
                </div>
                <button disabled={isDeleteSelectedTaskButtonDisabled()} onClick={handleDeleteSelectedTasks}>Delete Selected Tasks</button>
                <div className="bulk-actions">
                    <select
                        disabled={isDeleteSelectedTaskButtonDisabled()}
                        onChange={(e) => {
                            if (e.target.value === 'done') markTasksAsDone();
                            if (e.target.value === 'notDone') markTasksAsNotDone();
                            e.target.selectedIndex = 0; // Reset dropdown
                        }}
                    >
                        <option>Bulk Actions</option>
                        <option value="done">Mark as Done</option>
                        <option value="notDone">Mark as Not Done</option>
                    </select>
                </div>
            </div>
            <div className='columns-wrapper'>
                {columns?.map((column) => (
                    <Column
                        key={column?.id}
                        column={{
                            ...column,
                            tasks: onFilterTasks(column?.tasks)
                        }}
                        columns={columns || []}
                        setColumns={setColumns}
                        onDelete={(colId: string) => setColumns(columns?.filter((col) => col.id !== colId))}
                        onDeleteTask={handleDeleteTask}
                        onToggleTaskSelect={handleToggleTaskSelect}
                        onEditTask={onEditTask}
                    />
                ))}
            </div>
            <DialogComponent isOpen={dialogType.length > 0} onClose={() => {
                setTaskForEdit(null)
                setDialogType('')
            }}>
                {onRenderDialogForm()}
            </DialogComponent>
        </div>
    );
};

export default ColumnsManager;
