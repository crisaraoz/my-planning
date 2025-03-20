export interface Task {
  id: string;
  title: string;
  description?: string;
  assignee?: {
    name: string;
    avatar: string;
  };
}

export interface Column {
  id: string;
  title: string;
  tasks: Task[];
}

export interface Board {
  columns: Column[];
}