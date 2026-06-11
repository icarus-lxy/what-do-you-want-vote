const totalVoters = document.querySelector("#totalVoters");
const updatedAt = document.querySelector("#updatedAt");
const countA = document.querySelector("#countA");
const countB = document.querySelector("#countB");
const connectionStatus = document.querySelector("#connectionStatus");

function renderStats(stats) {
  totalVoters.textContent = stats.totalVoters;
  countA.textContent = stats.counts.A;
  countB.textContent = stats.counts.B;
  updatedAt.textContent = new Date(stats.updatedAt).toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

const events = new EventSource("/api/stats/stream");

events.onopen = () => {
  connectionStatus.textContent = "实时数据已连接，投票后这里会自动更新。";
};

events.onmessage = (event) => {
  renderStats(JSON.parse(event.data));
};

events.onerror = () => {
  connectionStatus.textContent = "实时连接暂时中断，页面会自动尝试重连。";
};
