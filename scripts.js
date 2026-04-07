const API_URL = "https://fedskillstest.coalitiontechnologies.workers.dev";

const username = "coalition";
const password = "skills-test";
const encoded = btoa(username + ":" + password);

let patients = [];
let chart = null;

// ======================
// ✅ FETCH PATIENT DATA
// ======================
async function fetchPatients() {
  try {
    const response = await fetch(API_URL, {
      method: "GET",
      headers: {
        "Authorization": "Basic " + encoded
      }
    });

    if (!response.ok) {
      throw new Error("Failed to fetch data");
    }

    const data = await response.json();
    console.log("API Data:", data);

    patients = data;

    displayPatients();

    // ✅ Auto-select first patient
    if (patients.length > 0) {
      showPatientDetails(0);
    }

  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

fetchPatients();

// ======================
// ✅ DISPLAY PATIENT LIST
// ======================
function displayPatients() {
  const list = document.getElementById("patient-list");
  if (!list) return;

  list.innerHTML = "";

  patients.forEach((patient, index) => {
    const div = document.createElement("div");
    div.className = "patient-card";

    div.innerHTML = `
      <h4>${patient.name || "N/A"}</h4>
      <p>Age: ${patient.age || "N/A"}</p>
    `;

    div.addEventListener("click", () => {
      showPatientDetails(index);

      // ✅ Active highlight
      document.querySelectorAll(".patient-card").forEach(card =>
        card.classList.remove("active")
      );
      div.classList.add("active");
    });

    list.appendChild(div);
  });
}

// ======================
// ✅ SHOW PATIENT DETAILS
// ======================
function showPatientDetails(index) {
  const patient = patients[index];
  const detailsDiv = document.getElementById("patient-details");

  if (!detailsDiv) return;

  detailsDiv.innerHTML = `
    <h3>${patient.name || "N/A"}</h3>
    <p><b>Age:</b> ${patient.age || "N/A"}</p>
    <p><b>Gender:</b> ${patient.gender || "N/A"}</p>
    <p><b>Phone:</b> ${patient.phone_number || "N/A"}</p>
    <p><b>DOB:</b> ${patient.date_of_birth || "N/A"}</p>
  `;

  // ======================
  // ✅ UPDATE STATS
  // ======================
  const history = patient.diagnosis_history || [];
  const latest = history[history.length - 1];

  document.getElementById("heartRate").innerText =
    latest?.heart_rate?.value || "--";

  document.getElementById("bpValue").innerText =
    latest
      ? `${latest.blood_pressure?.systolic?.value}/${latest.blood_pressure?.diastolic?.value}`
      : "--";

  document.getElementById("status").innerText =
    latest?.blood_pressure?.status || "Normal";

  // ======================
  // ✅ CREATE CHART
  // ======================
  createChart(patient);
}

// ======================
// ✅ CREATE CHART
// ======================
function createChart(patient) {
  const canvas = document.getElementById("bpChart");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");

  const history = patient.diagnosis_history || [];

  if (history.length === 0) {
    console.warn("No BP data available");
    return;
  }

  const labels = history.map(item => `${item.month} ${item.year}`);

  const systolic = history.map(
    item => item.blood_pressure?.systolic?.value || 0
  );

  const diastolic = history.map(
    item => item.blood_pressure?.diastolic?.value || 0
  );

  // ✅ Destroy old chart
  if (chart) {
    chart.destroy();
  }

  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Systolic",
          data: systolic,
          borderColor: "#e53935",
          backgroundColor: "transparent",
          tension: 0.4,
          borderWidth: 2
        },
        {
          label: "Diastolic",
          data: diastolic,
          borderColor: "#1e88e5",
          backgroundColor: "transparent",
          tension: 0.4,
          borderWidth: 2
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: true
        }
      },
      scales: {
        y: {
          beginAtZero: false
        }
      }
    }
  });
}