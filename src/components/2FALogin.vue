<template>
    <div>
		<h2 class="title">TWO FACTOR AUTHENTIFICATION</h2>
		<input class="box" v-model="two_factor_checkbox.password"/>
		<button class="button" @click="twoFactorVerify">submit 2fa</button>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import axios from 'axios'
import router from '../router'
import authHeader from '@/services/auth-header'
export default defineComponent({
    name: '2FAlogin',
	data () {
        return {
			two_factor_checkbox: {
				password: "",
			}
        }
    },
	methods: {
        userId() {
            let user = JSON.parse(localStorage.getItem('user'));
            return user.id;
        },
		twoFactorVerify() {
			console.log("lol")
			axios.post(import.meta.env.VITE_BACKEND_URI + "/auth/2fa/", { password: this.two_factor_checkbox.password, id: this.userId() })
				.then(res => {
					console.log("mdr", res)
					let user = JSON.parse(localStorage.getItem('user'));
					localStorage.setItem('user', JSON.stringify(res.data));
					//user.twovalid = true
					console.log('ici')
					router.push('/profile')
					
				})
				.catch(err => {
					console.log(err)
					console.log("ptdr")
				})
		}
	}
})
</script>

<style scoped>
	 .box{
        display:flex;
        align-items: center;
        justify-content:center;
        border:none;
        padding: 8px;
        width: 30%;
        margin-left: 35%;
        margin-top: 7%;
        cursor:pointer;
        text-transform: uppercase;
        font-size: 1em;
        font-weight: 400;
        border-radius:5px;
    }

	.title{
        display:flex;
        align-items: center;
        justify-content:center;
		margin-top: 10%;
        border:none;
        color:aqua
    }

    /* .title::before,
    .title::after{
        background: #0a0908;
        color:#f7f7ff
    }

     .title::before{
        left:4px;
        text-shadow: -3px 0 #ff2e00;
        animation: glitch-anim 4s infinite linear alternate-reverse;
    }

    .title::after{
        left:-4px;
        text-shadow: 3px 0 #3454d1;
        animation: glitch-anim-2 4s infinite linear alternate-reverse;
    }

    @keyframes glitch-anim{
        0%{clip-path:insert(38% 0 46% 0);}
        5%{clip-path:insert(13% 0 88% 0);}
        10%{clip-path:insert(89% 0 3% 0);}
        15%{clip-path:insert(38% 0 46% 0);}
        20%{clip-path:insert(38% 0 46% 0);}
        25%{clip-path:insert(38% 0 46% 0);}
        30%{clip-path:insert(38% 0 46% 0);}
        35%{clip-path:insert(38% 0 46% 0);}
        40%{clip-path:insert(38% 0 46% 0);}
        45%{clip-path:insert(38% 0 46% 0);}
    } */
    .button{
        display:flex;
        align-items: center;
        justify-content:center;
        border:none;
        padding: 6px;
        width: 20%;
        margin-left: 40.5%;
        margin-top: 1%;
        background-color: rgb(133, 22, 212);
        color:white;
        cursor:pointer;
        text-transform: uppercase;
        font-size: 1em;
        font-weight: 400;
        border-radius:5px;
    }
    .button:hover{
        opacity: 0.8;
    }
</style>>