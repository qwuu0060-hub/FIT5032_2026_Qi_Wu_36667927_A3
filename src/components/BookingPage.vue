<template>
  <div class="container my-5">
    <div class="row justify-content-center">
      <div class="col-md-8">
        <div class="card shadow-sm border-0">
          <div class="card-body p-4">
            <h3 class="mb-4">Book a Consultation Session</h3>
            
            <div v-if="errorMsg" class="alert alert-danger">{{ errorMsg }}</div>
            <div v-if="successMsg" class="alert alert-success">{{ successMsg }}</div>

            <form @submit.prevent="handleBooking">
              <div class="mb-3">
                <label class="form-label">Choose Counselor</label>
                <select class="form-select" v-model="counsellor">
                  <option value="">Select a professional...</option>
                  <option value="Dr. Li">Dr. Li</option>
                  <option value="Sarah Zhang">Sarah Zhang</option>
                  <option value="David Wang">David Wang</option>
                </select>
              </div>

              <div class="mb-3">
                <label class="form-label">Preferred Date</label>
                <input 
                  :type="dateInputType" 
                  placeholder="mm/dd/yyyy" 
                  @focus="dateInputType = 'date'" 
                  @blur="!bookingDate && (dateInputType = 'text')"
                  class="form-control" 
                  v-model="bookingDate" 
                  :min="minDate" 
                />
              </div>

              <div class="mb-3">
                <label class="form-label">Time Slot</label>
                <select class="form-select" v-model="timeSlot">
                  <option value="">Select a time...</option>
                  <option value="09:00 AM - 10:00 AM">09:00 AM - 10:00 AM</option>
                  <option value="11:00 AM - 12:00 PM">11:00 AM - 12:00 PM</option>
                  <option value="02:00 PM - 03:00 PM">02:00 PM - 03:00 PM</option>
                  <option value="04:00 PM - 05:00 PM">04:00 PM - 05:00 PM</option>
                </select>
              </div>

              <div class="mb-3">
                <label class="form-label">Urgency Priority</label>
                <select class="form-select" v-model="priority">
                  <option value="Low">Low - Routine check-in</option>
                  <option value="Medium">Medium - Experiencing notable distress</option>
                  <option value="High">High - Urgent support required</option>
                </select>
              </div>

              <div class="mb-3">
                <label class="form-label">Reason for Consultation (Optional)</label>
                <textarea class="form-control" rows="3" v-model="reason"></textarea>
              </div>

              <button type="submit" class="btn btn-primary w-100">Confirm Appointment Request</button>
            </form>

            <hr class="my-4" />

            <h4 class="mb-3">My Scheduled Sessions</h4>
            <div v-if="myBookings.length === 0" class="text-muted small">
              You have no appointments scheduled yet.
            </div>
            <div v-else class="table-responsive">
              <table class="table align-middle">
                <thead>
                  <tr>
                    <th>Counselor</th>
                    <th>Date & Time</th>
                    <th>Priority</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(b, idx) in myBookings" :key="idx">
                    <td>{{ b.counsellor }}</td>
                    <td>{{ b.date }} ({{ b.time }})</td>
                    <td>
                      <span :class="['badge', b.priority === 'High' ? 'bg-danger' : b.priority === 'Medium' ? 'bg-warning text-dark' : 'bg-secondary']">
                        {{ b.priority }}
                      </span>
                    </td>
                    <td>
                      <span :class="['badge', b.status === 'Approved' ? 'bg-success' : 'bg-warning text-dark']">
                        {{ b.status }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
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

const counsellor = ref('');
const bookingDate = ref('');
const timeSlot = ref('');
const priority = ref('Low');
const reason = ref('');
const errorMsg = ref('');
const successMsg = ref('');
const myBookings = ref([]);
const dateInputType = ref('text');

const minDate = new Date().toISOString().split('T')[0];

const loadBookings = () => {
  const all = JSON.parse(localStorage.getItem('bookings') || '[]');
  const email = props.currentUser ? props.currentUser.email : 'Anonymous';
  myBookings.value = all.filter(b => b.user === email);
};

onMounted(() => {
  loadBookings();
});

const handleBooking = () => {
  errorMsg.value = '';
  successMsg.value = '';

  if (!counsellor.value || !bookingDate.value || !timeSlot.value) {
    errorMsg.value = 'Please select counselor, date, and time slot.';
    return;
  }

  const all = JSON.parse(localStorage.getItem('bookings') || '[]');

  const isConflict = all.some(b => 
    b.counsellor === counsellor.value && 
    b.date === bookingDate.value && 
    b.time === timeSlot.value && 
    b.status === 'Approved'
  );

  if (isConflict) {
    errorMsg.value = 'This specific time slot has already been booked and approved. Please choose another time or counselor.';
    return;
  }

  const newBooking = {
    user: props.currentUser ? props.currentUser.email : 'Anonymous',
    counsellor: counsellor.value,
    date: bookingDate.value,
    time: timeSlot.value,
    priority: priority.value,
    reason: reason.value,
    status: 'Pending Verification'
  };

  all.unshift(newBooking);
  localStorage.setItem('bookings', JSON.stringify(all));

  successMsg.value = 'Appointment request submitted successfully!';
  counsellor.value = '';
  bookingDate.value = '';
  timeSlot.value = '';
  priority.value = 'Low';
  reason.value = '';
  dateInputType.value = 'text';

  loadBookings();
};
</script>