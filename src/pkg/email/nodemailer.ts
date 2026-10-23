import { Transporter, createTransport } from "nodemailer";
import { IEmailProvider } from "./email.interface";

export interface MailerConfig {
    host: string;
    port: number;
    secure: boolean;
    auth: {
        user: string;
        pass: string;
    }
}

export class NodemailerProvider implements IEmailProvider {
    private readonly client: Transporter;

    constructor(private readonly config: MailerConfig) {
        this.client = createTransport({
            host: config.host,
            port: config.port,
            secure: config.secure,
            auth: config.auth
        });
    }

    async send(to: string, subject: string, body: string): Promise<void> {
        await this.client.sendMail({
            from: this.config.auth.user,
            to,
            subject,
            html: body
        });
    }
}