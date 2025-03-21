"use client";

import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import { useState } from "react";
import { Board, Column, Label, Task } from "../types/kanban";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Column as ColumnComponent } from "./kanban/Column";
import { TaskModal } from "./kanban/TaskModal";
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
          labels: [
            { id: "backend", text: "Backend", color: "#FF9800" }
          ]
        },
        {
          id: "task-2",
          title: "Create dashboard",
          description: "Design and implement main dashboard",
          labels: [
            { id: "frontend", text: "Frontend", color: "#03A9F4" },
            { id: "design", text: "Design", color: "#9C27B0" }
          ]
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
          labels: [
            { id: "backend", text: "Backend", color: "#FF9800" },
            { id: "feature", text: "Feature", color: "#4CAF50" }
          ]
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
          labels: [
            { id: "documentation", text: "Docs", color: "#795548" }
          ]
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
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [editingTask, setEditingTask] = useState<{
    title: string;
    description: string;
    labels?: Label[];
    completed?: boolean;
  }>({ title: "", description: "" });
  const [isEditingTask, setIsEditingTask] = useState(false);

  const onDragEnd = (result: any) => {
    const { destination, source, type, draggableId } = result;

    if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) {
      return;
    }

    // Si estamos arrastrando columnas
    if (type === 'column') {
      const newColumns = Array.from(board.columns);
      const [movedColumn] = newColumns.splice(source.index, 1);
      newColumns.splice(destination.index, 0, movedColumn);

      setBoard({
        columns: newColumns
      });

      return;
    }

    // Si estamos arrastrando tareas
    const newBoardData = JSON.parse(JSON.stringify(board));
    const sourceColumnIndex = newBoardData.columns.findIndex(
      (col: Column) => col.id === source.droppableId
    );
    const destColumnIndex = newBoardData.columns.findIndex(
      (col: Column) => col.id === destination.droppableId
    );

    if (sourceColumnIndex === -1 || destColumnIndex === -1) return;

    const [movedTask] = newBoardData.columns[sourceColumnIndex].tasks.splice(source.index, 1);
    newBoardData.columns[destColumnIndex].tasks.splice(destination.index, 0, movedTask);

    setBoard(newBoardData);
  };

  const addNewTask = (columnId: string, labels?: Label[]) => {
    if (!newTaskTitle.trim()) return;

    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: newTaskTitle,
      description: newTaskDescription,
      labels: labels,
    };

    setBoard({
      columns: board.columns.map((col) => {
        if (col.id === columnId) {
          return {
            ...col,
            tasks: [...col.tasks, newTask],
          };
        }
        return col;
      }),
    });

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

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setEditingTask({
      title: task.title,
      description: task.description || "",
      labels: task.labels || [],
      completed: task.completed || false,
    });
  };

  const updateTask = () => {
    if (!selectedTask || !editingTask.title.trim()) return;

    const newBoardData = JSON.parse(JSON.stringify(board));
    const columnIndex = newBoardData.columns.findIndex(
      (col: Column) => col.tasks.some((t: Task) => t.id === selectedTask.id)
    );

    if (columnIndex === -1) return;

    const taskIndex = newBoardData.columns[columnIndex].tasks.findIndex(
      (t: Task) => t.id === selectedTask.id
    );

    if (taskIndex === -1) return;

    newBoardData.columns[columnIndex].tasks[taskIndex] = {
      ...selectedTask,
      title: editingTask.title,
      description: editingTask.description,
      labels: editingTask.labels,
      completed: editingTask.completed,
    };

    setBoard(newBoardData);
    setIsEditingTask(false);
  };

  const handleTaskClose = () => {
    setSelectedTask(null);
    setEditingTask({ title: "", description: "", labels: [], completed: false });
    setIsEditingTask(false);
  };

  const handleTaskChange = (field: "title" | "description" | "labels" | "completed", value: any) => {
    setEditingTask(prev => ({ ...prev, [field]: value }));
  };

  const toggleTaskCompletion = (taskId: string) => {
    const newBoardData = JSON.parse(JSON.stringify(board));
    for (const column of newBoardData.columns) {
      const taskIndex = column.tasks.findIndex((t: Task) => t.id === taskId);
      if (taskIndex !== -1) {
        column.tasks[taskIndex].completed = !column.tasks[taskIndex].completed;
        setBoard(newBoardData);
        
        // If this is the currently selected task, update the editing state too
        if (selectedTask && selectedTask.id === taskId) {
          setSelectedTask({
            ...selectedTask,
            completed: column.tasks[taskIndex].completed
          });
          setEditingTask(prev => ({
            ...prev,
            completed: column.tasks[taskIndex].completed
          }));
        }
        break;
      }
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="all-columns" direction="horizontal" type="column">
        {(provided, snapshot) => (
          <div 
            className="flex gap-4 h-full px-4 pb-4 bg-gray-50 dark:bg-gray-900"
            {...provided.droppableProps}
            ref={provided.innerRef}
          >
            {board.columns.map((column, index) => (
              <Draggable key={column.id} draggableId={column.id} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className={cn(
                      "w-72 flex-shrink-0",
                      snapshot.isDragging ? "opacity-75" : ""
                    )}
                  >
                    <ColumnComponent
                      column={column}
                      editingSectionId={editingSectionId}
                      editingSectionTitle={editingSectionTitle}
                      onSectionTitleChange={setEditingSectionTitle}
                      onSaveSectionTitle={() => {
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
                      }}
                      onCancelEditSection={() => setEditingSectionId(null)}
                      onStartEditSection={(id, title) => {
                        setEditingSectionId(id);
                        setEditingSectionTitle(title);
                      }}
                      onDeleteSection={(id) => {
                        setBoard({
                          columns: board.columns.filter((col) => col.id !== id),
                        });
                      }}
                      onTaskClick={handleTaskClick}
                      onToggleTaskCompletion={toggleTaskCompletion}
                      onAddTask={addNewTask}
                      newTaskTitle={newTaskTitle}
                      newTaskDescription={newTaskDescription}
                      onNewTaskTitleChange={(value) => setNewTaskTitle(value)}
                      onNewTaskDescriptionChange={(value) => setNewTaskDescription(value)}
                      dragHandleProps={provided.dragHandleProps}
                    />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}

            <div className="w-72 flex-shrink-0">
              <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-3 text-sm">Add New Section</h3>
                <div className="flex gap-2">
                  <Input
                    placeholder="Section title"
                    value={newSectionTitle}
                    onChange={(e) => setNewSectionTitle(e.target.value)}
                    className="text-sm h-7 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                  />
                  <Button onClick={addNewSection} className="h-7 w-7 p-0 dark:bg-gray-700">
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </Droppable>

      <TaskModal
        selectedTask={selectedTask}
        isEditingTask={isEditingTask}
        editingTask={editingTask}
        onClose={handleTaskClose}
        onEdit={() => setIsEditingTask(true)}
        onSave={updateTask}
        onCancel={() => setIsEditingTask(false)}
        onTaskChange={handleTaskChange}
      />
    </DragDropContext>
  );
};

export default KanbanBoard;