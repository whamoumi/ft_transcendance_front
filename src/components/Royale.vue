<template>
	<canvas ref="game"></canvas>
</template>

<script lang="ts">
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import { degToRad } from 'three/src/math/MathUtils'
import * as Colyseus from 'colyseus.js'

export default {
	data: () => ({
	}),
	methods: {

		createAngles()
		{
			const coord: THREE.Vector3[] = []
			for (let i = 0; i < this.numberClient; i++)
			{
				const rad = degToRad((i * 360) / this.numberClient + 90)
				const angleGeometry = new THREE.BoxGeometry(1, 200, 1)
				const mat = new THREE.MeshBasicMaterial({color: this.colors[2]})
				const angle = new THREE.Mesh(angleGeometry, mat)

				const anglePosition = new THREE.Vector3(this.fieldWidth * Math.cos(rad), 0, this.fieldWidth * Math.sin(rad))
				angle.position.x = anglePosition.x
				angle.position.y = 200 / 2
				angle.position.z = anglePosition.z
				coord.push(anglePosition)
				this.angles.push(angle)
			}
			return coord
		},
		positionPaddles(coord: THREE.Vector3[], paddle: THREE.Mesh, coordVector: THREE.Vector3, playerVector: THREE.Vector3, currentPlayer: number)
		{
			let sideWidth: number

			if (currentPlayer == coord.length - 1)
			{
				coordVector.x = paddle.position.x = (coord[0].x + coord[currentPlayer].x) / 2
				coordVector.z = paddle.position.z = (coord[0].z + coord[currentPlayer].z) / 2
				if (currentPlayer == this.currentPlayerID)
				{
					playerVector.x = coord[0].x - coord[currentPlayer].x
					playerVector.z = coord[0].z - coord[currentPlayer].z
					coordVector.x = coord[0].x
					coordVector.z = coord[0].z
				}
				sideWidth = coord[0].distanceTo(coord[currentPlayer]) 
				return sideWidth
			}
			else
			{
				paddle.position.x = (coord[currentPlayer].x + coord[currentPlayer + 1].x) / 2
				paddle.position.z = (coord[currentPlayer].z + coord[currentPlayer + 1].z) / 2
				if (currentPlayer == this.currentPlayerID)
				{
					playerVector.x = coord[currentPlayer].x - coord[currentPlayer + 1].x
					playerVector.z = coord[currentPlayer].z - coord[currentPlayer + 1].z
					coordVector.x = coord[currentPlayer + 1].x
					coordVector.z = coord[currentPlayer + 1].z
				}
				sideWidth = coord[currentPlayer].distanceTo(coord[currentPlayer + 1]) 
				return sideWidth
			}
		},

		moveCameraToPlayer(playerID: number)
		{
			this.camera.position.x = this.distance * Math.cos(degToRad(((playerID + 1) * 360 + (90 * (this.numberClient - 2))) / this.numberClient))
			this.camera.position.z = this.distance * Math.sin(degToRad(((playerID + 1) * 360 + (90 * (this.numberClient - 2))) / this.numberClient))
		},

		something(coord: THREE.Vector3[])
		{
			let sideWidth: number
			for (let i = 0; i < coord.length; i++)
			{
				const paddleGeometry: THREE.BoxGeometry = new THREE.BoxGeometry(20, 2, 1)
				let playerVector: THREE.Vector3 = new THREE.Vector3()
				const anglePoint: THREE.Vector3 = new THREE.Vector3()
				let mat: THREE.Material

				if (i == 0)
					mat = new THREE.MeshBasicMaterial({color: 0xffff00})
				else
					mat = new THREE.MeshBasicMaterial({color: this.colors[2]})

				const paddle: THREE.Mesh = new THREE.Mesh(paddleGeometry, mat)

				sideWidth = this.positionPaddles(coord, paddle, anglePoint, playerVector, i)
				playerVector = playerVector.normalize()

				if (i == this.currentPlayerID)
					this.moveCameraToPlayer(this.currentPlayerID)
				if (i == this.currentPlayerID && i == this.numberClient - 1)
				{
					document.addEventListener("mousemove", (e) => {
						paddle.position.x = anglePoint.x + ((-window.innerWidth - e.clientX * playerVector.x) / window.innerWidth * sideWidth) + (sideWidth)
						paddle.position.z = anglePoint.z + ((-window.innerWidth - e.clientX * playerVector.z) / window.innerWidth * sideWidth) + (sideWidth)
						// camera.position.x = paddle.position.x * 1.4
						// camera.position.z = paddle.position.z * 1.4

					})
				}
				else if (i == this.currentPlayerID)
				{
					document.addEventListener("mousemove", (e) => {
						paddle.position.x = anglePoint.x + ((-window.innerWidth + e.clientX * playerVector.x) / window.innerWidth * sideWidth) + (sideWidth)
						paddle.position.z = anglePoint.z + ((-window.innerWidth + e.clientX * playerVector.z) / window.innerWidth * sideWidth) + (sideWidth)
						// camera.position.x = ((-window.innerWidth + e.clientX * playerVector.x) / window.innerWidth * sideWidth) + (sideWidth)
						// camera.position.z = ((-window.innerWidth + e.clientX * playerVector.z) / window.innerWidth * sideWidth) + (sideWidth)
					})
				}
				paddle.position.y = 1
				paddle.lookAt(0,0,0)
				this.paddles.push(paddle)
				this.camera.lookAt(0,0,0)
			}
		},

		createPlayers(numberClient: number)
		{
			const coord: THREE.Vector3[] = this.createAngles()
			this.something(coord)
		},

		addMeshesToScene()
		{
			for (let i = 0; i < this.paddles.length; i++)
			{
				this.scene.add(this.paddles[i])
			}
			for (let i = 0; i < this.angles.length; i++)
			{
				this.scene.add(this.angles[i])
			}
		},

		removeMeshesToScene(meshes)
		{
			for (let i = 0; i < this.paddles.length; i++)
			{
				this.scene.remove(this.paddles[i])
			}
			for (let i = 0; i < this.angles.length; i++)
			{
				this.scene.remove(this.angles[i])
			}
		},

		createScene()
		{
			this.removeMeshesToScene(this.meshes)
			this.createPlayers(this.numberClient)
			this.addMeshesToScene(this.meshes)
			if (this.numberClient == 2)
				this.fieldGeometry = new THREE.BoxGeometry(this.fieldWidth, 0, this.fieldLength, 1, 1, 1)
			else
				this.fieldGeometry = new THREE.CylinderGeometry(this.fieldWidth, 0, 0, this.numberClient, 32)
		},

		playerDies()
		{
			this.numberClient--
			if (this.numberClient >= 2)
			{
				this.createScene()
				this.field.geometry.dispose()
				this.field.geometry = this.fieldGeometry
				this.camera.lookAt(0,0,0)
			}
			else
			{
				console.log("you win")
			}
		},

		animate()
		{
			requestAnimationFrame(this.animate);
			this.renderer.render(this.scene, this.camera);
		},

		connectMouseToPlayer(playerID: number, gameRoom: Colyseus.Room<unknown>)
		{
			console.log(playerID, "connected")
			this.client.getAvailableRooms("state_handler").then(rooms => {
				rooms.forEach((room) => {
					console.log(room.metadata.id)
					console.log("player ==>", rooms[0].metadata.id[0]);
					console.log("player ==>", rooms[0].metadata.id[1]);
				}
			)})
			if (playerID == 0)
			{
					this.renderer.domElement.removeEventListener("mousedown", onPlayerMoveTraining)
					this.renderer.domElement.addEventListener('mousemove', (e) => {
					this.paddles[playerID].position.x = ((-window.innerWidth + e.clientX) / window.innerWidth * this.fieldWidth) + this.fieldWidth / 2
					gameRoom.send("move", {mouseMove: e.clientX, id: playerID, position: this.paddles[playerID].position})
				});
			}
			else
			{
					this.renderer.domElement.removeEventListener("mousedown", onPlayerMoveTraining)
					this.renderer.domElement.addEventListener("mousemove", (e) => {
					this.paddles[playerID].position.x = -(((-window.innerWidth + e.clientX) / window.innerWidth * this.fieldWidth) + this.fieldWidth / 2)
					gameRoom.send("move", {mouseMove: e.clientX, id: playerID, position: this.paddles[playerID].position})
				})
			}
		},

		async search() {
			this.lobbyConnection = await this.client.joinOrCreate("ranked1v1", localStorage.getItem("user"));

			this.lobbyConnection.onMessage("seat", (message) => {
				this.client.consumeSeatReservation(message).then((gameRoom) => {
					this.lobbyConnection.send("confirm");					
					localStorage.setItem("roomId", gameRoom.id);
					localStorage.setItem("sessionId", gameRoom.sessionId);
					gameRoom.onMessage("bonjour", ({clientID, numberClient}) => {
						console.log("bonjour")
						localStorage.setItem("clientID", clientID)
						this.initField(clientID)
						this.initPaddles(clientID, numberClient)
						this.initBalls()
						this.moveCameraToPlayer(clientID)
						this.connectMouseToPlayer(clientID, gameRoom)
					})

					gameRoom.state.players.onAdd = (player, sessionId) => {

						player.onChange = (changes) => {
							if (this.paddles[player.number])
							{
								this.paddles[player.number].position.x = player.posX
								this.paddles[player.number].position.z = player.posZ
								this.paddles[player.number].position.y = player.posY
							}
							for (let i = 0; i < changes.length; i++)
							{
								if (changes[i].field == "score")
								{

									this.showLifePoints(changes[i].value)
								}
							}
						}
					}
					gameRoom.state.balls.onAdd = (ball) => {
						ball.onChange = (changes) => {
							if (this.balls[0])
							{
								this.balls[0].position.x = ball.posX
								this.balls[0].position.z = ball.posZ
							}
						}
					}
				});
			});

			this.lobbyConnection.onMessage("clients", (message) => {
				console.log(message);
			});

			this.lobbyConnection.onMessage("oui", (message) => {
				console.log("oui");
				this.searching = true
			})

			this.lobbyConnection.onLeave(() => {
				console.log("leaving")
			})
		},

		async reconnect() {
			this.client.getAvailableRooms("state_handler").then(rooms => {
				rooms.forEach((room) => {
					room.metadata.id.forEach(element => {
						if (JSON.parse(localStorage.getItem("user")).id == element.id)
						{
							console.log("le joueur est dans une partie")
							this.lobbyConnection = this.client.reconnect(room.roomId, localStorage.getItem("sessionId"));
							this.lobbyConnection.then((gameRoom) => {
								this.initField(localStorage.getItem("clientID"))
								this.initPaddles(localStorage.getItem("clientID"), 2)
								this.initBalls()
								this.moveCameraToPlayer(localStorage.getItem("clientID"))
								this.connectMouseToPlayer(localStorage.getItem("clientID"), gameRoom)
								gameRoom.state.players.onAdd = (player, sessionId) => {
									player.onChange = (changes) => {
										if (this.paddles[player.number])
										{
											this.paddles[player.number].position.x = player.posX
											this.paddles[player.number].position.z = player.posZ
											this.paddles[player.number].position.y = player.posY
										}
										for (let i = 0; i < changes.length; i++)
										{
											if (changes[i].field == "score")
												this.showLifePoints(changes[i].value)
										}
									}
								}
								gameRoom.state.balls.onAdd = (ball) => {
									ball.onChange = (changes) => {
										if (this.balls[0])
										{
											this.balls[0].position.x = ball.posX
											this.balls[0].position.z = ball.posZ
										}
									}
								}
							})
						}
					});
				});	
			})
		},

		async cancel() {
			if (this.searching && this.lobbyConnection)
			{
				this.lobbyConnection.leave()
				this.searching = false
			}
		},
	},
	mounted () {
		this.client = new Colyseus.Client(import.meta.env.VITE_SERVER_URI)
		this.scene = new THREE.Scene()
		this.currentGame = null
		this.numberClient = 0
		this.currentPlayerID = -1
		this.lobbyConnection = null
		this.searching = false
		this.paddles = []
		this.angles = []
		this.balls = []
		this.colors = [0x172A3A, 0xEE4266, 0xffffff]

		this.scene.background = new THREE.Color(this.colors[1])

		const distance = 150
		this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
		this.camera.position.y = 15
		this.scene.add(this.camera)

		this.canvas = this.$refs.game

		this.renderer = new THREE.WebGLRenderer({
			canvas: this.canvas,
			antialias: true
		});

		this.renderer.setSize(window.innerWidth, window.innerHeight);

		document.body.appendChild( this.renderer.domElement );

		const controls = new OrbitControls( this.camera, this.renderer.domElement );

		const ambient = new THREE.AmbientLight(0xffffff)
		this.scene.add(ambient)

		this.fieldWidth = 120
		const fieldLength = 200
		let fieldGeometry: THREE.CylinderGeometry | THREE.BoxGeometry = new THREE.CylinderGeometry(this.fieldWidth, 0, 0, this.numberClient, 32)

		const material = new THREE.MeshBasicMaterial({
			color: this.colors[0]
		})

		const field = new THREE.Mesh(fieldGeometry, material)
		this.scene.add(field)


		let meshes = this.createPlayers(this.numberClient)
		this.addMeshesToScene(meshes)
		this.createScene()

		this.animate();
		this.initField(0)
		this.initPaddles(0, 1)
		this.initBalls()
		this.moveCameraToPlayer(0)

	}
}

</script>

<style scoped>

</style>