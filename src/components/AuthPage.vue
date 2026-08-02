<template>
  <div class="container my-5">
    <div class="row justify-content-center">
      <div class="col-md-6 col-lg-5">
        <div class="card shadow border-0 rounded-3">
          <div class="card-body p-4">
            <h2 class="text-center mb-4 fw-bold">{{ isLogin ? 'Login' : 'Register' }}</h2>
            
            <div v-if="errorMessage" class="alert alert-danger alert-dismissible fade show" role="alert">
              {{ errorMessage }}
              <button type="button" class="btn-close" @click="errorMessage = ''"></button>
            </div>
            <div v-if="successMessage" class="alert alert-success alert-dismissible fade show" role="alert">
              {{ successMessage }}
              <button type="button" class="btn-close" @click="successMessage = ''"></button>
            </div>

            <form @submit.prevent="handleSubmit" novalidate>
              <div class="mb-3">
                <label class="form-label fw-semibold">Email address</label>
                <input 
                  type="email" 
                  class="form-control" 
                  :class="getFieldClass('email')"
                  v-model.trim="email" 
                  @blur="touchField('email')"
                  placeholder="name@example.com"
                />
                <div class="invalid-feedback">{{ errors.email }}</div>
              </div>

              <div class="mb-3">
                <label class="form-label fw-semibold">Password</label>
                <div class="input-group">
                  <input 
                    :type="showPassword ? 'text' : 'password'" 
                    class="form-control" 
                    :class="getFieldClass('password')"
                    v-model="password" 
                    @blur="touchField('password')"
                    placeholder="Enter password"
                  />
                  <button 
                    class="btn btn-outline-secondary" 
                    type="button" 
                    @click="showPassword = !showPassword"
                  >
                    {{ showPassword ? 'Hide' : 'Show' }}
                  </button>
                  <div class="invalid-feedback">{{ errors.password }}</div>
                </div>

                <div v-if="!isLogin && password" class="password-rules mt-2 p-2 rounded bg-light border">
                  <small class="d-block fw-semibold text-secondary mb-1">Password requirements:</small>
                  <ul class="list-unstyled mb-0 small">
                    <li :class="passRules.length ? 'text-success' : 'text-danger'">
                      {{ passRules.length ? '✓' : '✕' }} 8-12 characters
                    </li>
                    <li :class="passRules.letter ? 'text-success' : 'text-danger'">
                      {{ passRules.letter ? '✓' : '✕' }} Contains at least one letter
                    </li>
                    <li :class="passRules.number ? 'text-success' : 'text-danger'">
                      {{ passRules.number ? '✓' : '✕' }} Contains at least one number
                    </li>
                    <li :class="passRules.special ? 'text-success' : 'text-danger'">
                      {{ passRules.special ? '✓' : '✕' }} Contains at least one special character
                    </li>
                  </ul>
                </div>
              </div>

              <div v-if="!isLogin" class="mb-3">
                <label class="form-label fw-semibold">Confirm Password</label>
                <div class="input-group">
                  <input 
                    :type="showConfirmPassword ? 'text' : 'password'" 
                    class="form-control" 
                    :class="getFieldClass('confirmPassword')"
                    v-model="confirmPassword" 
                    @blur="touchField('confirmPassword')"
                    placeholder="Re-enter password"
                  />
                  <button 
                    class="btn btn-outline-secondary" 
                    type="button" 
                    @click="showConfirmPassword = !showConfirmPassword"
                  >
                    {{ showConfirmPassword ? 'Hide' : 'Show' }}
                  </button>
                  <div class="invalid-feedback">{{ errors.confirmPassword }}</div>
                </div>
              </div>

              <div v-if="!isLogin" class="mb-3">
                <label class="form-label fw-semibold">Role</label>
                <select class="form-select" v-model="role">
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div v-if="!isLogin" class="mb-3 form-check">
                <input 
                  type="checkbox" 
                  class="form-check-input" 
                  :class="{'is-invalid': touched.consent && errors.consent}"
                  id="consent" 
                  v-model="consent" 
                  @change="touchField('consent')"
                />
                <label class="form-check-label" for="consent">
                  I agree to the privacy terms
                </label>
                <div class="invalid-feedback">{{ errors.consent }}</div>
              </div>

              <button type="submit" class="btn btn-primary w-100 mb-3 fw-semibold py-2">
                {{ isLogin ? 'Login' : 'Register' }}
              </button>
            </form>

            <div class="text-center">
              <button @click="toggleMode" class="btn btn-link text-decoration-none p-0">
                {{ isLogin ? "Don't have an account? Register" : 'Already have an account? Login' }}
              </button>
            </div>

            <hr class="my-4" />

            <div class="text-center">
              <button @click="handleAnonymous" class="btn btn-outline-secondary w-100">
                Continue Anonymously
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';

const emit = defineEmits(['auth-success']);

const isLogin = ref(true);
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const role = ref('user');
const consent = ref(false);

const showPassword = ref(false);
const showConfirmPassword = ref(false);
const errorMessage = ref('');
const successMessage = ref('');

const touched = reactive({
  email: false,
  password: false,
  confirmPassword: false,
  consent: false
});

const touchField = (field) => {
  touched[field] = true;
};

const validateEmail = (val) => {
  if (!val) return 'Email address is required.';
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(val)) return 'Please enter a valid email address (e.g. name@domain.com).';
  return '';
};

const passRules = computed(() => {
  const val = password.value || '';
  return {
    length: val.length >= 8 && val.length <= 12,
    letter: /[a-zA-Z]/.test(val),
    number: /[0-9]/.test(val),
    special: /[^a-zA-Z0-9]/.test(val)
  };
});

const validatePassword = (val) => {
  if (!val) return 'Password is required.';
  if (!isLogin.value) {
    if (!passRules.value.length) return 'Password must be between 8 and 12 characters.';
    if (!passRules.value.letter || !passRules.value.number || !passRules.value.special) {
      return 'Password must contain letters, numbers, and special characters.';
    }
  }
  return '';
};

const validateConfirmPassword = (val) => {
  if (!isLogin.value) {
    if (!val) return 'Please confirm your password.';
    if (val !== password.value) return 'Passwords do not match.';
  }
  return '';
};

const validateConsent = (val) => {
  if (!isLogin.value && !val) {
    return 'You must agree to the privacy terms before registering.';
  }
  return '';
};

const errors = computed(() => ({
  email: validateEmail(email.value),
  password: validatePassword(password.value),
  confirmPassword: validateConfirmPassword(confirmPassword.value),
  consent: validateConsent(consent.value)
}));

const isFormValid = computed(() => {
  if (isLogin.value) {
    return !errors.value.email && !errors.value.password;
  }
  return !errors.value.email && 
         !errors.value.password && 
         !errors.value.confirmPassword && 
         !errors.value.consent;
});

const getFieldClass = (field) => {
  if (!touched[field]) return '';
  return errors.value[field] ? 'is-invalid' : 'is-valid';
};

const toggleMode = () => {
  isLogin.value = !isLogin.value;
  resetForm();
};

const resetForm = () => {
  email.value = '';
  password.value = '';
  confirmPassword.value = '';
  role.value = 'user';
  consent.value = false;
  errorMessage.value = '';
  successMessage.value = '';
  
  Object.keys(touched).forEach(key => touched[key] = false);
};

const handleSubmit = () => {
  Object.keys(touched).forEach(key => touched[key] = true);
  errorMessage.value = '';
  successMessage.value = '';

  if (!isFormValid.value) {
    errorMessage.value = 'Please correct the highlighted errors in the form.';
    return;
  }

  const users = JSON.parse(localStorage.getItem('users') || '[]');

  if (isLogin.value) {
    const user = users.find(u => u.email === email.value && u.password === password.value);
    if (!user) {
      errorMessage.value = 'Invalid email or password.';
      return;
    }
    emit('auth-success', { email: user.email, role: user.role, isAnonymous: false });
  } else {
    const exists = users.some(u => u.email === email.value);
    if (exists) {
      errorMessage.value = 'This email is already registered. Please login or use a different email.';
      return;
    }

    users.push({
      email: email.value,
      password: password.value,
      role: role.value
    });
    localStorage.setItem('users', JSON.stringify(users));
    
    successMessage.value = 'Registration successful! You can now login.';
    isLogin.value = true;
    resetForm();
  }
};

const handleAnonymous = () => {
  emit('auth-success', { email: 'Anonymous', role: 'user', isAnonymous: true });
};
</script>

<style scoped>
.password-rules {
  font-size: 0.85rem;
}
</style>