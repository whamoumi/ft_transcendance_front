<template>
	<canvas ref="game"></canvas>
</template>

<script lang="ts">
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import { FontLoader } from "three/examples/jsm/loaders/FontLoader"
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js"

export default {
	name: "Game",
	props: ["isTraining", "isStream"]
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
	colors = [0x172A3A, 0xEE4266, 0xffffff]
	mousePosition = 0
	scene: THREE.Scene
	renderer: THREE.Renderer
	camera: THREE.PerspectiveCamera
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
				mat = new THREE.MeshBasicMaterial({color: 0xffff00})
			else
				mat = new THREE.MeshBasicMaterial({color: this.colors[2]})

			const paddleGeometry: THREE.BoxGeometry = new THREE.BoxGeometry(this.paddleWidth, this.paddleHeight, this.paddleDepth)
			const paddle: THREE.Mesh = new THREE.Mesh(paddleGeometry, mat)

			if (i == 0)
				paddle.position.z = this.fieldLength / 2 - this.paddleDepth / 2
			else
				paddle.position.z = -(this.fieldLength / 2 - this.paddleDepth / 2)

			paddle.position.y = 10

			console.log("init position", paddle.position)

			this.paddles.push(paddle)

			// if (i == this.currentPlayerID)
			// {
			// 	this.moveCameraToPlayer(this.currentPlayerID)
			// 	this.connectMouseToPlayer(this.currentPlayerID, this.paddles[i])
			// }
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

		newBall.$velocity = {x: 0, z: -20}

		this.balls[0] = newBall
		for (let i = 0; i < this.balls.length; i++)
		{
			this.scene.add(this.balls[i])
		}
		if (isTraining)
		{
			const geometry = new THREE.BoxGeometry(this.fieldWidth, 40, 0)
			const material = new THREE.MeshBasicMaterial({
				color: this.colors[0]
			})
			this.trainingWall = new THREE.Mesh(geometry, material)
			this.trainingWall.position.set(0, 20, -this.fieldLength / 2)
			this.scene.add(this.trainingWall)
			this.renderTraining()
		}
		else
		{
			this.scene.remove(this.trainingWall)
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

	renderTraining() {
		if (isTraining) //put it globally
		{
			requestAnimationFrame(this.renderTraining.bind(this))

			processBallMovement(this.paddles[0], this.balls[0], this.fieldWidth, this.fieldLength, this.paddleWidth)
			this.renderer.render(this.scene, this.camera)
		}
	}

}
</script>

<style scoped>

</style>