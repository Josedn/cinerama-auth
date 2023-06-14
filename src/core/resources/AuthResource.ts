import { Application, Request, Response, NextFunction } from "express";
import { constants as HttpConstants } from "http2";

import Logger from "cinerama-common/lib/misc/Logger";
import { writeLineWithRequest } from "cinerama-common/lib/misc/Utils";
import { AuthService } from "../services/AuthService";
import { CineError } from "cinerama-common/lib/protocol";
import { SecretApiKeyService } from "../services/SecretApiKeyService";

const writeLine = Logger.generateLogger("AuthResource");

export default class AuthResource {
  constructor(private authService: AuthService, private secretApiKeyService: SecretApiKeyService) {}

  public initialize(app: Application): void {
    app.post("/login", this.postLogin);
    app.get("/verify/:token", this.verifyAccount);
    app.get("/user/:token", this.fetchUser);
    app.get("*", this.get404);
  }

  private postLogin = (req: Request, res: Response, next: NextFunction): void => {
    const { username, password } = req.body;

    writeLineWithRequest("Requested login from " + username, req, writeLine);

    this.authService
      .login(username, password)
      .then((either) => either.toPromise())
      .then((authTokenE) => {
        res.status(HttpConstants.HTTP_STATUS_CREATED).json(authTokenE);
      })
      .catch((err) => this.sendError(res, err));
  };

  private fetchUser = (req: Request, res: Response, next: NextFunction): void => {
    const { token } = req.params;
    writeLineWithRequest("Requested fetch user from " + token, req, writeLine);

    this.authService
      .fetchUser(token)
      .then(either => either.toPromise())
      .then(allowedFlags => {
        res.json(allowedFlags);
      })
      .catch((err) => this.sendError(res, err));
  };

  private verifyAccount = (req: Request, res: Response, next: NextFunction): void => {
    if (!this.secretApiKeyService.requestHasRights(req)) {
      this.sendError(res, CineError.NOT_AUTHORIZED);
      return;
    }
    const { token } = req.params;
    writeLineWithRequest("Requested verify from " + token, req, writeLine);

    this.authService
      .verify(token)
      .then(either => either.toPromise())
      .then(allowedFlags => {
        res.json(allowedFlags);
      })
      .catch((err) => this.sendError(res, err));
  };

  private get404 = (req: Request, res: Response, next: NextFunction): void => {
    writeLineWithRequest("Requested 404", req, writeLine);
    this.sendError(res, CineError.PAGE_NOT_FOUND);
  };

  private sendError(res: Response, cineError: CineError, additional?: string) {
    res.status(cineError.httpStatusCode).json({
      error: {
        errorMessage: cineError.errorMessage,
        errorCode: cineError.errorCode,
        additional: additional || null,
      },
    });
  }
}
