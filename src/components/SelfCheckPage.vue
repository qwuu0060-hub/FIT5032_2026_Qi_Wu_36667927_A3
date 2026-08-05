<template>
  <div class="container my-5">
    <div class="row">
      <div class="col-md-6 mb-4">
        <div class="card shadow-sm border-0">
          <div class="card-body p-4">
            <div class="d-flex justify-content-between align-items-center mb-4">
              <h3 class="mb-0">Daily Well-being Check-in</h3>
              <!-- Network Status Badge -->
              <span :class="['badge', isOffline ? 'bg-danger' : 'bg-success']">
                {{ isOffline ? 'Offline Mode' : 'Online Sync Active' }}
              </span>
            </div>

            <!-- Offline Draft Restore Alert -->
            <div v-if="draftRestored" class="alert alert-info py-2 small d-flex justify-content-between align-items-center">
              <span>📝 Unsaved offline draft restored.</span>
              <button @click="clearDraft" class="btn btn-link btn-sm text-decoration-none p-0">Discard Draft</button>
            </div>

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
                <input type="text" class="form-control" v-model="notes" placeholder="Auto-saves to local storage draft..." />
              </div>

              <button type="submit" class="btn btn-success w-100" :disabled="isSaving">
                {{ isSaving ? 'Processing...' : (isOffline ? 'Save Record Locally (Offline)' : 'Submit Record') }}
              </button>
            </form>

            <div class="mt-4 pt-4 border-top">
              <h4 class="mb-3">Email Record with Attachment</h4>
              <div v-if="isOffline" class="alert alert-warning py-2 small">
                ⚠️ Email sending requires an active internet connection.
              </div>
              <div v-if="emailSuccess" class="alert alert-success">{{ emailSuccess }}</div>
              <div v-if="emailError" class="alert alert-danger">{{ emailError }}</div>

              <form ref="emailForm" @submit.prevent="sendEmailWithAttachment">
                <div class="mb-3">
                  <label class="form-label">Recipient Email</label>
                  <input type="email" name="user_email" class="form-control" v-model="recipientEmail" required />
                </div>
                
                <div class="mb-3">
                  <label class="form-label">Message / Details</label>
                  <textarea name="message" class="form-control" rows="2" v-model="emailMessage"></textarea>
                </div>

                <div class="mb-3">
                  <label class="form-label">Attach File (PDF, Image, Doc)</label>
                  <input type="file" name="my_file" class="form-control" required />
                </div>

                <button type="submit" class="btn btn-outline-primary w-100" :disabled="isSending || isOffline">
                  {{ isSending ? 'Sending...' : 'Send Email with Attachment' }}
                </button>
              </form>
            </div>

          </div>
        </div>
      </div>

      <div class="col-md-6">
        <div class="card shadow-sm border-0 bg-light mb-4">
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

        <div class="card shadow-sm border-0 bg-white">
          <div class="card-body p-4">
            <h3 class="mb-3">GenAI Health Assistant</h3>
            <p class="text-muted small">Ask our AI for personalized well-being advice or questions about your current state.</p>
            
            <div class="mb-3">
              <textarea class="form-control" rows="3" v-model="aiPrompt" placeholder="e.g. How can I lower my stress when I feel overwhelmed?"></textarea>
            </div>
            
            <button class="btn btn-dark w-100 mb-3" @click="askGenAI" :disabled="isAiLoading">
              {{ isAiLoading ? 'AI is thinking...' : 'Ask AI Assistant' }}
            </button>

            <div v-if="aiError" class="alert alert-danger">{{ aiError }}</div>
            <div v-if="aiResponse" class="p-3 bg-light rounded border">
              <h6 class="fw-bold mb-2">AI Suggestion:</h6>
              <p class="mb-0" style="white-space: pre-line;">{{ aiResponse }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue';
import emailjs from '@emailjs/browser';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';

const props = defineProps({
  currentUser: Object,
  isOffline: Boolean
});

const mood = ref(null);
const sleep = ref(null);
const stress = ref(null);
const notes = ref('');
const errorMsg = ref('');
const successMsg = ref('');
const isSaving = ref(false);
const recommendations = ref([]);
const draftRestored = ref(false);

const emailForm = ref(null);
const recipientEmail = ref('');
const emailMessage = ref('');
const isSending = ref(false);
const emailSuccess = ref('');
const emailError = ref('');

const aiPrompt = ref('');
const aiResponse = ref('');
const isAiLoading = ref(false);
const aiError = ref('');
const geminiApiKey = 'YOUR_GEMINI_API_KEY';

// Feature 2: Extended Local Storage Auto-Draft Saving
const saveDraftLocally = () => {
  const draft = {
    mood: mood.value,
    sleep: sleep.value,
    stress: stress.value,
    notes: notes.value
  };
  localStorage.setItem('checkin_form_draft', JSON.stringify(draft));
};

const restoreDraft = () => {
  const saved = localStorage.getItem('checkin_form_draft');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed.mood || parsed.sleep || parsed.stress || parsed.notes) {
        mood.value = parsed.mood;
        sleep.value = parsed.sleep;
        stress.value = parsed.stress;
        notes.value = parsed.notes || '';
        draftRestored.value = true;
      }
    } catch (e) {
      console.error('Failed to parse draft', e);
    }
  }
};

const clearDraft = () => {
  localStorage.removeItem('checkin_form_draft');
  mood.value = null;
  sleep.value = null;
  stress.value = null;
  notes.value = '';
  draftRestored.value = false;
};

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

watch([mood, sleep, stress, notes], () => {
  generateRecommendations();
  saveDraftLocally();
});

// Feature 3: Auto Sync Queued Offline Submissions to Firestore when back online
const syncOfflineQueueToFirebase = async () => {
  const queue = JSON.parse(localStorage.getItem('offline_checkins_queue') || '[]');
  if (queue.length === 0) return;

  if (db && navigator.onLine) {
    try {
      for (const entry of queue) {
        await addDoc(collection(db, 'checkins'), entry);
      }
      localStorage.removeItem('offline_checkins_queue');
      successMsg.value = `Synced ${queue.length} offline check-in record(s) to Firebase successfully!`;
    } catch (err) {
      console.error('Failed to sync offline queue:', err);
    }
  }
};

const saveCheckin = async () => {
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

  isSaving.value = true;

  const userEmail = props.currentUser ? props.currentUser.email : 'Anonymous';
  const newEntry = {
    email: userEmail,
    mood: mood.value,
    sleep: sleep.value,
    stress: stress.value,
    notes: notes.value,
    date: new Date().toLocaleDateString(),
    createdAt: new Date().toISOString()
  };

  // Save to LocalStorage main history
  const checkins = JSON.parse(localStorage.getItem('checkins') || '[]');
  checkins.push(newEntry);
  localStorage.setItem('checkins', JSON.stringify(checkins));

  if (navigator.onLine && db) {
    try {
      await addDoc(collection(db, 'checkins'), newEntry);
      successMsg.value = 'Well-being entry submitted and saved to Firebase!';
    } catch (err) {
      console.error('Firestore save failed, caching offline:', err);
      cacheOfflineEntry(newEntry);
    }
  } else {
    // Offline submission flow
    cacheOfflineEntry(newEntry);
  }

  emailMessage.value = `Mood: ${mood.value}, Sleep: ${sleep.value}, Stress: ${stress.value}, Notes: ${notes.value}`;
  if (props.currentUser && props.currentUser.email) {
    recipientEmail.value = props.currentUser.email;
  }

  clearDraft();
  isSaving.value = false;
};

const cacheOfflineEntry = (entry) => {
  const queue = JSON.parse(localStorage.getItem('offline_checkins_queue') || '[]');
  queue.push(entry);
  localStorage.setItem('offline_checkins_queue', JSON.stringify(queue));
  successMsg.value = '⚠️ Offline Mode: Record saved locally in Local Storage. It will auto-sync to Firebase once back online.';
};

const sendEmailWithAttachment = () => {
  emailSuccess.value = '';
  emailError.value = '';
  isSending.value = true;

  const serviceID = 'service_7qbzy1y';
  const templateID = 'template_4nhlndl';
  const publicKey = 'lEjybZvUZLoBWI0lR';

  emailjs.sendForm(serviceID, templateID, emailForm.value, publicKey)
    .then(() => {
      emailSuccess.value = 'Email sent successfully with attachment!';
    })
    .catch((err) => {
      emailError.value = 'Failed to send email: ' + (err.text || 'Unknown error');
    })
    .finally(() => {
      isSending.value = false;
    });
};

const askGenAI = async () => {
  aiError.value = '';
  aiResponse.value = '';

  if (!aiPrompt.value.trim() && mood.value === null) {
    aiError.value = 'Please enter a question or select your daily scores first.';
    return;
  }

  isAiLoading.value = true;

  let queryText = aiPrompt.value.trim();
  if (!queryText) {
    queryText = `Give me brief health advice based on my current status: Mood level ${mood.value}/5, Sleep quality ${sleep.value}/5, Stress level ${stress.value}/5.`;
  }

  if (!geminiApiKey || geminiApiKey === 'YOUR_GEMINI_API_KEY') {
    setTimeout(() => {
      aiResponse.value = `[GenAI Assistant Recommendations]\nBased on your query: "${queryText}"\n\n1. Prioritize a consistent sleep schedule and limit caffeine late in the day.\n2. Practice brief 5-minute mindfulness breathing to reduce stress.\n3. Stay hydrated and engage in regular light physical exercise.`;
      isAiLoading.value = false;
    }, 600);
    return;
  }

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: `You are a supportive health assistant. ${queryText}` }]
        }]
      })
    });

    const data = await res.json();
    if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
      aiResponse.value = data.candidates[0].content.parts[0].text;
    } else {
      aiError.value = 'Failed to fetch AI response. Please check API Key/Network.';
    }
  } catch (err) {
    aiError.value = 'Error connecting to GenAI service.';
  } finally {
    isAiLoading.value = false;
  }
};

const handleOnlineEvent = () => {
  syncOfflineQueueToFirebase();
};

onMounted(() => {
  restoreDraft();
  window.addEventListener('online', handleOnlineEvent);
  syncOfflineQueueToFirebase();
});

onUnmounted(() => {
  window.removeEventListener('online', handleOnlineEvent);
});
</script>