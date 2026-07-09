const STORAGE_KEY = "smallStepKidHelper.v1";

const FEELINGS = [
  "我觉得太难了",
  "我有点生气",
  "我想哭",
  "我不想做",
  "我不知道怎么开始",
  "我需要大人帮忙"
];

const BODY_FEELINGS = [
  "脑子很乱",
  "心里很急",
  "想离开",
  "想哭",
  "身体很紧",
  "不知道"
];

const NEXT_STEPS = [
  "找大人帮我读题",
  "我先做第一题",
  "我先写名字",
  "我先休息5分钟",
  "今天这个任务需要拆小一点"
];

const TASK_STEPS = [
  "拿出需要的东西",
  "找到今天要做的地方",
  "先做第一小步",
  "做完3-5分钟后暂停一下",
  "勾选完成",
  "找大人确认"
];

const DEFAULT_EMOTION_CARDS = [
  { category: "冷静下来", text: "先把脚放在地上，慢慢吸气，再慢慢呼气。做三次就好。" },
  { category: "冷静下来", text: "先喝一口水。现在不用解决全部问题。" },
  { category: "开始任务", text: "先拿出一样需要的东西。只做这一步。" },
  { category: "开始任务", text: "先找到第一题或第一页，不急着全部做完。" },
  { category: "遇到挫折", text: "这一步有点难，不代表你不会。可以先圈出看不懂的地方。" },
  { category: "遇到挫折", text: "先停一下，说出：我卡在这里了。" },
  { category: "需要帮助", text: "可以请大人帮你读题，但答案先让你自己想一想。" },
  { category: "需要帮助", text: "可以说：请陪我做第一小步。" }
];

let state = loadState();
let editingCardId = null;
let stuckFlow = {
  step: 1,
  feeling: "",
  body: "",
  calm: "",
  next: ""
};

const els = {};

document.addEventListener("DOMContentLoaded", () => {
  bindElements();
  ensureToday();
  bindEvents();
  renderAll();
  registerServiceWorker();
});

function bindElements() {
  els.homeBtn = document.querySelector("#homeBtn");
  els.pageTitle = document.querySelector("#pageTitle");
  els.dateInput = document.querySelector("#dateInput");
  els.views = document.querySelectorAll(".view");
  els.homeButtons = document.querySelectorAll(".home-button");
  els.oldRule = document.querySelector("#oldRule");
  els.ruleChange = document.querySelector("#ruleChange");
  els.ruleReason = document.querySelector("#ruleReason");
  els.ruleNeed = document.querySelector("#ruleNeed");
  els.ruleChoiceA = document.querySelector("#ruleChoiceA");
  els.ruleChoiceB = document.querySelector("#ruleChoiceB");
  els.saveRuleBtn = document.querySelector("#saveRuleBtn");
  els.rulePreview = document.querySelector("#rulePreview");
  els.drawCardBtn = document.querySelector("#drawCardBtn");
  els.drawCardCategory = document.querySelector("#drawCardCategory");
  els.drawnCard = document.querySelector("#drawnCard");
  els.customCardCategory = document.querySelector("#customCardCategory");
  els.customCardText = document.querySelector("#customCardText");
  els.saveCardBtn = document.querySelector("#saveCardBtn");
  els.customCardList = document.querySelector("#customCardList");
  els.stuckStepBadge = document.querySelector("#stuckStepBadge");
  els.stuckQuestion = document.querySelector("#stuckQuestion");
  els.stuckOptions = document.querySelector("#stuckOptions");
  els.calmBox = document.querySelector("#calmBox");
  els.nextSmallStep = document.querySelector("#nextSmallStep");
  els.taskName = document.querySelector("#taskName");
  els.taskSteps = document.querySelector("#taskSteps");
  els.saveTaskBtn = document.querySelector("#saveTaskBtn");
  els.startTaskBtn = document.querySelector("#startTaskBtn");
  els.firstStepDoneBtn = document.querySelector("#firstStepDoneBtn");
  els.taskHelpBtn = document.querySelector("#taskHelpBtn");
  els.taskBreakBtn = document.querySelector("#taskBreakBtn");
  els.finishTaskBtn = document.querySelector("#finishTaskBtn");
  els.taskMessage = document.querySelector("#taskMessage");
  els.taskHistory = document.querySelector("#taskHistory");
  els.bookTitle = document.querySelector("#bookTitle");
  els.readingMinutes = document.querySelector("#readingMinutes");
  els.favoriteCharacter = document.querySelector("#favoriteCharacter");
  els.rememberedLine = document.querySelector("#rememberedLine");
  els.bookStars = document.querySelector("#bookStars");
  els.drawIdea = document.querySelector("#drawIdea");
  els.saveReadingBtn = document.querySelector("#saveReadingBtn");
  els.readingSentence = document.querySelector("#readingSentence");
  els.reviewDone = document.querySelector("#reviewDone");
  els.reviewHard = document.querySelector("#reviewHard");
  els.reviewFeeling = document.querySelector("#reviewFeeling");
  els.reviewCameOut = document.querySelector("#reviewCameOut");
  els.reviewTomorrow = document.querySelector("#reviewTomorrow");
  els.saveReviewBtn = document.querySelector("#saveReviewBtn");
  els.parentTask = document.querySelector("#parentTask");
  els.parentReason = document.querySelector("#parentReason");
  els.parentHelp = document.querySelector("#parentHelp");
  els.parentReduce = document.querySelector("#parentReduce");
  els.parentRule = document.querySelector("#parentRule");
  els.saveParentBtn = document.querySelector("#saveParentBtn");
  els.generateSummaryBtn = document.querySelector("#generateSummaryBtn");
  els.summaryOutput = document.querySelector("#summaryOutput");
  els.exportBtn = document.querySelector("#exportBtn");
  els.importBtn = document.querySelector("#importBtn");
  els.importFile = document.querySelector("#importFile");
  els.syncStatus = document.querySelector("#syncStatus");
}

function bindEvents() {
  els.homeBtn.addEventListener("click", () => showView("homeView"));
  els.homeButtons.forEach(button => {
    button.addEventListener("click", () => showView(button.dataset.view));
  });

  els.dateInput.addEventListener("change", () => {
    state.activeDate = els.dateInput.value || todayString();
    ensureDay(state.activeDate);
    saveState();
    renderAll();
  });

  document.querySelectorAll(".calm-choice").forEach(button => {
    button.addEventListener("click", () => {
      stuckFlow.calm = button.dataset.calm;
      els.nextSmallStep.classList.remove("hidden");
      setTimeout(() => {
        stuckFlow.step = 4;
        renderStuckFlow();
      }, 500);
    });
  });

  [els.oldRule, els.ruleChange, els.ruleReason, els.ruleNeed, els.ruleChoiceA, els.ruleChoiceB].forEach(input => {
    input.addEventListener("input", updateRulePreview);
  });
  els.saveRuleBtn.addEventListener("click", saveRuleChange);
  els.drawCardBtn.addEventListener("click", drawEmotionCard);
  els.saveCardBtn.addEventListener("click", saveCustomCard);
  els.saveTaskBtn.addEventListener("click", saveCurrentTask);
  els.startTaskBtn.addEventListener("click", startTask);
  els.firstStepDoneBtn.addEventListener("click", markFirstStepDone);
  els.taskHelpBtn.addEventListener("click", () => addTaskSignal("需要帮助"));
  els.taskBreakBtn.addEventListener("click", () => addTaskSignal("想休息5分钟"));
  els.finishTaskBtn.addEventListener("click", finishTask);

  [els.bookTitle, els.favoriteCharacter].forEach(input => {
    input.addEventListener("input", updateReadingSentence);
  });
  els.saveReadingBtn.addEventListener("click", saveReading);
  els.saveReviewBtn.addEventListener("click", saveReview);
  els.saveParentBtn.addEventListener("click", saveParentNote);
  els.generateSummaryBtn.addEventListener("click", generateSummary);
  els.exportBtn.addEventListener("click", exportData);
  els.importBtn.addEventListener("click", () => els.importFile.click());
  els.importFile.addEventListener("change", importData);
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && saved.days) return saved;
  } catch (error) {
    console.warn("Could not load local data.", error);
  }
  return { activeDate: todayString(), days: {} };
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function todayString() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

function ensureToday() {
  state.activeDate = state.activeDate || todayString();
  state.customCards = state.customCards || [];
  ensureDay(state.activeDate);
  saveState();
}

function ensureDay(date) {
  if (!state.days[date]) {
    state.days[date] = {
      stuckRecords: [],
      tasks: [],
      currentTask: makeEmptyTask(),
      reading: {},
      review: {},
      parentNote: {},
      ruleChange: {},
      summaries: []
    };
  }
}

function makeEmptyTask() {
  return {
    name: "",
    started: false,
    completed: false,
    steps: TASK_STEPS.map(text => ({ text, done: false })),
    signals: []
  };
}

function getDay() {
  ensureDay(state.activeDate);
  return state.days[state.activeDate];
}

function showView(viewId) {
  els.views.forEach(view => view.classList.toggle("active", view.id === viewId));
  els.homeBtn.classList.toggle("hidden", viewId === "homeView");
  const titles = {
    homeView: "小步助手",
    stuckView: "我现在卡住了",
    taskView: "开始一个小任务",
    readingView: "今日阅读",
    reviewView: "晚上复盘"
  };
  els.pageTitle.textContent = titles[viewId] || "小步助手";
  if (viewId === "stuckView") resetStuckFlow();
}

function renderAll() {
  els.dateInput.value = state.activeDate;
  renderTask();
  renderTaskHistory();
  renderReading();
  renderReview();
  renderParentNote();
  renderRuleChange();
  renderCustomCards();
  renderSummary();
  renderStuckFlow();
}

function renderRuleChange() {
  const rule = getDay().ruleChange || {};
  els.oldRule.value = rule.oldRule || "";
  els.ruleChange.value = rule.change || "";
  els.ruleReason.value = rule.reason || "";
  els.ruleNeed.value = rule.need || "";
  els.ruleChoiceA.value = rule.choiceA || "";
  els.ruleChoiceB.value = rule.choiceB || "";
  updateRulePreview();
}

function updateRulePreview() {
  const oldRule = els.oldRule.value.trim() || "原来的安排";
  const change = els.ruleChange.value.trim() || "今天会有一点不同";
  const reason = els.ruleReason.value.trim() || "今天的时间安排有变化";
  const need = els.ruleNeed.value.trim() || "先知道下一步要做什么";
  const choiceA = els.ruleChoiceA.value.trim() || "选择一个现在能做的小办法";
  const choiceB = els.ruleChoiceB.value.trim() || "选择一个稍后完成的办法";

  els.rulePreview.textContent = `今天有一个小变化。原来我们${oldRule}，今天因为${reason}，所以${change}。变化后你需要${need}。你可以选择${choiceA}，或者${choiceB}。`;
}

function saveRuleChange() {
  getDay().ruleChange = {
    oldRule: els.oldRule.value.trim(),
    change: els.ruleChange.value.trim(),
    reason: els.ruleReason.value.trim(),
    need: els.ruleNeed.value.trim(),
    choiceA: els.ruleChoiceA.value.trim(),
    choiceB: els.ruleChoiceB.value.trim(),
    preview: els.rulePreview.textContent,
    savedAt: new Date().toISOString()
  };
  saveState();
}

function allEmotionCards() {
  return DEFAULT_EMOTION_CARDS.concat(state.customCards || []);
}

function drawEmotionCard() {
  const category = els.drawCardCategory.value;
  const cards = allEmotionCards().filter(card => category === "all" || card.category === category);
  if (!cards.length) {
    els.drawnCard.textContent = "这个分类暂时没有卡片。";
    return;
  }
  const card = cards[Math.floor(Math.random() * cards.length)];
  els.drawnCard.textContent = `${card.category}：${card.text}`;
}

function saveCustomCard() {
  const text = els.customCardText.value.trim();
  if (!text) {
    els.drawnCard.textContent = "请先写一张卡片内容。";
    return;
  }

  state.customCards = state.customCards || [];
  if (editingCardId) {
    const card = state.customCards.find(item => item.id === editingCardId);
    if (card) {
      card.category = els.customCardCategory.value;
      card.text = text;
      card.updatedAt = new Date().toISOString();
    }
    editingCardId = null;
    els.saveCardBtn.textContent = "新增卡片";
  } else {
    state.customCards.push({
      id: String(Date.now()),
      category: els.customCardCategory.value,
      text,
      createdAt: new Date().toISOString()
    });
  }

  els.customCardText.value = "";
  saveState();
  renderCustomCards();
}

function renderCustomCards() {
  state.customCards = state.customCards || [];
  els.customCardList.innerHTML = "";

  if (!state.customCards.length) {
    els.customCardList.innerHTML = `<p class="muted">还没有自定义卡片。默认卡片已经可以抽取。</p>`;
    return;
  }

  state.customCards.forEach(card => {
    const item = document.createElement("article");
    item.className = "card-item";
    item.innerHTML = `
      <div>
        <strong>${escapeHtml(card.category)}</strong>
        <span>${escapeHtml(card.text)}</span>
      </div>
      <div class="card-actions">
        <button class="soft-button" type="button" data-action="edit">编辑</button>
        <button class="soft-button" type="button" data-action="delete">删除</button>
      </div>
    `;
    item.querySelector('[data-action="edit"]').addEventListener("click", () => {
      editingCardId = card.id;
      els.customCardCategory.value = card.category;
      els.customCardText.value = card.text;
      els.saveCardBtn.textContent = "保存修改";
    });
    item.querySelector('[data-action="delete"]').addEventListener("click", () => {
      const ok = window.confirm("确定删除这张自定义卡片吗？");
      if (!ok) return;
      state.customCards = state.customCards.filter(itemCard => itemCard.id !== card.id);
      if (editingCardId === card.id) {
        editingCardId = null;
        els.customCardText.value = "";
        els.saveCardBtn.textContent = "新增卡片";
      }
      saveState();
      renderCustomCards();
    });
    els.customCardList.appendChild(item);
  });
}

function resetStuckFlow() {
  stuckFlow = { step: 1, feeling: "", body: "", calm: "", next: "" };
  renderStuckFlow();
}

function renderStuckFlow() {
  els.calmBox.classList.toggle("hidden", stuckFlow.step !== 3);
  els.nextSmallStep.classList.add("hidden");
  els.stuckOptions.innerHTML = "";

  if (stuckFlow.step === 1) {
    els.stuckStepBadge.textContent = "第 1 步";
    els.stuckQuestion.textContent = "现在是什么感觉？";
    renderChoiceButtons(FEELINGS, value => {
      stuckFlow.feeling = value;
      stuckFlow.step = 2;
      renderStuckFlow();
    });
    return;
  }

  if (stuckFlow.step === 2) {
    els.stuckStepBadge.textContent = "第 2 步";
    els.stuckQuestion.textContent = "身体有什么感觉？";
    renderChoiceButtons(BODY_FEELINGS, value => {
      stuckFlow.body = value;
      stuckFlow.step = 3;
      renderStuckFlow();
    });
    return;
  }

  if (stuckFlow.step === 3) {
    els.stuckStepBadge.textContent = "第 3 步";
    els.stuckQuestion.textContent = "先让身体安静一点";
    return;
  }

  els.stuckStepBadge.textContent = "第 4 步";
  els.stuckQuestion.textContent = "现在只做下一小步。";
  renderChoiceButtons(NEXT_STEPS, value => {
    stuckFlow.next = value;
    saveStuckRecord();
    showView("homeView");
  });
}

function renderChoiceButtons(options, onClick) {
  options.forEach(option => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = option;
    button.addEventListener("click", () => onClick(option));
    els.stuckOptions.appendChild(button);
  });
}

function saveStuckRecord() {
  const day = getDay();
  day.stuckRecords.push({
    feeling: stuckFlow.feeling,
    body: stuckFlow.body,
    calm: stuckFlow.calm,
    next: stuckFlow.next,
    createdAt: new Date().toISOString()
  });
  saveState();
}

function renderTask() {
  const task = getDay().currentTask || makeEmptyTask();
  els.taskName.value = task.name || "";
  els.taskSteps.innerHTML = "";
  task.steps.forEach((step, index) => {
    const label = document.createElement("label");
    label.className = `task-step ${step.done ? "done" : ""}`;
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = step.done;
    checkbox.addEventListener("change", () => {
      step.done = checkbox.checked;
      saveState();
      renderTask();
    });
    const text = document.createElement("span");
    text.textContent = `${index + 1}. ${step.text}`;
    label.append(checkbox, text);
    els.taskSteps.appendChild(label);
  });
}

function saveCurrentTask() {
  const day = getDay();
  day.currentTask = day.currentTask || makeEmptyTask();
  day.currentTask.name = els.taskName.value.trim();
  saveState();
  els.taskMessage.textContent = day.currentTask.name ? "任务已保存。现在只做第一小步。" : "请先写一个任务名称。";
}

function startTask() {
  const day = getDay();
  day.currentTask = day.currentTask || makeEmptyTask();
  day.currentTask.name = els.taskName.value.trim() || "一个小任务";
  day.currentTask.started = true;
  day.currentTask.signals.push({ type: "开始", at: new Date().toISOString() });
  saveState();
  els.taskMessage.textContent = "开始了。先拿出需要的东西。";
  renderTask();
}

function markFirstStepDone() {
  const day = getDay();
  day.currentTask.steps[0].done = true;
  day.currentTask.signals.push({ type: "完成第一步", at: new Date().toISOString() });
  saveState();
  els.taskMessage.textContent = "第一步完成。现在看今天要做的地方。";
  renderTask();
}

function addTaskSignal(type) {
  const day = getDay();
  day.currentTask.signals.push({ type, at: new Date().toISOString() });
  saveState();
  els.taskMessage.textContent = type === "需要帮助" ? "可以请大人读题或陪你做第一小步。" : "可以休息5分钟，回来只做下一小步。";
}

function finishTask() {
  const day = getDay();
  const task = day.currentTask || makeEmptyTask();
  task.name = els.taskName.value.trim() || task.name || "一个小任务";
  task.completed = true;
  task.finishedAt = new Date().toISOString();
  day.tasks.push(task);
  day.currentTask = makeEmptyTask();
  saveState();
  els.taskMessage.textContent = "任务完成。可以找大人确认。";
  renderTask();
  renderTaskHistory();
}

function renderTaskHistory() {
  const tasks = getDay().tasks;
  els.taskHistory.innerHTML = "";
  tasks.slice().reverse().forEach(task => {
    const card = document.createElement("article");
    card.className = "history-card";
    card.innerHTML = `<strong>${escapeHtml(task.name)}</strong><p>已完成 ${task.steps.filter(step => step.done).length}/${task.steps.length} 步</p>`;
    els.taskHistory.appendChild(card);
  });
}

function renderReading() {
  const reading = getDay().reading || {};
  els.bookTitle.value = reading.bookTitle || "";
  els.readingMinutes.value = reading.minutes || "";
  els.favoriteCharacter.value = reading.character || "";
  els.rememberedLine.value = reading.line || "";
  els.bookStars.value = reading.stars || "5";
  els.drawIdea.value = reading.draw || "";
  updateReadingSentence();
}

function updateReadingSentence() {
  const book = els.bookTitle.value.trim() || "____";
  const character = els.favoriteCharacter.value.trim() || "____";
  els.readingSentence.textContent = `今天我读了《${book}》，我最喜欢${character}，因为____。`;
}

function saveReading() {
  getDay().reading = {
    bookTitle: els.bookTitle.value.trim(),
    minutes: els.readingMinutes.value,
    character: els.favoriteCharacter.value.trim(),
    line: els.rememberedLine.value.trim(),
    stars: els.bookStars.value,
    draw: els.drawIdea.value.trim(),
    sentence: els.readingSentence.textContent,
    savedAt: new Date().toISOString()
  };
  saveState();
  els.readingSentence.textContent = `${els.readingSentence.textContent} 已保存。`;
}

function renderReview() {
  const review = getDay().review || {};
  els.reviewDone.value = review.done || "";
  els.reviewHard.value = review.hard || "";
  els.reviewFeeling.value = review.feeling || "";
  els.reviewCameOut.value = review.cameOut || "";
  els.reviewTomorrow.value = review.tomorrow || "";
}

function saveReview() {
  getDay().review = {
    done: els.reviewDone.value.trim(),
    hard: els.reviewHard.value.trim(),
    feeling: els.reviewFeeling.value.trim(),
    cameOut: els.reviewCameOut.value.trim(),
    tomorrow: els.reviewTomorrow.value.trim(),
    savedAt: new Date().toISOString()
  };
  saveState();
  showView("homeView");
}

function renderParentNote() {
  const note = getDay().parentNote || {};
  els.parentTask.value = note.task || "";
  els.parentReason.value = note.reason || "";
  els.parentHelp.value = note.help || "";
  els.parentReduce.value = note.reduce || "";
  els.parentRule.value = note.rule || "";
}

function saveParentNote() {
  getDay().parentNote = {
    task: els.parentTask.value.trim(),
    reason: els.parentReason.value,
    help: els.parentHelp.value.trim(),
    reduce: els.parentReduce.value.trim(),
    rule: els.parentRule.value.trim(),
    savedAt: new Date().toISOString()
  };
  saveState();
}

function generateSummary() {
  const day = getDay();
  const completed = [];
  day.tasks.forEach(task => completed.push(task.name));
  if (day.reading?.bookTitle) completed.push(`阅读《${day.reading.bookTitle}》${day.reading.minutes ? `${day.reading.minutes}分钟` : ""}`);
  if (day.review?.done) completed.push(day.review.done);

  const stuck = [];
  day.stuckRecords.forEach(record => stuck.push(`${record.feeling}，身体感觉：${record.body}`));
  if (day.parentNote?.task) stuck.push(`${day.parentNote.task}：${day.parentNote.reason || "需要观察"}`);
  if (day.review?.hard) stuck.push(day.review.hard);

  const helps = [];
  day.stuckRecords.forEach(record => helps.push(`${record.calm || "暂停一下"}，然后${record.next}`));
  if (day.parentNote?.help) helps.push(day.parentNote.help);
  if (day.review?.cameOut) helps.push(day.review.cameOut);

  const tomorrow = [];
  if (day.review?.tomorrow) tomorrow.push(day.review.tomorrow);
  if (day.parentNote?.reduce) tomorrow.push(`减少压力：${day.parentNote.reduce}`);
  if (day.parentNote?.rule) tomorrow.push(`提前说明：${day.parentNote.rule}`);
  if (day.ruleChange?.preview) tomorrow.push(`规则变化预告：${day.ruleChange.preview}`);

  const summary = [
    "今日完成：",
    ...numbered(completed, ["暂无记录"]),
    "",
    "今天卡住的地方：",
    ...numbered(stuck, ["暂无明显卡住记录"]),
    "",
    "有效帮助：",
    ...numbered(helps, ["继续观察哪种帮助有效"]),
    "",
    "明天建议：",
    ...numbered(tomorrow, ["先从一个很小的步骤开始"])
  ].join("\n");

  day.summaries.push({ text: summary, createdAt: new Date().toISOString() });
  saveState();
  els.summaryOutput.value = summary;
}

function renderSummary() {
  const summaries = getDay().summaries;
  els.summaryOutput.value = summaries.length ? summaries[summaries.length - 1].text : "";
}

function numbered(items, fallback) {
  const list = items.filter(Boolean);
  return (list.length ? list : fallback).map((item, index) => `${index + 1}. ${item}`);
}

function exportData() {
  const payload = {
    app: "smallStepKidHelper",
    version: 1,
    exportedAt: new Date().toISOString(),
    data: state
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `small-step-helper-${todayString()}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  els.syncStatus.textContent = "数据已导出。";
}

function importData(event) {
  const file = event.target.files[0];
  event.target.value = "";
  if (!file) return;

  const ok = window.confirm("导入数据会覆盖当前设备里的本地数据。确定继续吗？");
  if (!ok) return;

  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      const imported = parsed.data || parsed;
      if (!imported || !imported.days) throw new Error("Invalid data");
      state = imported;
      state.activeDate = state.activeDate || todayString();
      ensureDay(state.activeDate);
      saveState();
      renderAll();
      showView("homeView");
      els.syncStatus.textContent = "数据已导入。";
    } catch (error) {
      window.alert("导入失败：请选择这个小程序导出的 JSON 文件。");
    }
  };
  reader.readAsText(file);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;

  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js").catch(error => {
      console.warn("Service worker registration failed.", error);
    });
  });
}
