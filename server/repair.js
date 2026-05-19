const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const memberships = await prisma.tenantMembership.findMany({ where: { departmentId: null } });
  let count = 0;
  for (const m of memberships) {
    const dept = await prisma.department.findFirst({ where: { tenantId: m.tenantId, level: 0 } });
    if (dept) {
      await prisma.tenantMembership.update({ where: { id: m.id }, data: { departmentId: dept.id } });
      count++;
    }
  }
  console.log(`Fixed ${count} memberships`);
}
run();
