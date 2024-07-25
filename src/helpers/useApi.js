// api.js (or useApi.js)
import { useState } from 'react';
import { authHeader } from './authHeader';

const apiUrl = 'https://localhost:7137/api'; // Base URL for your API

// Helper function to handle JSON response
const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.text();
    throw Error(error || response.statusText);
  }
  if(response.url.includes('Get') || response.url.includes('Authenticate')) {
    return response.json();
  } else {
    return response.text();
  }
};

// Generic function for POST requests
export const post = async (endpoint, body) => {
  const requestOptions = {
    method: 'POST',
    // headers: {
    //   'Content-Type': 'application/json',
    //   // You can add additional headers like authorization if needed
    // },
    headers: authHeader(),
    body: JSON.stringify(body),
  };

  const response = await fetch(`${apiUrl}/${endpoint}`, requestOptions);
  return handleResponse(response);
};

export const get = async (endpoint) => {
  const requestOptions = {
    method: 'GET',
    headers: authHeader(),
    // headers: {
    //   'Content-Type': 'application/json',
    //   // You can add additional headers like authorization if needed
    // }
  };

  const response = await fetch(`${apiUrl}/${endpoint}`, requestOptions);
  return handleResponse(response);
};

export const getById = async (endpoint) => {
  const requestOptions = {
    method: 'GET',
    headers: authHeader(),
    // headers: {
    //   'Content-Type': 'application/json',
    //   // You can add additional headers like authorization if needed
    // }
  };

  const response = await fetch(`${apiUrl}/${endpoint}`, requestOptions);
  return handleResponse(response);
};

export const put = async (endpoint, body) => {
  const requestOptions = {
    method: 'PUT',
    // headers: {
    //   'Content-Type': 'application/json',
    //   // You can add additional headers like authorization if needed
    // },
    headers: authHeader(),
    body: JSON.stringify(body),
  };

  const response = await fetch(`${apiUrl}/${endpoint}`, requestOptions);
  return handleResponse(response);
};

export const deleteById = async (endpoint) => {
  const requestOptions = {
    method: 'DELETE',
    headers: authHeader(),
    // headers: {
    //   'Content-Type': 'application/json',
    //   // You can add additional headers like authorization if needed
    // }
  };

  const response = await fetch(`${apiUrl}/${endpoint}`, requestOptions);
  return handleResponse(response);
};

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const makeRequest = async (endpoint, method, body) => {
    setLoading(true);
    try {
      const response = await method(endpoint, body);
      setLoading(false);
      return response;
    } catch (error) {
      setLoading(false);
      setError(error);
      throw error; // Propagate the error for further handling
    }
  };

  const resetError = () => setError(null);

  return {
    loading,
    error,
    makeRequest,
    resetError,
  };
};
