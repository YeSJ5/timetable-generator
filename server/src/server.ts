import app from './app';

const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📚 API docs: http://localhost:${PORT}/openapi.json`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  
  // Log database connection status
  if (process.env.DATABASE_URL) {
    const dbUrl = process.env.DATABASE_URL.replace(/:[^:@]+@/, ':****@');
    console.log(`💾 Database: ${dbUrl}`);
  }
});

