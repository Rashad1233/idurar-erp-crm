const axios = require('axios');
const { expect } = require('chai');

describe('Purchase Requisition Creation Tests', () => {
  let authToken;
  const baseURL = 'http://localhost:3000/api';

  before(async () => {
    // Login and get auth token
    const loginResponse = await axios.post(`${baseURL}/auth/login`, {
      email: 'admin@test.com',
      password: 'admin123'
    });
    authToken = loginResponse.data.token;
  });

  describe('Form Validation Tests', () => {
    it('should validate required fields', async () => {
      try {
        await axios.post(
          `${baseURL}/purchase-requisition/create`,
          {},
          {
            headers: { Authorization: `Bearer ${authToken}` }
          }
        );
        throw new Error('Should have failed with validation error');
      } catch (err) {
        expect(err.response.status).to.equal(400);
        expect(err.response.data.errors).to.include.members([
          'requiredDate is required',
          'items array is required'
        ]);
      }
    });

    it('should validate item fields', async () => {
      try {
        await axios.post(
          `${baseURL}/purchase-requisition/create`,
          {
            requiredDate: '2024-01-01',
            items: [{}]
          },
          {
            headers: { Authorization: `Bearer ${authToken}` }
          }
        );
        throw new Error('Should have failed with validation error');
      } catch (err) {
        expect(err.response.status).to.equal(400);
        expect(err.response.data.errors).to.include.members([
          'Item quantity is required',
          'Item description is required'
        ]);
      }
    });
  });

  describe('Item Management Tests', () => {
    it('should create PR with multiple items', async () => {
      const response = await axios.post(
        `${baseURL}/purchase-requisition/create`,
        {
          requiredDate: '2024-01-01',
          items: [
            {
              quantity: 5,
              description: 'Test Item 1',
              unitPrice: 100,
              unspscCode: '43211500'
            },
            {
              quantity: 3,
              description: 'Test Item 2', 
              unitPrice: 200,
              unspscCode: '43211600'
            }
          ]
        },
        {
          headers: { Authorization: `Bearer ${authToken}` }
        }
      );

      expect(response.status).to.equal(201);
      expect(response.data.items).to.have.lengthOf(2);
      expect(response.data.totalAmount).to.equal(1100);
    });

    it('should handle file attachments', async () => {
      const formData = new FormData();
      formData.append('requiredDate', '2024-01-01');
      formData.append('items', JSON.stringify([{
        quantity: 1,
        description: 'Test Item with Attachment',
        unitPrice: 100,
        unspscCode: '43211500'
      }]));
      formData.append('attachments', new File(['test'], 'test.pdf'));

      const response = await axios.post(
        `${baseURL}/purchase-requisition/create`,
        formData,
        {
          headers: { 
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      expect(response.status).to.equal(201);
      expect(response.data.attachments).to.have.lengthOf(1);
    });
  });

  describe('AI Feature Tests', () => {
    it('should generate item description', async () => {
      const response = await axios.post(
        `${baseURL}/ai/generate-description`,
        {
          itemName: 'Dell Laptop',
          specifications: 'i7, 16GB RAM, 512GB SSD'
        },
        {
          headers: { Authorization: `Bearer ${authToken}` }
        }
      );

      expect(response.status).to.equal(200);
      expect(response.data.description).to.be.a('string');
      expect(response.data.description.length).to.be.greaterThan(0);
    });

    it('should analyze photo for item recognition', async () => {
      const formData = new FormData();
      formData.append('photo', new File(['test'], 'item.jpg'));

      const response = await axios.post(
        `${baseURL}/ai/analyze-photo`,
        formData,
        {
          headers: { 
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      expect(response.status).to.equal(200);
      expect(response.data.itemDetails).to.be.an('object');
      expect(response.data.itemDetails.name).to.be.a('string');
    });
  });

  describe('Integration Tests', () => {
    it('should create complete PR with all features', async () => {
      const formData = new FormData();
      formData.append('requiredDate', '2024-01-01');
      formData.append('justification', 'Urgent requirement for new project');
      formData.append('items', JSON.stringify([
        {
          quantity: 2,
          description: 'Dell Laptop i7 16GB RAM',
          unitPrice: 1200,
          unspscCode: '43211500'
        }
      ]));
      formData.append('attachments', new File(['test'], 'specs.pdf'));
      formData.append('photo', new File(['test'], 'item.jpg'));

      const response = await axios.post(
        `${baseURL}/purchase-requisition/create`,
        formData,
        {
          headers: { 
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      expect(response.status).to.equal(201);
      expect(response.data.prNumber).to.match(/PR-\d{8}-\d{4}/);
      expect(response.data.status).to.equal('Pending Approval');
      expect(response.data.totalAmount).to.equal(2400);
      expect(response.data.attachments).to.have.lengthOf(1);
      expect(response.data.items).to.have.lengthOf(1);
      expect(response.data.aiAnalysis).to.be.an('object');
    });
  });
});
