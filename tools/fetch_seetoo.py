#!/usr/bin/env python3
# 從 prof-seetoo.blogspot.com 的 Blogger Atom feed 抓取全部文章，
# 產出 data/seetoo_index.json（列表用）與 data/seetoo/c<nn>.json（內文，固定大小分塊延遲載入），
# 並把文章內嵌圖片下載到 images/seetoo/ 改為本地路徑。
# 內容已停更，此腳本平時不需重跑；需更新時執行 python3 tools/fetch_seetoo.py

import json, os, re, html, hashlib, subprocess, urllib.parse
from collections import defaultdict

FEED = "https://prof-seetoo.blogspot.com/feeds/posts/default"
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMG_DIR = os.path.join(ROOT, "images", "seetoo")
DATA_DIR = os.path.join(ROOT, "data")
PAGE = 150
CHUNK = 40  # 每個內文分塊的文章數
UA = "Mozilla/5.0 (compatible; nccuba-archive/1.0)"


def get(url, binary=False):
    # 這台機器的 Python 沒有 CA 憑證，改用系統 curl
    out = subprocess.run(
        ["curl", "-sL", "--fail", "--max-time", "60", "-A", UA, url],
        capture_output=True, check=True).stdout
    return out if binary else out.decode("utf-8", "replace")


def fetch_entries():
    entries, start = [], 1
    while True:
        url = f"{FEED}?alt=json&max-results={PAGE}&start-index={start}"
        feed = json.loads(get(url))["feed"]
        batch = feed.get("entry", [])
        if not batch:
            break
        entries += batch
        total = int(feed["openSearch$totalResults"]["$t"])
        start += PAGE
        print(f"  已取得 {len(entries)}/{total}")
        if len(entries) >= total:
            break
    return entries


def post_id(entry):
    # Blogger id 形如 tag:blogger.com,1999:blog-<blog>.post-<post>
    m = re.search(r"post-(\d+)", entry["id"]["$t"])
    return m.group(1) if m else hashlib.md5(entry["id"]["$t"].encode()).hexdigest()[:16]


def orig_link(entry):
    for l in entry.get("link", []):
        if l.get("rel") == "alternate" and l.get("type") == "text/html":
            return l.get("href", "")
    return ""


def localize_images(content, seen):
    """把 <img src> 指向的外部圖片下載到 images/seetoo/，並改寫為相對路徑。"""
    pat = re.compile(r'(<img\b[^>]*?\bsrc=)(["\'])(.*?)\2', re.I | re.S)

    def repl(m):
        prefix, src = m.group(1), html.unescape(m.group(3))
        if not src.startswith("http"):
            return m.group(0)
        if src in seen:
            return f'{prefix}"{seen[src]}"'
        ext = os.path.splitext(urllib.parse.urlparse(src).path)[1].lower()
        if ext not in (".jpg", ".jpeg", ".png", ".gif", ".webp"):
            ext = ".jpg"
        name = hashlib.md5(src.encode()).hexdigest()[:16] + ext
        path = os.path.join(IMG_DIR, name)
        rel = f"images/seetoo/{name}"
        if not os.path.exists(path):
            try:
                with open(path, "wb") as f:
                    f.write(get(src, binary=True))
                print(f"    圖片 {name}")
            except Exception as e:
                print(f"    圖片下載失敗 {src}: {e}")
                return m.group(0)
        seen[src] = rel
        return f'{prefix}"{rel}"'

    return pat.sub(repl, content)


VIDEO_HOSTS = ("youtube.com", "youtube-nocookie.com", "youtu.be", "player.vimeo.com")


def clean(content):
    """移除腳本與事件屬性，保留基本排版標籤。
    iframe 僅保留 YouTube／Vimeo 影片嵌入（部分文章整篇就只有一支影片），其餘剝除。"""
    c = re.sub(r"<(script|style)\b.*?</\1>", "", content, flags=re.I | re.S)

    def keep_video(m):
        tag = m.group(0)
        src = re.search(r'\bsrc=(["\'])(.*?)\1', tag, re.I)
        if src and any(h in src.group(2) for h in VIDEO_HOSTS):
            # 包一層容器，讓影片能隨版面等比縮放
            return '<div class="video-embed">' + tag + "</div>"
        return ""

    c = re.sub(r"<iframe\b.*?</iframe>", keep_video, c, flags=re.I | re.S)
    c = re.sub(r"\son\w+\s*=\s*(\"[^\"]*\"|'[^']*'|[^\s>]+)", "", c, flags=re.I)
    c = re.sub(r"</?(html|head|body|meta|link)\b[^>]*>", "", c, flags=re.I)
    # Blogger 常見的固定寬高屬性，會撐破版面（影片容器另以 CSS 處理）
    c = re.sub(r'\s(width|height)\s*=\s*"\d+"', "", c, flags=re.I)
    c = re.sub(r"[ \t]+\n", "\n", c)
    return c.strip()


def excerpt(content, n=110):
    t = re.sub(r"<[^>]+>", "", content)
    t = html.unescape(t).replace(" ", " ")
    t = re.sub(r"\s+", " ", t).strip()
    return t[:n] + ("…" if len(t) > n else "")


def main():
    os.makedirs(IMG_DIR, exist_ok=True)
    os.makedirs(os.path.join(DATA_DIR, "seetoo"), exist_ok=True)

    print("抓取 feed…")
    entries = fetch_entries()

    seen_imgs, index, bodies = {}, [], {}
    for e in entries:
        pid = post_id(e)
        title = e.get("title", {}).get("$t", "").strip() or "（無標題）"
        published = e.get("published", {}).get("$t", "")[:10]
        body = clean(localize_images(e.get("content", {}).get("$t", ""), seen_imgs))
        index.append({
            "id": pid, "title": title, "date": published,
            "year": published[:4] or "未分類", "excerpt": excerpt(body),
        })
        bodies[pid] = {"title": title, "date": published,
                       "body": body, "src": orig_link(e)}

    index.sort(key=lambda p: (p["date"], p["id"]), reverse=True)

    # 依排序後的順序切成固定大小的塊，時間相近的文章落在同一塊，
    # 讀者按年瀏覽時多半只會命中一兩個檔案。
    chunks = defaultdict(dict)
    for i, p in enumerate(index):
        cid = f"c{i // CHUNK:02d}"
        p["c"] = cid
        chunks[cid][p["id"]] = bodies[p["id"]]

    for old_file in os.listdir(os.path.join(DATA_DIR, "seetoo")):
        os.remove(os.path.join(DATA_DIR, "seetoo", old_file))

    with open(os.path.join(DATA_DIR, "seetoo_index.json"), "w", encoding="utf-8") as f:
        json.dump({"count": len(index), "posts": index}, f, ensure_ascii=False, separators=(",", ":"))
    for cid, posts in chunks.items():
        with open(os.path.join(DATA_DIR, "seetoo", f"{cid}.json"), "w", encoding="utf-8") as f:
            json.dump(posts, f, ensure_ascii=False, separators=(",", ":"))

    idx_kb = os.path.getsize(os.path.join(DATA_DIR, "seetoo_index.json")) / 1024
    sizes = [os.path.getsize(os.path.join(DATA_DIR, "seetoo", f"{c}.json")) / 1024 for c in chunks]
    print(f"\n完成：{len(index)} 篇、{len(chunks)} 個分塊、{len(seen_imgs)} 張圖片")
    print(f"  索引檔 {idx_kb:.1f} KB（首次載入）")
    print(f"  分塊 最小 {min(sizes):.1f} KB / 最大 {max(sizes):.1f} KB（開文章時才載入）")


if __name__ == "__main__":
    main()
