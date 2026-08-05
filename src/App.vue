<template>
  <div>
    <a href="#main-content" class="skip-link">Skip to main content</a>

    <!-- Offline Alert Banner -->
    <div v-if="isOffline" class="bg-danger text-white text-center py-2 fw-bold small shadow-sm" role="alert" aria-live="assertive">
      ⚠️ You are currently OFFLINE. All operations and check-ins will be safely cached to Local Storage and synced when reconnected.
    </div>

    <div class="bg-secondary text-white py-1 px-3 d-flex justify-content-between align-items-center small" role="region" aria-label="Accessibility Controls">
      <div>
        <span class="me-2 fw-bold">Accessibility Tools:</span>
        <button @click="setFontSize('normal')" class="btn btn-sm btn-dark me-1" :class="{'active': fontSizeLevel === 'normal'}" aria-label="Normal Text Size">A</button>
        <button @click="setFontSize('large')" class="btn btn-sm btn-dark me-1" :class="{'active': fontSizeLevel === 'large'}" aria-label="Large Text Size">A+</button>
        <button @click="setFontSize('xlarge')" class="btn btn-sm btn-dark me-2" :class="{'active': fontSizeLevel === 'xlarge'}" aria-label="Extra Large Text Size">A++</button>
      </div>
      <div>
        <button @click="toggleHighContrast" class="btn btn-sm btn-warning fw-bold" aria-label="Toggle High Contrast Mode">
          {{ isHighContrast ? 'Disable High Contrast' : 'High Contrast Mode' }}
        </button>
      </div>
    </div>

    <nav class="navbar navbar-expand-lg navbar-dark bg-dark" role="navigation" aria-label="Main Navigation">
      <div class="container">
        <a class="navbar-brand" href="#" @click.prevent="navigate('home')" aria-label="Mind Charity Home">Mind Charity</a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navMenu" aria-controls="navMenu" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navMenu">
          <ul class="navbar-nav me-auto mb-2 mb-lg-0">
            <li class="nav-item">
              <a class="nav-link" href="#" @click.prevent="navigate('home')">Home</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="#" @click.prevent="navigate('selfcheck')">Daily Check-in</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="#" @click.prevent="navigate('booking')">Book Session</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="#" @click.prevent="navigate('reviews')">Reviews</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="#" @click.prevent="navigate('map')">Nearby Support</a>
            </li>
            <li v-if="currentUser" class="nav-item">
              <a class="nav-link" href="#" @click.prevent="navigate('trends')">My Trends</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="#" @click.prevent="navigate('community')">Support Board</a>
            </li>
            <li v-if="currentUser && currentUser.role === 'admin'" class="nav-item">
              <a class="navbar-link text-warning fw-bold nav-link" href="#" @click.prevent="navigate('admin')">Admin Portal</a>
            </li>
          </ul>
          <div class="d-flex align-items-center">
            <span v-if="currentUser" class="text-light me-3 small" aria-live="polite">
              Session: {{ currentUser.email }} ({{ currentUser.role }})
            </span>
            <button v-if="currentUser" @click="handleLogout" class="btn btn-outline-danger btn-sm" aria-label="Logout of account">
              Logout
            </button>
            <button v-else @click="navigate('auth')" class="btn btn-outline-light btn-sm" aria-label="Login or register account">
              Login/Register
            </button>
          </div>
        </div>
      </div>
    </nav>

    <main id="main-content" class="py-4" tabindex="-1" role="main">
      <div v-if="currentView === 'home'">
        <div class="container">
          <div v-if="!currentUser" class="p-5 mb-4 bg-light rounded-3 text-center">
            <div class="container-fluid py-5">
              <h1 class="display-5 fw-bold text-dark">We stand with you.</h1>
              <p class="col-md-8 mx-auto fs-5 text-secondary">
                Our charity supports underrepresented groups facing mental health challenges. Access private, anonymous self-checks, select peer support guides, and consult aggregated reviews of validated mental health experts.
              </p>
              <div class="d-flex justify-content-center gap-3 mt-4">
                <button @click="navigate('auth')" class="btn btn-primary btn-lg" aria-label="Get Started with an account">Get Started</button>
                <button @click="handleAnonymous" class="btn btn-outline-secondary btn-lg" aria-label="Explore Anonymously without registering">Explore Anonymously</button>
              </div>
            </div>
          </div>

          <div v-else class="row justify-content-center">
            <div class="col-md-12 mb-4">
              <div class="card bg-primary text-white border-0 p-4 rounded shadow-sm">
                <h2>Welcome Back, {{ currentUser.email }}!</h2>
                <p class="mb-0">Your mental well-being is our priority. Explore your dashboard below to track your journey.</p>
              </div>
            </div>
            
            <div class="col-md-4 mb-4">
              <div class="card h-100 border-0 shadow-sm text-center p-4">
                <h3>Daily Check-in</h3>
                <p class="text-muted small">Record your mood, sleep, and stress parameters to receive instant advice.</p>
                <button @click="navigate('selfcheck')" class="btn btn-outline-primary mt-auto" aria-label="Start a new daily check-in">New Check-in</button>
              </div>
            </div>

            <div class="col-md-4 mb-4">
              <div class="card h-100 border-0 shadow-sm text-center p-4">
                <h3>Book Session</h3>
                <p class="text-muted small">Schedule private standard sessions with our professional psychological support team.</p>
                <button @click="navigate('booking')" class="btn btn-outline-primary mt-auto" aria-label="Book a consultation session now">Book Now</button>
              </div>
            </div>

            <div class="col-md-4 mb-4">
              <div class="card h-100 border-0 shadow-sm text-center p-4">
                <h3>Platform Reviews</h3>
                <p class="text-muted small">Read anonymous feedback and view aggregated rating scores of our expert consultants.</p>
                <button @click="navigate('reviews')" class="btn btn-outline-primary mt-auto" aria-label="View platform reviews and ratings">View Reviews</button>
              </div>
            </div>
            
            <div class="col-md-4 mb-4">
              <div class="card h-100 border-0 shadow-sm text-center p-4">
                <h3>My Trends</h3>
                <p class="text-muted small">Visualize your psychological parameters over time to find recovery patterns.</p>
                <button @click="navigate('trends')" class="btn btn-outline-primary mt-auto" aria-label="View my well-being trend tracker">View Tracker</button>
              </div>
            </div>

            <div class="col-md-4 mb-4">
              <div class="card h-100 border-0 shadow-sm text-center p-4">
                <h3>Support Board</h3>
                <p class="text-muted small">Share anonymous, uplifting messages and find peer strength in our community.</p>
                <button @click="navigate('community')" class="btn btn-outline-primary mt-auto" aria-label="Visit community support board">Visit Community</button>
              </div>
            </div>

            <div class="col-md-4 mb-4">
              <div class="card h-100 border-0 shadow-sm text-center p-4">
                <h3>Nearby Support</h3>
                <p class="text-muted small">Locate nearby psychological service centers and campus health hubs on an interactive map.</p>
                <button @click="navigate('map')" class="btn btn-outline-primary mt-auto" aria-label="Find nearby health support centers">Find Centers</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="currentView === 'auth'">
        <AuthPage @auth-success="handleAuthSuccess" />
      </div>

      <div v-else-if="currentView === 'selfcheck'">
        <SelfCheckPage :currentUser="currentUser" :isOffline="isOffline" />
      </div>

      <div v-else-if="currentView === 'booking'">
        <BookingPage :currentUser="currentUser" />
      </div>

      <div v-else-if="currentView === 'reviews'">
        <ReviewPage :currentUser="currentUser" />
      </div>

      <div v-else-if="currentView === 'map'">
        <ServiceMapPage />
      </div>

      <div v-else-if="currentView === 'trends'">
        <TrendPage :currentUser="currentUser" @go-checkin="navigate('selfcheck')" />
      </div>

      <div v-else-if="currentView === 'community'">
        <CommunityPage />
      </div>

      <div v-else-if="currentView === 'admin' && currentUser && currentUser.role === 'admin'">
        <div class="container">
          <h2 class="mb-4 text-primary">Admin System Portal</h2>
          
          <div class="card mb-4 border-0 shadow-sm">
            <div class="card-body p-4">
              <h3 class="card-title mb-3 fs-4">Consultation Booking Requests Management</h3>
              <div v-if="allBookings.length === 0" class="text-muted small">No booking requests found.</div>
              <table v-else class="table table-hover align-middle" aria-label="Booking requests table">
                <thead>
                  <tr>
                    <th scope="col">User identity</th>
                    <th scope="col">Counselor</th>
                    <th scope="col">Date & Time Slot</th>
                    <th scope="col">Priority</th>
                    <th scope="col">Reason Note</th>
                    <th scope="col">Status</th>
                    <th scope="col">Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(b, idx) in allBookings" :key="idx" :class="{'table-danger': b.priority === 'High' && b.status !== 'Approved'}">
                    <td>{{ b.user }}</td>
                    <td>{{ b.counsellor }}</td>
                    <td>{{ b.date }} ({{ b.time }})</td>
                    <td>
                      <span :class="['badge', b.priority === 'High' ? 'bg-danger' : b.priority === 'Medium' ? 'bg-warning text-dark' : 'bg-secondary']">
                        {{ b.priority }}
                      </span>
                    </td>
                    <td>{{ b.reason || 'None' }}</td>
                    <td>
                      <span :class="['badge', b.status === 'Approved' ? 'bg-success' : 'bg-warning text-dark']">
                        {{ b.status }}
                      </span>
                    </td>
                    <td>
                      <button v-if="b.status !== 'Approved'" @click="approveBooking(idx)" class="btn btn-success btn-sm" :aria-label="'Approve booking for ' + b.user">
                        Approve Booking
                      </button>
                      <span v-else class="text-muted small">Verified</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="card mb-4 border-0 shadow-sm">
            <div class="card-body p-4">
              <h3 class="card-title mb-3 fs-4">Registered Accounts</h3>
              <table class="table table-striped" aria-label="Registered accounts table">
                <thead>
                  <tr>
                    <th scope="col">User Identifier</th>
                    <th scope="col">System Role</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="u in allUsers" :key="u.email">
                    <td>{{ u.email }}</td>
                    <td>
                      <span :class="['badge', u.role === 'admin' ? 'bg-danger' : 'bg-primary']">
                        {{ u.role }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="card mb-4 border-0 shadow-sm">
            <div class="card-body p-4">
              <h3 class="card-title mb-3 fs-4">User State Check-in History</h3>
              <table class="table table-striped" aria-label="Check-in audit logs table">
                <thead>
                  <tr>
                    <th scope="col">Identity</th>
                    <th scope="col">Mood Score</th>
                    <th scope="col">Sleep Score</th>
                    <th scope="col">Stress Score</th>
                    <th scope="col">Personal Note</th>
                    <th scope="col">Entry Date</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(c, idx) in allCheckins" :key="idx">
                    <td>{{ c.email }}</td>
                    <td>{{ c.mood }}</td>
                    <td>{{ c.sleep }}</td>
                    <td>{{ c.stress }}</td>
                    <td>{{ c.notes || 'No notes' }}</td>
                    <td>{{ c.date }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="card border-0 shadow-sm">
            <div class="card-body p-4">
              <h3 class="card-title mb-3 fs-4">User Feedback & Rating Records</h3>
              <div v-if="allReviews.length === 0" class="text-muted small">No dynamic feedback reviews logged.</div>
              <table v-else class="table table-striped align-middle" aria-label="Feedback and review records table">
                <thead>
                  <tr>
                    <th scope="col">User Identity</th>
                    <th scope="col">Counselor</th>
                    <th scope="col">Score Granted</th>
                    <th scope="col">Review Feedback Text</th>
                    <th scope="col">Submission Date</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(r, idx) in allReviews" :key="idx">
                    <td>{{ r.user }}</td>
                    <td>{{ r.counselor }}</td>
                    <td><span class="text-warning" aria-hidden="true">{{ '★'.repeat(r.rating) }}</span> <span class="visually-hidden">{{ r.rating }} out of 5 stars</span> ({{ r.rating }}/5)</td>
                    <td>{{ r.comments }}</td>
                    <td>{{ r.date }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { auth } from './firebase';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import AuthPage from './components/AuthPage.vue';
import SelfCheckPage from './components/SelfCheckPage.vue';
import BookingPage from './components/BookingPage.vue';
import ReviewPage from './components/ReviewPage.vue';
import CommunityPage from './components/CommunityPage.vue';
import TrendPage from './components/TrendPage.vue';
import ServiceMapPage from './components/ServiceMapPage.vue';

const currentView = ref('home');
const currentUser = ref(null);
const allUsers = ref([]);
const allCheckins = ref([]);
const allBookings = ref([]);
const allReviews = ref([]);

const isHighContrast = ref(false);
const fontSizeLevel = ref('normal');

// Offline Feature 1: Global Network Listener
const isOffline = ref(!navigator.onLine);

const updateOnlineStatus = () => {
  isOffline.value = !navigator.onLine;
};

const toggleHighContrast = () => {
  isHighContrast.value = !isHighContrast.value;
  if (isHighContrast.value) {
    document.body.classList.add('high-contrast');
  } else {
    document.body.classList.remove('high-contrast');
  }
};

const setFontSize = (size) => {
  fontSizeLevel.value = size;
  document.body.classList.remove('font-large', 'font-xlarge');
  if (size === 'large') {
    document.body.classList.add('font-large');
  } else if (size === 'xlarge') {
    document.body.classList.add('font-xlarge');
  }
};

const loadSession = () => {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      const localUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const matchedLocal = users.find(u => u.email === user.email);
      const userRole = matchedLocal ? matchedLocal.role : (localUser.role || 'user');
      
      currentUser.value = {
        email: user.email,
        uid: user.uid,
        role: userRole,
        isAnonymous: false
      };
      localStorage.setItem('currentUser', JSON.stringify(currentUser.value));
    } else {
      const logged = localStorage.getItem('currentUser');
      if (logged) {
        const parsed = JSON.parse(logged);
        if (parsed.isAnonymous) {
          currentUser.value = parsed;
        } else {
          currentUser.value = null;
        }
      } else {
        currentUser.value = null;
      }
    }
  });
};

const navigate = (view) => {
  currentView.value = view;
  if (view === 'admin') {
    allUsers.value = JSON.parse(localStorage.getItem('users') || '[]');
    allCheckins.value = JSON.parse(localStorage.getItem('checkins') || '[]');
    allBookings.value = JSON.parse(localStorage.getItem('bookings') || '[]');
    allReviews.value = JSON.parse(localStorage.getItem('platform_reviews') || '[]');
  }
};

const handleAuthSuccess = (userData) => {
  currentUser.value = userData;
  localStorage.setItem('currentUser', JSON.stringify(userData));
  navigate('home');
};

const handleAnonymous = () => {
  const anonData = { email: 'Anonymous', role: 'user', isAnonymous: true };
  currentUser.value = anonData;
  localStorage.setItem('currentUser', JSON.stringify(anonData));
  navigate('home');
};

const handleLogout = async () => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error(error);
  }
  currentUser.value = null;
  localStorage.removeItem('currentUser');
  navigate('home');
};

const approveBooking = (index) => {
  const list = JSON.parse(localStorage.getItem('bookings') || '[]');
  if (list[index]) {
    list[index].status = 'Approved';
    localStorage.setItem('bookings', JSON.stringify(list));
    allBookings.value = list;
  }
};

onMounted(() => {
  loadSession();
  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
});

onUnmounted(() => {
  window.removeEventListener('online', updateOnlineStatus);
  window.removeEventListener('offline', updateOnlineStatus);
});
</script>