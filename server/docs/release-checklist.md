# Release Checklist

Pre-release verification checklist for AI Timetable Generator Backend.

## ✅ Pre-Release Verification

### 1. Tests
- [ ] All unit tests passing (`npm test`)
- [ ] All integration tests passing
- [ ] E2E flow test passing (`npm test -- systemFlow.test.ts`)
- [ ] Test coverage ≥ 80% (`npm run test:coverage`)
- [ ] No flaky tests
- [ ] All test fixtures cleaned up properly

### 2. Code Quality
- [ ] No linter errors (`npm run lint` or `npx eslint .`)
- [ ] TypeScript compilation successful (`npm run build`)
- [ ] No TypeScript errors
- [ ] All imports resolved
- [ ] No console.log statements in production code (use logger)

### 3. Versioning System
- [ ] Version listing endpoint works (`GET /timetable/:sectionId/versions`)
- [ ] Version metadata endpoint works (`GET /timetable/:sectionId/versions/:id/metadata`)
- [ ] Version comparison works (`GET /timetable/versions/:v1/compare/:v2`)
- [ ] Version restoration works (`POST /timetable/:sectionId/restore/:version`)
- [ ] Restoration metadata correctly stored
- [ ] Version history persists correctly

### 4. Regeneration Engine
- [ ] Teacher regeneration works (`POST /regenerate/teacher`)
- [ ] Section regeneration works (`POST /regenerate/section`)
- [ ] Day regeneration works (`POST /regenerate/day`)
- [ ] Slot regeneration works (`POST /regenerate/slot`)
- [ ] All regenerations preserve unaffected areas
- [ ] Change tracking works correctly
- [ ] Solver metadata included in responses

### 5. Environment Variables
- [ ] `.env.example` file created/updated
- [ ] All required variables documented
- [ ] Default values are sensible
- [ ] Production environment variables configured
- [ ] Database URL configured correctly

### 6. Docker Build
- [ ] Dockerfile builds successfully (`docker build -t timetable-generator-server .`)
- [ ] Docker image runs without errors
- [ ] Health check passes in container
- [ ] Database migrations work in container
- [ ] docker-compose.yml works (`docker-compose up -d`)
- [ ] Container restarts gracefully

### 7. API Documentation
- [ ] OpenAPI spec updated (`server/docs/openapi.yaml`)
- [ ] All endpoints documented
- [ ] Request/response schemas match implementation
- [ ] Example requests included
- [ ] API collection updated (`server/docs/api-collection.json`)
- [ ] Tags and descriptions added

### 8. Health Checks
- [ ] Health endpoint responds (`GET /health`)
- [ ] Health endpoint returns correct status
- [ ] Uptime tracking works
- [ ] Memory usage reported correctly
- [ ] Profiler sample included (if available)

### 9. Debug Endpoints
- [ ] Slot search works (`GET /debug/slot-search`)
- [ ] Usage map works (`GET /debug/usage-map`)
- [ ] Lab debug works (`GET /debug/labs`)
- [ ] Performance endpoint works (`GET /debug/performance`)
- [ ] All debug endpoints return expected format

### 10. Security
- [ ] Rate limiting enabled
- [ ] Input validation on all endpoints (Zod schemas)
- [ ] Error handling doesn't leak sensitive info
- [ ] CORS configured correctly
- [ ] Request size limits enforced
- [ ] SQL injection protection (Prisma parameterized queries)

### 11. Database
- [ ] Migrations run successfully (`npx prisma migrate deploy`)
- [ ] Database schema up to date
- [ ] No orphaned records
- [ ] Indexes created for performance
- [ ] Backup strategy documented

### 12. Performance
- [ ] Regeneration completes in reasonable time (< 5s for typical case)
- [ ] No memory leaks
- [ ] Profiler metrics logged
- [ ] Cache working correctly (if applicable)
- [ ] Database queries optimized

### 13. Documentation
- [ ] README.md complete and accurate
- [ ] API documentation complete
- [ ] Deployment guide included
- [ ] Environment variables documented
- [ ] Troubleshooting section added (if needed)

### 14. Production Readiness
- [ ] Production build successful (`npm run build`)
- [ ] Production start script works (`npm start`)
- [ ] Logging configured (if applicable)
- [ ] Error tracking configured (if applicable)
- [ ] Monitoring configured (if applicable)

## 🚀 Release Steps

1. **Final Verification**
   ```bash
   npm test
   npm run build
   docker build -t timetable-generator-server .
   ```

2. **Version Tagging**
   ```bash
   git tag -a v1.0.0 -m "Release v1.0.0"
   git push origin v1.0.0
   ```

3. **Docker Image**
   ```bash
   docker tag timetable-generator-server:latest your-registry/timetable-generator-server:v1.0.0
   docker push your-registry/timetable-generator-server:v1.0.0
   ```

4. **Deployment**
   - Update production environment variables
   - Run database migrations
   - Deploy new version
   - Verify health endpoint
   - Monitor for errors

5. **Post-Release**
   - Verify all endpoints working
   - Check logs for errors
   - Monitor performance metrics
   - Update release notes

## 📝 Notes

- Run full test suite before tagging
- Test Docker build on clean environment
- Verify all environment variables are set
- Check database migrations are compatible
- Ensure backward compatibility for API changes

## 🐛 Known Issues

List any known issues or limitations here:
- [ ] Issue 1: Description
- [ ] Issue 2: Description

## 📚 Related Documentation

- [README.md](../README.md)
- [API Collection](./api-collection.json)
- [OpenAPI Spec](./openapi.yaml)

