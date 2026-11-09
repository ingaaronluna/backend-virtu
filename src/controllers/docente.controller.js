import * as docenteService from '../services/docente.service.js';

export const getCursosDocente = async (req, res, next) => {
  try {
    const cursos = await docenteService.getCursosDocente(req.user.id);
    res.json({
      status: 'success',
      data: cursos
    });
  } catch (error) {
    next(error);
  }
};

export const getEstudiantesCurso = async (req, res, next) => {
  try {
    const { cursoId } = req.params;
    const resultado = await docenteService.getEstudiantesCurso(cursoId, req.user.id);
    res.json({
      status: 'success',
      data: resultado
    });
  } catch (error) {
    next(error);
  }
};

export const getDesempenoEstudianteLeccion = async (req, res, next) => {
  try {
    const { estudianteId, leccionId } = req.params;
    const resultado = await docenteService.getDesempenoEstudianteLeccion(
      estudianteId,
      leccionId,
      req.user.id
    );
    res.json({
      status: 'success',
      data: resultado
    });
  } catch (error) {
    next(error);
  }
};
