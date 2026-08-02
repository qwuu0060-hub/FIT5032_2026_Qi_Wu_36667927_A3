<template>
  <div class="container my-5">
    <div class="row">
      <!-- Left Column: Submit a Review -->
      <div class="col-md-5 mb-4">
        <div class="card shadow-sm border-0">
          <div class="card-body p-4">
            <h3 class="mb-4">Write a Review</h3>
            
            <div v-if="errorMsg" class="alert alert-danger" role="alert">{{ errorMsg }}</div>
            <div v-if="successMsg" class="alert alert-success" role="alert">{{ successMsg }}</div>

            <form @submit.prevent="submitReview">
              <div class="mb-3">
                <label class="form-label">Select Counselor</label>
                <select class="form-select" v-model="counselor">
                  <option value="">Choose a professional...</option>
                  <option value="Dr. Li">Dr. Li</option>
                  <option value="Sarah Zhang">Sarah Zhang</option>
                  <option value="David Wang">David Wang</option>
                </select>
              </div>

              <div class="mb-3">
                <label class="form-label">Rating (1 to 5 Stars)</label>
                <select class="form-select" v-model.number="rating">
                  <option value="5">⭐⭐⭐⭐⭐ (5 - Excellent)</option>
                  <option value="4">⭐⭐⭐⭐ (4 - Very Good)</option>
                  <option value="3">⭐⭐⭐ (3 - Average)</option>
                  <option value="2">⭐⭐ (2 - Poor)</option>
                  <option value="1">⭐ (1 - Very Dissatisfied)</option>
                </select>
              </div>

              <div class="mb-3">
                <label class="form-label">Feedback Comments</label>
                <textarea class="form-control" rows="3" v-model.trim="comments" placeholder="Share your experience anonymously..."></textarea>
              </div>

              <button type="submit" class="btn btn-primary w-100">Submit Feedback</button>
            </form>
          </div>
        </div>
      </div>

      <!-- Right Column: Aggregated Dashboard & Logs -->
      <div class="col-md-7">
        <div class="card shadow-sm border-0 mb-4">
          <div class="card-body p-4">
            <h3 class="mb-4">Aggregated Ratings Overview</h3>
            
            <!-- Dynamic Calculated Summary Cards -->
            <div class="row text-center">
              <div v-for="(stats, name) in aggregatedStats" :key="name" class="col-4 border-end last-border-clean">
                <h5 class="text-secondary mb-1">{{ name }}</h5>
                <h2 class="text-primary fw-bold mb-0">{{ stats.average }}</h2>
                <small class="text-muted">({{ stats.count }} reviews)</small>
              </div>
            </div>
          </div>
        </div>

        <!-- Detailed Feedback Stream -->
        <div class="card shadow-sm border-0">
          <div class="card-body p-4">
            <h4 class="mb-3">Recent Feedback Logs</h4>
            <div v-if="reviews.length === 0" class="text-muted small">No reviews submitted yet.</div>
            <div v-else class="overflow-auto" style="max-height: 350px;">
              <div v-for="(r, idx) in reviews" :key="idx" class="border-bottom py-3">
                <div class="d-flex justify-content-between align-items-center mb-1">
                  <strong class="text-dark">{{ r.counselor }}</strong>
                  <span class="text-warning">
                    {{ '⭐'.repeat(r.rating) }}
                  </span>
                </div>
                <p class="mb-1 text-secondary small">"{{ r.comments }}"</p>
                <small class="text-muted d-block text-end fst-italic">Reviewed by: {{ r.user }} on {{ r.date }}</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

const props = defineProps({
  currentUser: Object
});

const counselor = ref('');
const rating = ref(5);
const comments = ref('');
const errorMsg = ref('');
const successMsg = ref('');
const reviews = ref([]);

// BR(C.4) Dynamic XSS Protection Filter
const sanitizeInput = (text) => {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

const loadReviews = () => {
  reviews.value = JSON.parse(localStorage.getItem('platform_reviews') || '[]');
};

onMounted(() => {
  loadReviews();
});

// BR(C.3) Core Metric Engine: Compute Dynamic Aggregated Rating Scores
const aggregatedStats = computed(() => {
  const targets = {
    'Dr. Li': { sum: 0, count: 0 },
    'Sarah Zhang': { sum: 0, count: 0 },
    'David Wang': { sum: 0, count: 0 }
  };

  reviews.value.forEach(r => {
    if (targets[r.counselor]) {
      targets[r.counselor].sum += r.rating;
      targets[r.counselor].count += 1;
    }
  });

  const output = {};
  Object.keys(targets).forEach(name => {
    const item = targets[name];
    output[name] = {
      count: item.count,
      average: item.count > 0 ? (item.sum / item.count).toFixed(1) : '0.0'
    };
  });

  return output;
});

const submitReview = () => {
  errorMsg.value = '';
  successMsg.value = '';

  // BR(B.1) Input Validation Type 1: Presence Verification
  if (!counselor.value || !comments.value) {
    errorMsg.value = 'Security Alert: Please complete all operational fields.';
    return;
  }

  // BR(B.1) Input Validation Type 2: Maximum Character Limit
  if (comments.value.length > 150) {
    errorMsg.value = 'Security Alert: Review length cannot exceed 150 characters.';
    return;
  }

  // BR(C.4) Anti-XSS encoding prior to active persistence storage
  const cleanComments = sanitizeInput(comments.value);

  const newReview = {
    user: props.currentUser ? props.currentUser.email : 'Anonymous User',
    counselor: counselor.value,
    rating: parseInt(rating.value),
    comments: cleanComments,
    date: new Date().toLocaleDateString('en-US')
  };

  const list = JSON.parse(localStorage.getItem('platform_reviews') || '[]');
  list.unshift(newReview);
  localStorage.setItem('platform_reviews', JSON.stringify(list));

  successMsg.value = 'Thank you! Your verified score review has been aggregated.';
  counselor.value = '';
  rating.value = 5;
  comments.value = '';

  loadReviews();
};
</script>

<style scoped>
.last-border-clean:last-child {
  border-right: none !important;
}
</style>