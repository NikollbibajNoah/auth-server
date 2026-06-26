export type ForgotPasswordRequest = {
    token: string;
    password: string;
    confirmPassword: string;
}