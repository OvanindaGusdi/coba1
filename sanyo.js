let pumpStatus = false;
let countdown = null;
let timeLeft = 0;

function updateUI() {
    document.getElementById("statusText").innerText = pumpStatus ? "ON" : "OFF";
    document.getElementById("pumpImg").classList.toggle("pump-on", pumpStatus);
}

// NYALAKAN POMPA
function pumpOn() {
    pumpStatus = true;
    updateUI();
}

// MATIKAN POMPA
function pumpOff() {
    pumpStatus = false;
    updateUI();

    // Hentikan timer jika sedang berjalan
    clearInterval(countdown);
    countdown = null;
    document.getElementById("timerDisplay").innerText = "00:00";
}

// TIMER MULAI
function startTimer() {
    let minutes = parseInt(document.getElementById("timerInput").value);

    if (!minutes || minutes <= 0) {
        alert("Masukkan waktu dalam menit!");
        return;
    }

    timeLeft = minutes * 60; // konversi ke detik

    // Bersihkan timer jika sebelumnya masih berjalan
    clearInterval(countdown);

    // Nyalakan pompa otomatis jika timer dimulai
    pumpOn();

    countdown = setInterval(() => {
        let m = Math.floor(timeLeft / 60);
        let s = timeLeft % 60;

        document.getElementById("timerDisplay").innerText =
            `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;

        if (timeLeft <= 0) {
            clearInterval(countdown);
            countdown = null;

            pumpOff();
            alert("Timer selesai! Pompa dimatikan otomatis.");
        }

        timeLeft--;
    }, 1000);
}
