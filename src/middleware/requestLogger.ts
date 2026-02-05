import { Request, Response, NextFunction } from "express";

// ANSI Color codes
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  bgRed: "\x1b[41m",
  bgGreen: "\x1b[42m",
  bgYellow: "\x1b[43m",
  bgBlue: "\x1b[44m",
};

const getMethodColor = (method: string): string => {
  switch (method.toUpperCase()) {
    case "GET":
      return colors.blue;
    case "POST":
      return colors.green;
    case "PUT":
      return colors.yellow;
    case "DELETE":
      return colors.red;
    case "PATCH":
      return colors.magenta;
    case "HEAD":
      return colors.cyan;
    default:
      return colors.white;
  }
};

const getStatusColor = (status: number): string => {
  if (status < 300) return colors.green;
  if (status < 400) return colors.cyan;
  if (status < 500) return colors.yellow;
  return colors.red;
};

const getStatusEmoji = (status: number): string => {
  if (status < 300) return "✓";
  if (status < 400) return "→";
  if (status < 500) return "⚠";
  return "✗";
};

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Only log if ENABLE_REQUEST_LOG is set to 'true'
  if (process.env.ENABLE_REQUEST_LOG !== "true") {
    return next();
  }

  const startTime = Date.now();
  const timestamp = new Date().toLocaleTimeString();
  const methodColor = getMethodColor(req.method);

  // Log incoming request
  console.log(
    `${colors.dim}[${timestamp}]${colors.reset} ${methodColor}${
      colors.bright
    }${req.method.padEnd(6)}${colors.reset} ${colors.cyan}${req.originalUrl}${
      colors.reset
    }`,
  );

  // Override res.send to capture status code and log response
  const originalSend = res.send.bind(res);
  res.send = ((data?: any) => {
    const duration = Date.now() - startTime;
    const statusColor = getStatusColor(res.statusCode);
    const statusEmoji = getStatusEmoji(res.statusCode);

    console.log(
      `${colors.dim}[${timestamp}]${
        colors.reset
      } ${statusColor}${statusEmoji} ${colors.bright}${res.statusCode}${
        colors.reset
      } ${methodColor}${req.method.padEnd(6)}${colors.reset} ${colors.cyan}${
        req.originalUrl
      }${colors.reset} ${colors.yellow}${duration}ms${colors.reset}`,
    );

    return originalSend(data);
  }) as Response["send"];

  next();
};
