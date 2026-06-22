
import { prismaMock } from "../helpers/singleton";
import { register } from "../../src/service/authProvider";

import bcrypt from "bcrypt";

jest.mock("bcrypt");

const mockBcryptHash = bcrypt.hash as jest.Mock;

describe("AuthProvider", () => {

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
                const existingUser = {
                    id: "123",
                    username: "existinguser",
                    email: "existinguser@example.com",
                    password: "Hashedpassword1",
                    roleId: "role-1",
                    createdAt: new Date(),
                    refreshToken: null,
                };

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
});