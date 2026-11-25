/**
 * MediFind Automated Integration & API Test Suite
 */
const http = require('http');
const app = require('../server');
const {
  initializeDatabase,
  queryOne,
  execute,
  closeDatabase
} = require('../config/db');

let server;
let baseUrl;

let patientToken;
let pharmToken;
let adminToken;
let pharmacyId;
let medicineId;
let inventoryId;
let reservationId;

function request(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const options = {
      method: method.toUpperCase(),
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, headers: res.headers, body: json });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, raw: data });
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('--- STARTING MEDIFIND AUTOMATED API TESTS ---');
  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`  ✓ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${testName}`);
      failed++;
    }
  }

  try {
    process.env.NODE_ENV = 'test';
    await initializeDatabase();

    await new Promise((resolve) => {
      server = app.listen(0, () => {
        const port = server.address().port;
        baseUrl = `http://localhost:${port}`;
        console.log(`Test server running on port ${port}`);
        resolve();
      });
    });

        // TEST FIXTURES: Create patient account
        const patientRegisterRes = await request('POST', '/api/auth/register', {
          full_name: 'MediFind Test Patient',
          email: 'patient@medifind.com',
          phone: '0700000001',
          password: 'Patient@123',
          role: 'patient'
        });
    
        assert(
          patientRegisterRes.status === 201,
          'TEST SETUP: Patient account created'
        );
    
        // TEST FIXTURES: Create pharmacist account and pharmacy
        const pharmacistRegisterRes = await request('POST', '/api/auth/register', {
          full_name: 'MediFind Test Pharmacist',
          email: 'pharmacist@medifind.com',
          phone: '0700000002',
          password: 'Pharm@123',
          role: 'pharmacist',
          pharmacy_name: 'MediFind Test Pharmacy',
          license_number: 'TEST-MEDIFIND-001',
          pharmacy_address: 'Test Road, Nairobi',
          pharmacy_county: 'Nairobi',
          pharmacy_city: 'Nairobi',
          pharmacy_latitude: -1.286389,
          pharmacy_longitude: 36.817223,
          pharmacy_phone: '0700000003'
        });
    
        assert(
          pharmacistRegisterRes.status === 201,
          'TEST SETUP: Pharmacist and pharmacy created'
        );
    
        // Approve the test pharmacy
        const testPharmacy = await queryOne(
          'SELECT pharmacy_id FROM pharmacies WHERE user_id = ?',
          [pharmacistRegisterRes.body.data.user_id]
        );
    
        pharmacyId = testPharmacy?.pharmacy_id;
    
        if (pharmacyId) {
          await execute(
            "UPDATE pharmacies SET approval_status = 'approved' WHERE pharmacy_id = ?",
            [pharmacyId]
          );
        }
    
        assert(!!pharmacyId, 'TEST SETUP: Test pharmacy approved');

    // TEST 1: Health Check
    const healthRes = await request('GET', '/api/health');
    assert(healthRes.status === 200 && healthRes.body.status === 'online', 'GET /api/health returns status online');

    // TEST 2: Patient Login
    const loginRes = await request('POST', '/api/auth/login', {
      email: 'patient@medifind.com',
      password: 'Patient@123'
    });
    assert(loginRes.status === 200 && loginRes.body.token, 'POST /api/auth/login returns valid JWT token for patient');
    patientToken = loginRes.body.token;

    // TEST 3: Pharmacist Login
    const pharmLoginRes = await request('POST', '/api/auth/login', {
      email: 'pharmacist@medifind.com',
      password: 'Pharm@123'
    });
    assert(pharmLoginRes.status === 200 && pharmLoginRes.body.user.role === 'pharmacist', 'POST /api/auth/login succeeds for pharmacist');
    pharmToken = pharmLoginRes.body.token;
 
        // TEST FIXTURE: Create medicine inventory
        const testMedicine = await queryOne(
          'SELECT medicine_id FROM medicines WHERE medicine_name LIKE ?',
          ['%Amoxicillin%']
        );
    
        medicineId = testMedicine?.medicine_id;
    
        assert(!!medicineId, 'TEST SETUP: Amoxicillin found in medicine catalogue');
    
        if (medicineId && pharmToken) {
          const inventoryCreateRes = await request('POST', '/api/inventory', {
            medicine_id: medicineId,
            quantity: 20,
            price: 150,
            batch_number: 'TEST-BATCH-001',
            expiry_date: '2030-12-31'
          }, {
            Authorization: `Bearer ${pharmToken}`
          });
    
          inventoryId = inventoryCreateRes.body.data?.inventory_id;
    
          assert(
            inventoryCreateRes.status === 201 && !!inventoryId,
            'TEST SETUP: Medicine added to pharmacy inventory'
          );
        }

    // TEST 4: Admin Login
    const adminLoginRes = await request('POST', '/api/auth/login', {
      email: 'admin@medifind.com',
      password: 'AdminSecurePassword2026!'
    });
    assert(adminLoginRes.status === 200 && adminLoginRes.body.user.role === 'admin', 'POST /api/auth/login succeeds for admin');
    adminToken = adminLoginRes.body.token;

    // TEST 5: Get Medicines Catalogue
    const medsRes = await request('GET', '/api/medicines?search=Amoxicillin');
    assert(medsRes.status === 200 && medsRes.body.data.length > 0, 'GET /api/medicines returns searched medicine');

    // TEST 6: Get Medicine Details with Stocking Pharmacies
    const medDetailRes = await request('GET', `/api/medicines/${medicineId}?user_lat=-1.286389&user_lng=36.817223`);
    assert(medDetailRes.status === 200 && medDetailRes.body.medicine.medicine_name.includes('Amoxicillin'), 'GET /api/medicines/1 returns medicine with distance');

    // TEST 7: Get Pharmacies with Geolocation Radius
    const pharmRes = await request('GET', '/api/pharmacies?user_lat=-1.286389&user_lng=36.817223');
    assert(pharmRes.status === 200 && pharmRes.body.data.length > 0, 'GET /api/pharmacies returns pharmacies sorted by distance');

    // TEST 8: Pharmacist Inventory Retrieval
    const invRes = await request('GET', '/api/inventory/my-inventory', null, {
      Authorization: `Bearer ${pharmToken}`
    });
    assert(
      invRes.status === 200 &&
      Array.isArray(invRes.body.data) &&
      invRes.body.data.length > 0,
      'GET /api/inventory/my-inventory returns pharmacy inventory items'
    );
    
    const availableItem = Array.isArray(invRes.body.data)
      ? invRes.body.data.find(i => i.available_stock > 0) || invRes.body.data[0]
      : null;
 
      if (availableItem) {

    // TEST 9: Create Reservation (Patient)
    const resCreateRes = await request('POST', '/api/reservations', {
      inventory_id: availableItem.inventory_id,
      quantity: 1,
      patient_notes: 'Urgent prescription test'
    }, {
      Authorization: `Bearer ${patientToken}`
    });
    assert(resCreateRes.status === 201 && resCreateRes.body.reservation?.reservation_code, 'POST /api/reservations creates reservation with code');
    reservationId = resCreateRes.body.reservation?.reservation_id;

    // TEST 10: Pharmacist Confirms Reservation
    const confirmRes = await request('PUT', `/api/reservations/${reservationId}/status`, {
      status: 'Confirmed'
    }, {
      Authorization: `Bearer ${pharmToken}`
    });
    assert(confirmRes.status === 200 && confirmRes.body.reservation.status === 'Confirmed', 'PUT /api/reservations/:id/status updates to Confirmed');

    // TEST 11: Pharmacist Marks Reservation as Collected
    const collectRes = await request('PUT', `/api/reservations/${reservationId}/status`, {
      status: 'Collected'
    }, {
      Authorization: `Bearer ${pharmToken}`
    });
    assert(collectRes.status === 200 && collectRes.body.reservation.status === 'Collected', 'PUT /api/reservations/:id/status updates to Collected');
 
    }
    // TEST 12: Admin Dashboard Statistics
    const adminDashRes = await request('GET', '/api/admin/dashboard', null, {
      Authorization: `Bearer ${adminToken}`
    });
    assert(adminDashRes.status === 200 && adminDashRes.body.stats.total_users > 0, 'GET /api/admin/dashboard returns dynamic database KPIs');

    // TEST 13: Patient Notifications
    const notifRes = await request('GET', '/api/notifications', null, {
      Authorization: `Bearer ${patientToken}`
    });
    assert(notifRes.status === 200 && Array.isArray(notifRes.body.data), 'GET /api/notifications returns user notification array');

    // TEST 14: Submit Patient Complaint
    const compRes = await request('POST', '/api/complaints', {
      pharmacy_id: pharmacyId,
      subject: 'Test Complaint',
      description: 'Testing complaint workflow'
    }, {
      Authorization: `Bearer ${patientToken}`
    });
    assert(compRes.status === 201 && compRes.body.data.complaint_id, 'POST /api/complaints creates complaint');

    console.log(`\n========================================`);
    console.log(` TEST SUMMARY: ${passed} Passed, ${failed} Failed`);
    console.log(`========================================`);

    server.close();
    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error('Test execution failed:', err);
    if (server) server.close();
    process.exit(1);
  }
}

runTests();
