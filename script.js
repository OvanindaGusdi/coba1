// === FIREBASE CONFIG ===
const firebaseConfig = {
    apiKey: "API_KEY_KAMU",
    authDomain: "xxx.firebaseapp.com",
    databaseURL: "https://xxx-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "xxx",
    storageBucket: "xxx.appspot.com",
    messagingSenderId: "xxx",
    appId: "xxx"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();


function setLampState(id, state) {
    db.ref("kamar_ovan/lamp" + id).set(state);
}

function toggleLamp(id) {
    ...
    const newState = !isOn;
    setLampState(id, newState);
}



// ========== LAMPU ==========
function toggleLamp(id) {
    const btn = document.getElementById(`lamp${id}_btn`);
    const img = document.getElementById(`lamp${id}_img`);

    const newState = !btn.classList.contains("on");

    // update database
    db.ref("kamar_ovan/lamp" + id).set(newState);

    // update UI lokal
    applyLampUI(id, newState);
}

function applyLampUI(id, state) {
    const btn = document.getElementById(`lamp${id}_btn`);
    const img = document.getElementById(`lamp${id}_img`);

    if (state) {
        img.src = "lamp_on.png";
        btn.classList.add("on");
        btn.classList.remove("off");
        btn.innerText = "ON";
    } else {
        img.src = "lamp_off.png";
        btn.classList.remove("on");
        btn.classList.add("off");
        btn.innerText = "OFF";
    }
}


// ========== FAN ==========
function toggleFan() {
    const img = document.getElementById("fan_img");
    const btn = document.getElementById("fan_btn");

    const isOn = btn.classList.contains("on");

    if (isOn) {
        // OFF
        img.src = "fan_off.png";
        img.classList.remove("fan-on");
        btn.classList.remove("on");
        btn.classList.add("off");
        btn.innerText = "OFF";
    } else {
        // ON
        img.src = "fan_on.png";
        img.classList.add("fan-on");
        btn.classList.remove("off");
        btn.classList.add("on");
        btn.innerText = "ON";
    }
}

// === UPDATE TEMPERATURE (SEMICIRCLE VERSION) ===
function updateTemperatureGauge(temp) {
    const needle = document.getElementById("temp-needle");
    const text = document.getElementById("temp-text");

    // Batasi range
    if (temp < -5) temp = -5;
    if (temp > 40) temp = 40;

    // Konversi suhu ke 0..1
    let percent = (temp + 5) / 45; // karena range -5..40 = 45

    // Semi circle angle: -90° → 90°
    let angle = -90 + (percent * 180);

    // Rotate needle
    needle.style.transform = `translateX(-50%) rotate(${angle}deg)`;

    text.innerText = temp.toFixed(1) + "°C";
}

function updateHumidityGauge(humidity) {
    const needle = document.getElementById("humidity-needle");
    const text = document.getElementById("humidity-text");

    // Batasi range 0..100%
    humidity = Math.min(Math.max(humidity, 0), 100);

    // Normalisasi 0..100 → 0..1
    let percent = humidity / 100;

    // Semi circle angle: -90° → 90°
    let angle = -90 + (percent * 180);

    needle.style.transform = `translateX(-50%) rotate(${angle}deg)`;
    text.innerText = humidity.toFixed(1) + "%"; // tetap 1 angka di belakang koma
}



/* === UPDATE VOLTAGE GAUGE === */
function updateVoltageGauge(voltage) {
    const needle = document.getElementById("voltage-needle");
    const text = document.getElementById("voltage-text");

    if (voltage < 0) voltage = 0;
    if (voltage > 500) voltage = 500; // max 500V

    let percent = voltage / 500; // normalisasi
    let angle = -90 + (percent * 180);

    needle.style.transform = `translateX(-50%) rotate(${angle}deg)`;
    text.innerText = voltage.toFixed(1) + "V"; // 1 angka di belakang koma
}

/* === UPDATE CURRENT GAUGE === */
function updateCurrentGauge(current) {
    const needle = document.getElementById("current-needle");
    const text = document.getElementById("current-text");

    if (current < 0) current = 0;
    if (current > 1000) current = 1000; // max 1000A

    let percent = current / 1000; // normalisasi
    let angle = -90 + (percent * 180);

    needle.style.transform = `translateX(-50%) rotate(${angle}deg)`;
    text.innerText = current.toFixed(1) + "A"; // 1 angka di belakang koma
}


// Misal kamu dapat data dari server/sensor
function onSensorDataReceived(data) {
    // data.temp, data.humidity
    updateTemperatureGauge(data.temp);
    updateHumidityGauge(data.humidity);
}

// Misal data dari server/sensor
function onPZEMDataReceived(sensorData) {
    // sensorData = { voltage, current, power, energy, freq, pf }
    updateVoltageGauge(sensorData.voltage);   // 1 angka di belakang koma
    updateCurrentGauge(sensorData.current);   // 1 angka di belakang koma
    updatePZEMValues(
        sensorData.energy,
        sensorData.power,
        sensorData.freq,
        sensorData.pf
    );
}


/* === UPDATE PZEM VALUES === */
function updatePZEMValues(energy, power, freq, pf) {
    document.getElementById("energy-text").innerText = energy.toFixed(1) + " kWh";
    document.getElementById("power-text").innerText = power.toFixed(1) + " W";
    document.getElementById("freq-text").innerText = freq.toFixed(1) + " Hz";
    document.getElementById("pf-text").innerText = pf.toFixed(2); // power factor biasanya 0..1
}

async function toggleLamp1() {
    let db = await loadStatus();

    db.lampu1 = !db.lampu1;

    saveStatus(db);

    // update UI
    updateLampUI(1, db.lampu1);
}
// ========== Firebase read (keep UI synced) ==========

function loadLampState(id) {
    db.ref("kamar_ovan/lamp" + id).on("value", snap => {
        const state = snap.val();
        applyLampUI(id, state);
    });
}


// panggil listener saat halaman dibuka
loadLampState(1);
loadLampState(2);
loadLampState(3);
loadLampState(4);

db.ref("kamar_ovan/lamp1").on("value", s => applyLampUI(1, s.val()));
db.ref("kamar_ovan/lamp2").on("value", s => applyLampUI(2, s.val()));
db.ref("kamar_ovan/lamp3").on("value", s => applyLampUI(3, s.val()));
db.ref("kamar_ovan/lamp4").on("value", s => applyLampUI(4, s.val()));

// /* ============================
//    DEMO ANIMASI GAUGE BERGERAK
// ============================ */

// let demoTemp = 20;
// let tempUp = true;

// let demoHum = 50;
// let humUp = true;

// let demoVolt = 220;
// let voltUp = true;

// let demoAmp = 5;
// let ampUp = true;

// setInterval(() => {
//     // === Temperature ===
//     updateTemperatureGauge(demoTemp);
//     if (tempUp) demoTemp += 0.3;
//     else demoTemp -= 0.3;
//     if (demoTemp >= 40) tempUp = false;
//     if (demoTemp <= -5) tempUp = true;

//     // === Humidity ===
//     updateHumidityGauge(demoHum);
//     if (humUp) demoHum += 0.5;
//     else demoHum -= 0.5;
//     if (demoHum >= 100) humUp = false;
//     if (demoHum <= 0) humUp = true;

//     // === Voltage ===
//     updateVoltageGauge(demoVolt);
//     if (voltUp) demoVolt += 0.7;
//     else demoVolt -= 1;
//     if (demoVolt >= 500) voltUp = false;
//     if (demoVolt <= 0) voltUp = true;

//     // === Current ===
//     updateCurrentGauge(demoAmp);
//     if (ampUp) demoAmp += 0.8;
//     else demoAmp -= 0.8;
//     if (demoAmp >= 1000) ampUp = false;
//     if (demoAmp <= 0) ampUp = true;

// }, 120);



