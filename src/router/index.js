import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home'
import Timers from '../views/timers/Main'
import CheckLists from '../views/checklists/Main'

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
    {
        path: '/checklists',
        name: 'Check Lists',
        component: CheckLists
    },
]

const router = new VueRouter({
    routes
})

export default router
