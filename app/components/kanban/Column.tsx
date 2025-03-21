import { Column as ColumnType, Task } from "@/app/types/kanban";
import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Droppable } from "@hello-pangea/dnd";
import { MoreVertical, Plus, X } from "lucide-react";
import { TaskCard } from "./TaskCard";

interface ColumnProps {
  column: ColumnType;
  editingSectionId: string | null;
  editingSectionTitle: string;
  onSectionTitleChange: (value: string) => void;
  onSaveSectionTitle: () => void;
  onCancelEditSection: () => void;
  onStartEditSection: (id: string, title: string) => void;
  onDeleteSection: (id: string) => void;
  onTaskClick: (task: Task) => void;
  onAddTask: (columnId: string) => void;
  newTaskTitle: string;
  newTaskDescription: string;
  onNewTaskTitleChange: (value: string) => void;
  onNewTaskDescriptionChange: (value: string) => void;
}

export function Column({
  column,
  editingSectionId,
  editingSectionTitle,
  onSectionTitleChange,
  onSaveSectionTitle,
  onCancelEditSection,
  onStartEditSection,
  onDeleteSection,
  onTaskClick,
  onAddTask,
  newTaskTitle,
  newTaskDescription,
  onNewTaskTitleChange,
  onNewTaskDescriptionChange,
}: ColumnProps) {
  return (
    <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg w-72 flex-shrink-0">
      <div className="flex justify-between items-center mb-3">
        {editingSectionId === column.id ? (
          <div className="flex gap-1 flex-1">
            <Input
              value={editingSectionTitle}
              onChange={(e) => onSectionTitleChange(e.target.value)}
              className="h-7 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
            />
            <Button
              size="sm"
              variant="ghost"
              onClick={onSaveSectionTitle}
              className="h-7 px-2 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Save
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={onCancelEditSection}
              className="h-7 px-2 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <>
            <h3 className="font-semibold text-gray-700 dark:text-gray-300 text-sm">{column.title}</h3>
            <div className="flex items-center gap-2">
              <span className="bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded text-xs dark:text-gray-300">
                {column.tasks.length}
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0 dark:text-gray-300 dark:hover:bg-gray-700">
                    <MoreVertical className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="dark:bg-gray-800 dark:border-gray-700">
                  <DropdownMenuItem
                    onClick={() => onStartEditSection(column.id, column.title)}
                    className="text-sm dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    Edit Section
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-red-600 dark:text-red-400 text-sm dark:hover:bg-gray-700"
                    onClick={() => onDeleteSection(column.id)}
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
              snapshot.isDraggingOver ? "bg-gray-200/50 dark:bg-gray-700/50" : ""
            )}
          >
            {column.tasks.map((task, index) => (
              <TaskCard
                key={task.id}
                task={task}
                index={index}
                onTaskClick={onTaskClick}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>

      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="w-full mt-2 text-gray-600 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-200 h-7 text-xs dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600"
          >
            <Plus className="w-3 h-3 mr-1" />
            Add Task
          </Button>
        </DialogTrigger>
        <DialogContent className="dark:bg-gray-800 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="dark:text-gray-200">Add New Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-3">
            <Input
              placeholder="Task title"
              value={newTaskTitle}
              onChange={(e) => onNewTaskTitleChange(e.target.value)}
              className="text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
            />
            <Input
              placeholder="Task description (optional)"
              value={newTaskDescription}
              onChange={(e) => onNewTaskDescriptionChange(e.target.value)}
              className="text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
            />
            <Button
              className="w-full dark:bg-gray-700 dark:hover:bg-gray-600"
              onClick={() => onAddTask(column.id)}
            >
              Add Task
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 