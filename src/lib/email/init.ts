import { NodemailerProvider } from "../../pkg/email/nodemailer";
import { env } from "../config/env";

export const emailProvider = new NodemailerProvider({
    host: env.email.host,
    port: env.email.port,
    secure: env.email.port === 587 ? false : true,
    auth: {
        user: env.email.user,
        pass: env.email.pass
    }
})