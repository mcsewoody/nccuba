// 捐款與贊助 — 將捐款項目中的「卷」修正為「券」
// 用法：於瀏覽器開啟後台 ba_admin_index.html 並「登入」後，按 F12 開啟主控台，
//       整段貼上執行。會沿用你目前的登入身分寫入，不需另外提供密碼。
// 特性：以內容比對尋找，可重複執行；沒有待修正的紀錄時不會有任何寫入。

(async () => {
  const V = '10.12.0';
  const { initializeApp, getApps } = await import(`https://www.gstatic.com/firebasejs/${V}/firebase-app.js`);
  const { getFirestore, collection, getDocs, updateDoc, doc, serverTimestamp } =
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

  const user = auth.currentUser || await new Promise(res => {
    const t = setTimeout(() => res(null), 5000);
    const un = auth.onAuthStateChanged(u => { if (u) { clearTimeout(t); un(); res(u); } });
  });
  if (!user) { console.error('✗ 尚未登入後台，請先登入再執行。'); return; }

  const snap = await getDocs(collection(db, 'donations'));
  const targets = snap.docs.filter(d => (d.data().item || '').includes('卷'));
  if (!targets.length) { console.log('沒有需要修正的紀錄。'); return; }

  for (const d of targets) {
    const before = d.data().item;
    const after = before.replace(/卷/g, '券');
    await updateDoc(doc(db, 'donations', d.id), { item: after, updatedAt: serverTimestamp() });
    console.log(`  已修正：「${before}」→「${after}」`);
  }
  console.log(`\n完成：共修正 ${targets.length} 筆。請重新整理後台與前台確認。`);
})();
