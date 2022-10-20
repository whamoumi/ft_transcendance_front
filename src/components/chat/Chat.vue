<template>
    <div class="chat">
        <div class="notJoined" v-if="!joined && !joinedDM">
            <div>
                <form @submit.prevent="createChann" class="createChannel">
                    <div class="formCreateChannel field createChannelResponsiveMobile">
                        <label class="formLabel">Channel Name : </label>
                        <input type="input" class="formField" name="channel name" v-model="createChannel.name" required />
                    </div>
                    <div class="createChannelResponsiveMobile">
                        <label class="selectLabel">Type of the channel : </label>
                        <select v-model="createChannel.type" required>
                            <option disabled>Type of the channel</option>
                            <option>public</option>
                            <option>private</option>
                            <option>secret</option>
                        </select>
                    </div>
                    <div class="formCreateChannel field createChannelResponsiveMobile" v-if="createChannel.type === 'private'">
                        <label class="formLabel">Password : </label>
                        <input class="formField" type="password" v-model="createChannel.password" required/>
                    </div>
                    <button class="basic-button" type="submit">Create Channel</button>
                </form>
            </div>
            <hr class="hrOne">
            <div class="serverChannel">
                <div class="channel">
                    <p class="listChannel">List Of Channels</p>
                    <div v-for="(chan,index) in channel">
                        <div class="joinChannel-button">
                            <button class="buttonJoinChannel" @click="joinChannel(chan.name, chan.id, index)" v-if="chan.type != 'secret' && chan.type !='private'">{{ chan.name }} -- {{ chan.type }}</button>
                            <div v-if="chan.type === 'private'">
                                <button class="buttonJoinChannel" @click="displayPasswordPrivate(index)">{{ chan.name }} -- {{ chan.type }}</button>
                                <form @submit.prevent="joinChannel(chan.name, chan.id)">
                                    <div class="privatePassword" v-if="displayPasswordPrivateChannel.display === true && displayPasswordPrivateChannel.id === index">
                                        <label class="elementPrivatePassword">Password : </label>
                                        <input class="formField margin-left elementPrivatePassword" type="password" v-model="checkPassword"/>
                                        <button class="basic-button elementPrivatePassword" type="submit">Join Channel</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                    <div v-for="(chan,index) in channelSecret">
                        <div v-for="(permission,i) in channelSecret[index].owner">
                            <div v-if="permission.userId === user.id" class="joinChannel-button">
                                <button class="buttonJoinChannel" @click="joinChannelSecret(chan.name, permission.channelId, chan.type)" v-if="chan.type !='private'">{{ chan.name }} -- {{ chan.type }}</button>
                                <!-- <p>{{ permission.userId }} -- owner -- {{ permission.channelId }} -- {{ chan.name }} -- {{ chan.type }}</p> -->
                            </div>
                        </div>
                        <div v-for="(permission,i) in channelSecret[index].invite">
                            <div v-if="permission.userId === user.id" class="joinChannel-button">
                                <button class="buttonJoinChannel" @click="joinChannelSecret(chan.name, permission.channelId, chan.type)" v-if="chan.type !='private'">{{ chan.name }} -- {{ chan.type }}</button>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="dm">
                    <p class="listChannel">List Of DMs</p>
                    <button @click="createDmButton" class="buttonDm"><i class="fa-solid fa-circle-plus plusButton"></i></button>
                    <div>
                    <form class="formCreateDm" v-if="dmButton === true" @submit.prevent="createDm">
                        <input class="formField pc" placeholder="Username of the player" v-model="createChannelDm.oppoUsername" required>
                        <input class="formFieldMobile mobile" placeholder="Username" v-model="createChannelDm.oppoUsername" required>
                        <button class="dm-button" type="submit">Create Dm</button>
                    </form>
                    </div>
                    <div v-for="dmName in dm[0].DM" class="joinChannel-button">
                        <button class="buttonJoinChannel" @click="joinChannelDM(dmName.name, dmName.dmId)">{{ dmName.name }}</button>
                    </div>
                </div>
            </div>
        </div>
        <div class="joined" v-if="joined">
            <div class="fleche-div" v-on:click="leaveChannel">
                <span class="fleche"></span>
                <span class="fleche"></span>
                <span class="fleche"></span>
                <span class="fleche"></span>
            </div>
            <div class="body">
                <div class="chat-container">
                    <div class="messages-container">
                        <div v-for="(message,index) in messages">
                            <div v-if="index > messages.length - 13" class="displayMessage">
                                <div class="myProfile" v-if="message.name === name">
                                    <p>[{{message.name}}] : </p>
                                    <p>{{message.text}}</p>
                                </div>
                                <div class="yourProfile" v-else>
                                    <div>
                                        <p @click="clickProfile(index)" class="profile">[{{message.name}}] : </p>
                                        <p>{{message.text}}</p>
                                        <div class="infoProfile" v-if="profile.click === true && profile.id === index">
                                            <div class="buttonProfile">
                                                <p class="everyButton" @click="profileChat(index)">Profile</p>
                                                <p @click="invitePlayer(index)" class="everyButton">Invite Player</p>
                                                <p @click="clickProfile(index)" class="everyButton">Close</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="commandChat">
                                        <div v-if="permission.owner === true">
                                            <button @click="setAdmin(index)" class="button-i command"><i class="fa-solid fa-user-shield"></i></button>
                                        </div>
                                        <div class="commandChat" v-if="permission.owner === true || permission.admin === true">
                                            <button @click="muteButton(index)" class="button-i command"><i class="fa-solid fa-volume-xmark" id="mute"></i></button>
                                            <form v-if="commandButton.mute === true && commandButton.idMute === index" class="sendMessageForm" @submit.prevent="muted(index)">
                                                <input class="basicInput" placeholder="time in s" v-model="commandButton.timeMute" required>
                                                <button class="basic-buttonAdmin" type="submit">mute</button>
                                            </form>
                                            <button @click="banButton(index)" class="button-i command"><i class="fa-solid fa-ban" id="ban"></i></button>
                                            <form v-if="commandButton.ban === true && commandButton.idBan === index" class="sendMessageForm" @submit.prevent="banned(index)">
                                                <input class="basicInput" placeholder="time in s" v-model="commandButton.timeBan" required>
                                                <button class="basic-buttonAdmin" type="submit">ban</button>
                                            </form>
                                            <button @click="kick(index)" class="button-i command"><i aria-label="kick" class="infobulle fa-solid fa-person-walking-arrow-right"></i></button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <hr class="hrOne"/>
                    <div class="message-input">
                        <form class="sendMessageForm" @submit.prevent="sendMessage">
                            <input class="typeYourMessage formField" placeholder="Type your message..." v-model="messageText" maxlength="120"/>
                            <button class="send-message-button" type="submit"><i type="submit" class="fa fa-paper-plane" id="send-message" aria-hidden="true"></i></button>
                        </form>
                    </div>
                </div>
                <div v-if="permission.owner === true" class="configChannel">
                    <p>Channel Settings</p>
                    <div class="settingsChannel">
                        <form @submit.prevent="updateChannel" class="updateChannel">
                            <div class="updateTypeChannel">
                                <label class="formLabel">Type of the channel : </label>
                                <select class="selectUpdateChannel" v-model="updateChannels.type" required>
                                    <option disabled type="channel-type">Choose</option>
                                    <option>public</option>
                                    <option>private</option>
                                </select>
                            </div>
                            <div class="updatePasswordChannel" v-if="updateChannels.type === 'private'">
                                <input class="formField" placeholder="password" type="password" v-model="updateChannels.password" required/>
                            </div>
                            <button class="basic-button update-button" type="submit">Update Channel</button>
                        </form>
                    </div>
                    <div v-if="typeChannel === 'secret'">
                        <p class="invitation">Invitation</p>
                        <div class="invitationSecret">
                            <form @submit.prevent="invitationChannel" class="addInvitation">
                                <input class="typeYourMessage formField" placeholder="Type his name..." v-model="invitation.name"/>
                                <button class="basic-button buttonAdd" type="submit">Add</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="joined" v-if="joinedDM">
            <div class="fleche-div" v-on:click="leaveChannelDM">
                <span class="fleche"></span>
                <span class="fleche"></span>
                <span class="fleche"></span>
                <span class="fleche"></span>
            </div>
            <div class="body">
                <div class="chat-container">
                    <div class="messages-container">
                        <div v-for="(message,index) in messages">
                            <div v-if="index > messages.length - 13" class="displayMessage">
                                <div class="myProfile" v-if="message.name === name">
                                    <p class="profile">[{{message.name}}] : </p>
                                    <p>{{message.text}}</p>
                                </div>
                                <div class="yourProfile" v-else>
                                    <div>
                                        <p @click="clickProfile(index)" class="profile">[{{message.name}}] : </p>
                                        <p>{{message.text}}</p>
                                        <div class="infoProfile" v-if="profile.click === true && profile.id === index">
                                            <div class="buttonProfile">
                                                <p class="everyButton" @click="profileChat(index)">Profile</p>
                                                <p class="everyButton">Invite Player</p>
                                                <p @click="clickProfile(index)" class="everyButton">Close</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <hr class="hrOne"/>
                    <div class="message-input">
                        <form class="sendMessageForm" @submit.prevent="sendMessageDM">
                            <input class="typeYourMessage formField" placeholder="Type your message..." v-model="messageText" maxlength="120"/>
                            <button class="send-message-button" type="submit"><i type="submit" class="fa fa-paper-plane" id="send-message" aria-hidden="true"></i></button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
		<!-- <Modal v-if="!!lobbyConnection" :leave="leave" :players="players" :balls="balls"></Modal> -->
    </div>
</template>

<script setup lang="ts">
import { onBeforeMount, ref, defineProps } from 'vue'
import Modal from "../stream/Modal.vue"
import axios from 'axios'
import router from '../../router'
import { io } from  'socket.io-client'
import authHeader from '@/services/auth-header'
import * as Colyseus from "colyseus.js"
import { useRoute } from 'vue-router'

let user = JSON.parse(localStorage.getItem('user') || '');
const socket = io(import.meta.env.VITE_BACKEND_URI);
const blocked = ref([]);
const messages = ref([{}]);
const messageText = ref('');
const joined = ref(false);
const joinedDM = ref(false);
const name = ref('');
const channel = ref([]);
const channelSecret = ref([]);
const dm = ref<any []>([[{}]]);
const checkPassword = ref('');
let typeChannel = ref('');
let createChannel = ref({
	id: Number,
	name: '',
	type: '',
	password: '',
	userId: ''
});
let updateChannels = ref({
	type: '',
	password: '',
	userId: '',
	channelId: ''
});
let createChannelDm = ref({
	id : Number,
	userId : '',
	username: '',
	oppoUsername : '',
})
let commandButton = ref({
	mute: false,
	ban: false,
	timeMute: '',
	timeBan: '',
	idMute: Number,
	idBan: Number
})
let permission = ref({
	owner: false,
	admin: false,
	mute: false,
	ban: false
})
let profile = ref({
	id: Number,
	click: false
})
let addAdmin = ref({
	userId : '',
	currentIdChannel: '',
	usernameAdmin: ''
})
let displayPasswordPrivateChannel = ref({
	id: Number,
	display: false,
})
let dmButton = ref(false);
let invitation = ref({
	name: '',
	currentIdChannel: '',
	userId: ''
});
let currentIdChannel = '';
if (localStorage.hasOwnProperty("currentIdChannel") === true) {
	currentIdChannel = JSON.parse(localStorage.getItem('currentIdChannel') || '');
}
let client = new Colyseus.Client(import.meta.env.VITE_SERVER_URI)
const props = defineProps(["lobbyConnection"])
let lobbyConnection = null

const route = useRoute()

const userId = () => {
	let user = JSON.parse(localStorage.getItem('user') || '');
	if (user) {
		return user.id;
	} else {
		return '';
	}
};

const displayPasswordPrivate = (index: NumberConstructor) => {
	if (displayPasswordPrivateChannel.value.display === false)
	{
		displayPasswordPrivateChannel.value.id = index;
		displayPasswordPrivateChannel.value.display = true;
	}
	else {
		displayPasswordPrivateChannel.value.id = -1;
		displayPasswordPrivateChannel.value.display = false;
	}
}

const profileChat = (index:Number) => {
	router.push('/profileuser/' + messages.value[index].name);
}

const updateChannel = () => {
	let currentIdChannel = JSON.parse(localStorage.getItem('currentIdChannel') || '');
	if (updateChannels.value.type === 'public')
		updateChannels.value.password = '';
	let user = JSON.parse(localStorage.getItem('user') || '');
	updateChannels.value.userId = user.id;
	updateChannels.value.channelId = currentIdChannel;
	axios.post(import.meta.env.VITE_BACKEND_URI + '/users/channel/update', updateChannels.value, {headers: authHeader()})
	.then((response) => {
		updateChannels.value.password = '';
	})
	.catch((e: Error) => {
	})
}

const invitationChannel = () => {
	let currentIdChannel = JSON.parse(localStorage.getItem('currentIdChannel') || '');
	let user = JSON.parse(localStorage.getItem('user') || '');
	invitation.value.currentIdChannel = currentIdChannel;
	invitation.value.userId = user.id;
	axios.post(import.meta.env.VITE_BACKEND_URI + '/users/channel/invite', invitation.value, {headers: authHeader()})
	.then((response) => {
		invitation.value.name = '';
	})
	.catch((e: Error) => {
	})
}

async function invitePlayer(index: Number) {
	lobbyConnection = await client.create("state_handler", localStorage.getItem("user"))
    console.log(lobbyConnection)
    const user = JSON.parse(localStorage.getItem("user"))
	socket.emit('invite', { name: messages.value[index].name, roomId: lobbyConnection.id, senderId: user.id, senderName: user.username }, (response: any) => {
		// push sur le lobby du jeu ou il attendrait le deuxieme joueur qui doit accepter
		localStorage.setItem("roomId", lobbyConnection.id);
		localStorage.setItem("sessionId", lobbyConnection.sessionId);
		//create
		lobbyConnection.onMessage("endgame", () =>{
			console.log("la game est fini")
			localStorage.removeItem("roomId")
			localStorage.removeItem("sessionId")
		})

        props.lobbyConnection.value = lobbyConnection
		//enter room's information in state

		//share state with modal

		//create modal

		//show modal
	})
}

const clickProfile = (index: Number) => {
	if (profile.value.click === true){
		profile.value.click = false;
		profile.value.id = -1;
	}
	else{
		profile.value.id = index;
		profile.value.click = true;
	}
}

const joinChannel = (chan : string, id : Number, index: Number) => {
	let user = JSON.parse(localStorage.getItem('user') || '');
	socket.emit('join', { name: name.value, room: chan,  idRoom: id, userId: user.id, password: checkPassword.value}, (response: any) => {
		blocked.value = response.blocked;
		if (response === '401')
			return;
		joined.value = true;
		localStorage.setItem('currentChannel', JSON.stringify(chan));
		localStorage.setItem('currentIdChannel', JSON.stringify(id));
		typeChannel.value = '';
		permission.value.owner = response.owner;
		permission.value.admin = response.admin;
		if (response === '401'){
			messages.value = [];
		}
		else{
			messages.value = response.msg;
			deleteBlockMSG();
		}
	})
};

const joinChannelSecret = (chan : string, id : Number, type: string) => {
	let user = JSON.parse(localStorage.getItem('user') || '');
	socket.emit('join', { name: name.value, room: chan,  idRoom: id, userId: user.id, password: checkPassword.value}, (response: any) => {
		if (response === '401')
			return;
		joined.value = true;
		localStorage.setItem('currentChannel', JSON.stringify(chan));
		localStorage.setItem('currentIdChannel', JSON.stringify(id));
		typeChannel.value = type;
		permission.value.owner = response.owner;
		permission.value.admin = response.admin;
		if (response === '401'){
			messages.value = [];
		}
		else{
			messages.value = response.msg;
		}
	})
};

const joinChannelDM = (chan : string, id : Number) => {
	let user = JSON.parse(localStorage.getItem('user') || '');
	socket.emit('joinDm', { name: name.value, room: chan,  idRoom: id, userId: user.id}, (response: any) => {
		if (response === '401')
			return;
		joinedDM.value = true;
		localStorage.setItem('currentIdChannel', JSON.stringify(id));
		localStorage.setItem('currentChannel', JSON.stringify(chan));
		if (response === '401'){
			messages.value = [];
		}
		else{
			messages.value = response;
		}
	})
};

const   deleteBlockMSG = () => {
	blocked.value.forEach(block => {
		for (let index = 0; messages.value[index]; index++) {
			if (block.name === messages.value[index].name) {
				messages.value.splice(index, 1);
				index = -1;
			}
		}
	});
}

const createDmButton = () => {
	if (dmButton.value === false){
		dmButton.value = true;
	}
	else{
		dmButton.value = false;
	}
}

const createDm = () => {
	let user = JSON.parse(localStorage.getItem('user') || '');
	createChannelDm.value.id = Date.now();
	createChannelDm.value.userId = user.id;
	createChannelDm.value.username = name.value;
	axios.post(import.meta.env.VITE_BACKEND_URI + '/users/dm/', createChannelDm.value, {headers: authHeader()})
		.then((response) => {
		})
		.catch((e: Error) => {
		})
		.finally(() => {
			axios.get(import.meta.env.VITE_BACKEND_URI + '/users/dm/' + userId(), { headers: authHeader() })
				.then((response) => {
					dm.value = response.data;
				})
				.catch((e: Error) => {
				})
			createChannelDm.value.oppoUsername = '';
			dmButton.value = false;
		});
}

const setAdmin = (index: NumberConstructor) => {
	let user = JSON.parse(localStorage.getItem('user') || '');
	addAdmin.value.currentIdChannel = JSON.parse(localStorage.getItem('currentIdChannel') || '');
	addAdmin.value.usernameAdmin = messages.value[index].name;
	addAdmin.value.userId = user.id;
	axios.post(import.meta.env.VITE_BACKEND_URI + '/users/channel/set', addAdmin.value, {headers: authHeader()})
		.then((response) => {
			console.log('SetAdmin' + response);
		})
		.catch((e: Error) => {
		})
}

const muteButton = (index: NumberConstructor) => {
	if (index != commandButton.value.idMute && commandButton.value.mute === true)
	{
		commandButton.value.idMute = index;
	}
	else{
		if (commandButton.value.mute === true)
			commandButton.value.mute = false;
		else
		{
			commandButton.value.idMute = index;
			commandButton.value.mute = true;
		} 
	}
}

const banButton = (index: NumberConstructor) => {
	if (index != commandButton.value.idBan && commandButton.value.ban === true)
	{
		commandButton.value.idBan = index;
	}
	else{
		if (commandButton.value.ban === true)
			commandButton.value.ban = false;
		else
		{
			commandButton.value.idBan = index;
			commandButton.value.ban = true;
		} 
	}
}
const muted = (index: any) => {
	let timestamp = Math.round(Date.now() / 1000);
	let currentChannel = JSON.parse(localStorage.getItem('currentChannel') || '');
	socket.emit('mute', { room: currentChannel, username : messages.value[index].name, timeMute: commandButton.value.timeMute, time: timestamp }, () => {
		commandButton.value.timeMute = '';
		commandButton.value.idMute = -1;
		commandButton.value.mute = false;
	})
};
const kick = (index: any) => {
	let currentChannel = JSON.parse(localStorage.getItem('currentChannel') || '');
	socket.emit('kick', { room: currentChannel, username : messages.value[index].name }, () => {
	})
}

const banned = (index: any) => {
	let timestamp = Math.round( Date.now() / 1000 );
	let currentChannel = JSON.parse(localStorage.getItem('currentChannel') || '');
	socket.emit('ban', { room: currentChannel ,username : messages.value[index].name, timeBan: commandButton.value.timeBan, time: timestamp }, () => {
		commandButton.value.timeBan = '';
		commandButton.value.idBan = -1;
		commandButton.value.ban = false;
	})
};

const sendMessage = () => {
	if(messageText.value.length === 0)
		return;
	let user = JSON.parse(localStorage.getItem('user') || '');
	socket.emit('createMessage', { text : messageText.value, userId: user.id }, () => {
		messageText.value= '';
	})
};

const sendMessageDM = () => {
	if(messageText.value.length === 0)
		return;
	let user = JSON.parse(localStorage.getItem('user') || '');
	let currentIdChannel = JSON.parse(localStorage.getItem('currentIdChannel') || '');
	let currentChannel = JSON.parse(localStorage.getItem('currentChannel') || '');
	socket.emit('createDm', { text : messageText.value, userId: user.id, idDm: currentIdChannel, name: currentChannel }, () => {
		messageText.value= '';
	})
};

const leaveChannel = () => {
	let user = JSON.parse(localStorage.getItem('user') || '');
	let currentIdChannel = JSON.parse(localStorage.getItem('currentIdChannel') || '');
	let currentChannel = JSON.parse(localStorage.getItem('currentChannel') || '');
	socket.emit('leave', { room: currentChannel, idChannel: currentIdChannel, userId: user.id }, () => {
		localStorage.removeItem('currentIdChannel')
		localStorage.removeItem('currentChannel')
		joined.value = false;
		currentIdChannel = '';
		axios.get(import.meta.env.VITE_BACKEND_URI + '/users/channel/', { headers: authHeader() })
		.then((response:any) => {
			channel.value = response.data;
		})
		.catch((e: Error) => {
			console.log('error : '+e);
		})
		axios.get(import.meta.env.VITE_BACKEND_URI + '/users/channel/secret', { headers: authHeader() })
		.then((response:any) => {
			channelSecret.value = response.data;
		})
		.catch((e: Error) => {
			console.log('error : '+e);
		})
	})
};

const leaveChannelDM = () => {
	let user = JSON.parse(localStorage.getItem('user') || '');
	let currentIdChannel = JSON.parse(localStorage.getItem('currentIdChannel') || '');
	let currentChannel = JSON.parse(localStorage.getItem('currentChannel') || '');
	socket.emit('leaveDm', { room: currentChannel, idDm: currentIdChannel, userId: user.id }, () => {
		localStorage.removeItem('currentIdChannel');
		localStorage.removeItem('currentChannel');
		joinedDM.value = false;
		axios.get(import.meta.env.VITE_BACKEND_URI + '/users/dm/' + userId(), { headers: authHeader() })
		.then((response:any) => {
			dm.value = response.data;
		})
		.catch((e: Error) => {
			console.log('error : '+e);
		})
	})
};

const createChann = () => {
	let user = JSON.parse(localStorage.getItem('user') || '');
	createChannel.value.id = Date.now();
	createChannel.value.userId = user.id;
	if (createChannel.value.type === 'public')
		createChannel.value.password = '';
	axios.post(import.meta.env.VITE_BACKEND_URI + '/users/channel/', createChannel.value, {headers: authHeader()})
		.then((response) => {
		})
		.catch((e: Error) => {
		})
		.finally(() => {
			axios.get(import.meta.env.VITE_BACKEND_URI + '/users/channel/', { headers: authHeader() })
				.then((response) => {
					channel.value = response.data;
				})
				.catch((e: Error) => {
					console.log('error : '+e);
				})
				createChannel.value.name = '';
				createChannel.value.password = '';
			axios.get(import.meta.env.VITE_BACKEND_URI + '/users/channel/secret', { headers: authHeader() })
				.then((response:any) => {
					channelSecret.value = response.data;
				})
				.catch((e: Error) => {
					console.log('error : '+e);
				})
		});
}


onBeforeMount(() => {
	axios.get(import.meta.env.VITE_BACKEND_URI + '/users/dm/' + userId(), { headers: authHeader() })
		.then((response) => {
			// console.log('dm : ' + response.data[0].DM[0].name);
			dm.value = response.data;
		})
		.catch((e: Error) => {
			console.log('error : '+e);
		})
	axios.get(import.meta.env.VITE_BACKEND_URI + '/users/' + userId(), { headers: authHeader() })
		.then((response) => {
			name.value = response.data.username;
		})
		.catch((e: Error) => {
			console.log('error : '+e);
		})

	axios.get(import.meta.env.VITE_BACKEND_URI + '/users/channel/', { headers: authHeader() })
		.then((response:any) => {
			channel.value = response.data;
		})
		.catch((e: Error) => {
			console.log(e);
		})

	axios.get(import.meta.env.VITE_BACKEND_URI + '/users/channel/secret', { headers: authHeader() })
		.then((response:any) => {
			channelSecret.value = response.data;
		})
		.catch((e: Error) => {
			console.log('error : '+e);
		})

    socket.emit('findAllMessages', {userId : user.id, currentIdChannel: currentIdChannel}, (response:any) => {
        if (response != '401')
        {
            console.log('findallmsg joined'+response.joined);
            console.log('findallmsg'+response);
            if (response.joined === false)
                return;
            // if(response === 'channel'){
            //     // do Channel
            // }
            // if (response === 'dm'){
            //     // do DM
                    //name channel
            // }
            blocked.value = response.blocked;
            messages.value = response.msg;
            deleteBlockMSG();
            joined.value = true;
            permission.value.owner = response.owner;
            permission.value.admin = response.admin;
        }
    });

			// if (response === 'dm'){
			//     // do DM
					//name channel
			// }


	socket.emit('findAllDm', {userId : user.id}, (response:any) => {
		if (response != '401')
		{
			messages.value = response;
			joinedDM.value = true;
		}
	});

	socket.on('message', (message) => {
		messages.value.push(message);
	});

	socket.on('ban', (ban) => {
		joined.value = false;
		currentIdChannel = '';
		localStorage.removeItem('currentIdChannel')
		localStorage.removeItem('currentChannel')
	});

	socket.on('kick', (kick) => {
		joined.value = false;
		currentIdChannel = '';
		localStorage.removeItem('currentIdChannel')
		localStorage.removeItem('currentChannel')
	});

	// socket.on('invite', (invite) => {
	//     console.log('invite' + invite);
	//     // console.log('invite');
	// });
    }
)

</script>

<style scoped>
*{
    margin:0;
    padding: 0;
}

.chat{
    margin-top: 30px;
    color:white;
}

.notJoined{
    margin-right:10%;
    margin-left:10%;
}

.joined{
    margin-left: 10%;
    margin-right: 5%;
}

.buttonAdd{
    margin-left: 5%;
}

.margin-left{
    margin-left:1%;
}

.basic-button{
    border-radius: 10px;
    box-sizing: border-box;
    padding: 10px 10px;
    border: none;
    color:white;
    background-color: crimson;
    transition: 0.3s;
    cursor:pointer;
    font-size: 1rem;
}

.basic-button:hover{
    opacity: 0.8;
}

.basic-buttonAdmin{
    border-radius: 10px;
    box-sizing: border-box;
    padding: 4px 8px;
    border: none;
    color:#fff;
    background:#000;
    transition: 0.3s;
    cursor:pointer;
    font-size: 1.1rem;
    margin-left: 5px;
}

.basic-buttonAdmin:hover{
    opacity: 0.7;
}

.createChannel{
    display:flex;
    flex-direction: row;
    justify-content: space-evenly;
    flex-wrap: wrap;
    align-items: center;
    margin-bottom: 20px;
}

.formCreateChannel {
    position: relative;
}

.formField {
    border: 0;
    border-bottom: 2px solid #9b9b9b;
    border-radius: 0;
    outline: 0;
    font-size: 1.1rem;
    color: #fff;
    background: transparent;
    padding-bottom: 3px;
}

.basicInput {
    border: 0;
    border-bottom: 2px solid #fff;
    border-radius: 0;
    outline: 0;
    font-size: 1rem;
    color: #fff;
    background: #28AAE2;
}

.basicInput::placeholder {
    color: #fff;
}

.formLabel {
    color: #9b9b9b;
}

.selectLabel {
    color: #9b9b9b;
}

.serverChannel{
    display:flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-start;
}

.channel{
    display:flex;
    flex-direction: column;
    width: 47.5%;
    justify-content: center;
}

.dm{
    display:flex;
    flex-direction: column;
    width: 47.5%;
    justify-content: center;
}

.plusButton{
    display:flex;
    justify-content: center;
    font-size:1.6em;
    text-align:center;
    align-items: center;
}

.buttonDm{
    border:none;
    padding: 6px 0;
    background:#413f3f;
    cursor:pointer;
    color:white;
    transition: 0.8s;
}

.buttonDm:hover{
    color:#413f3f;
    transition: 0.3s;
}

.dm-button{
    border: none;
    font-size:1.1em;
    background:#413f3f;
    color:#fff;
    margin-left: 10px;
}

.dm-button:hover{
    background-color: #413f3f;
    color:#fff;
    opacity: 0.7;
    cursor:pointer;
}

.buttonDm:hover{
    background:white;
    transition: 0.8s;
}

.formCreateDm{
    display:flex;
    justify-content: center;
    align-items: center;
    background: #413f3f;
    transition: 0.8s;
    padding: 5px 0;
}

.listChannel{
    color: #9b9b9b;
    text-align: center;
    margin-bottom: 10px;
}

.joinChannel-button .buttonJoinChannel{
    display: inline;
    border:none;
    background: #413f3f;
    color: #fff;
    transition: 0.8s;
    width: 100%;
    text-align:center;
    padding:10px;
    font-size: 1em;
    cursor:pointer;
}

.joinChannel-button .buttonJoinChannel:hover{
    display: inline-block;
    background: #ffffff;
    color: #000;
    transition: 0.8s;
}
.privatePassword{
    display:flex;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
    background: #413f3f;
}

select{
    outline:none;
    margin: 0 0 0 10px;
    cursor: pointer;
    padding: 5px 10px;
    display: inline-block;
    border-radius: 4px;
    box-sizing: border-box;
    border:none;
    background-color: #3D3B39;
    color:#fff;
    font-size: 1rem;
}

.fleche-div {
    position: absolute;
    border: 2px solid #fff;
    width: 50px;
    height: 50px;
    border-radius: 100%;
    left: 0;
    margin-left: 2%;
}

.fleche-div:hover {
    cursor: pointer;
    opacity : 0.8;
}

.fleche-div span {
    z-index: 999;
    height: 2px;
    margin:1px;
    width: 15px;
    background: #fff;
    transition: 0.4s ease;
}

.fleche-div span:first-child {
    display: block;
    position: absolute;
    transform: rotate(45deg);
    left: 25%;
    bottom: 35%;
}

span:nth-child(2){
    display: block;
    position: absolute;
    transform: rotate(45deg);
    left: 45%;
    bottom: 35%;
}
span:nth-child(3){
    display: block;
    position: absolute;
    transform: rotate(-45deg);
    left: 25%;
    bottom: 54%;
}

span:nth-child(4){
    display: block;
    position: absolute;
    transform: rotate(-45deg);
    left: 45%;
    bottom: 54%;
}

.send-message-button{
    border:none;
    margin-left: 5px;
    background:#312E2A;
    cursor: pointer;
}

.fleche-div:hover span:nth-child(1){
    transform: rotate(-45deg);
}

.fleche-div:hover span:nth-child(2){
    transform: rotate(45deg);
}

.fleche-div:hover span:nth-child(3){
    transform: rotate(225deg);
}

.fleche-div:hover span:nth-child(4){
    transform: rotate(-225deg);
}

.displayMessage{
    display:flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;    
    margin: 0 5%;
}

.displayMessage p{
    display:inline-block;
    margin-bottom: 0;
}

.myProfile{
    display:inline;
    background:#8DE640;
    width: 100%;
    border-radius:10px;
    padding: 10px;
    margin-bottom:10px;
    color:#413f3f;
}

.yourProfile{
    display:flex;
    justify-content: space-between;
    align-items: center;
    background:#28AAE2;
    width: 100%;
    border-radius:10px;
    padding: 10px;
    margin-bottom:10px;
    color:#413f3f;
}

.profile:hover{
    cursor:pointer;
    opacity: 0.7;
}

.sendMessageForm{
    display:flex;
    justify-content: center;
    align-items: center;
}

.typeYourMessage{
    width: 80%;
    padding: 10px;
    margin-left: 5%;
}

.invitationSecret{
    display:flex;
    justify-content: center;
    align-items: center;
    background: #413f3f;
    padding: 10%;
    border-radius: 5px;
    margin: 5% 0;
}

.messageTxt{
    display:inline;
}

#send-message{
    background: #1B74EA;
    color:white;
    font-size: 1.2em;
    padding: 10px;
    border-radius: 25px;
}

#send-message:hover{
    opacity: 0.9;
}

.hrOne {
    margin: 10px 10px 30px 10px;
}

.button-i{
    border:none;
    background: #28AAE2;
    cursor: default;
}

.command{
    padding: 0 10px;
    font-size: 1.2em;
    color:white;
    transition: 0.8s;
    cursor:pointer;
}

.command:hover{
    color:black;
    transition: 0.5s;
}

.commandChat{
    display:flex;
    justify-content: center;
    text-align: center;
    flex-direction: row;
}

.commandInput{
    padding: 3px;
}

.infoProfile{
    position:absolute;
    border-radius: 5px;
    background:#17191C;
}

.buttonProfile{
    display:flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
}

.everyButton{
    padding:2px 5px;
    border-radius: 5px;
    width:90%;
    text-align: center;
    color:#D8D9DB;
}

.everyButton:hover{
    background:#4652C4;
    cursor:pointer;
    color:#ffffff;
}

.body{
    display:flex;
    justify-content: space-between;
    align-items: center;
    flex-direction: row;
}
.chat-container{
    width: 80%;
    margin-bottom: 10px;
}

.configChannel{
    width: 20%;
    background: #272422;
    padding:1% 2%;
    border-radius: 5px;
}

.configChannel p{
    color: white;
}

.settingsChannel{
    background: #413f3f;
    padding: 2% 5%;
    border-radius: 10px;
    margin: 5% 0;
}

.updateChannel{
    display:flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    margin: 10px 0;
}

.addInvitation{
    display:flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    margin: 10px 0;
}

.update-button{
    margin-top: 10px;
}

.selectUpdateChannel{
    background: #272422;
    margin-top:10px;
}

.updateTypeChannel{
    text-align:center;
    margin-bottom: 10px;
}

.updatePasswordChannel{
    text-align:center;
}

.infobulle {
    position: relative;
}

.infobulle:hover::after, .infobulle:focus::after {
    content: attr(aria-label);
    position: absolute;
    color:white;
    font-size: 0.7em;
    top: -1em;
    left: 50%;
    transform: translateX(-50%); 
}

@media (max-width: 1000px) { /* responsive navbar */
    .createChannel {
        flex-direction: column;
        text-align:center;
        padding: 0 20px;
    }

    .createChannelResponsiveMobile {
        margin: 10px 0;
    }
    
    .privatePassword {
        flex-direction: column;
    }

    .elementPrivatePassword {
        margin: 5px 0;
    }
}

.mobile { display:none; }

@media (max-width: 800px) { /* responsive navbar */
    .body {
        flex-direction: column;
    }

    .dm-button {
        margin-left: 0;
    }

    .configChannel {
        width: 60%;
        margin: 15px 0;
    }

    .fleche-div {
        right: 0;
        margin-right: 2%;
        margin-left: 0;
        left: unset;
    }
    .pc { display: none; }
    .mobile { display: initial; }

    .formField {
        width:55%;
        margin: 0 10px;
    }

    .formFieldMobile {
        border: 0;
        border-bottom: 2px solid #9b9b9b;
        border-radius: 0;
        outline: 0;
        font-size: 1.1rem;
        color: #fff;
        background: transparent;
        padding-bottom: 3px;
        text-align:center;
        width: 60%;
    }
    .formCreateDm {
        flex-direction: column;
    }
    .infobulle {
        position: relative;
    }
    .infobulle:hover::after, .infobulle:focus::after {
        content: attr(aria-label);
        position: absolute;
        color:white;
        font-size: 0.7em;
        top: -1em;
        left: 50%;
        transform: translateX(-50%); 
    }
}
</style>