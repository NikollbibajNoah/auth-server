import { PrismaClient } from '../../src/generated/prisma/client';
import { mockDeep, mockReset, DeepMockProxy } from "jest-mock-extended";

import prisma from '../../src/lib/prisma';

jest.mock("../../src/lib/prisma", () => ({
    __esModule: true,
    default: mockDeep<PrismaClient>(),
}));

beforeEach(() => {
    mockReset(prisma as DeepMockProxy<PrismaClient>);
});

export const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;