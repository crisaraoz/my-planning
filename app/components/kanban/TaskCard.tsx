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
            "bg-white p-3 rounded-lg shadow mb-2 text-sm select-none cursor-pointer hover:shadow-md transition-shadow",
            snapshot.isDragging ? "opacity-75 shadow-lg ring-2 ring-gray-200" : ""
          )}
          style={provided.draggableProps.style}
        >
          <h4 className="font-medium mb-1">{task.title}</h4>
          {task.description && (
            <p className="text-xs text-gray-600 line-clamp-2">
              {task.description}
            </p>
          )}
        </div>
      )}
    </Draggable>
  );
} 