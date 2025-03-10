import { createContext, useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import useStore from '../store/useStore';

// Create the context
const StoreContext = createContext();

// Create a provider component
export function StoreProvider({ children }) {
  const store = useStore();
  
  // Initialize authentication when the app loads
  useEffect(() => {
    // Initialize authentication from localStorage
    store.initAuth();
    
    // Check authentication status with the server
    store.checkAuth();
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  return (
    <StoreContext.Provider value={store}>
      {children}
    </StoreContext.Provider>
  );
}

// Add prop types
StoreProvider.propTypes = {
  children: PropTypes.node.isRequired
};

// Custom hook to use the store context
export function useStoreContext() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStoreContext must be used within a StoreProvider');
  }
  return context;
}

// Higher Order Component to wrap components that need store access
export function withStore(Component) {
  const WithStoreComponent = (props) => {
    const storeContext = useStoreContext();
    return <Component {...props} store={storeContext} />;
  };
  
  WithStoreComponent.displayName = `WithStore(${Component.displayName || Component.name || 'Component'})`;
  
  return WithStoreComponent;
} 