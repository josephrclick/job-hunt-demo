import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, X, Sparkles, Command } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SmartSearchProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  debouncedSearchTerm: string;
  placeholder?: string;
  resultsCount?: number;
  totalCount?: number;
}

const SEARCH_SUGGESTIONS = [
  'Frontend Engineer',
  'React Developer', 
  'Sales Engineer',
  'Product Manager',
  'TypeScript',
  'Remote',
  'San Francisco',
  'Startup'
];

export function SmartSearch({
  searchTerm,
  onSearchChange,
  debouncedSearchTerm,
  placeholder = "Search jobs, companies, skills...",
  resultsCount,
  totalCount
}: SmartSearchProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Show suggestions when focused and no search term
  useEffect(() => {
    setShowSuggestions(isFocused && !searchTerm);
  }, [isFocused, searchTerm]);
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      // Cmd/Ctrl + / to focus search
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    
    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, []);
  
  const handleSuggestionClick = (suggestion: string) => {
    onSearchChange(suggestion);
    setShowSuggestions(false);
    inputRef.current?.blur();
  };
  
  const clearSearch = () => {
    onSearchChange('');
    inputRef.current?.focus();
  };
  
  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 150)}
          className="pl-10 pr-20 h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
        />
        
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
          {/* Search term indicator */}
          <AnimatePresence>
            {searchTerm && searchTerm !== debouncedSearchTerm && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
              >
                <div className="h-2 w-2 bg-yellow-500 rounded-full animate-pulse" />
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Results count */}
          {resultsCount !== undefined && totalCount !== undefined && debouncedSearchTerm && (
            <Badge variant="secondary" className="text-xs">
              {resultsCount}/{totalCount}
            </Badge>
          )}
          
          {/* Clear button */}
          <AnimatePresence>
            {searchTerm && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: "spring", duration: 0.2 }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearSearch}
                  className="h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Keyboard shortcut hint */}
          {!isFocused && !searchTerm && (
            <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded-sm border opacity-60">
              ⌘/
            </kbd>
          )}
        </div>
      </div>
      
      {/* Search Suggestions */}
      <AnimatePresence>
        {showSuggestions && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: "spring", duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-lg shadow-lg z-50 overflow-hidden"
          >
            <div className="p-3 border-b border-border">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Sparkles className="h-4 w-4" />
                <span>Popular searches</span>
              </div>
            </div>
            <div className="p-2 max-h-48 overflow-y-auto">
              {SEARCH_SUGGESTIONS.map((suggestion, index) => (
                <motion.button
                  key={suggestion}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full text-left px-3 py-2 rounded-md hover:bg-muted/50 transition-colors text-sm flex items-center gap-2 group"
                >
                  <Search className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors" />
                  {suggestion}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}