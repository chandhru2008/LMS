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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
exports.getEmailHtml = getEmailHtml;
const nodemailer_1 = __importDefault(require("nodemailer"));
function getEmailHtml() {
    return `<p>Click the button below to open the app:</p>
    <a href="https://lms-zwod.onrender.com" style="padding:10px 20px;background:#007bff;color:#fff;text-decoration:none;border-radius:5px;">
    Go to App</a>`;
}
const sendEmail = (to, subject, text, html) => __awaiter(void 0, void 0, void 0, function* () {
    const transporter = nodemailer_1.default.createTransport({
        service: 'gmail',
        auth: {
            user: "gschandhru10@gmail.com",
            pass: "esfl gylg swjc pakv",
        },
    });
    const mailOptions = {
        from: `"LMS" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        text,
        html,
    };
    yield transporter.sendMail(mailOptions);
});
exports.sendEmail = sendEmail;
