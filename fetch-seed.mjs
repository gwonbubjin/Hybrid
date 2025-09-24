// Node 18+
// 공공데이터(환경부) API에서 시/도별 측정소 최신 1건씩 수집해 seed.json 생성
// 그리고 0924/index.template.html의 __SEED_JSON__ 을 실제 JSON으로 치환해 dist/index.html 생성

import fs from "node:fs/promises";

const API_KEY = process.env.AIR_API_KEY;
if (!API_KEY) {
  console.error("❌ AIR_API_KEY 가 비어있음: GitHub → Settings → Secrets → Actions 에 추가하세요.");
  process.exit(1);
}

const SIDO_LIST = [
  "서울","부산","대구","인천","광주","대전","울산","세종","경기","강원",
  "충북","충남","전북","전남","경북","경남","제주"
];

async function j(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}

async function getStationsBySido(sido) {
  const url = `http://apis.data.go.kr/B552584/MsrstnInfoInqireSvc/getMsrstnList?serviceKey=${API_KEY}&returnType=json&numOfRows=500&pageNo=1&umdName=&addr=${encodeURIComponent(sido)}`;
  const data = await j(url);
  const items = data?.response?.body?.items || [];
  return items.map(it => it.stationName).filter(Boolean);
}

async function getLatestByStation(stationName) {
  const url = `http://apis.data.go.kr/B552584/ArpltnInforInqireSvc/getMsrstnAcctoRltmMesureDnsty?serviceKey=${API_KEY}&returnType=json&numOfRows=1&pageNo=1&stationName=${encodeURIComponent(stationName)}&dataTerm=DAILY&ver=1.3`;
  const data = await j(url);
  return data?.response?.body?.items?.[0] || null;
}

async function main() {
  const out = { updatedAt: new Date().toISOString(), data: {} };

  for (const sido of SIDO_LIST) {
    try {
      const stations = await getStationsBySido(sido);
      const items = [];
      for (const name of stations.slice(0, 60)) { // 과다호출 방지
        const it = await getLatestByStation(name);
        if (it) items.push(it);
        await new Promise(r => setTimeout(r, 50)); // API 예의상 딜레이
      }
      out.data[sido] = { response: { body: { items } } };
      console.log(`✅ ${sido}: ${items.length}개`);
    } catch (e) {
      console.error(`⚠ ${sido} 실패:`, e.message);
      out.data[sido] = { response: { body: { items: [] } } };
    }
  }

  await fs.mkdir("dist", { recursive: true });
  await fs.writeFile("dist/seed.json", JSON.stringify(out), "utf-8");

  const tpl = await fs.readFile("0924/index.template.html", "utf-8");
  const inlined = tpl.replace("__SEED_JSON__", JSON.stringify(out));
  await fs.writeFile("dist/index.html", inlined, "utf-8");

  console.log("🎯 dist/index.html 생성 완료");
}

main().catch(err => { console.error(err); process.exit(1); });

