import React, { useState, useCallback, useRef, useEffect, memo } from 'react';
import { searchCompanies, Fortune500Company, FORTUNE_500_COMPANIES } from '../data/fortune500';
import './Fortune500Selector.css';

interface Fortune500SelectorProps {
  onSelect: (company: Fortune500Company) => void;
  selectedCompany: Fortune500Company | null;
  disabled?: boolean;
}

// Memoize initial companies list
const INITIAL_COMPANIES = FORTUNE_500_COMPANIES.slice(0, 10);

const Fortune500Selector: React.FC<Fortune500SelectorProps> = ({
  onSelect,
  selectedCompany,
  disabled = false,
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<Fortune500Company[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced search as user types
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Debounce search for better performance
    searchTimeoutRef.current = setTimeout(() => {
      if (value.trim()) {
        const searchResults = searchCompanies(value);
        setResults(searchResults);
        setIsOpen(searchResults.length > 0);
        setHighlightedIndex(0);
      } else {
        // Show popular companies when input is empty but focused
        setResults(INITIAL_COMPANIES);
        setIsOpen(true);
      }
    }, 100); // 100ms debounce
  }, []);
  
  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setResults(INITIAL_COMPANIES);
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < results.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : 0);
        break;
      case 'Enter':
        e.preventDefault();
        if (results[highlightedIndex]) {
          selectCompany(results[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
    }
  }, [isOpen, results, highlightedIndex]);

  // Select a company
  const selectCompany = useCallback((company: Fortune500Company) => {
    setQuery(company.name);
    setIsOpen(false);
    onSelect(company);
  }, [onSelect]);

  // Handle focus
  const handleFocus = useCallback(() => {
    if (!query.trim()) {
      setResults(INITIAL_COMPANIES);
    } else {
      setResults(searchCompanies(query));
    }
    setIsOpen(true);
  }, [query]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Scroll highlighted item into view
  useEffect(() => {
    if (isOpen && dropdownRef.current) {
      const highlighted = dropdownRef.current.querySelector('.highlighted');
      if (highlighted) {
        highlighted.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex, isOpen]);

  // Get sector color
  const getSectorColor = (sector: string): string => {
    const colors: Record<string, string> = {
      'Technology': '#4A90D9',
      'Healthcare': '#50C878',
      'Financial': '#FFD700',
      'Energy': '#FF6B35',
      'Consumer Goods': '#9B59B6',
      'Industrials': '#7F8C8D',
      'Telecommunications': '#E74C3C',
      'Transportation': '#3498DB',
      'Media': '#E91E63',
      'Consumer Services': '#00BCD4',
      'Real Estate': '#795548',
      'Materials': '#607D8B',
      'Automotive': '#FF5722',
    };
    return colors[sector] || '#888888';
  };

  // Get risk icon
  const getRiskIcon = (risk: string): string => {
    const icons: Record<string, string> = {
      'environmental': '🌍',
      'climate': '🔥',
      'labor': '👷',
      'safety': '⚠️',
      'regulatory': '⚖️',
      'data-privacy': '🔒',
      'cybersecurity': '🛡️',
      'financial': '💰',
      'health': '🏥',
      'geopolitical': '🌐',
      'antitrust': '⚔️',
      'supply-chain': '📦',
      'reputation': '📉',
      'product-liability': '🏭',
      'misinformation': '📰',
    };
    return icons[risk] || '⚡';
  };

  return (
    <div className="fortune500-selector">
      <div className="selector-input-wrapper">
        <input
          ref={inputRef}
          type="text"
          className={`selector-input ${selectedCompany ? 'has-selection' : ''}`}
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          placeholder="Search Fortune 500 companies..."
          disabled={disabled}
          autoComplete="off"
        />
        {selectedCompany && (
          <div 
            className="selected-indicator"
            style={{ backgroundColor: getSectorColor(selectedCompany.sector) }}
          >
            {selectedCompany.ticker || selectedCompany.name.slice(0, 3).toUpperCase()}
          </div>
        )}
        <div className="selector-icon">
          {isOpen ? '▲' : '▼'}
        </div>
      </div>

      {isOpen && results.length > 0 && (
        <div ref={dropdownRef} className="selector-dropdown">
          {results.map((company, index) => (
            <div
              key={company.name}
              className={`selector-option ${index === highlightedIndex ? 'highlighted' : ''}`}
              onClick={() => selectCompany(company)}
              onMouseEnter={() => setHighlightedIndex(index)}
            >
              <div className="option-main">
                <div className="option-name">
                  <span className="company-name">{company.name}</span>
                  {company.ticker && (
                    <span className="company-ticker">{company.ticker}</span>
                  )}
                </div>
                <div className="option-meta">
                  <span 
                    className="company-sector"
                    style={{ color: getSectorColor(company.sector) }}
                  >
                    {company.industry}
                  </span>
                </div>
              </div>
              <div className="option-risks">
                {company.riskProfile.slice(0, 3).map(risk => (
                  <span key={risk} className="risk-badge" title={risk}>
                    {getRiskIcon(risk)}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedCompany && (
        <div className="selected-company-card">
          <div className="card-header">
            <div className="card-title">
              <span className="card-name">{selectedCompany.name}</span>
              {selectedCompany.ticker && (
                <span className="card-ticker">{selectedCompany.ticker}</span>
              )}
            </div>
            <span 
              className="card-sector"
              style={{ backgroundColor: getSectorColor(selectedCompany.sector) }}
            >
              {selectedCompany.sector}
            </span>
          </div>
          <p className="card-description">{selectedCompany.description}</p>
          <div className="card-risks">
            <span className="risks-label">Risk Profile:</span>
            <div className="risks-list">
              {selectedCompany.riskProfile.map(risk => (
                <span key={risk} className="risk-tag">
                  {getRiskIcon(risk)} {risk}
                </span>
              ))}
            </div>
          </div>
          <button 
            className="clear-selection-btn"
            onClick={() => {
              setQuery('');
              onSelect(null as unknown as Fortune500Company);
            }}
          >
            Clear Selection
          </button>
        </div>
      )}
    </div>
  );
};

export default memo(Fortune500Selector);
