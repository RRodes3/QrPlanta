const prisma = require('../config/prisma');

const getCars = async (req, res) => {
  try {
    const cars = await prisma.car.findMany({
      orderBy: {
        registeredAt: 'desc',
      },
    });

    return res.status(200).json(cars);
  } catch (error) {
    console.error('Error al obtener carros:', error);
    return res.status(500).json({
      message: 'Error interno del servidor',
    });
  }
};

const getCarById = async (req, res) => {
  try {
    const carId = Number(req.params.id);

    if (Number.isNaN(carId)) {
      return res.status(400).json({
        message: 'ID inválido',
      });
    }

    const car = await prisma.car.findUnique({
      where: { id: carId },
      include: {
        movements: {
          include:{
            registeredByUser:{
              select:{
                id: true,
                name: true,
                email: true,
              }
            }
          },
          orderBy: {
            registeredAt: 'asc',
          },
        },
      },
    });

    if (!car) {
      return res.status(404).json({
        message: 'Vehículo no encontrado',
      });
    }

    return res.status(200).json(car);
  } catch (error) {
    console.error('Error al obtener carro por ID:', error);
    return res.status(500).json({
      message: 'Error interno del servidor',
    });
  }
};

const getCarByQrValue = async (req, res) => {
  try {
    const { qrValue } = req.params;

    const car = await prisma.car.findUnique({
      where: { qrValue },
      include: {
        movements: {
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
        },
      },
    });

    if (!car) {
      return res.status(404).json({
        message: 'Vehículo no encontrado para ese QR',
      });
    }

    return res.status(200).json(car);
  } catch (error) {
    console.error('Error al obtener carro por QR:', error);
    return res.status(500).json({
      message: 'Error interno del servidor',
    });
  }
};

module.exports = {
  getCars,
  getCarById,
  getCarByQrValue,
};