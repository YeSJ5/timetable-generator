/**
 * Validation Tests
 * 
 * Tests for input validation on all API endpoints
 */

import request from 'supertest';
import app from '../../src/app';
import { teacherRegenerationSchema, dayRegenerationSchema, slotRegenerationSchema } from '../../src/schemas/regeneration';

describe('API Validation', () => {
  describe('POST /regenerate/teacher', () => {
    it('should accept valid input', async () => {
      const validInput = {
        timetableId: '123e4567-e89b-12d3-a456-426614174000',
        sectionId: '123e4567-e89b-12d3-a456-426614174001',
        targetId: '123e4567-e89b-12d3-a456-426614174002',
        preserveUnchanged: true,
        solverType: 'greedy',
      };

      // Note: This will fail at the database level, but validation should pass
      const response = await request(app)
        .post('/regenerate/teacher')
        .send(validInput);

      // Validation passes if we get past 400 (might be 404 for missing entities)
      expect(response.status).not.toBe(400);
    });

    it('should reject missing timetableId', async () => {
      const response = await request(app)
        .post('/regenerate/teacher')
        .send({
          sectionId: '123e4567-e89b-12d3-a456-426614174001',
          targetId: '123e4567-e89b-12d3-a456-426614174002',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject invalid UUID', async () => {
      const response = await request(app)
        .post('/regenerate/teacher')
        .send({
          timetableId: 'invalid-uuid',
          sectionId: '123e4567-e89b-12d3-a456-426614174001',
          targetId: '123e4567-e89b-12d3-a456-426614174002',
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject invalid solverType', async () => {
      const response = await request(app)
        .post('/regenerate/teacher')
        .send({
          timetableId: '123e4567-e89b-12d3-a456-426614174000',
          sectionId: '123e4567-e89b-12d3-a456-426614174001',
          targetId: '123e4567-e89b-12d3-a456-426614174002',
          solverType: 'invalid',
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('POST /regenerate/day', () => {
    it('should reject invalid day', async () => {
      const response = await request(app)
        .post('/regenerate/day')
        .send({
          timetableId: '123e4567-e89b-12d3-a456-426614174000',
          sectionId: '123e4567-e89b-12d3-a456-426614174001',
          targetId: 'InvalidDay',
          day: 'InvalidDay',
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should accept valid day', async () => {
      const validInput = {
        timetableId: '123e4567-e89b-12d3-a456-426614174000',
        sectionId: '123e4567-e89b-12d3-a456-426614174001',
        targetId: 'Mon',
        day: 'Mon',
      };

      const response = await request(app)
        .post('/regenerate/day')
        .send(validInput);

      // Validation passes if we get past 400
      expect(response.status).not.toBe(400);
    });
  });

  describe('POST /regenerate/slot', () => {
    it('should reject negative slotIndex', async () => {
      const response = await request(app)
        .post('/regenerate/slot')
        .send({
          timetableId: '123e4567-e89b-12d3-a456-426614174000',
          sectionId: '123e4567-e89b-12d3-a456-426614174001',
          targetId: 'Mon:-1',
          day: 'Mon',
          slotIndex: -1,
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject non-integer slotIndex', async () => {
      const response = await request(app)
        .post('/regenerate/slot')
        .send({
          timetableId: '123e4567-e89b-12d3-a456-426614174000',
          sectionId: '123e4567-e89b-12d3-a456-426614174001',
          targetId: 'Mon:0.5',
          day: 'Mon',
          slotIndex: 0.5,
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should accept valid slotIndex', async () => {
      const validInput = {
        timetableId: '123e4567-e89b-12d3-a456-426614174000',
        sectionId: '123e4567-e89b-12d3-a456-426614174001',
        targetId: 'Mon:0',
        day: 'Mon',
        slotIndex: 0,
      };

      const response = await request(app)
        .post('/regenerate/slot')
        .send(validInput);

      // Validation passes if we get past 400
      expect(response.status).not.toBe(400);
    });
  });

  describe('GET /versions/:v1/compare/:v2', () => {
    it('should reject missing timetableId query param', async () => {
      const response = await request(app)
        .get('/timetable/versions/1/compare/2');

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject invalid version numbers', async () => {
      const response = await request(app)
        .get('/timetable/versions/0/compare/1')
        .query({ timetableId: '123e4567-e89b-12d3-a456-426614174000' });

      expect(response.status).toBe(400);
    });

    it('should accept valid version numbers', async () => {
      const response = await request(app)
        .get('/timetable/versions/1/compare/2')
        .query({ timetableId: '123e4567-e89b-12d3-a456-426614174000' });

      // Validation passes if we get past 400 (might be 404 for missing timetable)
      expect(response.status).not.toBe(400);
    });
  });
});

