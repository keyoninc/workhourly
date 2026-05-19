const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const users = await prisma.user.findMany();
  console.log("Users:", users.map(u => ({ email: u.email, id: u.id, pass: u.password })));
  
  const memberships = await prisma.tenantMembership.findMany();
  console.log("Memberships:", memberships);
}
check();
