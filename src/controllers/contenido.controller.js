import * as contenidoService from '../services/contenido.service.js';

export const getContenidos = async (req, res, next) => {
  try {
    const contenidos = await contenidoService.getAllContenidos(req.user);
    res.json({
      status: 'success',
      data: contenidos
    });
  } catch (error) {
    next(error);
  }
};

export const getContenidoBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const contenido = await contenidoService.getContenidoBySlug(slug, req.user);
    res.json({
      status: 'success',
      data: contenido
    });
  } catch (error) {
    next(error);
  }
};

export const getLeccionById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const leccion = await contenidoService.getLeccionById(id, req.user);
    res.json({
      status: 'success',
      data: leccion
    });
  } catch (error) {
    next(error);
  }
};
