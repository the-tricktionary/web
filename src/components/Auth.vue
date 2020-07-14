<template>
  <div class="auth" v-if="!uid">
    <form
      class="inputgroup"
      @submit.prevent="signIn('emailpassword', { email: $store.state.users.signInEmail })"
    >
      <label>
        Email
        <input
          type="email"
          placeholder="Email"
          required
          :disabled="disabledFields.email"
          @input="$store.commit('users/setSignInEmail', { value: $event.target.value })"
          :value="$store.state.users.signInEmail"
        />
      </label>
      <!-- <label>
        Password
        <input type="password" placeholder="Password" required v-model="password" />
      </label>-->
      <button
        type="submit"
        :disabled="!$store.state.users.signInEmail || disabledFields.emailButton"
      >Send Magic Sign In Link to Email</button>
    </form>
    <div class="divider">or</div>
    <form
      class="inputgroup"
      @submit.prevent="signIn('phone', { phone: $store.state.users.signInPhoneNumber, phoneCode })"
    >
      <label>
        Phone Number
        <br />
        <span
          class="small"
        >(Starts with a plus, i.e. your country code +46 for Sweden, +1 for US, Canada etc.)</span>
        <vue-tel-input
          v-bind="phoneProps"
          @input="phoneNumberInput"
          :value="$store.state.users.signInPhoneNumberFormatted"
        >
          <template v-slot:arrow-icon>&nbsp;</template>
        </vue-tel-input>
      </label>
      <label v-if="!disabledFields.verificationCode">
        Verification Code
        <input
          type="text"
          placeholder="Verification Code"
          required
          v-model="phoneCode"
        />
      </label>
      <button
        type="submit"
        :disabled="!$store.state.users.signInPhoneNumber"
        id="captcha-button"
        v-show="!disabledFields.phoneNumber"
      >Send Verification Code</button>
      <button type="submit" :disabled="!phoneCode" v-if="!disabledFields.verificationCode">Sign In</button>
    </form>
    <div class="divider">or</div>
    <div class="inputgroup">
      <button
        v-for="provider in socialProviders"
        :key="provider.name"
        @click="signIn('social', { socialProvider: provider.provider })"
      >
        <font-awesome-icon :icon="provider.icon" />
        &nbsp; Sign In With {{ provider.name }}
      </button>
    </div>
  </div>
  <div v-else>
    <button @click="signOut()">Sign Out</button>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import firebase, { FirebaseError } from 'firebase/app'
import { VueTelInput } from 'vue-tel-input'

import 'firebase/auth'

interface AuthDetails {
  email?: string;
  password?: string;

  phone?: string;
  phoneCode?: string;

  socialProvider?: firebase.auth.AuthProvider;
}

interface Fields {
  email: boolean;
  emailButton: boolean;
  phoneNumber: boolean;
  verificationCode: boolean;
  sendVerificationCodeButton: boolean;
}

interface SocialProivder {
  name: string;
  icon: string | string[];
  provider: firebase.auth.AuthProvider;
}

@Component({
  components: {
    VueTelInput
  }
})
export default class Auth extends Vue {
  disabledFields: Fields = {
    email: false,
    emailButton: false,
    phoneNumber: false,
    verificationCode: true,
    sendVerificationCodeButton: false
  };

  phoneProps = {
    defaultCountry: 'US',
    placeholder: 'Phone number',
    required: true,
    enabledFlags: true,
    name: 'phone',
    maxLen: 25,
    wrapperClasses: 'input'
  };

  socialProviders: SocialProivder[] = [
    {
      name: 'Google',
      icon: ['fab', 'google'],
      provider: new firebase.auth.GoogleAuthProvider()
    }
    // {
    //   name: "Facebook",
    //   icon: ["fab", "facebook-f"],
    //   provider: new firebase.auth.FacebookAuthProvider()
    // }
    // {
    //   name: "twitter",
    //   icon: ["fab", "twittter"],
    //   provider: new firebase.auth.TwitterAuthProvider()
    // },
    // {
    //   name: 'GitHub',
    //   icon: ['fab', 'github'],
    //   provider: new firebase.auth.GithubAuthProvider()
    // },
    // {
    //   name: "Microsoft",
    //   icon: ["fab", "microsoft"],
    //   provider: new firebase.auth.OAuthProvider('microsoft.com')
    // },
    // {
    //   name: "Yahoo",
    //   icon: ["fab", "yahoo"],
    //   provider: new firebase.auth.OAuthProvider('yahoo.com')
    // }
  ];

  phoneCode: string = '';
  confirmationResult: any;

  get uid () {
    return this.$route.params.uid || this.$store.state.users.currentUser
  }

  phoneNumberInput (num: string, details: any) {
    this.$store.commit('users/setSignInPhoneNumber', {
      value: details.number.e164,
      formatted: num
    })
  }

  authError (error: string) {
    throw new Error(error)
  }

  authInfo (msg: string) {
    console.log(msg)
  }

  signOut () {
    firebase.auth().signOut()
  }

  signIn (
    method: string,
    { email, phone, phoneCode, socialProvider }: AuthDetails
  ) {
    switch (method) {
      case 'emailpassword':
        this.singInWithEmailLink(email)
        break
      case 'phone':
        this.signInWithPhone(phone, phoneCode)
        break
      case 'social':
        this.signInWithSocial(socialProvider)
        break
    }
  }

  singInWithEmailLink (email?: string) {
    if (!email) this.authError('Please enter an email address')

    firebase
      .auth()
      .sendSignInLinkToEmail(email || '', {
        url: 'https://localhost:8081/profile',
        handleCodeInApp: true
        // android: {
        //   packageName: 'trictionary.jumproper.com.jumpropetrictionary',
        //   installApp: true,
        //   minimumVersion: '10000'
        // },
        // iOS: {
        //   bundleId: 'cz.pixmo.tricktionary'
        // }
      })
      .then(() => {
        this.authInfo(
          `We've sent an email with a link to ${this.$store.state.users.signInEmail}, click the link in the email to sign in`
        )
        this.disabledFields.email = true
        this.disabledFields.emailButton = true
      })
      .catch((error: FirebaseError): void => {
        console.log(error)
        this.authError('Could not send an email link, error:' + error.code)
      })
  }

  signInWithPhone (phone?: string, code?: string) {
    if (!phone) {
      this.authError('Please enter a phone number')
    }
    if (!code) {
      firebase
        .auth()
        .signInWithPhoneNumber(phone || '', (window as any).recaptchaVerifier)
        .then((confirmationResult: any): void => {
          this.authInfo(
            `We've sent a verification code to ${this.$store.state.users.signInPhoneNumberFormatted}, enter it to sign in`
          )
          this.disabledFields.phoneNumber = true
          this.disabledFields.verificationCode = false
          this.confirmationResult = confirmationResult
        })
        .catch((error: FirebaseError): void => {
          console.log(error)
          this.authError(
            'Could not send a phone verification code link, error:' + error.code
          );
          (window as any).recaptchaVerifier.render().then((widgetId: any) => {
            (window as any).grecaptcha.reset(widgetId)
          })
        })
    } else if (this.confirmationResult) {
      this.confirmationResult
        .confirm(code)
        .then(() => {
          console.log('success')
        })
        .catch((error: FirebaseError): void => {
          this.authError('Could not log in, error:' + error.code)
        })
    }
  }

  signInWithSocial (provider?: firebase.auth.AuthProvider) {
    if (!provider) return
    firebase
      .auth()
      .signInWithPopup(provider)
      .then(() => {
        console.log('success')
      })
      .catch((error: FirebaseError): void => {
        this.authError('Could not log in, error:' + error.code)
      })
  }

  mounted () {
    if (firebase.auth().isSignInWithEmailLink(window.location.href)) {
      let email = this.$store.state.users.signInEmail
      if (!email) {
        email = window.prompt('Please provide your email for confirmation')
      }

      firebase
        .auth()
        .signInWithEmailLink(email, window.location.href)
        .then(result => {
          console.log('success')
        })
        .catch(error => {
          this.authError('Could not log in, error:' + error.code)
        })
    }

    // Start Firebase invisible reCAPTCHA verifier
    (window as any).recaptchaVerifier = new firebase.auth.RecaptchaVerifier(
      'captcha-button',
      {
        size: 'invisible',
        callback: () =>
          this.signInWithPhone(this.$store.state.users.signInPhoneNumber)
      }
    );

    (window as any).recaptchaVerifier.render().then((widgetId: string) => {
      (window as any).recaptchaWidgetId = widgetId
    })
  }
}
</script>

<style scoped>
.auth {
  max-width: var(--content-max-width);
  margin: auto;
  padding: 0.5em;
}

.input {
  border-color: var(--l-grey) !important;
}

.input:focus,
.input:focus-within {
  outline: none;
  box-shadow: none !important;
  border-color: var(--l-grey) !important;
  border-bottom-color: var(--d-yellow) !important;
}

.input .dropdown {
  padding: 0;
  padding-left: 7px;
}

.divider {
  margin: auto;
  margin-top: 1em;
  margin-bottom: 1em;
  width: 2em;
  position: relative;
  text-align: center;
}

.divider:before,
.divider:after {
  content: " ";
  border-bottom: 1px solid var(--l-grey);
  position: absolute;
  width: 100%;
  top: 50%;
}

.divider:before {
  right: 100%;
}

.divider:after {
  left: 100%;
}
</style>
