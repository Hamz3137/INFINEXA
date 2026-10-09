const $ = (id) => document.getElementById(id);
const storageKey = "infinexa-progress-v1";
let state = { xp: 0, completed: [], name: "Cyber Explorer" };
try { state = { ...state, ...JSON.parse(localStorage.getItem(storageKey) || "{}") }; } catch (_) {}
const quizzes = {
  phishing: { title: "Spot the phishing", question: "Which is the safest response to an unexpected email asking you to verify your bank password?", options: ["Click the link and sign in quickly", "Reply with your password", "Avoid the link and verify through the bank's official app or website"], answer: 2, explain: "Correct! Use a trusted official channel and never share your password." , xp: 50 },
  password: { title: "Password protector", question: "Which habit gives your accounts stronger protection?", options: ["Reuse one easy password everywhere", "Use unique long passwords and a password manager", "Share passwords with a friend"], answer: 1, explain: "Correct! Unique passwords and a password manager reduce account risk." , xp: 75 },
  coding: { title: "Code logic sprint", question: "A variable starts at 2. You add 3 to it. What is the new value?", options: ["5", "23", "6"], answer: 0, explain: "Correct! 2 + 3 = 5. You're building your coding logic." , xp: 50 }
};
let activeQuiz = null;
let answered = false;
function save() { try { localStorage.setItem(storageKey, JSON.stringify(state)); } catch (_) {} updateProgress(); }
function updateProgress() {
  const xp = Number(state.xp || 0), level = Math.floor(xp / 300) + 1, within = xp % 300;
  $("xpText").textContent = `${within} / 300 XP`;
  $("xpBar").style.width = `${within / 3}%`;
  $("levelNum").textContent = String(level).padStart(2, "0");
  $("leaderLevel").textContent = String(level).padStart(2, "0");
  $("leaderXp").textContent = xp.toLocaleString();
  $("achFirst").classList.toggle("locked", state.completed.length < 1);
  $("achThree").classList.toggle("locked", state.completed.length < 3);
  $("achPro").classList.toggle("locked", xp < 300);
}
function toast(message) {
  const el = $("toast"); el.textContent = message; el.classList.add("show");
  clearTimeout(toast.timer); toast.timer = setTimeout(() => el.classList.remove("show"), 2600);
}
function openQuiz(key) {
  activeQuiz = quizzes[key]; answered = false;
  $("modalEyebrow").textContent = `QUICK CHALLENGE · ${activeQuiz.xp} XP`;
  $("modalTitle").textContent = activeQuiz.title;
  $("modalQuestion").textContent = activeQuiz.question;
  $("modalFeedback").textContent = "";
  $("modalDone").hidden = true;
  const options = $("modalOptions"); options.innerHTML = "";
  activeQuiz.options.forEach((option, index) => {
    const btn = document.createElement("button"); btn.className = "option-btn"; btn.textContent = option;
    btn.addEventListener("click", () => answerQuiz(index, btn)); options.appendChild(btn);
  });
  $("modalBackdrop").classList.add("show"); $("modalBackdrop").setAttribute("aria-hidden", "false");
}
function answerQuiz(index, button) {
  if (answered) return; answered = true;
  const buttons = [...$("modalOptions").querySelectorAll("button")];
  buttons.forEach((b, i) => { b.disabled = true; if (i === activeQuiz.answer) b.classList.add("correct"); });
  if (index === activeQuiz.answer) {
    button.classList.add("correct");
    const key = Object.keys(quizzes).find(k => quizzes[k] === activeQuiz);
    if (!state.completed.includes(key)) { state.completed.push(key); state.xp = Number(state.xp || 0) + activeQuiz.xp; save(); }
    $("modalFeedback").textContent = state.completed.includes(key) ? activeQuiz.explain + ` XP: ${state.xp}.` : activeQuiz.explain;
  } else {
    button.classList.add("wrong"); $("modalFeedback").textContent = "Not quite. Review the options and try again next time.";
  }
  $("modalDone").hidden = false; $("modalDone").textContent = "Back to learning";
}
function closeModal() { $("modalBackdrop").classList.remove("show"); $("modalBackdrop").setAttribute("aria-hidden", "true"); }
document.querySelectorAll(".quiz-launch").forEach(btn => btn.addEventListener("click", () => openQuiz(btn.dataset.quiz)));
document.querySelectorAll(".start-path").forEach(btn => btn.addEventListener("click", () => toast(`${btn.dataset.path}: lessons are part of the project demo. Try the challenges below!`)));
$("modalClose").addEventListener("click", closeModal);
$("modalDone").addEventListener("click", closeModal);
$("modalBackdrop").addEventListener("click", e => { if (e.target === $("modalBackdrop")) closeModal(); });
document.addEventListener("keydown", e => { if (e.key === "Escape") closeModal(); });
$("progressBtn").addEventListener("click", () => toast(`You have earned ${state.xp || 0} XP and completed ${(state.completed || []).length} challenge(s).`));
$("loginBtn").addEventListener("click", () => {
  const current = state.name || "Cyber Explorer";
  const name = prompt("Enter a display name for this browser:", current);
  if (name && name.trim()) { state.name = name.trim().slice(0, 28); $("playerName").textContent = state.name; save(); toast(`Welcome, ${state.name}!`); }
});
$("menuToggle").addEventListener("click", () => $("nav").classList.toggle("open"));
document.querySelectorAll("#nav a").forEach(a => a.addEventListener("click", () => $("nav").classList.remove("open")));
$("year").textContent = new Date().getFullYear();
$("playerName").textContent = state.name || "Cyber Explorer";
updateProgress();