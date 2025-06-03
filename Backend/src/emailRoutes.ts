// src/routes/emailRoute.ts

import { ServerRoute } from '@hapi/hapi';
import { sendEmail } from './mailservice';

export const emailRoute: ServerRoute = {
    method: 'POST',
    path: '/send-email',
    handler: async (request, h) => {
        const { to, subject, text } = request.payload as any;

        const confirmLink = `http://localhost:3000/confirm/`;

        const html = `
    <div style="font-family: sans-serif; text-align: center;">
      <h2>Hello!</h2>
      <p>Click the button below to confirm your action.</p>
      <a href="${confirmLink}" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Confirm</a>
    </div>
  `;

        try {
            await sendEmail(to, subject, text, html);
            return h.response({ message: 'Email sent successfully!' }).code(200);
        } catch (err) {
            console.error(err);
            return h.response({ error: 'Failed to send email' }).code(500);
        }
    },
};
