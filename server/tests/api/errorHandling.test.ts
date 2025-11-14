/**
 * Error Handling Tests
 * 
 * Tests for global error handling middleware
 */

import request from 'supertest';
import app from '../../src/app';

describe('Error Handling', () => {
  describe('Bad JSON', () => {
    it('should handle malformed JSON', async () => {
      const response = await request(app)
        .post('/regenerate/teacher')
        .set('Content-Type', 'application/json')
        .send('{ invalid json }');

      expect(response.status).toBe(400);
    });
  });

  describe('Runtime Errors', () => {
    it('should format errors consistently', async () => {
      // This will fail at database level (404 for missing entities)
      const response = await request(app)
        .post('/regenerate/teacher')
        .send({
          timetableId: '123e4567-e89b-12d3-a456-426614174000',
          sectionId: '123e4567-e89b-12d3-a456-426614174001',
          targetId: '123e4567-e89b-12d3-a456-426614174002',
        });

      // Should have consistent error format
      if (response.status >= 400) {
        expect(response.body).toHaveProperty('success');
        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toHaveProperty('code');
        expect(response.body.error).toHaveProperty('message');
      }
    });
  });

  describe('404 Handler', () => {
    it('should return 404 for unknown routes', async () => {
      const response = await request(app)
        .get('/unknown/route');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });
  });

  describe('Error Response Format', () => {
    it('should have consistent error structure', async () => {
      const response = await request(app)
        .post('/regenerate/teacher')
        .send({}); // Missing required fields

      expect(response.body).toMatchObject({
        success: false,
        error: {
          code: expect.any(String),
          message: expect.any(String),
        },
      });
    });
  });
});

