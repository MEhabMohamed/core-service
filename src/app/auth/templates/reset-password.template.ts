export function passwordResetEmail(name: string, email: string, otp: string) {

    const subject = "QuickBite Passcode Reset Request";

    const template = `
    <html>
    <body style="font-family: Arial, sans-serif;">
    <table style="width: 100%;">
    <tr>
    <td style="font-weight: bold;">To: ${email}</td>
    </tr>
    <tr>
    <td style="font-weight: bold;">Subject: ${subject}</td>
    </tr>
    <tr>
    <td>Date: ${new Date().toUTCString()}</td>
    </tr>
    </table>
    <hr/>
    <p>Hello ${name},</p>
    <p>We received a request to reset your passcode for the QuickBite.</p>
    <p>Please enter the following otp to define your new passcode. This otp is valid for 10 minutes:</p>
    <p>${otp}</p>
    <p>If you did not request this reset, please ignore this email.</p>
    </body>
    </html>
    `;

    return {
        to: email,
        subject: subject,
        body: template
    };
}