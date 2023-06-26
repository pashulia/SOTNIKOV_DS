<template>
    <div>
        <h2>Фото</h2>
        <ul>
            <li v-for="album in albums" :key="album.id">
                <h3>{{ album.title }}</h3>
                <p>Добавил: {{ album.user }}</p>
                <button @click="openAlbum(album.id)">Открыть альбом</button>
            </li>
        </ul>

        <div v-if="selectedAlbum">
            <h3>{{ selectedAlbum.title }}</h3>
            <ul>
                <li v-for="photo in photos" :key="photo.id">
                    <img :src="photo.thumbnailUrl" alt="Thumbnail">
                    <p>{{ photo.title }}</p>
                    <button @click="openPhoto(photo)">Открыть</button>
                </li>
            </ul>
        </div>

        <div v-if="selectedPhoto">
            <div>
                <button @click="closePhoto">Закрыть</button>
            </div>
            <img :src="selectedPhoto.url" alt="Full-size Photo">
        </div>
    </div>
</template>

<script>
import axios from 'axios';

export default {
    name: 'photos',
    data() {
        return {
            albums: [], // Здесь будут храниться полученные данные об альбомах
            photos: [], // Здесь будут храниться полученные данные о фото
            selectedAlbum: null, // Альбом, выбранный для отображения фото
            selectedPhoto: null // Фото, выбранное для отображения в полном размере
        };
    },
    mounted() {
        this.fetchAlbums(); // Вызываем метод для получения данных об альбомах при загрузке компонента
    },
    methods: {
        fetchAlbums() {
            axios.get('https://jsonplaceholder.typicode.com/albums')
            .then(response => {
                this.albums = response.data;
                console.log(response.data);
            })
            .catch(error => {
                console.error(error);
            });
        },
        fetchPhotos(albumId) {
            axios.get(`https://jsonplaceholder.typicode.com/photos?albumId=${albumId}`)
            .then(response => {
                this.photos = response.data;
            })
            .catch(error => {
                console.error(error);
            });
        },
        openAlbum(albumId) {
            this.selectedAlbum = this.albums.find(album => album.id === albumId);
            this.fetchPhotos(albumId);
        },
        openPhoto(photo) {
            this.selectedPhoto = photo;
        },
        closePhoto() {
            this.selectedPhoto = null;
        }
    }
};
</script>

<style>
/* Здесь можно добавить стили для компонента "Фото" */
</style>