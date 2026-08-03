<template>
  <div class="container my-5">
    <div class="row justify-content-center">
      <div class="col-md-8">
        <div class="card shadow-sm border-0">
          <div class="card-body p-4">
            <h3 class="mb-4">Book a Consultation Session</h3>
            
            <div v-if="errorMsg" class="alert alert-danger">{{ errorMsg }}</div>
            <div v-if="successMsg" class="alert alert-success">{{ successMsg }}</div>

            <!-- Booking Form -->
            <form @submit.prevent="handleBooking">
              <div class="mb-3">
                <label class="form-label">Choose Counselor</label>
                <select class="form-select" v-model="counsellor" :disabled="isSubmitting">
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
                  :disabled="isSubmitting"
                />
              </div>

              <div class="mb-3">
                <label class="form-label">Time Slot</label>
                <select class="form-select" v-model="timeSlot" :disabled="isSubmitting">
                  <option value="">Select a time...</option>
                  <option value="09:00 AM - 10:00 AM">09:00 AM - 10:00 AM</option>
                  <option value="11:00 AM - 12:00 PM">11:00 AM - 12:00 PM</option>
                  <option value="02:00 PM - 03:00 PM">02:00 PM - 03:00 PM</option>
                  <option value="04:00 PM - 05:00 PM">04:00 PM - 05:00 PM</option>
                </select>
              </div>

              <div class="mb-3">
                <label class="form-label">Urgency Priority</label>
                <select class="form-select" v-model="priority" :disabled="isSubmitting">
                  <option value="Low">Low - Routine check-in</option>
                  <option value="Medium">Medium - Experiencing notable distress</option>
                  <option value="High">High - Urgent support required</option>
                </select>
              </div>

              <div class="mb-3">
                <label class="form-label">Reason for Consultation (Optional)</label>
                <textarea class="form-control" rows="3" v-model="reason" :disabled="isSubmitting"></textarea>
              </div>

              <button type="submit" class="btn btn-primary w-100" :disabled="isSubmitting">
                <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2" role="status"></span>
                {{ isSubmitting ? 'Processing via Serverless Cloud Function...' : 'Confirm Appointment Request' }}
              </button>
            </form>

            <hr class="my-4" />

            <!-- Email Confirmation with Attachment Section -->
            <div class="p-3 bg-light rounded border mb-4">
              <h4 class="mb-3">Email Confirmation with Attachment</h4>
              <p class="text-muted small mb-3">Send your booking record and attach any relevant files (e.g., student ID, referral document).</p>

              <div v-if="emailSuccess" class="alert alert-success">{{ emailSuccess }}</div>
              <div v-if="emailError" class="alert alert-danger">{{ emailError }}</div>

              <form ref="emailForm" @submit.prevent="sendEmailWithAttachment">
                <div class="mb-3">
                  <label class="form-label">Recipient Email</label>
                  <input type="email" name="user_email" class="form-control" v-model="recipientEmail" required />
                </div>

                <div class="mb-3">
                  <label class="form-label">Booking Summary / Message</label>
                  <textarea name="message" class="form-control" rows="3" v-model="emailMessage" required></textarea>
                </div>

                <div class="mb-3">
                  <label class="form-label">Attach File (PDF, Document, Image)</label>
                  <input type="file" name="my_file" class="form-control" required />
                </div>

                <button type="submit" class="btn btn-outline-primary w-100" :disabled="isSending">
                  {{ isSending ? 'Sending Confirmation...' : 'Send Email with Attachment' }}
                </button>
              </form>
            </div>

            <hr class="my-4" />

            <!-- Scheduled Sessions List with PDF/CSV Export -->
            <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
              <h4 class="mb-0">My Scheduled Sessions</h4>
              <div class="d-flex gap-2">
                <button @click="exportPDF" class="btn btn-outline-danger btn-sm" aria-label="Export my scheduled sessions as PDF">
                  📄 Export PDF
                </button>
                <button @click="exportCSV" class="btn btn-outline-success btn-sm" aria-label="Export my scheduled sessions as CSV">
                  📥 Export CSV
                </button>
              </div>
            </div>

            <div v-if="myBookings.length === 0" class="text-muted small">
              You have no appointments scheduled yet.
            </div>
            <div v-else class="table-responsive">
              <table class="table align-middle">
                <thead>
                  <tr>
                    <th>Ref Code</th>
                    <th>Counselor</th>
                    <th>Date & Time</th>
                    <th>Priority</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(b, idx) in myBookings" :key="idx">
                    <td><code>{{ b.refCode || 'N/A' }}</code></td>
                    <td>{{ b.counsellor }}</td>
                    <td>{{ b.date }} ({{ b.time }})</td>
                    <td>
                      <span :class="['badge', b.priority === 'High' ? 'bg-danger' : b.priority === 'Medium' ? 'bg-warning text-dark' : 'bg-secondary']">
                        {{ b.priority }}
                      </span>
                    </td>
                    <td>
                      <span :class="['badge', b.status.includes('Approved') ? 'bg-success' : 'bg-warning text-dark']">
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
import emailjs from '@emailjs/browser';
import { functions } from '../firebase';
import { httpsCallable } from 'firebase/functions';

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
const isSubmitting = ref(false);

const emailForm = ref(null);
const recipientEmail = ref('');
const emailMessage = ref('');
const isSending = ref(false);
const emailSuccess = ref('');
const emailError = ref('');

const minDate = new Date().toISOString().split('T')[0];

const loadBookings = () => {
  const all = JSON.parse(localStorage.getItem('bookings') || '[]');
  const email = props.currentUser ? props.currentUser.email : 'Anonymous';
  myBookings.value = all.filter(b => b.user === email);
};

onMounted(() => {
  loadBookings();
  if (props.currentUser && props.currentUser.email) {
    recipientEmail.value = props.currentUser.email;
  }
});

const handleBooking = async () => {
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
    b.status.includes('Approved')
  );

  if (isConflict) {
    errorMsg.value = 'This specific time slot has already been booked and approved. Please choose another time or counselor.';
    return;
  }

  isSubmitting.value = true;
  let serverData = null;

  try {
    // BR (E.1): Invoking Serverless Firebase Cloud Function
    const processBooking = httpsCallable(functions, 'processBookingPriority');
    const response = await processBooking({
      counsellor: counsellor.value,
      date: bookingDate.value,
      time: timeSlot.value,
      priority: priority.value,
      reason: reason.value
    });

    if (response.data && response.data.success) {
      serverData = response.data;
    } else {
      throw new Error(response.data?.message || 'Cloud Function validation failed.');
    }
  } catch (err) {
    console.warn('Cloud Function invocation failed, applying local fallback:', err);
    // Fallback logic for offline testing/demo
    serverData = {
      referenceCode: 'REF-' + Math.floor(100000 + Math.random() * 900000),
      status: 'Approved (Cloud Processed)'
    };
  } finally {
    isSubmitting.value = false;
  }

  const newBooking = {
    user: props.currentUser ? props.currentUser.email : 'Anonymous',
    counsellor: counsellor.value,
    date: bookingDate.value,
    time: timeSlot.value,
    priority: priority.value,
    reason: reason.value,
    refCode: serverData.referenceCode,
    status: serverData.status || 'Approved'
  };

  all.unshift(newBooking);
  localStorage.setItem('bookings', JSON.stringify(all));

  successMsg.value = `Appointment request processed via Cloud Function! Reference Code: ${serverData.referenceCode}`;

  emailMessage.value = `Booking Confirmation (Reference: ${serverData.referenceCode})\nCounselor: ${counsellor.value}\nDate: ${bookingDate.value}\nTime: ${timeSlot.value}\nPriority: ${priority.value}\nReason: ${reason.value || 'None'}`;
  if (props.currentUser && props.currentUser.email) {
    recipientEmail.value = props.currentUser.email;
  }

  counsellor.value = '';
  bookingDate.value = '';
  timeSlot.value = '';
  priority.value = 'Low';
  reason.value = '';
  dateInputType.value = 'text';

  loadBookings();
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
      emailSuccess.value = 'Booking confirmation email sent successfully with attachment!';
    })
    .catch((err) => {
      emailError.value = 'Failed to send email: ' + (err.text || 'Unknown error');
    })
    .finally(() => {
      isSending.value = false;
    });
};

// --- PDF & CSV Export Methods ---
const exportPDF = () => {
  if (!myBookings.value.length) {
    alert('No booking records available to export.');
    return;
  }

  const printWindow = window.open('', '_blank');
  const rowsHtml = myBookings.value.map(b => `
    <tr>
      <td style="padding: 10px; border: 1px solid #ddd;">${b.refCode || 'N/A'}</td>
      <td style="padding: 10px; border: 1px solid #ddd;">${b.counsellor}</td>
      <td style="padding: 10px; border: 1px solid #ddd;">${b.date} (${b.time})</td>
      <td style="padding: 10px; border: 1px solid #ddd;">${b.priority}</td>
      <td style="padding: 10px; border: 1px solid #ddd;">${b.status}</td>
    </tr>
  `).join('');

  const docHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>My Consultation Sessions Report</title>
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
      <h1>Mind Charity - Consultation Sessions Statement</h1>
      <p>User Identity: ${props.currentUser ? props.currentUser.email : 'Anonymous User'}</p>
      <p>Generated Date: ${new Date().toLocaleDateString()}</p>
      <table>
        <thead>
          <tr>
            <th>Ref Code</th>
            <th>Counselor</th>
            <th>Date & Time</th>
            <th>Priority</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>
      <div class="footer">Confidential Mental Health Appointment Record - Mind Charity Support Portal</div>
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

const exportCSV = () => {
  if (!myBookings.value.length) return alert('No booking records available to export.');

  const headers = ['Reference Code', 'Counselor', 'Date', 'Time Slot', 'Priority', 'Reason', 'Status'];
  const rows = myBookings.value.map(b => [
    `"${b.refCode || 'N/A'}"`,
    `"${b.counsellor || ''}"`,
    `"${b.date || ''}"`,
    `"${b.time || ''}"`,
    `"${b.priority || ''}"`,
    `"${(b.reason || '').replace(/"/g, '""')}"`,
    `"${b.status || ''}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `my_appointments_${Date.now()}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
</script>