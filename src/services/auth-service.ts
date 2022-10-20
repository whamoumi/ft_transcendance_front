import axios from 'axios'
const API_URL = import.meta.env.VITE_BACKEND_URI

class AuthService {
    login(code: string) {
        return axios
            .post(API_URL + '42/auth', {code: code})
            .then((response) => {
                if (response.data.jwt)
                    localStorage.setItem('user', JSON.stringify(response.data))
                return response.data
            })
    }
    logout() {
        localStorage.removeItem('user')
    }
}

export default new AuthService()