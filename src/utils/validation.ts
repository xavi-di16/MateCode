import type { TaskFormValues } from '../types/task.types';

export const validEmail = (value: string): boolean =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

export function validateTask(values: TaskFormValues): string | null {
    if (!values.title.trim()) return 'El título es obligatorio.';

    if (values.title.trim().length > 100) {
        return 'El título admite hasta 100 caracteres.';
    }

    if (values.description.trim().length > 300) {
        return 'La descripción admite hasta 300 caracteres.';
    }

    return null;
}