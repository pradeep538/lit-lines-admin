// Test API Configuration
console.log('Testing API Configuration...');

// Check environment variables
console.log('VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);
console.log('Full API URL:', (import.meta.env.VITE_API_BASE_URL || '') + '/api/v1');

// Test local backend health
fetch('http://localhost:8080/health')
  .then(response => response.json())
  .then(data => {
    console.log('✅ Local backend health check:', data);
  })
  .catch(error => {
    console.error('❌ Local backend health check failed:', error);
  });

// Test production backend health (for comparison)
fetch('https://squid-app-b3fzb.ondigitalocean.app/health')
  .then(response => response.json())
  .then(data => {
    console.log('✅ Production backend health check:', data);
  })
  .catch(error => {
    console.error('❌ Production backend health check failed:', error);
  }); 