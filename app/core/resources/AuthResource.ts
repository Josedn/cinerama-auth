import { Application, Request, Response, NextFunction } from "express";
import { constants as HttpConstants } from "http2";

import Logger from "cinerama-common/lib/misc/Logger";
import { writeLineWithRequest } from "cinerama-common/lib/misc/Utils";
import { AuthService } from "../services/AuthService";
import { AccountService } from "../services/AccountService";
import { CineError, AccountFlags } from "cinerama-common/lib/protocol";

const writeLine = Logger.generateLogger("LightsResource");

export default class AuthResource {
    constructor(private authService: AuthService, private accountService: AccountService) { }

    public initialize(app: Application): void {
        app.post("/login", this.postLogin);
        app.get("/verify/:token", this.verifyAccount);
        app.get("*", this.get404);
    }

    private postLogin = (req: Request, res: Response, next: NextFunction): void => {
        const { username, password } = req.body;

        writeLineWithRequest("Requested login from " + username, req, writeLine);

        this.authService.login(username, password).then(either => either.toPromise())
            .then(authTokenE => {
                res.status(HttpConstants.HTTP_STATUS_CREATED).json(authTokenE);
            })
            .catch(err => this.sendError(res, err));
    }

    private verifyAccount = (req: Request, res: Response, next: NextFunction): void => {
        if (!this.accountService.requestHasFlag(req, AccountFlags.GET_ALL_STREAMS)) {
            this.sendError(res, CineError.NOT_AUTHORIZED);
            return;
        }
        const { token } = req.params;
        writeLineWithRequest("Requested verify from " + token, req, writeLine);

        this.authService.verify(token).then(either => either.toPromise())
            .then(allowedFlags => {
                res.status(HttpConstants.HTTP_STATUS_CREATED).json(allowedFlags);
            })
            .catch(err => this.sendError(res, err));
    }

    private get404 = (req: Request, res: Response, next: NextFunction): void => {
        writeLineWithRequest("Requested 404", req, writeLine);
        this.sendError(res, CineError.PAGE_NOT_FOUND);
    }

    private sendError(res: Response, cineError: CineError, additional?: string) {
        res.status(cineError.httpStatusCode).json({
            error: {
                errorMessage: cineError.errorMessage,
                errorCode: cineError.errorCode,
                additional: additional || null,
            }
        });
    }
}