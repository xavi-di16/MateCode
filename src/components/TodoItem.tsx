import { useState, type FormEvent } from 'react';
import type { Task, TaskFormValues } from '../types/task.types';

interface TodoItemProps {
    task: Task;
    onToggle: (task: Task) => Promise<void> | void;
    onEdit: (taskId: string, values: TaskFormValues) => Promise<void> | void;
    onDelete: (taskId: string) => Promise<void> | void;
}

export function TodoItem({ task, onToggle, onEdit, onDelete }: TodoItemProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState(task.title);
    const [editDescription, setEditDescription] = useState(task.description);
    const [editError, setEditError] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);

    const handleSaveEdit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!editTitle.trim()) {
            setEditError('El título no puede quedar vacío.');
            return;
        }

        setEditError(null);
        setBusy(true);
        try {
            await onEdit(task.id, {
                title: editTitle.trim(),
                description: editDescription.trim(),
            });
            setIsEditing(false);
        } finally {
            setBusy(false);
        }
    };

    const handleCancelEdit = () => {
        setEditTitle(task.title);
        setEditDescription(task.description);
        setEditError(null);
        setIsEditing(false);
    };

    if (isEditing) {
        return (
            <li className="todo-item todo-item--editing">
                <form onSubmit={handleSaveEdit} className="todo-edit-form" noValidate>
                    {editError && (
                        <p className="alert-error" role="alert">
                            {editError}
                        </p>
                    )}
                    <input
                        type="text"
                        aria-label="Editar título"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                    />
                    <textarea
                        aria-label="Editar descripción"
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        rows={2}
                    />
                    <div className="todo-actions">
                        <button type="submit" className="btn-primary btn-sm" disabled={busy}>
                            Guardar
                        </button>
                        <button
                            type="button"
                            className="btn-secondary btn-sm"
                            onClick={handleCancelEdit}
                            disabled={busy}
                        >
                            Cancelar
                        </button>
                    </div>
                </form>
            </li>
        );
    }

    return (
        <li className={`todo-item ${task.completed ? 'todo-item--completed' : ''}`}>
            <div className="todo-main">
                <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => onToggle(task)}
                    aria-label={`Marcar "${task.title}" como ${task.completed ? 'pendiente' : 'completada'}`}
                />
                <div className="todo-content">
                    <h3 className="todo-title">{task.title}</h3>
                    {task.description && <p className="todo-description">{task.description}</p>}
                </div>
            </div>

            <div className="todo-actions">
                <button
                    type="button"
                    className="btn-secondary btn-sm"
                    onClick={() => setIsEditing(true)}
                >
                    Editar
                </button>
                <button
                    type="button"
                    className="btn-danger btn-sm"
                    onClick={() => onDelete(task.id)}
                >
                    Eliminar
                </button>
            </div>
        </li>
    );
}