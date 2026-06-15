async function test() {
  try {
    const loginRes = await fetch('http://localhost:5001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'user@test.com', // Let's create a new user to test, or just use login if we have a seed user
        password: 'Password123!',
        fcmToken: 'test'
      })
    });
    
    let token;
    const loginData = await loginRes.json();
    if (!loginData.success) {
      console.log("Login failed, attempting register...");
      const regRes = await fetch('http://localhost:5001/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Test',
          email: 'test@myrides.com',
          password: 'Password123!',
          college: 'Test College',
          fcmToken: 'test'
        })
      });
      const regData = await regRes.json();
      token = regData.data.token;
    } else {
      token = loginData.data.token;
    }
    
    console.log("Token:", token.substring(0, 10) + "...");
    const res = await fetch('http://localhost:5001/api/rides/me', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (e) {
    console.error(e.message);
  }
}
test();
