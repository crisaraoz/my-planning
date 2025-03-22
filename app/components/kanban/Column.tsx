import { Column as ColumnType, Label, Task } from "@/app/types/kanban";
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
import { Droppable, DraggableProvidedDragHandleProps } from "@hello-pangea/dnd";
import { MoreVertical, Plus, X, GripVertical, Loader2 } from "lucide-react";
import { TaskCard } from "./TaskCard";
import { useState } from "react";

// Opciones predefinidas de etiquetas (igual que en TaskModal)
const LABEL_OPTIONS = [
  { id: "backend", text: "Backend", color: "#FF9800" },
  { id: "frontend", text: "Frontend", color: "#03A9F4" },
  { id: "design", text: "Design", color: "#9C27B0" },
  { id: "bug", text: "Bug", color: "#F44336" },
  { id: "feature", text: "Feature", color: "#4CAF50" },
  { id: "documentation", text: "Docs", color: "#795548" },
];

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
  onAddTask: (columnId: string, labels?: Label[]) => void;
  onToggleTaskCompletion?: (taskId: string) => void;
  onDeleteTask?: (taskId: string) => void;
  newTaskTitle: string;
  newTaskDescription: string;
  onNewTaskTitleChange: (value: string) => void;
  onNewTaskDescriptionChange: (value: string) => void;
  dragHandleProps: DraggableProvidedDragHandleProps | null;
  isSaving?: boolean;
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
  onToggleTaskCompletion,
  onDeleteTask,
  newTaskTitle,
  newTaskDescription,
  onNewTaskTitleChange,
  onNewTaskDescriptionChange,
  dragHandleProps,
  isSaving = false,
}: ColumnProps) {
  const [selectedLabels, setSelectedLabels] = useState<Label[]>([]);
  const [showLabelSelector, setShowLabelSelector] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Función para añadir una etiqueta
  const addLabel = (label: Label) => {
    if (!selectedLabels.some(l => l.id === label.id)) {
      setSelectedLabels([...selectedLabels, label]);
    }
  };

  // Función para eliminar una etiqueta
  const removeLabel = (labelId: string) => {
    setSelectedLabels(selectedLabels.filter(label => label.id !== labelId));
  };

  // Función para manejar la adición de una tarea con etiquetas
  const handleAddTask = () => {
    onAddTask(column.id, selectedLabels.length > 0 ? selectedLabels : undefined);
    
    // No cerramos el diálogo aquí, lo dejamos para cuando la operación se complete
    if (!isSaving) {
      setSelectedLabels([]);
      setShowLabelSelector(false);
      setIsDialogOpen(false);
    }
  };

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
            <div className="flex items-center gap-2" {...dragHandleProps}>
              <GripVertical className="h-4 w-4 text-gray-500 dark:text-gray-400 cursor-grab" />
              <h3 className="font-semibold text-gray-700 dark:text-gray-300 text-sm">{column.title}</h3>
            </div>
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
                onToggleComplete={onToggleTaskCompletion}
                onDeleteTask={onDeleteTask}
                columnTitle={column.title}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="w-full mt-2 text-gray-600 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-200 h-7 text-xs dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600"
            onClick={() => setIsDialogOpen(true)}
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
              disabled={isSaving}
            />
            <Input
              placeholder="Task description (optional)"
              value={newTaskDescription}
              onChange={(e) => onNewTaskDescriptionChange(e.target.value)}
              className="text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
              disabled={isSaving}
            />
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium dark:text-gray-300">Labels</label>
                <Button 
                  type="button" 
                  size="sm" 
                  variant="ghost"
                  onClick={() => setShowLabelSelector(!showLabelSelector)}
                  className="h-6 px-2 text-xs dark:text-gray-300 dark:hover:bg-gray-700"
                  disabled={isSaving}
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add Label
                </Button>
              </div>
              
              {selectedLabels.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedLabels.map((label) => (
                    <div 
                      key={label.id} 
                      className="flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full"
                      style={{ backgroundColor: label.color, color: getContrastColor(label.color) }}
                    >
                      {label.text}
                      <button 
                        onClick={() => removeLabel(label.id)}
                        className="w-3 h-3 flex items-center justify-center rounded-full hover:bg-black/20"
                      >
                        <X className="w-2 h-2" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              {showLabelSelector && (
                <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-md">
                  <div className="grid grid-cols-2 gap-2">
                    {LABEL_OPTIONS.map((label) => (
                      <button
                        key={label.id}
                        onClick={() => addLabel(label)}
                        className="flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md hover:opacity-80"
                        style={{ backgroundColor: label.color, color: getContrastColor(label.color) }}
                      >
                        {label.text}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <Button
              className="w-full dark:bg-gray-700 dark:hover:bg-gray-600"
              onClick={handleAddTask}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Añadiendo...
                </>
              ) : "Añadir Tarea"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Función para determinar si se debe usar texto blanco o negro según el color de fondo
function getContrastColor(hexColor: string): string {
  // Eliminar el # si existe
  hexColor = hexColor.replace("#", "");
  
  // Convertir a RGB
  const r = parseInt(hexColor.substr(0, 2), 16);
  const g = parseInt(hexColor.substr(2, 2), 16);
  const b = parseInt(hexColor.substr(4, 2), 16);
  
  // Calcular el brillo (W3C)
  const brightness = (r * 0.299 + g * 0.587 + b * 0.114);
  
  // Si el brillo es mayor que 150, usar texto negro, sino usar texto blanco
  return brightness > 150 ? '#000000' : '#ffffff';
} 