// Backend API base URL
const API_URL = 'https://backend-m01132399.onrender.com';

const app = Vue.createApp({
  data() {
    return {
      apiUrl: API_URL,
      lessons: [],
      teachers: [],
      selectedTeacher: '',
      searchQuery: '',
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
    // calculate total item count in cart
    cartItemCount() {
      return this.cart.reduce((total, item) => total + item.quantity, 0);
    },

    // calculate total price of cart items
    cartTotalPrice() {
      return this.cart.reduce((total, item) => total + (item.lesson.price * item.quantity), 0);
    },

    // check if name contains letters and spaces only
    isNameValid() {
      return /^[A-Za-z\s]+$/.test(this.checkout.name);
    },

    // check if phone contains numbers only
    isPhoneValid() {
      return /^[0-9]+$/.test(this.checkout.phone);
    },

    // checkout button enabled only when inputs are valid and cart has items
    isCheckoutValid() {
      return this.isNameValid && this.isPhoneValid && this.cart.length > 0;
    },

    // sort and filter lessons by selected attribute and direction
    sortedLessons() {
      let list = [...this.lessons];

      // filter by selected teacher if any
      if (this.selectedTeacher) {
        list = list.filter(l => l.teacher === this.selectedTeacher);
      }

      const attr = this.sortAttribute;
      const order = this.sortOrder === 'asc' ? 1 : -1;

      return list.sort((a, b) => {
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
    // toggle between lessons page and cart page
    toggleCart() {
      this.showCart = !this.showCart;
      this.orderSubmitted = false;
    },

    // build image url served by backend static middleware
    getImageUrl(imageName) {
      return `${this.apiUrl}/images/${imageName}`;
    },

    // fetch all lessons from backend API
    fetchLessons() {
      fetch(`${this.apiUrl}/lessons`)
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to fetch lessons');
          }
          return response.json();
        })
        .then(data => {
          this.lessons = data;
        })
        .catch(error => {
          console.error('Error fetching lessons:', error);
        });
    },

    // fetch all teachers from backend API
    fetchTeachers() {
      fetch(`${this.apiUrl}/teachers`)
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to fetch teachers');
          }
          return response.json();
        })
        .then(data => {
          this.teachers = data;
        })
        .catch(error => {
          console.error('Error fetching teachers:', error);
        });
    },

    // search lessons via backend REST API
    searchLessons() {
      const q = this.searchQuery.trim();
      const url = q ? `${this.apiUrl}/search?q=${encodeURIComponent(q)}` : `${this.apiUrl}/lessons`;

      fetch(url)
        .then(response => {
          if (!response.ok) {
            throw new Error('Search request failed');
          }
          return response.json();
        })
        .then(data => {
          this.lessons = data;
        })
        .catch(error => {
          console.error('Error searching lessons:', error);
        });
    },

    // add lesson to cart and decrement available spaces
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

    // remove lesson from cart and restore available spaces
    removeFromCart(cartItem) {
      const lesson = this.lessons.find(l => l._id === cartItem.lesson._id);
      if (lesson) {
        lesson.space += cartItem.quantity;
      }

      const index = this.cart.indexOf(cartItem);
      if (index > -1) {
        this.cart.splice(index, 1);
      }

      // switch back to lesson view if cart becomes empty
      if (this.cart.length === 0) {
        this.showCart = false;
      }
    },

    // submit order to backend and update lesson spaces
    submitOrder() {
      if (!this.isCheckoutValid) return;

      const lessonIDs = [];
      let totalSpaces = 0;
      this.cart.forEach(item => {
        lessonIDs.push(item.lesson._id);
        totalSpaces += item.quantity;
      });

      const orderData = {
        name: this.checkout.name,
        phone: this.checkout.phone,
        lessonIDs: lessonIDs,
        space: totalSpaces
      };

      // send POST request to save order
      fetch(`${this.apiUrl}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      })
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to save order');
          }
          return response.json();
        })
        .then(() => {
          // update available spaces for each lesson with PUT request
          const updatePromises = this.cart.map(item => {
            return fetch(`${this.apiUrl}/lessons/${item.lesson._id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ space: item.lesson.space })
            });
          });

          return Promise.all(updatePromises);
        })
        .then(() => {
          this.orderSubmitted = true;
          this.cart = [];
          this.checkout.name = '';
          this.checkout.phone = '';
          this.fetchLessons();
        })
        .catch(error => {
          console.error('Error submitting order:', error);
        });
    }
  },

  mounted() {
    // load lessons and teachers on mount
    this.fetchLessons();
    this.fetchTeachers();
  }
});

app.mount('#app');
