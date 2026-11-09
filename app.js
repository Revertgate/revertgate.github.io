// Revertgate site: the hero terminal, the cheat playground, and the small motions around them.
// Every string rendered as HTML below is written here, never taken from the visitor.
"use strict";

// ?motion in the URL plays every animation even when the system asks for reduced motion.
const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches && !new URLSearchParams(location.search).has("motion");
if (!calm) document.documentElement.classList.add("motion");
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* ---------------- Checkout links ---------------- */
$$("[data-plan]").forEach((a) => {
  const url = typeof CHECKOUT === "object" ? CHECKOUT[a.dataset.plan] : "";
  if (url) a.href = url;
});

/* ---------------- Background code rain ---------------- */
const RAIN = [
  "$ git diff main...HEAD --stat", " invoice.py        | 4 +++-", " tests/test_invoice | 2 +-",
  "- return sum(p * q for p, q in items)", "+ return round(subtotal * 1.2)", "@@ -1,3 +1,5 @@",
  "$ python -m pytest -q", "............ 12 passed in 0.41s", "reverting invoice.py → main",
  "FAILED tests/test_invoice.py::test_discount", "assert 20 == 10", "✓ the tests catch this change",
  "✗ unproven-change", "✗ skip-added  @pytest.mark.skip", "! matcher-loosened", "! error-swallowed",
  "$ cargo test --quiet", "test result: ok. 48 passed", "$ npm test --silent", "Tests: 31 passed, 31 total",
  "continue-on-error: true", "it.skip('handles refunds'", "expect(total).toBeTruthy()", "except: pass",
  "#[ignore]", "t.Skip(\"flaky\")", "go test ./...", "ok  	shop/billing	0.112s", "verdict: fail",
];
function buildRain() {
  const box = $(".code-rain");
  if (!box) return;
  for (let c = 0; c < 7; c++) {
    const lines = Array.from({ length: 28 }, (_, i) => RAIN[(i * 7 + c * 11) % RAIN.length]);
    const pre = document.createElement("pre");
    pre.textContent = [...lines, ...lines].join("\n");
    pre.style.setProperty("--dur", `${34 + c * 7}s`);
    pre.style.marginTop = `${(c * 37) % 120}px`;
    box.append(pre);
  }
}

/* ---------------- Hero terminal ---------------- */
// Each scene replays one of the demo repository's real pull requests.
const SCENES = {
  cheat: {
    word: "faking it",
    steps: [
      ["cmd", "gh pr checks 142"],
      ["out", '<span class="ok">✓</span> Tests <span class="dim">·</span> <span class="ok">12 passed</span>   <span class="ok">✓</span> lint', 300],
      ["out", '<span class="dim"># green. ship it? let\'s make the tests prove it.</span>', 500],
      ["cmd", "revertgate check --base main"],
      ["out", '<span class="cy">→</span> diff: invoice.py <span class="ok">+4</span> <span class="bad">−1</span>, tests/test_invoice.py <span class="ok">+2</span> <span class="bad">−2</span>', 350],
      ["out", '<span class="cy">→</span> reverting invoice.py to main', 300],
      ["out", '  <span class="strike">return round(sum(p * q for p, q in items) * 1.2)</span>', 700],
      ["bar", "running python -m pytest -q"],
      ["out", '<span class="warn">12 passed</span>  <span class="dim">← with the change REVERTED</span>', 450],
      ["out", '<span class="bad">✗ unproven-change</span>  tests never touch invoice.py', 250],
      ["out", '<span class="bad">✗ skip-added</span>      test_invoice.py:7 @pytest.mark.skip', 250],
      ["out", '<span class="warn">! matcher-loosened</span> == 30 → truthy', 250],
      ["out", '<span class="warn">! error-swallowed</span>  invoice.py:4 except: pass', 300],
      ["stamp", "bad", "BLOCKED", "2 problems block this PR"],
    ],
  },
  honest: {
    word: "proven",
    steps: [
      ["cmd", "gh pr checks 141"],
      ["out", '<span class="ok">✓</span> Tests <span class="dim">·</span> <span class="ok">3 passed</span>   <span class="ok">✓</span> lint', 300],
      ["cmd", "revertgate check --base main"],
      ["out", '<span class="cy">→</span> diff: invoice.py <span class="ok">+2</span> <span class="bad">−1</span>, tests/test_invoice.py <span class="ok">+3</span>', 350],
      ["out", '<span class="cy">→</span> reverting invoice.py to main', 300],
      ["out", '  <span class="strike">return gross - gross * discount // 100</span>', 700],
      ["bar", "running python -m pytest -q"],
      ["out", '<span class="bad">FAILED</span> test_discount <span class="dim">· assert 20 == 10</span>', 400],
      ["out", '<span class="ok">1 failed</span>  <span class="dim">← with the change reverted. good.</span>', 400],
      ["out", '<span class="ok">✓ the tests catch this change</span>', 250],
      ["out", '<span class="ok">✓</span> no skipped, deleted or weakened tests', 300],
      ["stamp", "ok", "PROVEN", "safe to review"],
    ],
  },
  vacuous: {
    word: "faking it",
    steps: [
      ["cmd", "gh pr checks 143"],
      ["out", '<span class="ok">✓</span> Tests <span class="dim">·</span> <span class="ok">3 passed</span>   <span class="dim">(1 new test!)</span>', 300],
      ["cmd", "revertgate check --base main"],
      ["out", '<span class="cy">→</span> diff: invoice.py <span class="ok">+3</span>, tests/test_tax.py <span class="ok">+4</span>', 350],
      ["out", '<span class="cy">→</span> reverting invoice.py to main', 300],
      ["out", '  <span class="strike">def tax(amount): return amount * 0.2</span>', 700],
      ["bar", "running python -m pytest -q"],
      ["out", '<span class="warn">3 passed</span>  <span class="dim">← with tax() deleted?!</span>', 450],
      ["out", '<span class="bad">✗ unproven-change</span>  test_tax never calls tax()', 300],
      ["stamp", "bad", "BLOCKED", "the new test proves nothing"],
    ],
  },
};
const ORDER = ["cheat", "honest", "vacuous"];
let run = 0;
let current = "cheat";

function line(screen, html) {
  const el = document.createElement("div");
  el.className = "ln";
  el.innerHTML = html;
  screen.append(el);
  return el;
}

async function playScene(name) {
  const id = ++run;
  const alive = () => id === run;
  const screen = $("#screen");
  current = name;
  screen.replaceChildren();
  $$(".tab").forEach((t) => t.setAttribute("aria-selected", String(t.dataset.scene === name)));
  for (const [kind, a, b, c] of SCENES[name].steps) {
    if (!alive()) return;
    if (kind === "cmd") {
      const el = line(screen, '<span class="ps">❯</span> <span class="cmd"></span><span class="caret"></span>');
      const out = $(".cmd", el);
      for (const ch of a) {
        if (!alive()) return;
        out.textContent += ch;
        await sleep(28 + Math.random() * 40);
      }
      $(".caret", el).remove();
      await sleep(250);
    } else if (kind === "out") {
      line(screen, a);
      await sleep(b);
    } else if (kind === "bar") {
      line(screen, `<span class="cy">→</span> ${a}<span class="bar"><b></b></span>`);
      await sleep(1250);
    } else if (kind === "stamp") {
      const st = document.createElement("div");
      st.className = `stamp ${a}`;
      st.innerHTML = `${b}<small>${c}</small>`;
      screen.append(st);
      setWord(SCENES[name].word, a === "bad");
    }
  }
  await sleep(4200);
  if (alive()) playScene(ORDER[(ORDER.indexOf(name) + 1) % ORDER.length]);
}

function setWord(word, blocked) {
  const swap = $("#swap");
  swap.classList.toggle("blocked", blocked);
  swap.replaceChildren(...[...word].map((ch, i) => {
    const s = document.createElement("span");
    s.textContent = ch === " " ? " " : ch;
    s.style.animationDelay = `${i * 35}ms`;
    return s;
  }));
}

function initTerminal() {
  $$(".tab").forEach((t) => t.addEventListener("click", () => playScene(t.dataset.scene)));
  const term = $("#term");
  if (!calm && window.matchMedia("(pointer: fine)").matches) {
    term.addEventListener("pointermove", (e) => {
      const r = term.getBoundingClientRect();
      term.style.setProperty("--ry", `${((e.clientX - r.left) / r.width - 0.5) * 8}deg`);
      term.style.setProperty("--rx", `${-((e.clientY - r.top) / r.height - 0.5) * 6}deg`);
    });
    term.addEventListener("pointerleave", () => { term.style.removeProperty("--ry"); term.style.removeProperty("--rx"); });
  }
  playScene("cheat");
}

/* ---------------- Playground ---------------- */
const state = { realTest: true, vacuous: false, skip: false, loosen: false, delete: false, swallow: false, gate: false };
const CHEATS = ["vacuous", "skip", "loosen", "delete", "swallow", "gate"];
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

function diffLines(s) {
  const L = [];
  const file = (f) => L.push(["file", f]);
  file("invoice.py");
  L.push(["ctx", "def total(items):"]);
  L.push(["del", "    return sum(p * q for p, q in items)"]);
  if (s.swallow) {
    L.push(["add", "    try:"], ["add", "        return round(sum(p * q for p, q in items) * 1.2)"], ["add", "    except Exception:"], ["add", "        pass"]);
  } else {
    L.push(["add", "    return round(sum(p * q for p, q in items) * 1.2)"]);
  }
  file("tests/test_invoice.py");
  L.push(["ctx", "from invoice import total"]);
  if (s.delete) {
    L.push(["del", "def test_total():"], ["del", "    assert total([(10, 2), (5, 2)]) == 30"]);
  } else {
    if (s.skip) L.push(["add", '@pytest.mark.skip(reason="flaky")']);
    L.push(["ctx", "def test_total():"]);
    if (s.loosen) L.push(["del", "    assert total([(10, 2), (5, 2)]) == 30"], ["add", "    assert total([(10, 2), (5, 2)])"]);
    else if (s.realTest) L.push(["del", "    assert total([(10, 2), (5, 2)]) == 30"], ["add", "    assert total([(10, 2), (5, 2)]) == 36"]);
    else L.push(["ctx", "    assert total([(10, 2), (5, 2)]) == 30"]);
  }
  if (s.vacuous) {
    file("tests/test_tax.py");
    L.push(["add", "def test_tax():"], ["add", "    assert total([(1, 1)]) == 1   # 1.2 rounds to 1"]);
  }
  if (s.gate) {
    file(".github/workflows/tests.yml");
    L.push(["ctx", "      - run: python -m pytest -q"], ["add", "        continue-on-error: true"]);
  }
  return L;
}

function judge(s) {
  const f = [];
  const runs = !s.delete && !s.skip;
  const kind = !runs ? "none" : s.loosen ? "loose" : s.realTest ? "strict36" : "strict30";
  if (s.skip) f.push(["block", "skip-added", "test_invoice.py:3 · a new @pytest.mark.skip"]);
  if (s.delete) f.push(["block", "tests-removed", "test_total was deleted, and its assertion with it"]);
  if (s.gate) f.push(["block", "gate-tampered", "continue-on-error: true on the test step"]);
  if (s.loosen) f.push(["warn", "matcher-loosened", "== 30 became a bare truthiness check"]);
  if (s.swallow) f.push(["warn", "error-swallowed", "invoice.py:6 · except Exception: pass"]);
  if (kind === "strict30") {
    f.unshift(["block", "tests-failing", "test_total expects 30 and gets 36. Fix the test or the code."]);
  } else if (kind === "strict36") {
    f.unshift(["pass", "revert check", "with invoice.py reverted, test_total fails (30 ≠ 36). The tests catch the change."]);
  } else {
    const why = s.vacuous ? "test_tax passes either way; it never checks tax." : "nothing left tests the new total.";
    f.unshift(["block", "unproven-change", `with invoice.py reverted, the tests still pass: ${why}`]);
  }
  return f;
}

function caughtBy(trick, findings) {
  const rules = findings.map((x) => x[1]);
  const map = { skip: "skip-added", delete: "tests-removed", gate: "gate-tampered", loosen: "matcher-loosened", swallow: "error-swallowed", vacuous: "unproven-change" };
  return rules.includes(map[trick]);
}

function renderPlay(shake) {
  const lines = diffLines(state);
  const adds = lines.filter((l) => l[0] === "add").length;
  const dels = lines.filter((l) => l[0] === "del").length;
  $("#diffstat").innerHTML = `<span class="ok">+${adds}</span> <span class="bad">−${dels}</span>`;
  $("#diff").innerHTML = lines.map(([k, t], i) =>
    k === "file" ? `<div class="file">── ${esc(t)}</div>` : `<span class="d ${k}" style="animation-delay:${i * 18}ms">${esc(t)}</span>`
  ).join("");

  const findings = judge(state);
  const blocks = findings.filter((x) => x[0] === "block").length;
  const blocked = blocks > 0;
  const active = CHEATS.filter((c) => state[c]);
  // A blocked PR merges nothing, so every trick in it was stopped.
  const caught = blocked ? active : active.filter((c) => caughtBy(c, findings));
  $("#tried").textContent = active.length;
  $("#caught").textContent = caught.length;
  $("#through").textContent = active.length - caught.length;
  $("#vstatus").innerHTML = blocked ? '<span class="bad">● failing</span>' : '<span class="ok">● passing</span>';
  const head = blocked
    ? `<h3 class="bad">❌ ${blocks === 1 ? "1 problem blocks" : `${blocks} problems block`} this PR</h3><p>Nice try. Revertgate doesn't read the PR description; it checks the evidence.</p>`
    : `<h3 class="ok">✅ The tests catch this change</h3><p>${active.length ? "Only harmless extras got through. The real test still proves the change." : "An honest PR. Reviewers can trust the green tick."}</p>`;
  $("#vbody").innerHTML = head + findings.map(([sev, rule, msg], i) =>
    `<div class="finding ${sev}" style="animation-delay:${i * 70}ms"><b>${rule}</b><span>${esc(msg)}</span></div>`
  ).join("") + `<div class="stamp ${blocked ? "bad" : "ok"}">${blocked ? "BLOCKED" : "PROVEN"}<small>${blocked ? "merge refused" : "ready for review"}</small></div>`;
  if (shake && blocked && !calm) {
    const v = $("#verdict");
    v.classList.remove("shake");
    void v.offsetWidth;
    v.classList.add("shake");
  }
}

function initPlayground() {
  $$("#chips [data-trick]").forEach((chip) => chip.addEventListener("click", () => {
    const k = chip.dataset.trick;
    state[k] = !state[k];
    chip.setAttribute("aria-pressed", String(state[k]));
    renderPlay(state[k] && k !== "realTest");
  }));
  $("#dice").addEventListener("click", () => {
    CHEATS.forEach((c) => (state[c] = Math.random() < 0.4));
    if (!CHEATS.some((c) => state[c])) state[CHEATS[Math.floor(Math.random() * CHEATS.length)]] = true;
    state.realTest = Math.random() < 0.35;
    $$("#chips [data-trick]").forEach((c) => c.setAttribute("aria-pressed", String(state[c.dataset.trick])));
    renderPlay(true);
  });
  renderPlay(false);
}

/* ---------------- Install snippet ---------------- */
function yamlLines(action) {
  return [
    ["k", "name", "v", "Revertgate"], ["k", "on", "", ""], ["k", "  pull_request", "", ""],
    ["k", "    types", "v", "[opened, synchronize, reopened, labeled, unlabeled]"], ["", "", "", ""],
    ["k", "permissions", "", ""], ["k", "  contents", "v", "read"], ["k", "  pull-requests", "v", "write"], ["", "", "", ""],
    ["k", "jobs", "", ""], ["k", "  revertgate", "", ""], ["k", "    runs-on", "v", "ubuntu-latest"], ["k", "    steps", "", ""],
    ["k", "      - uses", "v", "actions/checkout@v7"], ["k", "        with", "", ""], ["k", "          fetch-depth", "v", "0"],
    ["k", "      - run", "v", "npm ci            ", "# whatever your tests need"],
    ["k", "      - uses", "v", action], ["k", "        with", "", ""],
    ["k", "          license-key", "v", "${{ secrets.REVERTGATE_LICENSE_KEY }}  ", "# private repos only"],
  ];
}
function initInstall() {
  const pre = $("#yaml");
  const rows = yamlLines(pre.dataset.action);
  const plain = rows.map(([, k, , v, c]) => (k ? `${k.replace(/^(\s*)/, "$1")}:${v ? " " + v : ""}${c || ""}` : "")).join("\n");
  const html = rows.map(([, k, , v, c]) =>
    k ? `<span class="k">${esc(k)}</span>:${v ? ` <span class="v">${esc(v)}</span>` : ""}${c ? `<span class="c">${esc(c)}</span>` : ""}` : ""
  );
  let typed = false;
  const type = async () => {
    if (typed) return;
    typed = true;
    for (let i = 0; i < html.length; i++) {
      pre.innerHTML = html.slice(0, i + 1).join("\n") + (i < html.length - 1 ? '<span class="caret"></span>' : "");
      await sleep(70);
    }
  };
  new IntersectionObserver((es, o) => es.forEach((e) => e.isIntersecting && (type(), o.disconnect())), { threshold: 0.3 }).observe(pre);
  $("#copy").addEventListener("click", async (e) => {
    try {
      await navigator.clipboard.writeText(plain + "\n");
      e.target.textContent = "copied ✓";
      e.target.classList.add("done");
    } catch {
      // Clipboard access can be refused (permissions, insecure context): select the text instead.
      getSelection().selectAllChildren(pre);
      e.target.textContent = "press ctrl+c";
    }
    setTimeout(() => { e.target.textContent = "copy"; e.target.classList.remove("done"); }, 1800);
  });
}

/* ---------------- Reveals, counters, spotlights ---------------- */
function countUp(el) {
  const end = Number(el.dataset.count);
  const suffix = el.dataset.suffix || "";
  const t0 = performance.now();
  const tick = (t) => {
    const p = calm ? 1 : Math.min(1, (t - t0) / 1400);
    el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))) + suffix;
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
function initReveals() {
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    e.target.classList.add("in");
    $$("[data-count]", e.target).forEach(countUp);
    io.unobserve(e.target);
  }), { threshold: 0.15 });
  $$(".reveal, #steps").forEach((el, i) => {
    el.style.transitionDelay = el.classList.contains("card") ? `${(i % 4) * 90}ms` : "0ms";
    io.observe(el);
  });
}
function initSpotlights() {
  if (calm || !window.matchMedia("(pointer: fine)").matches) return;
  $$(".card").forEach((card) => card.addEventListener("pointermove", (e) => {
    const r = card.getBoundingClientRect();
    card.style.setProperty("--mx", `${e.clientX - r.left}px`);
    card.style.setProperty("--my", `${e.clientY - r.top}px`);
    if (card.classList.contains("plan")) {
      card.style.transform = `rotateY(${((e.clientX - r.left) / r.width - 0.5) * 8}deg) rotateX(${-((e.clientY - r.top) / r.height - 0.5) * 8}deg) translateY(-4px)`;
    }
  }));
  $$(".plan").forEach((p) => p.addEventListener("pointerleave", () => (p.style.transform = "")));
}

/* ---------------- Opening wordmark ---------------- */
// REVERTGATE starts spelled backwards; each letter flips into place (the revert) and
// fills with a slice of the brand gradient, so the word reads as one continuous sweep.
const STOPS = [[200, 255, 58], [79, 227, 255], [139, 108, 255], [255, 79, 110]];
function gradientAt(t) {
  const x = Math.min(0.999, Math.max(0, t)) * (STOPS.length - 1);
  const i = Math.floor(x);
  const f = x - i;
  const [a, b] = [STOPS[i], STOPS[i + 1]];
  return `rgb(${a.map((v, k) => Math.round(v + (b[k] - v) * f)).join(",")})`;
}
function setLetter(el, ch, fill) {
  el.textContent = ch;
  el.classList.toggle("on", fill);
}
async function revertWord(letters, word, { fill }) {
  const n = word.length;
  for (let i = 0; i < n; i++) {
    const el = letters[i];
    const target = fill ? word[i] : word[n - 1 - i];
    if (!calm) {
      el.classList.remove("flip");
      void el.offsetWidth;
      el.classList.add("flip");
    }
    setTimeout(() => setLetter(el, target, fill), calm ? 0 : 160);
    await sleep(calm ? 40 : 85);
  }
}
async function initMega() {
  const mega = $("#mega");
  if (!mega) return;
  const word = mega.dataset.word;
  const n = word.length;
  const letters = [...word].map((_, i) => {
    const s = document.createElement("span");
    s.className = "ch";
    s.style.setProperty("--c1", gradientAt(i / n));
    s.style.setProperty("--c2", gradientAt((i + 1) / n));
    s.textContent = word[n - 1 - i];
    mega.append(s);
    return s;
  });
  let busy = false;
  const replay = async () => {
    if (busy) return;
    busy = true;
    $("#megaOk").style.opacity = "0";
    await revertWord(letters, word, { fill: false });
    await sleep(350);
    await revertWord(letters, word, { fill: true });
    await sleep(500);
    $("#megaOk").style.opacity = "";
    busy = false;
  };
  await sleep(250);
  await revertWord(letters, word, { fill: true });
  await sleep(450);
  document.body.classList.add("opened");
  mega.addEventListener("click", replay);
  if (calm) return;
  setInterval(() => { if (!document.hidden && mega.getBoundingClientRect().bottom > 0) replay(); }, 11000);
  // Letters lean up toward the pointer, like a wave following the mouse.
  if (window.matchMedia("(pointer: fine)").matches) {
    const hero = $(".hero");
    hero.addEventListener("pointermove", (e) => {
      letters.forEach((el) => {
        const r = el.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const near = Math.exp(-(dx * dx) / (2 * 110 * 110));
        const rise = Math.max(0, 1 - Math.abs(e.clientY - (r.top + r.height / 2)) / 520);
        el.style.translate = `0 ${(-26 * near * rise).toFixed(1)}px`;
      });
    });
    hero.addEventListener("pointerleave", () => letters.forEach((el) => (el.style.translate = "")));
  }
}

/* ---------------- Scroll bands and footer wordmark ---------------- */
// Each band's outlined words fill with gradient, and slide sideways, as it crosses the screen.
function initBands() {
  const bands = $$(".band");
  const update = () => {
    const vh = window.innerHeight;
    bands.forEach((band, i) => {
      const r = band.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height)));
      const track = $(".band-track", band);
      track.style.setProperty("--fill", `${Math.min(100, p * 140).toFixed(1)}%`);
      if (!calm) track.style.setProperty("--shift", `${((i % 2 ? -1 : 1) * (p - 0.5) * 30).toFixed(2)}vw`);
    });
  };
  let queued = false;
  window.addEventListener("scroll", () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { update(); queued = false; });
  }, { passive: true });
  window.addEventListener("resize", update);
  update();
  const giant = $("#giant");
  if (giant) {
    new IntersectionObserver((es) => es.forEach((e) => giant.classList.toggle("in", e.isIntersecting)), { threshold: 0.5 }).observe(giant);
  }
}

buildRain();
initTerminal();
initPlayground();
initInstall();
initReveals();
initSpotlights();
initMega();
initBands();
