// products.json, branches.json을 읽어 바로 렌더
const $ = (sel, root=document) => root.querySelector(sel);

// ---------- 제품 ----------
async function renderProducts(){
  try{
    const items = await fetch("./data/products.json").then(r=>r.json());
    const grid = $("#productsGrid");
    grid.innerHTML = items.map(it => `
      <div class="col-12 col-sm-6 col-lg-4">
        <div class="card h-100">
          <img src="${it.image || 'https://picsum.photos/seed/'+encodeURIComponent(it.id)+'/800/600'}"
               alt="${escapeHTML(it.name)}" class="card-img-top">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start">
              <h5 class="card-title mb-1">${escapeHTML(it.name)}</h5>
              <span class="badge text-bg-light border">${escapeHTML(it.category || '')}</span>
            </div>
            <p class="card-text text-secondary small mb-0">${escapeHTML(it.desc || '')}</p>
          </div>
        </div>
      </div>
    `).join("");
  }catch(e){
    console.error("products.json 로드 실패", e);
  }
}

// ---------- 매장 ----------
let map, markers = [];
async function renderStores(filterSido=""){
  try{
    const stores = await fetch("./data/branches.json").then(r=>r.json());
    const list = $("#storeList");
    const filtered = filterSido ? stores.filter(s=>s.sido===filterSido) : stores;

    // 리스트
    list.innerHTML = filtered.map(s => `
      <a class="list-group-item list-group-item-action" href="#" data-lat="${s.lat}" data-lng="${s.lng}">
        <div class="d-flex justify-content-between">
          <strong>${escapeHTML(s.name)}</strong>
          <span class="text-muted small">${escapeHTML(s.sido)}</span>
        </div>
        <div class="small text-secondary">${escapeHTML(s.addr)}</div>
        <div class="small text-secondary">☎ ${escapeHTML(s.phone || '-')} · ${escapeHTML(s.hours || '-')}</div>
      </a>
    `).join("");

    // 지도
    if (!map) {
      map = L.map("storeMap").setView([36.5,127.8], 7);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19, attribution: "&copy; OpenStreetMap"
      }).addTo(map);
    }
    // 기존 마커 제거
    markers.forEach(m => map.removeLayer(m)); markers = [];
    filtered.forEach(s => {
      const m = L.marker([s.lat, s.lng]).addTo(map)
        .bindPopup(`<b>${escapeHTML(s.name)}</b><br>${escapeHTML(s.addr)}`);
      markers.push(m);
    });
    if (markers.length){
      const group = L.featureGroup(markers);
      map.fitBounds(group.getBounds().pad(0.2));
    }

    // 리스트 클릭 시 해당 매장 포커스
    list.querySelectorAll("a").forEach(a=>{
      a.addEventListener("click", (e)=>{
        e.preventDefault();
        const lat = parseFloat(a.dataset.lat), lng = parseFloat(a.dataset.lng);
        map.setView([lat,lng], 14);
      });
    });

  }catch(e){
    console.error("branches.json 로드 실패", e);
  }
}

// ---------- 고객센터 (데모 저장) ----------
document.addEventListener("DOMContentLoaded", () => {
  renderProducts();
  renderStores();

  // 필터
  $("#btnStoreFilter")?.addEventListener("click", ()=>{
    const sido = $("#storeSido").value;
    renderStores(sido);
  });

  // 문의폼 (로컬 저장 데모)
  $("#csForm")?.addEventListener("submit", (e)=>{
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const ticket = {
      name: fd.get("name"),
      email: fd.get("email"),
      message: fd.get("message"),
      at: new Date().toISOString()
    };
    const arr = JSON.parse(localStorage.getItem("haka.cs")||"[]");
    arr.unshift(ticket);
    localStorage.setItem("haka.cs", JSON.stringify(arr));
    e.currentTarget.reset();
    alert("문의가 접수되었습니다. (데모: 브라우저 저장)");
  });

  // 스무스 스크롤
  document.querySelectorAll('a.nav-link[href^="#"], .scroll-cue').forEach(a=>{
    a.addEventListener("click", (e)=>{
      const id = a.getAttribute("href");
      if (id && id.startsWith("#")){
        e.preventDefault();
        document.querySelector(id)?.scrollIntoView({behavior:"smooth"});
      }
    });
  });

});

// HTML escape
function escapeHTML(s=""){
  return String(s).replace(/[&<>"']/g, m => ({ "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;" }[m]));
}
