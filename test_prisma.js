try {
    const { PrismaClient } = require('@prisma/client');
    console.log('PrismaClient loaded');
} catch (e) {
    console.error('Failed to load prisma:', e);
}
