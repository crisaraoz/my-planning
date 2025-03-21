import { useState } from "react";
import { Label, Task } from "@/app/types/kanban";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { X, Plus, Check, Square } from "lucide-react";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";

interface TaskModalProps {
  selectedTask: Task | null;
  isEditingTask: boolean;
  editingTask: {
    title: string;
    description: string;
    labels?: Label[];
    completed?: boolean;
  };
  onClose: () => void;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onTaskChange: (field: "title" | "description" | "labels" | "completed", value: any) => void;
}

// Opciones predefinidas de etiquetas
const LABEL_OPTIONS = [
  { id: "backend", text: "Backend", color: "#FF9800" },
  { id: "frontend", text: "Frontend", color: "#03A9F4" },
  { id: "design", text: "Design", color: "#9C27B0" },
  { id: "bug", text: "Bug", color: "#F44336" },
  { id: "feature", text: "Feature", color: "#4CAF50" },
  { id: "documentation", text: "Docs", color: "#795548" },
];

export function TaskModal({
  selectedTask,
  isEditingTask,
  editingTask,
  onClose,
  onEdit,
  onSave,
  onCancel,
  onTaskChange,
}: TaskModalProps) {
  const [showLabelSelector, setShowLabelSelector] = useState(false);

  // Función para añadir una etiqueta
  const addLabel = (label: Label) => {
    const currentLabels = editingTask.labels || [];
    // Comprobar si la etiqueta ya existe
    if (!currentLabels.some(l => l.id === label.id)) {
      const newLabels = [...currentLabels, label];
      onTaskChange("labels", newLabels);
    }
    setShowLabelSelector(false);
  };

  // Función para eliminar una etiqueta
  const removeLabel = (labelId: string) => {
    const currentLabels = editingTask.labels || [];
    const newLabels = currentLabels.filter(label => label.id !== labelId);
    onTaskChange("labels", newLabels);
  };

  return (
    <Dialog open={selectedTask !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px] dark:bg-gray-800 dark:border-gray-700">
        <DialogHeader>
          <DialogTitle className="dark:text-gray-200">
            {isEditingTask ? "Edit Task" : "Task Details"}
          </DialogTitle>
        </DialogHeader>
        
        {isEditingTask ? (
          <div className="space-y-3 py-4">
            <div className="flex items-center gap-3 mb-2">
              <div 
                className="flex items-center cursor-pointer" 
                onClick={() => onTaskChange("completed", !editingTask.completed)}
              >
                {editingTask.completed ? (
                  <div className="w-4 h-4 rounded-sm bg-blue-500 flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                ) : (
                  <Square className="w-4 h-4 text-gray-400" />
                )}
                <span className="ml-2 text-sm dark:text-gray-300">Mark as completed</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium dark:text-gray-300">
                Title
              </label>
              <Input
                id="title"
                value={editingTask.title}
                onChange={(e) => onTaskChange("title", e.target.value)}
                className={cn(
                  "text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200",
                  editingTask.completed && "line-through text-gray-500 dark:text-gray-400"
                )}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium dark:text-gray-300">Labels</label>
                <Button 
                  type="button" 
                  size="sm" 
                  variant="ghost"
                  onClick={() => setShowLabelSelector(!showLabelSelector)}
                  className="h-6 px-2 text-xs dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add Label
                </Button>
              </div>
              
              {editingTask.labels && editingTask.labels.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {editingTask.labels.map((label) => (
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
            
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium dark:text-gray-300">
                Description
              </label>
              <Input
                id="description"
                value={editingTask.description}
                onChange={(e) => onTaskChange("description", e.target.value)}
                className="text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
              />
            </div>
          </div>
        ) : (
          <div className="py-4">
            <div className="flex items-center gap-3 mb-3">
              {selectedTask?.completed ? (
                <div className="w-4 h-4 rounded-sm bg-blue-500 flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              ) : (
                <Square className="w-4 h-4 text-gray-400" />
              )}
              <span className="text-sm dark:text-gray-300">
                {selectedTask?.completed ? "Completed" : "Not completed"}
              </span>
            </div>
            
            {selectedTask?.labels && selectedTask.labels.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {selectedTask.labels.map((label) => (
                  <span
                    key={label.id}
                    className="px-2 py-0.5 text-xs font-medium rounded-full"
                    style={{ backgroundColor: label.color, color: getContrastColor(label.color) }}
                  >
                    {label.text}
                  </span>
                ))}
              </div>
            )}
            <h4 className={cn(
              "font-medium mb-2 dark:text-gray-200",
              selectedTask?.completed && "line-through text-gray-500 dark:text-gray-400"
            )}>
              {selectedTask?.title}
            </h4>
            {selectedTask?.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {selectedTask.description}
              </p>
            )}
          </div>
        )}

        <DialogFooter className="flex gap-2">
          {isEditingTask ? (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-600"
              >
                Cancel
              </Button>
              <Button 
                type="button" 
                onClick={onSave}
                className="dark:bg-gray-700 dark:hover:bg-gray-600"
              >
                Save Changes
              </Button>
            </>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-600"
              >
                Close
              </Button>
              <Button 
                type="button" 
                onClick={onEdit}
                className="dark:bg-gray-700 dark:hover:bg-gray-600"
              >
                Edit Task
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
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