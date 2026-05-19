export type LoginResponse = {
    statusCode: number;
    message: string;
    accessToken?: string;
    refreshToken?: string;
}