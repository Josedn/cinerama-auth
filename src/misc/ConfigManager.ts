import dotenv from "dotenv";
import { ConfigKeys } from "./ConfigKeys";
import Logger, { LogLevel } from "cinerama-common/lib/misc/Logger";

const writeLine = Logger.generateLogger("ConfigManager");

export default class ConfigManager {
  constructor() {
    const result = dotenv.config();
    if (result.error) {
      writeLine("Error loading .env file: " + result.error.message, LogLevel.Warning);
    }
  }

  public getApiPort(): number {
    return this.getInt(ConfigKeys.API_PORT, 1233);
  }

  public getEnabledAccounts(): string[] {
    return this.getString(ConfigKeys.ENABLED_ACCOUNTS, "")
      .split(",")
      .map((str) => str.trim());
  }

  private static getKeyString(key: ConfigKeys): string {
    return ConfigKeys[key];
  }

  private getInt(key: ConfigKeys, failsafe: number): number {
    const value = process.env[ConfigManager.getKeyString(key)];
    if (value != null) {
      return parseInt(value);
    }
    writeLine("Used failsafe value " + failsafe + " for " + key, LogLevel.Warning);
    return failsafe;
  }

  private getString(key: ConfigKeys, failsafe: string): string {
    const value = process.env[ConfigManager.getKeyString(key)];
    if (value != null) {
      return value;
    }
    writeLine("Used failsafe value " + failsafe + " for " + key, LogLevel.Warning);
    return failsafe;
  }
}
