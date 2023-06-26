<template>
    <ul>
        <li>
            <a href='/'>Посты</a>
        </li>
        <li>
            <a href='/fots'>Фото</a>
        </li>
        <li>
            <a href='/tasks'>Задачи</a>
        </li>
    </ul>
    
    
    
</template>

<script>
export default {
    name: "navbar",
    data() {
        return{
            blockNumberOrHash: ""
        }
    }
}
</script>

<style scoped>
    ul {
        border: 1px solid black;
        padding: 10px;
        border-radius: 5px;
        list-style-type: none;
    }
    li {
        margin-bottom: 10px;
        
    }
    input {
        background-color: rgb(223, 225, 226);
    }
    button {
        margin-left: 5px;
    }
</style>
