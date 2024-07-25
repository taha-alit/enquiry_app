import { authHeader } from "./authHeader";
import { handleResponse } from "./handleResponse";

const apiUrl = '/api';

const post = async (endpoint, body) => {
    const requestOptions = {
        method: "POST",
        headers: authHeader(),
        body: JSON.stringify(body),
    };
    const response = await fetch(`${apiUrl}/${endpoint}`, requestOptions);
    return handleResponse(response);
    // return fetch(url, requestOptions).then(handleResponse).then(res => res.json());
}

const get = (url) => {
    const requestOptions = {
        method: "GET",
        headers: authHeader(),
    };
    return fetch(url, requestOptions).then(handleResponse).then(res => res.json());
}

export const fetchWrapper = {
    get,
    post
};