const { expect } = require('chai');
const supertest = require('supertest');
const app = require('../index');
const jwtGenerator = require("../utils/jwtGenerator");
const authorization = require("../middleware/authorization");
const config = require('../config');
const bodyParser = require('body-parser');

describe('Images retrieval', () => {
  it('should return images', () => {
    return supertest(app)
      .get('/images')
      .expect(200);
  });
});

describe('Target information retrieval', () => {
  it('should reject access without authorization', () => {
    return supertest(app)
      .get('/target-info')
      .expect(403);
  });
});

describe('Dashboard access', () => {
  it('should reject access without authorization', () => {
    return supertest(app)
      .get('/dashboard')
      .expect(403);
  });
});

describe('Dashboard access', () => {
  it('should reject access without authorization', () => {
    return supertest(app)
      .post('/login')
      .expect(403);
  });
});