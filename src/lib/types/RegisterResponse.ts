export type RegisterResponse = {
    statusCode: number;
    message: string;
    accessToken?: string;
    refreshToken?: string;
};