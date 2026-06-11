const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const os = require("os");

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "0.0.0.0";
const DATA_DIR = path.join(__dirname, "data");
const DATA_FILE = path.join(DATA_DIR, "votes.json");
const PUBLIC_DIR = path.join(__dirname, "public");

const options = {
  A: "我更想要一些邪修小tips",
  B: "我更想要资源共享（多多益善）",
};

const clients = new Set();

function ensureDataFile() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ votes: [] }, null, 2), "utf8");
  }
}

function readVotes() {
  ensureDataFile();
  try {
    const data = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
    return Array.isArray(data.votes) ? data.votes : [];
  } catch {
    return [];
  }
}

function writeVotes(votes) {
  fs.writeFileSync(DATA_FILE, JSON.stringify({ votes }, null, 2), "utf8");
}

function getStats() {
  const votes = readVotes();
  const counts = { A: 0, B: 0 };

  for (const vote of votes) {
    for (const choice of vote.choices || []) {
      if (counts[choice] !== undefined) counts[choice] += 1;
    }
  }

  return {
    options,
    counts,
    totalVoters: votes.length,
    updatedAt: new Date().toISOString(),
  };
}

function getCookie(req, name) {
  const cookieHeader = req.headers.cookie || "";
  const cookies = Object.fromEntries(
    cookieHeader
      .split(";")
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const index = part.indexOf("=");
        return index === -1
          ? [part, ""]
          : [part.slice(0, index), decodeURIComponent(part.slice(index + 1))];
      })
  );
  return cookies[name];
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1024 * 1024) {
        req.destroy();
        reject(new Error("Request body is too large"));
      }
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error("Invalid JSON"));
      }
    });
  });
}

function sendJson(res, statusCode, payload, headers = {}) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    ...headers,
  });
  res.end(JSON.stringify(payload));
}

function broadcastStats() {
  const payload = `data: ${JSON.stringify(getStats())}\n\n`;
  for (const client of clients) {
    client.write(payload);
  }
}

function serveStatic(req, res) {
  const urlPath = new URL(req.url, `http://${req.headers.host}`).pathname;
  const normalizedPath = urlPath === "/" ? "/index.html" : decodeURIComponent(urlPath);
  const filePath = path.normalize(path.join(PUBLIC_DIR, normalizedPath));

  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentTypes = {
      ".html": "text/html; charset=utf-8",
      ".css": "text/css; charset=utf-8",
      ".js": "application/javascript; charset=utf-8",
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".webp": "image/webp",
      ".gif": "image/gif",
      ".svg": "image/svg+xml",
    };

    res.writeHead(200, {
      "Content-Type": contentTypes[ext] || "application/octet-stream",
    });
    res.end(content);
  });
}

async function handleVote(req, res) {
  const voterId = getCookie(req, "voter_id") || crypto.randomUUID();
  const votes = readVotes();

  if (votes.some((vote) => vote.voterId === voterId)) {
    sendJson(
      res,
      409,
      { ok: false, message: "你已经提交过啦，每个人只能提交一次。" },
      {
        "Set-Cookie": `voter_id=${encodeURIComponent(voterId)}; Max-Age=31536000; Path=/; SameSite=Lax`,
      }
    );
    return;
  }

  try {
    const body = await parseBody(req);
    const choices = Array.isArray(body.choices)
      ? [...new Set(body.choices)].filter((choice) => options[choice])
      : [];

    if (choices.length === 0) {
      sendJson(res, 400, { ok: false, message: "请至少选择一个选项。" });
      return;
    }

    votes.push({
      voterId,
      choices,
      createdAt: new Date().toISOString(),
    });
    writeVotes(votes);
    broadcastStats();

    sendJson(
      res,
      200,
      { ok: true, message: "提交成功，谢谢你的选择！", stats: getStats() },
      {
        "Set-Cookie": `voter_id=${encodeURIComponent(voterId)}; Max-Age=31536000; Path=/; SameSite=Lax`,
      }
    );
  } catch (error) {
    sendJson(res, 400, { ok: false, message: error.message });
  }
}

function handleStatsStream(req, res) {
  res.writeHead(200, {
    "Content-Type": "text/event-stream; charset=utf-8",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
  });
  res.write(`data: ${JSON.stringify(getStats())}\n\n`);

  clients.add(res);
  req.on("close", () => {
    clients.delete(res);
  });
}

function handleStatus(req, res) {
  const voterId = getCookie(req, "voter_id");
  const ownVote = voterId
    ? readVotes().find((vote) => vote.voterId === voterId)
    : null;

  sendJson(res, 200, {
    hasVoted: Boolean(ownVote),
    choices: ownVote ? ownVote.choices : [],
    stats: getStats(),
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === "POST" && url.pathname === "/api/vote") {
    await handleVote(req, res);
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/status") {
    handleStatus(req, res);
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/stats/stream") {
    handleStatsStream(req, res);
    return;
  }

  serveStatic(req, res);
});

function getLocalUrls() {
  const urls = [`http://localhost:${PORT}/`];
  const interfaces = os.networkInterfaces();

  for (const details of Object.values(interfaces)) {
    for (const item of details || []) {
      if (item.family === "IPv4" && !item.internal) {
        urls.push(`http://${item.address}:${PORT}/`);
      }
    }
  }

  return urls;
}

if (require.main === module) {
  ensureDataFile();
  server.listen(PORT, HOST, () => {
    console.log("");
    console.log("投票页面已启动。");
    console.log("");
    console.log("电脑打开：");
    console.log(`  http://localhost:${PORT}/`);
    console.log("");
    console.log("手机打开下面这种 192.168 开头的地址：");
    for (const url of getLocalUrls().filter((url) => !url.includes("localhost"))) {
      console.log(`  ${url}`);
    }
    console.log("");
    console.log("后台统计：");
    console.log(`  http://localhost:${PORT}/admin.html`);
    console.log("");
    console.log("注意：手机和电脑需要连同一个 Wi-Fi；如果 Windows 弹出网络访问提示，请选择允许。");
  });
}

module.exports = {
  server,
  getStats,
  readVotes,
  writeVotes,
};
