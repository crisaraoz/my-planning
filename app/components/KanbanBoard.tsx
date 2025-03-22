"use client";

import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import { useState, useEffect } from "react";
import { Board, Column, Label, Task } from "../types/kanban";
import { Plus, Loader2 } from "lucide-react";
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
  getTaskLabels
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

  // Cargar datos iniciales desde el backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Obtenemos las columnas
        const columnsData = await getColumns();
        
        // Mapeamos las columnas para adaptarlas al formato de nuestro componente
        const formattedColumns = await Promise.all(columnsData.map(async (column) => {
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
      } catch (error) {
        console.error("Error al cargar datos iniciales:", error);
        toast.error("Error al cargar datos");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const onDragEnd = async (result: any) => {
    const { destination, source, type, draggableId } = result;

    if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) {
      return;
    }

    // Si estamos arrastrando columnas
    if (type === 'column') {
      const newColumns = Array.from(board.columns);
      const [movedColumn] = newColumns.splice(source.index, 1);
      newColumns.splice(destination.index, 0, movedColumn);

      setBoard({
        columns: newColumns
      });

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

    if (sourceColumnIndex === -1 || destColumnIndex === -1) return;

    const [movedTask] = newBoardData.columns[sourceColumnIndex].tasks.splice(source.index, 1);
    newBoardData.columns[destColumnIndex].tasks.splice(destination.index, 0, movedTask);

    // Actualizar el estado local
    setBoard(newBoardData);
    
    // Guardar el cambio en el backend sin mostrar indicador de carga
    try {
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
      await updateTaskService(taskId, {
        title: originalTask.title,
        description: originalTask.description || '',
        completed: originalTask.completed || false,
        column_id: destColumnId,
        order: destination.index
      });
      
      console.log('Tarea actualizada exitosamente');
    } catch (error) {
      console.error('Error al actualizar posición de tarea:', error);
      // No mostramos toast de error para no interrumpir la experiencia del usuario
    }
  };

  const addNewTask = async (columnId: string, labels?: Label[]) => {
    if (!newTaskTitle.trim()) return;

    try {
      setIsSaving(true);
      setActionInProgress('Añadiendo nueva tarea...');
      
      // Extraer el ID numérico de la sección
      const numericColumnId = parseInt(columnId.replace('section-', ''));
      
      if (isNaN(numericColumnId)) {
        console.error('ID de columna inválido:', columnId);
        toast.error('ID de columna inválido');
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

      toast.success('Tarea creada con éxito');
      
      // Limpiar los campos del formulario
      setNewTaskTitle("");
      setNewTaskDescription("");
    } catch (error) {
      console.error('Error al crear nueva tarea:', error);
      toast.error('Error al crear la tarea');
    } finally {
      setIsSaving(false);
      setActionInProgress(null);
    }
  };

  const addNewSection = () => {
    if (!newSectionTitle.trim()) return;

    const newSection: Column = {
      id: `section-${Date.now()}`,
      title: newSectionTitle,
      tasks: [],
    };

    setBoard({
      columns: [...board.columns, newSection],
    });

    setNewSectionTitle("");
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
      setActionInProgress('Actualizando tarea...');
      
      // Extraer el ID numérico de la tarea
      const taskId = parseInt(selectedTask.id.replace('task-', ''));
      
      if (isNaN(taskId)) {
        console.error('ID de tarea inválido:', selectedTask.id);
        toast.error('ID de tarea inválido');
        return;
      }
      
      // Encontrar la columna que contiene esta tarea
      const columnInfo = board.columns.find(col => 
        col.tasks.some(t => t.id === selectedTask.id)
      );
      
      if (!columnInfo) {
        console.error('No se encontró la columna para la tarea');
        toast.error('Error al actualizar la tarea');
        return;
      }
      
      // Extraer el ID numérico de la columna
      const columnId = parseInt(columnInfo.id.replace('section-', ''));
      
      if (isNaN(columnId)) {
        console.error('ID de columna inválido:', columnInfo.id);
        toast.error('ID de columna inválido');
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
      toast.success('Tarea actualizada con éxito');
    } catch (error) {
      console.error('Error al actualizar tarea:', error);
      toast.error('Error al actualizar la tarea');
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
        
        console.log('Estado de completado actualizado exitosamente');
      } catch (error) {
        console.error('Error al actualizar estado de completado:', error);
        // No mostramos toast de error para no interrumpir la experiencia del usuario
      }
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      setIsDeleting(true);
      setActionInProgress(`Eliminando tarea...`);
      
      // Extraer el ID numérico de la cadena 'task-123'
      const numericId = parseInt(taskId.replace('task-', ''));
      
      if (isNaN(numericId)) {
        console.error('ID de tarea inválido:', taskId);
        toast.error('ID de tarea inválido');
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
        toast.success('Tarea eliminada con éxito');
        
        // Si esta es la tarea seleccionada actualmente, cerrar el modal
        if (selectedTask && selectedTask.id === taskId) {
          setSelectedTask(null);
          setEditingTask({ title: "", description: "", labels: [], completed: false });
          setIsEditingTask(false);
        }
      }
    } catch (error) {
      console.error('Error al eliminar la tarea:', error);
      toast.error('Error al eliminar la tarea');
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
      setActionInProgress('Actualizando sección...');
      
      // Convertir el ID de string a number para la API
      const columnId = parseInt(id.replace('section-', ''));
      
      if (isNaN(columnId)) {
        console.error('Invalid column ID format');
        toast.error('Formato de ID de columna inválido');
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
      
      toast.success("Sección actualizada con éxito");
    } catch (error) {
      console.error("Error al actualizar sección:", error);
      toast.error("Error al actualizar sección");
      
      // Revertir cambios locales en caso de error
      setEditingSectionTitle("");
    } finally {
      setEditingSectionId(null);
      setActionInProgress(null);
    }
  };

  return (
    <>
      {loading ? (
        <div className="flex justify-center items-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-2">Cargando tablero...</span>
        </div>
      ) : (
        <>
          {actionInProgress && (
            <div className="fixed top-0 left-0 right-0 bg-primary/90 text-white py-2 px-4 flex items-center justify-center z-50">
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
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
                            onDeleteSection={(id) => {
                              setBoard({
                                columns: board.columns.filter((col) => col.id !== id),
                              });
                            }}
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
                        <Button onClick={addNewSection} className="h-7 w-7 p-0 dark:bg-gray-700">
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
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
              <DialogTitle className="dark:text-gray-200">Confirmar Eliminación</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                ¿Estás seguro de que deseas eliminar esta tarea? Esta acción no se puede deshacer.
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
                Cancelar
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
                    <Loader2 className="w-4 h-4 animate-spin mr-2" /> 
                    Eliminando...
                  </>
                ) : 'Eliminar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default KanbanBoard;