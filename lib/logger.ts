import prisma from "@/lib/prisma";
import { LogLevel } from "@/app/generated/prisma/enums";

const log = (logLevel: LogLevel, type: string, message: string,) => {
    prisma.logger.create({
        data: {
            level: logLevel,
            type,
            message,
        },
    }).catch((error) => {
        console.error("Failed to save log to database:", error);
    });
};

export default log;