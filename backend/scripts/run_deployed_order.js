(async () => {
  try {
    const base = 'https://e-commerce-nudd.onrender.com';
    const fetch = global.fetch || (await import('node-fetch')).default;

    console.log('Fetching products...');
    const prodRes = await fetch(base + '/api/products');
    const prodJson = await prodRes.json();
    if (!prodJson || !prodJson.data || prodJson.data.length === 0) {
      console.error('No products found on deployed server.');
      process.exit(1);
    }
    const product = prodJson.data[0];
    console.log('Using product:', product._id, product.title || product.name || '');

    console.log('Logging in as admin...');
    const loginRes = await fetch(base + '/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@store.com', password: 'admin123' })
    });
    const loginJson = await loginRes.json();
    console.log('Login response status:', loginRes.status, JSON.stringify(loginJson));
    if (!loginJson || !loginJson.token) {
      console.error('Login failed, cannot proceed.');
      process.exit(1);
    }
    const token = loginJson.token;

    console.log('Creating order...');
    const orderPayload = {
      items: [{ product_id: product._id, quantity: 1 }],
      total_amount: product.price || 100,
      shipping_address: null
    };

    const orderRes = await fetch(base + '/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(orderPayload)
    });
    const orderJson = await orderRes.json();
    console.log('Create order status:', orderRes.status, JSON.stringify(orderJson));

  } catch (err) {
    console.error('Script error:', err);
    process.exit(1);
  }
})();
