// 捐款與贊助 — 批次匯入
// 用法：於瀏覽器開啟後台 ba_admin_index.html 並「登入」後，按 F12 開啟主控台，
//       整段貼上執行。會沿用你目前的登入身分寫入，不需另外提供密碼。
// 特性：可重複執行 — 已存在（屆別＋姓名＋項目 相同）的紀錄會自動略過。

(async () => {
  const V = '10.12.0';
  const { initializeApp, getApps } = await import(`https://www.gstatic.com/firebasejs/${V}/firebase-app.js`);
  const { getFirestore, collection, getDocs, addDoc, serverTimestamp } =
    await import(`https://www.gstatic.com/firebasejs/${V}/firebase-firestore.js`);
  const { getAuth } = await import(`https://www.gstatic.com/firebasejs/${V}/firebase-auth.js`);

  const cfg = {
    apiKey: "AIzaSyDA72wtos-fOfh9Tt65dNz9Uxn6A0Vu1ag",
    authDomain: "nccuba-8568a.firebaseapp.com",
    projectId: "nccuba-8568a",
    storageBucket: "nccuba-8568a.firebasestorage.app",
    messagingSenderId: "933632898148",
    appId: "1:933632898148:web:921d6bccaade9c4825db71"
  };
  const app = getApps()[0] || initializeApp(cfg);
  const db = getFirestore(app);
  const auth = getAuth(app);

  // 等待 Firebase 還原登入狀態
  const user = auth.currentUser || await new Promise(res => {
    const t = setTimeout(() => res(null), 5000);
    const un = auth.onAuthStateChanged(u => { if (u) { clearTimeout(t); un(); res(u); } });
  });
  if (!user) { console.error('✗ 尚未登入後台，請先登入再執行。'); return; }
  console.log('以', user.email, '身分寫入…');

  const ROWS = [
    {
      "term": "18",
      "donorName": "奚志明",
      "isAnonymous": false,
      "item": "2025 春季盃 爐主",
      "donationDate": "2026-09-20",
      "amountMode": "不顯示",
      "amountExact": 0,
      "amountTier": "10萬以下"
    },
    {
      "term": "25",
      "donorName": "吳守謙",
      "isAnonymous": false,
      "item": "2025 夏季盃 爐主",
      "donationDate": "2026-09-20",
      "amountMode": "不顯示",
      "amountExact": 0,
      "amountTier": "10萬以下"
    },
    {
      "term": "35",
      "donorName": "許樞龍",
      "isAnonymous": false,
      "item": "2025 秋季盃 爐主",
      "donationDate": "2026-09-20",
      "amountMode": "不顯示",
      "amountExact": 0,
      "amountTier": "10萬以下"
    },
    {
      "term": "32",
      "donorName": "學長姐",
      "isAnonymous": false,
      "item": "2025 冬季盃 爐主",
      "donationDate": "2026-09-20",
      "amountMode": "不顯示",
      "amountExact": 0,
      "amountTier": "10萬以下"
    },
    {
      "term": "18",
      "donorName": "黃志聰",
      "isAnonymous": false,
      "item": "25-26 球隊贊助",
      "donationDate": "2026-09-20",
      "amountMode": "精確",
      "amountExact": 100000,
      "amountTier": "10萬以下"
    },
    {
      "term": "32",
      "donorName": "劉恕偉",
      "isAnonymous": false,
      "item": "25-26 球隊贊助",
      "donationDate": "2026-09-20",
      "amountMode": "精確",
      "amountExact": 220000,
      "amountTier": "10萬以下"
    },
    {
      "term": "35",
      "donorName": "李志祥",
      "isAnonymous": false,
      "item": "25-26 球隊贊助",
      "donationDate": "2026-09-20",
      "amountMode": "精確",
      "amountExact": 100000,
      "amountTier": "10萬以下"
    },
    {
      "term": "41",
      "donorName": "陳柏亦",
      "isAnonymous": false,
      "item": "25-26 球隊贊助",
      "donationDate": "2026-09-20",
      "amountMode": "精確",
      "amountExact": 50000,
      "amountTier": "10萬以下"
    },
    {
      "term": "24",
      "donorName": "林金淵",
      "isAnonymous": false,
      "item": "25-26 球隊贊助",
      "donationDate": "2026-09-20",
      "amountMode": "精確",
      "amountExact": 20000,
      "amountTier": "10萬以下"
    },
    {
      "term": "25",
      "donorName": "林明毅",
      "isAnonymous": false,
      "item": "25-26 球隊贊助",
      "donationDate": "2026-09-20",
      "amountMode": "精確",
      "amountExact": 20000,
      "amountTier": "10萬以下"
    },
    {
      "term": "31",
      "donorName": "陳世通",
      "isAnonymous": false,
      "item": "25-26 球隊贊助",
      "donationDate": "2026-09-20",
      "amountMode": "精確",
      "amountExact": 50000,
      "amountTier": "10萬以下"
    },
    {
      "term": "43",
      "donorName": "全班",
      "isAnonymous": false,
      "item": "25-26 球隊贊助",
      "donationDate": "2026-09-20",
      "amountMode": "精確",
      "amountExact": 100000,
      "amountTier": "10萬以下"
    },
    {
      "term": "44",
      "donorName": "全班",
      "isAnonymous": false,
      "item": "25-26 球隊贊助",
      "donationDate": "2026-09-20",
      "amountMode": "精確",
      "amountExact": 100000,
      "amountTier": "10萬以下"
    },
    {
      "term": "25",
      "donorName": "簡榮坤",
      "isAnonymous": false,
      "item": "贊助電輔車兩台",
      "donationDate": "2026-09-20",
      "amountMode": "不顯示",
      "amountExact": 0,
      "amountTier": "10萬以下"
    },
    {
      "term": "41",
      "donorName": "陳柏亦",
      "isAnonymous": false,
      "item": "碧潭高爾夫球場擊球卷",
      "donationDate": "2026-09-20",
      "amountMode": "不顯示",
      "amountExact": 0,
      "amountTier": "10萬以下"
    },
    {
      "term": "24",
      "donorName": "鄧富吉",
      "isAnonymous": false,
      "item": "按摩卷",
      "donationDate": "2026-09-20",
      "amountMode": "不顯示",
      "amountExact": 0,
      "amountTier": "10萬以下"
    },
    {
      "term": "32",
      "donorName": "陳正威",
      "isAnonymous": false,
      "item": "老協珍高級禮盒",
      "donationDate": "2026-09-20",
      "amountMode": "不顯示",
      "amountExact": 0,
      "amountTier": "10萬以下"
    },
    {
      "term": "32",
      "donorName": "曾湞琪",
      "isAnonymous": false,
      "item": "光隆海洋深層水",
      "donationDate": "2026-09-20",
      "amountMode": "不顯示",
      "amountExact": 0,
      "amountTier": "10萬以下"
    },
    {
      "term": "32",
      "donorName": "楊培中",
      "isAnonymous": false,
      "item": "翡冷翠門票",
      "donationDate": "2026-09-20",
      "amountMode": "不顯示",
      "amountExact": 0,
      "amountTier": "10萬以下"
    },
    {
      "term": "32",
      "donorName": "劉恕偉",
      "isAnonymous": false,
      "item": "peripower 充電器",
      "donationDate": "2026-09-20",
      "amountMode": "不顯示",
      "amountExact": 0,
      "amountTier": "10萬以下"
    },
    {
      "term": "33",
      "donorName": "陳一銘",
      "isAnonymous": false,
      "item": "筆記本電腦一台",
      "donationDate": "2026-09-20",
      "amountMode": "不顯示",
      "amountExact": 0,
      "amountTier": "10萬以下"
    },
    {
      "term": "38",
      "donorName": "許文南",
      "isAnonymous": false,
      "item": "panasonic 沖牙機 8 台",
      "donationDate": "2026-09-20",
      "amountMode": "不顯示",
      "amountExact": 0,
      "amountTier": "10萬以下"
    },
    {
      "term": "25",
      "donorName": "吳守謙",
      "isAnonymous": false,
      "item": "企家班45週年活動贊助",
      "donationDate": "2026-09-20",
      "amountMode": "精確",
      "amountExact": 75000,
      "amountTier": "10萬以下"
    },
    {
      "term": "18",
      "donorName": "黃志聰",
      "isAnonymous": false,
      "item": "企家班45週年活動贊助",
      "donationDate": "2026-09-20",
      "amountMode": "精確",
      "amountExact": 75000,
      "amountTier": "10萬以下"
    },
    {
      "term": "32",
      "donorName": "劉恕偉",
      "isAnonymous": false,
      "item": "企家班45週年活動贊助",
      "donationDate": "2026-09-20",
      "amountMode": "精確",
      "amountExact": 75000,
      "amountTier": "10萬以下"
    },
    {
      "term": "35",
      "donorName": "李志祥",
      "isAnonymous": false,
      "item": "企家班45週年活動贊助",
      "donationDate": "2026-09-20",
      "amountMode": "精確",
      "amountExact": 75000,
      "amountTier": "10萬以下"
    }
  ];

  const snap = await getDocs(collection(db, 'donations'));
  const seen = new Set(snap.docs.map(d => {
    const x = d.data();
    return [x.term, x.donorName, x.item || ''].join('|');
  }));

  let added = 0, skipped = 0;
  for (const r of ROWS) {
    const key = [r.term, r.donorName, r.item].join('|');
    if (seen.has(key)) { console.log('  略過（已存在）:', key); skipped++; continue; }
    await addDoc(collection(db, 'donations'), {
      ...r, createdBy: user.uid, createdAt: serverTimestamp()
    });
    seen.add(key);
    added++;
    console.log('  已新增:', key);
  }
  console.log(`\n完成：新增 ${added} 筆、略過 ${skipped} 筆。請重新整理後台與前台確認。`);
})();
