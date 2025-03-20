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

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const sourceColumn = board.columns.find((col) => col.id === source.droppableId);
    const destColumn = board.columns.find((col) => col.id === destination.droppableId);

    if (!sourceColumn || !destColumn) return;

    const task = sourceColumn.tasks.find((t) => t.id === draggableId);
    if (!task) return;

    const newSourceTasks = [...sourceColumn.tasks];
    newSourceTasks.splice(source.index, 1);

    const newDestTasks = [...destColumn.tasks];
    newDestTasks.splice(destination.index, 0, task);

    const newBoard = {
      columns: board.columns.map((col) => {
        if (col.id === source.droppableId) {
          return { ...col, tasks: newSourceTasks };
        }
        if (col.id === destination.droppableId) {
          return { ...col, tasks: newDestTasks };
        }
        return col;
      }),
    };

    setBoard(newBoard);
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
      <div className="flex gap-6 p-6 h-full overflow-x-auto">
        {board.columns.map((column) => (
          <div
            key={column.id}
            className="bg-gray-100 p-4 rounded-lg w-80 flex-shrink-0"
          >
            <div className="flex justify-between items-center mb-4">
              {editingSectionId === column.id ? (
                <div className="flex gap-2 flex-1">
                  <Input
                    value={editingSectionTitle}
                    onChange={(e) => setEditingSectionTitle(e.target.value)}
                    className="h-8"
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={saveEditingSection}
                    className="h-8 px-2"
                  >
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setEditingSectionId(null)}
                    className="h-8 px-2"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <h3 className="font-semibold text-gray-700">{column.title}</h3>
                  <div className="flex items-center gap-2">
                    <span className="bg-gray-200 px-2 py-1 rounded text-sm">
                      {column.tasks.length}
                    </span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => startEditingSection(column.id, column.title)}
                        >
                          Edit Section
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
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
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="min-h-[200px]"
                >
                  {column.tasks.map((task, index) => (
                    <Draggable key={task.id} draggableId={task.id} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="bg-white p-4 rounded-lg shadow mb-3"
                        >
                          <h4 className="font-medium mb-2">{task.title}</h4>
                          {task.description && (
                            <p className="text-sm text-gray-600">
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
                  className="w-full mt-3 text-gray-600 hover:text-gray-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Task
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Task</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <Input
                    placeholder="Task title"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                  />
                  <Input
                    placeholder="Task description (optional)"
                    value={newTaskDescription}
                    onChange={(e) => setNewTaskDescription(e.target.value)}
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

        <div className="w-80 flex-shrink-0">
          <div className="bg-gray-100 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-700 mb-4">Add New Section</h3>
            <div className="flex gap-2">
              <Input
                placeholder="Section title"
                value={newSectionTitle}
                onChange={(e) => setNewSectionTitle(e.target.value)}
              />
              <Button onClick={addNewSection}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DragDropContext>
  );
};

export default KanbanBoard;