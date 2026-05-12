# Belora 公式サイト

[belora.jp](https://belora.jp) — 株式会社Belora のサージカルルーペ公式サイト。

## 構成

- **静的サイト**（HTML / CSS / JavaScript）
- **ホスティング**: Vercel
- **ドメイン**: お名前.com 管理 / belora.jp
- **コンタクトフォーム送信先**: Google Apps Script

## ファイル

| ファイル | 用途 |
|---|---|
| `index.html` | メインページ（SPA構成、全セクションを内包） |
| `thank-you.html` | フォーム送信完了ページ |
| `Johannes_Vermeer_-_The_lacemaker_(c.1669-1671).jpg` | PRODUCTSページの設計の原点セクション画像 |

## ローカルプレビュー

任意のローカルサーバーで `index.html` を開けばOK。

```powershell
# 例：Python標準のHTTPサーバー
python -m http.server 8000
# → http://localhost:8000 を開く
```

## デプロイフロー

Vercel と GitHub を連携することで、`main` ブランチへのpushで自動デプロイされる構成。

```
ローカル編集 → git commit → git push origin main → Vercel自動ビルド → belora.jp に反映
```

## 開発上のメモ

- 医療従事者確認モーダルあり（薬機法対応）
- 全ページが `display:none` 切替の SPA構成 → SEO改善のため将来的に独立HTMLへ分離検討
- お問合せフォームは Google Apps Script (GAS) を経由してメール送信

## ライセンス

© Belora Inc. All Rights Reserved.
