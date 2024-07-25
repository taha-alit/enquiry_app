// export function handleResponse(response) {    
//     if (!response.ok) {        
//         if ([401].indexOf(response.status) !== -1) {
//             // auto logout if 401 Unauthorized or 403 Forbidden response returned from api
//             // window.location.replace(window.location.origin);
//             return Promise.reject(response.statusText);
//         }
//         console.log(response)
//         throw Error(response.statusText);
//     }
//     return response;
// }

export async function handleResponse(response) {
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || response.statusText);
    }
    return response.json();
};