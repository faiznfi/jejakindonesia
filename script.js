const islandGroups = {
    "Sumatera": ["Aceh", "Sumatera Utara", "Sumatera Barat", "Riau", "Kepulauan Riau", "Jambi", "Sumatera Selatan", "Bangka-Belitung", "Bangka","Belitung", "Bengkulu", "Lampung"],
    "Jawa": ["DKI Jakarta", "Jakarta Raya", "Jakarta", "Jawa Barat", "Jawa Tengah", "DI Yogyakarta", "Jawa Timur", "Banten"],
    "Kalimantan": ["Kalimantan Barat", "Kalimantan Tengah", "Kalimantan Selatan", "Kalimantan Timur", "Kalimantan Utara"],
    "Sulawesi": ["Sulawesi Utara", "Gorontalo", "Sulawesi Tengah", "Sulawesi Barat", "Sulawesi Selatan", "Sulawesi Tenggara"],
    "Papua": ["Papua", "Papua Barat", "Papua Pegunungan", "Papua Selatan", "Papua Tengah", "Papua Barat Daya"], 
    "Bali & Nusa Tenggara": ["Bali", "Nusa Tenggara Barat", "Nusa Tenggara Timur"],
    "Maluku": ["Maluku", "Maluku Utara"]
};

const provinceColors = {
    "Aceh": "#a2d9ce", "Sumatera Utara": "#76d7c4", "Sumatera Barat": "#48c9b0", "Riau": "#1abc9c", "Kepulauan Riau": "#16a085", "Jambi": "#a3e4d7", "Sumatera Selatan": "#73c6b6", "Bangka Belitung": "#0e6251", "Bengkulu": "#117864", "Lampung": "#45b39d",
    "DKI Jakarta": "#5dade2", "Jawa Barat": "#a9cce3", "Jawa Tengah": "#85c1e9", "DI Yogyakarta": "#3498db", "Jawa Timur": "#2e86c1", "Banten": "#d6eaf8",
    "Kalimantan Barat": "#f7dc6f", "Kalimantan Tengah": "#f4d03f", "Kalimantan Selatan": "#f1c40f", "Kalimantan Timur": "#d4ac0d", "Kalimantan Utara": "#b7950b",
    "Sulawesi Utara": "#d7bde2", "Gorontalo": "#c39bd3", "Sulawesi Tengah": "#af7ac5", "Sulawesi Barat": "#9b59b6", "Sulawesi Selatan": "#884ea0", "Sulawesi Tenggara": "#7d3c98",
    "Papua": "#f1948a", "Papua Barat": "#e6b0aa", "Papua Pegunungan": "#d98880", "Papua Selatan": "#cd6155", "Papua Tengah": "#c0392b", "Papua Barat Daya": "#a93226",
    "Bali": "#edbb99", "Nusa Tenggara Barat": "#e59866", "Nusa Tenggara Timur": "#dc7633",
    "Maluku": "#aed6f1", "Maluku Utara": "#5dade2"
};

let visitedPlaces = JSON.parse(localStorage.getItem('visitedIslands')) || [];
let cityDataFeatures = []; 

/* =========================================
   2. SETUP PETA
   ========================================= */
const map = L.map('map', { zoomControl: false, minZoom: 4, attributionControl: false }).setView([-2.5, 118], 5);
L.control.zoom({ position: 'bottomright' }).addTo(map);

map.createPane('provincePane');
map.getPane('provincePane').style.zIndex = 450; 
map.getPane('provincePane').style.pointerEvents = 'none';

/* =========================================
   3. HELPER FUNCTIONS
   ========================================= */
function getIslandByProvince(provName) {
    for (const [island, provinces] of Object.entries(islandGroups)) {
        if (provinces.includes(provName)) return island;
    }
    return "Lainnya";
}
function stringToPastelColor(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    return `hsl(${Math.abs(hash % 360)}, 60%, 80%)`;
}
function getPlaceName(f) { return f.properties.NAME_2 || f.properties.name || f.properties.kab_kota || "Unknown"; }
function getProvinceName(f) { return f.properties.NAME_1 || f.properties.propinsi || f.properties.Provinsi || "Unknown"; }

/* =========================================
   4. STYLING LOGIC
   ========================================= */
function getCityStyle(feature) {
    const name = getPlaceName(feature);
    const prov = getProvinceName(feature);
    const isVisited = visitedPlaces.includes(name);
    const targetColor = provinceColors[prov] || stringToPastelColor(prov);

    if (isVisited) {
        return { fillColor: targetColor, fillOpacity: 1, color: targetColor, weight: 1.5, opacity: 1 };
    } else {
        return { fillColor: '#f4f6f7', fillOpacity: 1, color: '#bdc3c7', weight: 0.5, opacity: 1 };
    }
}
const provinceStyle = { fillColor: 'transparent', weight: 1.2, opacity: 1, color: '#666', fillOpacity: 0, interactive: false };

function highlightFeature(e) {
    var layer = e.target;
    layer.setStyle({ weight: 1.5, color: '#555', fillOpacity: 0.9 });
    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) layer.bringToFront();
}
function resetHighlight(e) { e.target.setStyle(getCityStyle(e.target.feature)); }

/* =========================================
   5. UI INTERACTION (LOGIKA TOGGLE BARU)
   ========================================= */

function toggleDashboard() {
    const dashboard = document.getElementById('mainDashboard');
    const btn = document.getElementById('fabBtn');
    const iconMenu = document.getElementById('iconMenu');
    const iconClose = document.getElementById('iconClose');

    // Cek apakah sedang tertutup
    if (dashboard.classList.contains('hidden-state')) {
        // BUKA
        dashboard.classList.remove('hidden-state');
        btn.classList.add('active');
        iconMenu.style.display = 'none';
        iconClose.style.display = 'block';
        
        // Mobile UX: Jika di HP, geser peta sedikit ke atas agar area tengah tidak tertutup sheet
        if(window.innerWidth <= 600) {
            map.panBy([0, 100], {animate: true});
        }
    } else {
        // TUTUP
        dashboard.classList.add('hidden-state');
        btn.classList.remove('active');
        iconMenu.style.display = 'block';
        iconClose.style.display = 'none';
    }
}

function resetData() {
    if(confirm('Hapus semua data perjalanan?')) {
        localStorage.setItem('visitedIslands', JSON.stringify([]));
        location.reload();
    }
}

/* =========================================
   6. DATA LOGIC
   ========================================= */
function updateDashboard() {
    let islandStats = {};
    Object.keys(islandGroups).forEach(island => islandStats[island] = { visited: 0, total: 0, color: '' });
    islandStats["Lainnya"] = { visited: 0, total: 0, color: '#999' };

    cityDataFeatures.forEach(feature => {
        const prov = getProvinceName(feature);
        const island = getIslandByProvince(prov);
        if (!islandStats[island]) islandStats[island] = { visited: 0, total: 0 };
        islandStats[island].total++;
        if (!islandStats[island].color && provinceColors[prov]) islandStats[island].color = provinceColors[prov];
    });

    visitedPlaces.forEach(placeName => {
        const feature = cityDataFeatures.find(f => getPlaceName(f) === placeName);
        if (feature) {
            const island = getIslandByProvince(getProvinceName(feature));
            if (islandStats[island]) islandStats[island].visited++;
        }
    });

    const container = document.getElementById('islandContainer');
    container.innerHTML = "";
    let totalVisitedGlobal = 0;
    
    Object.keys(islandGroups).forEach(island => {
        const data = islandStats[island];
        if (data && data.total > 0) {
            const percent = (data.visited / data.total) * 100;
            totalVisitedGlobal += data.visited;
            const html = `
            <div class="island-item">
                <div class="island-header">
                    <span>${island}</span>
                    <span>${data.visited}/${data.total} (${percent.toFixed(0)}%)</span>
                </div>
                <div class="island-progress-bg">
                    <div class="island-progress-fill" style="width: ${percent}%; background-color: ${data.color || '#5dade2'};"></div>
                </div>
            </div>`;
            container.innerHTML += html;
        }
    });

    document.getElementById('visitedCount').innerText = totalVisitedGlobal;
    const globalPercent = cityDataFeatures.length > 0 ? (totalVisitedGlobal / cityDataFeatures.length) * 100 : 0;
    document.getElementById('totalPercent').innerText = globalPercent.toFixed(1) + "%";
}

function toggleVisit(e) {
    const layer = e.target;
    const name = getPlaceName(layer.feature);
    if (visitedPlaces.includes(name)) visitedPlaces = visitedPlaces.filter(n => n !== name);
    else visitedPlaces.push(name);
    localStorage.setItem('visitedIslands', JSON.stringify(visitedPlaces));
    layer.setStyle(getCityStyle(layer.feature)); 
    updateDashboard();
}

Promise.all([
    fetch('idn-layer2.json').then(res => res.json()),
    fetch('idn-layer1.json').then(res => res.json())
]).then(([cityData, provinceData]) => {
    document.getElementById('loading').style.display = 'none';
    cityDataFeatures = cityData.features;

    // Render Layer Kota (Simpan ke variabel global)
    cityLayerGlobal = L.geoJSON(cityData, {
        style: getCityStyle,
        onEachFeature: function(feature, layer) {
            const name = getPlaceName(feature);
            const prov = getProvinceName(feature);
            layer.bindTooltip(`<div style='text-align:center;'><b>${name}</b><br><span style='color:#777; font-size:10px;'>${prov}</span></div>`, { sticky: true, className: 'custom-tooltip' });
            layer.on({ mouseover: highlightFeature, mouseout: resetHighlight, click: toggleVisit });
        }
    }).addTo(map);

    // Render Layer Provinsi
    L.geoJSON(provinceData, { style: provinceStyle, pane: 'provincePane' }).addTo(map);

    updateDashboard();

    // --- PANGGIL AUTO DETECT SETELAH SEMUA SIAP ---
    // Beri jeda sedikit (1 detik) agar tidak kaget saat baru buka
    setTimeout(() => {
        autoDetectLocation();
    }, 1000);

}).catch(err => {
    document.getElementById('loading').innerHTML = `<div style="color:red;">Error: ${err.message}</div>`;
});

/* =========================================
   7. AUTO DETECT LOCATION (DENGAN TOAST)
   ========================================= */

let cityLayerGlobal; 

// Fungsi Menampilkan Popup Elegan
function showToast(message, icon = "📍") {
    const toast = document.getElementById('toastNotification');
    const msgEl = document.getElementById('toastMessage');
    const iconEl = document.getElementById('toastIcon');

    // Set konten
    msgEl.innerText = message;
    iconEl.innerText = icon;

    // Tampilkan dengan animasi
    toast.classList.add('show');

    // Hilangkan otomatis setelah 4 detik
    setTimeout(() => {
        toast.classList.remove('show');
    }, 4000);
}

function autoDetectLocation() {
    if (!navigator.geolocation) return;

    // Tampilkan notifikasi sedang mencari...
    showToast("Mencari lokasimu...", "🛰️");

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            
            // 1. Terbang ke lokasi
            map.flyTo([lat, lng], 10, { duration: 2.5 });

            // 2. Cek Polygon (User ada di kota mana?)
            // Pastikan plugin leaflet-pip sudah diload di HTML
            const results = leafletPip.pointInLayer([lng, lat], cityLayerGlobal);

            if (results.length > 0) {
                const feature = results[0].feature;
                const cityName = getPlaceName(feature);
                
                // 3. Tampilkan Popup Elegan (GANTINYA ALERT)
                setTimeout(() => {
                    showToast(`Selamat datang di ${cityName}!`, "👋");
                }, 2000); // Delay sedikit biar pas map selesai zoom

                // 4. Auto-Tagging
                if (!visitedPlaces.includes(cityName)) {
                    visitedPlaces.push(cityName);
                    localStorage.setItem('visitedIslands', JSON.stringify(visitedPlaces));
                    
                    // Update Peta Visual (Jadi berwarna)
                    cityLayerGlobal.eachLayer(layer => {
                        if (getPlaceName(layer.feature) === cityName) {
                            layer.setStyle(getCityStyle(layer.feature));
                        }
                    });
                    
                    // Update Dashboard
                    updateDashboard();
                }

                // Tambahkan Marker kecil di lokasi user
                L.circleMarker([lat, lng], {
                    radius: 8,
                    fillColor: "#3388ff",
                    color: "#fff",
                    weight: 2,
                    opacity: 1,
                    fillOpacity: 0.8
                }).addTo(map).bindPopup("Lokasi Kamu").openPopup();

            } else {
                showToast("Kamu berada di luar wilayah peta.", "🌏");
            }
        },
        (error) => {
            console.warn("Gagal deteksi lokasi:", error.message);
        }
    );
}