import type { Task, TaskFormValues } from '../types/task.types';
import { TodoItem } from './TodoItem';

interface TodoListProps {
    tasks: Task[];
    loading: boolean;
    onToggle: (task: Task) => Promise<void> | void;
    onEdit: (taskId: string, values: TaskFormValues) => Promise<void> | void;
    onDelete: (taskId: string) => Promise<void> | void;
}

export function TodoList({ tasks, loading, onToggle, onEdit, onDelete }: TodoListProps) {
    if (loading) {
        return (
            <p className="status-message" role="status">
                Cargando tareas...
            </p>
        );
    }

    if (tasks.length === 0) {
        return (
            <p className="status-message">
                No hay tareas para mostrar en esta vista.
            </p>
        );
    }

    return (
        <ul className="todo-list">
            {tasks.map((task) => (
                <TodoItem
                    key={task.id}
                    task={task}
                    onToggle={onToggle}
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
            ))}
        </ul>
    );
}