<template>
    <div>
        <h2>фото</h2>
        <ul>
            <li v-for="photo in photosAlbumId" :key="photo.id">
                <img 
                    :src=photo.thumbnailUrl
                    alt="Photo"
                    @click="openModal(photo)"
                />
                <p>{{ photo.title }}</p>
                <modal class="modal" v-if="modalVisible" @close="closeModal" :photo="photo">
                <img :src="selectedPhoto.url" :alt="selectedPhoto.title" @click="closeModal" />
                <span class="close" @click="closeModal">&times;</span>
            </modal>
            </li>
            
        </ul>
        
    </div>
</template>

<script>
import axios from 'axios';

import Modal
  from '@/components/Modal.vue'; // Импортируйте компонент модального окна

export default {
    name: 'album',
    components: {
        Modal,
    },
    data() {
        return {
            photos: [],
            photosAlbumId: [],
            modalVisible: false, // Флаг видимости модального окна
            selectedPhoto: null, // Выбранное фото для отображения в модальном окне
        };
    },
    mounted() {
      // Загрузка списка альбомов с API при инициализации компонента
        this.loadPhotos();
    },
    created() {
        this.loadPhotos();
    },
    methods: {
        loadPhotos() {
            axios
                .get('https://jsonplaceholder.typicode.com/photos')
                .then(response => {
                    this.photos = response.data;
                    console.log(this.photos);
                    this.photosAlbumId = this.photos.filter(photo => photo.albumId == 1);
                    console.log(this.photosAlbumId);
                })
                .catch(error => {
                    console.error('Ошибка при загрузке фото:', error);
                });
        },
        closeModal() {
            this.modalVisible = false;
            this.selectedPhoto = null;
        },
        openModal(photo) {
            this.modalVisible = true;
            this.selectedPhoto = photo;
        },
    }
}
</script>

<style>
.modal {
  display: block;
  position: fixed;
  z-index: 9999;
  top: 5%;
  left: 10%;
  width: 80%;
  height: 80%;
  overflow: auto;
  background-color: rgba(0, 0, 0, 0.7);
  text-align: center;
  padding-top: 50px;
}

.modal img {
  max-width: 80%;
  max-height: 80%;
  margin: auto;
}

.close {
  color: white;
  font-size: 30px;
  font-weight: bold;
  position: absolute;
  top: 10px;
  right: 25px;
  cursor: pointer;
}
</style>






