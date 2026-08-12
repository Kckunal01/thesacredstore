import handler from './api/complete-order.js';
import dotenv from 'dotenv';

dotenv.config();

// Mock response object
const res = {
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(data) {
    this.data = data;
    console.log('API RESPONSE:', this.statusCode, data);
    return this;
  }
};

// Mock request object
const req = {
  method: 'POST',
  body: {
    formData: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '9999999991'
    },
    cart: [
      {
        id: 'crystal-123',
        slug: 'selenite-tumble',
        name: 'Selenite Tumble',
        price: 150,
        quantity: 1
      }
    ],
    couponCode: 'WELCOME10',
    paymentMethod: 'cod'
  }
};

async function run() {
  try {
    await handler(req, res);
  } catch (err) {
    console.error('HANDLER CRASHED:', err);
  }
}

run();
