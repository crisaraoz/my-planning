"use client";

import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import { useState, useEffect } from "react";
import { Board, Column, Label, Task } from "../types/kanban";
import { Plus, Loader2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Column as ColumnComponent } from "./kanban/Column";
import { TaskModal } from "./kanban/TaskModal";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { 
  updateColumn, 
  getColumns, 
  getTasks, 
  deleteTask as deleteTaskService, 
  createTask, 
  updateTask as updateTaskService,
  addLabelsToTask,
  getTaskLabels,
  deleteColumn,
  createColumn
} from "../services/kanbanService";
import { toast } from "sonner";

const KanbanBoard = () => {
  const [board, setBoard] = useState<Board>({ columns: [] });
  const [loading, setLoading] = useState(true);
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
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [sectionToDelete, setSectionToDelete] = useState<string | null>(null);
  const [showDeleteSectionConfirmation, setShowDeleteSectionConfirmation] = useState(false);
  const [isDeletingSection, setIsDeletingSection] = useState(false);

  // Función para cargar los datos del backend
  const fetchBoardData = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      
      // Obtenemos las columnas
      const columnsData = await getColumns();
      
      // Ordenamos las columnas según el campo 'order'
      const sortedColumns = [...columnsData].sort((a, b) => a.order - b.order);
      
      // Mapeamos las columnas para adaptarlas al formato de nuestro componente
      const formattedColumns = await Promise.all(sortedColumns.map(async (column) => {
        // Para cada columna, obtenemos sus tareas asociadas
        const tasksData = await getTasks(column.id);
        
        // Mapeamos las tareas para adaptarlas al formato de nuestro componente
        const formattedTasks = await Promise.all(tasksData.map(async task => {
          // Obtener las etiquetas de esta tarea
          let taskLabels: Label[] = [];
          try {
            const labelData = await getTaskLabels(task.id);
            // Convertir al formato de etiquetas de nuestro componente
            taskLabels = labelData.map(label => ({
              id: `label-${label.id}`,
              text: label.text,
              color: label.color
            }));
          } catch (error) {
            console.error(`Error al obtener etiquetas para tarea ${task.id}:`, error);
            // Si hay error, continuamos con una lista vacía de etiquetas
          }
          
          return {
            id: `task-${task.id}`,
            title: task.title,
            description: task.description || '',
            completed: task.completed,
            labels: taskLabels
          };
        }));
        
        // Retornamos la columna formateada
        return {
          id: `section-${column.id}`,
          title: column.title,
          tasks: formattedTasks
        };
      }));
      
      // Actualizamos el estado con los datos obtenidos
      setBoard({ columns: formattedColumns });
      return true;
    } catch (error) {
      console.error("Error al cargar datos:", error);
      toast.error("Error loading data");
      return false;
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  // Cargar datos iniciales desde el backend
  useEffect(() => {
    fetchBoardData();
  }, []);

  const onDragEnd = async (result: any) => {
    const { destination, source, type, draggableId } = result;

    if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) {
      return;
    }

    try {
      // Si estamos arrastrando columnas
      if (type === 'column') {
        const newColumns = Array.from(board.columns);
        const [movedColumn] = newColumns.splice(source.index, 1);
        newColumns.splice(destination.index, 0, movedColumn);

        // Actualizar el estado local
        setBoard({
          columns: newColumns
        });
        
        // Actualizar la posición de TODAS las columnas en el backend para asegurar consistencia
        const updatePromises = newColumns.map(async (column, index) => {
          // Extraer el ID numérico de la columna
          const columnId = parseInt(column.id.replace('section-', ''));
          
          if (isNaN(columnId)) {
            console.error('Invalid column ID:', column.id);
            return null;
          }
          
          try {
            // Actualizar la columna en el backend con su nuevo índice como order
            return await updateColumn(columnId, {
              title: column.title,
              order: index
            });
          } catch (error) {
            console.error(`Error updating column ${columnId}:`, error);
            return null;
          }
        });
        
        // Esperar a que todas las actualizaciones de columnas terminen
        await Promise.all(updatePromises);
        console.log('All section positions updated successfully');

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

      if (sourceColumnIndex === -1 || destColumnIndex === -1) {
        console.error('No se encontró columna de origen o destino');
        return;
      }

      const [movedTask] = newBoardData.columns[sourceColumnIndex].tasks.splice(source.index, 1);
      newBoardData.columns[destColumnIndex].tasks.splice(destination.index, 0, movedTask);

      // Si el destino es la columna "Done" o "Cancelled", marcar la tarea como completada automáticamente
      const destinationColumnTitle = newBoardData.columns[destColumnIndex].title;
      if (destinationColumnTitle === "Done" || destinationColumnTitle === "Cancelled") {
        movedTask.completed = true;
      } else {
        // Si el destino NO es "Done" o "Cancelled", desmarcar la tarea como no completada
        movedTask.completed = false;
      }

      // Actualizar el estado local inmediatamente
      setBoard(newBoardData);
      
      // Extraer el ID numérico de la tarea
      const taskId = parseInt(draggableId.replace('task-', ''));
      
      if (isNaN(taskId)) {
        console.error('ID de tarea inválido:', draggableId);
        return;
      }
      
      // Extraer el ID numérico de la columna destino
      const destColumnId = parseInt(destination.droppableId.replace('section-', ''));
      
      if (isNaN(destColumnId)) {
        console.error('ID de columna inválido:', destination.droppableId);
        return;
      }
      
      // Encontrar la tarea original completa
      const originalTask = movedTask;
      
      // Llamar al servicio para actualizar la tarea en el backend con todos los campos requeridos
      const response = await updateTaskService(taskId, {
        title: originalTask.title,
        description: originalTask.description || '',
        completed: originalTask.completed,
        column_id: destColumnId,
        order: destination.index
      });
      
      console.log('Tarea actualizada exitosamente', response);
    } catch (error) {
      console.error('Error en onDragEnd:', error);
      // Mostrar un toast de error para informar al usuario
      toast.error('Error al actualizar la tarea. Intente de nuevo.');
      
      // Recargar el tablero para restaurar el estado correcto
      fetchBoardData();
    }
  };

  const addNewTask = async (columnId: string, labels?: Label[]) => {
    if (!newTaskTitle.trim()) return;

    try {
      setIsSaving(true);
      setActionInProgress('Adding new task...');
      
      // Extraer el ID numérico de la sección
      const numericColumnId = parseInt(columnId.replace('section-', ''));
      
      if (isNaN(numericColumnId)) {
        console.error('ID de columna inválido:', columnId);
        toast.error('Invalid column ID');
        return;
      }
      
      // Llamar al servicio para crear una nueva tarea en el backend
      const createdTask = await createTask({
        title: newTaskTitle,
        description: newTaskDescription,
        column_id: numericColumnId,
        order: board.columns.find(col => col.id === columnId)?.tasks.length || 0
      });
      
      // Si hay etiquetas, asociarlas a la tarea creada
      if (labels && labels.length > 0) {
        // Transformar las etiquetas al formato esperado por el backend
        const labelPayload = labels.map(label => ({
          text: label.text,
          color: label.color
        }));

        await addLabelsToTask(createdTask.id, labelPayload);
      }
      
      // Crear el objeto de tarea para actualizar el estado local
      const newTask: Task = {
        id: `task-${createdTask.id}`,
        title: newTaskTitle,
        description: newTaskDescription,
        labels: labels || [],
        completed: false
      };

      // Actualizar el estado local con la nueva tarea
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

      toast.success('Task created successfully');
      
      // Limpiar los campos del formulario
      setNewTaskTitle("");
      setNewTaskDescription("");
    } catch (error) {
      console.error('Error al crear nueva tarea:', error);
      toast.error('Error creating task');
    } finally {
      setIsSaving(false);
      setActionInProgress(null);
    }
  };

  const addNewSection = async () => {
    if (!newSectionTitle.trim()) return;

    try {
      setActionInProgress('Adding new section...');
      
      // Llamar al servicio para crear una nueva columna en el backend
      const createdColumn = await createColumn({
        title: newSectionTitle,
        order: board.columns.length
      });
      
      // Crear el objeto de sección para actualizar el estado local
      const newSection: Column = {
        id: `section-${createdColumn.id}`,
        title: newSectionTitle,
        tasks: [],
      };

      // Actualizar el estado local
      setBoard({
        columns: [...board.columns, newSection],
      });

      setNewSectionTitle("");
      toast.success('Section created successfully');
    } catch (error) {
      console.error('Error al crear nueva sección:', error);
      toast.error('Error creating section');
    } finally {
      setActionInProgress(null);
    }
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

  const updateTask = async () => {
    if (!selectedTask || !editingTask.title.trim()) return;

    try {
      setIsSaving(true);
      setActionInProgress('Updating task...');
      
      // Extraer el ID numérico de la tarea
      const taskId = parseInt(selectedTask.id.replace('task-', ''));
      
      if (isNaN(taskId)) {
        console.error('ID de tarea inválido:', selectedTask.id);
        toast.error('Invalid task ID');
        return;
      }
      
      // Encontrar la columna que contiene esta tarea
      const columnInfo = board.columns.find(col => 
        col.tasks.some(t => t.id === selectedTask.id)
      );
      
      if (!columnInfo) {
        console.error('No se encontró la columna para la tarea');
        toast.error('Error updating task');
        return;
      }
      
      // Extraer el ID numérico de la columna
      const columnId = parseInt(columnInfo.id.replace('section-', ''));
      
      if (isNaN(columnId)) {
        console.error('ID de columna inválido:', columnInfo.id);
        toast.error('Invalid column ID');
        return;
      }
      
      // Llamar al servicio para actualizar la tarea en el backend
      await updateTaskService(taskId, {
        title: editingTask.title,
        description: editingTask.description,
        completed: editingTask.completed,
        column_id: columnId
      });
      
      // Siempre actualizar las etiquetas, incluso si la matriz está vacía
      // Esto permite eliminar etiquetas
      const labelPayload = (editingTask.labels || []).map(label => ({
        text: label.text,
        color: label.color
      }));
      
      // Llamar al servicio para actualizar las etiquetas de la tarea
      await addLabelsToTask(taskId, labelPayload);
      
      // Actualizar el estado local después de una actualización exitosa
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
        labels: editingTask.labels || [],
        completed: editingTask.completed,
      };

      setBoard(newBoardData);
      toast.success('Task updated successfully');
    } catch (error) {
      console.error('Error al actualizar tarea:', error);
      toast.error('Error updating task');
    } finally {
      setIsSaving(false);
      setIsEditingTask(false);
      setSelectedTask(null);
      setActionInProgress(null);
    }
  };

  const handleTaskClose = () => {
    setSelectedTask(null);
    setEditingTask({ title: "", description: "", labels: [], completed: false });
    setIsEditingTask(false);
  };

  const handleTaskChange = (field: "title" | "description" | "labels" | "completed", value: any) => {
    setEditingTask(prev => ({ ...prev, [field]: value }));
  };

  const toggleTaskCompletion = async (taskId: string) => {
    // Actualizar el estado local
    const newBoardData = JSON.parse(JSON.stringify(board));
    let updatedTask = null;
    let columnId = null;
    
    // Buscar la tarea y actualizar su estado localmente
    for (const column of newBoardData.columns) {
      const taskIndex = column.tasks.findIndex((t: Task) => t.id === taskId);
      if (taskIndex !== -1) {
        // Guardar una referencia a la tarea antes de actualizarla
        updatedTask = {...column.tasks[taskIndex]};
        // Invertir el estado de completado
        column.tasks[taskIndex].completed = !column.tasks[taskIndex].completed;
        // Actualizar la referencia de la tarea con el nuevo valor
        updatedTask.completed = column.tasks[taskIndex].completed;
        // Guardar el ID de la columna
        columnId = column.id;
        // Actualizar el estado local
        setBoard(newBoardData);
        
        // Si esta es la tarea seleccionada actualmente, actualizar también el estado de edición
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
    
    // Si encontramos y actualizamos la tarea, enviar los cambios al backend
    if (updatedTask && columnId) {
      try {
        // Extraer el ID numérico de la tarea
        const numericTaskId = parseInt(taskId.replace('task-', ''));
        
        if (isNaN(numericTaskId)) {
          console.error('ID de tarea inválido:', taskId);
          return;
        }
        
        // Extraer el ID numérico de la columna
        const numericColumnId = parseInt(columnId.replace('section-', ''));
        
        if (isNaN(numericColumnId)) {
          console.error('ID de columna inválido:', columnId);
          return;
        }
        
        // Llamar al servicio para actualizar la tarea en el backend con todos los campos requeridos
        await updateTaskService(numericTaskId, {
          title: updatedTask.title,
          description: updatedTask.description || '',
          completed: updatedTask.completed,
          column_id: numericColumnId
        });
        
        console.log('Completion status updated successfully');
      } catch (error) {
        console.error('Error al actualizar estado de completado:', error);
        // No mostramos toast de error para no interrumpir la experiencia del usuario
      }
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      setIsDeleting(true);
      setActionInProgress(`Deleting task...`);
      
      // Extraer el ID numérico de la cadena 'task-123'
      const numericId = parseInt(taskId.replace('task-', ''));
      
      if (isNaN(numericId)) {
        console.error('ID de tarea inválido:', taskId);
        toast.error('Invalid task ID');
        return;
      }
      
      // Llamar al servicio backend para eliminar la tarea
      await deleteTaskService(numericId);
      
      // Actualizar el estado local
      const newBoardData = JSON.parse(JSON.stringify(board));
      let taskDeleted = false;
      
      for (const column of newBoardData.columns) {
        const taskIndex = column.tasks.findIndex((t: Task) => t.id === taskId);
        if (taskIndex !== -1) {
          column.tasks.splice(taskIndex, 1);
          taskDeleted = true;
          break;
        }
      }
      
      if (taskDeleted) {
        setBoard(newBoardData);
        toast.success('Task deleted successfully');
        
        // Si esta es la tarea seleccionada actualmente, cerrar el modal
        if (selectedTask && selectedTask.id === taskId) {
          setSelectedTask(null);
          setEditingTask({ title: "", description: "", labels: [], completed: false });
          setIsEditingTask(false);
        }
      }
    } catch (error) {
      console.error('Error al eliminar la tarea:', error);
      toast.error('Error deleting task');
    } finally {
      setIsDeleting(false);
      setTaskToDelete(null);
      setShowDeleteConfirmation(false);
      setActionInProgress(null);
    }
  };

  const confirmDeleteTask = (taskId: string) => {
    setTaskToDelete(taskId);
    setShowDeleteConfirmation(true);
  };

  const cancelDeleteTask = () => {
    setTaskToDelete(null);
    setShowDeleteConfirmation(false);
  };

  const onSaveSectionTitle = async (id: string, title: string) => {
    if (!id || !title.trim()) return;
    
    try {
      setActionInProgress('Updating section...');
      
      // Convertir el ID de string a number para la API
      const columnId = parseInt(id.replace('section-', ''));
      
      if (isNaN(columnId)) {
        console.error('Invalid column ID format');
        toast.error('Invalid column ID format');
        return;
      }
      
      // Intenta actualizar la columna en el backend
      await updateColumn(columnId, { title });
      
      // Si la actualización en el backend es exitosa, actualiza el estado local
      setBoard({
        columns: board.columns.map((col) => {
          if (col.id === id) {
            return { ...col, title: title };
          }
          return col;
        }),
      });
      
      toast.success("Section updated successfully");
    } catch (error) {
      console.error("Error al actualizar sección:", error);
      toast.error("Error updating section");
      
      // Revertir cambios locales en caso de error
      setEditingSectionTitle("");
    } finally {
      setEditingSectionId(null);
      setActionInProgress(null);
    }
  };

  const confirmDeleteSection = (sectionId: string) => {
    setSectionToDelete(sectionId);
    setShowDeleteSectionConfirmation(true);
  };

  const cancelDeleteSection = () => {
    setSectionToDelete(null);
    setShowDeleteSectionConfirmation(false);
  };

  const deleteSection = async (sectionId: string) => {
    try {
      setIsDeletingSection(true);
      setActionInProgress('Deleting section...');
      
      // Extraer el ID numérico de la cadena 'section-123'
      const numericId = parseInt(sectionId.replace('section-', ''));
      
      if (isNaN(numericId)) {
        console.error('ID de sección inválido:', sectionId);
        toast.error('Invalid section ID');
        return;
      }
      
      // Llamar al servicio backend para eliminar la sección
      await deleteColumn(numericId);
      
      // Actualizar el estado local
      setBoard({
        columns: board.columns.filter((col) => col.id !== sectionId),
      });
      
      toast.success('Section deleted successfully');
    } catch (error) {
      console.error('Error al eliminar la sección:', error);
      toast.error('Error deleting section');
    } finally {
      setIsDeletingSection(false);
      setSectionToDelete(null);
      setShowDeleteSectionConfirmation(false);
      setActionInProgress(null);
    }
  };

  return (
    <>
      {loading ? (
        <div className="flex flex-col justify-center items-center h-96">
          <div className="relative">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
            <Zap className="w-5 h-5 text-yellow-400 absolute top-0 right-0 animate-pulse" />
            <Zap className="w-5 h-5 text-blue-400 absolute bottom-0 left-0 animate-pulse" />
          </div>
          <span className="mt-4 text-base font-medium text-primary">Loading your tasks...</span>
        </div>
      ) : (
        <>
          {actionInProgress && (
            <div className="fixed top-0 left-0 right-0 bg-primary/90 text-white py-2 px-4 flex items-center justify-center z-50">
              <div className="relative">
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                <Zap className="w-3 h-3 text-yellow-300 absolute -top-1 -right-1 animate-bounce" />
              </div>
              <span>{actionInProgress}</span>
            </div>
          )}
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
                            onSaveSectionTitle={() => onSaveSectionTitle(editingSectionId!, editingSectionTitle)}
                            onCancelEditSection={() => setEditingSectionId(null)}
                            onStartEditSection={(id, title) => {
                              setEditingSectionId(id);
                              setEditingSectionTitle(title);
                            }}
                            onDeleteSection={confirmDeleteSection}
                            onTaskClick={handleTaskClick}
                            onToggleTaskCompletion={toggleTaskCompletion}
                            onDeleteTask={confirmDeleteTask}
                            onAddTask={addNewTask}
                            newTaskTitle={newTaskTitle}
                            newTaskDescription={newTaskDescription}
                            onNewTaskTitleChange={(value) => setNewTaskTitle(value)}
                            onNewTaskDescriptionChange={(value) => setNewTaskDescription(value)}
                            dragHandleProps={provided.dragHandleProps}
                            isSaving={isSaving}
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
                        <Button 
                          onClick={addNewSection} 
                          className={`h-7 w-7 p-0 ${
                            newSectionTitle.length < 3 
                              ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed opacity-50' 
                              : 'dark:bg-gray-700 hover:bg-primary/90'
                          }`}
                          disabled={newSectionTitle.length < 3}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                      {newSectionTitle.length > 0 && newSectionTitle.length < 3 && (
                        <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">Section name must be at least 3 characters</p>
                      )}
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
              onCancel={() => {
                setIsEditingTask(false);
                setSelectedTask(null);
              }}
              onTaskChange={handleTaskChange}
              onDeleteTask={confirmDeleteTask}
              isSaving={isSaving}
            />
          </DragDropContext>
        </>
      )}

      {showDeleteConfirmation && (
        <Dialog open={showDeleteConfirmation} onOpenChange={setShowDeleteConfirmation}>
          <DialogContent className="sm:max-w-[400px] dark:bg-gray-800 dark:border-gray-700">
            <DialogHeader>
              <DialogTitle className="dark:text-gray-200">Confirm Deletion</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Are you sure you want to delete this task? This action cannot be undone.
              </p>
            </div>
            <DialogFooter className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setTaskToDelete(null);
                  setShowDeleteConfirmation(false);
                }}
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-600"
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button 
                type="button" 
                onClick={() => taskToDelete && deleteTask(taskToDelete)}
                variant="destructive"
                className="bg-red-600 hover:bg-red-700 text-white"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <div className="relative">
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      <Zap className="w-2 h-2 text-red-300 absolute -top-1 -right-1 animate-bounce" />
                    </div>
                    Deleting...
                  </>
                ) : 'Delete'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {showDeleteSectionConfirmation && (
        <Dialog open={showDeleteSectionConfirmation} onOpenChange={setShowDeleteSectionConfirmation}>
          <DialogContent className="sm:max-w-[400px] dark:bg-gray-800 dark:border-gray-700">
            <DialogHeader>
              <DialogTitle className="dark:text-gray-200">Confirm Section Deletion</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Are you sure you want to delete this section? All tasks in this section will also be deleted. This action cannot be undone.
              </p>
            </div>
            <DialogFooter className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={cancelDeleteSection}
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-600"
                disabled={isDeletingSection}
              >
                Cancel
              </Button>
              <Button 
                type="button" 
                onClick={() => sectionToDelete && deleteSection(sectionToDelete)}
                variant="destructive"
                className="bg-red-600 hover:bg-red-700 text-white"
                disabled={isDeletingSection}
              >
                {isDeletingSection ? (
                  <>
                    <div className="relative">
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      <Zap className="w-2 h-2 text-red-300 absolute -top-1 -right-1 animate-bounce" />
                    </div>
                    Deleting...
                  </>
                ) : 'Delete'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default KanbanBoard;