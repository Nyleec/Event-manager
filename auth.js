(async function () {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('You must log in to access this page.');
      window.location.href = 'login.html';
      return;
    }
  
    try {
      const response = await fetch('http://localhost:3000/api/protected', {
        headers: { Authorization: `Bearer ${token}` }
      });
  
      if (!response.ok) {
        throw new Error('Invalid token');
      }
    } catch (err) {
      console.error('Authentication failed:', err);
      alert('Your session has expired. Please log in again.');
      localStorage.removeItem('token');
      window.location.href = 'login.html';
    }
  })();