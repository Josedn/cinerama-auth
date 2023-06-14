import { Request } from "express";

import Logger, { LogLevel } from "cinerama-common/lib/misc/Logger";
import { AccountFlags } from "cinerama-common/lib/protocol";

const writeLine = Logger.generateLogger("AccountService");

const AUTH_HEADER = "cinerama-api-key";

export class AccountService {
  constructor(private enabledAccounts: string[]) {}

  private accountHasFlag(token: string, flag: AccountFlags) {
    if (this.enabledAccounts.find(acc => acc == token)) {
      return true;
    }
    return false;
  }

  public requestHasFlag(req: Request, flag: AccountFlags) {
    if (flag == AccountFlags.DOWNLOAD_STREAM) {
      return true;
    }
    const authHeader = req.get(AUTH_HEADER);
    if (authHeader) {
      return this.accountHasFlag(authHeader, flag);
    }
    return false;
  }
}
