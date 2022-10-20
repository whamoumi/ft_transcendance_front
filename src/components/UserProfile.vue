<template>
	<div>
		<p>username: {{store.user.username}}</p>
		<img v-bind:src="store.user.picture" height="125" width="175"/>
		<p>Autres infos a rajouter : rank, match history, ...</p>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import axios from 'axios'
import authHeader from '@/services/auth-header'

export default defineComponent({
	name: 'user_profile',
	data() {
		return {
			user: {
				username: '',
				picture: '',
			}
		}
	},
	mounted() {
		axios.get(import.meta.env.VITE_BACKEND_URI + '/users/' + this.$route.params.id, { headers: authHeader() })
			.then(response => {
				this.user = response.data
			})
			.catch(e => {
				console.log(e)
			})
	}
})
</script>