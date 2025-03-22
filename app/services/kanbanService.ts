// Constantes
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

// Interfaces
interface Column {
  id: number;
  title: string;
  order: number;
  created_at: string;
  updated_at: string;
}

interface Label {
  id: number;
  text: string;
  color: string;
  created_at?: string;
  updated_at?: string;
}

interface Task {
  id: number;
  title: string;
  description?: string;
  completed: boolean;
  order: number;
  column_id: number;
  created_at: string;
  updated_at: string;
  labels?: Label[];
}

interface ColumnUpdate {
  title: string;
  order?: number;
}

interface LabelCreate {
  text: string;
  color: string;
}

interface TaskUpdate {
  title?: string;
  description?: string;
  completed?: boolean;
  order?: number;
  column_id?: number;
  labels?: LabelCreate[];
}

// Servicios del Kanban

/**
 * Obtiene todas las columnas del backend
 */
export const getColumns = async (): Promise<Column[]> => {
  try {
    const response = await fetch(`${API_URL}/columns`);
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching columns:', error);
    throw error;
  }
};

/**
 * Actualiza una columna existente
 */
export const updateColumn = async (columnId: number, data: ColumnUpdate): Promise<Column> => {
  try {
    const response = await fetch(`${API_URL}/columns/${columnId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error updating column ${columnId}:`, error);
    throw error;
  }
};

/**
 * Crea una nueva columna
 */
export const createColumn = async (data: ColumnUpdate): Promise<Column> => {
  try {
    const response = await fetch(`${API_URL}/columns`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating column:', error);
    throw error;
  }
};

/**
 * Elimina una columna existente
 */
export const deleteColumn = async (columnId: number): Promise<void> => {
  try {
    const response = await fetch(`${API_URL}/columns/${columnId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
  } catch (error) {
    console.error(`Error deleting column ${columnId}:`, error);
    throw error;
  }
};

/**
 * Obtiene todas las tareas, opcionalmente filtradas por column_id
 */
export const getTasks = async (columnId?: number): Promise<Task[]> => {
  try {
    const url = columnId 
      ? `${API_URL}/tasks?column_id=${columnId}` 
      : `${API_URL}/tasks`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching tasks:', error);
    throw error;
  }
};

/**
 * Crea una nueva tarea
 */
export const createTask = async (data: TaskUpdate): Promise<Task> => {
  try {
    const response = await fetch(`${API_URL}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
};

/**
 * Actualiza una tarea existente
 */
export const updateTask = async (taskId: number, data: TaskUpdate): Promise<Task> => {
  try {
    const response = await fetch(`${API_URL}/tasks/${taskId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error updating task ${taskId}:`, error);
    throw error;
  }
};

/**
 * Elimina una tarea existente
 */
export const deleteTask = async (taskId: number): Promise<void> => {
  try {
    const response = await fetch(`${API_URL}/tasks/${taskId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
  } catch (error) {
    console.error(`Error deleting task ${taskId}:`, error);
    throw error;
  }
};

/**
 * Obtiene todas las etiquetas de una tarea
 */
export const getTaskLabels = async (taskId: number): Promise<Label[]> => {
  try {
    const response = await fetch(`${API_URL}/tasks/${taskId}/labels`);
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching labels for task ${taskId}:`, error);
    throw error;
  }
};

/**
 * Asocia etiquetas a una tarea
 */
export const addLabelsToTask = async (taskId: number, labels: LabelCreate[]): Promise<void> => {
  try {
    const response = await fetch(`${API_URL}/tasks/${taskId}/labels`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ labels }),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
  } catch (error) {
    console.error(`Error adding labels to task ${taskId}:`, error);
    throw error;
  }
}; 