export interface IEmailProvider {
    send(to: string, subject: string, body: string): Promise<void>;
}