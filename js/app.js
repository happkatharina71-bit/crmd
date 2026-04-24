'use strict';

// ── State ────────────────────────────────────────────────
const State = {
  learnIdx: 0,
  quiz: {
    questions: [],
    current: 0,
    score: 0,
    streak: 0,
    maxStreak: 0,
    correct: 0,
    wrong: 0,
    answered: false,
    startTime: 0,
    speedBonuses: 0,
  },
  stats: load('stats') || { quizzes: 0, bestScore: 0, birdsViewed: {} },
  achievements: load('achievements') || {},
};

function save(key, val) { try { localStorage.setItem('birds_' + key, JSON.stringify(val)); } catch(e) {} }
function load(key) { try { return JSON.parse(localStorage.getItem('birds_' + key)); } catch(e) { return null; } }
function saveAll() { save('stats', State.stats); save('achievements', State.achievements); }

// ── Achievements definition ──────────────────────────────
const ACHIEVEMENTS = [
  { id: 'first_quiz',   icon: '🐣', name: 'Erster Flug',        desc: 'Erstes Quiz abgeschlossen' },
  { id: 'vogelfreund',  icon: '🐦', name: 'Vogelfreund',         desc: 'Mehr als 60 Punkte in einem Quiz' },
  { id: 'vogelkenner',  icon: '🦜', name: 'Vogelkenner',         desc: 'Mehr als 100 Punkte in einem Quiz' },
  { id: 'perfekt',      icon: '🏆', name: 'Meisterkenner',       desc: 'Alle 10 Fragen richtig beantwortet' },
  { id: 'streak5',      icon: '🔥', name: 'Seriensieger',        desc: '5 Richtige in Folge' },
  { id: 'speedster',    icon: '⚡', name: 'Blitzschnell',        desc: '3 Speedboni in einem Quiz' },
  { id: 'explorer',     icon: '🔭', name: 'Entdecker',           desc: 'Alle 8 Vögel in Entdecken gesehen' },
  { id: 'comeback',     icon: '💪', name: 'Stehaufvögelchen',    desc: '3 Quizze gespielt' },
];

// ── Screen routing ───────────────────────────────────────
const App = {
  go(name) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('screen-' + name).classList.add('active');
    if (name === 'home')         Home.render();
    if (name === 'learn')        Learn.init();
    if (name === 'quiz')         Quiz.init();
    if (name === 'achievements') Ach.render();
  }
};

// ── Home ─────────────────────────────────────────────────
const Home = {
  render() {
    const s = State.stats;
    const earned = ACHIEVEMENTS.filter(a => State.achievements[a.id]).length;
    document.getElementById('home-stats').innerHTML =
      `<span>🎯 Bestes Ergebnis: <strong>${s.bestScore} Pkt</strong></span>
       <span>📋 Quizze: <strong>${s.quizzes}</strong></span>`;
    document.getElementById('badge-count-home').textContent = `${earned} / 8 erreicht`;
  }
};

// ── Learn ────────────────────────────────────────────────
const Learn = {
  init() {
    State.learnIdx = 0;
    this.buildCards();
    this.buildDots();
    this.render();
  },
  buildCards() {
    const track = document.getElementById('card-track');
    track.innerHTML = BIRDS.map((b, i) => `
      <div class="bird-card" data-i="${i}">
        <div class="bird-card-inner">
          <div class="bird-illustration">${b.svg}</div>
          <div class="bird-info">
            <div class="bird-name-row">
              <div>
                <div class="bird-name">${b.name}</div>
                <div class="bird-sci">${b.sci}</div>
              </div>
            </div>
            <div class="bird-tags">
              <span class="tag size">📏 ${b.size}</span>
              <span class="tag habitat">🌿 ${b.habitat}</span>
              <span class="tag">🎵 ${b.song}</span>
            </div>
            <ul class="facts-list">
              ${b.facts.map((f, fi) => `
                <li><span class="fact-dot">${fi + 1}</span><span>${f}</span></li>
              `).join('')}
            </ul>
          </div>
        </div>
      </div>
    `).join('');
  },
  buildDots() {
    const row = document.getElementById('dots-row');
    row.innerHTML = BIRDS.map((_, i) =>
      `<div class="dot ${i === 0 ? 'active' : ''}" onclick="Learn.goTo(${i})"></div>`
    ).join('');
  },
  render() {
    const i = State.learnIdx;
    document.getElementById('card-track').style.transform = `translateX(-${i * 100}%)`;
    document.getElementById('learn-counter').textContent = `${i + 1} / ${BIRDS.length}`;
    document.getElementById('btn-prev').disabled = i === 0;
    document.getElementById('btn-next').disabled = i === BIRDS.length - 1;
    document.querySelectorAll('.dot').forEach((d, di) =>
      d.classList.toggle('active', di === i)
    );
    // Track viewed birds
    State.stats.birdsViewed[BIRDS[i].id] = true;
    if (Object.keys(State.stats.birdsViewed).length >= BIRDS.length) {
      checkAch('explorer');
    }
    saveAll();
  },
  prev() { if (State.learnIdx > 0) { State.learnIdx--; this.render(); } },
  next() { if (State.learnIdx < BIRDS.length - 1) { State.learnIdx++; this.render(); } },
  goTo(i) { State.learnIdx = i; this.render(); }
};

// ── Quiz ─────────────────────────────────────────────────
const Quiz = {
  init() {
    const q = State.quiz;
    q.questions = this.makeQuestions(10);
    q.current = 0;
    q.score = 0;
    q.streak = 0;
    q.maxStreak = 0;
    q.correct = 0;
    q.wrong = 0;
    q.answered = false;
    q.speedBonuses = 0;
    this.renderQuestion();
  },
  makeQuestions(n) {
    const qs = [];
    const shuffled = [...BIRDS].sort(() => Math.random() - 0.5);
    for (let i = 0; i < n; i++) {
      const bird = shuffled[i % shuffled.length];
      const type = Math.random() < 0.5 ? 'name' : 'image'; // name=show image pick name, image=show name pick image
      const wrong = BIRDS.filter(b => b.id !== bird.id).sort(() => Math.random() - 0.5).slice(0, 3);
      const options = [bird, ...wrong].sort(() => Math.random() - 0.5);
      qs.push({ bird, type, options });
    }
    return qs;
  },
  renderQuestion() {
    const q = State.quiz;
    const total = q.questions.length;
    const qi = q.current;
    const question = q.questions[qi];

    // Progress
    document.getElementById('quiz-prog-bar').style.width = `${(qi / total) * 100}%`;
    document.getElementById('q-num').textContent = `Frage ${qi + 1} / ${total}`;
    document.getElementById('q-score').textContent = `${q.score} Pkt`;

    // Streak badge
    const sb = document.getElementById('streak-badge');
    if (q.streak >= 3) {
      sb.textContent = `🔥 ${q.streak}x`;
      sb.classList.add('show');
    } else {
      sb.classList.remove('show');
    }

    // Stage
    const stage = document.getElementById('quiz-stage');
    if (question.type === 'name') {
      // Show bird image, pick name
      stage.innerHTML = `
        <div class="quiz-bird-img">${question.bird.svg}</div>
        <div class="quiz-question">Welcher Vogel ist das?</div>
        <div class="options-grid">
          ${question.options.map(opt => `
            <button class="option-btn" onclick="Quiz.answer('${opt.id}')" data-id="${opt.id}">
              ${opt.name}
            </button>
          `).join('')}
        </div>
      `;
    } else {
      // Show name, pick image
      stage.innerHTML = `
        <div class="quiz-question" style="margin-bottom:8px">Wie sieht der <strong>${question.bird.name}</strong> aus?</div>
        <div class="img-options-grid">
          ${question.options.map(opt => `
            <button class="img-option-btn" onclick="Quiz.answer('${opt.id}')" data-id="${opt.id}">
              ${opt.svg}
              <div class="img-option-label">${opt.name}</div>
            </button>
          `).join('')}
        </div>
      `;
    }

    q.answered = false;
    q.startTime = Date.now();
  },
  answer(chosenId) {
    const q = State.quiz;
    if (q.answered) return;
    q.answered = true;

    const question = q.questions[q.current];
    const correct = chosenId === question.bird.id;
    const elapsed = (Date.now() - q.startTime) / 1000;
    let pts = 0;
    let feedback = '';

    const btnClass = question.type === 'name' ? '.option-btn' : '.img-option-btn';
    document.querySelectorAll(btnClass).forEach(btn => {
      btn.disabled = true;
      const id = btn.dataset.id;
      if (id === question.bird.id) btn.classList.add('reveal');
      if (id === chosenId && !correct) btn.classList.add('wrong');
    });

    if (correct) {
      q.correct++;
      q.streak++;
      if (q.streak > q.maxStreak) q.maxStreak = q.streak;
      pts = 10;
      let bonusText = '';
      if (elapsed < 4) {
        pts += 5;
        q.speedBonuses++;
        bonusText += ' ⚡ +5 Speedbonus!';
      }
      if (q.streak === 3)  { pts += 5;  bonusText += ' 🔥 +5 Streak!'; }
      if (q.streak === 5)  { pts += 10; bonusText += ' 🔥 +10 Streak!'; }
      if (q.streak === 10) { pts += 20; bonusText += ' 🔥 +20 Megastreak!'; }
      q.score += pts;
      document.getElementById('q-score').textContent = `${q.score} Pkt`;
      document.getElementById('q-score').classList.add('pulse');
      setTimeout(() => document.getElementById('q-score').classList.remove('pulse'), 400);
      feedback = `<div class="feedback-strip ok"><strong>✓ Richtig! +${pts} Punkte${bonusText}</strong>${question.bird.facts[0]}</div>`;
    } else {
      q.wrong++;
      q.streak = 0;
      feedback = `<div class="feedback-strip nope"><strong>✗ Falsch – es war der ${question.bird.name}</strong>${question.bird.facts[0]}</div>`;
    }

    const nextLabel = q.current < q.questions.length - 1 ? 'Weiter →' : 'Ergebnis ansehen';
    document.getElementById('quiz-stage').insertAdjacentHTML('beforeend',
      feedback + `<button class="next-btn" onclick="Quiz.next()">${nextLabel}</button>`
    );

    // Streak badge update
    const sb = document.getElementById('streak-badge');
    if (q.streak >= 3) { sb.textContent = `🔥 ${q.streak}x`; sb.classList.add('show'); }
    else sb.classList.remove('show');
  },
  next() {
    const q = State.quiz;
    if (q.current < q.questions.length - 1) {
      q.current++;
      this.renderQuestion();
    } else {
      this.showResults();
    }
  },
  quit() {
    if (confirm('Quiz wirklich beenden?')) App.go('home');
  },
  showResults() {
    const q = State.quiz;
    State.stats.quizzes++;
    if (q.score > State.stats.bestScore) State.stats.bestScore = q.score;

    // Check achievements
    const newAch = [];
    const tryAch = (id) => { if (checkAch(id)) newAch.push(ACHIEVEMENTS.find(a => a.id === id)); };
    tryAch('first_quiz');
    if (q.score >= 60)  tryAch('vogelfreund');
    if (q.score >= 100) tryAch('vogelkenner');
    if (q.correct === 10) tryAch('perfekt');
    if (q.maxStreak >= 5) tryAch('streak5');
    if (q.speedBonuses >= 3) tryAch('speedster');
    if (State.stats.quizzes >= 3) tryAch('comeback');
    saveAll();

    const pct = Math.round((q.correct / q.questions.length) * 100);
    const emoji = pct === 100 ? '🏆' : pct >= 70 ? '🎉' : pct >= 40 ? '👍' : '🐣';
    const msg = pct === 100 ? 'Perfekt! Du bist ein echter Vogelkenner!' :
                pct >= 70  ? 'Super! Du kennst dich gut aus!' :
                pct >= 40  ? 'Nicht schlecht! Noch ein bisschen üben?' :
                             'Weiter üben – du schaffst das!';

    const newBadgesHtml = newAch.length ? `
      <div class="new-badges-row">
        <h3>🆕 Neue Abzeichen:</h3>
        ${newAch.map(a => `<span class="new-badge-chip">${a.icon} ${a.name}</span>`).join('')}
      </div>` : '';

    document.getElementById('results-wrap').innerHTML = `
      <div class="result-trophy">${emoji}</div>
      <div class="result-title">${msg}</div>
      <div class="result-score-big">${q.score} <small>Punkte</small></div>
      <div class="result-stats">
        <div class="stat-box green"><div class="val">${q.correct}</div><div class="lbl">Richtig</div></div>
        <div class="stat-box red"><div class="val">${q.wrong}</div><div class="lbl">Falsch</div></div>
        <div class="stat-box gold"><div class="val">${q.maxStreak}x</div><div class="lbl">Beste Streak</div></div>
      </div>
      ${newBadgesHtml}
      <div class="result-actions">
        <button class="btn-again" onclick="App.go('quiz')">🎯 Nochmal spielen</button>
        <button class="btn-home2" onclick="App.go('home')">← Startseite</button>
      </div>
    `;
    App.go('results');
  }
};

// ── Achievements ─────────────────────────────────────────
function checkAch(id) {
  if (State.achievements[id]) return false;
  State.achievements[id] = true;
  return true;
}

const Ach = {
  render() {
    const grid = document.getElementById('ach-grid');
    grid.innerHTML = ACHIEVEMENTS.map(a => {
      const earned = !!State.achievements[a.id];
      return `
        <div class="ach-card ${earned ? 'earned' : 'locked'}">
          ${earned ? '<div class="ach-earned-stamp">✓</div>' : ''}
          <span class="ach-icon">${a.icon}</span>
          <div class="ach-name">${a.name}</div>
          <div class="ach-desc">${earned ? a.desc : '🔒 ' + a.desc}</div>
        </div>
      `;
    }).join('');
  }
};

// ── Init ─────────────────────────────────────────────────
Home.render();
