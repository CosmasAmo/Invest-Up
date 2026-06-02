import PropTypes from 'prop-types';
import useStore from '../store/useStore';
import { StoreContext } from './storeContext';

// Create a provider component
export function StoreProvider({ children }) {
  const store = useStore();
  
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