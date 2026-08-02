<template>
  <div class="container my-5">
    <div class="card shadow-sm border-0">
      <div class="card-body p-4">
        <h3 class="mb-4">My Well-being Tracker</h3>
        <div v-if="myCheckins.length === 0" class="text-center py-5">
          <p class="text-muted mb-3">No tracking data found for your account.</p>
          <button @click="$emit('go-checkin')" class="btn btn-primary">Complete Your First Check-in</button>
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
                  <div class="progress" style="height: 20px;">
                    <div class="progress-bar bg-success" :style="{ width: (c.mood * 20) + '%' }">{{ c.mood }}/5</div>
                  </div>
                </div>
              </div>
              <div class="row align-items-center mb-1">
                <div class="col-2 col-md-1">Sleep</div>
                <div class="col-10 col-md-11">
                  <div class="progress" style="height: 20px;">
                    <div class="progress-bar bg-info text-dark" :style="{ width: (c.sleep * 20) + '%' }">{{ c.sleep }}/5</div>
                  </div>
                </div>
              </div>
              <div class="row align-items-center">
                <div class="col-2 col-md-1">Stress</div>
                <div class="col-10 col-md-11">
                  <div class="progress" style="height: 20px;">
                    <div class="progress-bar bg-danger" :style="{ width: (c.stress * 20) + '%' }">{{ c.stress }}/5</div>
                  </div>
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

const props = defineProps({
  currentUser: Object
});
defineEmits(['go-checkin']);

const myCheckins = ref([]);

onMounted(() => {
  const all = JSON.parse(localStorage.getItem('checkins') || '[]');
  const email = props.currentUser ? props.currentUser.email : 'Anonymous';
  myCheckins.value = all.filter(c => c.email === email);
});
</script>