<template>
    <div>
        <h2>Посты</h2>
        <ul>
            <li v-for="post in posts" :key="post.id">
                <h3>{{ post.title }}</h3>
                <p>{{ post.body }}</p>
            </li>
        </ul>
    </div>
</template>

<script>
import axios from 'axios';

export default {
    name: 'posts',
    data() {
        return {
            posts: [] // Здесь будут храниться полученные данные о постах
        };
    },
    mounted() {
        this.fetchPosts(); // Вызываем метод для получения данных о постах при загрузке компонента
    },
    methods: {
        fetchPosts() {
            axios.get('https://jsonplaceholder.typicode.com/posts')
            .then(response => {
                this.posts = response.data; // Сохраняем полученные данные в переменную posts
            })
            .catch(error => {
            console.error(error);
            });
        }
    }
};
</script>

<style>
  /* Здесь можно добавить стили для компонента "Посты" */
</style>