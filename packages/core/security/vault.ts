import crypto from 'crypto';

/**
 * JARVIS Security Vault
 * Implements strict credential isolation:
 * The AI model NEVER receives raw credentials. All integrations
 * resolve authentication tokens securely within isolated execution layers.
 */
class SecurityVault {
  private secrets: Map<string, string> = new Map();
  private vaultKey: Buffer;

  constructor() {
    // Ephemeral master key in memory, salted per runtime session
    this.vaultKey = crypto.randomBytes(32);
    this.initializeDefaultTokens();
  }

  private initializeDefaultTokens() {
    // Populate existing environment tokens safely into the vault
    if (process.env.GEMINI_API_KEY) {
      this.storeSecret('gemini_api_key', process.env.GEMINI_API_KEY);
    }
    if (process.env.APP_URL) {
      this.storeSecret('app_url', process.env.APP_URL);
    }
    // Simulation / sandbox tokens for surfaces
    this.storeSecret('android_bridge_key', 'jarvis-android-mtls-token-77a');
    this.storeSecret('windows_bridge_key', 'jarvis-win-loopback-pipe-88b');
    this.storeSecret('whatsapp_cloud_key', 'jarvis-meta-webhook-verify-99c');
  }

  private encrypt(text: string): { iv: string; content: string } {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', this.vaultKey, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return { iv: iv.toString('hex'), content: encrypted };
  }

  private decrypt(ivHex: string, encryptedHex: string): string {
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', this.vaultKey, iv);
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  public storeSecret(key: string, secretValue: string): void {
    const { iv, content } = this.encrypt(secretValue);
    this.secrets.set(key, `${iv}:${content}`);
  }

  public getSecret(key: string): string | null {
    const record = this.secrets.get(key);
    if (!record) return null;
    const [iv, content] = record.split(':');
    try {
      return this.decrypt(iv, content);
    } catch {
      return null;
    }
  }

  public hasSecret(key: string): boolean {
    return this.secrets.has(key);
  }

  public listRegisteredKeys(): string[] {
    return Array.from(this.secrets.keys()).map((k) => `vault://secrets/${k}`);
  }
}

export const securityVault = new SecurityVault();
export const vault = securityVault;
