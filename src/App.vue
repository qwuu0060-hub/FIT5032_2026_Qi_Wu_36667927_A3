<template>
  <div>
    <!-- Navigation Bar -->
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
      <div class="container">
        <a class="navbar-brand" href="#" @click.prevent="navigate('home')">Mind Charity</a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navMenu">
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
            <span v-if="currentUser" class="text-light me-3 small">
              Session: {{ currentUser.email }} ({{ currentUser.role }})
            </span>
            <button v-if="currentUser" @click="handleLogout" class="btn btn-outline-danger btn-sm">
              Logout
            </button>
            <button v-else @click="navigate('auth')" class="btn btn-outline-light btn-sm">
              Login/Register
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main Content Stream -->
    <main class="py-4">
      <!-- HOME VIEW -->
      <div v-if="currentView === 'home'">
        <div class="container">
          <!-- Welcome Screen for Guest Users -->
          <div v-if="!currentUser" class="p-5 mb-4 bg-light rounded-3 text-center">
            <div class="container-fluid py-5">
              <h1 class="display-5 fw-bold text-dark">We stand with you.</h1>
              <p class="col-md-8 mx-auto fs-5 text-secondary">
                Our charity supports underrepresented groups facing mental health challenges. Access private, anonymous self-checks, select peer support guides, and consult aggregated reviews of validated mental health experts.
              </p>
              <div class="d-flex justify-content-center gap-3 mt-4">
                <button @click="navigate('auth')" class="btn btn-primary btn-lg">Get Started</button>
                <button @click="handleAnonymous" class="btn btn-outline-secondary btn-lg">Explore Anonymously</button>
              </div>
            </div>
          </div>

          <!-- Dynamic Dashboard for Logged-in Users -->
          <div v-else class="row justify-content-center">
            <div class="col-md-12 mb-4">
              <div class="card bg-primary text-white border-0 p-4 rounded shadow-sm">
                <h2>Welcome Back, {{ currentUser.email }}!</h2>
                <p class="mb-0">Your mental well-being is our priority. Explore your dashboard below to track your journey.</p>
              </div>
            </div>
            
            <!-- Row 1 - Card 1: Daily Check-in -->
            <div class="col-md-4 mb-4">
              <div class="card h-100 border-0 shadow-sm text-center p-4">
                <h4>Daily Check-in</h4>
                <p class="text-muted small">Record your mood, sleep, and stress parameters to receive instant advice.</p>
                <button @click="navigate('selfcheck')" class="btn btn-outline-primary mt-auto">New Check-in</button>
              </div>
            </div>

            <!-- Row 1 - Card 2: Book Session -->
            <div class="col-md-4 mb-4">
              <div class="card h-100 border-0 shadow-sm text-center p-4">
                <h4>Book Session</h4>
                <p class="text-muted small">Schedule private standard sessions with our professional psychological support team.</p>
                <button @click="navigate('booking')" class="btn btn-outline-primary mt-auto">Book Now</button>
              </div>
            </div>

            <!-- Row 1 - Card 3: Reviews (NEWLY ADDED HERE) -->
            <div class="col-md-4 mb-4">
              <div class="card h-100 border-0 shadow-sm text-center p-4">
                <h4>Platform Reviews</h4>
                <p class="text-muted small">Read anonymous feedback and view aggregated rating scores of our expert consultants.</p>
                <button @click="navigate('reviews')" class="btn btn-outline-primary mt-auto">View Reviews</button>
              </div>
            </div>
            
            <!-- Row 2 - Card 4: My Trends -->
            <div class="col-md-4 mb-4">
              <div class="card h-100 border-0 shadow-sm text-center p-4">
                <h4>My Trends</h4>
                <p class="text-muted small">Visualize your psychological parameters over time to find recovery patterns.</p>
                <button @click="navigate('trends')" class="btn btn-outline-primary mt-auto">View Tracker</button>
              </div>
            </div>

            <!-- Row 2 - Card 5: Support Board -->
            <div class="col-md-4 mb-4">
              <div class="card h-100 border-0 shadow-sm text-center p-4">
                <h4>Support Board</h4>
                <p class="text-muted small">Share anonymous, uplifting messages and find peer strength in our community.</p>
                <button @click="navigate('community')" class="btn btn-outline-primary mt-auto">Visit Community</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- COMPONENT ROUTING -->
      <div v-else-if="currentView === 'auth'">
        <AuthPage @auth-success="handleAuthSuccess" />
      </div>

      <div v-else-if="currentView === 'selfcheck'">
        <SelfCheckPage :currentUser="currentUser" />
      </div>

      <div v-else-if="currentView === 'booking'">
        <BookingPage :currentUser="currentUser" />
      </div>

      <div v-else-if="currentView === 'reviews'">
        <ReviewPage :currentUser="currentUser" />
      </div>

      <div v-else-if="currentView === 'trends'">
        <TrendPage :currentUser="currentUser" @go-checkin="navigate('selfcheck')" />
      </div>

      <div v-else-if="currentView === 'community'">
        <CommunityPage />
      </div>

      <!-- ADMIN PORTAL VIEW -->
      <div v-else-if="currentView === 'admin' && currentUser && currentUser.role === 'admin'">
        <div class="container">
          <h2 class="mb-4 text-primary">Admin System Portal</h2>
          
          <!-- Booking Approval Manager -->
          <div class="card mb-4 border-0 shadow-sm">
            <div class="card-body p-4">
              <h4 class="card-title mb-3">Consultation Booking Requests Management</h4>
              <div v-if="allBookings.length === 0" class="text-muted small">No booking requests found.</div>
              <table v-else class="table table-hover align-middle">
                <thead>
                  <tr>
                    <th>User identity</th>
                    <th>Counselor</th>
                    <th>Date & Time Slot</th>
                    <th>Priority</th>
                    <th>Reason Note</th>
                    <th>Status</th>
                    <th>Action</th>
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
                      <button v-if="b.status !== 'Approved'" @click="approveBooking(idx)" class="btn btn-success btn-sm">
                        Approve Booking
                      </button>
                      <span v-else class="text-muted small">Verified</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Account Logs -->
          <div class="card mb-4 border-0 shadow-sm">
            <div class="card-body p-4">
              <h4 class="card-title mb-3">Registered Accounts</h4>
              <table class="table table-striped">
                <thead>
                  <tr>
                    <th>User Identifier</th>
                    <th>System Role</th>
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

          <!-- Check-in Audit Logs -->
          <div class="card mb-4 border-0 shadow-sm">
            <div class="card-body p-4">
              <h4 class="card-title mb-3">User State Check-in History</h4>
              <table class="table table-striped">
                <thead>
                  <tr>
                    <th>Identity</th>
                    <th>Mood Score</th>
                    <th>Sleep Score</th>
                    <th>Stress Score</th>
                    <th>Personal Note</th>
                    <th>Entry Date</th>
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

          <!-- Rating Audit Logs -->
          <div class="card border-0 shadow-sm">
            <div class="card-body p-4">
              <h4 class="card-title mb-3">User Feedback & Rating Records</h4>
              <div v-if="allReviews.length === 0" class="text-muted small">No dynamic feedback reviews logged.</div>
              <table v-else class="table table-striped align-middle">
                <thead>
                  <tr>
                    <th>User Identity</th>
                    <th>Counselor</th>
                    <th>Score Granted</th>
                    <th>Review Feedback Text</th>
                    <th>Submission Date</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(r, idx) in allReviews" :key="idx">
                    <td>{{ r.user }}</td>
                    <td>{{ r.counselor }}</td>
                    <td><span class="text-warning">{{ '★'.repeat(r.rating) }}</span> ({{ r.rating }}/5)</td>
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
import { ref, onMounted } from 'vue';
import AuthPage from './components/AuthPage.vue';
import SelfCheckPage from './components/SelfCheckPage.vue';
import BookingPage from './components/BookingPage.vue';
import ReviewPage from './components/ReviewPage.vue';
import CommunityPage from './components/CommunityPage.vue';
import TrendPage from './components/TrendPage.vue';

const currentView = ref('home');
const currentUser = ref(null);
const allUsers = ref([]);
const allCheckins = ref([]);
const allBookings = ref([]);
const allReviews = ref([]);

const loadSession = () => {
  const logged = localStorage.getItem('currentUser');
  if (logged) {
    currentUser.value = JSON.parse(logged);
  }
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

const handleLogout = () => {
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
});
</script>