<template>
    <div class="modal">
        <div class="modal-header">
            <div class="modal-content">
                <slot/>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">

import axios from 'axios'
import router from '../router'
import { ref } from 'vue'

</script>

<style scoped>

.modal{
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: rgba(0, 0, 0, 0.4);
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .modal-header {
    position: relative;
    padding: 30px 30px 25px 30px;
    width: 630px;
    z-index: 1000;
    background: #9b9b9b;
    display: flex;
    flex-direction: column;
    border-radius: 8px;
  }

</style>