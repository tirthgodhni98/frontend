export interface Task {
    id: string;
    title: string;
  }
  
  export interface TaskBoard {
    id: string;
    name: string;
    tasks: Task[];
  }
  