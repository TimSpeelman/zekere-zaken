import dotenv from "dotenv";

dotenv.config();

export function requireFromEnv(key: string): string {
    if (!(key in process.env)) {
        throw new Error(`.env file is missing key '${key}'.`)
    }
    return process.env[key]!;
}
