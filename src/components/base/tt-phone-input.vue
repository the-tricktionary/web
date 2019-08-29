<template>
  <!-- Based on https://github.com/EducationLink/vue-tel-input -->
  <div>
    <div class="dropdown" @keydown="keyboardNav" @click="toggleDropdown">
      <span class="selection">
        <div v-if="enabledFlags" :class="activeCountry.iso2.toLowerCase()" class="iti-flag" />
        <slot :open="open" name="arrow-icon">
          <span class="dropdown-arrow">{{ open ? "▲" : "▼" }}</span>
        </slot>
      </span>
      <ul v-show="open" ref="list">
        <li
          v-for="(pb, index) in sortedCountries"
          :key="pb.iso2 + (pb.preferred ? '-preferred' : '')"
          :class="getItemClass(index, pb.iso2)"
          class="dropdown-item"
          @click="choose(pb, true)"
          @mousemove="selectedIndex = index"
        >
          <div v-if="enabledFlags" :class="pb.iso2.toLowerCase()" class="iti-flag" />
          <strong>{{ pb.name }}</strong>
          <span v-if="dropdownOptions && !dropdownOptions.disabledDialCode">+{{ pb.dialCode }}</span>
        </li>
      </ul>
    </div>
    <input
      ref="input"
      v-model="phone"
      :placeholder="parsedPlaceholder"
      type="tel"
      @blur="onBlur"
      @input="onInput"
    />
  </div>
</template>

<style scoped>
</style>
