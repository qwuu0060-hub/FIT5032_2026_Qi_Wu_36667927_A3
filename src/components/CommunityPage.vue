<template>
  <div class="container my-5">
    <div class="row">
      <div class="col-md-5 mb-4">
        <div class="card shadow-sm border-0">
          <div class="card-body p-4">
            <h3 class="mb-4">Share some warmth</h3>
            
            <!-- Client-side Validation Alerts -->
            <div v-if="errorMsg" class="alert alert-danger" role="alert">
              {{ errorMsg }}
            </div>
            
            <form @submit.prevent="postMessage">
              <div class="mb-3">
                <label class="form-label fw-bold">Message (Max 100 characters)</label>
                <!-- Added trim modifier and input constraints -->
                <textarea 
                  class="form-control" 
                  rows="3" 
                  v-model.trim="messageText" 
                  placeholder="Write something encouraging..."
                  maxlength="100"
                ></textarea>
                <div class="form-text text-end small">
                  {{ messageText.length }}/100 characters
                </div>
              </div>
              <button type="submit" class="btn btn-primary w-100">Post Anonymously</button>
            </form>
          </div>
        </div>
      </div>
      <div class="col-md-7">
        <div class="card shadow-sm border-0">
          <div class="card-body p-4">
            <h3 class="mb-4">Peer Support Board</h3>
            <div v-if="posts.length === 0" class="text-muted">No messages shared yet. Be the first!</div>
            <div v-else class="overflow-auto" style="max-height: 450px;">
              <div v-for="(post, idx) in posts" :key="idx" class="border-bottom py-3">
                <!-- XSS Safe Rendering via secure text interpolation -->
                <p class="mb-2 text-dark fs-5">"{{ post.text }}"</p>
                <div class="d-flex justify-content-between align-items-center">
                  <small class="text-muted">Posted on {{ post.date }}</small>
                  <button @click="likePost(idx)" class="btn btn-outline-danger btn-sm">
                    ❤️ {{ post.likes }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const messageText = ref('');
const errorMsg = ref('');
const posts = ref([]);

// C.4 Explicit Anti-XSS Sanitizer Function
// Converts dangerous characters into safe HTML entities before saving to LocalStorage
const sanitizeInput = (rawText) => {
  if (!rawText) return '';
  return rawText
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

const loadPosts = () => {
  posts.value = JSON.parse(localStorage.getItem('community_posts') || '[]');
};

onMounted(() => {
  loadPosts();
});

const postMessage = () => {
  errorMsg.value = '';

  // C.4 Client-side Validation: Empty & Whitespace Check
  if (!messageText.value) {
    errorMsg.value = 'Security Alert: Message content cannot be empty or just spaces.';
    return;
  }

  // C.4 Client-side Validation: Length Bound Check
  if (messageText.value.length > 100) {
    errorMsg.value = 'Security Alert: Input length exceeds the maximum limit of 100 characters.';
    return;
  }

  // C.4 XSS Protection: Sanitize user input before it touches persistent storage
  const cleanText = sanitizeInput(messageText.value);

  const newPost = {
    text: cleanText,
    likes: 0,
    date: new Date().toLocaleDateString('en-US')
  };

  const list = JSON.parse(localStorage.getItem('community_posts') || '[]');
  list.unshift(newPost);
  localStorage.setItem('community_posts', JSON.stringify(list));
  
  messageText.value = '';
  loadPosts();
};

const likePost = (index) => {
  const list = JSON.parse(localStorage.getItem('community_posts') || '[]');
  if (list[index]) {
    list[index].likes += 1;
    localStorage.setItem('community_posts', JSON.stringify(list));
    loadPosts();
  }
};
</script>