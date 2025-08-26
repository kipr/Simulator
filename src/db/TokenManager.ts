import { Auth } from "firebase/auth";

interface TokenManager {
  token(): Promise<string>;
  auth(): Auth | null;
}

export default TokenManager;