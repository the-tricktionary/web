<template>
  <h1 class="mx-auto text-center mt-8">Sign in / Sign up</h1>
  <div class="mx-auto container mt-2 px-2 flex flex-col md:flex-row justify-center items-center">
    <form @submit.prevent="logInWithProvider('google')" class="w-full md:max-w-80 mb-4">
      <h2 class="text-lg font-semibold">Sign in/sign up with external accounts</h2>
      <input type="submit" value="Sign in with Google" class="btn">
      <p class="text-ttred-900" v-if="socialErr">
          Failed to log in with error: "{{ socialErr }}". Please try again,
          if this error persists please <a href="mailto:contact@the-tricktionary.com">contact us</a>
        </p>
    </form>
    <div class="hidden md:block w-full md:w-0 md:h-48 md:border-b-0 md:border-r border-gray-300 m-4" ></div>
    <div class="w-full md:max-w-80">
      <form @submit.prevent="sendEmailLink()" class="mb-4">
        <h2 class="text-lg font-semibold">Sign in/sign up with email</h2>
        <input type="email" :disabled="email.linkSent" v-model="email.email" aria-label="Email" required placeholder="Email" class="w-full block rounded focus:border-b-ttred-900" >
        <input type="submit" :disabled="email.linkSent" value="Send magic link" class="btn">
        <p class="text-ttred-900" v-if="email.error">
          Failed to log in with error: "{{ email.error }}". Please try again,
          if this error persists please <a href="mailto:contact@the-tricktionary.com">contact us</a>
        </p>
      </form>
      <!-- <form @submit.prevent="sendSMSCode()" >
        <h2 class="text-lg font-semibold">Sign in/sign up with SMS</h2>
        <p>Phone number including country code, e.g +46 123 456 78 90</p>
        <input type="tel" v-model="phone.phoneNumber" aria-label="Phone number" required placeholder="Phone number" class="w-full block rounded focus:border-b-ttred-900" >
        <input type="submit" value="Send verification code" class="btn">
        <p class="text-ttred-900" v-if="phone.error">
          Failed to log in with error: "{{ phone.error }}". Please try again,
          if this error persists please <a href="mailto:contact@the-tricktionary.com">contact us</a>
        </p>
      </form> -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { getAnalytics, logEvent } from '@firebase/analytics'
import { getAuth, GoogleAuthProvider, isSignInWithEmailLink, sendSignInLinkToEmail, signInWithEmailLink, signInWithPopup } from '@firebase/auth'
import { onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import useAuth from '../hooks/useAuth'

const auth = getAuth()
const { firebaseUser: user } = useAuth()
const router = useRouter()
const analytics = getAnalytics()

const phone = reactive({
  phoneNumber: '',
  code: '',
  codeSent: false,
  error: null
})

const email = reactive({
  email: '',
  linkSent: false,
  error: null
})

const socialErr = ref<string | null>(null)

watch(user, newUser => {
  if (newUser) {
    router.replace('/profile')
  }
})

const providers = {
  google: new GoogleAuthProvider()
}

async function logInWithProvider (providerId: keyof typeof providers) {
  try {
    logEvent(analytics, 'login', { method: providerId })
    socialErr.value = null
    await signInWithPopup(auth, providers[providerId])
  } catch (err) {
    socialErr.value = err.code
    throw err
  }
}

async function sendEmailLink () {
  try {
    email.error = null
    await sendSignInLinkToEmail(auth, email.email, {
      url: `${window.location.origin}/auth?email=${email.email}`,
      handleCodeInApp: true
    })
  } catch (err) {
    email.error = err.code
    throw err
  }
}

// async function sendSMSCode () {
//   try {
//     phone.error = null
//     await signInWithPhoneNumber(auth, phone.phoneNumber)
//   } catch (err) {
//     phone.error = err.message
//     throw err
//   }
// }

onMounted(() => {
  if (isSignInWithEmailLink(auth, window.location.href)) {
    const params = new URLSearchParams(window.location.search)
    const emailParam = params.get('email')
    try {
      if (!emailParam) throw new Error('No email provided in magic link')
      logEvent(analytics, 'login', { method: 'magic_link' })
      signInWithEmailLink(auth, emailParam, window.location.href)
    } catch (err) {
      email.error = err.code ?? err.message
      throw err
    }
  }
})
</script>
