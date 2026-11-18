import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import type { VercelRequest, VercelResponse } from '@vercel/node';

interface SummaryTask {
    title: string;
    completed: boolean;
}

interface RequestBody {
    toEmail?: unknown;
    userName?: unknown;
    tasks?: unknown;
}

function escapeHtml(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function isValidTaskArray(value: unknown): value is SummaryTask[] {
    return (
        Array.isArray(value) &&
        value.every(
            (item) =>
                typeof item === 'object' &&
                item !== null &&
                typeof (item as SummaryTask).title === 'string' &&
                typeof (item as SummaryTask).completed === 'boolean'
        )
    );
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Método no permitido. Usá POST.' });
    }

    const region = process.env.AWS_REGION;
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
    const fromEmail = process.env.AWS_SES_FROM_EMAIL;

    if (!region || !accessKeyId || !secretAccessKey || !fromEmail) {
        return res.status(500).json({
            message: 'Faltan variables de entorno de AWS SES en el servidor.',
        });
    }

    const body = (req.body ?? {}) as RequestBody;
    const toEmail = typeof body.toEmail === 'string' ? body.toEmail.trim() : '';
    const userName =
        typeof body.userName === 'string' && body.userName.trim()
            ? body.userName.trim()
            : 'Usuario';

    if (!toEmail || !toEmail.includes('@')) {
        return res.status(400).json({ message: 'El correo de destino no es válido.' });
    }

    if (!isValidTaskArray(body.tasks) || body.tasks.length === 0) {
        return res.status(400).json({
            message: 'Debés enviar al menos una tarea válida para generar el resumen.',
        });
    }

    const completedTasks = body.tasks.filter((t) => t.completed);
    const pendingTasks = body.tasks.filter((t) => !t.completed);

    const htmlList = body.tasks
        .map(
            (t) =>
                `<li><strong>${t.completed ? '[Completada]' : '[Pendiente]'}</strong> ${escapeHtml(t.title)}</li>`
        )
        .join('');

    const textList = body.tasks
        .map((t) => `- ${t.completed ? '[Completada]' : '[Pendiente]'} ${t.title}`)
        .join('\n');

    const sesClient = new SESClient({
        region,
        credentials: { accessKeyId, secretAccessKey },
    });

    const command = new SendEmailCommand({
        Source: fromEmail,
        Destination: { ToAddresses: [toEmail] },
        Message: {
            Subject: {
                Data: `Resumen de tareas - MateCode (${pendingTasks.length} pendientes)`,
                Charset: 'UTF-8',
            },
            Body: {
                Text: {
                    Data: `Hola ${userName},\n\nResumen de tus tareas:\nTotal: ${body.tasks.length} | Completadas: ${completedTasks.length} | Pendientes: ${pendingTasks.length}\n\n${textList}`,
                    Charset: 'UTF-8',
                },
                Html: {
                    Data: `
            <h2>Resumen de tus tareas - MateCode</h2>
            <p>Hola <strong>${escapeHtml(userName)}</strong>,</p>
            <p>Total: <strong>${body.tasks.length}</strong> · Completadas: <strong>${completedTasks.length}</strong> · Pendientes: <strong>${pendingTasks.length}</strong></p>
            <ul>${htmlList}</ul>
          `,
                    Charset: 'UTF-8',
                },
            },
        },
    });

    try {
        const result = await sesClient.send(command);
        return res.status(200).json({
            message: 'Resumen enviado por email correctamente.',
            messageId: result.MessageId,
        });
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : 'Error desconocido al enviar el correo.';
        return res.status(500).json({
            message: `No se pudo enviar el email con AWS SES: ${errorMessage}`,
        });
    }
}