:root {
  color-scheme: light;
  font-family: "Microsoft YaHei", "PingFang SC", Arial, sans-serif;
  background: #f6f3ec;
  color: #1e1d1a;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-height: 100vh;
}

.page {
  display: grid;
  min-height: 100vh;
  padding: 32px 18px;
  place-items: center;
}

.panel {
  width: min(680px, 100%);
  background: #fffdf7;
  border: 1px solid #ded6c6;
  border-radius: 8px;
  box-shadow: 0 18px 48px rgba(65, 50, 20, 0.12);
  padding: clamp(24px, 5vw, 44px);
}

.eyebrow {
  color: #8a5d1f;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0;
  margin: 0 0 10px;
}

h1 {
  font-size: clamp(34px, 8vw, 56px);
  line-height: 1;
  margin: 0 0 30px;
}

.vote-form {
  display: grid;
  gap: 14px;
}

.choice-card,
.stat-row,
.summary > div {
  align-items: center;
  background: #f9f5ea;
  border: 1px solid #ded6c6;
  border-radius: 8px;
  display: flex;
  gap: 14px;
  padding: 18px;
}

.choice-card {
  cursor: pointer;
  transition: border-color 160ms ease, transform 160ms ease, background 160ms ease;
}

.choice-card:hover {
  background: #fff8e7;
  border-color: #c8943d;
  transform: translateY(-1px);
}

.choice-card input {
  height: 20px;
  margin: 0;
  width: 20px;
}

.choice-key {
  align-items: center;
  background: #1e1d1a;
  border-radius: 999px;
  color: #fff;
  display: inline-flex;
  flex: 0 0 auto;
  font-weight: 800;
  height: 34px;
  justify-content: center;
  width: 34px;
}

.choice-text {
  font-size: 18px;
  line-height: 1.4;
}

button {
  background: #1e1d1a;
  border: 0;
  border-radius: 8px;
  color: #fff;
  cursor: pointer;
  font-size: 18px;
  font-weight: 700;
  margin-top: 8px;
  padding: 16px 20px;
}

button:disabled,
.choice-card.disabled {
  cursor: not-allowed;
  opacity: 0.62;
}

.message {
  color: #745016;
  line-height: 1.6;
  margin: 10px 0 0;
  min-height: 24px;
}

.summary {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  margin-bottom: 18px;
}

.summary > div {
  align-items: flex-start;
  flex-direction: column;
}

.summary strong {
  font-size: 28px;
}

.summary-label {
  color: #745016;
  font-size: 14px;
}

.stats-list {
  display: grid;
  gap: 12px;
}

.stat-row {
  justify-content: space-between;
}

.stat-row > div {
  align-items: center;
  display: flex;
  gap: 12px;
  min-width: 0;
}

.stat-row strong {
  flex: 0 0 auto;
  font-size: 22px;
}

.image-modal {
  align-items: center;
  display: flex;
  inset: 0;
  justify-content: center;
  padding: 20px;
  position: fixed;
  z-index: 20;
}

.image-modal[hidden] {
  display: none;
}

.image-modal-backdrop {
  background: rgba(30, 29, 26, 0.6);
  inset: 0;
  position: absolute;
}

.image-modal-content {
  background: #fffdf7;
  border-radius: 8px;
  box-shadow: 0 20px 70px rgba(0, 0, 0, 0.28);
  max-height: min(720px, 90vh);
  max-width: min(760px, 92vw);
  padding: 12px;
  position: relative;
}

.image-modal-content img {
  border-radius: 6px;
  display: block;
  max-height: calc(90vh - 24px);
  max-width: 100%;
}

.modal-close {
  align-items: center;
  background: #1e1d1a;
  border-radius: 999px;
  display: inline-flex;
  font-size: 24px;
  height: 36px;
  justify-content: center;
  line-height: 1;
  padding: 0;
  position: absolute;
  right: -12px;
  top: -12px;
  width: 36px;
}

@media (max-width: 560px) {
  .summary {
    grid-template-columns: 1fr;
  }

  .stat-row {
    align-items: flex-start;
    flex-direction: column;
  }
}
