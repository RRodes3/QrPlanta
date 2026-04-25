const bcrypt = require('bcrypt');
const prisma = require('../config/prisma');

const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: {
        id: 'desc',
      },
    });

    return res.status(200).json(users);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    return res.status(500).json({
      message: 'Error interno del servidor',
    });
  }
};

const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        message: 'Todos los campos son obligatorios',
      });
    }

    if (!['ADMIN', 'USER'].includes(role)) {
      return res.status(400).json({
        message: 'Rol inválido',
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({
        message: 'Ya existe un usuario con ese correo',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return res.status(201).json({
      message: 'Usuario creado correctamente',
      user: newUser,
    });
  } catch (error) {
    console.error('Error al crear usuario:', error);
    return res.status(500).json({
      message: 'Error interno del servidor',
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const userId = Number(req.params.id);

    if (Number.isNaN(userId)) {
      return res.status(400).json({
        message: 'ID inválido',
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return res.status(404).json({
        message: 'Usuario no encontrado',
      });
    }

    if (existingUser.id === req.user.id) {
      return res.status(400).json({
        message: 'No puedes eliminar tu propio usuario',
      });
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    return res.status(200).json({
      message: 'Usuario eliminado correctamente',
    });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    return res.status(500).json({
      message: 'Error interno del servidor',
    });
  }
};

module.exports = {
  getUsers,
  createUser,
  deleteUser,
};