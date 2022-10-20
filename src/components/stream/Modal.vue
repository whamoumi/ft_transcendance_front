<template>
  <div class="bloc-modale" ref="streamModal">
	<button class="btn-modale" @click="leave()">X</button>
	<canvas ref="stream"></canvas>
  </div>
</template>


<script lang="ts">
import * as THREE from "three"
import { FontLoader } from "three/examples/jsm/loaders/FontLoader"
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js"

export default {
	name: "Modal",
	data: () => ({
		stream: null,
		clientID: 0,
	}),
	props: {
		leave: Function,
		players: Array,
		balls: Array
	},
	watch: {
		players: {
			handler() {
				
				if (this.stream)
				{
					console.log(this.players)
					this.stream.initPaddles(this.clientID, this.players.length)
					this.players.forEach((player, idx) => {
						// console.log(this.stream.paddles, "paddles")
						if (this.stream.paddles.length)
						{
							console.log(player, "scoreeeee")
							if (player.scored)
							{
								this.stream.showLifePoints(player.score)
								player.scored = false
							}
							this.stream.paddles[idx].position.set(player.x, player.y, player.z)
						}
					});
				}

			},
			deep: true
		},
		balls: {
			handler() {
				if (this.stream)
				{
					this.balls.forEach((ball, idx) => {
						// console.log(ball.x)
						if (this.stream.balls.length)
						{
							// console.log(this.stream.balls[idx])
							this.stream.balls[idx].position.set(ball.x, ball.y, ball.z)
						}
					})
				}
			},
			deep: true
		}
	},
	mounted() {
		const scene = new THREE.Scene();
		const canvas: HTMLCanvasElement = this.$refs.stream
		const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 10000 );
		const renderer = new THREE.WebGLRenderer({
			canvas: canvas,
			antialias: true
		});
		renderer.setSize(window.innerWidth, window.innerHeight)

		this.stream = new Game(scene, renderer, camera)
		this.stream.initField(this.clientID)
		this.stream.moveCameraToPlayer(this.clientID)
		this.stream.initBalls()
		function animate() {
			requestAnimationFrame(animate)
			renderer.render(scene, camera)
		}
		animate()

	},
	methods: {
	}
};

let isTraining = false

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
	colors = [0x172A3A, 0xEE4266, 0xffffff]
	mousePosition = 0
	scene: THREE.Scene
	renderer: THREE.Renderer
	camera: THREE.Camera
	trainingWall: THREE.Mesh

	constructor(scene: THREE.Scene, renderer: THREE.Renderer, camera: THREE.PerspectiveCamera) {
		this.scene = scene
		scene.background = new THREE.Color(this.colors[1])
		this.renderer = renderer
		this.camera = camera

		this.loader = new FontLoader();

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

		this.camera.position.y = 150
		this.scene.add(this.camera)

		this.renderer.setSize(window.innerWidth, window.innerHeight);


		const ambient = new THREE.AmbientLight(0xffffff)
		this.scene.add(ambient)

		// this.addWalls()
		this.animate()
		window.addEventListener('resize', this.onWindowResize, false);
	}

	initField(numberClient: number)
	{
		if (this.field)
			this.scene.remove(this.field)

		const material = new THREE.MeshBasicMaterial({
			color: this.colors[0]
		})
		if (numberClient <= 2)
		{
			const fieldGeometry = new THREE.BoxGeometry(this.fieldWidth, 0, this.fieldLength, 1, 1, 1)

			this.field = new THREE.Mesh(fieldGeometry, material)
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
			for (let i = this.paddles.length - 1; i >= 0; i--)
			{
				this.scene.remove(this.paddles[i])
				this.paddles.pop()
			}
		}
		for (let i = 0; i < numberClient; i++) {

			let mat: THREE.Material

			if (i == 0)
				mat = new THREE.MeshBasicMaterial({color: 0xffff00})
			else
				mat = new THREE.MeshBasicMaterial({color: this.colors[2]})

			const paddleGeometry: THREE.BoxGeometry = new THREE.BoxGeometry(this.paddleWidth, this.paddleHeight, this.paddleDepth)
			const paddle: THREE.Mesh = new THREE.Mesh(paddleGeometry, mat)

			this.paddles.push(paddle)
			this.scene.add(paddle)
		}
	}

	initBalls()
	{
		if (this.balls[0])
			this.scene.remove(this.balls[0])
		const ballGeometry = new THREE.BoxGeometry(16, 16, 16)
		const ballMaterial = new THREE.MeshBasicMaterial({color: 0xffffff})
		const newBall = new THREE.Mesh(ballGeometry, ballMaterial)

		this.balls[0] = newBall
		for (let i = 0; i < this.balls.length; i++)
		{
			this.scene.add(this.balls[i])
		}
	}

	addWalls()
	{

		const material = new THREE.MeshBasicMaterial({color: this.colors[1]})
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
		requestAnimationFrame(() => this.animate())
		this.renderer.render(this.scene, this.camera)
	}

	showLifePoints(score: number) {
		this.scene.add(this.points[score])
		setTimeout(() => {
			this.scene.remove(this.points[score])
		}, 500)
	}

	onWindowResize(){

		this.camera.aspect = window.innerWidth / window.innerHeight;
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

}
</script>


<style>

.bloc-modale {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

.overlay {
  background: rgba(0, 0, 0, 0.5);
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
}

.modale {
  background: #f1f1f1;
  color: #333;
  position: fixed;
  width: 40%;
  height: 40%;
}

.btn-modale {
  position: absolute;
  top: 10px;
  right: 10px;
}

</style>