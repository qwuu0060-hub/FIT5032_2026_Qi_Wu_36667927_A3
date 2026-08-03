<template>
  <div class="container my-5">
    <div class="row">
      <div class="col-md-5 mb-4">
        <div class="card shadow-sm border-0">
          <div class="card-body p-4">
            <h2 class="mb-4 fs-3">Write a Review</h2>
            
            <div v-if="errorMsg" class="alert alert-danger" role="alert" aria-live="assertive">{{ errorMsg }}</div>
            <div v-if="successMsg" class="alert alert-success" role="alert" aria-live="polite">{{ successMsg }}</div>

            <form @submit.prevent="submitReview">
              <div class="mb-3">
                <label for="counselorSelect" class="form-label">Select Counselor</label>
                <select id="counselorSelect" class="form-select" v-model="counselor" required aria-required="true">
                  <option value="">Choose a professional...</option>
                  <option value="Dr. Li">Dr. Li</option>
                  <option value="Sarah Zhang">Sarah Zhang</option>
                  <option value="David Wang">David Wang</option>
                </select>
              </div>

              <div class="mb-3">
                <label for="ratingSelect" class="form-label">Rating (1 to 5 Stars)</label>
                <select id="ratingSelect" class="form-select" v-model.number="rating" required aria-required="true">
                  <option value="5">5 - Excellent</option>
                  <option value="4">4 - Very Good</option>
                  <option value="3">3 - Average</option>
                  <option value="2">2 - Poor</option>
                  <option value="1">1 - Very Dissatisfied</option>
                </select>
              </div>

              <div class="mb-3">
                <label for="commentsInput" class="form-label">Feedback Comments</label>
                <textarea id="commentsInput" class="form-control" rows="3" v-model.trim="comments" placeholder="Share your experience anonymously..." required aria-required="true"></textarea>
              </div>

              <button type="submit" class="btn btn-primary w-100" aria-label="Submit your counselor review">Submit Feedback</button>
            </form>
          </div>
        </div>
      </div>

      <div class="col-md-7">
        <div class="card shadow-sm border-0 mb-4">
          <div class="card-body p-4">
            <h2 class="mb-4 fs-3">Aggregated Ratings Overview</h2>
            
            <div class="row text-center">
              <div v-for="(stats, name) in aggregatedStats" :key="name" class="col-4 border-end last-border-clean">
                <h3 class="text-secondary mb-1 fs-5">{{ name }}</h3>
                <p class="text-primary fw-bold mb-0 display-6">{{ stats.average }}</p>
                <small class="text-muted">({{ stats.count }} reviews)</small>
              </div>
            </div>
          </div>
        </div>

        <div class="card shadow-sm border-0">
          <div class="card-body p-4">
            <!-- Table Header with PDF / CSV / JSON Export Toolbar -->
            <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
              <h3 class="mb-0 fs-4">Feedback Interactive Table</h3>
              <div class="d-flex gap-2">
                <button @click="exportPDF" class="btn btn-outline-danger btn-sm" aria-label="Export reviews as PDF report">
                  📄 Export PDF
                </button>
                <button @click="exportCSV" class="btn btn-outline-success btn-sm" aria-label="Export reviews as CSV">
                  📥 Export CSV
                </button>
                <button @click="exportJSON" class="btn btn-outline-primary btn-sm" aria-label="Export reviews as JSON">
                  📥 Export JSON
                </button>
              </div>
            </div>
            
            <div class="table-responsive">
              <table class="table table-hover table-striped align-middle" aria-label="Counselor reviews table">
                <thead>
                  <tr>
                    <th scope="col" @click="sortBy('counselor')" style="cursor: pointer;" tabindex="0" @keydown.enter="sortBy('counselor')" aria-label="Sort by Counselor">
                      Counselor 
                      <span v-if="sortKey === 'counselor'">{{ sortOrder === 'asc' ? '▲' : '▼' }}</span>
                    </th>
                    <th scope="col" @click="sortBy('rating')" style="cursor: pointer;" tabindex="0" @keydown.enter="sortBy('rating')" aria-label="Sort by Rating">
                      Rating 
                      <span v-if="sortKey === 'rating'">{{ sortOrder === 'asc' ? '▲' : '▼' }}</span>
                    </th>
                    <th scope="col" @click="sortBy('comments')" style="cursor: pointer;" tabindex="0" @keydown.enter="sortBy('comments')" aria-label="Sort by Comments">
                      Comments 
                      <span v-if="sortKey === 'comments'">{{ sortOrder === 'asc' ? '▲' : '▼' }}</span>
                    </th>
                    <th scope="col" @click="sortBy('user')" style="cursor: pointer;" tabindex="0" @keydown.enter="sortBy('user')" aria-label="Sort by User">
                      User 
                      <span v-if="sortKey === 'user'">{{ sortOrder === 'asc' ? '▲' : '▼' }}</span>
                    </th>
                    <th scope="col" @click="sortBy('date')" style="cursor: pointer;" tabindex="0" @keydown.enter="sortBy('date')" aria-label="Sort by Date">
                      Date 
                      <span v-if="sortKey === 'date'">{{ sortOrder === 'asc' ? '▲' : '▼' }}</span>
                    </th>
                  </tr>
                  <tr>
                    <th><input type="text" class="form-control form-control-sm" placeholder="Search Counselor..." v-model="filters.counselor" aria-label="Filter by counselor name" /></th>
                    <th><input type="text" class="form-control form-control-sm" placeholder="Search Rating..." v-model="filters.rating" aria-label="Filter by rating score" /></th>
                    <th><input type="text" class="form-control form-control-sm" placeholder="Search Comments..." v-model="filters.comments" aria-label="Filter by comment text" /></th>
                    <th><input type="text" class="form-control form-control-sm" placeholder="Search User..." v-model="filters.user" aria-label="Filter by user email" /></th>
                    <th><input type="text" class="form-control form-control-sm" placeholder="Search Date..." v-model="filters.date" aria-label="Filter by date" /></th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="paginatedReviews.length === 0">
                    <td colspan="5" class="text-center text-muted">No review records found.</td>
                  </tr>
                  <tr v-for="(r, idx) in paginatedReviews" :key="idx">
                    <td><strong>{{ r.counselor }}</strong></td>
                    <td>
                      <span class="text-warning" aria-hidden="true">{{ '⭐'.repeat(r.rating) }}</span>
                      <span class="visually-hidden">{{ r.rating }} out of 5 stars</span>
                    </td>
                    <td class="small">{{ r.comments }}</td>
                    <td class="small text-muted">{{ r.user }}</td>
                    <td class="small text-muted">{{ r.date }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="d-flex justify-content-between align-items-center mt-3" v-if="totalPages > 1">
              <button class="btn btn-sm btn-outline-secondary" :disabled="currentPage === 1" @click="currentPage--" aria-label="Go to previous page">Previous</button>
              <span class="small text-muted">Page {{ currentPage }} of {{ totalPages }}</span>
              <button class="btn btn-sm btn-outline-secondary" :disabled="currentPage === totalPages" @click="currentPage++" aria-label="Go to next page">Next</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';

const props = defineProps({
  currentUser: Object
});

const counselor = ref('');
const rating = ref(5);
const comments = ref('');
const errorMsg = ref('');
const successMsg = ref('');
const reviews = ref([]);

const currentPage = ref(1);
const pageSize = 10;
const sortKey = ref('');
const sortOrder = ref('asc');

const filters = ref({
  counselor: '',
  rating: '',
  comments: '',
  user: '',
  date: ''
});

const defaultMockReviews = [
  { counselor: 'Dr. Li', rating: 5, comments: 'Extremely helpful consultation!', user: 'student1@monash.edu', date: '2026/08/01' },
  { counselor: 'Sarah Zhang', rating: 4, comments: 'Good listener and great feedback.', user: 'student2@monash.edu', date: '2026/08/01' },
  { counselor: 'David Wang', rating: 5, comments: 'Calmed my anxiety quickly.', user: 'userA@gmail.com', date: '2026/07/31' },
  { counselor: 'Dr. Li', rating: 3, comments: 'Session was okay.', user: 'userB@gmail.com', date: '2026/07/30' },
  { counselor: 'Sarah Zhang', rating: 5, comments: 'Wonderful insights.', user: 'userC@gmail.com', date: '2026/07/29' },
  { counselor: 'David Wang', rating: 4, comments: 'Very supportive.', user: 'userD@gmail.com', date: '2026/07/28' },
  { counselor: 'Dr. Li', rating: 5, comments: 'Highly recommend!', user: 'userE@gmail.com', date: '2026/07/27' },
  { counselor: 'Sarah Zhang', rating: 2, comments: 'Too crowded wait times.', user: 'userF@gmail.com', date: '2026/07/26' },
  { counselor: 'David Wang', rating: 4, comments: 'Solid support plan.', user: 'userG@gmail.com', date: '2026/07/25' },
  { counselor: 'Dr. Li', rating: 5, comments: 'Helped me get through exams.', user: 'userH@gmail.com', date: '2026/07/24' },
  { counselor: 'Sarah Zhang', rating: 5, comments: 'Great environment.', user: 'userI@gmail.com', date: '2026/07/23' },
  { counselor: 'David Wang', rating: 3, comments: 'Average advice.', user: 'userJ@gmail.com', date: '2026/07/22' }
];

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
  const local = JSON.parse(localStorage.getItem('platform_reviews') || '[]');
  if (local.length === 0) {
    localStorage.setItem('platform_reviews', JSON.stringify(defaultMockReviews));
    reviews.value = defaultMockReviews;
  } else {
    reviews.value = local;
  }
};

onMounted(() => {
  loadReviews();
});

const aggregatedStats = computed(() => {
  const targets = {
    'Dr. Li': { sum: 0, count: 0 },
    'Sarah Zhang': { sum: 0, count: 0 },
    'David Wang': { sum: 0, count: 0 }
  };

  reviews.value.forEach(r => {
    if (targets[r.counselor]) {
      targets[r.counselor].sum += Number(r.rating);
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

const filteredReviews = computed(() => {
  return reviews.value.filter(item => {
    return Object.keys(filters.value).every(key => {
      const query = filters.value[key].toString().toLowerCase();
      if (!query) return true;
      const target = (item[key] || '').toString().toLowerCase();
      return target.includes(query);
    });
  });
});

const sortedReviews = computed(() => {
  const list = [...filteredReviews.value];
  if (!sortKey.value) return list;

  return list.sort((a, b) => {
    let valA = a[sortKey.value];
    let valB = b[sortKey.value];

    if (typeof valA === 'string') valA = valA.toLowerCase();
    if (typeof valB === 'string') valB = valB.toLowerCase();

    if (valA < valB) return sortOrder.value === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder.value === 'asc' ? 1 : -1;
    return 0;
  });
});

const totalPages = computed(() => Math.ceil(sortedReviews.value.length / pageSize) || 1);

const paginatedReviews = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return sortedReviews.value.slice(start, start + pageSize);
});

const sortBy = (key) => {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortKey.value = key;
    sortOrder.value = 'asc';
  }
};

watch(filters, () => {
  currentPage.value = 1;
}, { deep: true });

const submitReview = () => {
  errorMsg.value = '';
  successMsg.value = '';

  if (!counselor.value || !comments.value) {
    errorMsg.value = 'Security Alert: Please complete all operational fields.';
    return;
  }

  if (comments.value.length > 150) {
    errorMsg.value = 'Security Alert: Review length cannot exceed 150 characters.';
    return;
  }

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

// --- PDF / CSV / JSON Export Methods ---
const exportPDF = () => {
  const data = filteredReviews.value;
  if (!data.length) {
    alert('No review records available to export.');
    return;
  }

  const printWindow = window.open('', '_blank');
  const rowsHtml = data.map(r => `
    <tr>
      <td style="padding: 10px; border: 1px solid #ddd;">${r.counselor}</td>
      <td style="padding: 10px; border: 1px solid #ddd;">${'★'.repeat(r.rating)} (${r.rating}/5)</td>
      <td style="padding: 10px; border: 1px solid #ddd;">${r.comments}</td>
      <td style="padding: 10px; border: 1px solid #ddd;">${r.user}</td>
      <td style="padding: 10px; border: 1px solid #ddd;">${r.date}</td>
    </tr>
  `).join('');

  const docHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Counselor Reviews & Feedback Report</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 30px; color: #333; }
        h1 { color: #0d6efd; margin-bottom: 5px; }
        p { color: #666; font-size: 14px; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th { background-color: #f8f9fa; padding: 12px; border: 1px solid #ddd; text-align: left; font-weight: bold; }
        .footer { margin-top: 30px; font-size: 12px; color: #888; text-align: center; }
      </style>
    </head>
    <body>
      <h1>Mind Charity - Counselor Feedback Summary</h1>
      <p>Report Date: ${new Date().toLocaleDateString()}</p>
      <table>
        <thead>
          <tr>
            <th>Counselor</th>
            <th>Rating</th>
            <th>Comments</th>
            <th>User</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>
      <div class="footer">Exported Official Feedback Report - Mind Charity Platform</div>
    </body>
    </html>
  `;

  printWindow.document.write(docHtml);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 300);
};

const triggerDownload = (content, filename, contentType) => {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const exportCSV = () => {
  const data = filteredReviews.value;
  if (!data.length) return alert('No records available to export.');

  const headers = ['Counselor', 'Rating', 'Comments', 'User', 'Date'];
  const rows = data.map(item => [
    `"${item.counselor || ''}"`,
    item.rating,
    `"${(item.comments || '').replace(/"/g, '""')}"`,
    `"${item.user || ''}"`,
    `"${item.date || ''}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  triggerDownload(csvContent, `counselor_reviews_${Date.now()}.csv`, 'text/csv;charset=utf-8;');
};

const exportJSON = () => {
  const data = filteredReviews.value;
  if (!data.length) return alert('No records available to export.');

  const jsonContent = JSON.stringify(data, null, 2);
  triggerDownload(jsonContent, `counselor_reviews_${Date.now()}.json`, 'application/json');
};
</script>

<style scoped>
.last-border-clean:last-child {
  border-right: none !important;
}
</style>