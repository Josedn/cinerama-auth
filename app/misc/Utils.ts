import { Request } from "express";
import crypto from "crypto";
import { LogLevel } from "./Logger";

export const writeLineWithRequest = (line: string, req: Request, writeLine: (text: string, logLevel?: LogLevel) => void) => {
    const address = req.connection.remoteAddress;
    if (address != null) {
        writeLine(line + " from " + address);
    } else {
        writeLine(line + " with null address", LogLevel.Warning);
    }
};

export const getRandomToken = () => {
    return crypto.randomBytes(20).toString('hex');
};