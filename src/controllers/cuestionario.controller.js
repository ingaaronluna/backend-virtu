import * as cuestionarioService from '../services/cuestionario.service.js';

export const iniciarIntento = async (req, res, next) => {
  try {
    const { id } = req.params;
    const resultado = await cuestionarioService.iniciarIntento(id, req.user.id);
    res.status(201).json({
      status: 'success',
      message: 'Intento de cuestionario iniciado',
      data: resultado
    });
  } catch (error) {
    next(error);
  }
};

export const responderPregunta = async (req, res, next) => {
  try {
    const { id } = req.params; // intentoId
    const resultado = await cuestionarioService.responderPregunta(id, req.user.id, req.body);
    res.json({
      status: 'success',
      data: resultado
    });
  } catch (error) {
    next(error);
  }
};

export const finalizarIntento = async (req, res, next) => {
  try {
    const { id } = req.params; // intentoId
    const resultado = await cuestionarioService.finalizarIntento(id, req.user.id);
    res.json({
      status: 'success',
      message: 'Cuestionario finalizado exitosamente',
      data: resultado
    });
  } catch (error) {
    next(error);
  }
};

export const getHistorial = async (req, res, next) => {
  try {
    const { id } = req.params; // cuestionarioId
    const historial = await cuestionarioService.getHistorial(id, req.user.id);
    res.json({
      status: 'success',
      data: historial
    });
  } catch (error) {
    next(error);
  }
};
