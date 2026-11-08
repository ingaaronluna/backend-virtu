export const errorHandler = (err, req, res, next) => {
  console.error('[Error Virtu API]:', err);

  // Errores de sintaxis JSON en el body
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      error: 'Petición inválida',
      message: 'El formato JSON enviado en el cuerpo de la petición es incorrecto'
    });
  }

  // Error de clave única de Prisma (P2002)
  if (err.code === 'P2002') {
    const target = err.meta?.target ? ` en el campo: ${err.meta.target}` : '';
    return res.status(409).json({
      error: 'Conflicto de datos',
      message: `Ya existe un registro con ese valor único${target}`
    });
  }

  // Error de registro no encontrado en Prisma (P2025)
  if (err.code === 'P2025') {
    return res.status(404).json({
      error: 'No encontrado',
      message: err.meta?.cause || 'El recurso solicitado no existe'
    });
  }

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    error: err.name || 'Error del servidor',
    message: err.message || 'Ha ocurrido un error inesperado'
  });
};
