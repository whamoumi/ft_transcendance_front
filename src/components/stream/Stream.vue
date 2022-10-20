<template>
    <div class="roomSpectate">
        <p>List of games in live</p>
        <div class="eachRoom" v-for="(room) in roomStream">
            <p><span class="joueur">{{ room.metadata.user[0] }}</span> VS <span class="joueur">{{ room.metadata.user[1] }}</span></p>
            <button class="basic-button" @click="view(room.roomId)">Spectate this games</button>
        </div>
		<modal v-if="!!room" :leave="leave" :players="players" :balls="balls"></modal>
    </div>
</template>
    
<script lang='ts'>
import Modal from "./Modal.vue"
import { FontLoader } from "three/examples/jsm/loaders/FontLoader"
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js"
import * as THREE from 'three'
import * as Colyseus from 'colyseus.js'

export default {
	data: () => ({
		roomStream: [],
		client: new Colyseus.Client(import.meta.env.VITE_SERVER_URI),
		room: null,
		players: [],
		balls: [{x: 0, y: 0, z: 0}]
	}),
	components: {
		modal: Modal
	},
	created() {
		 this.client.getAvailableRooms("state_handler").then(rooms => {
			console.log(rooms, "rooms")
			this.roomStream = rooms
            let i = 0
            for (let i = 0; rooms[i]; i++){
                console.log("joueur1==", rooms[i].metadata.user[0]);
                console.log("joueur2==", rooms[i].metadata.user[1])
            	console.log("data==", rooms[i].metadata)
            }
        })
        setInterval(() =>{
            this.client.getAvailableRooms("state_handler").then(rooms => {
                this.roomStream = rooms;
                let i = 0;
                for (let i = 0; rooms[i]; i++) {
                    console.log("joueur1==", rooms[i].metadata.user[0]);
                    console.log("joueur2==", rooms[i].metadata.user[1])
					console.log("data==", rooms[i].metadata)
                }
            })
        }, 15000)
	},
	methods: {

		async view(option : string) {
			this.room = await this.client.joinById(option);
			this.room.state.players.onAdd = (player, sessionId) => {
				this.players.push({x: 0, y: 0, z: 0, score: 0, scored: false})
				player.onChange = (changes) => {
					for (let i = 0; i < changes.length; i++)
					{
						if (changes[i].field == "score")
						{
							this.players[player.number].score = changes[i].value
							this.players[player.number].scored = true
						}
					}
					this.players[player.number].x = player.posX
					this.players[player.number].y = player.posY
					this.players[player.number].z = player.posZ
				}
			}
			this.room.state.balls.onAdd = (ball) => {
				console.log(ball, "===ball")
				ball.onChange = (changes) => {
					this.balls[0].x = ball.posX
					this.balls[0].z = ball.posZ
				}
			}
		},

		async leave() {
			console.log(this.room)
			this.room.leave()
			this.room = null
			this.players = []
			this.balls = [{x: 0, y: 0, z: 0}]
		},

	}
}

</script>
    
<style scoped>
    * {
        margin:0;
        padding:0;
        color:white;
    }
    .basic-button {
        border-radius: 10px;
        box-sizing: border-box;
        margin-left: 10px;
        padding: 10px 10px;
        border: none;
        color:white;
        background-color: rgb(57, 184, 57);
        transition: 0.3s;
        cursor: pointer;
        font-size: 1rem;
    }
    .roomSpectate {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        padding: 20px;
        background-color: #9b9b9b;
        margin: 3% 25%;
    }
    .eachRoom {
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        padding: 5px;
    }
    .joueur {
    	color: crimson;
    }
</style>