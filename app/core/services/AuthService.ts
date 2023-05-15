import { Either as EitherType } from "jazzi/dist/Either/types";
import { Either } from "jazzi";
import { getRandomToken } from "cinerama-common/lib/misc/Utils";
import { AccountFlags } from "./AccountFlags";
import { CineError } from "cinerama-common/lib/protocol";

class TwoWayMap<K, V> {
    private map = new Map<K, V>();
    private reverseMap = new Map<V, K>();

    public set(key: K, value: V) {
        const oldValue = this.map.get(key); 
        if (oldValue) {
            this.reverseMap.delete(oldValue);
        }
        this.reverseMap.set(value, key);
        return this.map.set(key, value);
    }
    public get(key: K) { return this.map.get(key); }
    public revGet(value: V) { return this.reverseMap.get(value); }
}

export class AuthService {

    private dirtyDb = new TwoWayMap<string, string>();
    
    public login(username: string, password: string): Promise<EitherType<CineError, string>> {
        if (username.includes("jose")) {
            const token = getRandomToken();
            this.dirtyDb.set(username, token);
            return Promise.resolve(Either.Right(token));
        }
        return Promise.resolve(Either.Left(CineError.INVALID_CREDENTIALS));
    }

    private static serializeFlags(accountFlags: AccountFlags[]): string[] {
        return accountFlags.map(accountFlag => AccountFlags[accountFlag]);
    }

    public verify(accountToken: string): Promise<EitherType<CineError, string[]>> {
        const username = this.dirtyDb.revGet(accountToken);
        if (username) {
            return Promise.resolve(Either.Right(AuthService.serializeFlags([AccountFlags.ADD_STREAM, AccountFlags.DOWNLOAD_STREAM, AccountFlags.GET_ALL_STREAMS, AccountFlags.GET_STREAM])));
        }
        return Promise.resolve(Either.Left(CineError.INVALID_CREDENTIALS)); 
    }
}