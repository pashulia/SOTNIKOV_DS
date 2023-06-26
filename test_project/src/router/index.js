import {
  createRouter,
  createWebHistory,
} from 'vue-router';

import Main from '@/pages/Main';
import PhotosPage from '@/pages/PhotosPage';

const routes = [
  {
    path: '/',
    name: 'main',
    component: Main
  },
  {
    path: '/photos',
    name: 'photos',
    component: PhotosPage
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
