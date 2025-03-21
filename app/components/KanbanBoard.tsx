"use client";

import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { useState } from "react";
import { Board, Column, Task } from "../types/kanban";
import { Plus, MoreVertical, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const initialData: Board = {
  columns: [
    {
      id: "todo",
      title: "To Do",
      tasks: [
        {
          id: "task-1",
          title: "Implement authentication",
          description: "Add user login and registration",
        },
        {
          id: "task-2",
          title: "Create dashboard",
          description: "Design and implement main dashboard",
        },
      ],
    },
    {
      id: "in-progress",
      title: "In Progress",
      tasks: [
        {
          id: "task-3",
          title: "API integration",
          description: "Connect frontend with backend services",
        },
      ],
    },
    {
      id: "done",
      title: "Done",
      tasks: [
        {
          id: "task-4",
          title: "Project setup",
          description: "Initialize repository and configure tools",
        },
      ],
    },
  ],
};

const KanbanBoard = () => {
  const [board, setBoard] = useState<Board>(initialData);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [editingSectionTitle, setEditingSectionTitle] = useState("");

  const onDragEnd = (result: any) => {
    const { destination, source, draggableId } = result;

    // If there's no destination or the item was dropped in the same spot, do nothing
    if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) {
      return;
    }

    // Create a deep copy of the current board state
    const newBoardData = JSON.parse(JSON.stringify(board));

    // Find the source and destination columns
    const sourceColumnIndex = newBoardData.columns.findIndex(
      (col: Column) => col.id === source.droppableId
    );
    const destColumnIndex = newBoardData.columns.findIndex(
      (col: Column) => col.id === destination.droppableId
    );

    if (sourceColumnIndex === -1 || destColumnIndex === -1) return;

    // Get the task that was dragged
    const [movedTask] = newBoardData.columns[sourceColumnIndex].tasks.splice(source.index, 1);

    // Insert the task in its new position
    newBoardData.columns[destColumnIndex].tasks.splice(destination.index, 0, movedTask);

    // Update the state with the new board data
    setBoard(newBoardData);
  };

  const addNewTask = (columnId: string) => {
    if (!newTaskTitle.trim()) return;

    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: newTaskTitle,
      description: newTaskDescription,
    };

    const newBoard = {
      columns: board.columns.map((col) => {
        if (col.id === columnId) {
          return {
            ...col,
            tasks: [...col.tasks, newTask],
          };
        }
        return col;
      }),
    };

    setBoard(newBoard);
    setNewTaskTitle("");
    setNewTaskDescription("");
  };

  const addNewSection = () => {
    if (!newSectionTitle.trim()) return;

    const newSection: Column = {
      id: `section-${Date.now()}`,
      title: newSectionTitle,
      tasks: [],
    };

    setBoard({
      columns: [...board.columns, newSection],
    });

    setNewSectionTitle("");
  };

  const deleteSection = (sectionId: string) => {
    setBoard({
      columns: board.columns.filter((col) => col.id !== sectionId),
    });
  };

  const startEditingSection = (sectionId: string, currentTitle: string) => {
    setEditingSectionId(sectionId);
    setEditingSectionTitle(currentTitle);
  };

  const saveEditingSection = () => {
    if (!editingSectionId || !editingSectionTitle.trim()) return;

    setBoard({
      columns: board.columns.map((col) => {
        if (col.id === editingSectionId) {
          return { ...col, title: editingSectionTitle };
        }
        return col;
      }),
    });

    setEditingSectionId(null);
    setEditingSectionTitle("");
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-4 h-full px-4 pb-4 bg-gray-50">
        {board.columns.map((column) => (
          <div
            key={column.id}
            className="bg-gray-100 p-3 rounded-lg w-72 flex-shrink-0"
          >
            <div className="flex justify-between items-center mb-3">
              {editingSectionId === column.id ? (
                <div className="flex gap-1 flex-1">
                  <Input
                    value={editingSectionTitle}
                    onChange={(e) => setEditingSectionTitle(e.target.value)}
                    className="h-7 text-sm"
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={saveEditingSection}
                    className="h-7 px-2"
                  >
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setEditingSectionId(null)}
                    className="h-7 px-2"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <>
                  <h3 className="font-semibold text-gray-700 text-sm">{column.title}</h3>
                  <div className="flex items-center gap-2">
                    <span className="bg-gray-200 px-2 py-0.5 rounded text-xs">
                      {column.tasks.length}
                    </span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                          <MoreVertical className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => startEditingSection(column.id, column.title)}
                          className="text-sm"
                        >
                          Edit Section
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600 text-sm"
                          onClick={() => deleteSection(column.id)}
                        >
                          Delete Section
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </>
              )}
            </div>

            <Droppable droppableId={column.id}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={cn(
                    "min-h-[150px] transition-colors rounded-md",
                    snapshot.isDraggingOver ? "bg-gray-200/50" : ""
                  )}
                >
                  {column.tasks.map((task, index) => (
                    <Draggable 
                      key={task.id} 
                      draggableId={task.id} 
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={cn(
                            "bg-white p-3 rounded-lg shadow mb-2 text-sm select-none",
                            snapshot.isDragging ? "opacity-75 shadow-lg ring-2 ring-gray-200" : ""
                          )}
                          style={provided.draggableProps.style}
                        >
                          <h4 className="font-medium mb-1">{task.title}</h4>
                          {task.description && (
                            <p className="text-xs text-gray-600">
                              {task.description}
                            </p>
                          )}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>

            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full mt-2 text-gray-600 hover:text-gray-700 h-7 text-xs"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add Task
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Task</DialogTitle>
                </DialogHeader>
                <div className="space-y-3 pt-3">
                  <Input
                    placeholder="Task title"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    className="text-sm"
                  />
                  <Input
                    placeholder="Task description (optional)"
                    value={newTaskDescription}
                    onChange={(e) => setNewTaskDescription(e.target.value)}
                    className="text-sm"
                  />
                  <Button
                    className="w-full"
                    onClick={() => addNewTask(column.id)}
                  >
                    Add Task
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        ))}

        <div className="w-72 flex-shrink-0">
          <div className="bg-gray-100 p-3 rounded-lg">
            <h3 className="font-semibold text-gray-700 mb-3 text-sm">Add New Section</h3>
            <div className="flex gap-2">
              <Input
                placeholder="Section title"
                value={newSectionTitle}
                onChange={(e) => setNewSectionTitle(e.target.value)}
                className="text-sm h-7"
              />
              <Button onClick={addNewSection} className="h-7 w-7 p-0">
                <Plus className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DragDropContext>
  );
};

export default KanbanBoard;