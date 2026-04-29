require('dotenv').config();
const prisma = require('../config/prisma');

async function main() {
  const niv = 'TESTNIV12345678901';
  const qrValue = 'QR-TEST-0001';

  const existingCar = await prisma.car.findUnique({
    where: { niv },
  });

  if (existingCar) {
    console.log('El vehículo de prueba ya existe.');
    console.log(existingCar);
    return;
  }

  const car = await prisma.car.create({
    data: {
      niv,
      chasis: 'CHASIS-TEST-001',
      qrValue,
      qrExported: false,
      qrExportedAt: null,
    },
  });

  console.log('Vehículo de prueba creado correctamente:');
  console.log(car);
}

main()
  .catch((error) => {
    console.error('Error al crear el vehículo de prueba:', error);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });