import prisma from "../lib/prisma";
import bcrypt from "bcrypt";

const adminEmail = process.env.ADMIN_EMAIL ?? "admin@example.com";
const adminUsername = process.env.ADMIN_USERNAME ?? "admin";
const adminPassword = process.env.ADMIN_PASSWORD ?? "password";

const permissions = [

    // Users
    'users:read',
    'users:create',
    'users:update',
    'users:delete',

    // Roles
    'roles:read',
    'roles:create',
    'roles:update',
    'roles:delete',
];

const roles = {
    user: [
        // 'users:read',
    ],
    admin: permissions,
};

async function main() {
    console.log("Seeding...");

    for (const permission of permissions) {
        await prisma.permission.upsert({
            where: { name: permission },
            update: {},
            create: { name: permission },
        });
    }

    console.log(`${permissions.length} permissions created`);

    for (const [roleName, rolePermissions] of Object.entries(roles)) {
        const permissionRecords = await prisma.permission.findMany({
            where: { name: { in: rolePermissions } },
        });

        await prisma.role.upsert({
            where: { name: roleName },
            update: {
                permissions: {
                    deleteMany: {},
                    create: permissionRecords.map((permission) => ({
                        permissionId: permission.id,
                    })),
                },
            },
            create: {
                name: roleName,
                permissions: {
                    create: permissionRecords.map((permission) => ({
                        permissionId: permission.id,
                    })),
                },
            },
        });

        console.log(`Role '${roleName}' created with ${rolePermissions.length} permissions`);
    }

    const userRole = await prisma.role.findUnique({ where: { name: "user" } });
    if (userRole) {
        const updated = await prisma.user.updateMany({
            where: { roleId: null },
            data: { roleId: userRole.id },
        });
        console.log(`Updated ${updated.count} users with the 'user' role`);
    }

    const adminRole = await prisma.role.findUnique({ where: { name: "admin" } });
    if (!adminRole) {
        throw new Error("Admin role was not created");
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    await prisma.user.upsert({
        where: { email: adminEmail },
        update: {
            roleId: adminRole.id,
        },
        create: {
            email: adminEmail,
            username: adminUsername,
            password: hashedPassword,
            roleId: adminRole.id,
            emailVerified: true,
        },
    });

    console.log("Seeding complete.");
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
