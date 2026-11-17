# 共響共享音樂會網頁

純 HTML / CSS / JavaScript，無外部執行期依賴，可直接部署至 GitHub Pages。

## 預覽與修改

從專案根目錄執行 `python -m http.server 8000 --bind 127.0.0.1`，開啟 http://127.0.0.1:8000/web/ 。

曲目在 `data/program.json` 修改，之後執行 `python scripts/build.py`，重新產生 `web/index.html`。頁面結構在 `web/template.html` 修改，外觀在 `web/styles.css`。請勿執行一次性資料匯入腳本 `scripts/prepare.py`，以免覆寫已修改的共用資料。

第 03、19 項採建議正式英文曲名；歌曲出處仍依規劃中的候選版本。未確定出處的項目不臆造作品名。

## GitHub Pages

建立 GcTzw/piano-annual-2026 repository，推送專案後，在 Settings → Pages 的 Source 選擇 GitHub Actions。本專案附 `.github/workflows/pages.yml`，只將 `web/` 作為公開網站內容；不會上傳原始 PDF、參考圖片、工具套件或投影片。

預計網址：https://gctzw.github.io/piano-annual-2026/ （尚未建立或部署）。上線後再產生正式 QR Code。

## 行為

- 上下半場錨點導覽、26 個原生 details 曲目展開、中場休息。
- 分享曲目連結；剪貼簿不可用時提示複製網址列。
- 無 JavaScript 仍能瀏覽全部內容；支援鍵盤與減少動態效果偏好。
- RWD：手機單欄、平板流式配置、桌面雙欄主視覺。
- 無自動播放聲音、無自動更新的演出進度。

節目單下載：主視覺「探索演出曲目」旁提供「下載節目單」按鈕，檔案為 `assets/concert-program.pdf`，目前使用原始 PDF；未來更換節目單時直接替換此檔。PDF 隨 web 目錄一併公開發布。
