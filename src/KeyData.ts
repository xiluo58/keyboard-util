import { KeyLog } from "./KeyLog";

export interface KeyData extends KeyLog {
    frequency?: number;
    color?: string;
}
