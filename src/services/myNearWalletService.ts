import { WalletConnection, connect, keyStores } from 'near-api-js';

export interface MyNearWalletConfig {
  network: 'mainnet' | 'testnet';
  contractName?: string;
}

export class MyNearWalletService {
  private walletConnection: WalletConnection | null = null;
  private near: any = null;
  private config: MyNearWalletConfig;

  constructor(config: MyNearWalletConfig) {
    this.config = config;
  }

  async initialize(): Promise<void> {
    try {
      const keyStore = new keyStores.BrowserLocalStorageKeyStore();
      
      const connectionConfig = {
        networkId: this.config.network,
        keyStore,
        nodeUrl: this.config.network === 'mainnet' 
          ? 'https://rpc.mainnet.near.org' 
          : 'https://rpc.testnet.near.org',
        walletUrl: this.config.network === 'mainnet'
          ? 'https://app.mynearwallet.com'
          : 'https://testnet.mynearwallet.com',
        helperUrl: this.config.network === 'mainnet'
          ? 'https://helper.mainnet.near.org'
          : 'https://helper.testnet.near.org',
        explorerUrl: this.config.network === 'mainnet'
          ? 'https://nearblocks.io'
          : 'https://testnet.nearblocks.io',
      };

      this.near = await connect(connectionConfig);
      this.walletConnection = new WalletConnection(this.near, 'bitte-ai-marketplace');
      
      console.log('MyNearWallet service initialized');
    } catch (error) {
      console.error('Failed to initialize MyNearWallet service:', error);
      throw error;
    }
  }

  async signIn(): Promise<void> {
    if (!this.walletConnection) {
      throw new Error('Wallet not initialized');
    }

    try {
      await this.walletConnection.requestSignIn({
        contractId: this.config.contractName || '',
        successUrl: window.location.href,
        failureUrl: window.location.href
      });
    } catch (error) {
      console.error('Failed to sign in:', error);
      throw error;
    }
  }

  async signOut(): Promise<void> {
    if (!this.walletConnection) {
      throw new Error('Wallet not initialized');
    }

    this.walletConnection.signOut();
    console.log('Signed out from MyNearWallet');
  }

  isSignedIn(): boolean {
    return this.walletConnection?.isSignedIn() || false;
  }

  getAccountId(): string {
    return this.walletConnection?.getAccountId() || '';
  }

  async getAccount(): Promise<any> {
    if (!this.walletConnection || !this.isSignedIn()) {
      throw new Error('Not signed in');
    }

    return this.walletConnection.account();
  }

  async getBalance(): Promise<string> {
    try {
      const account = await this.getAccount();
      const balance = await account.getAccountBalance();
      return balance.available;
    } catch (error) {
      console.error('Failed to get balance:', error);
      return '0';
    }
  }

  async callMethod(contractId: string, method: string, args: any = {}, gas?: string, deposit?: string): Promise<any> {
    try {
      const account = await this.getAccount();
      
      return await account.functionCall({
        contractId,
        methodName: method,
        args,
        gas: gas ? gas : '300000000000000',
        attachedDeposit: deposit ? deposit : '0'
      });
    } catch (error) {
      console.error(`Failed to call method ${method}:`, error);
      throw error;
    }
  }

  async viewMethod(contractId: string, method: string, args: any = {}): Promise<any> {
    try {
      const account = await this.getAccount();
      
      return await account.viewFunction(contractId, method, args);
    } catch (error) {
      console.error(`Failed to view method ${method}:`, error);
      throw error;
    }
  }

  async transferTokens(receiverId: string, amount: string): Promise<any> {
    try {
      const account = await this.getAccount();
      
      return await account.sendMoney(receiverId, amount);
    } catch (error) {
      console.error('Failed to transfer tokens:', error);
      throw error;
    }
  }

  // Get test NEAR from faucet
  async getTestNearFromFaucet(): Promise<boolean> {
    if (this.config.network !== 'testnet') {
      console.log('Faucet only available on testnet');
      return false;
    }

    try {
      const accountId = this.getAccountId();
      if (!accountId) {
        throw new Error('No account ID available');
      }

      // Use NEAR testnet faucet
      const faucetUrls = [
        `https://helper.testnet.near.org/account/${accountId}`,
        `https://near-faucet.io/api/faucet/${accountId}`,
        `https://faucet.near.org/api/faucet/${accountId}`
      ];

      for (const faucetUrl of faucetUrls) {
        try {
          const response = await fetch(faucetUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              accountId: accountId,
              amount: '10000000000000000000000000' // 10 NEAR in yoctoNEAR
            })
          });

          if (response.ok) {
            console.log(`Successfully requested test NEAR from ${faucetUrl}`);
            return true;
          }
        } catch (error) {
          console.warn(`Faucet ${faucetUrl} failed:`, error);
        }
      }

      console.log('All faucet attempts failed');
      return false;
    } catch (error) {
      console.error('Failed to get test NEAR from faucet:', error);
      return false;
    }
  }

  // Get connection status
  getConnectionStatus(): { connected: boolean; accountId: string; network: string } {
    return {
      connected: this.isSignedIn(),
      accountId: this.getAccountId(),
      network: this.config.network
    };
  }
}

export const myNearWalletService = new MyNearWalletService({ network: 'testnet' });