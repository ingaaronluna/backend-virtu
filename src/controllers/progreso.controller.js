import * as progresoService from '../services/progreso.service.js';

export const marcarLeccionManual = async (req, res, next) => {
  try {
    const { id } = req.params; // leccionId
    const resultado = await progresoService.marcarLeccionManual(id, req.user.id);
    res.json({
      status: 'success',
      message: 'Lección marcada como estudiada exitosamente',
      data: resultado
    });
  } catch (error) {
    next(error);
  }
};

export const getProgresoGlobal = async (req, res, next) => {
  try {
    const resultado = await progresoService.getProgresoGlobal(req.user.id);
    res.json({
      status: 'success',
      data: resultado
    });
  } catch (error) {
    next(error);
  }
};
