import React from 'react';
import { Search, Bell, Plus, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { fabricService } from '../services/fabricService';

const TopHeader: React.FC = () => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [searchResults, setSearchResults] = React.useState<any[]>([]);
  const [showResults, setShowResults] = React.useState(false);
  const currentUser = fabricService.getCurrentUser();

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    if (value.length > 2) {
      // Mock search - in production, query blockchain
      const mockResults = [
        { id: 'P001', name: 'John Doe', type: 'Patient' },
        { id: 'P002', name: 'Jane Smith', type: 'Patient' },
        { id: 'R001', name: 'Lab Result - Blood Work', type: 'Record' }
      ].filter(r => 
        r.name.toLowerCase().includes(value.toLowerCase()) ||
        r.id.toLowerCase().includes(value.toLowerCase())
      );
      setSearchResults(mockResults);
      setShowResults(true);
    } else {
      setShowResults(false);
    }
  };

  return (
    <header className="top-header">
      <div className="search-bar" style={{ position: 'relative' }}>
        <Search size={20} color="var(--text-muted)" />
        <input 
          type="text" 
          className="search-input" 
          placeholder="Search patients, records, or ID..." 
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => searchTerm.length > 2 && setShowResults(true)}
        />
        
        {showResults && searchResults.length > 0 && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: '4px',
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-lg)',
            zIndex: 1000,
            maxHeight: '300px',
            overflowY: 'auto'
          }}>
            {searchResults.map((result, idx) => (
              <Link
                key={idx}
                to={result.type === 'Patient' ? `/patients/${result.id}` : '#'}
                onClick={() => setShowResults(false)}
                style={{
                  display: 'block',
                  padding: '12px 16px',
                  borderBottom: idx < searchResults.length - 1 ? '1px solid var(--border)' : 'none',
                  textDecoration: 'none',
                  color: 'inherit',
                  transition: 'background-color var(--transition-fast)'
                }}
                onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--surface-hover)'}
                onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'}
              >
                <div style={{ fontSize: '14px', fontWeight: '500' }}>{result.name}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{result.type} · {result.id}</div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="header-actions">
        {currentUser && (
          <div style={{ 
            fontSize: '13px', 
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            paddingRight: '16px',
            borderRight: '1px solid var(--border)'
          }}>
            <span style={{ 
              width: '8px', 
              height: '8px', 
              backgroundColor: '#10b981', 
              borderRadius: '50%'
            }}></span>
            {currentUser.name}
          </div>
        )}
        
        <Link to="/notifications" className="icon-btn" title="Notifications">
          <Bell size={20} />
          <span className="badge" style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            color: 'white', 
            fontSize: '10px', 
            width: '16px', 
            height: '16px', 
            top: '2px', 
            right: '2px' 
          }}>2</span>
        </Link>

        <Link to="/scan" className="icon-btn" title="QR Scanner">
          <Zap size={20} />
        </Link>
        
        <Link to="/patients/new" className="btn btn-primary" title="Add New Patient">
          <Plus size={18} />
          <span>New Patient</span>
        </Link>
      </div>
    </header>
  );
};

export default TopHeader;
