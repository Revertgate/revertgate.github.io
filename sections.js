// The scroll story, the matcher morph in the rules bento, and the verdict wall.
// Loaded after app.js, whose top-level $, $$, sleep and calm it shares.
"use strict";

/* ---------------- Scroll story ---------------- */
const STORY_TESTS = [
  ["test_total", false], ["test_empty", true], ["test_discount", false],
  ["test_rounding", false], ["test_currency", false], ["test_refund", false],
];
const CI_LABELS = ["✓ CI passing", "↺ reverting…", "▶ running tests", "✗ blocked"];

function initStory() {
  const story = $("#story");
  if (!story) return;
  const stage = $("#stage");
  const steps = $$("#storySteps li");
  const tests = $("#stageTests");
  tests.innerHTML = STORY_TESTS.map(([name, skipped]) =>
    `<span class="trow${skipped ? " skipped" : ""}"><i></i>${name}${skipped ? " · skipped" : ""}</span>`
  ).join("") + '<span class="note">12 passed, with invoice.py reverted. These tests never touched the change.</span>';
  const rows = $$(".trow", tests);
  let shown = -1;
  let run = 0;

  const runTests = async () => {
    const id = ++run;
    rows.forEach((r) => r.classList.remove("ran"));
    for (const r of rows) {
      await sleep(calm ? 0 : 140);
      if (id !== run) return;
      r.classList.add("ran");
    }
  };
  const show = (n) => {
    if (n === shown) return;
    shown = n;
    stage.dataset.stage = String(n);
    $("#ci").textContent = CI_LABELS[n];
    steps.forEach((li, i) => li.classList.toggle("on", i === n));
    if (n >= 2) runTests();
    else { run++; rows.forEach((r) => r.classList.remove("ran")); }
  };
  const update = () => {
    const r = story.getBoundingClientRect();
    const span = Math.max(1, r.height - window.innerHeight);
    const p = Math.min(1, Math.max(0, -r.top / span));
    story.style.setProperty("--p", p.toFixed(3));
    $("#storyBar").style.setProperty("--p", p.toFixed(3));
    show(Math.min(3, Math.floor(p * 4)));
  };
  let queued = false;
  window.addEventListener("scroll", () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { update(); queued = false; });
  }, { passive: true });
  window.addEventListener("resize", update);
  update();
}

/* ---------------- Matcher morph ---------------- */
// toBe(36) is backspaced and retyped as toBeTruthy(), then back: the loosening in miniature.
async function initMorph() {
  const el = $("#morph");
  if (!el || calm) {
    if (el) { el.textContent = "toBeTruthy()"; el.classList.add("loose"); }
    return;
  }
  const words = ["toBe(36)", "toBeTruthy()"];
  for (let i = 0; ; i = 1 - i) {
    await sleep(1600);
    while (el.textContent.length > 4) {
      el.textContent = el.textContent.slice(0, -1);
      await sleep(70);
    }
    const next = words[1 - i];
    el.classList.toggle("loose", next === words[1]);
    for (const ch of next.slice(4)) {
      el.textContent += ch;
      await sleep(85);
    }
  }
}

/* ---------------- Verdict wall ---------------- */
// Illustrative verdicts, labelled as examples on the page: not real customers or repos.
const VERDICTS = [
  ["block", "pytest", "unproven-change", "with <code>billing.py</code> reverted, 41 tests still pass"],
  ["pass", "jest", "revert check", "reverted <code>cart.ts</code>: 3 tests fail. The tests catch the change"],
  ["block", "go test", "skip-added", "<code>t.Skip(\"flaky\")</code> added to <code>TestRefund</code>"],
  ["warn", "vitest", "matcher-loosened", "<code>toEqual(42)</code> became <code>toBeTruthy()</code>"],
  ["block", "cargo test", "skip-added", "<code>#[ignore]</code> on <code>parses_negative_amounts</code>"],
  ["block", "GitHub Actions", "gate-tampered", "<code>continue-on-error: true</code> on the test step"],
  ["pass", "pytest", "revert check", "reverted <code>tax.py</code>: <code>test_vat_rounding</code> fails"],
  ["warn", "eslint", "suppression-added", "<code>// eslint-disable-next-line</code> on a new line"],
  ["block", "jest", "focus-added", "<code>it.only(</code> would skip every other test"],
  ["block", "phpunit", "tests-removed", "net loss of 2 tests in <code>InvoiceTest.php</code>"],
  ["warn", "python", "error-swallowed", "<code>except Exception: pass</code> in <code>sync.py</code>"],
  ["pass", "go test", "revert check", "reverted <code>ledger.go</code>: 2 tests fail, per file ✓"],
  ["block", "npm", "test-command-changed", "<code>\"test\": \"jest --passWithNoTests\"</code>"],
  ["block", "rspec", "assertions-removed", "3 fewer <code>expect</code>s across the PR"],
  ["warn", "pytest", "untested-file", "reverting <code>utils.py</code> alone fails nothing"],
];
const TITLES = { block: "✗ blocked", pass: "✓ proven", warn: "! warning" };

function initWall() {
  const wall = $("#wallCols");
  if (!wall) return;
  const card = ([sev, stack, rule, msg]) =>
    `<div class="verdict-card ${sev}"><div class="vh"><span>${stack}</span><span>${rule}</span></div><div class="vt">${TITLES[sev]}</div><p>${msg}</p></div>`;
  [0, 1, 2].forEach((c) => {
    const items = VERDICTS.filter((_, i) => i % 3 === c).map(card).join("");
    const col = document.createElement("div");
    col.className = "wall-col";
    col.innerHTML = `<div class="wall-track" style="--dur:${38 + c * 9}s">${items}${items}</div>`;
    wall.append(col);
  });
}

initStory();
initMorph();
initWall();
