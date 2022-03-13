import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home'
import Timers from '../views/timers/Main'

Vue.use(VueRouter)

const routes = [
    {
        path: '/',
        name: 'Home',
        component: Home
    },
    {
        path: '/timers',
        name: 'Timers',
        component: Timers
    },
]

const router = new VueRouter({
    routes
})

export default router
