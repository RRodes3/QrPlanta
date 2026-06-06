const prisma = require('../config/prisma');

const resetDemoData = async () => {
  try {
    console.log('Iniciando limpieza de datos de demostración...');

    await prisma.$transaction(async (tx) => {
      const deletedMovements = await tx.movement.deleteMany();

      const deletedCars = await tx.car.deleteMany();

      const deletedUsers = await tx.user.deleteMany({
        where: {
          role: {
            not: 'ADMIN',
          },
        },
      });

      console.log('Limpieza completada correctamente.');
      console.log({
        movementsDeleted: deletedMovements.count,
        carsDeleted: deletedCars.count,
        usersDeleted: deletedUsers.count,
      });
    });
  } catch (error) {
    console.error('Error al limpiar datos de demostración:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
};

resetDemoData();