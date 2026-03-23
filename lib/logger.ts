import prisma from "@/lib/prisma";
import { LogLevel } from "@/app/generated/prisma/enums";

const MAX_LOG_TYPE_LENGTH = 191;
const MAX_LOG_MESSAGE_LENGTH = 191;

const truncateForDb = (value: string, maxLength: number) => {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 1)}…`;
};

const log = (logLevel: LogLevel, type: string, message: string) => {
  prisma.logger.create({
    data: {
      level: logLevel,
      type: truncateForDb(type, MAX_LOG_TYPE_LENGTH),
      message: truncateForDb(message, MAX_LOG_MESSAGE_LENGTH),
    },
  }).catch((error) => {
    console.error("Failed to save log to database:", error);
  });
};

export default log;
