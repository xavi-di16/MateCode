import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    onSnapshot,
    query,
    updateDoc,
    where,
    type Unsubscribe,
} from 'firebase/firestore';
import { db } from '../../services/firebase';
import type { Task, TaskFormValues } from '../../types/task.types';

const TASKS_COLLECTION = 'tasks';

export function subscribeToUserTasks(
    userId: string,
    onData: (tasks: Task[]) => void,
    onError: (error: Error) => void
): Unsubscribe {
    const tasksRef = collection(db, TASKS_COLLECTION);
    const userTasksQuery = query(tasksRef, where('userId', '==', userId));

    return onSnapshot(
        userTasksQuery,
        (snapshot) => {
            const tasks: Task[] = snapshot.docs.map((document) => {
                const data = document.data();
                return {
                    id: document.id,
                    userId: String(data.userId ?? ''),
                    title: String(data.title ?? ''),
                    description: String(data.description ?? ''),
                    completed: Boolean(data.completed),
                    createdAt: Number(data.createdAt ?? 0),
                    updatedAt: Number(data.updatedAt ?? 0),
                };
            });

            tasks.sort((a, b) => b.createdAt - a.createdAt);
            onData(tasks);
        },
        (error) => {
            onError(error);
        }
    );
}

export async function createTask(userId: string, values: TaskFormValues): Promise<void> {
    const trimmedTitle = values.title.trim();
    if (!trimmedTitle) {
        throw new Error('El título de la tarea no puede estar vacío.');
    }

    const now = Date.now();
    await addDoc(collection(db, TASKS_COLLECTION), {
        userId,
        title: trimmedTitle,
        description: values.description.trim(),
        completed: false,
        createdAt: now,
        updatedAt: now,
    });
}

export async function updateTask(
    taskId: string,
    updates: Partial<Pick<Task, 'title' | 'description' | 'completed'>>
): Promise<void> {
    const taskRef = doc(db, TASKS_COLLECTION, taskId);
    const payload: Record<string, string | boolean | number> = {
        updatedAt: Date.now(),
    };

    if (updates.title !== undefined) {
        const trimmedTitle = updates.title.trim();
        if (!trimmedTitle) {
            throw new Error('El título de la tarea no puede estar vacío.');
        }
        payload.title = trimmedTitle;
    }

    if (updates.description !== undefined) {
        payload.description = updates.description.trim();
    }

    if (updates.completed !== undefined) {
        payload.completed = updates.completed;
    }

    await updateDoc(taskRef, payload);
}

export async function deleteTask(taskId: string): Promise<void> {
    const taskRef = doc(db, TASKS_COLLECTION, taskId);
    await deleteDoc(taskRef);
}