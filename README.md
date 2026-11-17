# 2026 共響共享音樂會

靜態數位節目單，HTML / CSS / JavaScript，無執行期第三方依賴。

正式網址：https://gctzw.github.io/piano-annual-2026/

曲目資料：data/program.json。修改後執行 `python scripts/build.py`；頁面結構於 web/template.html，樣式於 web/styles.css。

本機預覽：`python -m http.server 8000 --bind 127.0.0.1`，瀏覽 http://127.0.0.1:8000/web/ 。

GitHub Actions 只發布 web/ 至 Pages。正式 QR Code 放於 ppt/assets/，供投影與印刷使用。
