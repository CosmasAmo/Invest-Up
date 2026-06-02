import { useContext } from 'react';
import { StoreContext } from './storeContext';

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