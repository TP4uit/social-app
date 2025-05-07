import { useSelector, useDispatch } from 'react-redux';
import { login, logout } from '../redux/actions/authActions';

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, loading, error, isAuthenticated } = useSelector(state => state.auth);

  const handleLogin = (email, password) => {
    return dispatch(login(email, password));
  };

  const handleLogout = () => {
    return dispatch(logout());
  };

  return {
    user,
    loading,
    error,
    isAuthenticated,
    login: handleLogin,
    logout: handleLogout,
  };
};
