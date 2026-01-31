import { createRouter, createWebHistory } from 'vue-router'

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

export default router = createRouter({
    history: createWebHistory(),
    routes
})