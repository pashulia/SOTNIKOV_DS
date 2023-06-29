<template>
  <div>
    <!-- Кнопка для открытия модального окна -->
    <!-- <button @click="openModal">Открыть модальное окно</button> -->

    <!-- Модальное окно -->
    <div v-if="showModal" class="modal">
      <div class="modal-content">
        <!-- Кнопка для закрытия модального окна -->
        <span class="close" @click="closeModal">&times;</span>

        <!-- Содержимое модального окна -->
        <img :src="photo.url" :alt="photo.title">
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "modal",
  data() {
    return {
      showModal: true, // Флаг для отображения/скрытия модального окна
    };
  },
  props: {
    photo: {
      type: Object,
      required: true,
    },
  },
  methods: {
    openModal() {
      this.showModal = true; // Открыть модальное окно
    },
    closeModal() {
      this.showModal = false; // Закрыть модальное окно
    },
  },
};
</script>

<style>
/* Стили для модального окна */
.modal {
  display: block; /* Отобразить модальное окно */
  position: fixed;
  z-index: 1;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.4); /* Полупрозрачный фон */
}

.modal-content {
  background-color: #fefefe;
  margin: 15% auto;
  padding: 20px;
  border: 1px solid #888;
  width: 80%;
}

.close {
  color: #aaa;
  float: right;
  font-size: 28px;
  font-weight: bold;
  cursor: pointer;
}

.close:hover,
.close:focus {
  color: black;
  text-decoration: none;
  cursor: pointer;
}
</style>
