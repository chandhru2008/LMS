"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailRoute = void 0;
const email_helper_1 = require("../helpers/email-helper");
exports.emailRoute = {
    method: 'POST',
    path: '/send-email',
    handler: (request, h) => __awaiter(void 0, void 0, void 0, function* () {
        const { to, subject, text } = request.payload;
        const confirmLink = `http://localhost:3000/confirm/`;
        const html = `
    <div style="font-family: sans-serif; text-align: center;">
      <h2>Hello!</h2>
      <p>Click the button below to confirm your action.</p>
      <a href="${confirmLink}" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Confirm</a>
    </div>
  `;
        try {
            yield (0, email_helper_1.sendEmail)(to, subject, text, html);
            return h.response({ message: 'Email sent successfully!' }).code(200);
        }
        catch (err) {
            console.error(err);
            return h.response({ error: 'Failed to send email' }).code(500);
        }
    }),
};
