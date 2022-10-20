import { createWebHistory, createRouter } from "vue-router";
import type { RouteRecordRaw } from "vue-router";
import axios from "axios";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "login",
    component: () => import("./components/Login.vue"),
  },
  {
    path: "/profile",
    name: "profile",
    component: () => import("./components/Profile.vue"),
  },
  {
	  path: "/profile/:id",
	  name: "user_profile",
	  component: () => import("./components/UserProfile.vue")
  },
  {
    path: "/profile_update",
    name: "profile_update",
    component: () => import("./components/ProfileUpdate.vue"),
  },
  {
    path: "/tfa_login",
    name: "tfa_login",
    component: () => import("./components/2FALogin.vue"),
  },
  {
	  path: '/chat',
	  name: 'chat',
	  component: () => import("./components/chat/Chat.vue")
  },
  {
    path: "/game",
    name: "game",
    component: () => import("./components/Dashboard.vue"),
  },
  {
    path: "/1v1",
    name: "1v1",
    component: () => import("./components/Dashboard.vue"),
  },
  {
    path: "/royale",
    name: "royale",
    component: () => import("./components/Royale.vue"),
  },
  {
    path: "/profileuser/:username",
    name: "profileUser",
    component: () => import("./components/ProfileUsername.vue"),
  },
  {
    path: "/stream",
    name: "stream",
    component: () => import("./components/stream/Stream.vue"),
  }
];
const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from) => {
	let storedUser = localStorage.getItem('user')
 // console.log(JSON.parse(storedUser).twofa_enabled)
	//let stored = JSON.parse(localStorage.getItem('user'))
  //console.log(stored['twofa_enabled'])
	if (!storedUser)
	{
		if (to.name !== 'login')
			return {name: 'login'}
	}
	if (storedUser)
	{
    if(JSON.parse(localStorage.getItem('user')).twofa_enabled === true && JSON.parse(localStorage.getItem('user')).twovalid === false){      	     
        if (to.name !== 'tfa_login')
			    return {name: 'tfa_login'}
    }
    if (JSON.parse(localStorage.getItem('user')).twovalid === true)
		  if (to.name == 'tfa_login')
			  return {name: 'profile'}
  }
})

export default router;
