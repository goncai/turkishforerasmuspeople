// Shared utilities for all modules

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Turkish-aware lowercase (İ → i, I → ı)
function trLower(s) { return s.trim().toLocaleLowerCase('tr-TR'); }

// Strip Turkish diacritics so "gordum" can be recognised as a near-miss for "gördüm"
function stripTr(s) {
  return trLower(s).replace(/ç/g,'c').replace(/ğ/g,'g').replace(/ı/g,'i').replace(/ö/g,'o').replace(/ş/g,'s').replace(/ü/g,'u');
}

function turkishVoice() {
  if (!('speechSynthesis' in window)) return null;
  return window.speechSynthesis.getVoices().find(v => v.lang && v.lang.toLowerCase().startsWith('tr')) || null;
}

let voiceWarningShown = false;
function showVoiceWarning() {
  if (voiceWarningShown) return;
  voiceWarningShown = true;
  const n = document.createElement('div');
  n.setAttribute('role', 'status');
  n.style.cssText = 'position:fixed;bottom:16px;left:50%;transform:translateX(-50%);max-width:90%;background:#333;color:white;padding:12px 18px;border-radius:8px;font-size:13px;z-index:1000;box-shadow:0 4px 12px rgba(0,0,0,.25);';
  n.textContent = 'No Turkish voice found on this device, so pronunciation may sound wrong. Try Chrome or Safari, or add a Turkish voice in your system settings.';
  document.body.appendChild(n);
  setTimeout(() => n.remove(), 7000);
}

function speak(text) {
  if (!('speechSynthesis' in window)) { showVoiceWarning(); return; }
  window.speechSynthesis.cancel();
  setTimeout(() => {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'tr-TR';
    u.rate = 0.82;
    const v = turkishVoice();
    if (v) u.voice = v;
    // Voices load asynchronously in some browsers; only warn once the list is known
    else if (window.speechSynthesis.getVoices().length) showVoiceWarning();
    window.speechSynthesis.speak(u);
  }, 100);
}
if ('speechSynthesis' in window) window.speechSynthesis.getVoices();

// ── ACCESSIBILITY ─────────────────────────────────────────────────────────────
// Pages are in English; mark Turkish text so screen readers switch voice,
// and give icon-only 🔊 buttons a readable name.
const TURKISH_SELECTORS = '.phrase-tr,.phr-tr,.btr,.vocab-tr,.flip-tr,.letter-word,.ex-tr,.dest-name,.place-tr,.emg-tr,.lyric-tr,.street-name,.word-row > div > div:first-child,.phrase-row > div > div:first-child,.allergy-row > div > div:first-child,.emg-row > div > div:first-child,.budget-row > div > div:first-child,.vocab-row > div > div:first-child,.table-wrap td:first-child';
function enhanceAccessibility() {
  document.querySelectorAll(TURKISH_SELECTORS).forEach(el => { if (!el.lang) el.lang = 'tr'; });
  document.querySelectorAll('button').forEach(b => {
    if (b.hasAttribute('aria-label') || !b.textContent.includes('🔊')) return;
    const m = (b.getAttribute('onclick') || '').match(/speak\('((?:\\'|[^'])*)'\)/);
    b.setAttribute('aria-label', m ? `Listen: ${m[1].replace(/\\'/g, "'")}` : 'Listen');
  });
}
document.addEventListener('DOMContentLoaded', enhanceAccessibility);

// ── QUIZ ──────────────────────────────────────────────────────────────────────
function renderQuiz(containerId, questions, title) {
  const el = document.getElementById(containerId);
  if (!el) return;
  let current = 0, score = 0, answered = false;

  function render() {
    if (current >= questions.length) {
      el.innerHTML = `
        <div style="text-align:center;padding:30px;">
          <div style="font-size:40px;margin-bottom:10px;">🎉</div>
          <div style="font-weight:bold;color:#E30A17;font-size:20px;margin-bottom:8px;">${score} / ${questions.length} correct!</div>
          <button onclick="startQuiz()" style="padding:10px 24px;background:#E30A17;color:white;border:none;border-radius:8px;cursor:pointer;font-weight:bold;font-size:15px;">Try Again</button>
        </div>`;
      return;
    }
    const q = questions[current];
    answered = false;
    if (q.type === 'mc') renderMC(q);
    else renderFill(q);
  }

  function renderMC(q) {
    el.innerHTML = `
      <div style="margin-bottom:12px;font-size:13px;color:#888;">${current + 1} / ${questions.length}</div>
      <div style="font-size:18px;font-weight:bold;color:#333;margin-bottom:20px;">${q.question}</div>
      <div id="opts" style="display:flex;flex-direction:column;gap:10px;"></div>
      <div id="feedback" style="margin-top:14px;font-weight:bold;font-size:15px;min-height:24px;"></div>
      <button id="next-btn" onclick="nextQ()" style="display:none;margin-top:14px;padding:9px 22px;background:#E30A17;color:white;border:none;border-radius:8px;cursor:pointer;font-weight:bold;">Next →</button>`;
    const opts = document.getElementById('opts');
    shuffle(q.options).forEach(opt => {
      const b = document.createElement('button');
      b.textContent = opt;
      b.style.cssText = 'padding:11px 16px;border:2px solid #ddd;border-radius:8px;background:white;cursor:pointer;text-align:left;font-size:14px;';
      b.onmouseover = () => { if (!answered) b.style.borderColor = '#E30A17'; };
      b.onmouseout = () => { if (!answered) b.style.borderColor = '#ddd'; };
      b.onclick = () => {
        if (answered) return;
        answered = true;
        const correct = opt === q.answer;
        if (correct) score++;
        b.style.background = correct ? '#d4edda' : '#f8d7da';
        b.style.borderColor = correct ? '#28a745' : '#dc3545';
        if (!correct) {
          opts.querySelectorAll('button').forEach(btn => {
            if (btn.textContent === q.answer) { btn.style.background = '#d4edda'; btn.style.borderColor = '#28a745'; }
          });
        }
        document.getElementById('feedback').style.color = correct ? '#28a745' : '#dc3545';
        document.getElementById('feedback').textContent = correct ? '✅ Correct!' : `❌ Answer: ${q.answer}`;
        document.getElementById('next-btn').style.display = 'inline-block';
      };
      opts.appendChild(b);
    });
  }

  function renderFill(q) {
    el.innerHTML = `
      <div style="margin-bottom:12px;font-size:13px;color:#888;">${current + 1} / ${questions.length}</div>
      <div style="font-size:13px;color:#888;margin-bottom:8px;">${q.hint}</div>
      <div style="font-size:17px;font-weight:bold;color:#333;margin-bottom:16px;">${q.sentence.replace('___', '<span style="border-bottom:2px solid #E30A17;padding:0 8px;color:#E30A17;">___</span>')}</div>
      <input id="fill-input" type="text" lang="tr" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Type the missing word..." style="width:100%;padding:10px;border:2px solid #ddd;border-radius:8px;font-size:14px;outline:none;" onkeydown="if(event.key==='Enter')checkFill()">
      <div style="display:flex;gap:6px;flex-wrap:wrap;justify-content:center;margin-top:8px;">
        ${['ç','ğ','ı','İ','ö','ş','ü'].map(ch => `<button type="button" onclick="insertTrChar('${ch}')" aria-label="Insert ${ch}" style="min-width:36px;padding:6px 10px;border:2px solid #ddd;border-radius:6px;background:white;cursor:pointer;font-size:15px;font-weight:bold;">${ch}</button>`).join('')}
      </div>
      <button onclick="checkFill()" style="margin-top:10px;padding:9px 22px;background:#E30A17;color:white;border:none;border-radius:8px;cursor:pointer;font-weight:bold;">Check</button>
      <div id="feedback" style="margin-top:14px;font-weight:bold;font-size:15px;min-height:24px;"></div>
      <button id="next-btn" onclick="nextQ()" style="display:none;margin-top:14px;padding:9px 22px;background:#E30A17;color:white;border:none;border-radius:8px;cursor:pointer;font-weight:bold;">Next →</button>`;
    document.getElementById('fill-input').focus();
  }

  window.insertTrChar = (ch) => {
    const input = document.getElementById('fill-input');
    if (!input || answered) return;
    const start = input.selectionStart ?? input.value.length;
    const end = input.selectionEnd ?? input.value.length;
    input.value = input.value.slice(0, start) + ch + input.value.slice(end);
    input.focus();
    input.setSelectionRange(start + 1, start + 1);
  };

  window.checkFill = () => {
    if (answered) return;
    const q = questions[current];
    const raw = document.getElementById('fill-input').value;
    if (!raw.trim()) return;
    const fb = document.getElementById('feedback');
    const correct = trLower(raw) === trLower(q.answer);
    // Right letters but missing Turkish characters: let the student try again
    if (!correct && stripTr(raw) === stripTr(q.answer)) {
      fb.style.color = '#b8860b';
      fb.textContent = '🟡 Almost! Check the Turkish letters (ç ğ ı ö ş ü) and try again.';
      return;
    }
    answered = true;
    if (correct) score++;
    fb.style.color = correct ? '#28a745' : '#dc3545';
    fb.textContent = correct ? '✅ Correct!' : `❌ Answer: ${q.answer}`;
    document.getElementById('next-btn').style.display = 'inline-block';
  };

  window.nextQ = () => { current++; render(); };

  el.innerHTML = `
    <div style="text-align:center;padding:20px 0 10px;">
      <div style="font-weight:bold;color:#E30A17;font-size:16px;margin-bottom:16px;">${title}</div>
      <button onclick="startQuiz()" style="padding:11px 28px;background:#E30A17;color:white;border:none;border-radius:8px;cursor:pointer;font-weight:bold;font-size:15px;">Start Quiz</button>
    </div>`;
  window.startQuiz = () => { current = 0; score = 0; render(); };
}

// ── MATCH GAME ─────────────────────────────────────────────────────────────────
function renderMatchGame(containerId, pairs, title) {
  const el = document.getElementById(containerId);
  if (!el) return;

  let matched = [], selTr = null, selEn = null, wrong = false;
  let shuffledEn = shuffle(pairs.map(p => p.en));

  function draw() {
    if (matched.length === pairs.length) {
      el.innerHTML = `
        <div style="text-align:center;padding:24px;">
          <div style="font-size:36px;margin-bottom:10px;">🎉</div>
          <div style="font-weight:bold;color:#E30A17;font-size:18px;margin-bottom:16px;">All matched! Well done!</div>
          <button onclick="resetMatch()" style="padding:10px 24px;background:#E30A17;color:white;border:none;border-radius:8px;cursor:pointer;font-weight:bold;">Play Again</button>
        </div>`;
      return;
    }

    const bg = wrong ? '#ffeaea' : 'white';
    let trHTML = pairs.map(p => {
      const isMatched = matched.includes(p.tr);
      const isSel = selTr === p.tr;
      return `<button onclick="pickTr('${esc(p.tr)}')" style="padding:10px 12px;border-radius:8px;border:2px solid ${isSel ? '#E30A17' : '#ddd'};background:${isMatched ? '#d4edda' : isSel ? '#fff0f0' : 'white'};color:${isMatched ? '#155724' : '#222'};cursor:${isMatched ? 'default' : 'pointer'};text-align:left;font-size:13px;width:100%;">${isMatched ? '✅ ' : ''}${p.tr}</button>`;
    }).join('');
    let enHTML = shuffledEn.map(en => {
      const tr = pairs.find(p => p.en === en)?.tr ?? '';
      const isMatched = matched.includes(tr);
      const isSel = selEn === en;
      return `<button onclick="pickEn('${esc(en)}')" style="padding:10px 12px;border-radius:8px;border:2px solid ${isSel ? '#E30A17' : '#ddd'};background:${isMatched ? '#d4edda' : isSel ? '#fff0f0' : 'white'};color:${isMatched ? '#155724' : '#222'};cursor:${isMatched ? 'default' : 'pointer'};text-align:left;font-size:13px;width:100%;">${isMatched ? '✅ ' : ''}${en}</button>`;
    }).join('');

    el.innerHTML = `
      <div style="font-weight:bold;color:#E30A17;text-align:center;margin-bottom:14px;font-size:15px;">${title}</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;background:${bg};border-radius:8px;padding:4px;transition:background 0.2s;">
        <div>
          <div style="font-size:11px;color:#888;text-align:center;font-weight:bold;margin-bottom:6px;">🇹🇷 Turkish</div>
          <div style="display:flex;flex-direction:column;gap:6px;">${trHTML}</div>
        </div>
        <div>
          <div style="font-size:11px;color:#888;text-align:center;font-weight:bold;margin-bottom:6px;">🇬🇧 English</div>
          <div style="display:flex;flex-direction:column;gap:6px;">${enHTML}</div>
        </div>
      </div>
      <div style="text-align:center;margin-top:10px;font-size:13px;color:#888;">${matched.length} / ${pairs.length} matched <button onclick="resetMatch()" style="margin-left:10px;background:none;border:none;color:#E30A17;cursor:pointer;text-decoration:underline;font-size:12px;">Reset</button></div>`;
  }

  function esc(s) { return s.replace(/'/g, "\\'"); }

  window.pickTr = (tr) => {
    if (matched.includes(tr)) return;
    selTr = tr;
    if (selTr && selEn) checkMatch();
    else draw();
  };
  window.pickEn = (en) => {
    const tr = pairs.find(p => p.en === en)?.tr ?? '';
    if (matched.includes(tr)) return;
    selEn = en;
    if (selTr && selEn) checkMatch();
    else draw();
  };
  window.checkMatch = () => {
    const correct = pairs.find(p => p.tr === selTr)?.en === selEn;
    if (correct) {
      matched.push(selTr);
      selTr = null; selEn = null; wrong = false;
    } else {
      wrong = true;
      draw();
      setTimeout(() => { selTr = null; selEn = null; wrong = false; draw(); }, 600);
      return;
    }
    draw();
  };
  window.resetMatch = () => {
    matched = []; selTr = null; selEn = null; wrong = false;
    shuffledEn = shuffle(shuffledEn);
    draw();
  };

  draw();
}
