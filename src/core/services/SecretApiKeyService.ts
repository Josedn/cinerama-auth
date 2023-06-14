import { Request } from "express";

const AUTH_HEADER = "cinerama-api-key";

export class SecretApiKeyService {
  constructor(private enabledKeys: string[]) {}

  private keyHasRights(apiKey: string) {
    if (this.enabledKeys.find((acc) => acc == apiKey)) {
      return true;
    }
    return false;
  }

  public requestHasRights(req: Request) {
    const authHeader = req.get(AUTH_HEADER);
    if (authHeader) {
      return this.keyHasRights(authHeader);
    }
    return false;
  }
}
