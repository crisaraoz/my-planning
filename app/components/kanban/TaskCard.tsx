import { Task } from "@/app/types/kanban";
import { cn } from "@/lib/utils";
import { Draggable } from "@hello-pangea/dnd";
import { Check, Square, Trash2 } from "lucide-react";

interface TaskCardProps {
  task: Task;
  index: number;
  onTaskClick: (task: Task) => void;
  onToggleComplete?: (taskId: string) => void;
  onDeleteTask?: (taskId: string) => void;
  columnTitle?: string;
}

export function TaskCard({ task, index, onTaskClick, onToggleComplete, onDeleteTask, columnTitle }: TaskCardProps) {
  const handleToggleComplete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the card click
    if (onToggleComplete) {
      onToggleComplete(task.id);
    }
  };

  const handleDeleteTask = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the card click
    if (onDeleteTask) {
      onDeleteTask(task.id);
    }
  };

  const isCancelled = columnTitle === "Cancelled";

  return (
    <Draggable key={task.id} draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onTaskClick(task)}
          className={cn(
            "bg-white dark:bg-gray-700 p-3 rounded-lg shadow mb-2 text-sm select-none cursor-pointer hover:shadow-md transition-shadow dark:text-gray-200 group w-full",
            snapshot.isDragging ? "opacity-75 shadow-lg ring-2 ring-gray-200 dark:ring-gray-600" : "",
            task.completed && isCancelled ? "border-l-4 border-red-500" : 
            task.completed ? "border-l-4 border-blue-500" : ""
          )}
          style={provided.draggableProps.style}
        >
          <div className="flex items-start gap-2">
            <div 
              className="flex-shrink-0 mt-0.5 cursor-pointer" 
              onClick={handleToggleComplete}
            >
              {task.completed ? (
                <div className={cn(
                  "w-4 h-4 rounded-sm flex items-center justify-center",
                  isCancelled ? "bg-red-500" : "bg-blue-500"
                )}>
                  <Check className="w-3 h-3 text-white" />
                </div>
              ) : (
                <Square className="w-4 h-4 text-gray-400" />
              )}
            </div>
            
            <div className="flex-grow">
              {task.labels && task.labels.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2" style={{ flexDirection: 'row' }}>
                  {task.labels.map((label) => (
                    <span
                      key={label.id}
                      className="px-2 py-0.5 text-xs font-medium rounded-full inline-block"
                      style={{ 
                        backgroundColor: label.color, 
                        color: getContrastColor(label.color),
                        width: 'auto',
                        maxWidth: 'fit-content',
                        display: 'inline-block',
                        flexGrow: 0,
                        flexShrink: 0,
                        flexBasis: 'auto'
                      }}
                    >
                      {label.text}
                    </span>
                  ))}
                </div>
              )}
              <h4 className={cn(
                "font-medium mb-1",
                task.completed && "line-through text-gray-500 dark:text-gray-400"
              )}>
                {task.title}
              </h4>
              {task.description && (
                <p className="text-xs line-clamp-2 text-gray-600 dark:text-gray-400">
                  {task.description}
                </p>
              )}
            </div>

            <div 
              className="flex-shrink-0 mt-0.5 cursor-pointer text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" 
              onClick={handleDeleteTask}
            >
              <Trash2 className="w-4 h-4" />
            </div>
          </div>
        </div>
      )}
    </Draggable>
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