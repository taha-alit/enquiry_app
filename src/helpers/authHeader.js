export function authHeader() {
    // return authorization header with jwt token
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
        return {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        };
    } else {
        return {
            'Content-Type': 'application/json'
        };
    }
}