import { prisma } from "../src/lib/prisma";
import { Permission } from "../src/lib/types/auth/Permission";
import bcrypt from "bcrypt";

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

    // 1. Create permissions
    for (const permission of permissions) {
        await prisma.permission.upsert({
            where: { name: permission },
            update: {},
            create: { name: permission },
        });
    }

    console.log(`${permissions.length} permissions created`);

    // 2. Create roles and assign permissions
    for (const [roleName, rolePermissions] of Object.entries(roles)) {
        const permissionRecords = await prisma.permission.findMany({
            where: { name: { in: rolePermissions } },
        });

        await prisma.role.upsert({
            where: { name: roleName },
            update: {
                permissions: {
                    deleteMany: {},
                    create: permissionRecords.map((permission: Permission) => ({
                        permissionId: permission.id,
                    })),
                },
            },
            create: {
                name: roleName,
                permissions: {
                    create: permissionRecords.map((permission: Permission) => ({
                        permissionId: permission.id,
                    })),
                },
            },
        });

        console.log(`Role '${roleName}' created with ${rolePermissions.length} permissions`);

        // 3. Assign 'user' role to a default user
        const userRole = await prisma.role.findUnique({ where: { name: 'user' } });

        if (userRole) {
            const updated = await prisma.user.updateMany({
                where: { roleId: { equals: undefined } },
                data: { roleId: userRole.id },
            });
            console.log(`Updated ${updated.count} users with the 'user' role`);
        }

        // 4. Assign 'admin' role to a default admin user
        const adminRole = await prisma.role.findUnique({ where: { name: 'admin' } });
        const hashedPassword = await bcrypt.hash('password', 10);
        
        await prisma.user.upsert({
            where: { email: 'admin@example.com' },
            update: {
                roleId: adminRole!.id,
            },
            create: {
                email: 'admin@example.com',
                username: 'admin',
                password: hashedPassword,
                roleId: adminRole!.id,
            }
        });

        console.log('Seeding complete.');
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
