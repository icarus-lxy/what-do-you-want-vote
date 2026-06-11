const form = document.querySelector("#voteForm");
const message = document.querySelector("#message");
const submitButton = form.querySelector("button");
const imageModal = document.querySelector("#imageModal");

function shouldShowImage(choices) {
  return choices.includes("A") && choices.includes("B");
}

function setVotedState(text, choices = []) {
  submitButton.disabled = true;
  submitButton.textContent = "已提交";
  form.querySelectorAll("input").forEach((input) => {
    input.disabled = true;
    input.checked = choices.includes(input.value);
  });
  form.querySelectorAll(".choice-card").forEach((card) => {
    card.classList.add("disabled");
  });
  imageModal.hidden = !shouldShowImage(choices);
  message.textContent = text;
}

document.querySelectorAll("[data-close-modal]").forEach((control) => {
  control.addEventListener("click", () => {
    imageModal.hidden = true;
  });
});

async function loadStatus() {
  const response = await fetch("/api/status");
  const data = await response.json();

  if (data.hasVoted) {
    setVotedState("你已经提交过啦，每个人只能提交一次。", data.choices || []);
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const choices = [...form.querySelectorAll("input[name='choice']:checked")].map(
    (input) => input.value
  );

  if (choices.length === 0) {
    message.textContent = "请至少选择一个选项。";
    return;
  }

  submitButton.disabled = true;
  message.textContent = "正在提交...";

  const response = await fetch("/api/vote", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ choices }),
  });
  const data = await response.json();

  if (data.ok) {
    setVotedState(data.message, choices);
  } else {
    submitButton.disabled = false;
    message.textContent = data.message || "提交失败，请再试一次。";
  }
});

loadStatus().catch(() => {
  message.textContent = "暂时无法读取提交状态，但你仍可以尝试提交。";
});
