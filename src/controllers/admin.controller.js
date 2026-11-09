import * as adminService from '../services/admin.service.js';

// Colegios
export const getColegios = async (req, res, next) => {
  try {
    const data = await adminService.getColegios();
    res.json({ status: 'success', data });
  } catch (error) {
    next(error);
  }
};

export const createColegio = async (req, res, next) => {
  try {
    const data = await adminService.createColegio(req.body.nombre);
    res.status(201).json({ status: 'success', message: 'Colegio creado', data });
  } catch (error) {
    next(error);
  }
};

export const updateColegio = async (req, res, next) => {
  try {
    const data = await adminService.updateColegio(req.params.id, req.body.nombre);
    res.json({ status: 'success', message: 'Colegio actualizado', data });
  } catch (error) {
    next(error);
  }
};

export const deleteColegio = async (req, res, next) => {
  try {
    await adminService.deleteColegio(req.params.id);
    res.json({ status: 'success', message: 'Colegio eliminado' });
  } catch (error) {
    next(error);
  }
};

// Cursos
export const getCursos = async (req, res, next) => {
  try {
    const data = await adminService.getCursos();
    res.json({ status: 'success', data });
  } catch (error) {
    next(error);
  }
};

export const createCurso = async (req, res, next) => {
  try {
    const data = await adminService.createCurso(req.body);
    res.status(201).json({ status: 'success', message: 'Curso creado', data });
  } catch (error) {
    next(error);
  }
};

export const updateCurso = async (req, res, next) => {
  try {
    const data = await adminService.updateCurso(req.params.id, req.body);
    res.json({ status: 'success', message: 'Curso actualizado', data });
  } catch (error) {
    next(error);
  }
};

export const deleteCurso = async (req, res, next) => {
  try {
    await adminService.deleteCurso(req.params.id);
    res.json({ status: 'success', message: 'Curso eliminado' });
  } catch (error) {
    next(error);
  }
};

// Contenidos (Materias)
export const createContenido = async (req, res, next) => {
  try {
    const data = await adminService.createContenido(req.body);
    res.status(201).json({ status: 'success', message: 'Contenido creado', data });
  } catch (error) {
    next(error);
  }
};

export const updateContenido = async (req, res, next) => {
  try {
    const data = await adminService.updateContenido(req.params.id, req.body);
    res.json({ status: 'success', message: 'Contenido actualizado', data });
  } catch (error) {
    next(error);
  }
};

export const deleteContenido = async (req, res, next) => {
  try {
    await adminService.deleteContenido(req.params.id);
    res.json({ status: 'success', message: 'Contenido eliminado' });
  } catch (error) {
    next(error);
  }
};

// Unidades
export const createUnidad = async (req, res, next) => {
  try {
    const data = await adminService.createUnidad(req.body);
    res.status(201).json({ status: 'success', message: 'Unidad creada', data });
  } catch (error) {
    next(error);
  }
};

export const updateUnidad = async (req, res, next) => {
  try {
    const data = await adminService.updateUnidad(req.params.id, req.body);
    res.json({ status: 'success', message: 'Unidad actualizada', data });
  } catch (error) {
    next(error);
  }
};

export const deleteUnidad = async (req, res, next) => {
  try {
    await adminService.deleteUnidad(req.params.id);
    res.json({ status: 'success', message: 'Unidad eliminada' });
  } catch (error) {
    next(error);
  }
};

// Lecciones
export const createLeccion = async (req, res, next) => {
  try {
    const data = await adminService.createLeccion(req.body);
    res.status(201).json({ status: 'success', message: 'Lección creada', data });
  } catch (error) {
    next(error);
  }
};

export const updateLeccion = async (req, res, next) => {
  try {
    const data = await adminService.updateLeccion(req.params.id, req.body);
    res.json({ status: 'success', message: 'Lección actualizada', data });
  } catch (error) {
    next(error);
  }
};

export const deleteLeccion = async (req, res, next) => {
  try {
    await adminService.deleteLeccion(req.params.id);
    res.json({ status: 'success', message: 'Lección eliminada' });
  } catch (error) {
    next(error);
  }
};

// Cuestionarios y Preguntas
export const createCuestionario = async (req, res, next) => {
  try {
    const data = await adminService.createCuestionario(req.body);
    res.status(201).json({ status: 'success', message: 'Cuestionario creado', data });
  } catch (error) {
    next(error);
  }
};

export const createPregunta = async (req, res, next) => {
  try {
    const data = await adminService.createPreguntaConOpciones(req.params.id, req.body);
    res.status(201).json({ status: 'success', message: 'Pregunta agregada con sus 4 opciones', data });
  } catch (error) {
    next(error);
  }
};

export const deletePregunta = async (req, res, next) => {
  try {
    await adminService.deletePregunta(req.params.id);
    res.json({ status: 'success', message: 'Pregunta eliminada' });
  } catch (error) {
    next(error);
  }
};

// Glosarios
export const createGlosarioItem = async (req, res, next) => {
  try {
    const data = await adminService.createGlosarioItem(req.params.materia, req.body);
    res.status(201).json({ status: 'success', message: 'Término de glosario creado', data });
  } catch (error) {
    next(error);
  }
};

export const deleteGlosarioItem = async (req, res, next) => {
  try {
    await adminService.deleteGlosarioItem(req.params.materia, req.params.id);
    res.json({ status: 'success', message: 'Término de glosario eliminado' });
  } catch (error) {
    next(error);
  }
};
