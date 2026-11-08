import * as authService from '../services/auth.service.js';

export const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const result = await authService.login(username, password);

    res.json({
      status: 'success',
      message: 'Inicio de sesión exitoso',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const profile = await authService.getProfile(req.user.id);

    res.json({
      status: 'success',
      data: profile
    });
  } catch (error) {
    next(error);
  }
};

export const register = async (req, res, next) => {
  try {
    const user = await authService.register(req.body);

    res.status(201).json({
      status: 'success',
      message: 'Usuario registrado exitosamente',
      data: user
    });
  } catch (error) {
    next(error);
  }
};
