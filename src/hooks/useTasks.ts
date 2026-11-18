import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    createTask,
    deleteTask,
    subscribeToUserTasks,
    updateTask,
} from '../features/tasks/taskService';
import type { Task, TaskFilter, TaskFormValues } from '../types/task.types';

export function useTasks(userId: string | undefined) {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<TaskFilter>('all');

    useEffect(() => {
        if (!userId) {
            setTasks([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        const unsubscribe = subscribeToUserTasks(
            userId,
            (incomingTasks) => {
                setTasks(incomingTasks);
                setLoading(false);
            },
            () => {
                setError('No se pudieron cargar tus tareas. Verificá tu conexión o permisos.');
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [userId]);

    const addTask = useCallback(
        async (values: TaskFormValues) => {
            if (!userId) return;
            setError(null);
            try {
                await createTask(userId, values);
            } catch (err) {
                const message = err instanceof Error ? err.message : 'No se pudo crear la tarea.';
                setError(message);
                throw err;
            }
        },
        [userId]
    );

    const editTask = useCallback(async (taskId: string, values: TaskFormValues) => {
        setError(null);
        try {
            await updateTask(taskId, values);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'No se pudo actualizar la tarea.';
            setError(message);
            throw err;
        }
    }, []);

    const toggleTask = useCallback(async (task: Task) => {
        setError(null);
        try {
            await updateTask(task.id, { completed: !task.completed });
        } catch (err) {
            const message = err instanceof Error ? err.message : 'No se pudo cambiar el estado.';
            setError(message);
            throw err;
        }
    }, []);

    const removeTask = useCallback(async (taskId: string) => {
        setError(null);
        try {
            await deleteTask(taskId);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'No se pudo eliminar la tarea.';
            setError(message);
            throw err;
        }
    }, []);

    const filteredTasks = useMemo(() => {
        if (filter === 'pending') return tasks.filter((t) => !t.completed);
        if (filter === 'completed') return tasks.filter((t) => t.completed);
        return tasks;
    }, [tasks, filter]);

    const counts = useMemo(
        () => ({
            all: tasks.length,
            pending: tasks.filter((t) => !t.completed).length,
            completed: tasks.filter((t) => t.completed).length,
        }),
        [tasks]
    );

    return {
        tasks,
        filteredTasks,
        counts,
        filter,
        setFilter,
        loading,
        error,
        addTask,
        editTask,
        toggleTask,
        removeTask,
    };
}