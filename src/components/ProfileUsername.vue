<template>
    <div class="profile">
			<div>
				<img class="img-profile" v-bind:src="user.picture" height="100" width="150"/>
			</div>
			<div class="informationSupp">
					<p>Username : {{user.username}} </p>
					<div>
						<button class="basic-button buttonBlock" @click="blocked">Block</button>
						<button class="basic-button buttonFriend" @click="addFriend">Add Friend</button>
					</div>
			</div>
    </div>
	<div class="profileHistory">
		<div class="scroll">
			<div class="historyMain" v-for="(match,i) in matchs">
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
						<p style="text-align:center; font-weight: bold; font-size: 1.1em">{{ match.scoreAdver }} - {{ match.scoreUser }}</p>
					</div>
					<p class="usernameMatch">{{ match.Advername }}</p>
					<img class="pictureMatch" v-bind:src="match.AdverPicture" height="75"/>
				</div>
			</div>
		</div>
	</div>

</template>

<script setup lang="ts">

import { onBeforeMount, ref } from 'vue'
import router from '../router'
import axios from 'axios'
import authHeader from '@/services/auth-header'

let userStorage = JSON.parse(localStorage.getItem('user') || '');
let matchs = ref([]);
let user = ref({
    username: '',
    picture: '',
})
let blockPlayer = ref({
	username: '',
	userId: '',
	block: true
})
let addFriends = ref({
	username: '',
	userId: '',
	friend: true
})

onBeforeMount(() => {
	axios.get(import.meta.env.VITE_BACKEND_URI + '/users/profile/' + router.currentRoute.value.params.username, { headers: authHeader() })
	    .then((response) => {
			console.log(response.data);
            user.value = response.data; //// faire l'erreur 404
            matchs.value = response.data.matchs;
	    })
	    .catch((e: Error) => {
		    console.log('error : '+e);
            // router.push('/profile');
	    })
})

const	blocked = () => {
	console.log('blocked');
	blockPlayer.value.username = user.value.username;
	blockPlayer.value.userId = userStorage.id;
	    axios.post(import.meta.env.VITE_BACKEND_URI + '/users/profile/blocked', blockPlayer.value, {headers: authHeader()})
        .then((response) => {
            console.log('blocked player' + response);
        })
        .catch((e: Error) => {
        })	
}

const	addFriend = () => {
	addFriends.value.username = user.value.username;
	addFriends.value.userId = userStorage.id;
	    axios.post(import.meta.env.VITE_BACKEND_URI + '/users/profile/friends', addFriends.value, {headers: authHeader()})
        .then((response) => {
            console.log('add friend : ' + response);
        })
        .catch((e: Error) => {
        })	
}

</script>

<style scoped>

.profile{
	display: flex;
	flex-direction: row;
	justify-content: center;
	align-items: center;
	background: #3f3f3f;
	margin: 5% 30% 3% 30%;
	color:white;
	border-radius: 5px;
	padding: 3%;
}

.img-profile{
	margin-right: 20px;
}

.profileHistory{
	display: flex;
	flex-direction: column;
	background: #3f3f3f;
	margin: 3% 30%;
	padding: 3% 1%;
	color:white;
	border-radius: 5px;
}

.informationSupp {
	display: flex;
	justify-content: center;
	align-items: center;
	flex-direction: column;
	flex-wrap: wrap;
	text-align: center;
}

.twofa p{
	margin: 0;
}

.joueur{
	color: crimson;
}

.basic-button{
    border-radius: 10px;
    box-sizing: border-box;
    padding: 5px 10px;
	margin: 5px;
    border: none;
    color:black;
    background-color: white;
    transition: 0.3s;
}

.basic-button:hover{
    opacity: 0.8;
}

.buttonFriend{
	cursor: pointer;
	background: green;
	color:white;
}

.buttonBlock{
	cursor: pointer;
	background:crimson;
	color: white;
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
	padding: 0 5%;
	color:white;
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

@media (max-width: 800px) { /* responsive profile mobile -- responsive matchs */
	.profile{
		flex-direction: column;
		margin: 5% 20% 5% 20%;
	}

	.img-profile{
		margin-right: 0;
	}

	.pictureMatch {
		display:none;
	}

	.usernameMatch {
		font-weight: bold;
		font-size: 1.1em;
	}
}

@media (min-width: 1001px) and (max-width: 1350px) { /* responsive matchs */
	.profileHistory {
		margin: 3% 20%;
	}
}

@media (min-width: 401px) and (max-width: 1000px) { /* responsive matchs */
	.profileHistory {
		margin: 3% 15%;
	}
}

@media (max-width: 400px) { /* responsive matchs */
	.profileHistory {
		margin: 3% 10%;
	}
}

</style>