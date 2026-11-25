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

  computed: {
    sortedLessons() {
      const lessonsCopy = [...this.lessons];
      const attr = this.sortAttribute;
      const order = this.sortOrder === 'asc' ? 1 : -1;

      return lessonsCopy.sort((a, b) => {
        let valA = a[attr];
        let valB = b[attr];

        if (typeof valA === 'string') {
          return valA.localeCompare(valB) * order;
        }
        return (valA - valB) * order;
      });
    }
  },

  methods: {
    addToCart(lesson) {
      if (lesson.space > 0) {
        lesson.space--;
        const cartItem = this.cart.find(item => item.lesson._id === lesson._id);
        if (cartItem) {
          cartItem.quantity++;
        } else {
          this.cart.push({ lesson: lesson, quantity: 1 });
        }
      }
    },

    getImageUrl(imageName) {
      return `${this.apiUrl}/images/${imageName}`;
    }
  }
});

app.mount('#app');
