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
      <DialogContent className="sm:max-w-[425px] dark:bg-gray-800 dark:border-gray-700">
        <DialogHeader>
          <DialogTitle className="dark:text-gray-200">
            {isEditingTask ? "Edit Task" : "Task Details"}
          </DialogTitle>
        </DialogHeader>
        
        {isEditingTask ? (
          <div className="space-y-3 py-4">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium dark:text-gray-300">
                Title
              </label>
              <Input
                id="title"
                value={editingTask.title}
                onChange={(e) => onTaskChange("title", e.target.value)}
                className="text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
              />
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
            <h4 className="font-medium mb-2 dark:text-gray-200">{selectedTask?.title}</h4>
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