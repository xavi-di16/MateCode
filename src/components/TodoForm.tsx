import { useState, type FormEvent } from 'react';
import type { TaskFormValues } from '../types/task.types';

interface TodoFormProps {
    onSubmit: (values: TaskFormValues) => Promise<void> | void;
}

export function TodoForm({ onSubmit }: TodoFormProps) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [validationError, setValidationError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!title.trim()) {
            setValidationError('El título es obligatorio.');
            return;
        }

        setValidationError(null);
        setSubmitting(true);
        try {
            await onSubmit({ title: title.trim(), description: description.trim() });
            setTitle('');
            setDescription('');
        } catch {
            // El error de red/Firestore se muestra en el contenedor padre
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="todo-form" noValidate>
            <h2>Nueva tarea</h2>

            {validationError && (
                <p className="alert-error" role="alert">
                    {validationError}
                </p>
            )}

            <div className="todo-form-fields">
                <label className="field">
                    <span>Título</span>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Ej: Revisar facturas del mes"
                        maxLength={100}
                        required
                    />
                </label>

                <label className="field">
                    <span>Descripción</span>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Detalles opcionales de la tarea..."
                        rows={2}
                        maxLength={300}
                    />
                </label>
            </div>

            <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? 'Guardando...' : 'Agregar tarea'}
            </button>
        </form>
    );
}