import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function RegisterPage() {
    const { register, loginWithGoogle, error, clearError } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [validationError, setValidationError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const validate = (): boolean => {
        if (!email.trim() || !email.includes('@')) {
            setValidationError('Ingresá un correo electrónico válido.');
            return false;
        }
        if (password.length < 6) {
            setValidationError('La contraseña debe tener al menos 6 caracteres.');
            return false;
        }
        if (password !== confirmPassword) {
            setValidationError('Las contraseñas no coinciden.');
            return false;
        }
        setValidationError(null);
        return true;
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        clearError();
        if (!validate()) return;

        setSubmitting(true);
        try {
            await register({ email, password });
            navigate('/tasks');
        } catch {
            // El error ya queda almacenado en AuthContext
        } finally {
            setSubmitting(false);
        }
    };

    const handleGoogleRegister = async () => {
        clearError();
        setValidationError(null);
        setSubmitting(true);
        try {
            await loginWithGoogle();
            navigate('/tasks');
        } catch {
            // El error ya queda almacenado en AuthContext
        } finally {
            setSubmitting(false);
        }
    };

    const displayError = validationError ?? error;

    return (
        <main className="auth-container">
            <section className="auth-card">
                <h1>Crear cuenta</h1>
                <p className="subtitle">Gestor estratégico de tareas · MateCode</p>

                {displayError && (
                    <div className="alert-error" role="alert">
                        {displayError}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="auth-form" noValidate>
                    <label className="field">
                        <span>Correo electrónico</span>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="empleado@empresa.com"
                            autoComplete="email"
                            required
                        />
                    </label>

                    <label className="field">
                        <span>Contraseña</span>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Mínimo 6 caracteres"
                            autoComplete="new-password"
                            required
                        />
                    </label>

                    <label className="field">
                        <span>Confirmar contraseña</span>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Repetí tu contraseña"
                            autoComplete="new-password"
                            required
                        />
                    </label>

                    <button type="submit" className="btn-primary" disabled={submitting}>
                        {submitting ? 'Registrando...' : 'Registrarme'}
                    </button>
                </form>

                <button
                    type="button"
                    className="btn-secondary"
                    onClick={handleGoogleRegister}
                    disabled={submitting}
                >
                    Continuar con Google
                </button>

                <p className="auth-footer">
                    ¿Ya tenés cuenta?{' '}
                    <Link to="/login" onClick={clearError}>
                        Iniciá sesión
                    </Link>
                </p>
            </section>
        </main>
    );
}