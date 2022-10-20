<template>
<div v-if="$route.name != 'login'" >
  <div class="hamburger-menu">
      <i v-if="isOpenHamburger === false" @click="isOpenHamburger = true" class="fa-solid fa-bars hamburger-icon"></i>
      <i v-if="isOpenHamburger === true" @click="isOpenHamburger = false" class="fa-solid fa-xmark x-mark-icon"></i>
  </div>
  <div v-if="isOpenHamburger === true" class="hamburger-information">
        <router-link class="hamburgerItem" to="/game">Dashboard</router-link>
        <router-link class="hamburgerItem" to="/profile">Profile</router-link>
        <router-link class="hamburgerItem" to="/chat">Chat</router-link>
        <router-link class="hamburgerItem" to="/stream">Stream</router-link>
  </div>
  <div class="container">
    <nav class="navbar">
      <router-link to="/game" class="decorationNone">
        <li class="navLink">
          Game
        </li>
      </router-link>
      <router-link to="/profile" class="decorationNone">
        <li class="navLink">
          Profile
        </li>
      </router-link>
      <router-link to="/chat" class="decorationNone">
        <li class="navLink">
          Chat
        </li>
      </router-link>
      <!-- <li @click="goToChat()" class="navLink">
        Chat
      </li> -->
      <router-link to="/stream" class="decorationNone">
        <li class="navLink">
          Stream
        </li>
      </router-link>
      <li class="navLink" @click="onLogout()">
        Logout
      </li>
    </nav>
  </div>
	<Invite v-if="isOpenModal === true">
		<i class="fa-solid fa-xmark btn-close" @click="isOpenModal = false"></i>
		<p class="p">Invitation</p>
		<p class="content">You are invited by {{senderName}} to play a pong</p>
		<div class="button">
			<button class="accept" @click="accept()">Accept</button>
			<button class="deny" @click="deny()">Deny</button>
		</div>
	</Invite>
  <Dashboard v-if="isAccepted" :lobbyConnection="lobbyConnection" :invited="true"/>
</div>
<router-view :lobbyConnection="lobbyConnection"/>
</template>

<script setup lang="ts">
import { onBeforeMount, ref } from 'vue'
import router from './router'
import authHeader from '@/services/auth-header'
import { io } from  'socket.io-client'
import Invite from './components/Invite.vue'
import * as Colyseus from 'colyseus.js'
import Dashboard from './components/Dashboard.vue'

const isOpenHamburger = ref(false);
const isOpenModal = ref(false);
const socket = io(import.meta.env.VITE_BACKEND_URI);	
let user: any = false;
let connected = ref(false);
let roomId = ""
let senderId: number
let senderName = ref("")
let client = new Colyseus.Client(import.meta.env.VITE_SERVER_URI)
let lobbyConnection = ref({})
let isUserConnected = ref(localStorage.hasOwnProperty("user"))
let isAccepted = ref(false)

if (isUserConnected.value) {
    user = JSON.parse(localStorage.getItem('user') || '');
    socket.emit('findAllSockets', {userId : user.id}, (response:any) => {
      console.log('Find All Sockets : ', response);
    });
}

socket.on('invite', (invite) => {
	roomId = invite.roomId
	senderId = invite.senderId
  senderName.value = invite.senderName
	if (user.id === invite.user)
	{
		isOpenModal.value = true
	}
});

socket.on('acceptInvite', async (invite) => {
 senderId = invite.senderId
	if (user.id === senderId)
	{
    isAccepted.value = true
	}
});

socket.on('deny', (msg) => {

	if (JSON.parse(localStorage.getItem("user")).id === msg.senderId)
	{
		//quit game modal
	}

});

function onLogout() {
  localStorage.clear()
	router.push({name:"login"})
}

async function accept() {
  socket.emit('acceptInvite', {userId: user.id , value : true, senderId}, (response:any) => {}) 
	isOpenModal.value = false
  lobbyConnection.value = await client.joinById(roomId, localStorage.getItem("user"))
  isAccepted.value = true

}

async function deny() {
	socket.emit('deny', {senderId}, (response: any) => {
	});

	isOpenModal.value = false
}

function goToChat() {
	router.push({name:"chat", params: {lobbyConnection: lobbyConnection.value}})
}


onBeforeMount(() => {

  socket.on("connect", () => {
  });

  socket.on("disconnect", () => {
    console.log(socket.connected); // false
    socket.emit('disconnection', {userId: user.id , value : true}, (response:any) => { console.log('OUT') }) 
  });

  if (localStorage.hasOwnProperty("user") === true) {
    connected.value = true;
    socket.emit('connection', {userId: user.id , value : true}, (response:any) => { console.log('ON') })
  }
  else if (user) {
    connected.value = false;
    socket.emit('disconnection', {userId: user.id , value : true}, (response:any) => { console.log('OUT') }) 
  }
});
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,300;0,400;0,700;1,400&family=Rajdhani:wght@400;500;600&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Rubik+Glitch&display=swap');

* {
  margin: 0;
	padding: 0;
	font-family: 'Lato', sans-serif;
}

body{
	background:#312E2A;
}

.navbar{
    display:flex;
    justify-content: space-evenly;
    align-items: center;
    flex-direction: row;
    background: #262521;
}

.navItem {
    padding: 1rem 2rem 1.15rem;
    list-style-type: none;
    cursor:pointer;
}

/* .navItem:hover {
    background-image: url('https://scottyzen.sirv.com/Images/v/button.png');
    background-size: 100% 100%;
    text-shadow: 0 -1px 0 #ef816c;
} */

.decorationNone {
    text-decoration: none;
}

.navLink {
    font-family: 'Rajdhani', sans-serif;
    font-size: 1.3em;
    font-weight: 600;
    color:white;
    padding: 10px;
     padding: 1rem 2rem 1.15rem;
    list-style-type: none;
    cursor:pointer;   text-transform: uppercase;
}

.navLink:hover {
    background-image: url('https://scottyzen.sirv.com/Images/v/button.png');
    background-size: 100% 100%;
    text-shadow: 0 -1px 0 #ef816c;
}

/* ------ MODAL ------ */

.p {
    position: absolute;
    top: 10px;
    left: 17px;
    color: #413f3f;
    font-family: 'Rubik Glitch', cursive;
}

.content {
    margin-top: 2%;
    font-family: 'Rubik Glitch', cursive;
    text-align: center;
    font-size: 1.5em;
}

.button {
    display:flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
}

.btn-close {
    position: absolute;
    font-size: 1.5em;
    top: 10px;
    right: 17px;
    cursor: pointer;
    color: crimson;
    background: transparent;
}

.accept, .accept::after {
    margin: 3% 5% 0 0;
    cursor:pointer;
    width: 100px;
    height: 30px;
    font-size: 20px;
    background: linear-gradient(45deg, transparent 5%, green 5%);
    border: 0;
    color: #fff;
    letter-spacing: 3px;
    box-shadow: 6px 0px 0px #9b9b9b;
    outline: transparent;
    position: relative;
}

.accept::after {
    --slice-0: inset(50% 50% 50% 50%);
    --slice-1: inset(80% -6px 0 0);
    --slice-2: inset(50% -6px 30% 0);
    --slice-3: inset(10% -6px 85% 0);
    --slice-4: inset(40% -6px 43% 0);
    --slice-5: inset(80% -6px 5% 0);
    
    content: 'Accept';
    display: block;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, transparent 3%, green 3%, green 5%, green 5%);
    text-shadow: -3px -3px 0px green, 3px 3px 0px green;
    clip-path: var(--slice-0);
}

.accept:hover::after {
    animation: 1s glitch;
    animation-timing-function: steps(2, end);
}

.deny, .deny::after {
    margin: 3% 0 0 5%;
    cursor:pointer;
    width: 100px;
    height: 30px;
    font-size: 20px;
    background: linear-gradient(45deg, transparent 5%, crimson 5%);
    border: 0;
    color: #fff;
    letter-spacing: 3px;
    box-shadow: 6px 0px 0px #9b9b9b;
    outline: transparent;
    position: relative;
}

.deny::after {
    --slice-0: inset(50% 50% 50% 50%);
    --slice-1: inset(80% -6px 0 0);
    --slice-2: inset(50% -6px 30% 0);
    --slice-3: inset(10% -6px 85% 0);
    --slice-4: inset(40% -6px 43% 0);
    --slice-5: inset(80% -6px 5% 0);
    
    content: 'Deny';
    display: block;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, transparent 3%, crimson 3%, crimson 5%, crimson 5%);
    text-shadow: -3px -3px 0px crimson, 3px 3px 0px crimson;
    clip-path: var(--slice-0);
}

.deny:hover::after {
    animation: 1s glitch;
    animation-timing-function: steps(2, end);
}

.absolute {
	position: absolute;
	width: 100%;
}

@keyframes glitch {
  0% {
    clip-path: var(--slice-1);
    transform: translate(-20px, -10px);
  }
  10% {
    clip-path: var(--slice-3);
    transform: translate(10px, 10px);
  }
  20% {
    clip-path: var(--slice-1);
    transform: translate(-10px, 10px);
  }
  30% {
    clip-path: var(--slice-3);
    transform: translate(0px, 5px);
  }
  40% {
    clip-path: var(--slice-2);
    transform: translate(-5px, 0px);
  }
  50% {
    clip-path: var(--slice-3);
    transform: translate(5px, 0px);
  }
  60% {
    clip-path: var(--slice-4);
    transform: translate(5px, 10px);
  }
  70% {
    clip-path: var(--slice-2);
    transform: translate(-10px, 10px);
  }
  80% {
    clip-path: var(--slice-5);
    transform: translate(20px, -10px);
  }
  90% {
    clip-path: var(--slice-1);
    transform: translate(-10px, 0px);
  }
  100% {
    clip-path: var(--slice-1);
    transform: translate(0);
  }
}
/* ------ END MODAL ------ */
.hamburger-icon, .x-mark-icon {
  display:none;
}

.hamburger-information {
  display:none;
}

  @media (max-width: 800px) { /* responsive navbar */

  .hamburger-icon {
    position:absolute;
    display: inline-block;
    color: white;
    font-size: 2.5em;
    margin: 20px 0 0 30px;
    cursor: pointer;
  }

  .x-mark-icon {
    color: white;
    display: inline-block;
    font-size: 2.5em;
    margin: 20px 0 0 30px;
    cursor: pointer;
  }

  .navbar {
    display: none;
  }

  .hamburger-menu {
    position: absolute;
    top: 0;
    left: 0;
  }

  .hamburger-information {
    display:flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    background-color: #272422;
    padding: 3% 0;
  }

  .hamburgerItem {
    width:60%;
    padding: 10px;
    text-align: center;
    text-decoration: none;
    color:white;
    font-size:1.1em;
  }
  .hamburgerItem:hover {
    background: crimson;
    opacity:0.9;
  }
}
</style>