<template>
    <div>
      <div class="filters">
        <input type="text" v-model="titleFilter" placeholder="Фильтр по названию">
        <select v-model="pageSize">
          <option v-for="size in pageSizes" :value="size">{{ size }}</option>
        </select>
        <button @click="sortAlbums('id')">Сортировать по ID</button>
        <button @click="sortAlbums('title')">Сортировать по названию</button>
        <button @click="sortAlbums('user.name')">Сортировать по имени пользователя</button>
        <button @click="sortAlbums('favorite')">Сортировать по избранным</button>
      </div>
      <div>
        <div v-for="album in displayedAlbums" :key="album.id" class="album">
          <div>
            <button @click="$router.push(`/photos/album/${album.id}`)">{{ album.title }}</button>
            <p>Добавил: {{ album.user }}</p>
          </div>
          <div class="album-actions">
            <button @click="editAlbum(album)">Редактировать</button>
            <button @click="deleteAlbum(album)">Удалить</button>
            <button @click="toggleFavorite(album)">
              {{ album.favorite ? 'Убрать из избранных' : 'В избранное' }}
            </button>
            <input type="checkbox" v-model="selectedAlbums" :value="album.id">
          </div>
        </div>
      </div>
      <div class="pagination">
        <button @click="goToPage(currentPage - 1)" :disabled="currentPage === 1">Предыдущая</button>
        <span>{{ currentPage }} / {{ totalPages }}</span>
        <button @click="goToPage(currentPage + 1)" :disabled="currentPage === totalPages">Следующая</button>
      </div>
      <modal v-if="modalVisible" @close="closeModal">
        <img :src="selectedPhoto.url" :alt="selectedPhoto.title">
      </modal>
    </div>
  </template>
  
  <script>
import axios from 'axios';

import Modal
  from '@/components/Modal.vue'; // Импортируйте компонент модального окна

export default {
    components: {
    Modal,
  },
    name: 'photos',
    data() {
      return {
        albums: [], // Ваш массив альбомов
        users: [],
        displayedAlbums: [], // Отображаемые альбомы на текущей странице
        pageSize: 10, // Количество альбомов на странице
        currentPage: 1, // Текущая страница
        selectedAlbums: [], // Выбранные альбомы
        titleFilter: '', // Фильтр по названию альбома
        sortKey: '', // Ключ для сортировки
        sortDirection: 'asc', // Направление сортировки (asc - по возрастанию, desc - по убыванию)
        pageSizes: [10, 20, 50, 100, 'все'], // Варианты количества альбомов на странице
        modalVisible: false, // Флаг видимости модального окна
        selectedPhoto: null, // Выбранное фото для отображения в модальном окне
      };
    },
    computed: {
      totalPages() {
        if (this.pageSize === 'все') {
          return 1;
        }
        return Math.ceil(this.displayedAlbums.length / this.pageSize);
      },
      displayedPosts() {
        const startIndex = (this.currentPage - 1) * this.pageSize;
        const endIndex = startIndex + this.pageSize;     
        return this.filteredPosts.slice(startIndex, endIndex);
      },
      filteredAlbums() {
        return this.albums.filter(album => {
          const matchesTitle = album.title.toLowerCase().includes(this.titleFilter.toLowerCase());
          const matchesUsers = this.selectedUsers.length === 0 || this.selectedUsers.includes(album.user.name);
          const matchesFavorites = !this.favoritesFilter || album.favorite;
          return matchesTitle && matchesUsers && matchesFavorites;
        });
      }
    },
    mounted() {
      // Загрузка списка альбомов с API при инициализации компонента
      this.loadAlbums();
    },
    created() {
      this.loadAlbums();
      this.fetchUsers();
    //   this.fetchComments();
    },
    methods: {
      fetchUsers() {
        axios
          .get('https://jsonplaceholder.typicode.com/users')
          .then((response) => {
            this.users = response.data.map((user) => ({...user}));
            console.log(this.users);
          })
          .catch((error) => {
            console.error(error);
          });
      },
      loadAlbums() {
        axios.get('https://jsonplaceholder.typicode.com/albums')
          .then(response => {
            this.albums = response.data.map((album) => ({
                ...album,
                user: this.users.find(item => item.id === album.userId).name,
                
            }));
            console.log(this.albums);
            this.applyFilters(); // Применить фильтры после загрузки альбомов
          })
          .catch(error => {
            console.error('Ошибка при загрузке альбомов:', error);
          });
      },
      sortAlbums(key) {
        if (this.sortKey === key) {
          this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
          this.sortKey = key;
          this.sortDirection = 'asc';
        }
        this.applyFilters();
      },
      goToPage(page) {
        if (page >= 1 && page <= this.totalPages) {
          this.currentPage = page;
        }
      },
      editAlbum(album) {
        // Логика редактирования альбома
      },
      deleteAlbum(album) {
        // Логика удаления альбома
      },
      toggleFavorite(album) {
        // Логика добавления/удаления альбома в избранное
      },
      closeModal() {
        this.modalVisible = false;
        this.selectedPhoto = null;
      },
      openModal(photo) {
        this.modalVisible = true;
        this.selectedPhoto = photo;
      },
      applyFilters() {
        let filteredAlbums = this.albums;
  
        // Фильтрация по названию альбома
        filteredAlbums = filteredAlbums.filter(album =>
          album.title.toLowerCase().includes(this.titleFilter.toLowerCase())
        );
  
        // Сортировка
        if (this.sortKey) {
          filteredAlbums.sort((a, b) => {
            const valA = this.getPropertyValue(a, this.sortKey);
            const valB = this.getPropertyValue(b, this.sortKey);
  
            if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
            if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
            return 0;
          });
        }
  
        // Ограничение количества альбомов на странице
        if (this.pageSize !== 'все') {
          const startIndex = (this.currentPage - 1) * this.pageSize;
          const endIndex = startIndex + this.pageSize;
          filteredAlbums = filteredAlbums.slice(startIndex, endIndex);
        }
  
        this.displayedAlbums = filteredAlbums;
      },
      getPropertyValue(obj, path) {
        // Получение значения свойства объекта по пути
        const keys = path.split('.');
        let value = obj;
        for (const key of keys) {
          value = value[key];
          if (value === undefined) break;
        }
        return value;
      },
    },
  };
  
</script>
  