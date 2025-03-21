import { Task } from "@/app/types/kanban";
import { cn } from "@/lib/utils";
import { Draggable } from "@hello-pangea/dnd";

interface TaskCardProps {
  task: Task;
  index: number;
  onTaskClick: (task: Task) => void;
}

export function TaskCard({ task, index, onTaskClick }: TaskCardProps) {
  return (
    <Draggable key={task.id} draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onTaskClick(task)}
          className={cn(
            "bg-white dark:bg-gray-700 p-3 rounded-lg shadow mb-2 text-sm select-none cursor-pointer hover:shadow-md transition-shadow dark:text-gray-200",
            snapshot.isDragging ? "opacity-75 shadow-lg ring-2 ring-gray-200 dark:ring-gray-600" : ""
          )}
          style={provided.draggableProps.style}
        >
          {task.labels && task.labels.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {task.labels.map((label) => (
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
          <h4 className="font-medium mb-1">{task.title}</h4>
          {task.description && (
            <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
              {task.description}
            </p>
          )}
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