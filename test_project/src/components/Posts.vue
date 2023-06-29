<template>
    <div>
        <h2>Посты</h2>
        <div class="filters">
            <label for="">Поиск по названию: </label>
            <input type="text" v-model="titleFilter" placeholder="Введите название">
            <label for="">Поиск по автору: </label>
            <select class="selectUser" v-model="selectedUsers" multiple>
                <option v-for="user in users" :value="user.name">{{ user.name }}</option>
            </select>
            <label>
                <input type="checkbox" v-model="favoritesFilter">
                Только избранные
            </label>
            <div>
                <button @click="sortPosts('id')">Сортировать по ID</button>
                <button @click="sortPosts('title')">Сортировать по названию</button>
                <button @click="sortPosts('user.name', 'asc')">Сортировать по имени пользователя</button>
                <button @click="sortPosts('favorite')">Сортировать по избранным</button>
            </div>
            
        </div>
        <div class="pagination">
            <label>Количество постов:</label>
            <select v-model="selectedCount" @change="updatePosts">
              <option v-for="option in options" :key="option.value" :value="option.value">{{ option.label }}</option>
            </select>
        </div>
        <ul>
            <li v-for="post in displayedPosts" :key="post.id" >
                <h3>{{ post.title }}</h3>
                <p>{{ post.user }}</p>
                <p>{{ post.body }}</p>
                <button @click="toggleComments(post.id)">Комментарии</button>
                <button @click="editPost(post)">Редактировать</button>
                <button @click="confirmDelete(post)">Удалить</button>
                <button @click="toggleFavorite(post)">В избранное</button>
                <input type="checkbox" :value="post.id" @change="selectPost(post.id)">
            </li>
        </ul>
        <div v-if="isAnyPostSelected">
            <button @click="deletePosts">Удалить</button>
            <button @click="confirmToggleFavorite">В избранное</button>
        </div>
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
import VueSimpleAlert from 'vue-simple-alert';

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
        pageSize: 10,
        selectedCount: 10,
        options: [
          { value: 10, label: '10' },
          { value: 20, label: '20' },
          { value: 50, label: '50' },
          { value: 100, label: '100' },
          { value: -1, label: 'ALL' },
        ],
        showComments: false,
        editingPost: null,
        showAddPostModal: false,
        newPost: {
          title: '',
          body: '',
          userId: null,
        },
        selectedPosts: [], // Массив выбранных постов
        favorites: [], // Массив избранных постов
      };
    },
    created() {
      this.fetchUsers();
      this.fetchPosts();    
      this.fetchComments();
    },
    methods: {
      fetchUsers() {
        axios
          .get('https://jsonplaceholder.typicode.com/users')
          .then((response) => {
            this.users = response.data.map((user) => ({...user}));
            console.log(response.data);
          })
          .catch((error) => {
            console.error(error);
          });
      },
      fetchPosts() {
        axios
          .get('https://jsonplaceholder.typicode.com/posts?')
          .then((response) => {
            this.posts = response.data.map((post) => ({
              ...post,
              user: this.users.find(item => item.id === post.userId).name,
              favorite: false,
            }));
            this.applyFilters(); // Применяем фильтры после загрузки постов
          })
          .catch((error) => {
            console.error(error);
          });
      },
      updatePosts() {
        if (this.selectedCount === -1) {
          this.pageSize = this.posts.length;
        } else {
          this.pageSize = this.selectedCount;
        }
        this.currentPage = 1;
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
            this.selectedUsers.includes(post.users.name.toLowerCase()),
          );
        }
        if (this.favoritesFilter) {
          filteredPosts = filteredPosts.filter((post) => post.favorite);
        }
        this.filteredPosts = filteredPosts;
        this.currentPage = 1;
      },
      sortPosts(field, order = 'asc') {
        this.posts.sort((a, b) => {
          const valueA = this.getFieldValue(a, field);
          const valueB = this.getFieldValue(b, field);

          if (valueA < valueB) {
            return order === 'asc' ? -1 : 1;
          }
          if (valueA > valueB) {
            return order === 'asc' ? 1 : -1;
          }
          return 0;
        });
      },
      getFieldValue(obj, field) {
        const fields = field.split('.');
        let value = obj;
      
        for (let i = 0; i < fields.length; i++) {
          value = value[fields[i]];
        }
      
        return value;
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
        // Переключаем статус избранного для текущего поста
        post.favorite = !post.favorite;

        // Обновляем соответствующий пост в массиве this.posts
        const index = this.posts.findIndex((p) => p.id === post.id);
        if (index !== -1) {
          this.posts[index] = post;
        }
      
        // Если пост является избранным, добавляем его в массив избранных постов
        if (post.favorite) {
          this.favorites.push(post.id);
        } else {
          // Если пост был удален из избранных, удаляем его из массива избранных постов
          const favoriteIndex = this.favorites.indexOf(post.id);
          if (favoriteIndex !== -1) {
            this.favorites.splice(favoriteIndex, 1);
          }
        }

        // Сохраняем изменения на сервере
        axios
          .put(`https://jsonplaceholder.typicode.com/posts/${post.id}`, post)
          .then((response) => {
            console.log('Статус избранного обновлен:', response.data);
          })
          .catch((error) => {
            console.error('Ошибка при обновлении статуса избранного:', error);
            // В случае ошибки можно восстановить предыдущий статус избранного
            post.favorite = !post.favorite;
          
            // Обновляем соответствующий пост в массиве this.posts
            if (index !== -1) {
              this.posts[index] = post;
            }
          });
      },
      deletePosts() {
        const confirmed = VueSimpleAlert.confirm('Вы уверены, что хотите удалить выбранные посты?');
        if (confirmed) {
          // Удаляем выбранные посты из this.posts
          this.posts = this.posts.filter((post) => !this.selectedPosts.includes(post.id));
        
          // Очищаем массив выбранных постов
          this.selectedPosts = [];
        
          // Обновляем массив избранных постов (удаляем удаленные посты из массива)
          this.favorites = this.favorites.filter((postId) =>
            this.posts.find((post) => post.id === postId)
          );
        
          // Выполняем сохранение изменений на сервере (удаление постов)
          axios
            .delete('https://jsonplaceholder.typicode.com/posts', {
              data: { ids: this.selectedPosts },
            })
            .then((response) => {
              console.log('Посты успешно удалены:', response.data);
            })
            .catch((error) => {
              console.error('Ошибка при удалении постов:', error);
            });
        }
      },
      selectPost(postId) {
        if (this.selectedPosts.includes(postId)) {
          // Удаляем пост из массива выбранных постов
          const index = this.selectedPosts.indexOf(postId);
          this.selectedPosts.splice(index, 1);
        } else {
          // Добавляем пост в массив выбранных постов
          this.selectedPosts.push(postId);
        }
      },
      confirmDeletePosts() {
        // Показываем окно подтверждения удаления выбранных постов
        const confirmed = VueSimpleAlert.confirm('Вы уверены, что хотите удалить выбранные посты?');
        if (confirmed) {
          // Вызываем метод для удаления выбранных постов
          this.deleteSelectedPosts();
        }
      },
      confirmToggleFavorite() {
        // Показываем окно подтверждения переключения статуса избранного для выбранных постов
        const confirmed = VueSimpleAlert.confirm('Вы уверены, что хотите переключить статус избранного для выбранных постов?');
        if (confirmed) {
          // Вызываем метод для переключения статуса избранного
          this.toggleFavoriteForSelectedPosts();
        }
      },
      deleteSelectedPosts() {
        // Удаляем выбранные посты
        const confirmed = VueSimpleAlert.confirm('Вы уверены, что хотите удалить выбранные посты?');
        if (confirmed) {
          // Отправляем запрос на удаление выбранных постов к серверу
          // и обрабатываем ответ
          axios.delete('https://jsonplaceholder.typicode.com/posts', { ids: this.selectedPosts })
            .then(response => {
              // Успешно удалены
              // Удаляем выбранные посты из this.posts
              this.posts = this.posts.filter(post => !this.selectedPosts.includes(post.id));
              // Очищаем массив выбранных постов
              this.selectedPosts = [];
              // Выводим сообщение об успешном удалении
              VueSimpleAlert.alert('Посты успешно удалены');
            })
            .catch(error => {
              // Возникла ошибка при удалении
              console.error('Ошибка при удалении постов', error);
              // Выводим сообщение об ошибке
              VueSimpleAlert.alert('Произошла ошибка при удалении постов');
            });
        }
      },
      toggleFavoriteForSelectedPosts() {
        // Переключаем статус избранного для выбранных постов
        const confirmed = VueSimpleAlert.confirm('Вы уверены, что хотите переключить статус избранного для выбранных постов?');
        if (confirmed) {
          // Отправляем запрос на переключение статуса избранного для выбранных постов к серверу
          // и обрабатываем ответ
          axios.post('/api/posts/toggleFavorite', { postIds: this.selectedPosts })
            .then(response => {
              // Успешно переключены
              // Обновляем статус избранного для выбранных постов в this.posts
              this.posts.forEach(post => {
                if (this.selectedPosts.includes(post.id)) {
                  post.favorite = !post.favorite; // Переключаем статус
                }
              });
              // Очищаем массив выбранных постов
              this.selectedPosts = [];
              // Выводим сообщение об успешном переключении
              VueSimpleAlert.alert('Статус избранного успешно переключен');
            })
            .catch(error => {
              // Возникла ошибка при переключении статуса
              console.error('Ошибка при переключении статуса избранного', error);
              // Выводим сообщение об ошибке
              VueSimpleAlert.alert('Произошла ошибка при переключении статуса избранного');
            });
        }
      },
      confirmDelete(post) {
        // Show confirmation dialog
        const confirmed = VueSimpleAlert.confirm('Вы уверены, что хотите удалить этот пост?');
        if (confirmed) {
          axios
            .delete(`https://jsonplaceholder.typicode.com/posts/${post.id}`)
            .then(() => {
              // Успешно удалено с сервера, теперь удаляем из списка постов
              const index = this.posts.findIndex((p) => p.id === post.id);
              if (index !== -1) {
                this.posts.splice(index, 1);
              }
            })
            .catch((error) => {
              console.error(error);
              // Обработка ошибки удаления
            });
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
      totalPages() { 
        return Math.ceil(this.posts.length / this.pageSize);
      },
      displayedPosts() {
        const startIndex = (this.currentPage - 1) * this.pageSize;
        const endIndex = startIndex + this.pageSize;     
        return this.filteredPosts.slice(startIndex, endIndex);
      },
      isAnyPostSelected() {
        return this.selectedPosts.length > 0;
      },
      isAnyFavoritePostSelected() {
        return this.selectedPosts.some((postId) => this.favorites.includes(postId));
      },
      filteredPosts() {
        return this.posts.filter(post => {
          const matchesTitle = post.title.toLowerCase().includes(this.titleFilter.toLowerCase());
          const matchesUsers = this.selectedUsers.length === 0 || this.selectedUsers.includes(post.user.name);
          const matchesFavorites = !this.favoritesFilter || post.favorite;
          return matchesTitle && matchesUsers && matchesFavorites;
        });
      }
    },
    watch: {
      // Сохранение значения postsPerPage в локальное хранилище при его изменении
      selectedCount(newVal) {
        localStorage.setItem('selectedCount', newVal);
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

  .selectUser {
    width: 200px;
  }
  </style>
  