require('dotenv').config();
const bcrypt = require('bcrypt');
const prisma = require('../config/prisma');

async function main() {
  const adminEmail = 'admin@qrplanta.com';
  const plainPassword = 'admin12345';

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (existingAdmin) {
    console.log('El usuario admin ya existe.');
    return;
  }

  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  const admin = await prisma.user.create({
    data: {
      name: 'Administrador',
      email: adminEmail,
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  console.log('Admin creado correctamente:');
  console.log({
    email: admin.email,
    password: plainPassword,
    role: admin.role,
  });
}

main()
  .catch((error) => {
    console.error('Error al crear el admin:', error);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });