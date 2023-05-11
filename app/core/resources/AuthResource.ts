import { Application, Request, Response, NextFunction } from "express";
import { constants as HttpConstants } from "http2";

import Logger from "../../misc/Logger";
import { writeLineWithRequest } from "../../misc/Utils";
import { CineError } from "./CineError";
import { AuthService } from "./services/AuthService";

const writeLine = Logger.generateLogger("LightsResource");

export default class AuthResource {
    constructor(private authService: AuthService) { }

    public initialize(app: Application): void {
        app.post("/login", this.postLogin);
        app.get("*", this.get404);
    }

    private postLogin = (req: Request, res: Response, next: NextFunction): void => {

        const { username, password } = req.body;

        writeLineWithRequest("Requested login from " + username, req, writeLine);


        this.authService.login(username, password).then(either => either.toPromise())
            .then(authTokenE => {
                res.status(HttpConstants.HTTP_STATUS_CREATED).json(authTokenE);
            })
            .catch(err => this.sendError(res, CineError.NOT_AUTHORIZED, err));
        this.sendError(res, CineError.PAGE_NOT_FOUND);
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