<template>
  <div class="container my-5">
    <div class="row">
      <div class="col-md-6 mb-4">
        <div class="card shadow-sm border-0">
          <div class="card-body p-4">
            <h3 class="mb-4">Daily Well-being Check-in</h3>
            <div v-if="errorMsg" class="alert alert-danger">{{ errorMsg }}</div>
            <div v-if="successMsg" class="alert alert-success">{{ successMsg }}</div>

            <form @submit.prevent="saveCheckin">
              <div class="mb-3">
                <label class="form-label d-block">1. Mood Level (1 = Low, 5 = Excellent)</label>
                <div class="btn-group w-100">
                  <button type="button" v-for="n in 5" :key="'m'+n" 
                    :class="['btn', mood === n ? 'btn-primary' : 'btn-outline-primary']" 
                    @click="mood = n">{{ n }}</button>
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label d-block">2. Sleep Quality (1 = Poor, 5 = Excellent)</label>
                <div class="btn-group w-100">
                  <button type="button" v-for="n in 5" :key="'sl'+n" 
                    :class="['btn', sleep === n ? 'btn-primary' : 'btn-outline-primary']" 
                    @click="sleep = n">{{ n }}</button>
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label d-block">3. Stress Level (1 = Low, 5 = Extremely High)</label>
                <div class="btn-group w-100">
                  <button type="button" v-for="n in 5" :key="'st'+n" 
                    :class="['btn', stress === n ? 'btn-danger' : 'btn-outline-danger']" 
                    @click="stress = n">{{ n }}</button>
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label">Optional Notes (Max 50 characters)</label>
                <input type="text" class="form-control" v-model="notes" />
              </div>

              <button type="submit" class="btn btn-success w-100">Submit Record</button>
            </form>
          </div>
        </div>
      </div>

      <div class="col-md-6">
        <div class="card shadow-sm border-0 bg-light h-100">
          <div class="card-body p-4">
            <h3 class="mb-4">Dynamic Recommendations</h3>
            <div v-if="recommendations.length === 0" class="text-muted">
              Select scores on the left to instantly see recommendations.
            </div>
            <div v-else>
              <div class="alert alert-info">
                Based on your current input, we suggest:
              </div>
              <ul class="list-group">
                <li v-for="(rec, idx) in recommendations" :key="idx" class="list-group-item border-0 shadow-sm mb-2 rounded">
                  {{ rec }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  currentUser: Object
});

const mood = ref(null);
const sleep = ref(null);
const stress = ref(null);
const notes = ref('');
const errorMsg = ref('');
const successMsg = ref('');
const recommendations = ref([]);

const generateRecommendations = () => {
  if (mood.value === null || sleep.value === null || stress.value === null) return;
  
  const score = (mood.value + sleep.value + (6 - stress.value)) / 3;
  const list = [];

  if (score < 2.5) {
    list.push('Tip: Try a 5-minute deep breathing exercise to lower distress.');
    list.push('Resource: Access 24/7 emergency support contacts on the help menu.');
    list.push('Action: Consider taking a brief break from study or work tasks.');
  } else if (score >= 2.5 && score < 4.0) {
    list.push('Tip: Consider attending our online peer support group tonight.');
    list.push('Action: Reduce screen exposure and try to relax before sleep.');
    list.push('Resource: Book a consultation call with a professional counselor.');
  } else {
    list.push('Keep it up: Your well-being parameters look excellent today!');
    list.push('Tip: Share your positive routines in our peer community.');
  }

  recommendations.value = list;
};

watch([mood, sleep, stress], () => {
  generateRecommendations();
});

const saveCheckin = () => {
  errorMsg.value = '';
  successMsg.value = '';

  if (mood.value === null || sleep.value === null || stress.value === null) {
    errorMsg.value = 'All scores are required before submission.';
    return;
  }

  if (notes.value.length > 50) {
    errorMsg.value = 'Notes must not exceed 50 characters.';
    return;
  }

  const checkins = JSON.parse(localStorage.getItem('checkins') || '[]');
  const newEntry = {
    email: props.currentUser ? props.currentUser.email : 'Anonymous',
    mood: mood.value,
    sleep: sleep.value,
    stress: stress.value,
    notes: notes.value,
    date: new Date().toLocaleDateString()
  };

  checkins.push(newEntry);
  localStorage.setItem('checkins', JSON.stringify(checkins));
  successMsg.value = 'Well-being entry submitted and saved!';
  
  notes.value = '';
};
</script>