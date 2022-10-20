<template>
	<canvas id="game"></canvas>
    <!-- <button @click="Lobby.search()">PLAY</button> -->
	<!-- <button @click="Lobby.reconnect()">RECONNECT</button> -->
</template>

<script lang="ts">
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import { FontLoader } from "three/examples/jsm/loaders/FontLoader"
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js"
import * as Colyseus from 'colyseus.js'
import MouseMeshInteraction from '../utils/three-mmi'
import axios from 'axios'
import { degToRad } from 'three/src/math/MathUtils'
import authHeader from '@/services/auth-header'
import router from "../router"

const BALL_RADIUS = 16
let isTraining = false
let isPaddleLastTouched = false
let rond: boolean = false
let colors: number[] = []
let isUserConnected = localStorage.hasOwnProperty("user")

if (isUserConnected) {
	await axios.get(import.meta.env.VITE_BACKEND_URI + '/users/' + JSON.parse(localStorage.getItem('user')).id, { headers: authHeader() })
		.then((response) => {
			colors.push(response.data.presets.presets[0].ball);
			colors.push(response.data.presets.presets[0].wall);
			colors.push(response.data.presets.presets[0].paddle1);
			colors.push(response.data.presets.presets[0].paddle2);
			colors.push(response.data.presets.presets[0].floor);
			if (response.data.forme == "carre")
				rond = false
			else
				rond = true
		})
		.catch((e: Error) => {
			console.log(e);
		});
}

const updateBallPosition = (ball: THREE.Mesh) => {
	const ballPos = ball.position
	
	//update the ball's position.
	ballPos.x += ball.$velocity.x;
	ballPos.z += ball.$velocity.z;
	if (rond == true)
		ballPos.y = 16
}

const isPastPaddle = (paddle: THREE.Mesh, ball: THREE.Mesh) => {
	return ball.position.z > paddle.position.z + 100
}

const isRightCollision = (ball: THREE.Mesh, fieldWidth: number) => {
	const ballX = ball.position.x
	const halfFieldWidth = fieldWidth / 2

	return ballX + BALL_RADIUS > halfFieldWidth
}

const isLeftCollision = (ball: THREE.Mesh, fieldWidth: number) => {
	const ballX = ball.position.x
	const halfFieldWidth = fieldWidth / 2

	return ballX - BALL_RADIUS < -halfFieldWidth
}

const hitBallBack = (paddle: THREE.Mesh | null, ball: THREE.Mesh) => {
	const speed = Math.abs(ball.$velocity.z) * 1.05
	if (paddle && !isPaddleLastTouched)
	{
		ball.$velocity.x = (ball.position.x - paddle.position.x) * ball.$velocity.z / 100
		ball.$velocity.z = -speed
		isPaddleLastTouched = true
	}
	else
	{
		ball.$velocity.x = (Math.random()-0.5) * ball.$velocity.z
		ball.$velocity.z = speed
		isPaddleLastTouched = false
	}
}

const isWallCollision = (ball: THREE.Mesh, fieldLength: number) => {
	return ball.position.z - BALL_RADIUS <= -fieldLength / 2
}

const isPaddleCollision = (paddle: THREE.Mesh, ball: THREE.Mesh, paddleWidth: number) => {
	return ball.position.z + BALL_RADIUS >= paddle.position.z && isBallAlignedWithPaddle(paddle, ball, paddleWidth)
}

const isBallAlignedWithPaddle = (paddle: THREE.Mesh, ball: THREE.Mesh, paddleWidth: number) => {
	const halfPaddleWidth = paddleWidth / 2
	const paddleX = paddle.position.x
	const ballX = ball.position.x

	return ballX > paddleX - halfPaddleWidth && ballX < paddleX + halfPaddleWidth
}

const startBallMovement = (ball: THREE.Mesh) => {
	ball.$velocity.z = 20
	ball.$velocity.x = 0
}

const processBallMovement = (paddle: THREE.Mesh, ball: THREE.Mesh, fieldWidth: number, fieldLength: number, paddleWidth: number) => {
	updateBallPosition(ball)
	if (isLeftCollision(ball, fieldWidth) && ball.$velocity.x < 0)
	{
		ball.$velocity.x *= -1
	}

	if (isRightCollision(ball, fieldWidth) && ball.$velocity.x > 0)
	{
		ball.$velocity.x *= -1
	}
	
	if (isPaddleCollision(paddle, ball, paddleWidth))
	{
		hitBallBack(paddle, ball)
	}

	if (isWallCollision(ball, fieldLength))
	{
		hitBallBack(null, ball)
	}
	
	if (isPastPaddle(paddle, ball)) {
		//relaunch ball
		ball.position.set(0,0,0)
		startBallMovement(ball)
	}
}

class Game {
	
	distance = 1200
	fieldWidth = 1000
	fieldLength = 1500
	points: THREE.Mesh[] = []
	loader: FontLoader
	paddleWidth = this.fieldWidth / 6
	paddleHeight = 20
	paddleDepth = this.paddleHeight
	paddles: THREE.Mesh[] = []
	balls: THREE.Mesh[] = []
	field: THREE.Mesh | null = null
	mousePosition = 0
	scene: THREE.Scene = new THREE.Scene()
	camera: THREE.Camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 10000 )
	trainingWall: THREE.Mesh
	playButton: THREE.Mesh
	playText: THREE.Mesh
	searchingText: THREE.Mesh
	waitingText: THREE.Mesh
	canvas = null
	mmi: MouseMeshInteraction = null
	renderer: THREE.Renderer = null
	lobbyConnection: Colyseus.Room<unknown> | null = null
	client = new Colyseus.Client(import.meta.env.VITE_SERVER_URI)
	playing: boolean = false
	isSearching: boolean = false
	gameRoom: Colyseus.Room<unknown> | null = null 
	playerID: number | null = null
	isInvited: boolean = false

	constructor(isInvited: boolean, lobbyConnection: Colyseus.Room<unknown> | null = null) {
		this.lobbyConnection = lobbyConnection
		this.isSearching = false
		this.isInvited = isInvited
		this.canvas = document.querySelector("#game")
		this.renderer = new THREE.WebGLRenderer({
			canvas: this.canvas,
			antialias: true
		})
		this.loader = new FontLoader()
		const parent = this
		this.renderer.domElement.isTraining = this.isTraining

		console.log(this.lobbyConnection)
		if (this.isInvited && this.lobbyConnection)
		{
			this.loader.load('/src/fonts/Roboto Black_Regular.json', (font) => {
				const waitingTextGeometry = new TextGeometry("WAITING OPPONENT", {
					font: font,
					size: 50,
					height: 0.1,
					curveSegments: 12,
				})

				const waitingTextMaterial = new THREE.MeshBasicMaterial({
					color: 0xffffff
				})

				parent.waitingText = new THREE.Mesh(waitingTextGeometry, waitingTextMaterial)
				parent.waitingText.position.set(-175, 475, 100)

			})

			this.lobbyConnection.onMessage("bonjour", ({clientID, numberClient}) => {
				// this.scene.remove(this.playButton, this.playText, this.searchingText, this.paddles)
				localStorage.setItem("clientID", clientID)
				this.initField(clientID)
				this.initPaddles(clientID, numberClient)
				this.initBalls()
				this.moveCameraToPlayer(clientID)
				this.connectMouseToPlayer(clientID, this.lobbyConnection)
			})

			this.lobbyConnection.onMessage("endgame", () => {
				localStorage.removeItem("roomId")
				localStorage.removeItem("sessionId")
				this.clean()
				this.initTraining()
			})
		}
		else
		{
			this.mmi = new MouseMeshInteraction(this.scene, this.camera)
			const geo = new THREE.BoxGeometry(1000, 100, 100)
			const mat = new THREE.MeshBasicMaterial({ color: 'black' })
			this.playButton = new THREE.Mesh(geo, mat)
			this.playButton.position.set(0, 500, 0)
			this.playButton.name = 'play'
			this.loader.load('/src/fonts/Roboto Black_Regular.json', (font) => {
				const playTextGeometry = new TextGeometry("PLAY", {
					font: font,
					size: 50,
					height: 0.1,
					curveSegments: 12,
				})

				const playTextMaterial = new THREE.MeshBasicMaterial({
					color: 0xffffff
				})

				parent.playText = new THREE.Mesh(playTextGeometry, playTextMaterial)
				parent.playText.position.set(-75, 475, 100)
				parent.scene.add(parent.playText)

				const searchingTextGeometry = new TextGeometry("SEARCHING...", {
					font: font,
					size: 50,
					height: 0.1,
					curveSegments: 12,
				})

				const searchingTextMaterial = new THREE.MeshBasicMaterial({
					color: 0xffffff
				})

				parent.searchingText = new THREE.Mesh(searchingTextGeometry, searchingTextMaterial)
				parent.searchingText.position.set(-175, 475, 100)

			})

			this.mmi.addHandler('play', 'click', function (mesh) {
				console.log("playClick", parent.isSearching)
				if (!parent.isSearching)
				{
					parent.search()
					parent.scene.add(parent.searchingText)
					parent.scene.remove(parent.playText)
					parent.isSearching = true
				}
				else
				{
					parent.cancel()
					parent.scene.remove(parent.searchingText)
					parent.scene.add(parent.playText)
					parent.isSearching = false
				}
			})

			this.mmi.addHandler('play', 'mouseenter', function (mesh) {
				document.body.style.cursor = 'pointer'
			})

			this.mmi.addHandler('play', 'mouseleave', function (mesh) {
				document.body.style.cursor = ''
			})


			//Training BEGIN
			this.initTraining()
			this.renderer.domElement.addEventListener('mousemove', this.onPlayerMoveTraining.bind(this))
			//Training END

		}

		this.scene.background = new THREE.Color(colors[1])

		this.camera.position.y = 250
		this.renderer.setSize(window.innerWidth, window.innerHeight)


		this.animate()
		window.addEventListener('resize', this.onWindowResize.bind(this), false)
	}

	initTraining()
	{
		this.lobbyConnection = null

		this.playerID = null
		this.gameRoom = null
		this.initField(0)
		this.initPaddles(0, 1)
		isTraining = true
		this.initBalls()
		this.moveCameraToPlayer(0)
		this.isSearching = false

		this.renderer.domElement.isTraining = this.isTraining

		this.scene.add(this.playButton, this.playText)
	}

	initField(numberClient: number)
	{
		if (this.field)
			this.scene.remove(this.field)

		const material = new THREE.MeshBasicMaterial({
			color: colors[4]
		})
		if (numberClient <= 2)
		{
			const fieldGeometry = new THREE.BoxGeometry(this.fieldWidth, 0, this.fieldLength, 1, 1, 1)

			this.field = new THREE.Mesh(fieldGeometry, material)

			this.loader.load('/src/fonts/Roboto Black_Regular.json', (font) => {

				for (let i = 11; i > 0; i--)
				{
					const scoreGeometry = new TextGeometry(`${i}`, {
						font: font,
						size: 50,
						height: 0.1,
						curveSegments: 12,
					});

					const scoreMaterial = new THREE.MeshBasicMaterial({
						color: 0xffffff
					})

					const scoreMesh = new THREE.Mesh(scoreGeometry, scoreMaterial)
					scoreMesh.position.y = 100
					this.points.push(scoreMesh)
				}
			});
		}
		else
		{
			const fieldGeometry = new THREE.CylinderGeometry(this.fieldWidth, 0, 0, numberClient, 32)

			this.field = new THREE.Mesh(fieldGeometry, material)
		}
		this.scene.add(this.field)
		this.camera.lookAt(0,0,0)
	}

	moveCameraToPlayer(playerID: number)
	{
		if (playerID == 0)
			this.camera.position.z = this.distance
		else
			this.camera.position.z = -this.distance
		this.camera.lookAt(0,0,0)
	}

	initPaddles(clientID: number, numberClient: number)
	{
		if (this.paddles.length > 0)
		{
			console.log("paddles", this.paddles)
			for (let i = this.paddles.length - 1; i >= 0; i--)
			{
				this.scene.remove(this.paddles[i])
				console.log(`paddles[${i}]`, this.paddles[i])
				this.paddles.pop()
			}
			console.log("popped", this.paddles)
		}
		for (let i = 0; i < numberClient; i++) {

			let mat: THREE.Material

			if (i == 0)
				mat = new THREE.MeshBasicMaterial({color: colors[2]})
			else
				mat = new THREE.MeshBasicMaterial({color: colors[3]})

			const paddleGeometry: THREE.BoxGeometry = new THREE.BoxGeometry(this.paddleWidth, this.paddleHeight, this.paddleDepth)
			const paddle: THREE.Mesh = new THREE.Mesh(paddleGeometry, mat)

			if (i == clientID)
				paddle.position.z = this.fieldLength / 2 - this.paddleDepth / 2
			else
				paddle.position.z = -(this.fieldLength / 2 - this.paddleDepth / 2)

			paddle.position.y = 10

			this.paddles.push(paddle)
			this.scene.add(paddle)
		}
		console.log("paddles == ", this.paddles)
	}

	initBalls()
	{
		if (this.balls[0])
			this.scene.remove(this.balls[0])
		let ballGeometry
		if (rond == true)
			 ballGeometry = new THREE.SphereGeometry( 15, 32, 30);
		else
			 ballGeometry = new THREE.BoxGeometry(16, 16, 16)

		const ballMaterial = new THREE.MeshBasicMaterial({color: colors[0]})
		const newBall = new THREE.Mesh(ballGeometry, ballMaterial)

		newBall.$velocity = {x: 0, z: -20, y: 16}

		this.balls[0] = newBall
		for (let i = 0; i < this.balls.length; i++)
		{
			this.scene.add(this.balls[i])
		}
		if (isTraining)
		{
			const geometry = new THREE.BoxGeometry(this.fieldWidth, 40, 0)
			const material = new THREE.MeshBasicMaterial({
				color: colors[4]
			})
			this.trainingWall = new THREE.Mesh(geometry, material)
			this.trainingWall.position.set(0, 20, -this.fieldLength / 2)
			this.scene.add(this.trainingWall)
		}
		else
		{
			this.scene.remove(this.trainingWall)
		}
	}

	addWalls()
	{

		const material = new THREE.MeshBasicMaterial({color: colors[1]})
		const wallGeometry = new THREE.BoxGeometry(this.paddleWidth / 2 + 2, this.paddleHeight + 1, this.fieldLength + 2)
		const wallLeft = new THREE.Mesh(wallGeometry, material)
		const wallRight = new THREE.Mesh(wallGeometry, material)

		wallLeft.position.x = -(this.fieldWidth / 2 + this.paddleWidth / 4 + 1)
		wallRight.position.x = this.fieldWidth / 2 + this.paddleWidth / 4 + 1
		wallLeft.position.y = 10
		wallRight.position.y = 10
		this.scene.add(wallLeft)
		this.scene.add(wallRight)
	}

	animate() {
		requestAnimationFrame(this.animate.bind(this))
		if (isTraining && (this.isInvited || this.mmi))
			processBallMovement(this.paddles[0], this.balls[0], this.fieldWidth, this.fieldLength, this.paddleWidth)
		if (!this.isInvited)
			this.mmi.update()
		this.renderer.render(this.scene, this.camera)
	}

	showLifePoints(score: number) {
		this.scene.add(this.points[score])
		setTimeout(() => {
			this.scene.remove(this.points[score])
		}, 500)
	}

	onWindowResize(){
		this.camera.aspect = window.innerWidth / window.innerHeight
		this.camera.updateProjectionMatrix();

		this.renderer.setSize(window.innerWidth, window.innerHeight);
	}

	playerDies()
	{
		console.log("you win")
	}

	clean() {
		for (let i = 0; i < this.paddles.length; i++) {
			this.scene.remove(this.paddles[i])
		}
		if (this.field)
			this.scene.remove(this.field)
	}

	renderTraining() {
		if (isTraining) //put it globally
		{
			requestAnimationFrame(this.renderTraining.bind(this))

			processBallMovement(this.paddles[0], this.balls[0], this.fieldWidth, this.fieldLength, this.paddleWidth)
			this.renderer.render(this.scene, this.camera)
		}
	}

	onPlayerMoveTraining(e: Event) {
		if (isTraining)
			this.paddles[0].position.x = ((-window.innerWidth + e.clientX) / window.innerWidth * this.fieldWidth) + this.fieldWidth / 2
		else if (this.gameRoom)
			this.gameRoom.send("move", {mouseMove: (-window.innerWidth + e.clientX) / window.innerWidth, id: this.playerID})
	}

	connectMouseToPlayer(playerID: number, gameRoom: Colyseus.Room<unknown>)
	{
		this.gameRoom = gameRoom
		this.playerID = playerID
		this.client.getAvailableRooms("state_handler").then(rooms => {
			rooms.forEach((room) => {
				console.log(room.metadata.id)
				console.log("player ==>", rooms[0].metadata.id[0]);
				console.log("player ==>", rooms[0].metadata.id[1]);
			}
		)})
	}

	async search() {
		this.lobbyConnection = await this.client.joinOrCreate("ranked1v1", localStorage.getItem("user"))

		this.lobbyConnection.onMessage("seat", (message) => {
			this.client.consumeSeatReservation(message).then((gameRoom) => {
				isTraining = false
				this.lobbyConnection.send("confirm");					
				localStorage.setItem("roomId", gameRoom.id);
				localStorage.setItem("sessionId", gameRoom.sessionId);
				gameRoom.onMessage("bonjour", ({clientID, numberClient}) => {
					this.scene.remove(this.playButton, this.playText, this.searchingText, this.paddles)
					localStorage.setItem("clientID", clientID)
					this.initField(clientID)
					this.initPaddles(clientID, numberClient)
					this.initBalls()
					this.moveCameraToPlayer(clientID)
					this.connectMouseToPlayer(clientID, gameRoom)
				})

				gameRoom.onMessage("endgame", () => {
					localStorage.removeItem("roomId")
					localStorage.removeItem("sessionId")
					this.clean()
					this.initTraining()
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
	}

	async reconnect() {
		this.client.getAvailableRooms("state_handler").then(rooms => {
			rooms.forEach((room) => {
				room.metadata.id.forEach(element => {
					console.log("element === ", element)
					if (JSON.parse(localStorage.getItem("user")).id == element.id) {
						console.log("le joueur est dans une partie")
						this.lobbyConnection = this.client.reconnect(room.roomId, localStorage.getItem("sessionId"));
						this.lobbyConnection.then((gameRoom) => {
						this.scene.remove(this.playButton, this.playText, this.searchingText, this.paddles)
						const clientID = localStorage.getItem("clientID")
						console.log("clientid ==", clientID)
						this.initField(clientID)
						this.initPaddles(clientID, 2)
						this.initBalls()
						this.moveCameraToPlayer(clientID)
						this.connectMouseToPlayer(clientID, gameRoom)
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
	}

	async cancel() {
		if (this.lobbyConnection)
		{
			this.lobbyConnection.leave()
		}
	}


}


function onPlayerMove(e: Event) {
	const currentGame = e.currentTarget.currentGame
	const isTraining = e.currentTarget.isTraining
	currentGame.paddles[0].position.x = ((-window.innerWidth + e.clientX) / window.innerWidth * currentGame.fieldWidth) + currentGame.fieldWidth / 2
	// if (!isTraining)
	// {
	// 	currentGame.renderer.domElement.removeEventListener('click', onPlayerMove);
	// }
}

export default {
	props: ['invited', 'lobbyConnection'],
	setup(props) {
		console.log(props)
	},
	mounted() {
		const currentGame: Game = new Game(this.invited, this.lobbyConnection)
		currentGame.reconnect()
		document.querySelector(".navbar").classList.add("absolute")
	},
	watch: {
		$route (to, from){
			document.querySelector(".navbar").classList.remove("absolute")
		}
	} 
}



</script>

<style scoped>
#game {
	z-index: -1;
}

</style>