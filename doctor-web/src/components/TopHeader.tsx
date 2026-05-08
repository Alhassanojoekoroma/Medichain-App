import React from 'react';
import { Search, Bell, Plus, Wallet } from 'lucide-react';
import { connectWallet } from '../services/blockchain';

const TopHeader: React.FC = () => {
  const [address, setAddress] = React.useState<string | null>(null);

  const handleConnect = async () => {
    const addr = await connectWallet();
    setAddress(addr);
  };

  return (
    <header className="top-header">
      <div className="search-bar">
        <Search size={20} color="var(--text-muted)" />
        <input 
          type="text" 
          className="search-input" 
          placeholder="Search patients, records, or ID..." 
        />
      </div>

      <div className="header-actions">
        <button className="wallet-btn" onClick={handleConnect}>
          <Wallet size={18} />
          <span>{address ? `${address.substring(0, 6)}...${address.substring(38)}` : 'Connect Wallet'}</span>
        </button>
        
        <button className="icon-btn">
          <Bell size={20} />
          <span className="badge"></span>
        </button>
        
        <button className="btn-primary">
          <Plus size={18} />
          <span>New Record</span>
        </button>
      </div>
    </header>
  );
};

export default TopHeader;
