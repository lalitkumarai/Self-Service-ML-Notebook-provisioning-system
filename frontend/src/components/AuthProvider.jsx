import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      const parsedUser = JSON.parse(userInfo);
      setUser(parsedUser);
      // Set default auth header
      axios.defaults.headers.common['Authorization'] = `Bearer ${parsedUser.token}`;
    }
    setLoading(false);
  }, []);

  // Axios interceptor to handle token refresh
  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        if (user?.token) {
          config.headers['Authorization'] = `Bearer ${user.token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        // Prevent infinite loop
        if (error.response?.status === 401 && !originalRequest._retry) {
          // Don't attempt refresh if the failed request was login itself
          if (originalRequest.url.includes('/login')) {
             return Promise.reject(error);
          }

          originalRequest._retry = true;
          
          try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            if (!userInfo?.refreshToken) {
              logout();
              return Promise.reject(error);
            }

            const { data } = await axios.post('/auth/refresh', {
              refreshToken: userInfo.refreshToken
            });

            // Update user with new token
            const updatedUser = { ...userInfo, token: data.token };
            localStorage.setItem('userInfo', JSON.stringify(updatedUser));
            setUser(updatedUser);

            // Update header for the original request
            originalRequest.headers['Authorization'] = `Bearer ${data.token}`;
            axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
            
            return axios(originalRequest);
          } catch (refreshError) {
            console.error('Refresh token failed:', refreshError);
            logout();
            return Promise.reject(refreshError);
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, [user]);

  const login = async (email, password) => {
    const { data } = await axios.post('/auth/login', { email, password });
    setUser(data);
    localStorage.setItem('userInfo', JSON.stringify(data));
    axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    return data;
  };

  const register = async (username, email, password, role = 'user') => {
    const { data } = await axios.post('/auth/register', { username, email, password, role });
    setUser(data);
    localStorage.setItem('userInfo', JSON.stringify(data));
    axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    return data;
  };

  const logout = async () => {
    try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (userInfo?.refreshToken) {
            await axios.post('/auth/logout', { refreshToken: userInfo.refreshToken });
        }
    } catch (err) {
        console.error('Logout failed on backend:', err);
    }
    
    setUser(null);
    localStorage.removeItem('userInfo');
    delete axios.defaults.headers.common['Authorization'];
    // Optional: Redirect to login is handled by PrivateRoute usually
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAdmin: user?.role === 'admin'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
