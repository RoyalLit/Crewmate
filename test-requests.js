async function test() {
  try {
    const loginRes = await fetch('http://localhost:5001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'userb@test.com',
        password: 'Password123!',
        fcmToken: 'test'
      })
    });
    const loginData = await loginRes.json();
    const token = loginData.data.token;
    
    const reqsRes = await fetch('http://localhost:5001/api/requests/me', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const reqsData = await reqsRes.json();
    console.log(JSON.stringify(reqsData, null, 2));
  } catch (e) {
    console.error(e.message);
  }
}
test();
