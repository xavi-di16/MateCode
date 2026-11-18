import { useState } from 'react';
import { TodoForm } from '../components/TodoForm';
import { TodoList } from '../components/TodoList';
import { useAuth } from '../hooks/useAuth';
import { useTasks } from '../hooks/useTasks';
import { sendTasksSummaryEmail } from '../services/emailService';
import type { TaskFilter } from '../types/task.types';

const FILTER_LABELS: { key: TaskFilter; label: string }[] = [
    { key: 'all', label: 'Todas' },
    { key: 'pending', label: 'Pendientes' },
    { key: 'completed', label: 'Completadas' },
];

type EmailStatus = 'idle' | 'loading' | 'success' | 'error';

export function TasksPage() {
    const { user, logout } = useAuth();
    const {
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
    } = useTasks(user?.uid);

    const [emailStatus, setEmailStatus] = useState<EmailStatus>('idle');
    const [emailMessage, setEmailMessage] = useState<string | null>(null);

    const handleSendSummary = async () => {
        if (!user?.email) return;

        setEmailStatus('loading');
        setEmailMessage(null);

        try {
            const response = await sendTasksSummaryEmail({
                toEmail: user.email,
                userName: user.displayName || user.email,
                tasks: tasks.map(({ title, completed }) => ({ title, completed })),
            });
            setEmailStatus('success');
            setEmailMessage(response.message);
        } catch (err) {
            setEmailStatus('error');
            setEmailMessage(
                err instanceof Error ? err.message : 'No se pudo enviar el resumen por email.'
            );
        }
    };

    return (
        <div className="app-shell">
            <header className="app-header">
                <div>
                    <h1>MateCode Tareas</h1>
                    <p className="user-badge">{user?.displayName || user?.email}</p>
                </div>

                <div className="header-actions">
                    <button
                        type="button"
                        className="btn-primary btn-sm"
                        onClick={handleSendSummary}
                        disabled={emailStatus === 'loading' || tasks.length === 0}
                    >
                        {emailStatus === 'loading' ? 'Enviando...' : 'Enviar resumen por email'}
                    </button>
                    <button type="button" className="btn-secondary btn-sm" onClick={logout}>
                        Cerrar sesión
                    </button>
                </div>
            </header>

            <main className="tasks-main">
                {error && (
                    <div className="alert-error" role="alert">
                        {error}
                    </div>
                )}

                {emailStatus === 'success' && emailMessage && (
                    <div className="alert-success" role="status">
                        {emailMessage}
                    </div>
                )}

                {emailStatus === 'error' && emailMessage && (
                    <div className="alert-error" role="alert">
                        {emailMessage}
                    </div>
                )}

                <TodoForm onSubmit={addTask} />

                <section className="tasks-panel" aria-label="Listado de tareas">
                    <div className="filter-bar" role="tablist" aria-label="Filtrar tareas">
                        {FILTER_LABELS.map(({ key, label }) => (
                            <button
                                key={key}
                                type="button"
                                role="tab"
                                aria-selected={filter === key}
                                className={`filter-btn ${filter === key ? 'filter-btn--active' : ''}`}
                                onClick={() => setFilter(key)}
                            >
                                {label} ({counts[key]})
                            </button>
                        ))}
                    </div>

                    <TodoList
                        tasks={filteredTasks}
                        loading={loading}
                        onToggle={toggleTask}
                        onEdit={editTask}
                        onDelete={removeTask}
                    />
                </section>
            </main>
        </div>
    );
}