interface TokenManager {
  token(): Promise<string>;
}

export default TokenManager;