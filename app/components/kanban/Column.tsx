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
    <div className="bg-gray-100 p-3 rounded-lg w-72 flex-shrink-0">
      <div className="flex justify-between items-center mb-3">
        {editingSectionId === column.id ? (
          <div className="flex gap-1 flex-1">
            <Input
              value={editingSectionTitle}
              onChange={(e) => onSectionTitleChange(e.target.value)}
              className="h-7 text-sm"
            />
            <Button
              size="sm"
              variant="ghost"
              onClick={onSaveSectionTitle}
              className="h-7 px-2"
            >
              Save
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={onCancelEditSection}
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
                    onClick={() => onStartEditSection(column.id, column.title)}
                    className="text-sm"
                  >
                    Edit Section
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-red-600 text-sm"
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
              snapshot.isDraggingOver ? "bg-gray-200/50" : ""
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
              onChange={(e) => onNewTaskTitleChange(e.target.value)}
              className="text-sm"
            />
            <Input
              placeholder="Task description (optional)"
              value={newTaskDescription}
              onChange={(e) => onNewTaskDescriptionChange(e.target.value)}
              className="text-sm"
            />
            <Button
              className="w-full"
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