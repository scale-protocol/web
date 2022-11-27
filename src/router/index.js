import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import Trading from '../views/Trading.vue'
import Header from '@/components/header'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    component: Header,
    children: [
      {
        path: '',
        name: 'Home',
        component: Home
      },
      {
        path: '/trading',
        name: 'trading',
        component: Trading
      }
    ]
  }
  // {
  //   path: '/about',
  //   name: 'About',
  //   // route level code-splitting
  //   // this generates a separate chunk (about.[hash].js) for this route
  //   // which is lazy-loaded when the route is visited.
  //   component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
  // }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
