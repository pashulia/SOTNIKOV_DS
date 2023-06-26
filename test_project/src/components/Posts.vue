<template>
    <div>
      <h2>Посты</h2>
      <div class="filters">
        <input type="text" v-model="titleFilter" placeholder="Фильтр по названию">
        <select v-model="selectedUsers" multiple>
          <option v-for="user in users" :value="user.id">{{ user.name }}</option>
        </select>
        <label>
          <input type="checkbox" v-model="favoritesFilter">
          Только избранные
        </label>
        <button @click="sortPosts('id')">Сортировать по ID</button>
        <button @click="sortPosts('title')">Сортировать по названию</button>
        <button @click="sortPosts('userId')">Сортировать по имени пользователя</button>
        <button @click="sortPosts('favorite')">Сортировать по избранным</button>
      </div>
      <div class="pagination">
        <label>Количество постов:</label>
        <select v-model="postsPerPage">
          <option v-for="option in perPageOptions" :value="option">{{ option }}</option>
        </select>
      </div>
      <ul>
        <li v-for="post in paginatedPosts" :key="post.id" >
          <h3>{{ post.title }}</h3>
          <p>{{ users[post.id] }}</p>
          <p>{{ post.body }}</p>
          <button @click="toggleComments(post.id)">Комментарии</button>
          <button @click="editPost(post)">Редактировать</button>
          <button @click="confirmDelete(post)">Удалить</button>
          <button @click="toggleFavorite(post)">В избранное</button>
          <input type="checkbox" v-model="selectedPosts" :value="post.id">
        </li>
      </ul>
      <div v-if="showComments">
        <h4>Комментарии</h4>
        <ul>
          <li v-for="comment in comments" :key="comment.id">
            <p><strong>Имя:</strong> {{ comment.name }}1</p>
            <p><strong>E-mail:</strong> {{ comment.email }}22</p>
            <p><strong>Текст:</strong> {{ comment.body }}333</p>
          </li>
        </ul>
      </div>
      <div v-if="editingPost">
        <h4>Редактирование поста</h4>
        <label>
          Название:
          <input type="text" v-model="editingPost.title">
        </label>
        <label>
          Основной текст:
          <textarea v-model="editingPost.body"></textarea>
        </label>
        <label>
          Пользователь:
          <select v-model="editingPost.userId">
            <option v-for="user in users" :value="user.id">{{ user.name }}</option>
          </select>
        </label>
        <button @click="savePostChanges(editingPost)">Сохранить</button>
        <button @click="cancelEdit()">Отмена</button>
      </div>
      <div>
        <button @click="showAddPostModal = true">Добавить новый пост</button>
        <div v-if="showAddPostModal">
          <h4>Добавление нового поста</h4>
          <label>
            Название:
            <input type="text" v-model="newPost.title">
          </label>
          <label>
            Основной текст:
            <textarea v-model="newPost.body"></textarea>
          </label>
          <label>
            Пользователь:
            <select v-model="newPost.userId">
              <option v-for="user in users" :value="user.id">{{ user.name }}</option>
            </select>
          </label>
          <button @click="addPost(newPost)">Добавить</button>
          <button @click="cancelAdd()">Отмена</button>
        </div>
      </div>
      <div class="pagination">
        <button @click="prevPage" :disabled="currentPage === 1">Предыдущая</button>
        <span>{{ currentPage }} из {{ totalPages }}</span>
        <button @click="nextPage" :disabled="currentPage === totalPages">Следующая</button>
      </div>
    </div>
  </template>
  
  <script>
import axios from 'axios';

export default {
    name: 'posts',
    data() {
      return {
        posts: [],
        users: [],
        comments: [],
        commentsPostId: null,
        titleFilter: '',
        selectedUsers: [],
        favoritesFilter: false,
        filteredPosts: [],
        currentPage: 1,
        postsPerPage: '10',
        perPageOptions: ['10', '20', '50', '100', 'все'],
        showComments: false,
        editingPost: null,
        showAddPostModal: false,
        newPost: {
          title: '',
          body: '',
          userId: null,
        },
        selectedPosts: [],
      };
    },
    created() {
      this.fetchPosts();
      this.fetchUsers();
      this.fetchComments();
  
      // Загрузка значения postsPerPage из локального хранилища
      const savedPostsPerPage = localStorage.getItem('postsPerPage');
      if (savedPostsPerPage) {
        this.postsPerPage = savedPostsPerPage;
      }
    },
    methods: {
      fetchPosts() {
        axios
          .get('https://jsonplaceholder.typicode.com/posts')
          .then((response) => {
            this.posts = response.data.map((post) => ({
              ...post,
              favorite: false,
            }));
            this.applyFilters(); // Применяем фильтры после загрузки постов
          })
          .catch((error) => {
            console.error(error);
          });
      },
      fetchUsers() {
        axios
          .get('https://jsonplaceholder.typicode.com/users')
          .then((response) => {
            this.users = response.data.map((user) => user.name);
          })
          .catch((error) => {
            console.error(error);
          });
      },
      fetchComments() {
        axios
          .get('https://jsonplaceholder.typicode.com/comments')
          .then((response) => {
            this.comments = response.data;
            console.log(response.data);
          })
          .catch((error) => {
            console.error(error);
          });
      },
      applyFilters() {
        let filteredPosts = this.posts;

  if (this.titleFilter) {
    filteredPosts = filteredPosts.filter((post) =>
      post.title.toLowerCase().includes(this.titleFilter.toLowerCase())
    );
  }

  if (this.selectedUsers.length > 0) {
    filteredPosts = filteredPosts.filter((post) =>
      this.selectedUsers.includes(post.userId)
    );
  }

  if (this.favoritesFilter) {
    filteredPosts = filteredPosts.filter((post) => post.favorite);
  }

  this.filteredPosts = filteredPosts;

  // Обновляем текущую страницу при изменении фильтров
  this.currentPage = 1;
      },
      sortPosts(field) {
        this.filteredPosts.sort((a, b) => {
          if (a[field] < b[field]) {
            return -1;
          } else if (a[field] > b[field]) {
            return 1;
          } else {
            return 0;
          }
        });
      },
      toggleComments(post) {
        if (this.showComments && post === this.commentsPostId) {
          this.showComments = false;
          this.comments = [];
          this.commentsPostId = null;
        } else {
          this.showComments = true;
          this.commentsPostId = post;
          axios
            .get(`https://jsonplaceholder.typicode.com/posts/${post}/comments`)
            .then((response) => {
              this.comments = response.data;
              console.log(response.data);
            })
            .catch((error) => {
              console.error(error);
            });
        }
      },
      editPost(post) {
        this.editingPost = { ...post };
      },
      savePostChanges(post) {
        // Сохранение изменений в посте
        // Обновление соответствующего поста в this.posts
        this.cancelEdit();
        // this.editingPost = null;
      },
      cancelEdit() {
        this.editingPost = null;
      },
      toggleFavorite(post) {
        // Переключение статуса избранного для выбранного поста
        // Обновление соответствующего поста в this.posts
      },
      confirmDelete(post) {
        // Show confirmation dialog
        const confirmed = confirm('Вы уверены, что хотите удалить этот пост?');
        if (confirmed) {
          this.deletePost(post);
        }
      },
      addPost(post) {
        // Send request to create new post
        // Add the new post to the UI
        this.posts.push({ ...this.newPost, favorite: false });
        this.cancelAdd();
      },
      cancelAdd() {
        this.showAddPostModal = false;
        this.newPost = {
          title: '',
          body: '',
          userId: null,
        };
      },
      prevPage() {
        if (this.currentPage > 1) {
          this.currentPage--;
        }
      },
      nextPage() {
        if (this.currentPage < this.totalPages) {
          this.currentPage++;
        }
      },
    },
    computed: {
      paginatedPosts() {
        const startIndex = (this.currentPage - 1) * +this.postsPerPage;
        const endIndex = startIndex + +this.postsPerPage;
        if (this.postsPerPage === 'все') {
          return this.posts;
        } else {
          return this.filteredPosts.slice(startIndex, endIndex);
        }
      },
      totalPages() {
        if (this.postsPerPage === 'все') {
          return 1;
        } else {
          return Math.ceil(this.filteredPosts.length / +this.postsPerPage);
        }
      },
    },
    watch: {
      // Сохранение значения postsPerPage в локальное хранилище при его изменении
      postsPerPage(newVal) {
        localStorage.setItem('postsPerPage', newVal);
      },
    },
  };
  
</script>
  
  
  <style>
  .filters {
    margin-bottom: 1rem;
  }
  
  .pagination {
    margin-top: 1rem;
  }
  
  .pagination button {
    margin-right: 0.5rem;
  }
  </style>
  