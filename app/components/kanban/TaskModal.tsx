import { Task } from "@/app/types/kanban";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface TaskModalProps {
  selectedTask: Task | null;
  isEditingTask: boolean;
  editingTask: {
    title: string;
    description: string;
  };
  onClose: () => void;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onTaskChange: (field: "title" | "description", value: string) => void;
}

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
  return (
    <Dialog open={selectedTask !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditingTask ? "Edit Task" : "Task Details"}
          </DialogTitle>
        </DialogHeader>
        
        {isEditingTask ? (
          <div className="space-y-3 py-4">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">
                Title
              </label>
              <Input
                id="title"
                value={editingTask.title}
                onChange={(e) => onTaskChange("title", e.target.value)}
                className="text-sm"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description
              </label>
              <Input
                id="description"
                value={editingTask.description}
                onChange={(e) => onTaskChange("description", e.target.value)}
                className="text-sm"
              />
            </div>
          </div>
        ) : (
          <div className="py-4">
            <h4 className="font-medium mb-2">{selectedTask?.title}</h4>
            {selectedTask?.description && (
              <p className="text-sm text-gray-600">
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
              >
                Cancel
              </Button>
              <Button type="button" onClick={onSave}>
                Save Changes
              </Button>
            </>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
              >
                Close
              </Button>
              <Button type="button" onClick={onEdit}>
                Edit Task
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 