import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { getUser, signIn as sendSignInRequest } from '../api/auth';
import { post, useApi } from '../helpers/useApi';


function AuthProvider(props) {
  const { makeRequest, loading, error, resetError } = useApi();
  const [user, setUser] = useState();
  // const [loading, setLoading] = useState(true);
  // const [error, setError] = useState(null);

  useEffect(() => {
    const user = localStorage.getItem('user');
    const accessToken = localStorage.getItem('accessToken');
    if (user && accessToken) {
      setUser(JSON.parse(user));
    }
  }, []);

  // const signIn = useCallback(async (email, password) => {
  //   setLoading(true);
  //   setError(null);

  //   try {
  //     const response = await sendSignInRequest(email, password);
  //     setUser(response);
  //     localStorage.setItem('user', JSON.stringify(response));
  //   } catch (err) {
  //     throw Error(err);
  //   } finally {
  //     setLoading(false);
  //   }
  // }, []);

  // const signOut = useCallback(() => {
  //   setUser(null);
  //   localStorage.removeItem('user');
  // }, []);

  const signIn = useCallback(async (email, password) => {
    try {
      const response = await makeRequest('Authenticate/Post', post, { userName: email, password });
      setUser(response);
      localStorage.setItem('user', JSON.stringify({ UserGroupID: response.UserGroupID, UserID: response.UserID, UserName: response.UserName }));
      localStorage.setItem('accessToken', response.AuthenticateToken);
      return response;
    } catch (err) {
      throw Error(err); // Propagate error for further handling in components
    }
  }, [makeRequest]);

  const signOut = useCallback(() => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
  }, []);


  return (
    // <AuthContext.Provider value={{ user, signIn, signOut, loading }} {...props} />
    <AuthContext.Provider value={{ user, signIn, signOut, loading, error, resetError }} {...props} />
  );
}

const AuthContext = createContext({ loading: false });
const useAuth = () => useContext(AuthContext);

export { AuthProvider, useAuth }
