<template>
    <div class="profile">
		<div class="information">
			<div class="img-profile">
				<div class="img-profile-inner" ref="profile">
				<div v-if="user.level >= '0' && user.level < '1'" class="ranking-picture rank1"></div>
				<div v-if="user.level >= '1' && user.level < '2'" class="ranking-picture rank2"></div>
				<div v-if="user.level >= '2' && user.level < '3'" class="ranking-picture rank3"></div>
				<div v-if="user.level >= '3' && user.level < '4'" class="ranking-picture rank4"></div>
				<div v-if="user.level >= '4' && user.level < '5'" class="ranking-picture rank5"></div>
				<div v-if="user.level >= '5' && user.level < '6'" class="ranking-picture rank6"></div>
				<div v-if="user.level >= '6' && user.level < '7'" class="ranking-picture rank7"></div>
				</div>
			</div>
			<div class="informationSupp">
				<p>Username: {{ user.username }} </p>
				<p>Level : {{ user.level }}</p>
			</div>
			<div class="edit">
				<a href="/profile_update" class="editProfile">Edit Profile</a>			
			</div>
				<!-- <div class="twofa">   //// 2FA a mettre dans profile_update
					<p>2fa</p>
					<input type="checkbox" @change="onTwoFactorChange($event)" v-model="two_factor_checkbox.value"/>
					{{two_factor_checkbox.value ? "2fa enabled" : null}}
					<img v-if="two_factor_checkbox.value" :src="two_factor_checkbox.qrcode" alt="qrcode">
					<input v-model="two_factor_checkbox.password"/>
					<button @click="twoFactorVerify($event)">submit 2fa</button>
				</div> -->
		</div>
		<ul class="nav-profile">
			<li>
				<p v-if="navProfil.partie === true" class="navInner">Parties</p>
				<p @click="navPartie" v-if="navProfil.partie === false">Parties</p>
			</li>
			<li>
				<p v-if="navProfil.block === true" class="navInner">List of blocked</p>
				<p @click="navBlock" v-if="navProfil.block === false">List of blocked</p>
			</li>
			<li>
				<p v-if="navProfil.friend === true" class="navInner">Friends</p>
				<p @click="navFriend" v-if="navProfil.friend === false">Friends</p>
			</li>
		</ul>
		<div class="scroll">
			<div class="historyMain" v-if="navProfil.partie === true" v-for="(match,i) in matchs"> <!-- Historique parties -->
				<div class="matchWin historyGame" v-if="match.scoreUser > match.scoreAdver">
					<img class="pictureMatch" v-bind:src="user.picture" height="75"/>
					<p class="usernameMatch"> {{ user.username }} </p>
					<div>
						<p style="color: #51E47A; font-size: 1.3em">Victory</p>
						<p style="text-align:center; font-weight: bold; font-size: 1.1em">{{ match.scoreUser }} - {{ match.scoreAdver }}</p>
					</div>
					<p class="usernameMatch">{{ match.Advername }}</p>
					<img class="pictureMatch" v-bind:src="match.AdverPicture" height="75"/>
				</div>
				<div class="matchLoose historyGame" v-if="match.scoreUser < match.scoreAdver">
					<img class="pictureMatch" v-bind:src="user.picture" height="75"/>
					<p class="usernameMatch"> {{ user.username }} </p>
					<div>
						<p style="color: #FF0000; font-size: 1.3em">Defeat</p>
						<p style="text-align:center; font-weight: bold; font-size: 1.1em">{{ match.scoreUser }} - {{ match.scoreAdver }} </p>
					</div>
					<p class="usernameMatch"> {{ match.Advername }}</p>
					<img class="pictureMatch" v-bind:src="match.AdverPicture" height="75"/>
				</div>
			</div>
		</div>

		<div v-if="navProfil.block === true" class="listBlocked"> <!-- Block Player -->
			<div v-for="(blocked,index) in blockPlayer" class="buttonBlocked">
				<h4>{{ blocked.name }}</h4>
				<button class="xIcon" @click="deleteBlockPlayer(index)"><i class="fa-solid fa-x"></i></button>
			</div>
		</div>
		<div v-if="navProfil.friend === true" class="listBlocked"> <!-- Liste d'amis -->
			<div v-for="(friend,index) in friends" class="buttonBlocked">
				<h4>{{ friend.status }} -- {{ friend.name }}</h4>
				<button class="xIcon" @click="deletefriends(index)"><i class="fa-solid fa-x"></i></button>
			</div>
		</div>
    </div>

</template>

<script lang="ts">
import { defineComponent } from 'vue'
import axios from 'axios'
import authHeader from '@/services/auth-header'

export default defineComponent({
    name: 'login',
    data () {
        return {
			navProfil: {
				partie: true,
				block: false,
				friend: false
			},
			matchs: [],
            user: {
                username: '',
                picture: '',
				level: '',
            },
			two_factor_checkbox: {
				value: false,
				qrcode: "",
				password: "",
			},
			blockPlayer: {},
			blockPostPlayer: {
				userOppo: '',
				userOppoId: '',
				userId: '',
				block: false
			},
			friends: {},
			friendsPost: {
				userOppo: '',
				userOppoId: '',
				userId: '',
				friend: false
			}
        }
    },
    methods: {
        userId() {
            let user = JSON.parse(localStorage.getItem('user') || '');
            if (user) {
                return user.id;
            } else {
                return '';
            }
        },
		onTwoFactorChange() {
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
					console.log(res)
				})
				.catch(err => {
				})
			}
		},
		twoFactorVerify() {
			if (this.two_factor_checkbox.value) {
				axios.post(import.meta.env.VITE_BACKEND_URI + "/auth/2fa/", { password: this.two_factor_checkbox.password, id: this.userId() })
				.then(res => {
					console.log(res)
				})
				.catch(err => {
				})
			}
		},
		deleteBlockPlayer(index:Number) {
			let user = JSON.parse(localStorage.getItem('user') || '');
			this.blockPostPlayer.userOppo = this.blockPlayer[index].name;
			this.blockPostPlayer.userOppoId = this.blockPlayer[index].idUser;
			this.blockPostPlayer.userId = user.id;
			axios.post(import.meta.env.VITE_BACKEND_URI + '/users/profile/blocked', this.blockPostPlayer, {headers: authHeader()})
			.then((response) => {
				console.log('delete blocked player' + response);
			})
			.catch((e: Error) => {
			})
			.finally(() => {
				axios.get(import.meta.env.VITE_BACKEND_URI + '/users/' + this.userId(), { headers: authHeader()})
					.then((response) => {
						this.user = response.data;
						this.matchs = response.data.matchs;
						this.blockPlayer = response.data.blocked;
					})
					.catch((e: Error) => {
						console.log('error : ' + e);
					});
			})
		},
		deletefriends(index:Number) {
			let user = JSON.parse(localStorage.getItem('user') || '');
			this.friendsPost.userOppo = this.friends[index].name;
			this.friendsPost.userOppoId = this.friends[index].idUser;
			this.friendsPost.userId = user.id;
			axios.post(import.meta.env.VITE_BACKEND_URI + '/users/profile/friends', this.friendsPost, {headers: authHeader()})
			.then((response) => {
				console.log('delete friends player' + response);
			})
			.catch((e: Error) => {
			})
			.finally(() => {
				axios.get(import.meta.env.VITE_BACKEND_URI + '/users/' + this.userId(), { headers: authHeader()})
					.then((response) => {
						this.user = response.data;
						this.matchs = response.data.matchs;
						this.blockPlayer = response.data.blocked;
						this.friends = response.data.friends;
					})
					.catch((e: Error) => {
						console.log('error : ' + e);
					});
			})
		},
		navPartie (){
			console.log('partie')
			if(this.navProfil.partie === false)
			{
				this.navProfil.partie = true;
				this.navProfil.block = false;
				this.navProfil.friend = false;
			}
		},
		navBlock () {
			console.log('block')
			if(this.navProfil.block === false)
			{
				this.navProfil.block = true;
				this.navProfil.partie = false;
				this.navProfil.friend = false;
			}
		},
		navFriend () {
			console.log('friend')
			if(this.navProfil.friend === false)
			{
				this.navProfil.friend = true;
				this.navProfil.partie = false;
				this.navProfil.block = false;
			}
		},	
    },
    mounted () {
        axios.get(import.meta.env.VITE_BACKEND_URI + '/users/' + this.userId(), { headers: authHeader()})
            .then((response) => {
                this.user = response.data;
				this.matchs = response.data.matchs;
				this.blockPlayer = response.data.blocked;
				this.friends = response.data.friends;
				this.user.level = response.data.level;
            })
            .catch((e: Error) => {
                console.log('error : ' + e);
            })
			.finally(() =>{
				let profilePicture:any = this.$refs.profile;
				profilePicture.style.backgroundImage = 'url('+this.user.picture+')';
			})
    }
})
</script>

<style scoped>

@import url('https://fonts.googleapis.com/css2?family=Rubik:wght@400;500;600&display=swap');

p{
	font-family: 'Rubik', sans-serif;
}

.profile{
	display: flex;
	flex-direction: column;
	background: #272422;
	margin: 5% 15%;
	padding: 3%;
	color:white;
	border-radius: 5px;
}

.img-profile{
	width:36.66%;
	display:relative;
}

.img-profile-inner {
	height: 170px;
	width: 170px;
	background-repeat: no-repeat;
	background-size: cover;
	background-position: 50% 50%;
	border-radius: 50%;
	margin-left: 40%;
}

.ranking-picture {
	height: 240px;
	width: 240px;
	background-repeat: no-repeat;
  	background-size: cover;
  	background-position: 50% 50%;
	position:relative;
	left: -35px;
	top: 45px;
}

.rank1 { background-image: url("https://lolg-cdn.porofessor.gg/img/s/league-icons-v3/160/3.png?v=8"); }
.rank2 { background-image: url("https://lolg-cdn.porofessor.gg/img/s/league-icons-v3/160/4.png?v=8"); }
.rank3 { background-image :url("https://lolg-cdn.porofessor.gg/img/s/league-icons-v3/160/5.png?v=8"); }
.rank4 { background-image :url("https://lolg-cdn.porofessor.gg/img/s/league-icons-v3/160/6.png?v=8"); }
.rank5 { background-image :url("https://lolg-cdn.porofessor.gg/img/s/league-icons-v3/160/7.png?v=8"); }
.rank6 { background-image :url("https://lolg-cdn.porofessor.gg/img/s/league-icons-v3/160/8.png?v=8"); }
.rank7 { background-image :url("https://lolg-cdn.porofessor.gg/img/s/league-icons-v3/160/9.png?v=8"); }

.profileHistory{
	display: flex;
	flex-direction: column;
	background: #272422;
	margin: 5% 30%;
	padding: 1%;
	color:white;
	border-radius: 5px;
}

.information{
	display:flex;
	flex-direction: row;
	justify-content: center;
	flex-wrap: wrap;
	
}

.informationSupp{
	display:flex;
	justify-content: center;
	align-items: center;
	flex-direction: column;
	font-weight: 500;
	font-size: 1.6em;
	width:33.33%;
	text-align: center;
}

.twofa{
	display:flex;
	justify-content: center;
	align-items: center;
	flex-direction: row;
}

.twofa p{
	margin: 0;
}

.joueur{
	margin-top: 15px;
	color: crimson;
}

.listBlocked{
	display:flex;
	flex-direction: column;
	background: #272422;
	margin: 0% 40% 0 40%;
	padding: 1%;
	color:white;
	border-radius: 5px;
}

.buttonBlocked{
	display:flex;
	justify-content: center;
	align-items: center;
	flex-direction: row;
	background: #3f3f3f;
	color:white;
	border-radius: 5px;
}

.xIcon{
	color: red;
	background: #3f3f3f;
	font-size: 1.5em;
	border:none;
}

.xIcon:hover{
	opacity: 0.6;
}

p, h4{
	margin: 0;
}

.edit{
	display:flex;
	justify-content: center;
	align-items: center;
	flex-direction: column;
	width:30%;
}

.editProfile{
	color: #fff;
	position: relative;
	text-transform: uppercase;
	text-decoration: none;
	border: 0.2em solid #fff;
	padding: 0.4em 0.4em;
}

.editProfile::before {
	content: "";
	display: block;
	position: absolute;
	width: 10%;
	background: #222;
	height: 0.3em;
	right: 20%;
	top: -0.21em;
	transform: skewX(-45deg);
	-webkit-transition: all 0.45s cubic-bezier(0.86, 0, 0.07, 1);
	transition: all 0.45s cubic-bezier(0.86, 0, 0.07, 1);
}

.editProfile::after {
	content: "";
	display: block;
	position: absolute;
	width: 10%;
	background: #222;
	height: 0.3em;
	left: 20%;
	bottom: -0.25em;
	transform: skewX(45deg);
	-webkit-transition: all 0.45 cubic-bezier(0.86, 0, 0.07, 1);
	transition: all 0.45s cubic-bezier(0.86, 0, 0.07, 1);
}

.editProfile:hover::before {
	right: 80%;
}

.editProfile:hover::after {
	left: 80%;
}

.nav-profile {
	margin-top: 10%;
	align-items:center;
	display:flex;
	justify-content: center;
	flex-direction: row;
	flex-wrap: wrap;
	list-style: none;
	font-weight: 400;
	font-size: 1.2em;
	margin-bottom: 4%;
}

.nav-profile li{
	font-family: 'Rubik', sans-serif;
	padding: 0 10px;
	border-bottom: 1px solid #fff;
	cursor:pointer;
}

.nav-profile li:hover{
	opacity: 0.7;
}

.nav-profile li p{
	text-decoration: none;
	color:white;
}

.nav-profile li .navInner{
	color:red;
}

.matchWin{
	background-color: #0F9334;
	height: 100px;
	margin-bottom: 25px;
}

.matchLoose{
	background-color: #A42525;
	height: 100px;
	margin-bottom: 25px;
}

.historyMain{
	padding: 0 15%;
}

.historyGame{
	padding: 0 5%;
	display:flex;
	justify-content: space-between;
	flex-direction: row;
	align-items: center;
	flex-wrap: wrap;
}

.scroll{
	overflow: auto;
	max-height: 500px;
}

@media (max-width: 700px) { /* responsive profile */
	.information {
		flex-direction: column;
		justify-content: center;
	}

	.informationSupp {
		width: 100%;
	}

	.edit {
		width: 100%;
	}

	.img-profile {
		margin-bottom: 40px;
		display:flex;
		justify-content: center;
		align-items: center;
		width: 100%;

	}

	.img-profile-inner {
		margin-left: 0;
	}
}

@media (max-width: 1050px) { /* responsive matchs */
	.historyMain {
		padding: 0;
	}
}

@media (min-width: 451px) and (max-width: 800px) { /* responsive matchs */
	.pictureMatch {
		display:none;
	}

	.usernameMatch {
		font-weight: bold;
		font-size: 1.2em;
	}
}

@media (max-width: 450px) { /* responsive matchs */
	.pictureMatch {
		display:none;
	}

	.usernameMatch {
		font-size: 1em;
	}
}

@media (min-width: 1151px) and (max-width: 1400px) { /* responsive matchs */
	.ranking-picture {
		height: 190px;
		width: 190px;
		left: -25px;
		top: 45px;
	}
	.img-profile-inner {
		height: 140px;
		width: 140px;
	}
}

@media (max-width: 1150px) { /* responsive matchs */
	.ranking-picture {
		height: 120px;
		width: 120px;
		left: -15px;
		top: 30px;
	}
	.img-profile-inner {
		height: 90px;
		width: 90px;
	}
}

</style>