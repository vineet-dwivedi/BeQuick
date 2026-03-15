export function requestLogger(req, res, next) {
  const start = Date.now();

  res.on("finish", () => {
    const durationMs = Date.now() - start;
    const status = res.statusCode;
    console.log(`${req.method} ${req.originalUrl} -> ${status} (${durationMs}ms)`);
  });

  next();
}
