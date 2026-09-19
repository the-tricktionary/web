<template>
  <div class="container max-w-80ch mx-auto px-2 pt-4 prose">
    <h1>{{ t('policies.title') }}</h1>
    <h2>{{ t('policies.privacy.title') }}</h2>
    <i18n-t keypath="policies.privacy.controller" tag="p">
      <template #company>
        <a href="https://swantzter.se" target="_blank" rel="noopener">Swantzer</a>
      </template>
    </i18n-t>

    <p>{{ t('policies.privacy.rightsIntro') }}</p>

    <ul>
      <li>{{ t('policies.privacy.rights.access') }}</li>
      <li>{{ t('policies.privacy.rights.erase') }}</li>
      <li>{{ t('policies.privacy.rights.rectify') }}</li>
      <li>{{ t('policies.privacy.rights.restrict') }}</li>
      <li>{{ t('policies.privacy.rights.complain') }}</li>
    </ul>

    <i18n-t keypath="policies.privacy.exercise" tag="p">
      <template #email>
        <a href="mailto:contact@the-tricktionary.com">contact@the-tricktionary.com</a>
      </template>
      <template #authority>
        <a href="https://www.imy.se/other-lang/in-english/">{{ t('policies.privacy.exerciseAuthority') }}</a>
      </template>
    </i18n-t>

    <p>{{ t('policies.privacy.collectedIntro') }}</p>

    <ul>
      <li>{{ t('policies.privacy.collected.name') }}</li>
      <li>{{ t('policies.privacy.collected.email') }}</li>
      <li>{{ t('policies.privacy.collected.phone') }}</li>
      <li>{{ t('policies.privacy.collected.username') }}</li>
      <li>{{ t('policies.privacy.collected.thirdParty') }}</li>
      <li>{{ t('policies.privacy.collected.interactions') }}</li>
      <li>{{ t('policies.privacy.collected.ip') }}</li>
      <li>{{ t('policies.privacy.collected.teams') }}</li>
      <li>{{ t('policies.privacy.collected.affiliation') }}</li>
      <li>{{ t('policies.privacy.collected.addresses') }}</li>
      <li>{{ t('policies.privacy.collected.business') }}</li>
      <li>{{ t('policies.privacy.collected.businessNumber') }}</li>
      <li>{{ t('policies.privacy.collected.vatNumber') }}</li>
      <li>{{ t('policies.privacy.collected.statistics') }}</li>
    </ul>

    <i18n-t keypath="policies.privacy.errors" tag="p">
      <template #link>
        <a href="https://sentry.io/legal/dpa/4.0.0/">{{ t('policies.privacy.errorsLink') }}</a>
      </template>
    </i18n-t>

    <i18n-t keypath="policies.privacy.mux" tag="p">
      <template #link>
        <a href="https://mux.com/dpa/">{{ t('policies.privacy.muxLink') }}</a>
      </template>
    </i18n-t>

    <i18n-t keypath="policies.privacy.analytics" tag="p">
      <template #link>
        <a href="https://www.google.com/analytics/terms/">{{ t('policies.privacy.analyticsLink') }}</a>
      </template>
    </i18n-t>

    <i18n-t keypath="policies.privacy.stripe" tag="p">
      <template #link>
        <a href="https://stripe.com/en-se/privacy-center/legal">{{ t('policies.privacy.stripeLink') }}</a>
      </template>
    </i18n-t>

    <p>{{ t('policies.privacy.purposesIntro') }}</p>

    <ul>
      <li>{{ t('policies.privacy.purposes.improve') }}</li>
      <li>{{ t('policies.privacy.purposes.relationship') }}</li>
      <li>{{ t('policies.privacy.purposes.account') }}</li>
      <li>{{ t('policies.privacy.purposes.abuse') }}</li>
      <li>{{ t('policies.privacy.purposes.password') }}</li>
      <li>{{ t('policies.privacy.purposes.support') }}</li>
      <li>{{ t('policies.privacy.purposes.orders') }}</li>
      <li>{{ t('policies.privacy.purposes.compliance') }}</li>
      <li>{{ t('policies.privacy.purposes.phone') }}</li>
    </ul>

    <p>{{ t('policies.privacy.transfers') }}</p>

    <p>{{ t('policies.privacy.lawfulBasis') }}</p>

    <p>{{ t('policies.privacy.specialCategory') }}</p>

    <p>{{ t('policies.privacy.retention') }}</p>

    <p>{{ t('policies.privacy.changes') }}</p>

    <h2>{{ t('policies.cookies.title') }}</h2>

    <p>{{ t('policies.cookies.body') }}</p>

    <h2>{{ t('policies.returns.title') }}</h2>

    <p>{{ t('policies.returns.body') }}</p>

    <h2>{{ t('policies.disclaimer.title') }}</h2>

    <p>{{ t('policies.disclaimer.data') }}</p>

    <p>{{ t('policies.disclaimer.timing') }}</p>

    <i18n-t keypath="policies.disclaimer.copyright" tag="p">
      <template #link>
        <a href="https://github.com/the-tricktionary">{{ t('policies.disclaimer.copyrightLink') }}</a>
      </template>
    </i18n-t>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>
