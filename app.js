const API_URL = 'https://backend-m01132399.onrender.com';

const app = Vue.createApp({
  data() {
    return {
      apiUrl: API_URL,
      lessons: [],
      cart: [],
      showCart: false,
      sortAttribute: 'subject',
      sortOrder: 'asc',
      checkout: {
        name: '',
        phone: ''
      },
      orderSubmitted: false
    };
  },

  methods: {
    getImageUrl(imageName) {
      return `${this.apiUrl}/images/${imageName}`;
    }
  }
});

app.mount('#app');
