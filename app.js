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
    cartItemCount() {
      return this.cart.reduce((total, item) => total + item.quantity, 0);
    },

    cartTotalPrice() {
      return this.cart.reduce((total, item) => total + (item.lesson.price * item.quantity), 0);
    },

    isNameValid() {
      return /^[A-Za-z\s]+$/.test(this.checkout.name);
    },

    isPhoneValid() {
      return /^[0-9]+$/.test(this.checkout.phone);
    },

    isCheckoutValid() {
      return this.isNameValid && this.isPhoneValid && this.cart.length > 0;
    },

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
    toggleCart() {
      this.showCart = !this.showCart;
      this.orderSubmitted = false;
    },

    removeFromCart(cartItem) {
      const lesson = this.lessons.find(l => l._id === cartItem.lesson._id);
      if (lesson) {
        lesson.space += cartItem.quantity;
      }
      const index = this.cart.indexOf(cartItem);
      if (index > -1) {
        this.cart.splice(index, 1);
      }
      if (this.cart.length === 0) {
        this.showCart = false;
      }
    },

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
