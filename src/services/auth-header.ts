export default function authHeader() {
    let storedUser = localStorage.getItem('user')
    let user = storedUser ? JSON.parse(storedUser) : {}
    if (user && user.jwt) {
        return { Authorization: 'Bearer ' + user.jwt };
    } else {
        return { Authorization: ''};
    }
}