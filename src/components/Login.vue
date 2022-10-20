<template>
    <div class="login">
        <button @click="redirect42" class="buttonLogin">Login</button>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import axios from 'axios'
import router from '../router'
import { io } from  'socket.io-client'
import authHeader from '@/services/auth-header'
import { Socket } from 'engine.io-client'

export default defineComponent({
    name: 'login',
	data() {
		return {
			user: {
				id: ''
			}
		}
	},
    methods: {
        parseJwt (token: any) {
            var base64Url = token.split('.')[1];
            var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            var jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            return JSON.parse(jsonPayload);
        },
		redirect42 () {
			if (import.meta.env.VITE_REDIRECT_URI) {
				const path: string = 'https://api.intra.42.fr/oauth/authorize?client_id=' + import.meta.env.VITE_CLIENT_ID + '&redirect_uri=' + encodeURIComponent(import.meta.env.VITE_REDIRECT_URI) + '&response_type=code'
				window.location.href = path
			}
		},
        // userId() {
        //     let user = JSON.parse(localStorage.getItem('user') || '');
        //     if (user) {
        //         return user.id;
        //     } else {
        //         return '';
        //     }
        // },
    },
	mounted() {
        let code = window.location.search
        let id;
        if (code)
        {
            axios.post(import.meta.env.VITE_BACKEND_URI + '/auth/42', {code: code.substring(6)})
                .then((response: any) => {
                    if (response.data) {
                        console.log(response.data)
                        localStorage.setItem('user', JSON.stringify(response.data));
                        this.user.id = response.data.id
                        console.log('ID USER', this.user.id)
                        if (response.data.twofa_enabled == true)
                            router.push('/tfa_login')
                        else
                            router.push('/profile')
                        const socket = io(import.meta.env.VITE_BACKEND_URI);
                        socket.emit('connection', {userId: response.data.id , value : true}, (response:any) => { console.log('ON') })
                    }
                })
                .catch((errors) => {
                    console.log(errors)
                   // router.push('/')
                }).finally(() => {
                console.log('labas')
                console.log('ID USER', this.user.id)
                axios.get(import.meta.env.VITE_BACKEND_URI + '/auth/user/' + this.user.id)
                .then((response: any) => {
                if (response.data) {console.log('GET USER INFOS', response.data)}
                }) 
            })
        }
    }
})
</script>
<style scoped>
    .login{
        position: absolute;
        top: 50%;
        left: 50%;
        margin-right: -50%;
        transform: translate(-50%, -50%);
        width:30%;
    }
    .buttonLogin{
        display:flex;
        align-items: center;
        justify-content:center;
        border:none;
        padding: 10px;
        width: 100%;
        background-color: rgb(10, 158, 10);
        color:white;
        cursor:pointer;
        text-transform: uppercase;
        font-size: 1.2em;
        font-weight: 400;
        border-radius:5px;
    }
    .buttonLogin:hover{
        opacity: 0.8;
    }
</style>>
