<template>
    <div class="main">
        <form @submit.prevent="saveTutorial">
			<div class="up">
				<div class="left">
					<div class="username">
						<label for="username">username</label>
						<input type="text" id="username" required v-model="user.username" name="username" />
					</div>
					<div class="setting">
						<label>settings game</label>
						<p id="bouton" @click="reset">Reset game setting</p>
					</div>
					<div class="color">
						<ul>
							<li>
							<label>field</label>
							<input  type="color" v-model="user.floor" ref="floor">							
							</li>
							<li>
								<label>paddle1</label>
							<input  type="color" v-model="user.paddle1" ref="paddle1">
							</li>
							<li>
								<label>paddle2</label>
								<input  type="color" v-model="user.paddle2" ref="paddle2">
							</li>
							<li>
								<label>ball</label>
								<input  type="color" v-model="user.ball" ref="ball">								
							</li>
							<li>
								<label>wall</label>
								<input  type="color" v-model="user.wall" ref="wall">								
							</li>
							<li>
								<label>forme de la balle </label>
								<input type="radio" name="forme" v-on:click="rond = true, carre = false" ref="formee" id="rond">
								<label>rond</label>
								<input type="radio" name="forme" v-on:click="carre = true, rond = false" ref="forme" id="carre">
								<label>carre</label>
							</li>
						</ul>
					</div>
				</div>
				<div class="right">
					<div class="imgchoose">
<<<<<<< HEAD
						<img v-bind:src="user.picture"/>
=======
						<img v-bind:src="user.picture" height="100" />
>>>>>>> 1b2ca643f22e5ac71caa24b45aa8e4b8378fecbf
						<label v-on:click="change()" for="file" class="edit">Edit Profile</label>
						<input type="file" ref="file" id="file">
					</div>
					<p>2fa</p>
					<input type="checkbox" @change="onTwoFactorChange($event)" v-model="two_factor_checkbox.value"/>
					{{two_factor_checkbox.value ? "2fa enabled" : null}}
					<img v-if="two_factor_checkbox.value" :src="two_factor_checkbox.qrcode" alt="qrcode">
				</div>
			</div>
			<div class="down">
				<button type="submit" class="btn btn-success">SAVE</button>
			</div>
		</form>
		
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import axios from 'axios'
import router from '../router'
import authHeader from '@/services/auth-header'
export default defineComponent({
    name: 'profile_update',
    data () {
        return {
			carre : false,
			rond : false,
            user: {
                username: '',
                picture: '',
				ball : '',
				wall: '',
				paddle1: '',
				paddle2: '',
				floor: '',
<<<<<<< HEAD
				forme: '',
=======
				forme: ''
>>>>>>> 1b2ca643f22e5ac71caa24b45aa8e4b8378fecbf
           },
			two_factor_checkbox: {
				value: false,
				qrcode: "",
			}
        }
    },
    methods: {
		reset(){
			this.rond = false;
			document.getElementById("carre").checked = true;
			this.carre = true;
			this.user.ball = "#ffffff";
			this.user.wall = "#ee4266";
			this.user.paddle1 = "#ffff00";
			this.user.paddle2 = "#ffffff";
			this.user.floor = "#172a3a";	
		},

		change(){
			
		},

        userId() {
            let user = JSON.parse(localStorage.getItem('user') || '');
            if (user) {
                return user.id;
            } else {
                return '';
            }
        },
        saveTutorial() {
			let form_data = new FormData()
			form_data.append('username', this.user.username)
			form_data.append('file', this.$refs.file.files[0])
			form_data.append('floor', this.$refs.floor.value)
			form_data.append('paddle1', this.$refs.paddle1.value)
			form_data.append('paddle2', this.$refs.paddle2.value)
			form_data.append('ball', this.$refs.ball.value)
			form_data.append('wall', this.$refs.wall.value)
			if (this.carre){
				form_data.append('forme', "carre")
				console.log("rond ==> ", this.rond, "carre ==> ", this.carre)
			}
			else{
				form_data.append('forme', "rond")
				console.log("rond ==> ", this.rond, "carre ==> ", this.carre)
			}
			let header = authHeader()
			header['Content-type'] = 'multipart/form-data'
            axios.post(import.meta.env.VITE_BACKEND_URI + '/users/' + this.userId(), form_data, {headers: authHeader()})
                .then((response) => {
					let user = JSON.parse(localStorage.getItem('user'))
					user.profile_completed = true;
                    localStorage.setItem('user', JSON.stringify(user));
                    router.push('/profile')
                })
                .catch((e: Error) => {
                    console.log(e);
                })
        },
		onTwoFactorChange(e) {
			if (this.two_factor_checkbox.value) {

				axios.put(import.meta.env.VITE_BACKEND_URI + "/auth/2fa/" + this.userId())
				.then(res => {
					console.log(res.data.qrcode)
					this.two_factor_checkbox.qrcode = res.data.qrcode
				})
				.catch(err => {
				})
			}
			else {
				axios.delete(import.meta.env.VITE_BACKEND_URI + "/auth/2fa/" + this.userId())
				.then(res => {
					console.log(res);
				})
				.catch(err => {
				})
			}
		},
    },
    mounted () {
		let user = JSON.parse(localStorage.getItem('user'))
		if (!user.profile_completed)
		{
			this.user.username = user.username;
			this.user.picture = user.picture;
			axios.get(import.meta.env.VITE_BACKEND_URI + '/users/' + this.userId(), { headers: authHeader() })
			.then((response) => {
				this.user.ball = response.data.presets.presets[0].ball;
				this.user.wall = response.data.presets.presets[0].wall;
				this.user.paddle1 = response.data.presets.presets[0].paddle1;
				this.user.paddle2 = response.data.presets.presets[0].paddle2;
				this.user.floor = response.data.presets.presets[0].floor;
				console.log("rr", response.data.forme)
				if(response.data.forme == "carre"){
					document.getElementById("carre").checked = true;
					this.carre = true;
					this.rond = false
				}
				else{
					document.getElementById("rond").checked = true;
					this.carre = false;
					this.rond = true
				}
				
			})
			.catch((e: Error) => {
				console.log(e);
			});
		}
		else
		{
			axios.get(import.meta.env.VITE_BACKEND_URI + '/users/' + this.userId(), { headers: authHeader() })
			.then((response) => {
				console.log('response : ', response.data.presets.presets[0].paddle1);
				this.user.username = response.data.username;
				this.user.picture = response.data.picture;
				this.user.ball = response.data.presets.presets[0].ball;
				this.user.wall = response.data.presets.presets[0].wall;
				this.user.paddle1 = response.data.presets.presets[0].paddle1;
				this.user.paddle2 = response.data.presets.presets[0].paddle2;
				this.user.floor = response.data.presets.presets[0].floor;
<<<<<<< HEAD
				this.two_factor_checkbox.value = response.data.twofa
				this.two_factor_checkbox.qrcode = response.data.qrcode
				console.log('QR=>', this.two_factor_checkbox.qrcode)
=======
>>>>>>> 1b2ca643f22e5ac71caa24b45aa8e4b8378fecbf
				console.log("rond -----> ", response.data.forme)
				if(response.data.forme == "carre"){
					document.getElementById("carre").checked = true;
					this.carre = true;
					this.rond = false
				}
				else{
					document.getElementById("rond").checked = true;
					this.carre = false;
					this.rond = true
				}

			})
			.catch((e: Error) => {
				console.log(e);
			});
		}
	}
})
</script>

<style scoped>
	.main{
		width: 100%;
		height: 100vh;
		position: relative;
		font-family: 'Inter';
		font-style: normal;
		font-weight: 700;
		font-size: 16px;
		line-height: 19px;
	}
	
	input[type="file"] {
	    display: none;
	}
	
	form{
		position: relative;
		width: 60%;
		height: 70%;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		background: #272422;
		color: #B4B3B2;
		display: flex;
		flex-direction: column;
		transition: ease-in 0.7s width;
		border-radius: 10px;
	}
	.up{
		width: 100%;
		height: 80%;
		position: relative;
		display: flex;
	}

	.up .left{
		width: 70%;
		height: 100%;
	}

	.up .left .username{
		width: max-width;
		margin-top: 20%;
		display: flex;
		color: #B4B3B2;

	}

	.up .left .username label{
		margin-left: 20%;
	}
	.up .left .username input{
		margin-left: 10%;
		width: 30%;
		height: 24px;
		background: #3D3B39;
		color: #B4B3B2;
		border-radius: 5px;
		border: none;
		font-family: 'Inter';
		font-style: normal;
		font-weight: 700;
		font-size: 16px;
		line-height: 19px;
	}

	.up .left .setting{
		width: max-width;
		display: flex;
		color: #B4B3B2;
		margin-top: 5%;
	}

	.up .left .setting label{
		margin-left: 20%;
	}

	.up .left .setting p{
		margin-left: 20%;
		width: 30%;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(196, 196, 196, 0.3);
		border-radius: 20px;
		cursor: pointer;
		transition: color ease 0.5s;
	}

	.up .left .setting p:hover{
		color: #7EA750;

	}
	.up .left .color{
		position: relative;
		margin-top: 5%;
		width: max-width;
		margin-left: 25%;
	}

	.up .left .color ul{
		position: relative;
		width: 100%;
		list-style: none;
	}
	
	.up .left .color li {
		width: 70%;
		margin-top: 15px;
		display: flex;
		justify-content: space-between;
	}

	.up .left .color li input{
		border: none;
		padding: 0;
	}

	.up .right{
		width: 30%;
		height: 100%;
	}

	.up .right .imgchoose{
		width: 90%;
		height: 30%;
		margin-top: 20%;
		position: relative;
		overflow: hidden;
	}

	.up .right .imgchoose img{
		position: absolute;
		width: 100%;
		height: auto;	
		bottom: 0;
		
	}

	.up .right .imgchoose input{
		position: absolute;
		width: 100%;
		bottom: 0;

	}
	.up .right .imgchoose .edit{
		position: absolute;
		bottom: 0;	
		width: 100%;
		background: #312E2A;
		opacity: 0.8;
		color: white;
		display: flex;
		justify-content: center;
		align-items: center;
		cursor: pointer;
	}
	.down{
		width: 100%;
		height: 20%;
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;
	}

	.down button{
		width: 137px;
		height: 31px;
		background: #7EA750;
		border-radius: 5px;
		border: none;
		font-family: 'Inter';
		font-style: normal;
		font-weight: 700;
		font-size: 25px;
		line-height: 30px;
		color: white;
		cursor: pointer;
	}
	.down button:hover{
		background: white;
		color: #7EA750;
	}

	@media (max-width: 1100px) {
		form{
			width: 90%;
		}
	}
</style>	