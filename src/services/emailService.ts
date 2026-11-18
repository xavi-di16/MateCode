import type { SendSummaryPayload, SendSummaryResponse } from '../types/task.types';

export async function sendTasksSummaryEmail(
    payload: SendSummaryPayload
): Promise<SendSummaryResponse> {
    if (!payload.toEmail || !payload.toEmail.includes('@')) {
        throw new Error('No se encontró un correo electrónico válido para el usuario.');
    }

    if (payload.tasks.length === 0) {
        throw new Error('Agregá al menos una tarea antes de enviar el resumen.');
    }

    const response = await fetch('/api/send-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });

    const data = (await response.json().catch(() => ({}))) as Partial<SendSummaryResponse>;

    if (!response.ok) {
        throw new Error(data.message ?? 'Error al comunicarse con el servidor de correos.');
    }

    return {
        message: data.message ?? 'Resumen enviado correctamente.',
        messageId: data.messageId,
    };
}