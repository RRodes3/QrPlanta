const prisma = require('../config/prisma');

const PRODUCTION_STAGES = [
  'SOLDADURA',
  'PINTURA',
  'MONTAJE',
  'CONTROL_DE_CALIDAD',
];

const FINAL_STAGE = 'PROCESO_FINALIZADO';

const registerMovement = async (req, res) => {
  try {
    const { qrValue, stageName } = req.body;

    if (!qrValue || !stageName) {
      return res.status(400).json({
        message: 'qrValue y stageName son obligatorios',
      });
    }

    if (!PRODUCTION_STAGES.includes(stageName)) {
      return res.status(400).json({
        message: 'Etapa inválida',
      });
    }

    const car = await prisma.car.findUnique({
      where: { qrValue },
      include: {
        movements: {
          orderBy: {
            registeredAt: 'asc',
          },
        },
      },
    });

    if (!car) {
      return res.status(404).json({
        message: 'Vehículo no encontrado para ese QR',
      });
    }

    const existingStages = car.movements.map((movement) => movement.stageName);

    if (existingStages.includes(FINAL_STAGE)) {
      return res.status(400).json({
        message: 'El vehículo ya finalizó el proceso y no puede registrar más movimientos',
      });
    }

    if (existingStages.includes(stageName)) {
      return res.status(400).json({
        message: `El vehículo ya tiene registrada la etapa ${stageName}`,
      });
    }

    const registeredByName = req.user?.name || null;

    const newMovement = await prisma.movement.create({
      data: {
        carId: car.id,
        stageName,
        registeredAt: new Date(),
        registeredByUserId: req.user?.id || null,
        registeredByName,
        sourceType: 'SCAN',
      },
    });

    const updatedStages = [...existingStages, stageName];
    const hasCompletedAllStages = PRODUCTION_STAGES.every((stage) =>
      updatedStages.includes(stage)
    );

    let finalMovement = null;

    if (hasCompletedAllStages) {
      finalMovement = await prisma.movement.create({
        data: {
          carId: car.id,
          stageName: FINAL_STAGE,
          registeredAt: new Date(),
          registeredByUserId: req.user?.id || null,
          registeredByName,
          sourceType: 'SCAN',
        },
      });
    }

    return res.status(201).json({
      message: hasCompletedAllStages
        ? 'Movimiento registrado y vehículo marcado como PROCESO_FINALIZADO'
        : 'Movimiento registrado correctamente',
      movement: newMovement,
      finalMovement,
    });
  } catch (error) {
    console.error('Error al registrar movimiento:', error);
    return res.status(500).json({
      message: 'Error interno del servidor',
    });
  }
};

const getMovements = async (req, res) => {
  try {
    const movements = await prisma.movement.findMany({
      include: {
        car: {
          select: {
            id: true,
            niv: true,
            qrValue: true,
          },
        },
        registeredByUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        registeredAt: 'desc',
      },
    });

    return res.status(200).json(movements);
  } catch (error) {
    console.error('Error al obtener movimientos:', error);
    return res.status(500).json({
      message: 'Error interno del servidor',
    });
  }
};

const getMovementsByCarId = async (req, res) => {
  try {
    const carId = Number(req.params.carId);

    if (Number.isNaN(carId)) {
      return res.status(400).json({
        message: 'carId inválido',
      });
    }

    const car = await prisma.car.findUnique({
      where: { id: carId },
    });

    if (!car) {
      return res.status(404).json({
        message: 'Vehículo no encontrado',
      });
    }

    const movements = await prisma.movement.findMany({
      where: { carId },
      include: {
        registeredByUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        registeredAt: 'asc',
      },
    });

    return res.status(200).json({
      car,
      movements,
    });
  } catch (error) {
    console.error('Error al obtener historial del vehículo:', error);
    return res.status(500).json({
      message: 'Error interno del servidor',
    });
  }
};

module.exports = {
  registerMovement,
  getMovements,
  getMovementsByCarId,
};