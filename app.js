/*
 * FocoOS — Sistema Operacional Pessoal
 * Quadro Kanban (GTD) · Matriz de Eisenhower · Semana · Pomodoro · Painel · Assistente IA
 * HTML + CSS + JavaScript puro. Os dados ficam salvos no próprio navegador (localStorage).
 */
(() => {
  'use strict';

  /* ---------- Utilidades ---------- */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const uid = () => Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4);
  const pad = (n) => String(n).padStart(2, '0');
  const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const parseISO = (s) => { const [y, m, d] = String(s).split('-').map(Number); return new Date(y, (m || 1) - 1, d || 1); };
  const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
  const todayISO = () => iso(new Date());
  const startOfWeek = (d) => { const x = new Date(d.getFullYear(), d.getMonth(), d.getDate()); return addDays(x, -((x.getDay() + 6) % 7)); };
  const norm = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
  const clamp = (n, a, b) => Math.min(b, Math.max(a, n));
  const minutes = (hhmm) => { const [h, m] = String(hhmm || '0:0').split(':').map(Number); return (h || 0) * 60 + (m || 0); };
  const lines = (...arr) => arr.join('\n').replace(/\n{3,}/g, '\n\n').trim();
  const DOW = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const DOW_LONG = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
  const MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  const ddmm = (s) => { const d = parseISO(s); return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`; };
  const fmtNum = (n) => (Math.round(n * 10) / 10).toLocaleString('pt-BR');
  const fmtStamp = (s) => { const d = new Date(s); return `${pad(d.getDate())}/${pad(d.getMonth() + 1)} ${pad(d.getHours())}:${pad(d.getMinutes())}`; };

  /* ---------- Ícones (traço simples, herdam a cor do texto) ---------- */
  const ICONS = {
    board: '<rect x="3" y="4" width="5" height="16" rx="1.5"/><rect x="10" y="4" width="5" height="11" rx="1.5"/><rect x="17" y="4" width="4" height="13" rx="1.5"/>',
    matrix: '<rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.5"/>',
    calendar: '<rect x="3.5" y="5" width="17" height="15.5" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
    timer: '<circle cx="12" cy="13.5" r="7.5"/><path d="M12 10v3.5l2.5 2M9.5 3h5M12 3v3"/>',
    chart: '<path d="M4 20h16"/><path d="M7 16v-5M12 16V6M17 16v-8"/>',
    spark: '<path d="M11 3.5l1.7 4.8 4.8 1.7-4.8 1.7L11 16.5l-1.7-4.8L4.5 10l4.8-1.7z"/><path d="M18 15l.8 2.2 2.2.8-2.2.8L18 21l-.8-2.2-2.2-.8 2.2-.8z"/>',
    inbox: '<path d="M4 13.5h4.5l1.5 2.5h4l1.5-2.5H20"/><path d="M6.2 5h11.6L20 13.5V19a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-5.5z"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M4.6 4.6 6 6M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4"/>',
    moon: '<path d="M20 14.2A8 8 0 1 1 9.8 4a6.5 6.5 0 0 0 10.2 10.2z"/>',
    check: '<path d="M5 12.5l4.2 4.2L19 7"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    x: '<path d="M6 6l12 12M18 6 6 18"/>',
    clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    tomato: '<circle cx="12" cy="13.5" r="7"/><path d="M8.5 6.8 12 8.5l3.5-1.7M12 8.5V4.5"/>',
    checklist: '<path d="M4 7.5l1.8 1.8L9 6M4 15.5l1.8 1.8L9 14M12.5 8h7.5M12.5 16h7.5"/>',
    left: '<path d="M14.5 5.5 8 12l6.5 6.5"/>',
    right: '<path d="M9.5 5.5 16 12l-6.5 6.5"/>',
    download: '<path d="M12 4v11M7 10.5l5 5 5-5M5 20h14"/>',
    upload: '<path d="M12 16V5M7 9.5l5-5 5 5M5 20h14"/>',
    copy: '<rect x="8.5" y="8.5" width="11.5" height="11.5" rx="2"/><path d="M15.5 8.5V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7.5a2 2 0 0 0 2 2h2.5"/>',
    external: '<path d="M14 4h6v6M20 4l-8.5 8.5M18 13.5V19a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5.5"/>',
    sliders: '<path d="M4 6.5h9M17 6.5h3M4 12h3M11 12h9M4 17.5h11M19 17.5h1"/><circle cx="15" cy="6.5" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="17.5" r="2"/>',
    archive: '<rect x="3.5" y="4.5" width="17" height="4.5" rx="1"/><path d="M5 9v9.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9M10 13h4"/>',
    trash: '<path d="M4.5 7h15M9.5 7V4.5h5V7M6.5 7l1 12.5a1 1 0 0 0 1 .9h7a1 1 0 0 0 1-.9l1-12.5"/>',
    alert: '<path d="M12 4 21 19.5H3z"/><path d="M12 10v4.5M12 17.2v.1"/>',
  };
  const icon = (n, cls = '') => `<svg class="i ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[n] || ''}</svg>`;

  /* ---------- Modelo ---------- */
  const LISTS = [
    { id: 'inbox', name: 'Entrada', icon: 'inbox', hint: 'Capture tudo. Classifique depois.', empty: 'Nada na Entrada. Mente livre!' },
    { id: 'week', name: 'Esta semana', icon: 'calendar', hint: 'O que cabe nesta semana.', empty: 'Arraste tarefas para cá.' },
    { id: 'today', name: 'Hoje', icon: 'sun', hint: 'De 3 a 5 tarefas, no máximo.', empty: 'Escolha o que fazer hoje.' },
    { id: 'doing', name: 'Fazendo', icon: 'timer', hint: 'Uma coisa de cada vez.', empty: 'Puxe uma tarefa de Hoje.' },
    { id: 'done', name: 'Concluído', icon: 'check', hint: 'O que você já entregou.', empty: 'Ainda nada por aqui.' },
  ];
  const LIST_IDS = LISTS.map((l) => l.id);
  const LIST_NAME = Object.fromEntries(LISTS.map((l) => [l.id, l.name]));
  const QUADS = {
    1: { name: 'Fazer agora', desc: 'Urgente e importante', tip: 'Faça hoje.' },
    2: { name: 'Agendar', desc: 'Importante, não urgente', tip: 'Reserve um horário na semana.' },
    3: { name: 'Delegar', desc: 'Urgente, não importante', tip: 'Delegue ou resolva em poucos minutos.' },
    4: { name: 'Eliminar', desc: 'Nem urgente nem importante', tip: 'Corte ou deixe para depois.' },
  };
  const AREAS = { faculdade: 'Faculdade', trabalho: 'Trabalho', pessoal: 'Pessoal', saude: 'Saúde' };
  const EVENT_TYPES = { aula: 'Aula', trabalho: 'Trabalho', reuniao: 'Reunião', comunicacao: 'Comunicação', foco: 'Bloco de foco', pessoal: 'Pessoal', descanso: 'Descanso' };
  const MODE_LABEL = { focus: 'Foco', short: 'Pausa curta', long: 'Pausa longa' };
  const MOODS = ['', 'Esgotado', 'Cansado', 'Neutro', 'Bem', 'Ótimo'];
  const PREP = ['Celular longe (em outro cômodo ou no modo foco)', 'Notificações do computador silenciadas', 'Água por perto', 'Uma única tarefa escolhida'];
  const TIPS = [
    'Levante e alongue pescoço e ombros por um minuto.',
    'Regra 20-20-20: olhe para algo a uns 6 metros de distância por 20 segundos.',
    'Beba um copo de água.',
    'Respire: inspire em 4 tempos, segure 4, solte em 6. Repita quatro vezes.',
    'Caminhe até a janela ou dê uma volta pela casa.',
    'Fique longe das redes sociais na pausa: elas cansam o cérebro em vez de descansar.',
  ];

  /* ---------- Armazenamento ---------- */
  const KEY = 'focoos:v1';
  let memCopy = null;
  function load() {
    try { const raw = localStorage.getItem(KEY); if (raw) return JSON.parse(raw); } catch (e) { /* armazenamento bloqueado */ }
    return memCopy ? JSON.parse(memCopy) : null;
  }
  function save() {
    const raw = JSON.stringify(S);
    memCopy = raw;
    try { localStorage.setItem(KEY, raw); } catch (e) { /* segue só em memória */ }
  }
  function defaultHabits() {
    return [
      { id: 'sono', name: 'Dormir 7 h ou mais' },
      { id: 'exercicio', name: 'Exercício físico' },
      { id: 'agua', name: 'Beber 2 L de água' },
      { id: 'celular', name: 'Foco sem celular' },
      { id: 'pausas', name: 'Pausas longe da tela' },
    ];
  }
  function blank() {
    return {
      version: 1, sample: false,
      tasks: [], events: [], sessions: [], aiLog: [], retro: null,
      distractions: {}, habitLog: {}, mood: {}, goals: {},
      habits: defaultHabits(),
      settings: { focus: 25, short: 5, long: 15, wip: 2, theme: 'auto' },
      timer: { mode: 'focus', running: false, endsAt: 0, remaining: 25 * 60000, taskId: '', cycle: 0 },
    };
  }
  function normalizeState(s) {
    const b = blank();
    const out = Object.assign(b, s || {});
    out.settings = Object.assign(blank().settings, (s && s.settings) || {});
    out.timer = Object.assign(blank().timer, (s && s.timer) || {});
    ['tasks', 'events', 'sessions', 'aiLog'].forEach((k) => { if (!Array.isArray(out[k])) out[k] = []; });
    if (!Array.isArray(out.habits)) out.habits = defaultHabits();
    ['distractions', 'habitLog', 'mood', 'goals'].forEach((k) => { if (!out[k] || typeof out[k] !== 'object') out[k] = {}; });
    out.tasks.forEach((t) => {
      t.id = t.id || uid();
      t.title = String(t.title || 'Sem título');
      t.list = LIST_IDS.includes(t.list) ? t.list : 'inbox';
      t.q = clamp(+t.q || 0, 0, 4);
      t.est = +t.est || 0;
      t.pomos = +t.pomos || 0;
      t.checklist = Array.isArray(t.checklist) ? t.checklist : [];
    });
    out.events.forEach((e) => { e.id = e.id || uid(); e.days = Array.isArray(e.days) ? e.days : []; });
    return out;
  }

  /* ---------- Dados de exemplo (datas relativas a hoje) ---------- */
  function seed() {
    const s = blank();
    s.sample = true;
    const now = new Date();
    const d = (n) => iso(addDays(now, n));
    const at = (n, h, m = 0) => { const x = addDays(now, n); x.setHours(h, m, 0, 0); return x.toISOString(); };
    const cl = (...items) => items.map(([text, done]) => ({ id: uid(), text, done: !!done }));
    const T = (title, list, q, area, due, est, pomos, extra = {}) => ({ id: uid(), title, desc: '', list, q, area, due, est, pomos, checklist: [], createdAt: at(-8, 9), doneAt: null, source: '', ...extra });
    const doing = T('Construir o FocoOS (parte prática do trabalho)', 'doing', 1, 'faculdade', d(6), 6, 3, {
      desc: 'Sistema com quadro, matriz de Eisenhower, Pomodoro, agenda semanal, painel e assistente de IA.',
      checklist: cl(['Quadro Kanban', 1], ['Matriz de Eisenhower', 1], ['Timer Pomodoro', 1], ['Painel de produtividade', 0], ['README com prints', 0], ['Publicar no GitHub', 0]),
    });
    s.tasks = [
      T('Ligar para o dentista e remarcar a consulta', 'inbox', 0, 'saude', '', 1, 0),
      T('Pesquisar curso de inglês online', 'inbox', 0, 'pessoal', '', 1, 0),
      T('Assistir vídeo sobre Git rebase', 'inbox', 0, 'faculdade', '', 1, 0),
      T('Organizar as pastas do Google Drive', 'inbox', 0, 'pessoal', '', 1, 0),
      T('Trocar o tema do VS Code (de novo)', 'inbox', 4, 'pessoal', '', 1, 0),
      T('Estudar para a prova de Banco de Dados', 'week', 2, 'faculdade', d(3), 6, 2, { checklist: cl(['Revisar JOINs', 1], ['Normalização (1FN a 3FN)', 0], ['Resolver o simulado', 0]) }),
      T('Escrever a parte teórica do trabalho', 'week', 1, 'faculdade', d(6), 4, 0, { checklist: cl(['Diagnóstico da rotina', 0], ['Desafios de produtividade', 0], ['Métodos e ferramentas', 0], ['Uso da IA', 0], ['Comunicação e saúde mental', 0]) }),
      T('Gravar o vídeo pitch (até 4 min)', 'week', 1, 'faculdade', d(8), 3, 0),
      T('Enviar relatório semanal ao gestor', 'week', 3, 'trabalho', d(2), 1, 0),
      T('Atualizar LinkedIn e portfólio no GitHub', 'week', 2, 'pessoal', d(5), 2, 0),
      T('Assistir à aula de Engenharia de Software', 'today', 1, 'faculdade', d(0), 2, 0),
      T('Revisar o pull request do colega', 'today', 3, 'trabalho', d(0), 1, 0),
      T('Treino na academia', 'today', 2, 'saude', d(0), 2, 0),
      doing,
      T('Responder mensagem do professor', 'done', 3, 'faculdade', d(0), 1, 0, { doneAt: at(0, 0, 40) }),
      T('Corrigir bug no formulário de login', 'done', 1, 'trabalho', d(-1), 3, 3, { doneAt: at(-1, 15) }),
      T('Montar cronograma de estudos da prova', 'done', 2, 'faculdade', d(-1), 1, 1, { doneAt: at(-1, 20) }),
      T('Revisão semanal (GTD)', 'done', 2, 'pessoal', d(-2), 1, 1, { doneAt: at(-2, 18) }),
      T('Pagar o boleto da mensalidade', 'done', 1, 'pessoal', d(-2), 1, 0, { doneAt: at(-2, 12) }),
      T('Ler capítulo sobre GTD (David Allen)', 'done', 2, 'faculdade', d(-3), 2, 2, { doneAt: at(-3, 22) }),
      T('Reunião de alinhamento do estágio', 'done', 1, 'trabalho', d(-4), 1, 0, { doneAt: at(-4, 11) }),
      T('Configurar ambiente Node.js no notebook', 'done', 2, 'trabalho', d(-5), 2, 2, { doneAt: at(-5, 20) }),
      T('Entregar atividade de Estrutura de Dados', 'done', 1, 'faculdade', d(-6), 4, 4, { doneAt: at(-6, 21) }),
      // Período anterior (já arquivado) — serve de comparação no Painel
      T('Estudar recursão', 'done', 2, 'faculdade', d(-9), 2, 2, { doneAt: at(-9, 21), archived: true }),
      T('Enviar documentos do estágio', 'done', 1, 'trabalho', d(-10), 1, 0, { doneAt: at(-10, 10), archived: true }),
      T('Fazer lista de compras do mês', 'done', 3, 'pessoal', d(-11), 1, 0, { doneAt: at(-11, 19), archived: true }),
      T('Revisar anotações da aula', 'done', 2, 'faculdade', d(-12), 1, 1, { doneAt: at(-12, 20), archived: true }),
      T('Resolver lista de exercícios de lógica', 'done', 1, 'faculdade', d(-13), 3, 3, { doneAt: at(-13, 21), archived: true }),
    ];
    const from = d(-60);
    const E = (title, type, date, start, end, days = []) => ({ id: uid(), title, type, date, start, end, days });
    s.events = [
      E('Academia', 'pessoal', from, '07:00', '08:00', [2, 4]),
      E('Expediente do estágio', 'trabalho', from, '09:00', '15:00', [1, 2, 3, 4, 5]),
      E('E-mails e mensagens (bloco único)', 'comunicacao', from, '15:00', '15:30', [1, 2, 3, 4, 5]),
      E('Aula ao vivo: Eng. de Software', 'aula', from, '19:00', '20:30', [1, 3]),
      E('Estudo focado (Pomodoro)', 'foco', from, '19:00', '21:00', [2, 4]),
      E('Tempo livre e descanso', 'descanso', from, '14:00', '18:00', [6]),
      E('Revisão semanal (GTD)', 'pessoal', from, '18:00', '18:30', [0]),
      E('Reunião 1:1 com o gestor', 'reuniao', d(1), '10:00', '10:30'),
      E('Consulta médica', 'pessoal', d(2), '16:00', '17:00'),
      E('Prova de Banco de Dados', 'aula', d(3), '19:00', '20:30'),
    ];
    const ago = (min) => new Date(now.getTime() - min * 60000).toISOString();
    [4, 2, 5, 3, 6, 1, 2].forEach((c, i) => {
      const n = i - 6;
      for (let k = 0; k < c; k++) {
        s.sessions.push({ id: uid(), date: d(n), at: n === 0 ? ago((c - k) * 35) : at(n, 19 + Math.floor(k / 2), (k % 2) * 30), minutes: 25, taskId: n === 0 ? doing.id : '' });
      }
    });
    [3, 2, 4, 1, 3, 2, 2].forEach((c, i) => {
      const n = i - 13;
      for (let k = 0; k < c; k++) s.sessions.push({ id: uid(), date: d(n), at: at(n, 20, (k % 2) * 30), minutes: 25, taskId: '' });
    });
    [3, 2, 4, 1, 2, 3, 1].forEach((c, i) => { s.distractions[d(i - 6)] = c; });
    const pattern = {
      sono: [1, 0, 1, 1, 0, 1, 1],
      exercicio: [0, 1, 0, 1, 0, 1, 0],
      agua: [1, 1, 0, 1, 1, 1, 0],
      celular: [0, 1, 1, 0, 1, 1, 0],
      pausas: [1, 1, 1, 0, 1, 1, 1],
    };
    for (let i = 0; i < 7; i++) s.habitLog[d(i - 6)] = Object.keys(pattern).filter((h) => pattern[h][i]);
    [3, 4, 2, 3, 4, 4].forEach((v, i) => { s.mood[d(i - 6)] = v; });
    s.goals[iso(startOfWeek(now))] = ['Entregar a parte prática do trabalho', 'Estudar 3 h para Banco de Dados', 'Treinar 2x e dormir 7 h por noite'];
    s.timer.taskId = doing.id;
    return s;
  }

  function freshStart() {
    const b = blank();
    b.settings = S.settings;
    b.habits = S.habits;
    b.timer.remaining = b.settings.focus * 60000;
    return b;
  }

  let S = (() => { const loaded = load(); return loaded ? normalizeState(loaded) : seed(); })();
  save();

  const ui = {
    view: 'quadro', weekOffset: 0, adding: null, modal: null, exportData: null,
    ai: { tool: 'dump', input: '', taskId: '', prompt: '', response: '', result: null, msg: { canal: 'E-mail', para: 'Professor(a)', tom: 'Cordial', objetivo: '' } },
  };

  const task = (id) => S.tasks.find((t) => t.id === id);
  const openTasks = () => S.tasks.filter((t) => t.list !== 'done' && !t.archived);
  const weekGoals = () => (S.goals[iso(startOfWeek(new Date()))] || []).filter((g) => g && g.trim());

  function newTask(p) {
    return {
      id: uid(), title: String(p.title || 'Sem título').slice(0, 200), desc: p.desc || '', list: p.list || 'inbox',
      q: p.q || 0, area: p.area || '', due: p.due || '', est: p.est || 0, pomos: 0, checklist: [],
      createdAt: new Date().toISOString(), doneAt: p.list === 'done' ? new Date().toISOString() : null, source: p.source || '',
    };
  }
  function setList(t, list) {
    const prev = t.list;
    if (list === 'done' && prev !== 'done') t.doneAt = new Date().toISOString();
    if (list !== 'done') t.doneAt = null;
    t.list = list;
    if (list === 'doing' && prev !== 'doing') {
      const n = S.tasks.filter((x) => x.list === 'doing' && !x.archived).length;
      if (n > S.settings.wip) toast(`${n} tarefas em Fazendo (limite ${S.settings.wip}). Termine uma antes de começar outra.`, 'warn');
    }
  }
  function moveTask(t, list, beforeId) {
    S.tasks.splice(S.tasks.indexOf(t), 1);
    const i = beforeId ? S.tasks.findIndex((x) => x.id === beforeId) : -1;
    if (i >= 0) S.tasks.splice(i, 0, t); else S.tasks.push(t);
    setList(t, list);
  }
  function toggleDone(t) {
    if (!t) return;
    if (t.list === 'done') {
      moveTask(t, 'today', null);
      toast('Tarefa reaberta em Hoje.');
    } else {
      const first = S.tasks.find((x) => x.list === 'done' && !x.archived && x.id !== t.id);
      moveTask(t, 'done', first ? first.id : null);
      toast('Tarefa concluída. Boa!', 'good');
    }
    save();
    render();
  }
  function eventsOn(k) {
    const wd = parseISO(k).getDay();
    return S.events
      .filter((e) => (e.days.length ? e.days.includes(wd) && k >= e.date : e.date === k))
      .sort((a, b) => a.start.localeCompare(b.start));
  }
  function dueLabel(due) {
    const now = new Date();
    if (due === iso(now)) return 'Hoje';
    if (due === iso(addDays(now, 1))) return 'Amanhã';
    if (due === iso(addDays(now, -1))) return 'Ontem';
    return `${DOW[parseISO(due).getDay()]} ${ddmm(due)}`;
  }

  /* ---------- Captura rápida: "Estudar SQL !2 @sex #faculdade" ---------- */
  function parseWhen(tok) {
    const t = norm(tok);
    const base = new Date();
    if (t === 'hoje') return iso(base);
    if (t === 'amanha') return iso(addDays(base, 1));
    const wds = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'];
    const w = wds.indexOf(t.slice(0, 3));
    if (w >= 0) { let x = addDays(base, 1); while (x.getDay() !== w) x = addDays(x, 1); return iso(x); }
    const m = t.match(/^(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?$/);
    if (m) {
      let y = m[3] ? +m[3] : base.getFullYear();
      if (y < 100) y += 2000;
      const x = new Date(y, +m[2] - 1, +m[1]);
      if (!m[3] && x < addDays(base, -1)) x.setFullYear(y + 1);
      return iso(x);
    }
    return '';
  }
  function parseCapture(text) {
    let q = 0, due = '', area = '';
    let s = ` ${text} `;
    s = s.replace(/\s!([1-4])(?=\s)/g, (_, n) => { q = +n; return ' '; });
    s = s.replace(/\s#(faculdade|trabalho|pessoal|saude|saúde)(?=\s)/gi, (_, a) => { area = norm(a); return ' '; });
    s = s.replace(/\s@(\S+)(?=\s)/g, (m, tok) => { const x = parseWhen(tok); if (x) { due = x; return ' '; } return m; });
    return { title: s.replace(/\s+/g, ' ').trim(), q, due, area };
  }

  /* ---------- Cartão de tarefa ---------- */
  function cardHTML(t, o = {}) {
    const chipMode = o.chip || 'full';
    const done = t.list === 'done';
    const tdy = todayISO();
    const late = t.due && !done && t.due < tdy;
    const soon = t.due && !done && t.due === tdy;
    const cl = t.checklist.length ? `${t.checklist.filter((c) => c.done).length}/${t.checklist.length}` : '';
    let chip = '';
    if (chipMode === 'full') chip = t.q ? `<span class="qchip q${t.q}">Q${t.q} · ${QUADS[t.q].name}</span>` : '<span class="qchip q0">Sem prioridade</span>';
    else if (chipMode === 'short' && t.q) chip = `<span class="qchip q${t.q}" title="${QUADS[t.q].name}">Q${t.q}</span>`;
    const meta = [
      t.due ? `<span class="badge${late ? ' late' : soon ? ' soon' : ''}" title="Prazo">${icon('clock')}${late ? 'Atrasada · ' : ''}${dueLabel(t.due)}</span>` : '',
      t.est || t.pomos ? `<span class="badge" title="Pomodoros feitos / estimados">${icon('tomato')}${t.pomos}${t.est ? '/' + t.est : ''}</span>` : '',
      cl ? `<span class="badge" title="Checklist">${icon('checklist')}${cl}</span>` : '',
      t.source === 'ia' ? '<span class="badge ai" title="Criada ou organizada pelo Assistente IA">IA</span>' : '',
      t.area && o.area !== false ? `<span class="area">${AREAS[t.area] || ''}</span>` : '',
    ].join('');
    return `<article class="card${done ? ' is-done' : ''}${o.compact ? ' compact' : ''}" draggable="true" data-id="${t.id}" tabindex="0" aria-label="${esc(t.title)}">
      ${chip}
      <div class="card-row"><button type="button" class="check" data-act="toggle-done" aria-label="${done ? 'Reabrir tarefa' : 'Concluir tarefa'}" aria-pressed="${done}">${icon('check')}</button><h3 class="card-title">${esc(t.title)}</h3></div>
      ${meta ? `<div class="card-meta">${meta}</div>` : ''}
    </article>`;
  }
  const viewHead = (title, sub, actions = '') => `<header class="view-head"><div><h1>${title}</h1><p>${sub}</p></div>${actions ? `<div class="actions">${actions}</div>` : ''}</header>`;

  /* ---------- Quadro (Kanban + GTD) ---------- */
  function agendaStrip() {
    const k = todayISO();
    const evs = eventsOn(k);
    const now = new Date();
    const nowMin = now.getHours() * 60 + now.getMinutes();
    return `<div class="agenda-strip" aria-label="Compromissos de hoje">
      <span class="as-label">${icon('calendar')} Hoje · ${DOW[now.getDay()]} ${ddmm(k)}</span>
      ${evs.length ? evs.map((e) => `<button type="button" class="as-ev t-${e.type}${minutes(e.end) <= nowMin ? ' is-past' : ''}" data-act="edit-event" data-eid="${e.id}"><span class="mono">${e.start}</span>${esc(e.title)}</button>`).join('') : '<span class="muted small">Sem compromissos hoje.</span>'}
      <a class="as-more" href="#semana" data-act="goto" data-view="semana">Ver semana ${icon('right')}</a>
    </div>`;
  }
  function renderBoard() {
    const inboxCount = S.tasks.filter((t) => t.list === 'inbox' && !t.archived).length;
    const lanes = LISTS.map((l) => {
      const items = S.tasks.filter((t) => t.list === l.id && !t.archived);
      const over = l.id === 'doing' && items.length > S.settings.wip;
      const count = l.id === 'doing' ? `${items.length}/${S.settings.wip}` : items.length;
      let foot;
      if (l.id === 'done') {
        foot = items.length ? `<button type="button" class="lane-add" data-act="archive-done" data-confirm="Confirmar arquivamento">${icon('archive')} Arquivar concluídas</button>` : '';
      } else if (ui.adding === l.id) {
        foot = `<form class="add-form" data-list="${l.id}"><label class="sr-only" for="add-${l.id}">Nova tarefa em ${l.name}</label><textarea id="add-${l.id}" rows="2" placeholder="Título da tarefa. Cole várias linhas para criar várias."></textarea><div class="row"><button class="btn primary sm" type="submit">Adicionar</button><button class="btn ghost sm" type="button" data-act="add-cancel">Cancelar</button></div></form>`;
      } else {
        foot = `<button type="button" class="lane-add" data-act="add-open" data-list="${l.id}">${icon('plus')} Adicionar tarefa</button>`;
      }
      return `<section class="lane${over ? ' is-over' : ''}" aria-label="${l.name}">
        <header class="lane-head"><h2>${icon(l.icon)}${l.name}</h2><span class="count${over ? ' warn' : ''}" title="${l.id === 'doing' ? 'Tarefas / limite WIP' : 'Tarefas'}">${count}</span></header>
        <p class="lane-hint">${over ? 'Acima do limite. Termine uma tarefa antes de puxar outra.' : l.hint}</p>
        <div class="lane-cards" data-drop="list:${l.id}" data-keep-scroll="lane-${l.id}">${items.map((t) => cardHTML(t)).join('') || `<p class="empty">${l.empty}</p>`}</div>
        ${foot}
      </section>`;
    }).join('');
    const actions = inboxCount >= 3 ? `<button type="button" class="btn" data-act="goto-ai" data-tool="triage">${icon('spark')} Organizar Entrada com IA</button>` : '';
    return `${viewHead('Quadro', 'Capture na Entrada, planeje a semana, escolha o dia e execute uma tarefa de cada vez. Arraste os cartões entre as colunas.', actions)}
      ${agendaStrip()}
      <div class="board" data-keep-scroll="board">${lanes}</div>`;
  }

  /* ---------- Matriz de Eisenhower ---------- */
  function renderMatrix() {
    const open = openTasks();
    const of = (q) => open.filter((t) => (t.q || 0) === q);
    const quad = (q) => {
      const items = of(q);
      return `<section class="quad q${q}" data-drop="q:${q}" aria-label="Q${q}: ${QUADS[q].name}">
        <header><span class="qchip q${q}">Q${q} · ${QUADS[q].name}</span><span class="count">${items.length}</span></header>
        <p class="quad-desc">${QUADS[q].desc}. ${QUADS[q].tip}</p>
        <div class="quad-cards">${items.map((t) => cardHTML(t, { chip: 'none', area: false, compact: true })).join('') || '<p class="empty">Solte tarefas aqui.</p>'}</div>
      </section>`;
    };
    const unq = of(0);
    return `${viewHead('Matriz de Eisenhower', 'Arraste cada tarefa para o quadrante certo: urgência no eixo horizontal, importância no vertical.')}
      <section class="tray" data-drop="q:0" aria-label="Tarefas sem classificação">
        <header><h2>Sem classificação</h2><span class="count">${unq.length}</span>${unq.length >= 2 ? `<button type="button" class="btn sm" data-act="goto-ai" data-tool="triage">${icon('spark')} Classificar com IA</button>` : ''}</header>
        <div class="tray-cards">${unq.map((t) => cardHTML(t, { chip: 'none', area: false, compact: true })).join('') || '<p class="empty">Tudo classificado.</p>'}</div>
      </section>
      <div class="matrix">
        <div class="axis-x" aria-hidden="true"><span>Urgente</span><span>Não urgente</span></div>
        <div class="axis-y" aria-hidden="true"><span>Importante</span><span>Não importante</span></div>
        ${[1, 2, 3, 4].map(quad).join('')}
      </div>`;
  }

  /* ---------- Semana (planejamento + compromissos) ---------- */
  function renderWeek() {
    const ws = startOfWeek(addDays(new Date(), ui.weekOffset * 7));
    const days = Array.from({ length: 7 }, (_, i) => addDays(ws, i));
    const key = iso(ws);
    const goals = S.goals[key] || ['', '', ''];
    const we = days[6];
    const range = `${ws.getDate()} ${MONTHS[ws.getMonth()]} a ${we.getDate()} ${MONTHS[we.getMonth()]} de ${we.getFullYear()}`;
    const tdy = todayISO();
    const cols = days.map((d) => {
      const k = iso(d);
      const evs = eventsOn(k);
      const tasks = S.tasks.filter((t) => t.due === k && !t.archived);
      const hrs = evs.reduce((a, e) => a + Math.max(0, minutes(e.end) - minutes(e.start)), 0) / 60;
      const pending = tasks.filter((t) => t.list !== 'done').length;
      return `<section class="day${k === tdy ? ' is-today' : ''}${k < tdy ? ' is-past' : ''}" data-drop="due:${k}" aria-label="${DOW_LONG[d.getDay()]}, ${ddmm(k)}">
        <header class="day-head"><span class="dow">${DOW[d.getDay()]}</span><span class="dnum">${d.getDate()}</span>${k === tdy ? '<span class="pill">Hoje</span>' : ''}<button type="button" class="icon-btn sm" data-act="new-event" data-date="${k}" aria-label="Novo compromisso em ${ddmm(k)}">${icon('plus')}</button></header>
        <p class="day-load">${fmtNum(hrs)} h de agenda · ${pending} tarefa${pending === 1 ? '' : 's'}</p>
        <ul class="events">${evs.map((e) => `<li><button type="button" class="ev t-${e.type}" data-act="edit-event" data-eid="${e.id}"><span class="ev-time">${e.start}–${e.end}</span><span class="ev-title">${esc(e.title)}</span></button></li>`).join('')}</ul>
        <div class="day-tasks">${tasks.map((t) => cardHTML(t, { chip: 'short', area: false, compact: true })).join('')}</div>
      </section>`;
    }).join('');
    const nodate = openTasks().filter((t) => !t.due);
    const legend = Object.entries(EVENT_TYPES).map(([k, v]) => `<span class="t-${k}">${v}</span>`).join('');
    const actions = `<div class="seg" role="group" aria-label="Navegar entre semanas"><button type="button" data-act="week-prev" aria-label="Semana anterior">${icon('left')}</button><button type="button" data-act="week-today">Hoje</button><button type="button" data-act="week-next" aria-label="Próxima semana">${icon('right')}</button></div>
      <button type="button" class="btn" data-act="new-event">${icon('plus')} Compromisso</button>
      <button type="button" class="btn" data-act="export-ics">${icon('download')} Google Agenda</button>`;
    const placeholders = ['A entrega mais importante', 'Um avanço nos estudos', 'Um cuidado com você'];
    return `${viewHead('Semana', `Planejamento de ${range}`, actions)}
      <section class="goals" aria-label="Prioridades da semana"><h2>3 prioridades da semana</h2><div class="goal-list">${[0, 1, 2].map((i) => `<label class="goal" for="goal-${i}"><span class="goal-n">${i + 1}</span><input id="goal-${i}" data-goal="${i}" data-week="${key}" value="${esc(goals[i] || '')}" placeholder="${placeholders[i]}" autocomplete="off"></label>`).join('')}</div></section>
      <section class="tray strip" data-drop="due:" aria-label="Tarefas sem data">
        <header><h2>Tarefas sem data</h2><span class="count">${nodate.length}</span><p class="tray-hint">Arraste para um dia para agendar. Solte aqui para tirar a data.</p></header>
        <div class="tray-cards">${nodate.map((t) => cardHTML(t, { chip: 'short', area: false, compact: true })).join('') || '<p class="empty">Todas as tarefas abertas têm data.</p>'}</div>
      </section>
      <div class="week-scroll" data-keep-scroll="week"><div class="week-grid">${cols}</div></div>
      <div class="legend" aria-label="Tipos de compromisso">${legend}</div>`;
  }

  /* ---------- Foco (Pomodoro) ---------- */
  const RING_C = 2 * Math.PI * 96;
  const durOf = (m) => (m === 'focus' ? S.settings.focus : m === 'short' ? S.settings.short : S.settings.long) * 60000;
  const timerLeft = () => (S.timer.running ? Math.max(0, S.timer.endsAt - Date.now()) : S.timer.remaining);
  const fmtClock = (ms) => { const s = Math.ceil(ms / 1000); return `${pad(Math.floor(s / 60))}:${pad(s % 60)}`; };

  function renderFocus() {
    const T = S.timer;
    const order = { doing: 0, today: 1, week: 2, inbox: 3 };
    const open = openTasks().sort((a, b) => order[a.list] - order[b.list]);
    const tdy = todayISO();
    const todays = S.sessions.filter((s) => s.date === tdy).sort((a, b) => a.at.localeCompare(b.at));
    const distr = S.distractions[tdy] || 0;
    const tip = TIPS[(new Date().getDate() + todays.length) % TIPS.length];
    return `${viewHead('Foco', `Técnica Pomodoro: ${S.settings.focus} minutos de foco total e ${S.settings.short} de pausa. A cada 4 ciclos, uma pausa longa de ${S.settings.long}.`)}
    <div class="focus">
      <section class="focus-main panel" aria-label="Timer Pomodoro">
        <div class="seg" role="group" aria-label="Modo do timer">${['focus', 'short', 'long'].map((m) => `<button type="button" data-act="timer-mode" data-mode="${m}" aria-pressed="${T.mode === m}">${MODE_LABEL[m]}</button>`).join('')}</div>
        <div class="ring-wrap mode-${T.mode}">
          <svg class="ring" viewBox="0 0 220 220" aria-hidden="true"><circle class="ring-track" cx="110" cy="110" r="96"/><circle class="ring-bar" id="ring-bar" cx="110" cy="110" r="96" stroke-dasharray="${RING_C.toFixed(2)}" stroke-dashoffset="0" transform="rotate(-90 110 110)"/></svg>
          <div class="ring-center"><div class="clock" id="clock" role="timer">${fmtClock(timerLeft())}</div><div class="ring-sub">${MODE_LABEL[T.mode]} · ciclo ${(T.cycle % 4) + 1} de 4</div></div>
        </div>
        <div class="cycle-dots" aria-label="${T.cycle % 4} de 4 ciclos concluídos">${[0, 1, 2, 3].map((i) => `<i class="${i < T.cycle % 4 ? 'on' : ''}"></i>`).join('')}</div>
        <div class="timer-controls"><button type="button" class="btn tomato lg" id="timer-toggle" data-act="timer-toggle">Iniciar</button><button type="button" class="btn" data-act="timer-reset">Reiniciar</button><button type="button" class="btn ghost" data-act="timer-skip">Pular</button></div>
        <label class="field" for="timer-task"><span>Tarefa em foco</span><select id="timer-task"><option value="">Sem tarefa vinculada</option>${open.map((t) => `<option value="${t.id}"${t.id === T.taskId ? ' selected' : ''}>${LIST_NAME[t.list]} · ${esc(t.title)}</option>`).join('')}</select></label>
      </section>
      <div class="focus-side">
        <section class="panel"><h2>Capturar distração</h2><p class="muted small">Lembrou de algo no meio do foco? Anote e volte. O item vai para a Entrada.</p><form class="inline-form" id="distraction-form"><label class="sr-only" for="distraction-input">Distração</label><input id="distraction-input" placeholder="Ex.: pagar a conta de luz" autocomplete="off"><button class="btn" type="submit">Anotar</button></form><p class="muted small">Distrações registradas hoje: <strong>${distr}</strong></p></section>
        <section class="panel"><h2>Antes de começar</h2><ul class="prep">${PREP.map((p, i) => `<li><input type="checkbox" id="prep-${i}"><label for="prep-${i}">${p}</label></li>`).join('')}</ul></section>
        <section class="panel"><h2>Ideia para a pausa</h2><p>${tip}</p></section>
        <section class="panel"><h2>Sessões de hoje <span class="count">${todays.length}</span></h2>${todays.length ? `<ol class="sessions">${todays.map((s) => { const t = task(s.taskId); const h = new Date(s.at); return `<li><span class="mono">${pad(h.getHours())}:${pad(h.getMinutes())}</span> · ${s.minutes} min${t ? ' · ' + esc(t.title) : ''}</li>`; }).join('')}</ol>` : '<p class="muted small">Nenhum pomodoro ainda. Comece o primeiro!</p>'}</section>
      </div>
    </div>`;
  }

  let audioCtx = null;
  function unlockAudio() {
    try { audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)(); if (audioCtx.state === 'suspended') audioCtx.resume(); } catch (e) { audioCtx = null; }
  }
  function beep() {
    try {
      if (!audioCtx) return;
      const t0 = audioCtx.currentTime;
      [0, 0.28, 0.56].forEach((o) => {
        const osc = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.value = 880;
        g.gain.setValueAtTime(0.0001, t0 + o);
        g.gain.exponentialRampToValueAtTime(0.22, t0 + o + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + o + 0.22);
        osc.connect(g).connect(audioCtx.destination);
        osc.start(t0 + o);
        osc.stop(t0 + o + 0.24);
      });
    } catch (e) { /* sem som */ }
  }
  function notify(msg) {
    try { if ('Notification' in window && Notification.permission === 'granted' && document.hidden) new Notification('FocoOS', { body: msg }); } catch (e) { /* sem notificação */ }
  }
  function askNotify() {
    try { if ('Notification' in window && Notification.permission === 'default') { const p = Notification.requestPermission(); if (p && p.catch) p.catch(() => {}); } } catch (e) { /* ignorado */ }
  }
  function timerRefresh() { if (ui.view === 'foco') render(); else updateTimerUI(); }
  function timerStart() {
    const T = S.timer;
    if (T.running) return;
    if (T.remaining <= 0) T.remaining = durOf(T.mode);
    T.endsAt = Date.now() + T.remaining;
    T.running = true;
    unlockAudio();
    askNotify();
    save();
    timerRefresh();
  }
  function timerPause() { const T = S.timer; T.remaining = timerLeft(); T.running = false; save(); timerRefresh(); }
  function timerReset() { const T = S.timer; T.running = false; T.remaining = durOf(T.mode); save(); timerRefresh(); }
  function timerSetMode(m) { const T = S.timer; T.mode = m; T.running = false; T.remaining = durOf(m); save(); timerRefresh(); }
  function timerSkip() { timerSetMode(S.timer.mode === 'focus' ? 'short' : 'focus'); }
  function timerComplete(silent) {
    const T = S.timer;
    let msg;
    if (T.mode === 'focus') {
      S.sessions.push({ id: uid(), date: todayISO(), at: new Date().toISOString(), minutes: S.settings.focus, taskId: T.taskId || '' });
      const t = task(T.taskId);
      if (t) t.pomos = (t.pomos || 0) + 1;
      T.cycle = (T.cycle || 0) + 1;
      T.mode = T.cycle % 4 === 0 ? 'long' : 'short';
      msg = `Pomodoro concluído! Hora da ${MODE_LABEL[T.mode].toLowerCase()}.`;
    } else {
      T.mode = 'focus';
      msg = 'Pausa encerrada. Bora focar?';
    }
    T.running = false;
    T.remaining = durOf(T.mode);
    save();
    if (!silent) { beep(); notify(msg); toast(msg, 'good'); }
    if (ui.view === 'foco' || ui.view === 'painel') render(); else updateTimerUI();
  }
  const BASE_TITLE = document.title;
  function updateTimerUI() {
    const T = S.timer;
    const left = timerLeft();
    const total = durOf(T.mode);
    const txt = fmtClock(left);
    const clock = $('#clock');
    if (clock) clock.textContent = txt;
    const bar = $('#ring-bar');
    if (bar) bar.setAttribute('stroke-dashoffset', (RING_C * (1 - left / total)).toFixed(2));
    const btn = $('#timer-toggle');
    if (btn) btn.textContent = T.running ? 'Pausar' : left < total ? 'Continuar' : 'Iniciar';
    const chip = $('#timer-chip');
    if (chip) {
      const active = T.running || left < total;
      chip.hidden = !active || ui.view === 'foco';
      chip.classList.toggle('paused', !T.running);
      chip.dataset.mode = T.mode;
      chip.querySelector('.tc-time').textContent = txt;
      chip.querySelector('.tc-mode').textContent = T.running ? MODE_LABEL[T.mode] : 'Pausado';
    }
    document.title = T.running ? `${txt} ${MODE_LABEL[T.mode]} · FocoOS` : BASE_TITLE;
  }
  function tick() {
    if (!S.timer.running) return;
    if (timerLeft() <= 0) timerComplete(false); else updateTimerUI();
  }

  /* ---------- Painel (dashboard) ---------- */
  function lastDays(n, offset = 0) { const now = new Date(); return Array.from({ length: n }, (_, i) => iso(addDays(now, i - n + 1 - offset))); }
  function stats() {
    const days = lastDays(7);
    const prevDays = new Set(lastDays(7, 7));
    const cur = new Set(days);
    const doneDate = (t) => (t.doneAt ? iso(new Date(t.doneAt)) : '');
    const doneCur = S.tasks.filter((t) => t.doneAt && cur.has(doneDate(t)));
    const donePrev = S.tasks.filter((t) => t.doneAt && prevDays.has(doneDate(t)));
    const sesCur = S.sessions.filter((s) => cur.has(s.date));
    const sesPrev = S.sessions.filter((s) => prevDays.has(s.date));
    const habitIds = new Set(S.habits.map((h) => h.id));
    const perDay = days.map((k) => {
      const ses = sesCur.filter((s) => s.date === k);
      return {
        k,
        pomos: ses.length,
        mins: ses.reduce((a, s) => a + s.minutes, 0),
        done: doneCur.filter((t) => doneDate(t) === k).length,
        habits: (S.habitLog[k] || []).filter((h) => habitIds.has(h)).length,
        mood: S.mood[k] || 0,
        distr: S.distractions[k] || 0,
      };
    });
    const open = openTasks();
    const tdy = todayISO();
    const overdue = open.filter((t) => t.due && t.due < tdy);
    const byQ = [0, 1, 2, 3, 4].map((q) => open.filter((t) => (t.q || 0) === q).length);
    const habitChecks = perDay.reduce((a, d) => a + d.habits, 0);
    const habitPct = S.habits.length ? Math.round((habitChecks / (S.habits.length * 7)) * 100) : 0;
    const moods = perDay.map((d) => d.mood).filter(Boolean);
    const moodAvg = moods.length ? moods.reduce((a, b) => a + b, 0) / moods.length : 0;
    const habitRows = S.habits.map((h) => ({ ...h, n: days.filter((k) => (S.habitLog[k] || []).includes(h.id)).length }));
    const aiCount = S.aiLog.filter((l) => cur.has(iso(new Date(l.at)))).reduce((a, l) => a + (l.created || 0) + (l.updated || 0) + (l.blocks || 0) + (l.subs || 0), 0);
    return {
      days, perDay, open, overdue, byQ, habitPct, moodAvg, habitRows, aiCount,
      doneCur: doneCur.length, donePrev: donePrev.length,
      focusMin: sesCur.reduce((a, s) => a + s.minutes, 0), focusPrev: sesPrev.reduce((a, s) => a + s.minutes, 0),
      pomos: sesCur.length, distr: perDay.reduce((a, d) => a + d.distr, 0),
    };
  }
  function niceStep(max) {
    const raw = max / 3;
    const p = Math.pow(10, Math.floor(Math.log10(raw)));
    const n = raw / p;
    return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * p;
  }
  function barPath(x, y, w, h, r) {
    r = Math.min(r, h, w / 2);
    return `M${x},${y + h}V${y + r}Q${x},${y} ${x + r},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h}Z`;
  }
  // Colunas de uma série só: 24px no máximo, ponta arredondada, base reta, rótulo só no maior valor e em hoje.
  function barChart(data, cls, label) {
    const W = 420, H = 200, L = 30, R = 8, T = 20, B = 30;
    const vmax = Math.max(0, ...data.map((d) => d.value));
    const step = Math.max(1, niceStep(Math.max(vmax, 3)));
    const top = Math.max(step, Math.ceil(vmax / step) * step);
    const iw = W - L - R, ih = H - T - B, band = iw / data.length, bw = Math.min(24, band * 0.56);
    const y = (v) => T + ih - (v / top) * ih;
    let s = `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(label)}">`;
    for (let v = 0; v <= top + 1e-9; v += step) s += `<line class="grid" x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}"/><text class="tick" x="${L - 7}" y="${y(v) + 3.5}" text-anchor="end">${fmtNum(v)}</text>`;
    const maxI = data.reduce((bi, d, i) => (d.value > data[bi].value ? i : bi), 0);
    data.forEach((d, i) => {
      const cx = L + band * i + band / 2;
      const h = (d.value / top) * ih;
      const yy = T + ih - h;
      s += '<g class="col">';
      if (h > 0) s += `<path class="bar ${cls}" d="${barPath(cx - bw / 2, yy, bw, h, 4)}"/>`;
      if ((i === maxI && d.value > 0) || d.isToday) s += `<text class="val" x="${cx}" y="${yy - 6}" text-anchor="middle">${fmtNum(d.value)}</text>`;
      s += `<text class="xl${d.isToday ? ' today' : ''}" x="${cx}" y="${H - B + 17}" text-anchor="middle">${d.label}</text>`;
      s += `<rect class="hit" x="${L + band * i}" y="${T}" width="${band}" height="${ih}" fill="transparent" tabindex="0" data-tip="${esc(d.tip)}"/>`;
      s += '</g>';
    });
    s += `<line class="axis" x1="${L}" x2="${W - R}" y1="${T + ih}" y2="${T + ih}"/></svg>`;
    return s;
  }
  function insights(st) {
    const out = [];
    const best = st.perDay.reduce((b, d) => (d.pomos > b.pomos ? d : b), st.perDay[0]);
    if (best && best.pomos) out.push(`Seu dia mais focado foi ${DOW_LONG[parseISO(best.k).getDay()]}, com ${best.pomos} pomodoros (${fmtNum(best.mins / 60)} h).`);
    const diff = st.doneCur - st.donePrev;
    if (st.doneCur || st.donePrev) out.push(diff >= 0 ? `Você concluiu ${st.doneCur} tarefas em 7 dias${st.donePrev ? `, ${diff} a mais que nos 7 dias anteriores` : ''}.` : `Você concluiu ${st.doneCur} tarefas em 7 dias, ${-diff} a menos que nos 7 dias anteriores. Vale rever o que travou.`);
    const classified = st.byQ[1] + st.byQ[2] + st.byQ[3] + st.byQ[4];
    if (classified) {
      const q1 = st.byQ[1] / classified;
      if (q1 >= 0.4) out.push(`${Math.round(q1 * 100)}% das tarefas abertas são urgentes (Q1). Reserve blocos na agenda para o Q2 e evite viver apagando incêndios.`);
      else if (st.byQ[2] >= st.byQ[1]) out.push('A maior parte das suas tarefas está no Q2 (importante, não urgente): sinal de planejamento em dia.');
    }
    const inbox = st.open.filter((t) => t.list === 'inbox').length;
    if (inbox >= 5) out.push(`A Entrada tem ${inbox} itens. O Assistente IA classifica todos de uma vez.`);
    if (st.overdue.length) out.push(`${st.overdue.length} tarefa(s) atrasada(s). Renegocie o prazo ou mova para Hoje.`);
    const weak = [...st.habitRows].sort((a, b) => a.n - b.n)[0];
    if (weak && weak.n < 4) out.push(`Hábito mais difícil: "${weak.name}" (${weak.n}/7). Que tal um horário fixo na agenda?`);
    if (st.distr >= 8) out.push(`${st.distr} distrações registradas. Silenciar as notificações durante o foco ajuda muito.`);
    if (st.moodAvg && st.moodAvg < 3) out.push('Seu humor médio está baixo. Planeje pausas e tempo livre: descanso também é produtividade.');
    return out.slice(0, 5);
  }
  function renderDash() {
    const st = stats();
    const tdy = todayISO();
    const dayLabel = (k) => DOW[parseISO(k).getDay()];
    const delta = (a, b, unit = '') => {
      if (!a && !b) return '<span class="delta">sem dados no período anterior</span>';
      const d = Math.round((a - b) * 10) / 10;
      const cls = d > 0 ? 'up' : d < 0 ? 'down' : '';
      return `<span class="delta ${cls}">${d > 0 ? '▲' : d < 0 ? '▼' : '='} ${fmtNum(Math.abs(d))}${unit} vs. 7 dias anteriores</span>`;
    };
    const kpis = `<div class="kpis">
      <article class="kpi"><h3>Tarefas concluídas</h3><p class="kpi-v">${st.doneCur}</p>${delta(st.doneCur, st.donePrev)}</article>
      <article class="kpi"><h3>Horas de foco</h3><p class="kpi-v">${fmtNum(st.focusMin / 60)} h</p>${delta(st.focusMin / 60, st.focusPrev / 60, ' h')}</article>
      <article class="kpi"><h3>Hábitos cumpridos</h3><p class="kpi-v">${st.habitPct}%</p><div class="meter" aria-hidden="true"><i style="width:${st.habitPct}%"></i></div></article>
      <article class="kpi ${st.overdue.length ? 'is-crit' : 'is-good'}"><h3>Tarefas atrasadas</h3><p class="kpi-v">${st.overdue.length}</p><span class="status">${st.overdue.length ? icon('alert') + ' Revise os prazos' : icon('check') + ' Tudo em dia'}</span></article>
    </div>`;
    const focusChart = barChart(st.perDay.map((d) => ({ label: dayLabel(d.k), value: d.pomos, isToday: d.k === tdy, tip: `${dayLabel(d.k)} ${ddmm(d.k)}\n${d.pomos} pomodoro(s) · ${fmtNum(d.mins / 60)} h de foco` })), 'bar-focus', 'Pomodoros por dia nos últimos 7 dias');
    const doneChart = barChart(st.perDay.map((d) => ({ label: dayLabel(d.k), value: d.done, isToday: d.k === tdy, tip: `${dayLabel(d.k)} ${ddmm(d.k)}\n${d.done} tarefa(s) concluída(s)` })), 'bar-done', 'Tarefas concluídas por dia nos últimos 7 dias');
    const totalQ = st.byQ.reduce((a, b) => a + b, 0) || 1;
    const maxQ = Math.max(1, ...st.byQ);
    const qbars = [1, 2, 3, 4, 0].map((q) => {
      const n = st.byQ[q];
      const name = q ? `Q${q} · ${QUADS[q].name}` : 'Sem classificação';
      return `<div class="hbar" tabindex="0" data-tip="${esc(name)}\n${n} tarefa(s) · ${Math.round((n / totalQ) * 100)}% das abertas"><span class="hl">${name}</span><span class="track"><i class="fill q${q}" style="width:${(n / maxQ) * 100}%"></i></span><span class="hv">${n}</span></div>`;
    }).join('');
    const habitTable = `<div class="table-scroll"><table class="habits"><thead><tr><th scope="col"><span class="sr-only">Hábito</span></th>${st.days.map((k) => `<th scope="col" class="${k === tdy ? 'is-today' : ''}"><span>${dayLabel(k)}</span><span class="mono">${parseISO(k).getDate()}</span></th>`).join('')}<th scope="col">7 dias</th></tr></thead><tbody>${st.habitRows.map((h) => `<tr><th scope="row"><span>${esc(h.name)}</span><button type="button" class="icon-btn xs" data-act="habit-del" data-hid="${h.id}" data-confirm="Remover?" aria-label="Remover o hábito ${esc(h.name)}">${icon('x')}</button></th>${st.days.map((k) => { const on = (S.habitLog[k] || []).includes(h.id); return `<td><button type="button" class="dot-btn${on ? ' on' : ''}" data-act="habit" data-hid="${h.id}" data-day="${k}" aria-pressed="${on}" aria-label="${esc(h.name)} em ${ddmm(k)}">${icon('check')}</button></td>`; }).join('')}<td class="mono">${h.n}/7</td></tr>`).join('')}</tbody></table></div>
      <form class="inline-form" id="habit-form"><label class="sr-only" for="habit-input">Novo hábito</label><input id="habit-input" placeholder="Novo hábito (ex.: Ler 10 páginas)" autocomplete="off"><button class="btn sm" type="submit">${icon('plus')} Adicionar</button></form>`;
    const mood = `<div class="mood-pick" role="group" aria-label="Como você está hoje?">${[1, 2, 3, 4, 5].map((v) => `<button type="button" class="mood" data-act="mood" data-v="${v}" aria-pressed="${S.mood[tdy] === v}"><span class="mood-n">${v}</span><span>${MOODS[v]}</span></button>`).join('')}</div>
      <div class="mood-strip">${st.perDay.map((d) => `<div class="ms" tabindex="0" data-tip="${dayLabel(d.k)} ${ddmm(d.k)}\n${d.mood ? `${d.mood} · ${MOODS[d.mood]}` : 'Sem registro'}"><span class="ms-bar"><i style="height:${d.mood * 20}%"></i></span><span class="ms-l${d.k === tdy ? ' today' : ''}">${dayLabel(d.k)}</span></div>`).join('')}</div>
      <p class="muted small">Média da semana: ${st.moodAvg ? `${fmtNum(st.moodAvg)} de 5` : 'sem registros'}</p>`;
    const ins = insights(st);
    const recent = S.aiLog.slice(0, 3);
    const aiPanel = `<section class="panel"><h2>${icon('spark')} Uso da IA</h2><p class="kpi-v">${st.aiCount}</p><p class="muted small">itens criados ou organizados pela IA nos últimos 7 dias</p>${recent.length ? `<ul class="mini-log">${recent.map((l) => `<li><span class="mono">${fmtStamp(l.at)}</span>${esc(toolName(l.tool))}</li>`).join('')}</ul>` : '<p class="small"><a href="#ia" data-act="goto" data-view="ia">Abrir o Assistente IA</a></p>'}</section>`;
    const retro = S.retro ? `<section class="panel span-all"><h2>${icon('spark')} Última retrospectiva da IA</h2><p class="muted small">Salva em ${fmtStamp(S.retro.at)}</p><div class="retro-text">${esc(S.retro.text)}</div></section>` : '';
    const table = `<details class="data-table"><summary>Ver os dados dos últimos 7 dias em tabela</summary><div class="table-scroll"><table><thead><tr><th scope="col">Dia</th><th scope="col">Pomodoros</th><th scope="col">Foco (h)</th><th scope="col">Concluídas</th><th scope="col">Hábitos</th><th scope="col">Humor</th><th scope="col">Distrações</th></tr></thead><tbody>${st.perDay.map((d) => `<tr><th scope="row">${dayLabel(d.k)} ${ddmm(d.k)}</th><td>${d.pomos}</td><td>${fmtNum(d.mins / 60)}</td><td>${d.done}</td><td>${d.habits}/${S.habits.length}</td><td>${d.mood || '–'}</td><td>${d.distr}</td></tr>`).join('')}</tbody></table></div></details>`;
    return `${viewHead('Painel', 'Últimos 7 dias: foco, entregas, prioridades, hábitos e bem-estar.', `<button type="button" class="btn" data-act="goto-ai" data-tool="retro">${icon('spark')} Retrospectiva com IA</button>`)}
      ${kpis}
      <div class="dash">
        <section class="panel"><h2>Pomodoros por dia</h2><p class="muted small">${st.pomos} no total · cada um vale ${S.settings.focus} min de foco</p>${focusChart}</section>
        <section class="panel"><h2>Tarefas concluídas por dia</h2><p class="muted small">${st.doneCur} no total</p>${doneChart}</section>
        <section class="panel"><h2>Tarefas abertas por quadrante</h2><p class="muted small">Matriz de Eisenhower · ${st.open.length} abertas</p><div class="hbars">${qbars}</div></section>
        <section class="panel span-2"><h2>Hábitos</h2><p class="muted small">Clique para marcar o dia. Pequenas vitórias diárias.</p>${habitTable}</section>
        <section class="panel"><h2>Como você está hoje?</h2><p class="muted small">Registro de humor para cuidar da saúde mental.</p>${mood}</section>
        <section class="panel span-2"><h2>Insights</h2>${ins.length ? `<ul class="insights">${ins.map((s) => `<li>${esc(s)}</li>`).join('')}</ul>` : '<p class="muted">Use o sistema por alguns dias para ver os insights.</p>'}</section>
        ${aiPanel}
        ${retro}
      </div>
      ${table}`;
  }

  /* ---------- Assistente IA (ChatGPT, Claude ou Gemini, sem chave de API) ---------- */
  const AI_TOOLS = [
    { id: 'dump', name: 'Despejo mental', sub: 'Texto solto vira tarefas classificadas', imports: true },
    { id: 'triage', name: 'Organizar a Entrada', sub: 'Classifica pela Matriz de Eisenhower', imports: true },
    { id: 'plan', name: 'Planejar a semana', sub: 'Blocos de foco na agenda (time blocking)', imports: true },
    { id: 'split', name: 'Quebrar tarefa grande', sub: 'Passos pequenos contra a procrastinação', imports: true },
    { id: 'summary', name: 'Resumir aula ou reunião', sub: 'Resumo e próximos passos', imports: true },
    { id: 'msg', name: 'Mensagem profissional', sub: 'E-mail ou chat claro e objetivo', imports: false },
    { id: 'retro', name: 'Retrospectiva semanal', sub: 'Análise dos seus números', imports: true },
  ];
  const AI_DESC = {
    dump: 'Escreva tudo o que está ocupando a sua cabeça, do jeito que vier. A IA transforma o texto em tarefas acionáveis, já classificadas na Matriz de Eisenhower, com prazo e estimativa em pomodoros.',
    triage: 'Envia os itens da sua Entrada para a IA classificar em Q1 a Q4 e sugerir a lista (Hoje ou Esta semana), o prazo e quantos pomodoros cada um leva.',
    plan: 'A IA monta blocos de foco nos horários livres da semana, respeitando compromissos, prazos e prioridades. Os blocos entram na aba Semana.',
    split: 'Tarefa grande dá preguiça, e preguiça vira procrastinação. A IA divide a tarefa em passos de até 25 minutos, que entram como checklist.',
    summary: 'Cole as anotações ou a transcrição de uma aula ou reunião. A IA devolve um resumo curto e transforma os próximos passos em tarefas.',
    msg: 'Comunicação clara evita retrabalho. Diga o que você precisa comunicar e a IA escreve uma mensagem objetiva, no tom certo para quem vai ler.',
    retro: 'A IA analisa os números do Painel (foco, entregas, hábitos, humor) e sugere ajustes para a próxima semana. A resposta fica salva no Painel.',
  };
  const toolName = (id) => (AI_TOOLS.find((t) => t.id === id) || { name: id }).name;
  const ctxLine = () => { const d = new Date(); return `Hoje é ${DOW_LONG[d.getDay()]}, ${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}.`; };
  const EISEN = lines(
    'Classificação pela Matriz de Eisenhower:',
    '- Q1 = urgente e importante (fazer agora)',
    '- Q2 = importante, mas não urgente (agendar)',
    '- Q3 = urgente, mas não importante (delegar ou resolver rápido)',
    '- Q4 = nem urgente nem importante (eliminar)',
  );
  const TASK_FIELDS = lines(
    'Para cada tarefa, defina:',
    '- Lista: Hoje, Esta semana ou Entrada',
    '- Prazo: data no formato AAAA-MM-DD, ou "-" se não houver',
    '- Pomodoros: estimativa em blocos de 25 minutos (de 1 a 8)',
    '- Área: Faculdade, Trabalho, Pessoal ou Saúde',
  );
  const ONLY = 'Responda APENAS com as linhas no formato abaixo, uma por linha, sem markdown, sem numeração e sem texto antes ou depois:';
  const taskExample = () => `TAREFA | Q2 | Esta semana | ${iso(addDays(new Date(), 3))} | 2 | Faculdade | Estudar JOINs de SQL`;
  const blockExample = () => `BLOCO | ${iso(addDays(new Date(), 1))} | 19:00 | 20:30 | Estudar para a prova de Banco de Dados`;
  const AI_FORMAT = () => ({
    dump: taskExample(), triage: taskExample(), plan: blockExample(),
    split: 'SUB | Revisar os slides da aula 3', summary: `RESUMO | Ponto principal discutido\n${taskExample()}`,
    retro: 'Cole aqui a análise da IA',
  });

  function selectTool(id) {
    const a = ui.ai;
    a.tool = AI_TOOLS.some((t) => t.id === id) ? id : 'dump';
    a.prompt = ''; a.result = null; a.response = ''; a.input = '';
    if (a.tool === 'split' && !task(a.taskId)) {
      const pick = openTasks().find((t) => t.list === 'doing') || openTasks().find((t) => t.list === 'today') || openTasks()[0];
      a.taskId = pick ? pick.id : '';
    }
  }
  function aiInputs(tool) {
    const a = ui.ai;
    if (tool.id === 'dump') return `<label class="field" for="ai-input"><span>O que está na sua cabeça?</span><textarea id="ai-input" rows="6" placeholder="Ex.: preciso estudar pra prova de BD na sexta, ligar pro dentista, terminar o trabalho até dia 30, comprar o presente da minha mãe, responder o grupo do estágio...">${esc(a.input)}</textarea></label>`;
    if (tool.id === 'summary') return `<label class="field" for="ai-input"><span>Anotações ou transcrição</span><textarea id="ai-input" rows="7" placeholder="Cole aqui as anotações da aula ou da reunião...">${esc(a.input)}</textarea></label>`;
    if (tool.id === 'plan') return `<label class="field" for="ai-input"><span>Preferências (opcional)</span><input id="ai-input" value="${esc(a.input)}" placeholder="Ex.: rendo melhor à noite; sábado de manhã livre" autocomplete="off"></label>`;
    if (tool.id === 'split') {
      const open = openTasks();
      return `<label class="field" for="ai-task"><span>Tarefa</span><select id="ai-task">${open.map((t) => `<option value="${t.id}"${t.id === a.taskId ? ' selected' : ''}>${esc(t.title)}</option>`).join('')}</select></label>`;
    }
    if (tool.id === 'triage') {
      const inbox = S.tasks.filter((t) => t.list === 'inbox' && !t.archived);
      return `<p class="field-note">${inbox.length ? `${inbox.length} item(ns) da Entrada vão no prompt: ${inbox.slice(0, 4).map((t) => esc(t.title)).join('; ')}${inbox.length > 4 ? '…' : '.'}` : 'A Entrada está vazia. Capture algumas tarefas primeiro.'}</p>`;
    }
    if (tool.id === 'msg') {
      const m = a.msg;
      const sel = (key, label, opts) => `<label class="field" for="msg-${key}"><span>${label}</span><select id="msg-${key}" data-msg="${key}">${opts.map((o) => `<option${o === m[key] ? ' selected' : ''}>${o}</option>`).join('')}</select></label>`;
      return `<div class="grid-3">${sel('canal', 'Canal', ['E-mail', 'WhatsApp', 'Microsoft Teams', 'Slack'])}${sel('para', 'Para', ['Professor(a)', 'Gestor(a)', 'Colega de equipe', 'Cliente', 'Coordenação do curso'])}${sel('tom', 'Tom', ['Cordial', 'Formal', 'Direto'])}</div>
        <label class="field" for="msg-objetivo"><span>O que você precisa comunicar?</span><textarea id="msg-objetivo" data-msg="objetivo" rows="4" placeholder="Ex.: pedir mais 2 dias de prazo para o trabalho porque fiquei doente; tenho atestado">${esc(m.objetivo)}</textarea></label>`;
    }
    if (tool.id === 'retro') return '<p class="field-note">Vão no prompt só os números do Painel dos últimos 7 dias: tarefas, pomodoros, hábitos, humor e distrações.</p>';
    return '';
  }
  function renderAI() {
    const a = ui.ai;
    const tool = AI_TOOLS.find((t) => t.id === a.tool) || AI_TOOLS[0];
    const fmt = AI_FORMAT()[tool.id] || '';
    const promptBox = a.prompt ? `<div class="prompt-box"><label for="ai-prompt">Prompt gerado</label><textarea id="ai-prompt" rows="9" readonly>${esc(a.prompt)}</textarea>
      <div class="row wrap"><button type="button" class="btn primary" data-act="ai-copy">${icon('copy')} Copiar prompt</button><a class="btn ghost" href="https://chatgpt.com/" target="_blank" rel="noopener">ChatGPT ${icon('external')}</a><a class="btn ghost" href="https://claude.ai/new" target="_blank" rel="noopener">Claude ${icon('external')}</a><a class="btn ghost" href="https://gemini.google.com/app" target="_blank" rel="noopener">Gemini ${icon('external')}</a></div></div>` : '';
    const responseBox = tool.imports
      ? `<div class="response-box"><label for="ai-response">${tool.id === 'retro' ? 'Resposta da IA (fica salva no Painel)' : 'Resposta da IA'}</label><textarea id="ai-response" rows="7" placeholder="${esc(fmt)}">${esc(a.response)}</textarea><button type="button" class="btn primary" data-act="ai-import">${icon('download')} ${tool.id === 'retro' ? 'Salvar no Painel' : 'Importar para o FocoOS'}</button></div>`
      : '<p class="note">Copie a mensagem que a IA escrever, revise e envie pelo canal escolhido. Revisar antes de enviar também é boa comunicação.</p>';
    const res = a.result ? `<div class="ai-result ${a.result.ok ? 'ok' : 'err'}" role="status">${a.result.html}</div>` : '';
    const log = S.aiLog.length ? `<section class="panel ai-log"><h2>Histórico de uso da IA</h2><ul>${S.aiLog.slice(0, 8).map((l) => `<li><span class="mono">${fmtStamp(l.at)}</span><strong>${esc(toolName(l.tool))}</strong> · ${esc(logSummary(l))}</li>`).join('')}</ul></section>` : '';
    return `${viewHead('Assistente IA', 'Funciona com o ChatGPT, o Claude ou o Gemini, inclusive nos planos gratuitos. O FocoOS monta o prompt com os seus dados, você cola na IA e importa a resposta de volta.')}
      <ol class="ai-steps"><li><span><strong>Escolha</strong> uma ferramenta e gere o prompt</span></li><li><span><strong>Copie</strong> e cole na IA de sua preferência</span></li><li><span><strong>Cole</strong> a resposta aqui e importe</span></li></ol>
      <div class="ai-grid">
        <nav class="ai-tools" aria-label="Ferramentas de IA">${AI_TOOLS.map((t) => `<button type="button" data-act="ai-tool" data-tool="${t.id}" aria-pressed="${t.id === tool.id}"><strong>${t.name}</strong><span>${t.sub}</span></button>`).join('')}</nav>
        <section class="ai-work panel" aria-label="${tool.name}">
          <div><h2>${tool.name}</h2><p class="muted">${AI_DESC[tool.id]}</p></div>
          ${aiInputs(tool)}
          <button type="button" class="btn${a.prompt ? '' : ' primary'}" data-act="ai-generate">${icon('spark')} ${a.prompt ? 'Gerar de novo' : 'Gerar prompt'}</button>
          ${promptBox}
          ${responseBox}
          ${res}
        </section>
      </div>
      ${log}`;
  }
  function buildPrompt() {
    const a = ui.ai;
    const goals = weekGoals();
    if (a.tool === 'dump') {
      if (!a.input.trim()) return { error: 'Escreva o que está na sua cabeça antes de gerar o prompt.' };
      return { text: lines('Você é meu assistente de produtividade. Transforme o texto abaixo em tarefas claras e acionáveis, cada uma começando com um verbo no infinitivo.', ctxLine(), '', EISEN, '', TASK_FIELDS, '', ONLY, taskExample(), '', 'Texto:', '"""', a.input.trim(), '"""') };
    }
    if (a.tool === 'triage') {
      const inbox = S.tasks.filter((t) => t.list === 'inbox' && !t.archived);
      if (!inbox.length) return { error: 'A Entrada está vazia. Capture algumas tarefas primeiro.' };
      return { text: lines('Você é meu assistente de produtividade. Organize os itens da minha caixa de entrada (método GTD) usando a Matriz de Eisenhower.', ctxLine(), goals.length ? `Minhas prioridades desta semana: ${goals.join('; ')}.` : '', '', EISEN, '', TASK_FIELDS, 'Mantenha o título de cada item exatamente como está escrito abaixo (isso é necessário para a importação).', '', ONLY, taskExample(), '', 'Itens da Entrada:', ...inbox.map((t) => `- ${t.title}`)) };
    }
    if (a.tool === 'plan') {
      const ws = startOfWeek(new Date());
      const days = Array.from({ length: 7 }, (_, i) => iso(addDays(ws, i))).filter((k) => k >= todayISO());
      const evs = days.flatMap((k) => eventsOn(k).map((e) => `- ${DOW[parseISO(k).getDay()]} ${k} ${e.start}–${e.end} ${e.title}`));
      const open = openTasks().filter((t) => t.q !== 4).sort((x, y) => (x.q || 5) - (y.q || 5));
      if (!open.length) return { error: 'Não há tarefas abertas para planejar.' };
      return { text: lines('Você é meu assistente de planejamento. Monte o restante da minha semana usando time blocking (blocos de tempo na agenda).', ctxLine(), `Planeje de ${ddmm(days[0])} a ${ddmm(days[days.length - 1])}.`, goals.length ? `Prioridades da semana: ${goals.join('; ')}.` : '', '', 'Compromissos já marcados (não sobreponha):', ...(evs.length ? evs : ['- nenhum']), '', 'Tarefas abertas (prioridade · prazo · pomodoros estimados · título):', ...open.map((t) => `- ${t.q ? 'Q' + t.q : 'sem prioridade'} · ${t.due || 'sem prazo'} · ${t.est || '?'} · ${t.title}`), '', `Preferências: ${a.input.trim() || 'nenhuma'}`, '', 'Regras:', '- Crie blocos de 25 a 120 minutos, começando pelas tarefas Q1 e depois Q2, respeitando os prazos.', '- Não agende nada entre 23h e 7h. Inclua pausas e pelo menos um período livre de descanso.', '- Use o título da tarefa como título do bloco.', '', ONLY, blockExample()) };
    }
    if (a.tool === 'split') {
      const t = task(a.taskId);
      if (!t) return { error: 'Escolha uma tarefa.' };
      return { text: lines('Divida a tarefa abaixo em 3 a 8 passos pequenos e concretos, na ordem certa, cada um possível de fazer em até 25 minutos.', `Tarefa: ${t.title}`, t.desc ? `Detalhes: ${t.desc}` : '', t.due ? `Prazo: ${ddmm(t.due)}` : '', '', ONLY, 'SUB | Revisar os slides da aula 3') };
    }
    if (a.tool === 'summary') {
      if (!a.input.trim()) return { error: 'Cole as anotações antes de gerar o prompt.' };
      return { text: lines('Resuma as anotações abaixo (de uma aula ou reunião) e extraia os próximos passos.', ctxLine(), '', '1. Escreva de 3 a 6 linhas de resumo, cada uma começando com "RESUMO | ".', '2. Depois, liste as tarefas e próximos passos no formato TAREFA.', '', EISEN, '', TASK_FIELDS, '', ONLY, 'RESUMO | Ponto principal discutido', taskExample(), '', 'Anotações:', '"""', a.input.trim(), '"""') };
    }
    if (a.tool === 'msg') {
      const m = a.msg;
      if (!m.objetivo.trim()) return { error: 'Descreva o que você precisa comunicar.' };
      return { text: lines(`Escreva uma mensagem de ${m.canal} para ${m.para.toLowerCase()}.`, `Objetivo: ${m.objetivo.trim()}`, `Tom: ${m.tom.toLowerCase()}.`, '', 'Regras de boa comunicação:', '- Comece pelo ponto principal; seja claro e objetivo.', '- No máximo 120 palavras.', m.canal === 'E-mail' ? '- Inclua uma linha de assunto.' : '- Adequado para chat: parágrafos curtos, sem formalidade excessiva.', '- Termine com um próximo passo ou uma pergunta clara.', '- Português do Brasil, sem erros.') };
    }
    if (a.tool === 'retro') {
      const st = stats();
      return { text: lines('Você é meu coach de produtividade e bem-estar. Analise minha semana e responda em português, em até 200 palavras, com:', '1. O que funcionou bem', '2. O que atrapalhou', '3. Três ajustes concretos para a próxima semana', '4. Um cuidado com a minha saúde mental', '', 'Meus dados dos últimos 7 dias:', `- Tarefas concluídas: ${st.doneCur} (7 dias anteriores: ${st.donePrev})`, `- Pomodoros: ${st.pomos} (${fmtNum(st.focusMin / 60)} h de foco). Por dia: ${st.perDay.map((d) => `${DOW[parseISO(d.k).getDay()]} ${d.pomos}`).join(', ')}`, `- Distrações registradas: ${st.distr}`, `- Hábitos: ${st.habitRows.map((h) => `${h.name} ${h.n}/7`).join('; ')}`, `- Humor médio: ${st.moodAvg ? fmtNum(st.moodAvg) + ' de 5' : 'sem registro'}`, `- Tarefas abertas por quadrante: Q1 ${st.byQ[1]}, Q2 ${st.byQ[2]}, Q3 ${st.byQ[3]}, Q4 ${st.byQ[4]}, sem classificação ${st.byQ[0]}`, `- Tarefas atrasadas: ${st.overdue.length}`, goals.length ? `- Prioridades da semana: ${goals.join('; ')}` : '') };
    }
    return { error: 'Ferramenta desconhecida.' };
  }

  /* Leitura tolerante da resposta: aceita markdown, numeração, tabelas e campos fora de ordem. */
  function parseDate(s) {
    let m = String(s).match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (m) return `${m[1]}-${pad(+m[2])}-${pad(+m[3])}`;
    m = String(s).trim().match(/^(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?$/);
    if (m) { let y = m[3] ? +m[3] : new Date().getFullYear(); if (y < 100) y += 2000; return `${y}-${pad(+m[2])}-${pad(+m[1])}`; }
    return '';
  }
  function parseListName(s) { const n = norm(s); if (n.includes('hoje')) return 'today'; if (n.includes('semana')) return 'week'; if (n.includes('fazendo') || n.includes('andamento')) return 'doing'; if (n.includes('entrada') || n.includes('inbox')) return 'inbox'; return ''; }
  function parseAreaName(s) { const n = norm(s); if (n.startsWith('facul') || n.startsWith('estud')) return 'faculdade'; if (n.startsWith('trab')) return 'trabalho'; if (n.startsWith('pesso')) return 'pessoal'; if (n.startsWith('saud')) return 'saude'; return ''; }
  function parseTaskParts(parts) {
    const t = { q: 0, list: '', due: '', est: 0, area: '', title: '' };
    const rest = [];
    parts.forEach((p) => {
      const n = norm(p);
      let m;
      if (!n || n === '-' || n === '—') return;
      if (!t.q && (m = n.match(/^q\s*([1-4])\b/))) t.q = +m[1];
      else if (!t.due && parseDate(p)) t.due = parseDate(p);
      else if (!t.list && n.length <= 14 && parseListName(p)) t.list = parseListName(p);
      else if (!t.area && n.length <= 12 && parseAreaName(p)) t.area = parseAreaName(p);
      else if (!t.est && /^\d{1,2}(\s*pomodoros?)?$/.test(n)) t.est = clamp(parseInt(n, 10), 0, 12);
      else rest.push(p);
    });
    t.title = rest.sort((x, y) => y.length - x.length)[0] || '';
    return t.title ? t : null;
  }
  function parseBlockParts(parts) {
    const b = { date: '', start: '', end: '', title: '' };
    const rest = [];
    const hm = (h, m) => `${pad(+h)}:${m}`;
    parts.forEach((p) => {
      const s = p.trim();
      const range = s.match(/^(\d{1,2})[:h](\d{2})\s*(?:-|–|a|às|as)\s*(\d{1,2})[:h](\d{2})$/i);
      const tm = s.match(/^(\d{1,2})[:h](\d{2})$/i);
      if (!s) return;
      if (!b.date && parseDate(s)) b.date = parseDate(s);
      else if (range && !b.start) { b.start = hm(range[1], range[2]); b.end = hm(range[3], range[4]); }
      else if (tm && !b.start) b.start = hm(tm[1], tm[2]);
      else if (tm && !b.end) b.end = hm(tm[1], tm[2]);
      else rest.push(s);
    });
    b.title = rest.sort((x, y) => y.length - x.length)[0] || '';
    if (!b.date || !b.start || !b.title) return null;
    if (!b.end || minutes(b.end) <= minutes(b.start)) { const e = Math.min(minutes(b.start) + 50, 23 * 60 + 59); b.end = `${pad(Math.floor(e / 60))}:${pad(e % 60)}`; }
    return b;
  }
  function parseAI(text) {
    const out = { tasks: [], blocks: [], subs: [], summary: [] };
    String(text || '').split(/\r?\n/).forEach((raw) => {
      let line = raw.replace(/\*\*|__|`/g, '').trim();
      line = line.replace(/^(?:[-*•>]+\s*|\d+[.)]\s+)+/, '').trim();
      line = line.replace(/^\|/, '').replace(/\|$/, '').trim();
      if (!line.includes('|')) return;
      const parts = line.split('|').map((p) => p.trim());
      const tag = norm(parts.shift());
      if (tag === 'tarefa' || tag === 'task') { const t = parseTaskParts(parts); if (t) out.tasks.push(t); }
      else if (tag === 'bloco' || tag === 'block') { const b = parseBlockParts(parts); if (b) out.blocks.push(b); }
      else if (tag === 'sub' || tag === 'subtarefa' || tag === 'passo') { const s = parts.join(' | ').trim(); if (s) out.subs.push(s); }
      else if (tag === 'resumo') { const s = parts.join(' | ').trim(); if (s) out.summary.push(s); }
    });
    return out;
  }
  function logSummary(l) {
    if (l.tool === 'retro') return 'retrospectiva salva no Painel';
    const b = [];
    if (l.created) b.push(`${l.created} tarefa(s) criada(s)`);
    if (l.updated) b.push(`${l.updated} organizada(s)`);
    if (l.blocks) b.push(`${l.blocks} bloco(s) de foco`);
    if (l.subs) b.push(`${l.subs} passo(s) no checklist`);
    if (l.summary && l.summary.length) b.push(`resumo com ${l.summary.length} tópico(s)`);
    return b.join(', ') || 'sem itens';
  }
  function aiImport() {
    const a = ui.ai;
    const text = a.response.trim();
    if (!text) { a.result = { ok: false, html: 'Cole a resposta da IA no campo acima.' }; render(); return; }
    const stamp = new Date().toISOString();
    if (a.tool === 'retro') {
      S.retro = { at: stamp, text };
      S.aiLog.unshift({ at: stamp, tool: 'retro' });
      save();
      a.response = '';
      a.result = { ok: true, html: 'Retrospectiva salva. <a href="#painel" data-act="goto" data-view="painel">Ver no Painel</a>' };
      render();
      return;
    }
    const p = parseAI(text);
    let created = 0, updated = 0, blocks = 0, subs = 0;
    p.tasks.forEach((x) => {
      const ex = S.tasks.find((t) => !t.archived && t.list !== 'done' && norm(t.title) === norm(x.title));
      if (ex) {
        if (x.q) ex.q = x.q;
        if (x.list && x.list !== ex.list) setList(ex, x.list);
        if (x.due) ex.due = x.due;
        if (x.est) ex.est = x.est;
        if (x.area) ex.area = x.area;
        ex.source = 'ia';
        updated++;
      } else {
        S.tasks.push(newTask({ title: x.title, q: x.q, list: x.list || 'inbox', due: x.due, est: x.est, area: x.area, source: 'ia' }));
        created++;
      }
    });
    p.blocks.forEach((b) => { S.events.push({ id: uid(), title: b.title, type: 'foco', date: b.date, start: b.start, end: b.end, days: [], source: 'ia' }); blocks++; });
    if (p.subs.length) {
      const t = task(a.taskId);
      if (t) { p.subs.forEach((s) => t.checklist.push({ id: uid(), text: s, done: false })); subs = p.subs.length; }
    }
    if (!created && !updated && !blocks && !subs && !p.summary.length) {
      a.result = { ok: false, html: 'Não encontrei linhas no formato esperado. A resposta precisa ter linhas começando com <code>TAREFA |</code>, <code>BLOCO |</code> ou <code>SUB |</code>. Se a IA respondeu de outro jeito, peça a ela: "responda só no formato pedido".' };
      render();
      return;
    }
    S.aiLog.unshift({ at: stamp, tool: a.tool, created, updated, blocks, subs, summary: p.summary });
    S.aiLog = S.aiLog.slice(0, 50);
    save();
    const bits = [];
    if (created) bits.push(`${created} tarefa(s) criada(s)`);
    if (updated) bits.push(`${updated} tarefa(s) organizada(s)`);
    if (blocks) bits.push(`${blocks} bloco(s) de foco na agenda`);
    if (subs) bits.push(`${subs} passo(s) no checklist`);
    const links = [
      created || updated ? '<a href="#quadro" data-act="goto" data-view="quadro">Ver no Quadro</a>' : '',
      updated ? '<a href="#matriz" data-act="goto" data-view="matriz">Ver na Matriz</a>' : '',
      blocks ? '<a href="#semana" data-act="goto" data-view="semana">Ver na Semana</a>' : '',
    ].join('');
    const sum = p.summary.length ? `<h3>Resumo</h3><ul>${p.summary.map((s) => `<li>${esc(s)}</li>`).join('')}</ul>` : '';
    a.response = '';
    a.result = { ok: true, html: `<p><strong>Importado:</strong> ${bits.join(', ') || 'resumo gerado'}.</p>${sum}${links ? `<p class="links">${links}</p>` : ''}` };
    render();
    toast('Resposta da IA importada.', 'good');
  }

  /* ---------- Janelas (tarefa, compromisso, exportação, configurações) ---------- */
  const dlg = () => $('#modal');
  function showModal(html, type, extra = {}, narrow = false) {
    const d = dlg();
    ui.modal = { type, ...extra };
    d.className = `modal${narrow ? ' narrow' : ''}`;
    d.innerHTML = html;
    if (!d.open) d.showModal();
  }
  function closeModal() { const d = dlg(); if (d.open) d.close(); }
  function taskModalHTML(t) {
    const done = t.checklist.filter((c) => c.done).length;
    const total = t.checklist.length;
    return `<form class="modal-card" id="task-form">
      <header class="m-head"><label class="sr-only" for="m-title">Título</label><textarea id="m-title" class="m-title" rows="2" data-field="title">${esc(t.title)}</textarea><button type="button" class="icon-btn" data-act="modal-close" aria-label="Fechar">${icon('x')}</button></header>
      <p class="m-sub">Na lista <strong>${LIST_NAME[t.list]}</strong>${t.source === 'ia' ? ' · criada ou organizada pela IA' : ''}${t.doneAt ? ` · concluída em ${fmtStamp(t.doneAt)}` : ''}</p>
      <div class="m-grid">
        <div class="m-main">
          <label class="field" for="m-desc"><span>Descrição</span><textarea id="m-desc" rows="4" data-field="desc" placeholder="Detalhes, links, próximos passos...">${esc(t.desc)}</textarea></label>
          <section class="checklist" aria-label="Checklist">
            <header><h3>Checklist</h3><span class="mono small">${done}/${total}</span></header>
            ${total ? `<div class="meter" aria-hidden="true"><i style="width:${(done / total) * 100}%"></i></div>` : ''}
            <ul>${t.checklist.map((c) => `<li><input type="checkbox" id="cl-${c.id}" data-cl="${c.id}"${c.done ? ' checked' : ''}><label for="cl-${c.id}">${esc(c.text)}</label><button type="button" class="icon-btn xs" data-act="cl-del" data-cl="${c.id}" aria-label="Remover item">${icon('x')}</button></li>`).join('')}</ul>
            <div class="inline-form"><label class="sr-only" for="cl-new">Novo item do checklist</label><input id="cl-new" placeholder="Adicionar item..." autocomplete="off"><button type="button" class="btn sm" data-act="cl-add">Adicionar</button></div>
          </section>
        </div>
        <aside class="m-side">
          <label class="field" for="m-list"><span>Lista</span><select id="m-list" data-field="list">${LISTS.map((l) => `<option value="${l.id}"${l.id === t.list ? ' selected' : ''}>${l.name}</option>`).join('')}</select></label>
          <fieldset class="field qpick"><legend>Prioridade</legend>${[1, 2, 3, 4, 0].map((q) => `<label class="qopt q${q}" for="m-q${q}"><input type="radio" id="m-q${q}" name="m-q" value="${q}" data-field="q"${(t.q || 0) === q ? ' checked' : ''}><span>${q ? `Q${q} · ${QUADS[q].name}` : 'Sem prioridade'}</span></label>`).join('')}</fieldset>
          <label class="field" for="m-due"><span>Prazo</span><input type="date" id="m-due" data-field="due" value="${t.due || ''}"></label>
          <label class="field" for="m-area"><span>Área</span><select id="m-area" data-field="area"><option value="">Nenhuma</option>${Object.entries(AREAS).map(([k, v]) => `<option value="${k}"${k === t.area ? ' selected' : ''}>${v}</option>`).join('')}</select></label>
          <label class="field" for="m-est"><span>Pomodoros estimados</span><input type="number" id="m-est" data-field="est" min="0" max="20" value="${t.est || 0}"></label>
          <p class="muted small">${t.pomos || 0} pomodoro(s) feito(s) nesta tarefa.</p>
          <div class="m-actions">
            <button type="button" class="btn tomato" data-act="focus-task">${icon('timer')} Focar nesta tarefa</button>
            <button type="button" class="btn" data-act="split-task">${icon('spark')} Quebrar em passos com IA</button>
            <button type="button" class="btn ghost danger" data-act="delete-task" data-confirm="Confirmar exclusão">${icon('trash')} Excluir tarefa</button>
          </div>
        </aside>
      </div>
    </form>`;
  }
  function openTask(id) { const t = task(id); if (t) showModal(taskModalHTML(t), 'task', { id }); }
  function refreshTaskModal(focusId) {
    const t = ui.modal && task(ui.modal.id);
    if (!t) return;
    dlg().innerHTML = taskModalHTML(t);
    if (focusId) { const el = document.getElementById(focusId); if (el) el.focus(); }
  }
  function openEvent(id, date) {
    const e = id ? S.events.find((x) => x.id === id) : null;
    const ev = e || { title: '', type: 'foco', date: date || todayISO(), start: '19:00', end: '20:00', days: [] };
    showModal(`<form class="modal-card" id="event-form" novalidate>
      <header class="m-head"><h2>${e ? 'Editar compromisso' : 'Novo compromisso'}</h2><button type="button" class="icon-btn" data-act="modal-close" aria-label="Fechar">${icon('x')}</button></header>
      <label class="field" for="e-title"><span>Título</span><input id="e-title" value="${esc(ev.title)}" placeholder="Ex.: Aula ao vivo, reunião, academia" autocomplete="off"></label>
      <div class="grid-2"><label class="field" for="e-type"><span>Tipo</span><select id="e-type">${Object.entries(EVENT_TYPES).map(([k, v]) => `<option value="${k}"${k === ev.type ? ' selected' : ''}>${v}</option>`).join('')}</select></label><label class="field" for="e-date"><span>Data (ou início da repetição)</span><input type="date" id="e-date" value="${ev.date}"></label></div>
      <div class="grid-2"><label class="field" for="e-start"><span>Início</span><input type="time" id="e-start" value="${ev.start}"></label><label class="field" for="e-end"><span>Fim</span><input type="time" id="e-end" value="${ev.end}"></label></div>
      <fieldset class="field"><legend>Repetir toda semana</legend><div class="day-picks">${[1, 2, 3, 4, 5, 6, 0].map((d) => `<label class="day-pick" for="e-d${d}"><input type="checkbox" id="e-d${d}" value="${d}" data-eday${ev.days.includes(d) ? ' checked' : ''}><span>${DOW[d]}</span></label>`).join('')}</div><p class="muted small">Deixe tudo desmarcado para um compromisso único.</p></fieldset>
      <p class="form-error" id="e-error" role="alert" hidden></p>
      <footer class="m-foot">${e ? `<button type="button" class="btn ghost danger" data-act="event-delete" data-confirm="Confirmar exclusão">${icon('trash')} Excluir</button>` : '<span></span>'}<div class="row"><button type="button" class="btn ghost" data-act="modal-close">Cancelar</button><button type="submit" class="btn primary">Salvar</button></div></footer>
    </form>`, 'event', { id: e ? e.id : '' }, true);
    const f = $('#e-title');
    if (f) f.focus();
  }
  function icsEsc(s) { return String(s).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n'); }
  function icsFold(line) { const out = []; let s = line; while (s.length > 72) { out.push(s.slice(0, 72)); s = ' ' + s.slice(72); } out.push(s); return out.join('\r\n'); }
  function buildICS() {
    const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const dt = (date, time) => `${date.replace(/-/g, '')}T${time.replace(':', '')}00`;
    const BYDAY = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
    const L = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//FocoOS//Sistema Operacional Pessoal//PT-BR', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', 'X-WR-CALNAME:FocoOS'];
    S.events.forEach((e) => {
      let date = e.date;
      if (e.days.length) { let d = parseISO(e.date); for (let i = 0; i < 7 && !e.days.includes(d.getDay()); i++) d = addDays(d, 1); date = iso(d); }
      L.push('BEGIN:VEVENT', `UID:${e.id}@focoos`, `DTSTAMP:${stamp}`, `DTSTART:${dt(date, e.start)}`, `DTEND:${dt(date, e.end)}`, `SUMMARY:${icsEsc(e.title)}`, `CATEGORIES:${icsEsc(EVENT_TYPES[e.type] || 'Outro')}`);
      if (e.days.length) L.push(`RRULE:FREQ=WEEKLY;BYDAY=${e.days.map((d) => BYDAY[d]).join(',')}`);
      L.push('END:VEVENT');
    });
    openTasks().filter((t) => t.due).forEach((t) => {
      L.push('BEGIN:VEVENT', `UID:task-${t.id}@focoos`, `DTSTAMP:${stamp}`, `DTSTART;VALUE=DATE:${t.due.replace(/-/g, '')}`, `DTEND;VALUE=DATE:${iso(addDays(parseISO(t.due), 1)).replace(/-/g, '')}`, `SUMMARY:${icsEsc('Prazo: ' + t.title)}`, 'TRANSP:TRANSPARENT', 'END:VEVENT');
    });
    L.push('END:VCALENDAR');
    return L.map(icsFold).join('\r\n');
  }
  function openExport(kind) {
    const isICS = kind === 'ics';
    const text = isICS ? buildICS() : JSON.stringify(S, null, 2);
    ui.exportData = { text, name: isICS ? 'focoos-agenda.ics' : `focoos-backup-${todayISO()}.json`, mime: isICS ? 'text/calendar' : 'application/json' };
    const dues = openTasks().filter((t) => t.due).length;
    const body = isICS
      ? `<ol class="steps"><li>Clique em <strong>Baixar arquivo .ics</strong>.</li><li>No Google Agenda (no computador), abra <strong>Configurações › Importar e exportar</strong>.</li><li>Selecione <code>focoos-agenda.ics</code> e clique em <strong>Importar</strong>.</li></ol><p class="muted small">${S.events.length} compromisso(s), com as repetições semanais, e ${dues} prazo(s) de tarefas como eventos de dia inteiro.</p>`
      : '<p>Guarde este arquivo para ter uma cópia dos seus dados ou levá-los para outro navegador. Para restaurar, use <strong>Importar backup</strong> nas configurações.</p>';
    showModal(`<div class="modal-card">
      <header class="m-head"><h2>${isICS ? 'Exportar para o Google Agenda' : 'Backup dos seus dados'}</h2><button type="button" class="icon-btn" data-act="modal-close" aria-label="Fechar">${icon('x')}</button></header>
      ${body}
      <div class="row wrap"><button type="button" class="btn primary" data-act="download">${icon('download')} ${isICS ? 'Baixar arquivo .ics' : 'Baixar backup .json'}</button><button type="button" class="btn" data-act="copy-export">${icon('copy')} Copiar conteúdo</button></div>
      <label class="sr-only" for="export-text">Conteúdo do arquivo</label><textarea id="export-text" rows="7" readonly>${esc(text)}</textarea>
    </div>`, 'export', {}, true);
  }
  function openSettings() {
    const st = S.settings;
    showModal(`<form class="modal-card" id="settings-form">
      <header class="m-head"><h2>Configurações</h2><button type="button" class="icon-btn" data-act="modal-close" aria-label="Fechar">${icon('x')}</button></header>
      <h3 class="m-section">Pomodoro (minutos)</h3>
      <div class="grid-3"><label class="field" for="s-focus"><span>Foco</span><input type="number" id="s-focus" min="5" max="90" value="${st.focus}" data-setting="focus"></label><label class="field" for="s-short"><span>Pausa curta</span><input type="number" id="s-short" min="1" max="30" value="${st.short}" data-setting="short"></label><label class="field" for="s-long"><span>Pausa longa</span><input type="number" id="s-long" min="5" max="60" value="${st.long}" data-setting="long"></label></div>
      <h3 class="m-section">Quadro</h3>
      <label class="field" for="s-wip"><span>Limite de tarefas em Fazendo (WIP)</span><input type="number" id="s-wip" min="1" max="10" value="${st.wip}" data-setting="wip"></label>
      <h3 class="m-section">Aparência</h3>
      <div class="seg" role="group" aria-label="Tema">${[['auto', 'Automático'], ['light', 'Claro'], ['dark', 'Escuro']].map(([k, v]) => `<button type="button" data-act="theme" data-theme-v="${k}" aria-pressed="${st.theme === k}">${v}</button>`).join('')}</div>
      <h3 class="m-section">Seus dados</h3>
      <p class="muted small">Tudo fica salvo só neste navegador (localStorage). Nada é enviado para servidores.</p>
      <div class="row wrap"><button type="button" class="btn" data-act="export-json">${icon('download')} Exportar backup</button><label class="btn" for="import-file">${icon('upload')} Importar backup</label><input type="file" id="import-file" accept="application/json,.json" class="sr-only"></div>
      <div class="row wrap"><button type="button" class="btn ghost" data-act="reset-sample" data-confirm="Confirmar: restaurar exemplo">Restaurar dados de exemplo</button><button type="button" class="btn ghost danger" data-act="reset-blank" data-confirm="Confirmar: apagar tudo">Apagar tudo e começar do zero</button></div>
      <p class="muted small">Atalhos: <kbd>N</kbd> captura rápida · <kbd>1</kbd> a <kbd>6</kbd> trocam de aba · <kbd>Esc</kbd> fecha janelas.</p>
    </form>`, 'settings', {}, true);
  }

  /* ---------- Avisos, cópia e download ---------- */
  function toast(msg, kind = '') {
    const box = $('#toasts');
    if (!box) return;
    const el = document.createElement('div');
    el.className = `toast ${kind}`;
    el.textContent = msg;
    box.appendChild(el);
    setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 300); }, 3200);
  }
  function copyText(text, fallbackEl) {
    const ok = () => toast('Copiado. Agora é só colar na IA.', 'good');
    const fail = () => { if (fallbackEl) { fallbackEl.focus(); fallbackEl.select(); } toast('Não deu para copiar automaticamente. O texto está selecionado: use Ctrl+C ou ⌘C.', 'warn'); };
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(text).then(ok, fail); return; }
    } catch (e) { /* tenta o método antigo */ }
    try { if (fallbackEl) { fallbackEl.select(); if (document.execCommand('copy')) { ok(); return; } } } catch (e) { /* segue */ }
    fail();
  }
  function download(name, text, mime) {
    try {
      const url = URL.createObjectURL(new Blob([text], { type: mime }));
      const a = document.createElement('a');
      a.href = url;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 1500);
      toast(`Arquivo ${name} gerado.`);
    } catch (e) { toast('O download não funcionou aqui. Use "Copiar conteúdo".', 'warn'); }
  }
  function importBackup(file) {
    if (!file) return;
    const r = new FileReader();
    r.onload = () => {
      try {
        const data = JSON.parse(r.result);
        if (!data || !Array.isArray(data.tasks)) throw new Error('formato');
        S = normalizeState(data);
        S.sample = false;
        save();
        applyTheme();
        closeModal();
        toast('Backup importado.', 'good');
      } catch (e) { toast('Arquivo inválido. Use um backup exportado pelo FocoOS.', 'warn'); }
    };
    r.readAsText(file);
  }

  /* ---------- Tema ---------- */
  let themeTouched = false;
  function applyTheme() {
    const th = S.settings.theme;
    const root = document.documentElement;
    if (th === 'light' || th === 'dark') root.setAttribute('data-theme', th);
    else if (themeTouched) root.removeAttribute('data-theme');
    updateThemeIcon();
  }
  function effectiveDark() {
    const t = document.documentElement.getAttribute('data-theme');
    if (t) return t === 'dark';
    try { return window.matchMedia('(prefers-color-scheme: dark)').matches; } catch (e) { return false; }
  }
  function updateThemeIcon() {
    const b = $('#theme-btn');
    if (!b) return;
    const dark = effectiveDark();
    b.innerHTML = icon(dark ? 'sun' : 'moon');
    b.setAttribute('aria-label', dark ? 'Usar tema claro' : 'Usar tema escuro');
  }
  function setTheme(v) {
    S.settings.theme = v;
    themeTouched = true;
    applyTheme();
    save();
    if (ui.modal && ui.modal.type === 'settings') openSettings();
  }

  /* ---------- Navegação e renderização ---------- */
  const VIEWS = [
    { id: 'quadro', label: 'Quadro', icon: 'board', render: renderBoard },
    { id: 'matriz', label: 'Matriz', icon: 'matrix', render: renderMatrix },
    { id: 'semana', label: 'Semana', icon: 'calendar', render: renderWeek },
    { id: 'foco', label: 'Foco', icon: 'timer', render: renderFocus },
    { id: 'painel', label: 'Painel', icon: 'chart', render: renderDash },
    { id: 'ia', label: 'Assistente IA', icon: 'spark', render: renderAI },
  ];
  function render() {
    const main = $('#view');
    const keep = {};
    $$('[data-keep-scroll]', main).forEach((el) => { keep[el.dataset.keepScroll] = [el.scrollLeft, el.scrollTop]; });
    const v = VIEWS.find((x) => x.id === ui.view) || VIEWS[0];
    main.innerHTML = v.render();
    main.dataset.view = v.id;
    $$('[data-keep-scroll]', main).forEach((el) => { const k = keep[el.dataset.keepScroll]; if (k) { el.scrollLeft = k[0]; el.scrollTop = k[1]; } });
    $$('#tabs a').forEach((a) => { if (a.dataset.view === v.id) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
    $('#banner').hidden = !S.sample;
    updateTimerUI();
  }
  function setView(id) {
    ui.view = VIEWS.some((v) => v.id === id) ? id : 'quadro';
    ui.adding = null;
    try { history.replaceState(null, '', `#${ui.view}`); } catch (e) { /* ignorado */ }
    render();
    try { window.scrollTo(0, 0); } catch (e) { /* ignorado */ }
  }

  /* ---------- Confirmação em dois cliques (sem confirm()) ---------- */
  function armed(btn) {
    if (!btn.dataset.confirm || btn.dataset.armed === '1') return true;
    btn.dataset.armed = '1';
    btn.dataset.orig = btn.innerHTML;
    btn.classList.add('armed');
    btn.textContent = btn.dataset.confirm;
    setTimeout(() => { if (btn.isConnected && btn.dataset.armed === '1') { btn.innerHTML = btn.dataset.orig; btn.dataset.armed = ''; btn.classList.remove('armed'); } }, 4000);
    return false;
  }

  /* ---------- Ações ---------- */
  const actions = {
    goto: (el) => setView(el.dataset.view),
    'toggle-done': (el) => toggleDone(task(el.closest('.card').dataset.id)),
    'add-open': (el) => { ui.adding = el.dataset.list; render(); const f = document.getElementById(`add-${ui.adding}`); if (f) f.focus(); },
    'add-cancel': () => { ui.adding = null; render(); },
    'archive-done': () => {
      let n = 0;
      S.tasks.forEach((t) => { if (t.list === 'done' && !t.archived) { t.archived = true; n++; } });
      save(); render();
      toast(`${n} tarefa(s) arquivada(s). Elas continuam contando no Painel.`);
    },
    'goto-ai': (el) => { selectTool(el.dataset.tool); setView('ia'); },
    'week-prev': () => { ui.weekOffset--; render(); },
    'week-next': () => { ui.weekOffset++; render(); },
    'week-today': () => { ui.weekOffset = 0; render(); },
    'new-event': (el) => openEvent('', el.dataset.date),
    'edit-event': (el) => openEvent(el.dataset.eid),
    'event-delete': () => { S.events = S.events.filter((x) => x.id !== ui.modal.id); save(); closeModal(); toast('Compromisso excluído.'); },
    'export-ics': () => openExport('ics'),
    'export-json': () => openExport('json'),
    download: () => { if (ui.exportData) download(ui.exportData.name, ui.exportData.text, ui.exportData.mime); },
    'copy-export': () => { const ta = $('#export-text'); if (ta) copyText(ta.value, ta); },
    'timer-toggle': () => (S.timer.running ? timerPause() : timerStart()),
    'timer-reset': timerReset,
    'timer-skip': timerSkip,
    'timer-mode': (el) => timerSetMode(el.dataset.mode),
    habit: (el) => {
      const k = el.dataset.day, h = el.dataset.hid;
      const arr = S.habitLog[k] || (S.habitLog[k] = []);
      const i = arr.indexOf(h);
      if (i >= 0) arr.splice(i, 1); else arr.push(h);
      save(); render();
    },
    'habit-del': (el) => { S.habits = S.habits.filter((h) => h.id !== el.dataset.hid); save(); render(); },
    mood: (el) => {
      const v = +el.dataset.v, k = todayISO();
      if (S.mood[k] === v) delete S.mood[k]; else S.mood[k] = v;
      save(); render();
      if (S.mood[k] && S.mood[k] <= 2) toast('Dia pesado? Reserve uma pausa de verdade hoje. Descanso também conta.');
    },
    'ai-tool': (el) => { selectTool(el.dataset.tool); render(); },
    'ai-generate': () => {
      const r = buildPrompt();
      if (r.error) { ui.ai.prompt = ''; ui.ai.result = { ok: false, html: esc(r.error) }; } else { ui.ai.prompt = r.text; ui.ai.result = null; }
      render();
      const p = $('#ai-prompt');
      if (p) p.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    },
    'ai-copy': () => copyText(ui.ai.prompt, $('#ai-prompt')),
    'ai-import': aiImport,
    'modal-close': closeModal,
    'cl-add': () => {
      const t = ui.modal && task(ui.modal.id);
      const inp = $('#cl-new');
      if (!t || !inp || !inp.value.trim()) return;
      t.checklist.push({ id: uid(), text: inp.value.trim().slice(0, 160), done: false });
      save(); refreshTaskModal('cl-new'); render();
    },
    'cl-del': (el) => {
      const t = ui.modal && task(ui.modal.id);
      if (!t) return;
      t.checklist = t.checklist.filter((c) => c.id !== el.dataset.cl);
      save(); refreshTaskModal(); render();
    },
    'focus-task': () => {
      const t = ui.modal && task(ui.modal.id);
      if (!t) return;
      if (t.list !== 'doing' && t.list !== 'done') setList(t, 'doing');
      S.timer.taskId = t.id;
      if (!S.timer.running && S.timer.mode !== 'focus') { S.timer.mode = 'focus'; S.timer.remaining = durOf('focus'); }
      save(); closeModal(); setView('foco');
    },
    'split-task': () => { const id = ui.modal && ui.modal.id; closeModal(); selectTool('split'); ui.ai.taskId = id; setView('ia'); },
    'delete-task': () => {
      const id = ui.modal && ui.modal.id;
      S.tasks = S.tasks.filter((t) => t.id !== id);
      if (S.timer.taskId === id) S.timer.taskId = '';
      save(); closeModal(); toast('Tarefa excluída.');
    },
    theme: (el) => setTheme(el.dataset.themeV),
    'theme-toggle': () => setTheme(effectiveDark() ? 'light' : 'dark'),
    settings: openSettings,
    'reset-sample': () => { S = seed(); save(); applyTheme(); closeModal(); toast('Dados de exemplo restaurados.'); },
    'reset-blank': () => { S = freshStart(); save(); closeModal(); toast('Tudo apagado. Comece capturando suas tarefas!'); },
    'sample-clear': () => { S = freshStart(); save(); render(); toast('Exemplos apagados. Comece capturando suas tarefas!'); $('#capture-input').focus(); },
    'sample-keep': () => { S.sample = false; save(); render(); },
  };

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-act]');
    if (btn) {
      if (btn.tagName === 'A') e.preventDefault();
      if (!armed(btn)) return;
      const fn = actions[btn.dataset.act];
      if (fn) fn(btn, e);
      return;
    }
    const card = e.target.closest('.card');
    if (card) openTask(card.dataset.id);
  });

  document.addEventListener('input', (e) => {
    const el = e.target;
    if (el.dataset.field && ui.modal && ui.modal.type === 'task') {
      const t = task(ui.modal.id);
      if (!t) return;
      const f = el.dataset.field;
      if (f === 'title') t.title = el.value.replace(/\s*\n\s*/g, ' ');
      else if (f === 'desc') t.desc = el.value;
      else if (f === 'list') { const first = el.value === 'done' ? S.tasks.find((x) => x.list === 'done' && !x.archived) : null; moveTask(t, el.value, first ? first.id : null); }
      else if (f === 'q') t.q = +el.value;
      else if (f === 'due') t.due = el.value;
      else if (f === 'area') t.area = el.value;
      else if (f === 'est') t.est = clamp(parseInt(el.value, 10) || 0, 0, 20);
      save();
      if (f !== 'title' && f !== 'desc' && f !== 'est') render();
      return;
    }
    if (el.dataset.goal !== undefined) {
      const k = el.dataset.week;
      S.goals[k] = S.goals[k] || ['', '', ''];
      S.goals[k][+el.dataset.goal] = el.value;
      save();
      return;
    }
    if (el.id === 'ai-input') ui.ai.input = el.value;
    else if (el.id === 'ai-response') ui.ai.response = el.value;
    else if (el.dataset.msg) ui.ai.msg[el.dataset.msg] = el.value;
  });

  document.addEventListener('change', (e) => {
    const el = e.target;
    if (el.dataset.cl && ui.modal && ui.modal.type === 'task') {
      const t = task(ui.modal.id);
      const c = t && t.checklist.find((x) => x.id === el.dataset.cl);
      if (c) { c.done = el.checked; save(); refreshTaskModal(el.id); render(); }
      return;
    }
    if (el.id === 'timer-task') { S.timer.taskId = el.value; save(); return; }
    if (el.id === 'ai-task') { ui.ai.taskId = el.value; ui.ai.prompt = ''; render(); return; }
    if (el.id === 'import-file') { importBackup(el.files && el.files[0]); return; }
    if (el.dataset.setting) {
      const k = el.dataset.setting;
      const lim = { focus: [5, 90], short: [1, 30], long: [5, 60], wip: [1, 10] }[k];
      S.settings[k] = clamp(parseInt(el.value, 10) || lim[0], lim[0], lim[1]);
      el.value = S.settings[k];
      if (k !== 'wip' && !S.timer.running) S.timer.remaining = durOf(S.timer.mode);
      save(); render();
    }
  });

  document.addEventListener('submit', (e) => {
    const f = e.target;
    e.preventDefault();
    if (f.id === 'capture-form') {
      const inp = $('#capture-input');
      const p = parseCapture(inp.value.trim());
      if (!p.title) return;
      S.tasks.push(newTask({ ...p, list: 'inbox' }));
      save(); inp.value = ''; render();
      toast(`Capturado na Entrada${p.q ? ` · Q${p.q}` : ''}${p.due ? ` · ${dueLabel(p.due)}` : ''}.`, 'good');
    } else if (f.classList.contains('add-form')) {
      const ta = f.querySelector('textarea');
      const rows = ta.value.split(/\n/).map((s) => s.trim()).filter(Boolean);
      rows.forEach((row) => { const p = parseCapture(row); if (p.title) S.tasks.push(newTask({ ...p, list: f.dataset.list })); });
      save(); render();
      const again = document.getElementById(`add-${ui.adding}`);
      if (again) again.focus();
      if (rows.length > 1) toast(`${rows.length} tarefas adicionadas.`, 'good');
    } else if (f.id === 'distraction-form') {
      const inp = $('#distraction-input');
      const v = inp.value.trim();
      if (!v) return;
      const k = todayISO();
      S.tasks.push(newTask({ ...parseCapture(v), list: 'inbox' }));
      S.distractions[k] = (S.distractions[k] || 0) + 1;
      save(); render();
      toast('Anotado na Entrada. Volte ao foco!', 'good');
      const again = $('#distraction-input');
      if (again) again.focus();
    } else if (f.id === 'habit-form') {
      const inp = $('#habit-input');
      const v = inp.value.trim();
      if (!v) return;
      S.habits.push({ id: uid(), name: v.slice(0, 60) });
      save(); render();
      const again = $('#habit-input');
      if (again) again.focus();
    } else if (f.id === 'event-form') {
      const title = $('#e-title').value.trim(), type = $('#e-type').value, date = $('#e-date').value, start = $('#e-start').value, end = $('#e-end').value;
      const days = $$('[data-eday]', f).filter((c) => c.checked).map((c) => +c.value);
      const err = !title ? 'Dê um título ao compromisso.' : !date ? 'Escolha a data.' : !start || !end ? 'Informe o início e o fim.' : minutes(end) <= minutes(start) ? 'O fim precisa ser depois do início.' : '';
      if (err) { const p = $('#e-error'); p.textContent = err; p.hidden = false; return; }
      const id = ui.modal && ui.modal.id;
      const existing = id && S.events.find((x) => x.id === id);
      if (existing) Object.assign(existing, { title, type, date, start, end, days });
      else S.events.push({ id: uid(), title, type, date, start, end, days });
      save(); closeModal();
      toast(existing ? 'Compromisso atualizado.' : 'Compromisso criado.', 'good');
    }
  });

  document.addEventListener('keydown', (e) => {
    const el = e.target;
    const tag = (el.tagName || '').toLowerCase();
    const typing = tag === 'input' || tag === 'textarea' || tag === 'select' || el.isContentEditable;
    if (el.id === 'm-title' && e.key === 'Enter') { e.preventDefault(); el.blur(); return; }
    if (el.id === 'cl-new' && e.key === 'Enter') { e.preventDefault(); actions['cl-add'](); return; }
    if (tag === 'textarea' && el.closest('.add-form')) {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); el.form.requestSubmit(); }
      else if (e.key === 'Escape') { e.preventDefault(); ui.adding = null; render(); }
      return;
    }
    if (!typing && !dlg().open && !e.metaKey && !e.ctrlKey && !e.altKey) {
      if (e.key === 'n' || e.key === 'N' || e.key === '/') { e.preventDefault(); $('#capture-input').focus(); return; }
      const n = parseInt(e.key, 10);
      if (n >= 1 && n <= VIEWS.length) { setView(VIEWS[n - 1].id); return; }
    }
    if ((e.key === 'Enter' || e.key === ' ') && el.classList && el.classList.contains('card')) { e.preventDefault(); openTask(el.dataset.id); }
  });

  /* ---------- Arrastar e soltar ---------- */
  let dragId = null;
  let overZone = null;
  const ph = document.createElement('div');
  ph.className = 'card-ph';
  function endDrag() {
    dragId = null;
    ph.remove();
    if (overZone) overZone.classList.remove('drop-over');
    overZone = null;
    $$('.card.dragging').forEach((c) => c.classList.remove('dragging'));
    document.body.classList.remove('is-dragging');
  }
  document.addEventListener('dragstart', (e) => {
    const card = e.target.closest && e.target.closest('.card');
    if (!card) return;
    dragId = card.dataset.id;
    try { e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', dragId); } catch (err) { /* ignorado */ }
    ph.style.height = `${card.offsetHeight}px`;
    setTimeout(() => card.classList.add('dragging'), 0);
    document.body.classList.add('is-dragging');
  });
  document.addEventListener('dragover', (e) => {
    if (!dragId) return;
    const zone = e.target.closest && e.target.closest('[data-drop]');
    if (zone !== overZone) {
      if (overZone) overZone.classList.remove('drop-over');
      overZone = zone;
      if (zone) zone.classList.add('drop-over');
      if (!zone || !zone.dataset.drop.startsWith('list:')) ph.remove();
    }
    if (!zone) return;
    e.preventDefault();
    try { e.dataTransfer.dropEffect = 'move'; } catch (err) { /* ignorado */ }
    if (zone.dataset.drop.startsWith('list:')) {
      const cards = $$('.card:not(.dragging)', zone);
      const after = cards.find((c) => { const r = c.getBoundingClientRect(); return e.clientY < r.top + r.height / 2; });
      if (after) { if (ph.nextElementSibling !== after) zone.insertBefore(ph, after); } else if (zone.lastElementChild !== ph) zone.appendChild(ph);
    }
  });
  document.addEventListener('drop', (e) => {
    if (!dragId) return;
    const zone = e.target.closest && e.target.closest('[data-drop]');
    if (!zone) { endDrag(); return; }
    e.preventDefault();
    const t = task(dragId);
    const spec = zone.dataset.drop;
    const i = spec.indexOf(':');
    const kind = spec.slice(0, i), val = spec.slice(i + 1);
    if (t) {
      if (kind === 'list') {
        let n = ph.parentNode === zone ? ph.nextElementSibling : null;
        while (n && (!n.classList.contains('card') || n.classList.contains('dragging'))) n = n.nextElementSibling;
        moveTask(t, val, n ? n.dataset.id : null);
      } else if (kind === 'q') {
        t.q = +val;
        toast(val === '0' ? 'Prioridade removida.' : `Classificada como Q${val} · ${QUADS[val].name}.`);
      } else if (kind === 'due') {
        t.due = val;
        toast(val ? `Agendada para ${dueLabel(val)}.` : 'Data removida.');
      }
      save();
    }
    endDrag();
    render();
  });
  document.addEventListener('dragend', endDrag);

  /* ---------- Dicas dos gráficos (mouse e teclado) ---------- */
  const tipEl = () => $('#tooltip');
  function placeTip(x, y) {
    const tip = tipEl();
    const w = tip.offsetWidth, h = tip.offsetHeight;
    let left = x + 14, top = y - h - 12;
    if (left + w > window.innerWidth - 8) left = x - w - 14;
    if (top < 8) top = y + 18;
    tip.style.left = `${Math.max(8, left)}px`;
    tip.style.top = `${top}px`;
  }
  function showTip(el, x, y) {
    const tip = tipEl();
    const [label, ...rest] = el.dataset.tip.split('\n');
    const v = document.createElement('strong');
    const l = document.createElement('span');
    v.textContent = rest.length ? rest.join('\n') : label;
    l.textContent = rest.length ? label : '';
    tip.replaceChildren(v, l);
    tip.hidden = false;
    placeTip(x, y);
  }
  document.addEventListener('pointerover', (e) => { const el = e.target.closest && e.target.closest('[data-tip]'); if (el) showTip(el, e.clientX, e.clientY); });
  document.addEventListener('pointermove', (e) => { if (!tipEl().hidden && e.target.closest && e.target.closest('[data-tip]')) placeTip(e.clientX, e.clientY); });
  document.addEventListener('pointerout', (e) => { const el = e.target.closest && e.target.closest('[data-tip]'); if (el && !el.contains(e.relatedTarget)) tipEl().hidden = true; });
  document.addEventListener('focusin', (e) => {
    const el = e.target.closest && e.target.closest('[data-tip]');
    if (el) { const r = el.getBoundingClientRect(); showTip(el, r.left + r.width / 2, r.top); } else tipEl().hidden = true;
  });
  window.addEventListener('scroll', () => { tipEl().hidden = true; }, { passive: true });

  /* ---------- Início ---------- */
  function init() {
    $('#tabs').innerHTML = VIEWS.map((v, i) => `<a href="#${v.id}" data-act="goto" data-view="${v.id}" title="${v.label} (atalho ${i + 1})">${icon(v.icon)}<span>${v.label}</span></a>`).join('');
    $('#settings-btn').innerHTML = icon('sliders');
    const d = dlg();
    d.addEventListener('close', () => {
      if (ui.modal && ui.modal.type === 'task') { const t = task(ui.modal.id); if (t && !t.title.trim()) t.title = 'Sem título'; save(); }
      ui.modal = null;
      d.innerHTML = '';
      render();
    });
    d.addEventListener('click', (e) => { if (e.target === d) closeModal(); });
    applyTheme();
    try { window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', updateThemeIcon); } catch (e) { /* ignorado */ }
    try { new MutationObserver(updateThemeIcon).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] }); } catch (e) { /* ignorado */ }
    const h = (location.hash || '').slice(1);
    ui.view = VIEWS.some((v) => v.id === h) ? h : 'quadro';
    window.addEventListener('hashchange', () => { const x = location.hash.slice(1); if (x !== ui.view && VIEWS.some((v) => v.id === x)) { ui.view = x; render(); } });
    if (S.timer.running && timerLeft() <= 0) timerComplete(true);
    render();
    setInterval(tick, 250);
  }
  init();
})();
