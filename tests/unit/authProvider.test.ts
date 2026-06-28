import { prismaMock } from "../helpers/singleton";
import { login, logout, refreshToken, register } from "../../src/service/authProvider";
import { getUserPayload } from "../../src/lib/utils";
import { sign, verify } from 'jsonwebtoken';

import bcrypt from "bcrypt";

jest.mock("bcrypt");
jest.mock("../../src/lib/utils", () => ({
    getUserPayload: jest.fn(),
}));
jest.mock("jsonwebtoken", () => ({
    sign: jest.fn(),
    verify: jest.fn(),
}));

const mockBcryptHash = bcrypt.hash as jest.Mock;
const mockBcryptCompare = bcrypt.compare as jest.Mock;

const mockGetUserPayload = getUserPayload as jest.Mock;
const mockSign = sign as jest.Mock;
const mockVerify = verify as jest.Mock;

describe("AuthProvider", () => {
    const existingUser = {
        id: "123",
        username: "existinguser",
        email: "existinguser@example.com",
        password: "Hashedpassword1",
        roleId: "role-1",
        createdAt: new Date(),
        refreshToken: null,
        emailVerified: true,
        verificationToken: null,
        verificationExpiry: null,
        resetPasswordToken: null,
        resetPasswordExpiry: null,
    };

    // --- POST /register -----------------------------------------------

    describe("authProvider - register", () => {
        
        describe("validation", () => {
            describe("validation - password", () => {
                const validationUser = {
                    username: "testuser",
                    email: "testuser@example.com",
                };

                it("should fail if password is too short", async () => {
                    await expect(register({
                        ...validationUser,
                        password: "short",
                        confirmPassword: "short",
                    })).rejects.toThrow("Password must be at least 6 characters long");
                });

                it("should fail if password does not match confirmation", async () => {
                    await expect(register({
                        ...validationUser,
                        password: "Password1",
                        confirmPassword: "Password2",
                    })).rejects.toThrow("Passwords do not match");
                });

                it("should fail if password does not contain uppercase letter", async () => {
                    await expect(register({
                        ...validationUser,
                        password: "password1",
                        confirmPassword: "password1",
                    })).rejects.toThrow("Must contain uppercase");
                });

                it("should fail if password does not contain number", async () => {
                    await expect(register({
                        ...validationUser,
                        password: "Password",
                        confirmPassword: "Password",
                    })).rejects.toThrow("Must contain number");
                });
            });
            
            describe("validation - email", () => {
                it("should fail if email is invalid", async () => {
                    await expect(register({
                        username: "testuser",
                        email: "invalid-email",
                        password: "Password1",
                        confirmPassword: "Password1",
                    })).rejects.toThrow("Invalid email format");
                });
            });

            describe("validation - username", () => {
                it("should fail if username is too short", async () => {
                    await expect(register({
                        username: "ab",
                        email: "test@example.com",
                        password: "Password1",
                        confirmPassword: "Password1",
                    })).rejects.toThrow("Username must be at least 3 characters long");
                });

                it("should fail if username contains invalid characters", async () => {
                    await expect(register({
                        username: "testuser!",
                        email: "test@example.com",
                        password: "Password1",
                        confirmPassword: "Password1",
                    })).rejects.toThrow("Only letters, numbers and underscores");
                });
            });
        });
        
        describe("conflict", () => {
            it("should fail if user already exists", async () => {
                prismaMock.user.findFirst.mockResolvedValue(existingUser);

                await expect(register({
                    username: "existinguser",
                    email: "existinguser@example.com",
                    password: "Password1",
                    confirmPassword: "Password1",
                })).rejects.toThrow("Email or username already exists");
            });
        });

        describe("success", () => {
            it("should successfully register a user", async () => {
                const mockRole = { id: "role-1", name: "user"}
                const mockPlainPassword = "Plainpassword1";
                const mockedUser = {
                    id: "123",
                    username: "newuser",
                    email: "newuser@example.com",
                    password: "Hashedpassword1", // Hashed version of the plain password
                    roleId: mockRole.id,
                    createdAt: new Date(),
                    refreshToken: null,
                };

                prismaMock.user.findFirst.mockResolvedValue(null);
                prismaMock.role.findUnique.mockResolvedValue(mockRole);
                prismaMock.user.create.mockResolvedValue(mockedUser);
                mockBcryptHash.mockResolvedValue(mockedUser.password);

                const result = await register({
                    username: mockedUser.username,
                    email: mockedUser.email,
                    password: mockPlainPassword,
                    confirmPassword: mockPlainPassword,
                });

                expect(result).toEqual({
                    statusCode: 201,
                    message: "User registered successfully",
                });
            });
        });
    });

    // --- POST /login -----------------------------------------------

    describe("authProvider - login", () => {
        describe("validation", () => {
            it("should fail if email is invalid", async () => {
                await expect(login({
                    email: "invalid-email",
                    password: "Password1",
                })).rejects.toThrow("Invalid email address");
            });

            it("should fail if password is missing", async () => {
                await expect(login({
                    email: "testuser@example.com",
                    password: "",
                })).rejects.toThrow("Password is required");
            });
        });

        describe("authentication", () => {
            it("should fail if user does not exist", async () => {
                prismaMock.user.findFirst.mockResolvedValue(null);

                await expect(login({
                    email: "newuser@example.com",
                    password: "Password1",
                })).rejects.toThrow("Invalid email or password");
            });

            it("should fail if password is incorrect", async () => {
                prismaMock.user.findFirst.mockResolvedValue(existingUser);
                mockBcryptCompare.mockResolvedValue(false);

                await expect(login({
                    email: "existinguser@example.com",
                    password: "WrongPassword1",
                })).rejects.toThrow("Invalid email or password");
            });
        });

        describe("success", () => {
            it("should return accessToken and refreshToken on successful login", async () => {
                prismaMock.user.findFirst.mockResolvedValue(existingUser);
                mockBcryptCompare.mockResolvedValue(true);
                mockGetUserPayload.mockResolvedValue({ email: existingUser.email, role: "user" });
                mockSign
                    .mockReturnValueOnce("mockedAccessToken")
                    .mockReturnValueOnce("mockedRefreshToken");

                prismaMock.user.update.mockResolvedValue(existingUser);

                const result = await login({
                    email: existingUser.email,
                    password: "Password1",
                });

                expect(result).toEqual({
                    statusCode: 200,
                    message: "Login successful",
                    accessToken: "mockedAccessToken",
                    refreshToken: "mockedRefreshToken",
                });
            });
        });
    });

    // --- POST /logout -----------------------------------------------

    describe("authProvider - logout", () => {
        it("should successfully logout a user", async () => {
            prismaMock.user.update.mockResolvedValue({ ...existingUser, refreshToken: "refreshToken" });

            const result = await logout(existingUser.email);

            expect(result).toEqual({
                statusCode: 200,
                message: "Logout successful",
            })
        });
    });

    // --- POST /refreshToken -----------------------------------------------

    describe("authProvider - refreshToken", () => {
        describe("validation", () => {
            it("should fail if token is missing", async () => {
                await expect(refreshToken("")).rejects.toThrow("Refresh token is required");
            });
        });

        describe("token reuse", () => {
            it("should fail if token does not exist in DB", async () => {
                mockVerify.mockReturnValue({ email: "existinguser@example.com" });
                prismaMock.user.findUnique.mockResolvedValue(null);
                prismaMock.user.updateMany.mockResolvedValue({ count: 1});

                await expect(refreshToken("someInvalidToken"))
                    .rejects.toThrow("Invalid refresh token");
            });
        });

        describe("success", () => {
            it("should return new accessToken and refreshToken", async () => {
                mockVerify.mockReturnValue({ email: "existinguser@example.com" });
                prismaMock.user.findUnique.mockResolvedValue({ ...existingUser, refreshToken: "validRefreshToken" });
                mockGetUserPayload.mockResolvedValue({ email: existingUser.email, role: "user" });
                mockSign
                    .mockReturnValueOnce("mockedAccessToken")
                    .mockReturnValueOnce("mockedRefreshToken");
                prismaMock.user.update.mockResolvedValue(existingUser);

                const result = await refreshToken("validRefreshToken");

                expect(result).toEqual({
                    statusCode: 200,
                    message: "Token refreshed successfully",
                    accessToken: "mockedAccessToken",
                    refreshToken: "mockedRefreshToken",
                });
            });
        });
    })
});