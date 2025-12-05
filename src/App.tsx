import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { RealBitteMarketplace } from './components/RealBitteMarketplace';
import { MyNearWalletService } from './services/myNearWalletService';

function App() {
  const [wallet, setWallet] = useState<MyNearWalletService | null>(null);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [accountId, setAccountId] = useState('');

  useEffect(() => {
    // Initialize MyNearWallet service
    const initWallet = async () => {
      const myNearWallet = new MyNearWalletService({
        network: 'testnet', // Use testnet for testing
        contractName: 'bitte-ai-marketplace'
      });
      
      try {
        await myNearWallet.initialize();
        setWallet(myNearWallet);
        
        // Check if already signed in
        if (myNearWallet.isSignedIn()) {
          setIsSignedIn(true);
          setAccountId(myNearWallet.getAccountId());
        }
      } catch (error) {
        console.log('MyNearWallet not connected yet:', error);
        setWallet(myNearWallet);
      }
    };

    initWallet();
  }, []);

  const handleSignIn = async () => {
    if (wallet) {
      try {
        await wallet.signIn();
        if (wallet.isSignedIn()) {
          setIsSignedIn(true);
          setAccountId(wallet.getAccountId());
        }
      } catch (error) {
        console.error('Failed to connect NEAR wallet:', error);
      }
    }
  };

  const handleSignOut = async () => {
    if (wallet) {
      await wallet.signOut();
      setIsSignedIn(false);
      setAccountId('');
    }
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-900">
        <header className="bg-gray-800 shadow">
          <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-white">
              Real Bitte AI Marketplace
            </h1>
            <p className="text-gray-300 mt-2">
              Real NEAR Wallet • TensorFlow.js Biometrics • AI Shader Generation • Filecoin Storage • Soulbound NFTs
            </p>
            
            {/* Wallet Status */}
            <div className="mt-4 flex items-center justify-between">
              <nav>
                <Link to="/" className="text-pink-400 hover:text-pink-300 mr-6">
                  🎯 Real Bitte Marketplace
                </Link>
              </nav>
              
              <div className="flex items-center space-x-4">
                {isSignedIn ? (
                  <>
                    <span className="text-green-400 text-sm">
                      Connected: {accountId}
                    </span>
                    <button
                      onClick={handleSignOut}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm transition-colors"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleSignIn}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm transition-colors"
                  >
                    Connect MyNearWallet
                  </button>
                )}
              </div>
            </div>
          </div>
        </header>
        
        <main>
          <Routes>
            <Route 
              path="/" 
              element={
                wallet ? (
                  <RealBitteMarketplace wallet={wallet} isSignedIn={isSignedIn} />
                ) : (
                  <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
                      <p className="text-gray-400">Initializing NEAR wallet...</p>
                    </div>
                  </div>
                )
              } 
            />
          </Routes>
        </main>
        
        <footer className="bg-gray-800">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
            <p className="text-center text-gray-400 text-sm">
              Real AI-powered marketplace with biometric data, Filecoin storage, and soulbound NFTs
            </p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;