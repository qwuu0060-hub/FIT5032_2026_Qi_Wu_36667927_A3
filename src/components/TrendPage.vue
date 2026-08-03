<template>
  <div class="container my-5">
    <div class="card shadow-sm border-0 mb-4">
      <div class="card-body p-4">
        <h2 class="mb-4 fs-3">My Well-being Tracker</h2>
        <div v-if="myCheckins.length === 0" class="text-center py-5">
          <p class="text-muted mb-3">No tracking data found for your account.</p>
          <button @click="$emit('go-checkin')" class="btn btn-primary" aria-label="Navigate to daily check-in page">Complete Your First Check-in</button>
        </div>
        <div v-else>
          <p class="text-secondary mb-4">Visual trend of your last 5 check-ins (1 = Lowest, 5 = Highest)</p>
          <div class="row">
            <div v-for="(c, idx) in myCheckins.slice(-5)" :key="idx" class="col-md-12 mb-4 border-bottom pb-3">
              <div class="d-flex justify-content-between mb-2">
                <strong class="text-primary">Record Date: {{ c.date }}</strong>
                <span class="text-muted fst-italic" v-if="c.notes">"{{ c.notes }}"</span>
              </div>
              <div class="row align-items-center mb-1">
                <div class="col-2 col-md-1">Mood</div>
                <div class="col-10 col-md-11">
                  <div class="progress" style="height: 20px;" role="progressbar" :aria-valuenow="c.mood" aria-valuemin="1" aria-valuemax="5" :aria-label="'Mood score ' + c.mood + ' out of 5'">
                    <div class="progress-bar bg-success" :style="{ width: (c.mood * 20) + '%' }">{{ c.mood }}/5</div>
                  </div>
                </div>
              </div>
              <div class="row align-items-center mb-1">
                <div class="col-2 col-md-1">Sleep</div>
                <div class="col-10 col-md-11">
                  <div class="progress" style="height: 20px;" role="progressbar" :aria-valuenow="c.sleep" aria-valuemin="1" aria-valuemax="5" :aria-label="'Sleep score ' + c.sleep + ' out of 5'">
                    <div class="progress-bar bg-info text-dark" :style="{ width: (c.sleep * 20) + '%' }">{{ c.sleep }}/5</div>
                  </div>
                </div>
              </div>
              <div class="row align-items-center">
                <div class="col-2 col-md-1">Stress</div>
                <div class="col-10 col-md-11">
                  <div class="progress" style="height: 20px;" role="progressbar" :aria-valuenow="c.stress" aria-valuemin="1" aria-valuemax="5" :aria-label="'Stress score ' + c.stress + ' out of 5'">
                    <div class="progress-bar bg-danger" :style="{ width: (c.stress * 20) + '%' }">{{ c.stress }}/5</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="card shadow-sm border-0">
      <div class="card-body p-4">
        <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
          <h3 class="fs-4 mb-0">Interactive Check-in History Table</h3>
          <!-- BR E.4 Data Export Buttons for User -->
          <div class="d-flex gap-2">
            <button @click="exportCSV" class="btn btn-outline-success btn-sm" aria-label="Export my check-in history as CSV file">
              📥 Export CSV
            </button>
            <button @click="exportJSON" class="btn btn-outline-primary btn-sm" aria-label="Export my check-in history as JSON file">
              📥 Export JSON
            </button>
          </div>
        </div>
        
        <div class="table-responsive">
          <table class="table table-hover table-striped align-middle" aria-label="Check-in history table">
            <thead>
              <tr>
                <th scope="col" @click="sortBy('date')" style="cursor: pointer;" tabindex="0" @keydown.enter="sortBy('date')" aria-label="Sort by Date">
                  Date
                  <span v-if="sortKey === 'date'">{{ sortOrder === 'asc' ? '▲' : '▼' }}</span>
                </th>
                <th scope="col" @click="sortBy('mood')" style="cursor: pointer;" tabindex="0" @keydown.enter="sortBy('mood')" aria-label="Sort by Mood">
                  Mood (1-5)
                  <span v-if="sortKey === 'mood'">{{ sortOrder === 'asc' ? '▲' : '▼' }}</span>
                </th>
                <th scope="col" @click="sortBy('sleep')" style="cursor: pointer;" tabindex="0" @keydown.enter="sortBy('sleep')" aria-label="Sort by Sleep">
                  Sleep (1-5)
                  <span v-if="sortKey === 'sleep'">{{ sortOrder === 'asc' ? '▲' : '▼' }}</span>
                </th>
                <th scope="col" @click="sortBy('stress')" style="cursor: pointer;" tabindex="0" @keydown.enter="sortBy('stress')" aria-label="Sort by Stress">
                  Stress (1-5)
                  <span v-if="sortKey === 'stress'">{{ sortOrder === 'asc' ? '▲' : '▼' }}</span>
                </th>
                <th scope="col" @click="sortBy('notes')" style="cursor: pointer;" tabindex="0" @keydown.enter="sortBy('notes')" aria-label="Sort by Notes">
                  Notes
                  <span v-if="sortKey === 'notes'">{{ sortOrder === 'asc' ? '▲' : '▼' }}</span>
                </th>
              </tr>
              <tr>
                <th><input type="text" class="form-control form-control-sm" placeholder="Search Date..." v-model="filters.date" aria-label="Filter history by date" /></th>
                <th><input type="text" class="form-control form-control-sm" placeholder="Search Mood..." v-model="filters.mood" aria-label="Filter history by mood" /></th>
                <th><input type="text" class="form-control form-control-sm" placeholder="Search Sleep..." v-model="filters.sleep" aria-label="Filter history by sleep" /></th>
                <th><input type="text" class="form-control form-control-sm" placeholder="Search Stress..." v-model="filters.stress" aria-label="Filter history by stress" /></th>
                <th><input type="text" class="form-control form-control-sm" placeholder="Search Notes..." v-model="filters.notes" aria-label="Filter history by notes" /></th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="paginatedCheckins.length === 0">
                <td colspan="5" class="text-center text-muted">No records matching search.</td>
              </tr>
              <tr v-for="(item, idx) in paginatedCheckins" :key="idx">
                <td class="fw-bold">{{ item.date }}</td>
                <td><span class="badge bg-success">{{ item.mood }} / 5</span></td>
                <td><span class="badge bg-info text-dark">{{ item.sleep }} / 5</span></td>
                <td><span class="badge bg-danger">{{ item.stress }} / 5</span></td>
                <td class="small text-muted">{{ item.notes || '-' }}</td>
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
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';

const props = defineProps({
  currentUser: Object
});
defineEmits(['go-checkin']);

const myCheckins = ref([]);
const currentPage = ref(1);
const pageSize = 10;
const sortKey = ref('');
const sortOrder = ref('asc');

const filters = ref({
  date: '',
  mood: '',
  sleep: '',
  stress: '',
  notes: ''
});

const defaultMockCheckins = [
  { email: 'Anonymous', mood: 3, sleep: 2, stress: 4, notes: 'Felt tired during thesis writing', date: '2026/08/01' },
  { email: 'Anonymous', mood: 4, sleep: 4, stress: 2, notes: 'Took a short break today', date: '2026/07/31' },
  { email: 'Anonymous', mood: 2, sleep: 1, stress: 5, notes: 'Insomnia at night', date: '2026/07/30' },
  { email: 'Anonymous', mood: 5, sleep: 5, stress: 1, notes: 'Great day overall', date: '2026/07/29' },
  { email: 'Anonymous', mood: 3, sleep: 3, stress: 3, notes: 'Normal routine', date: '2026/07/28' },
  { email: 'Anonymous', mood: 4, sleep: 3, stress: 2, notes: 'Went for walking', date: '2026/07/27' },
  { email: 'Anonymous', mood: 2, sleep: 2, stress: 4, notes: 'Stressful meeting', date: '2026/07/26' },
  { email: 'Anonymous', mood: 1, sleep: 2, stress: 5, notes: 'Felt hopeless', date: '2026/07/25' },
  { email: 'Anonymous', mood: 4, sleep: 4, stress: 2, notes: 'Talked with friends', date: '2026/07/24' },
  { email: 'Anonymous', mood: 3, sleep: 3, stress: 3, notes: 'Okayish day', date: '2026/07/23' },
  { email: 'Anonymous', mood: 5, sleep: 4, stress: 1, notes: 'Completed assignment', date: '2026/07/22' },
  { email: 'Anonymous', mood: 2, sleep: 3, stress: 4, notes: 'Late night study', date: '2026/07/21' }
];

onMounted(() => {
  const all = JSON.parse(localStorage.getItem('checkins') || '[]');
  const email = props.currentUser ? props.currentUser.email : 'Anonymous';
  let filtered = all.filter(c => c.email === email);

  if (filtered.length === 0) {
    filtered = defaultMockCheckins;
  }
  myCheckins.value = filtered;
});

const filteredCheckins = computed(() => {
  return myCheckins.value.filter(item => {
    return Object.keys(filters.value).every(key => {
      const query = filters.value[key].toString().toLowerCase();
      if (!query) return true;
      const target = (item[key] || '').toString().toLowerCase();
      return target.includes(query);
    });
  });
});

const sortedCheckins = computed(() => {
  const list = [...filteredCheckins.value];
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

const totalPages = computed(() => Math.ceil(sortedCheckins.value.length / pageSize) || 1);

const paginatedCheckins = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return sortedCheckins.value.slice(start, start + pageSize);
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

// --- BR E.4 Data Export Methods ---
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
  const data = filteredCheckins.value;
  if (!data.length) return alert('No records available to export.');

  const headers = ['Date', 'Mood', 'Sleep', 'Stress', 'Notes'];
  const rows = data.map(item => [
    `"${item.date || ''}"`,
    item.mood,
    item.sleep,
    item.stress,
    `"${(item.notes || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  triggerDownload(csvContent, `my_checkin_history_${Date.now()}.csv`, 'text/csv;charset=utf-8;');
};

const exportJSON = () => {
  const data = filteredCheckins.value;
  if (!data.length) return alert('No records available to export.');

  const jsonContent = JSON.stringify(data, null, 2);
  triggerDownload(jsonContent, `my_checkin_history_${Date.now()}.json`, 'application/json');
};
</script>