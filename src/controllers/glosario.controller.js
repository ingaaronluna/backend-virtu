import * as glosarioService from '../services/glosario.service.js';

export const getGlosarioByMateria = async (req, res, next) => {
  try {
    const { materia } = req.params;
    const { q } = req.query;
    const resultado = await glosarioService.getGlosarioByMateria(materia, q);

    res.json({
      status: 'success',
      ...resultado
    });
  } catch (error) {
    next(error);
  }
};

export const getLineaTiempoSecuencial = async (req, res, next) => {
  try {
    const { id } = req.params;
    const resultado = await glosarioService.getLineaTiempoSecuencial(id);

    res.json({
      status: 'success',
      data: resultado
    });
  } catch (error) {
    next(error);
  }
};
