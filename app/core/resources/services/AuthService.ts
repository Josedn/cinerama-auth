import { Either as EitherType } from "jazzi/dist/Either/types";
import { CineError } from "../CineError";
import { Either } from "jazzi";
import { getRandomToken } from "../../../misc/Utils";

export class AuthService {
    
    public login(username: string, password: string): Promise<EitherType<CineError, string>> {
        if (username.includes("jose")) {
            return Promise.resolve(Either.Right(getRandomToken()));
        }
        return Promise.resolve(Either.Left(CineError.NOT_AUTHORIZED));
    }

    public verify(accountToken: string): Promise<boolean> {
        return Promise.resolve(true);
    }
}