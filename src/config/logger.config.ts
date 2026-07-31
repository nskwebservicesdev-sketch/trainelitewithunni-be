import winston from "winston";
import path from "path";

const logsDirectory = path.join(__dirname, "..", "..", "..", "logs");
const logFileName = `${new Date().toISOString().slice(0, 10)}.log`;

const logger = winston.createLogger({
  levels: winston.config.npm.levels,
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.printf((info: any) => {
      return `${info.timestamp} [${info.level}] ${info.message}`;
    }),
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple(),
      level: "debug",
    }),
    new winston.transports.File({
      filename: path.join(logsDirectory, logFileName),
    }),
  ],
});

// Preserve the original console.log
// tslint:disable-next-line:no-console
const originalConsoleLog = console.log;

// Safe override for console.log
// tslint:disable-next-line:no-console
console.log = (...args: any[]) => {
  // Safely convert arguments to strings
  const stringifiedArgs = args.map((arg) => {
    if (arg instanceof Error) {
      // Handle Error objects with message + stack
      return JSON.stringify(
        { message: arg.message, stack: arg.stack },
        null,
        2,
      );
    }

    if (typeof arg === "object") {
      try {
        // Pretty-print any other objects
        return JSON.stringify(arg, null, 2);
      } catch {
        return "[Unserializable Object]";
      }
    }

    // Fallback for primitives
    return String(arg);
  });

  // Join into a single log message
  const logMessage = stringifiedArgs.join(" ");

  // Route logs by type
  if (logMessage.startsWith("W_ERROR:")) {
    logger.error(logMessage.substring("W_ERROR:".length));
  } else {
    logger.info(logMessage);
    // Print to console for visibility during development
    originalConsoleLog(...stringifiedArgs);
  }
};

export default logger;
