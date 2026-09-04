// ============================================================
// RECLAIM FRONTEND API
// Direct connection to Flask backend
// ============================================================

const API_URL = "http://127.0.0.1:5000";


// ============================================================
// DASHBOARD
// ============================================================

export async function getDashboard() {

  const response = await fetch(
    `${API_URL}/api/dashboard`,
    {
      method: "GET",
      cache: "no-store",
    }
  );

  if (!response.ok) {

    throw new Error(
      `Dashboard API failed: ${response.status}`
    );
  }

  return response.json();
}


// ============================================================
// PAYMENTS
// ============================================================

export async function getPayments() {

  const response = await fetch(
    `${API_URL}/api/payments`,
    {
      method: "GET",
      cache: "no-store",
    }
  );

  if (!response.ok) {

    throw new Error(
      `Payments API failed: ${response.status}`
    );
  }

  return response.json();
}


// ============================================================
// SINGLE PAYMENT
// ============================================================

export async function getPayment(
  customerId: string
) {

  const response = await fetch(
    `${API_URL}/api/payments/${encodeURIComponent(
      customerId
    )}`,
    {
      method: "GET",
      cache: "no-store",
    }
  );

  if (!response.ok) {

    throw new Error(
      `Payment API failed: ${response.status}`
    );
  }

  return response.json();
}


// ============================================================
// AUDIT LOG
// ============================================================

export async function getAudit() {

  const response = await fetch(
    `${API_URL}/api/audit`,
    {
      method: "GET",
      cache: "no-store",
    }
  );

  if (!response.ok) {

    throw new Error(
      `Audit API failed: ${response.status}`
    );
  }

  return response.json();
}


// ============================================================
// RUN RECOVERY AGENT
// ============================================================

export async function runRecoveryAgent() {

  const response = await fetch(
    `${API_URL}/api/run-agent`,
    {
      method: "POST",
    }
  );

  if (!response.ok) {

    throw new Error(
      `Recovery Agent failed: ${response.status}`
    );
  }

  return response.json();
}


// ============================================================
// REFRESH OPTIMIZATION
// ============================================================

export async function refreshOptimization() {

  const response = await fetch(
    `${API_URL}/api/refresh`,
    {
      method: "POST",
    }
  );

  if (!response.ok) {

    throw new Error(
      `Refresh failed: ${response.status}`
    );
  }

  return response.json();
}


// ============================================================
// HEALTH CHECK
// ============================================================

export async function checkBackendHealth() {

  const response = await fetch(
    `${API_URL}/api/health`,
    {
      method: "GET",
      cache: "no-store",
    }
  );

  if (!response.ok) {

    throw new Error(
      `Backend health check failed: ${response.status}`
    );
  }

  return response.json();
}