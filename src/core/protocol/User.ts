import { AccountFlags } from "cinerama-common/lib/protocol";

export default interface User {
  username: string;
  lastLogin: Date;
  rights: AccountFlags[];
}
