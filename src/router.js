import { createRouter, createWebHistory } from 'vue-router'
import Callback from './components/Callback.vue'
import NotFound from './components/NotFound.vue' 
import Home from './components/Home.vue' 
import EventScrapper from './components/EventScrapper.vue' 
import GroupScrapper from './components/GroupScrapper.vue' 
import Event from './components/Event.vue' 
import Group from './components/Group.vue' 
import Done from './components/Done.vue' 
import SelectInstance from './components/SelectInstance.vue' 
import Share from './components/Share.vue' 
import Welcome from './components/Welcome.vue' 
import RegisterFeed from './components/RegisterFeed.vue' 
import Automations from './components/Automations.vue' 
import AutomationHistory from './components/AutomationHistory.vue' 

const routes = [
    { path: '/', component: Welcome },
    { path: '/home', component: Home },
    { path: '/share', component: Share },
    { path: '/instance', component: SelectInstance },
    { path: '/mobilizon/callback', component: Callback },
    { path: '/scrapEvent', component: EventScrapper },
    { path: '/scrapGroup', component: GroupScrapper },
    { path: '/createEvent', component: Event },
    { path: '/createGroup', component: Group },
    { path: '/registerFeed', component: RegisterFeed },
    { path: '/automations', component: Automations },
    { path: '/automation/:id', name: 'automationHistory', component: AutomationHistory },
    { path: '/done', component: Done },
    { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFound } 
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router