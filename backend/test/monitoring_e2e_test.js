/**
 * AttendEase DevOps Phase 2 - End-to-End Monitoring & RBAC Test Suite
 */
const http = require('http');

const BASE_URL = 'http://localhost:6000';
const NAGIOS_URL = 'http://localhost:8080/nagios/';

function request(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const json = data ? JSON.parse(data) : {};
          resolve({ status: res.statusCode, headers: res.headers, data: json, raw: data });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, raw: data });
        }
      });
    });
    req.on('error', reject);
    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('====================================================');
  console.log(' AttendEase DevOps Phase 2 - E2E Verification Suite ');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  [PASS] ${message}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${message}`);
      failed++;
    }
  }

  // 1. Backend Health Check
  console.log('--- Test Suite 1: Backend Health Endpoint ---');
  try {
    const res = await request({
      hostname: 'localhost',
      port: 6000,
      path: '/api/health',
      method: 'GET',
    });
    assert(res.status === 200, `GET /api/health returned 200 OK`);
    assert(res.data?.status === 'ok', `status is 'ok'`);
    assert(res.data?.database === 'connected', `database is 'connected'`);
    assert(typeof res.data?.uptime === 'number', `uptime is reported (${res.data?.uptime}s)`);
  } catch (err) {
    assert(false, `GET /api/health failed: ${err.message}`);
  }

  // 2. Nagios Core Web UI
  console.log('\n--- Test Suite 2: Nagios Core Web Interface ---');
  try {
    const res = await request({
      hostname: 'localhost',
      port: 8080,
      path: '/nagios/',
      method: 'GET',
    });
    // Nagios requires basic auth so it returns 401 Unauthorized or 200/302 when authenticated
    assert(
      res.status === 200 || res.status === 401 || res.status === 302,
      `Nagios port 8080 is accessible (HTTP status: ${res.status})`
    );
  } catch (err) {
    assert(false, `Nagios Core web port 8080 failed: ${err.message}`);
  }

  // 3. User Authentication & Tokens Setup
  console.log('\n--- Test Suite 3: RBAC & Authentication Tokens ---');
  let adminToken = '';
  let facultyToken = '';
  let studentToken = '';

  // Login Admin
  try {
    const res = await request(
      {
        hostname: 'localhost',
        port: 6000,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      { email: 'admin@attendease.com', password: 'AdminPassword123!' }
    );
    const token = res.data?.token || res.data?.data?.token;
    if (res.status === 200 && token) {
      adminToken = token;
      assert(true, `Admin logged in successfully (${res.data.user?.role || 'admin'})`);
    } else {
      // Fallback: try seeding admin if not found
      console.log('  [INFO] Admin not found with default password, attempting registration...');
      const reg = await request(
        {
          hostname: 'localhost',
          port: 6000,
          path: '/api/auth/register',
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        },
        {
          name: 'System Admin',
          email: 'admin@attendease.com',
          password: 'AdminPassword123!',
          role: 'admin',
        }
      );
      const regToken = reg.data?.token || reg.data?.data?.token;
      if (reg.status === 201 && regToken) {
        adminToken = regToken;
        assert(true, `Admin registered successfully`);
      } else {
        assert(false, `Admin auth failed: ${JSON.stringify(res.data || reg.data)}`);
      }
    }
  } catch (err) {
    assert(false, `Admin login error: ${err.message}`);
  }

  // Register / Login Faculty
  try {
    const res = await request(
      {
        hostname: 'localhost',
        port: 6000,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      { email: 'faculty@attendease.com', password: 'FacultyPassword123!' }
    );
    const token = res.data?.token || res.data?.data?.token;
    if (res.status === 200 && token) {
      facultyToken = token;
      assert(true, `Faculty logged in successfully`);
    } else {
      const reg = await request(
        {
          hostname: 'localhost',
          port: 6000,
          path: '/api/auth/register',
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        },
        {
          name: 'Test Faculty',
          email: 'faculty@attendease.com',
          password: 'FacultyPassword123!',
          role: 'faculty',
        }
      );
      const regToken = reg.data?.token || reg.data?.data?.token;
      if (reg.status === 201 && regToken) {
        facultyToken = regToken;
        assert(true, `Faculty registered successfully`);
      } else {
        assert(false, `Faculty auth failed: ${JSON.stringify(res.data || reg.data)}`);
      }
    }
  } catch (err) {
    assert(false, `Faculty login error: ${err.message}`);
  }

  // Register / Login Student
  try {
    const res = await request(
      {
        hostname: 'localhost',
        port: 6000,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      { email: 'student@attendease.com', password: 'StudentPassword123!' }
    );
    const token = res.data?.token || res.data?.data?.token;
    if (res.status === 200 && token) {
      studentToken = token;
      assert(true, `Student logged in successfully`);
    } else {
      const reg = await request(
        {
          hostname: 'localhost',
          port: 6000,
          path: '/api/auth/register',
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        },
        {
          name: 'Test Student',
          email: 'student@attendease.com',
          password: 'StudentPassword123!',
          role: 'student',
        }
      );
      const regToken = reg.data?.token || reg.data?.data?.token;
      if (reg.status === 201 && regToken) {
        studentToken = regToken;
        assert(true, `Student registered successfully`);
      } else {
        assert(false, `Student auth failed: ${JSON.stringify(res.data || reg.data)}`);
      }
    }
  } catch (err) {
    assert(false, `Student login error: ${err.message}`);
  }

  // 4. RBAC Protection Tests (Non-Admins must receive 403 Forbidden)
  console.log('\n--- Test Suite 4: Strict RBAC Protection (Faculty & Student 403) ---');
  
  // Unauthenticated -> 401
  const unauthRes = await request({
    hostname: 'localhost',
    port: 6000,
    path: '/api/monitoring/summary',
    method: 'GET',
  });
  assert(unauthRes.status === 401, `Unauthenticated request returns 401 Unauthorized (got ${unauthRes.status})`);

  // Faculty -> 403 Forbidden
  if (facultyToken) {
    const facultyRes = await request({
      hostname: 'localhost',
      port: 6000,
      path: '/api/monitoring/summary',
      method: 'GET',
      headers: { Authorization: `Bearer ${facultyToken}` },
    });
    assert(facultyRes.status === 403, `Faculty request returns 403 Forbidden (got ${facultyRes.status})`);
  }

  // Student -> 403 Forbidden
  if (studentToken) {
    const studentRes = await request({
      hostname: 'localhost',
      port: 6000,
      path: '/api/monitoring/summary',
      method: 'GET',
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    assert(studentRes.status === 403, `Student request returns 403 Forbidden (got ${studentRes.status})`);
  }

  // 5. Admin Monitoring Endpoints (Must return 200 OK)
  console.log('\n--- Test Suite 5: Admin Monitoring Endpoints (200 OK & Data Schema) ---');
  if (adminToken) {
    const headers = { Authorization: `Bearer ${adminToken}` };

    // 5.1 /api/monitoring/summary
    const sumRes = await request({
      hostname: 'localhost',
      port: 6000,
      path: '/api/monitoring/summary',
      method: 'GET',
      headers,
    });
    const sumData = sumRes.data?.data || {};
    assert(sumRes.status === 200, `GET /api/monitoring/summary returns 200 OK`);
    assert(sumRes.data?.success === true, `summary.success is true`);
    const sysHealth = sumData.systemHealth || sumData.systemStatus;
    assert(typeof sysHealth === 'string', `summary reports systemHealth: ${sysHealth}`);
    const srvTotal = sumData.counts?.totalServices ?? sumData.counts?.servicesTotal;
    assert(typeof srvTotal === 'number', `summary reports totalServices: ${srvTotal}`);
    assert(typeof sumData.components?.backend?.status === 'string', `backend component status: ${sumData.components?.backend?.status}`);
    const dbStatus = sumData.components?.mongodb?.status || sumData.components?.database?.status;
    assert(typeof dbStatus === 'string', `database component status: ${dbStatus}`);
    assert(typeof sumData.components?.frontend?.status === 'string', `frontend component status: ${sumData.components?.frontend?.status}`);

    // 5.2 /api/monitoring/hosts
    const hostsRes = await request({
      hostname: 'localhost',
      port: 6000,
      path: '/api/monitoring/hosts',
      method: 'GET',
      headers,
    });
    const hostsList = hostsRes.data?.data?.hosts || (Array.isArray(hostsRes.data?.data) ? hostsRes.data?.data : []);
    assert(hostsRes.status === 200, `GET /api/monitoring/hosts returns 200 OK`);
    assert(Array.isArray(hostsList), `hosts list is an array (${hostsList.length} hosts)`);

    // 5.3 /api/monitoring/services
    const servRes = await request({
      hostname: 'localhost',
      port: 6000,
      path: '/api/monitoring/services',
      method: 'GET',
      headers,
    });
    const servList = servRes.data?.data?.services || (Array.isArray(servRes.data?.data) ? servRes.data?.data : []);
    assert(servRes.status === 200, `GET /api/monitoring/services returns 200 OK`);
    assert(Array.isArray(servList), `services list is an array (${servList.length} services)`);

    // 5.4 /api/monitoring/alerts
    const alertRes = await request({
      hostname: 'localhost',
      port: 6000,
      path: '/api/monitoring/alerts',
      method: 'GET',
      headers,
    });
    const alertList = alertRes.data?.data?.activeAlerts || (Array.isArray(alertRes.data?.data) ? alertRes.data?.data : []);
    assert(alertRes.status === 200, `GET /api/monitoring/alerts returns 200 OK`);
    assert(Array.isArray(alertList), `activeAlerts is an array (${alertList.length} active)`);

    // 5.5 /api/monitoring/resources
    const resRes = await request({
      hostname: 'localhost',
      port: 6000,
      path: '/api/monitoring/resources',
      method: 'GET',
      headers,
    });
    const resData = resRes.data?.data || {};
    const memPct = resData.memory?.usedPercent ?? resData.memory?.percentUsed;
    const diskPct = resData.disk?.usedPercent ?? resData.disk?.percentUsed;
    const uptimeStr = resData.uptime?.text || resData.uptime?.formatted;
    assert(resRes.status === 200, `GET /api/monitoring/resources returns 200 OK`);
    assert(typeof resData.cpu === 'object', `cpu resource metrics present`);
    assert(typeof resData.memory === 'object', `memory resource metrics present (${memPct}% used)`);
    assert(typeof resData.disk === 'object', `disk resource metrics present (${diskPct}% used)`);
    assert(typeof uptimeStr === 'string', `uptime formatted: ${uptimeStr}`);
  }

  console.log('\n====================================================');
  console.log(` Summary: ${passed} Passed, ${failed} Failed`);
  console.log('====================================================');
  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch((e) => {
  console.error('Fatal test error:', e);
  process.exit(1);
});
