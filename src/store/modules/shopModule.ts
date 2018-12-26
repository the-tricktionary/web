import Vue from 'vue'
import Vuex from 'vuex'

const customerDetails = {
  namespaced: true,
  state: <CustomerDetails>{
    name: '',
    address1: '',
    address2: '',
    countryCode: '',
    postalCode: '',
    state: '',
    city: '',

    email: '',
    phone: '',

    company: '',
    vatnumber: '',
    vatValid: false
  },
  mutations: {
    setname (state: CustomerDetails, value: string) {
      state.name = value
    },
    setaddress1 (state: CustomerDetails, value: string) {
      state.address1 = value
    },
    setaddress2 (state: CustomerDetails, value: string) {
      state.address2 = value
    },
    setcountryCode (state: CustomerDetails, value: string) {
      state.countryCode = value
    },
    setpostalCode (state: CustomerDetails, value: string) {
      state.postalCode = value
    },
    setstate (state: CustomerDetails, value: string) {
      state.state = value
    },
    setcity (state: CustomerDetails, value: string) {
      state.city = value
    },
    setemail (state: CustomerDetails, value: string) {
      state.email = value
    },
    setphone (state: CustomerDetails, value: string) {
      state.phone = value
    },
    setcompany (state: CustomerDetails, value: string) {
      state.company = value
    },
    setvatnumber (state: CustomerDetails, value: string) {
      state.vatnumber = value
    },
    setvatValid (state: CustomerDetails, value: boolean) {
      state.vatValid = value
    }
  },
  actions: {
    update ({ commit }: any, meta: { field: string; value: string; }) {
      commit(`set${meta.field}`, meta.value)
    }
  }
}

export default {
  namespaced: true,
  modules: {
    customerDetails
  },
  state: <ShopState>{
    cart: {},
    currency: 'EUR'
  },
  mutations: {
    incrementCart (state: ShopState, product: string) {
      Vue.set(state.cart, product, (state.cart[product] || 0) + 1)
    },
    decrementCart (state: ShopState, product: string) {
      Vue.set(state.cart, product, ((state.cart[product] || 0) - 1) || 0)
    },
    setCurrency (state: ShopState, currency: string) {
      state.currency = currency
    }
  },
  actions: {
    updateCart ({ commit }: any, actions: { change: number; product: string; }) {
      if (actions.change > 0) {
        commit('incrementCart', actions.product)
      }
      if (actions.change < 0) {
        commit('decrementCart', actions.product)
      }
    },
    setCurrency ({ commit }: any, currency: string) {
      console.log(currency)
      commit('setCurrency', currency)
    }
  }
}
