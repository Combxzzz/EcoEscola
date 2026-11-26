(() => {
  "use strict";

  const STORAGE_KEY = "ecoescola_emygdio_state_v1";
  const SCHOOL_GOAL_TARGET = 1000;

  // Base coletiva da Escola Emygdio
  const SCHOOL_BASE = {
    Plástico: 115,
    Papel: 95,
    Metal: 62,
    Vidro: 28,
    "Ação Verde": 40,
  };

  const CHECKLIST_ITEMS = [
    {
      id: "pet",
      name: "Garrafa PET limpa",
      category: "Plástico",
      points: 15,
      icon: "🧴",
      desc: "Garrafas de água, suco ou refrigerante amassadas e sem líquido.",
      impact: { water: 12, trees: 0, energy: 1.4, co2: 0.45 },
    },
    {
      id: "tampinhas",
      name: "Tampinhas plásticas",
      category: "Plástico",
      points: 10,
      icon: "🔵",
      desc: "Tampinhas de garrafas ou embalagens separadas para reciclagem.",
      impact: { water: 5, trees: 0, energy: 0.6, co2: 0.2 },
    },
    {
      id: "papel_caderno",
      name: "Papel ou caderno usado",
      category: "Papel",
      points: 12,
      icon: "📄",
      desc: "Folhas usadas, rascunhos, jornais ou cadernos sem espiral.",
      impact: { water: 18, trees: 0.04, energy: 0.9, co2: 0.35 },
    },
    {
      id: "papelao",
      name: "Caixa de papelão",
      category: "Papel",
      points: 15,
      icon: "📦",
      desc: "Caixas desmontadas e dobradas para ocupar menos espaço.",
      impact: { water: 22, trees: 0.06, energy: 1.1, co2: 0.4 },
    },
    {
      id: "lata_aluminio",
      name: "Lata de alumínio",
      category: "Metal",
      points: 20,
      icon: "🥫",
      desc: "Latinhas limpas de suco ou refrigerante (reciclagem contínua).",
      impact: { water: 14, trees: 0, energy: 2.8, co2: 0.7 },
    },
    {
      id: "embalagem_metal",
      name: "Embalagem metálica",
      category: "Metal",
      points: 15,
      icon: "🪙",
      desc: "Latas de achocolatado ou conservas higienizadas.",
      impact: { water: 10, trees: 0, energy: 1.9, co2: 0.5 },
    },
    {
      id: "pote_vidro",
      name: "Pote ou garrafa de vidro",
      category: "Vidro",
      points: 20,
      icon: "🫙",
      desc: "Frascos inteiros trazidos com segurança.",
      impact: { water: 9, trees: 0, energy: 1.3, co2: 0.55 },
    },
    {
      id: "garrafa_reutilizavel",
      name: "Uso de garrafinha própria",
      category: "Ação Verde",
      points: 10,
      icon: "💧",
      desc: "Evitou copos descartáveis na escola durante o dia.",
      impact: { water: 6, trees: 0, energy: 0.5, co2: 0.18 },
    },
    {
      id: "horta_compostagem",
      name: "Cuidado com horta ou plantas",
      category: "Ação Verde",
      points: 18,
      icon: "🌱",
      desc: "Ajudou a regar as mudas ou cuidou das plantas da escola.",
      impact: { water: 8, trees: 0.03, energy: 0.4, co2: 0.3 },
    },
    {
      id: "energia_agua",
      name: "Patrulha da água e luz",
      category: "Ação Verde",
      points: 12,
      icon: "💡",
      desc: "Fechou torneiras pingando ou apagou luzes de salas vazias.",
      impact: { water: 15, trees: 0, energy: 1.6, co2: 0.32 },
    },
  ];

  const MISSIONS = [
    {
      id: "m_primeiro_passo",
      title: "Primeiro Passo Verde",
      description: "Envie pelo menos 1 registro no check-list.",
      icon: "🚀",
      bonus: 20,
      target: 1,
      progressFn: (stats) => stats.totalEntries,
    },
    {
      id: "m_plastico_zero",
      title: "Guardião do Plástico",
      description: "Recicle 5 itens da categoria Plástico.",
      icon: "🧴",
      bonus: 35,
      target: 5,
      progressFn: (stats) => stats.byCategory["Plástico"] || 0,
    },
    {
      id: "m_amigo_arvores",
      title: "Amigo das Árvores",
      description: "Recicle 5 itens de Papel ou Papelão.",
      icon: "🌳",
      bonus: 35,
      target: 5,
      progressFn: (stats) => stats.byCategory["Papel"] || 0,
    },
    {
      id: "m_fotografo",
      title: "Repórter Sustentável",
      description: "Anexe foto em 2 registros de reciclagem.",
      icon: "📸",
      bonus: 30,
      target: 2,
      progressFn: (stats) => stats.entriesWithPhoto,
    },
    {
      id: "m_alerta_verde",
      title: "Voz Ativa da Escola",
      description: "Envie pelo menos 1 alerta com solução para a escola.",
      icon: "📢",
      bonus: 25,
      target: 1,
      progressFn: (stats) => stats.totalSuggestions,
    },
    {
      id: "m_colecionador",
      title: "Super Campeão Verde",
      description: "Alcance 15 itens reciclados ou ações sustentáveis.",
      icon: "🏆",
      bonus: 50,
      target: 15,
      progressFn: (stats) => stats.totalItems,
    },
  ];

  const LEVELS = [
    { name: "Semente Curiosa", icon: "🌱", minPoints: 0 },
    { name: "Broto Protetor", icon: "🌿", minPoints: 50 },
    { name: "Guardião Verde", icon: "🌳", minPoints: 120 },
    { name: "Agente da Reciclagem", icon: "♻️", minPoints: 240 },
    { name: "Mestre Sustentável", icon: "🌍", minPoints: 400 },
  ];

  // Estado em memória
  let state = loadState();
  let activeFilter = "all";
  const selectedQuantities = new Map();
  let pendingPhoto = null; // { dataUrl: string, fileName: string }
  let pendingSugPhoto = null; // { dataUrl: string, fileName: string }

  // Elementos do DOM
  const els = {
    navTabs: document.querySelectorAll(".nav-tab"),
    tabPanes: document.querySelectorAll(".tab-pane"),

    headerLevelBadge: document.getElementById("headerLevelBadge"),
    headerLevelName: document.getElementById("headerLevelName"),
    headerPoints: document.getElementById("headerPoints"),

    // Hero do aluno
    studentName: document.getElementById("studentName"),
    displayCurrentStudent: document.getElementById("displayCurrentStudent"),
    displayCurrentStudentSug: document.getElementById("displayCurrentStudentSug"),

    rankBadgeIcon: document.getElementById("rankBadgeIcon"),
    rankTitle: document.getElementById("rankTitle"),
    totalPointsValue: document.getElementById("totalPointsValue"),
    totalItemsValue: document.getElementById("totalItemsValue"),
    completedMissionsValue: document.getElementById("completedMissionsValue"),
    nextLevelLabel: document.getElementById("nextLevelLabel"),
    nextLevelPct: document.getElementById("nextLevelPct"),
    levelProgressBar: document.getElementById("levelProgressBar"),
    levelProgressFill: document.getElementById("levelProgressFill"),

    // Check-list
    filterChips: document.querySelectorAll(".chip"),
    checklistGrid: document.getElementById("checklistGrid"),
    selectedCountBadge: document.getElementById("selectedCountBadge"),

    // Formulário de envio de reciclagem
    recycleForm: document.getElementById("recycleForm"),
    entryDate: document.getElementById("entryDate"),
    entryNotes: document.getElementById("entryNotes"),
    photoInput: document.getElementById("photoInput"),
    uploadDropzone: document.getElementById("uploadDropzone"),
    uploadPlaceholder: document.getElementById("uploadPlaceholder"),
    uploadPreview: document.getElementById("uploadPreview"),
    previewImg: document.getElementById("previewImg"),
    photoFileName: document.getElementById("photoFileName"),
    removePhotoBtn: document.getElementById("removePhotoBtn"),
    summaryItemsCount: document.getElementById("summaryItemsCount"),
    summaryPoints: document.getElementById("summaryPoints"),
    formFeedback: document.getElementById("formFeedback"),

    // Missões e Impacto
    missionsGrid: document.getElementById("missionsGrid"),
    impactWater: document.getElementById("impactWater"),
    impactTrees: document.getElementById("impactTrees"),
    impactEnergy: document.getElementById("impactEnergy"),
    impactCo2: document.getElementById("impactCo2"),
    schoolGoalPct: document.getElementById("schoolGoalPct"),
    schoolGoalFill: document.getElementById("schoolGoalFill"),
    schoolBaseCount: document.getElementById("schoolBaseCount"),
    studentContribCount: document.getElementById("studentContribCount"),
    schoolTotalCount: document.getElementById("schoolTotalCount"),
    categoryBars: document.getElementById("categoryBars"),

    // Histórico de reciclagem
    historyList: document.getElementById("historyList"),
    exportBtn: document.getElementById("exportBtn"),
    clearDataBtn: document.getElementById("clearDataBtn"),

    // Aba de Alertas & Soluções
    suggestionForm: document.getElementById("suggestionForm"),
    sugSubject: document.getElementById("sugSubject"),
    sugSubjectCounter: document.getElementById("sugSubjectCounter"),
    quickProblemTags: document.getElementById("quickProblemTags"),
    sugAlternative: document.getElementById("sugAlternative"),
    sugPhotoInput: document.getElementById("sugPhotoInput"),
    sugUploadDropzone: document.getElementById("sugUploadDropzone"),
    sugUploadPlaceholder: document.getElementById("sugUploadPlaceholder"),
    sugUploadPreview: document.getElementById("sugUploadPreview"),
    sugPreviewImg: document.getElementById("sugPreviewImg"),
    sugPhotoFileName: document.getElementById("sugPhotoFileName"),
    sugRemovePhotoBtn: document.getElementById("sugRemovePhotoBtn"),
    sugFormFeedback: document.getElementById("sugFormFeedback"),
    sugCounterBadge: document.getElementById("sugCounterBadge"),
    suggestionsList: document.getElementById("suggestionsList"),

    // Toast e Modal de foto
    toast: document.getElementById("toast"),
    imageModal: document.getElementById("imageModal"),
    modalBackdrop: document.getElementById("modalBackdrop"),
    modalCloseBtn: document.getElementById("modalCloseBtn"),
    modalImage: document.getElementById("modalImage"),
    modalCaption: document.getElementById("modalCaption"),
  };

  function getTodayLocalISO() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return { studentName: "", entries: [], suggestions: [] };
      }
      const parsed = JSON.parse(raw);
      return {
        studentName: typeof parsed.studentName === "string" ? parsed.studentName : "",
        entries: Array.isArray(parsed.entries) ? parsed.entries : [],
        suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
      };
    } catch {
      return { studentName: "", entries: [], suggestions: [] };
    }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      return true;
    } catch {
      showFeedback(
        "O armazenamento local está quase cheio. Tente limpar itens antigos ou usar fotos menores.",
        "error"
      );
      return false;
    }
  }

  function computeStats() {
    const byCategory = {
      Plástico: 0,
      Papel: 0,
      Metal: 0,
      Vidro: 0,
      "Ação Verde": 0,
    };
    let itemPoints = 0;
    let totalItems = 0;
    let entriesWithPhoto = 0;
    let water = 0;
    let trees = 0;
    let energy = 0;
    let co2 = 0;

    const itemLookup = new Map(CHECKLIST_ITEMS.map((item) => [item.id, item]));

    for (const entry of state.entries || []) {
      if (entry.photoDataUrl) {
        entriesWithPhoto += 1;
      }
      itemPoints += Number(entry.pointsEarned) || 0;

      for (const entryItem of entry.items || []) {
        const qty = Number(entryItem.quantity) || 1;
        totalItems += qty;
        const def = itemLookup.get(entryItem.id);
        const category = def ? def.category : entryItem.category;
        if (category && Object.prototype.hasOwnProperty.call(byCategory, category)) {
          byCategory[category] += qty;
        }
        if (def && def.impact) {
          water += (def.impact.water || 0) * qty;
          trees += (def.impact.trees || 0) * qty;
          energy += (def.impact.energy || 0) * qty;
          co2 += (def.impact.co2 || 0) * qty;
        }
      }
    }

    const totalSuggestions = (state.suggestions || []).length;
    const baseStats = {
      totalEntries: (state.entries || []).length,
      totalItems,
      entriesWithPhoto,
      totalSuggestions,
      byCategory,
    };

    // Cada alerta com solução dá +10 pontos
    const suggestionsPoints = totalSuggestions * 10;

    let missionBonus = 0;
    let completedMissions = 0;
    const missionsStatus = MISSIONS.map((mission) => {
      const current = mission.progressFn(baseStats);
      const completed = current >= mission.target;
      if (completed) {
        completedMissions += 1;
        missionBonus += mission.bonus;
      }
      return {
        ...mission,
        current: Math.min(current, mission.target),
        rawCurrent: current,
        completed,
      };
    });

    const totalPoints = itemPoints + suggestionsPoints + missionBonus;

    return {
      ...baseStats,
      itemPoints,
      suggestionsPoints,
      missionBonus,
      totalPoints,
      completedMissions,
      missionsStatus,
      impact: { water, trees, energy, co2 },
    };
  }

  function getLevelInfo(points) {
    let currentIndex = 0;
    for (let i = 0; i < LEVELS.length; i += 1) {
      if (points >= LEVELS[i].minPoints) {
        currentIndex = i;
      }
    }
    const current = LEVELS[currentIndex];
    const next = LEVELS[currentIndex + 1] || null;
    if (!next) {
      return { current, next: null, pct: 100 };
    }
    const span = next.minPoints - current.minPoints;
    const gained = points - current.minPoints;
    const pct = Math.max(0, Math.min(100, Math.round((gained / span) * 100)));
    return { current, next, pct };
  }

  function getEffectiveStudentName() {
    return (state.studentName || "").trim();
  }

  function getDisplayStudentName() {
    const raw = getEffectiveStudentName();
    return raw ? raw : "Estudante Anônimo";
  }

  function updateStudentNameUI() {
    const rawName = getEffectiveStudentName();
    const displayName = rawName ? rawName : "Estudante Anônimo";

    if (els.displayCurrentStudent) {
      els.displayCurrentStudent.textContent = displayName;
    }
    if (els.displayCurrentStudentSug) {
      els.displayCurrentStudentSug.textContent = displayName;
    }

    const stats = computeStats();
    const levelInfo = getLevelInfo(stats.totalPoints);
    if (els.rankTitle) {
      els.rankTitle.textContent = `${displayName} • ${levelInfo.current.name}`;
    }
  }

  function renderChecklist() {
    const visibleItems =
      activeFilter === "all"
        ? CHECKLIST_ITEMS
        : CHECKLIST_ITEMS.filter((item) => item.category === activeFilter);

    els.checklistGrid.innerHTML = visibleItems
      .map((item) => {
        const qty = selectedQuantities.get(item.id) || 0;
        const checked = qty > 0;
        const displayQty = checked ? qty : 1;

        return `
          <div class="check-item ${checked ? "checked" : ""}" data-item-id="${item.id}">
            <label class="check-label">
              <input
                type="checkbox"
                class="check-input"
                data-action="toggle"
                data-id="${item.id}"
                ${checked ? "checked" : ""}
              />
              <div class="check-info">
                <div class="check-title-row">
                  <span class="check-name">
                    <span aria-hidden="true">${item.icon}</span>
                    ${item.name}
                  </span>
                  <span class="check-pts">+${item.points} pts</span>
                </div>
                <p class="check-desc">${item.desc}</p>
              </div>
            </label>
            <div class="check-bottom">
              <span class="cat-tag">${item.category}</span>
              <div class="qty-control" aria-label="Quantidade de ${item.name}">
                <button
                  type="button"
                  class="qty-btn"
                  data-action="dec"
                  data-id="${item.id}"
                  ${!checked || qty <= 1 ? "disabled" : ""}
                  aria-label="Diminuir quantidade"
                >−</button>
                <span class="qty-val">${displayQty}</span>
                <button
                  type="button"
                  class="qty-btn"
                  data-action="inc"
                  data-id="${item.id}"
                  aria-label="Aumentar quantidade"
                >+</button>
              </div>
            </div>
          </div>
        `;
      })
      .join("");

    updateSelectionSummary();
  }

  function updateSelectionSummary() {
    let totalCount = 0;
    let totalPts = 0;

    for (const item of CHECKLIST_ITEMS) {
      const qty = selectedQuantities.get(item.id) || 0;
      if (qty > 0) {
        totalCount += qty;
        totalPts += item.points * qty;
      }
    }

    const distinctCount = selectedQuantities.size;
    if (els.selectedCountBadge) {
      els.selectedCountBadge.textContent = `${distinctCount} tipo(s) marcado(s)`;
    }
    if (els.summaryItemsCount) {
      els.summaryItemsCount.textContent = String(totalCount);
    }
    if (els.summaryPoints) {
      els.summaryPoints.textContent = `+${totalPts} pts`;
    }
  }

  function renderDashboard(stats) {
    const levelInfo = getLevelInfo(stats.totalPoints);
    const displayName = getDisplayStudentName();

    if (els.headerPoints) els.headerPoints.textContent = String(stats.totalPoints);
    if (els.headerLevelName) els.headerLevelName.textContent = levelInfo.current.name;
    if (els.headerLevelBadge) {
      els.headerLevelBadge.innerHTML = `${levelInfo.current.icon} <strong>${levelInfo.current.name}</strong>`;
    }

    if (els.rankBadgeIcon) els.rankBadgeIcon.textContent = levelInfo.current.icon;
    if (els.rankTitle) els.rankTitle.textContent = `${displayName} • ${levelInfo.current.name}`;
    if (els.totalPointsValue) els.totalPointsValue.textContent = String(stats.totalPoints);
    if (els.totalItemsValue) els.totalItemsValue.textContent = String(stats.totalItems);
    if (els.completedMissionsValue) {
      els.completedMissionsValue.textContent = `${stats.completedMissions}/${MISSIONS.length}`;
    }

    if (els.nextLevelLabel) {
      els.nextLevelLabel.textContent = levelInfo.next
        ? `Próximo nível: ${levelInfo.next.name} (${levelInfo.next.minPoints} pts)`
        : "Nível máximo alcançado!";
    }
    if (els.nextLevelPct) els.nextLevelPct.textContent = `${levelInfo.pct}%`;
    if (els.levelProgressFill) els.levelProgressFill.style.width = `${levelInfo.pct}%`;
    if (els.levelProgressBar) {
      els.levelProgressBar.setAttribute("aria-valuenow", String(levelInfo.pct));
    }

    // Renderizar Missões
    if (els.missionsGrid) {
      els.missionsGrid.innerHTML = stats.missionsStatus
        .map((m) => {
          const pct = Math.round((m.current / m.target) * 100);
          return `
            <article class="card mission-card ${m.completed ? "done" : ""}">
              <div>
                <div class="mission-top">
                  <div class="mission-icon" aria-hidden="true">${m.icon}</div>
                  <span class="mission-status ${m.completed ? "completed" : "pending"}">
                    ${m.completed ? `Concluída (+${m.bonus} pts)` : `Bônus: +${m.bonus} pts`}
                  </span>
                </div>
                <h3>${m.title}</h3>
                <p>${m.description}</p>
              </div>
              <div class="mission-progress-wrap">
                <div class="mission-progress-text">
                  <span>Progresso</span>
                  <span>${m.current} / ${m.target}</span>
                </div>
                <div class="mission-track">
                  <div class="mission-fill" style="width: ${pct}%"></div>
                </div>
              </div>
            </article>
          `;
        })
        .join("");
    }

    // Painel de Impacto da Escola
    const schoolBaseWater = 4200;
    const schoolBaseTrees = 7.4;
    const schoolBaseEnergy = 460;
    const schoolBaseCo2 = 148;

    const totalWater = Math.round(schoolBaseWater + stats.impact.water);
    const totalTrees = (schoolBaseTrees + stats.impact.trees).toFixed(2).replace(".", ",");
    const totalEnergy = (schoolBaseEnergy + stats.impact.energy).toFixed(1).replace(".", ",");
    const totalCo2 = (schoolBaseCo2 + stats.impact.co2).toFixed(1).replace(".", ",");

    if (els.impactWater) els.impactWater.textContent = `${totalWater.toLocaleString("pt-BR")} L`;
    if (els.impactTrees) els.impactTrees.textContent = totalTrees;
    if (els.impactEnergy) els.impactEnergy.textContent = `${totalEnergy} kWh`;
    if (els.impactCo2) els.impactCo2.textContent = `${totalCo2} kg`;

    const schoolBaseTotal = Object.values(SCHOOL_BASE).reduce((acc, n) => acc + n, 0);
    const schoolGrandTotal = schoolBaseTotal + stats.totalItems;
    const goalPct = Math.min(100, Math.round((schoolGrandTotal / SCHOOL_GOAL_TARGET) * 100));

    if (els.schoolBaseCount) els.schoolBaseCount.textContent = String(schoolBaseTotal);
    if (els.studentContribCount) els.studentContribCount.textContent = String(stats.totalItems);
    if (els.schoolTotalCount) els.schoolTotalCount.textContent = String(schoolGrandTotal);
    if (els.schoolGoalPct) els.schoolGoalPct.textContent = `${goalPct}%`;
    if (els.schoolGoalFill) els.schoolGoalFill.style.width = `${goalPct}%`;

    // Barras por categoria
    if (els.categoryBars) {
      const categories = Object.keys(SCHOOL_BASE);
      const combinedTotals = categories.map((cat) => ({
        name: cat,
        count: SCHOOL_BASE[cat] + (stats.byCategory[cat] || 0),
        localCount: stats.byCategory[cat] || 0,
      }));
      const maxCat = Math.max(...combinedTotals.map((c) => c.count), 1);

      els.categoryBars.innerHTML = combinedTotals
        .map((cat) => {
          const widthPct = Math.round((cat.count / maxCat) * 100);
          return `
            <div class="bar-row">
              <div class="bar-row-top">
                <span>${cat.name}</span>
                <span>${cat.count} itens (${cat.localCount} seu(s))</span>
              </div>
              <div class="bar-track">
                <div class="bar-fill" style="width: ${widthPct}%"></div>
              </div>
            </div>
          `;
        })
        .join("");
    }

    renderHistory();
    renderSuggestions();
    updateStudentNameUI();
  }

  function formatDateBR(dateISO, savedAtISO) {
    if (!dateISO) return "Data recente";
    const [y, m, d] = dateISO.split("-");
    const dateFormatted = `${d}/${m}/${y}`;
    if (!savedAtISO) return dateFormatted;
    const dt = new Date(savedAtISO);
    if (Number.isNaN(dt.getTime())) return dateFormatted;
    const hh = String(dt.getHours()).padStart(2, "0");
    const mm = String(dt.getMinutes()).padStart(2, "0");
    return `${dateFormatted} às ${hh}:${mm}`;
  }

  function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text || "";
    return div.innerHTML;
  }

  function renderHistory() {
    if (!els.historyList) return;

    if (!state.entries || state.entries.length === 0) {
      els.historyList.innerHTML = `
        <div class="card history-empty">
          <strong>Nenhum registro de reciclagem ainda.</strong>
          <p>Marque os itens no check-list acima, adicione uma foto se quiser e clique em <em>Registrar e Ganhar Pontos</em>!</p>
        </div>
      `;
      return;
    }

    const sorted = [...state.entries].sort((a, b) =>
      (b.savedAt || b.date).localeCompare(a.savedAt || a.date)
    );

    els.historyList.innerHTML = sorted
      .map((entry) => {
        const studentDisplay = escapeHtml(entry.studentName || "Estudante");
        const dateLabel = formatDateBR(entry.date, entry.savedAt);
        const tagsHtml = (entry.items || [])
          .map(
            (it) =>
              `<span class="history-item-tag">${escapeHtml(it.icon || "♻️")} ${escapeHtml(
                it.name
              )} × ${it.quantity}</span>`
          )
          .join("");

        const noteHtml = entry.notes
          ? `<p class="history-note">💬 ${escapeHtml(entry.notes)}</p>`
          : "";

        const hasSafePhoto =
          typeof entry.photoDataUrl === "string" && entry.photoDataUrl.startsWith("data:image/");

        const photoHtml = hasSafePhoto
          ? `<button
              type="button"
              class="history-photo-btn"
              data-action="zoom-photo"
              data-entry-id="${escapeHtml(entry.id)}"
              title="Clique para ampliar a foto anexada"
            >
              <img src="${entry.photoDataUrl}" alt="Foto anexada no registro de ${dateLabel}" />
            </button>`
          : `<div class="history-no-photo">Sem foto anexada</div>`;

        return `
          <article class="card history-card">
            <div>
              <div class="history-meta">
                <span class="history-date">📅 ${dateLabel}</span>
                <span class="history-student">🎒 ${studentDisplay}</span>
                <span class="history-pts">+${entry.pointsEarned} pts</span>
              </div>
              <div class="history-tags">${tagsHtml}</div>
              ${noteHtml}
            </div>
            ${photoHtml}
          </article>
        `;
      })
      .join("");
  }

  function renderSuggestions() {
    if (!els.suggestionsList) return;

    const list = state.suggestions || [];
    if (els.sugCounterBadge) {
      els.sugCounterBadge.textContent = `${list.length} alerta(s)`;
    }

    if (list.length === 0) {
      els.suggestionsList.innerHTML = `
        <div class="suggestion-empty">
          <strong>Nenhum alerta registrado ainda.</strong>
          <p>Notou algo que pode melhorar na escola? Preencha o formulário ao lado com sua proposta de solução e ganhe +10 pontos!</p>
        </div>
      `;
      return;
    }

    const sorted = [...list].sort((a, b) =>
      (b.savedAt || "").localeCompare(a.savedAt || "")
    );

    els.suggestionsList.innerHTML = sorted
      .map((sug) => {
        const authorDisplay = escapeHtml(sug.studentName || "Estudante");
        const dateLabel = formatDateBR(sug.date, sug.savedAt);
        const subjectHtml = escapeHtml(sug.subject || "Sem assunto");
        const altHtml = escapeHtml(sug.alternative || "Sem solução indicada");

        const hasSafePhoto =
          typeof sug.photoDataUrl === "string" && sug.photoDataUrl.startsWith("data:image/");

        const photoHtml = hasSafePhoto
          ? `<button
              type="button"
              class="history-photo-btn"
              data-action="zoom-sug-photo"
              data-sug-id="${escapeHtml(sug.id)}"
              title="Clique para ampliar a foto do problema"
            >
              <img src="${sug.photoDataUrl}" alt="Foto do alerta: ${subjectHtml}" />
            </button>`
          : `<div class="history-no-photo">Sem foto anexada</div>`;

        return `
          <article class="suggestion-card">
            <div>
              <div class="suggestion-meta">
                <span class="suggestion-date">💡 ${dateLabel}</span>
                <span class="suggestion-author">🎒 ${authorDisplay}</span>
                <span class="suggestion-pts-badge">+10 pts</span>
              </div>
              <h4 class="suggestion-subject">⚠️ Problema: ${subjectHtml}</h4>
              <div class="suggestion-solution-box">
                <strong>🌱 Solução Proposta:</strong>
                ${altHtml}
              </div>
            </div>
            ${photoHtml}
          </article>
        `;
      })
      .join("");
  }

  function showFeedback(message, type) {
    if (!els.formFeedback) return;
    els.formFeedback.textContent = message;
    els.formFeedback.className = `form-feedback ${type || ""}`;
  }

  function showSugFeedback(message, type) {
    if (!els.sugFormFeedback) return;
    els.sugFormFeedback.textContent = message;
    els.sugFormFeedback.className = `form-feedback ${type || ""}`;
  }

  let toastTimer = null;
  function showToast(message) {
    if (!els.toast) return;
    els.toast.textContent = message;
    els.toast.classList.remove("hidden");
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      els.toast.classList.add("hidden");
    }, 4200);
  }

  // Comprime imagens no próprio navegador para caber facilmente no localStorage
  function compressImage(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error("Não foi possível ler o arquivo da imagem."));
      reader.onload = () => {
        const img = new Image();
        img.onerror = () => reject(new Error("Arquivo de imagem corrompido ou inválido."));
        img.onload = () => {
          const maxSide = 640;
          let { width, height } = img;
          if (width > maxSide || height > maxSide) {
            if (width >= height) {
              height = Math.round((height * maxSide) / width);
              width = maxSide;
            } else {
              width = Math.round((width * maxSide) / height);
              height = maxSide;
            }
          }
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL("image/jpeg", 0.72);
          resolve(dataUrl);
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

  async function handlePhotoSelected(file) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showFeedback("Por favor, selecione um arquivo de imagem válido (JPG, PNG ou WebP).", "error");
      return;
    }

    try {
      const compressedDataUrl = await compressImage(file);
      pendingPhoto = {
        dataUrl: compressedDataUrl,
        fileName: file.name,
      };
      els.previewImg.src = compressedDataUrl;
      els.photoFileName.textContent = file.name;
      els.uploadPlaceholder.classList.add("hidden");
      els.uploadPreview.classList.remove("hidden");
      showFeedback("", "");
    } catch (err) {
      showFeedback(err.message || "Erro ao processar a foto.", "error");
    }
  }

  function clearPendingPhoto() {
    pendingPhoto = null;
    if (els.photoInput) els.photoInput.value = "";
    if (els.previewImg) els.previewImg.src = "";
    if (els.photoFileName) els.photoFileName.textContent = "";
    if (els.uploadPreview) els.uploadPreview.classList.add("hidden");
    if (els.uploadPlaceholder) els.uploadPlaceholder.classList.remove("hidden");
  }

  async function handleSugPhotoSelected(file) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showSugFeedback("Por favor, selecione um arquivo de imagem válido (JPG, PNG ou WebP).", "error");
      return;
    }

    try {
      const compressedDataUrl = await compressImage(file);
      pendingSugPhoto = {
        dataUrl: compressedDataUrl,
        fileName: file.name,
      };
      els.sugPreviewImg.src = compressedDataUrl;
      els.sugPhotoFileName.textContent = file.name;
      els.sugUploadPlaceholder.classList.add("hidden");
      els.sugUploadPreview.classList.remove("hidden");
      showSugFeedback("", "");
    } catch (err) {
      showSugFeedback(err.message || "Erro ao processar a imagem.", "error");
    }
  }

  function clearPendingSugPhoto() {
    pendingSugPhoto = null;
    if (els.sugPhotoInput) els.sugPhotoInput.value = "";
    if (els.sugPreviewImg) els.sugPreviewImg.src = "";
    if (els.sugPhotoFileName) els.sugPhotoFileName.textContent = "";
    if (els.sugUploadPreview) els.sugUploadPreview.classList.add("hidden");
    if (els.sugUploadPlaceholder) els.sugUploadPlaceholder.classList.remove("hidden");
  }

  function bindEvents() {
    // Alternância de Abas: Check-list vs Alertas
    els.navTabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        const targetId = tab.dataset.tab;
        els.navTabs.forEach((t) => t.classList.remove("active"));
        tab.classList.add("active");

        els.tabPanes.forEach((pane) => {
          if (pane.id === targetId) {
            pane.classList.remove("hidden");
          } else {
            pane.classList.add("hidden");
          }
        });
      });
    });

    // Nome do aluno no começo do site (Opcional)
    if (els.studentName) {
      els.studentName.value = state.studentName || "";
      els.studentName.addEventListener("input", () => {
        state.studentName = els.studentName.value.trim();
        saveState();
        updateStudentNameUI();
      });
    }

    // Data inicial padrão: hoje
    if (els.entryDate) {
      els.entryDate.value = getTodayLocalISO();
    }

    // Filtros de Categoria no Check-list
    els.filterChips.forEach((chip) => {
      chip.addEventListener("click", () => {
        els.filterChips.forEach((c) => c.classList.remove("active"));
        chip.classList.add("active");
        activeFilter = chip.dataset.filter || "all";
        renderChecklist();
      });
    });

    // Check-list: marcar/desmarcar itens
    if (els.checklistGrid) {
      els.checklistGrid.addEventListener("change", (event) => {
        const target = event.target;
        if (!target.matches('input[data-action="toggle"]')) return;
        const id = target.dataset.id;
        if (target.checked) {
          if (!selectedQuantities.has(id)) {
            selectedQuantities.set(id, 1);
          }
        } else {
          selectedQuantities.delete(id);
        }
        renderChecklist();
        showFeedback("", "");
      });

      // Quantidades +/-
      els.checklistGrid.addEventListener("click", (event) => {
        const btn = event.target.closest("button[data-action]");
        if (!btn) return;
        const { action, id } = btn.dataset;
        const currentQty = selectedQuantities.get(id) || 0;

        if (action === "inc") {
          const nextQty = Math.min(99, currentQty === 0 ? 1 : currentQty + 1);
          selectedQuantities.set(id, nextQty);
          renderChecklist();
        } else if (action === "dec" && currentQty > 1) {
          selectedQuantities.set(id, currentQty - 1);
          renderChecklist();
        }
      });
    }

    // Upload de Foto de Reciclagem
    if (els.photoInput) {
      els.photoInput.addEventListener("change", (event) => {
        const file = event.target.files && event.target.files[0];
        handlePhotoSelected(file);
      });
    }

    if (els.uploadDropzone) {
      els.uploadDropzone.addEventListener("dragover", (event) => {
        event.preventDefault();
        els.uploadDropzone.classList.add("dragover");
      });
      els.uploadDropzone.addEventListener("dragleave", () => {
        els.uploadDropzone.classList.remove("dragover");
      });
      els.uploadDropzone.addEventListener("drop", (event) => {
        event.preventDefault();
        els.uploadDropzone.classList.remove("dragover");
        const file = event.dataTransfer && event.dataTransfer.files[0];
        handlePhotoSelected(file);
      });
    }

    if (els.removePhotoBtn) {
      els.removePhotoBtn.addEventListener("click", clearPendingPhoto);
    }

    // Envio do formulário de Reciclagem (Check-list)
    if (els.recycleForm) {
      els.recycleForm.addEventListener("submit", (event) => {
        event.preventDefault();

        if (selectedQuantities.size === 0) {
          showFeedback("Marque pelo menos 1 item no check-list antes de registrar!", "error");
          return;
        }

        const effectiveName = getDisplayStudentName();
        const dateVal = (els.entryDate && els.entryDate.value) || getTodayLocalISO();
        const prevStats = computeStats();
        const prevCompletedIds = new Set(
          prevStats.missionsStatus.filter((m) => m.completed).map((m) => m.id)
        );

        const chosenItems = [];
        let pointsEarned = 0;

        for (const item of CHECKLIST_ITEMS) {
          const qty = selectedQuantities.get(item.id) || 0;
          if (qty > 0) {
            chosenItems.push({
              id: item.id,
              name: item.name,
              category: item.category,
              icon: item.icon,
              quantity: qty,
              unitPoints: item.points,
            });
            pointsEarned += item.points * qty;
          }
        }

        const newEntry = {
          id: `reg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          date: dateVal,
          savedAt: new Date().toISOString(),
          studentName: effectiveName,
          notes: (els.entryNotes && els.entryNotes.value.trim()) || "",
          items: chosenItems,
          pointsEarned,
          photoDataUrl: pendingPhoto ? pendingPhoto.dataUrl : null,
          photoFileName: pendingPhoto ? pendingPhoto.fileName : null,
        };

        state.entries.push(newEntry);
        if (!saveState()) {
          state.entries.pop();
          return;
        }

        // Resetar campos de envio
        selectedQuantities.clear();
        if (els.entryNotes) els.entryNotes.value = "";
        clearPendingPhoto();
        if (els.entryDate) els.entryDate.value = getTodayLocalISO();

        const nextStats = computeStats();
        const newlyUnlocked = nextStats.missionsStatus.filter(
          (m) => m.completed && !prevCompletedIds.has(m.id)
        );

        renderChecklist();
        renderDashboard(nextStats);

        if (newlyUnlocked.length > 0) {
          const names = newlyUnlocked.map((m) => `${m.icon} ${m.title}`).join(", ");
          showFeedback(`Registro salvo! Você ganhou +${pointsEarned} pts e completou: ${names}!`, "success");
          showToast(`Parabéns! +${pointsEarned} pts ganhos e nova missão desbloqueada!`);
        } else {
          showFeedback(`Registro salvo localmente! Você ganhou +${pointsEarned} pontos.`, "success");
          showToast(`Boa! +${pointsEarned} pontos acumulados com sucesso!`);
        }
      });
    }

    // Contador de caracteres do assunto do alerta
    if (els.sugSubject && els.sugSubjectCounter) {
      els.sugSubject.addEventListener("input", () => {
        const len = els.sugSubject.value.length;
        els.sugSubjectCounter.textContent = `${len}/180`;
      });
    }

    // Botões de tags rápidas de problemas na escola
    if (els.quickProblemTags && els.sugSubject) {
      els.quickProblemTags.addEventListener("click", (event) => {
        const btn = event.target.closest(".quick-tag-btn");
        if (!btn) return;
        const text = btn.dataset.text;
        if (!text) return;

        if (els.sugSubject.value.trim().length > 0) {
          els.sugSubject.value += ` | ${text}`;
        } else {
          els.sugSubject.value = text;
        }
        els.sugSubject.focus();
        if (els.sugSubjectCounter) {
          els.sugSubjectCounter.textContent = `${els.sugSubject.value.length}/180`;
        }
      });
    }

    // Upload de Foto na Aba de Alertas & Soluções
    if (els.sugPhotoInput) {
      els.sugPhotoInput.addEventListener("change", (event) => {
        const file = event.target.files && event.target.files[0];
        handleSugPhotoSelected(file);
      });
    }

    if (els.sugUploadDropzone) {
      els.sugUploadDropzone.addEventListener("dragover", (event) => {
        event.preventDefault();
        els.sugUploadDropzone.classList.add("dragover");
      });
      els.sugUploadDropzone.addEventListener("dragleave", () => {
        els.sugUploadDropzone.classList.remove("dragover");
      });
      els.sugUploadDropzone.addEventListener("drop", (event) => {
        event.preventDefault();
        els.sugUploadDropzone.classList.remove("dragover");
        const file = event.dataTransfer && event.dataTransfer.files[0];
        handleSugPhotoSelected(file);
      });
    }

    if (els.sugRemovePhotoBtn) {
      els.sugRemovePhotoBtn.addEventListener("click", clearPendingSugPhoto);
    }

    // Envio do Formulário de Alerta com Solução
    if (els.suggestionForm) {
      els.suggestionForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const subject = (els.sugSubject && els.sugSubject.value.trim()) || "";
        const alternative = (els.sugAlternative && els.sugAlternative.value.trim()) || "";

        if (!subject) {
          showSugFeedback("Por favor, descreva qual é o problema ou situação na escola.", "error");
          if (els.sugSubject) els.sugSubject.focus();
          return;
        }

        if (!alternative) {
          showSugFeedback("Por favor, proponha uma solução ou alternativa para resolver o problema.", "error");
          if (els.sugAlternative) els.sugAlternative.focus();
          return;
        }

        const effectiveName = getDisplayStudentName();
        const prevStats = computeStats();
        const prevCompletedIds = new Set(
          prevStats.missionsStatus.filter((m) => m.completed).map((m) => m.id)
        );

        const newSuggestion = {
          id: `sug_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          date: getTodayLocalISO(),
          savedAt: new Date().toISOString(),
          studentName: effectiveName,
          subject,
          alternative,
          photoDataUrl: pendingSugPhoto ? pendingSugPhoto.dataUrl : null,
          photoFileName: pendingSugPhoto ? pendingSugPhoto.fileName : null,
        };

        if (!Array.isArray(state.suggestions)) {
          state.suggestions = [];
        }

        state.suggestions.push(newSuggestion);
        if (!saveState()) {
          state.suggestions.pop();
          return;
        }

        // Limpar campos
        if (els.sugSubject) els.sugSubject.value = "";
        if (els.sugSubjectCounter) els.sugSubjectCounter.textContent = "0/180";
        if (els.sugAlternative) els.sugAlternative.value = "";
        clearPendingSugPhoto();

        const nextStats = computeStats();
        const newlyUnlocked = nextStats.missionsStatus.filter(
          (m) => m.completed && !prevCompletedIds.has(m.id)
        );

        renderDashboard(nextStats);

        if (newlyUnlocked.length > 0) {
          const names = newlyUnlocked.map((m) => `${m.icon} ${m.title}`).join(", ");
          showSugFeedback(`Alerta registrado no mural! Você ganhou +10 pontos e completou: ${names}!`, "success");
          showToast(`💡 Alerta salvo no mural! +10 pontos e nova missão conquistada!`);
        } else {
          showSugFeedback("Alerta com solução registrado no mural da escola! Você ganhou +10 pontos.", "success");
          showToast("💡 Alerta salvo no mural! +10 pontos acumulados com sucesso!");
        }
      });
    }

    // Modal de Imagem no Histórico de Reciclagem
    if (els.historyList) {
      els.historyList.addEventListener("click", (event) => {
        const btn = event.target.closest('button[data-action="zoom-photo"]');
        if (!btn) return;
        const entry = state.entries.find((e) => e.id === btn.dataset.entryId);
        if (!entry || !entry.photoDataUrl) return;
        els.modalImage.src = entry.photoDataUrl;
        els.modalCaption.textContent = `${entry.studentName} • ${formatDateBR(
          entry.date,
          entry.savedAt
        )}`;
        els.imageModal.classList.remove("hidden");
      });
    }

    // Modal de Imagem no Mural de Alertas
    if (els.suggestionsList) {
      els.suggestionsList.addEventListener("click", (event) => {
        const btn = event.target.closest('button[data-action="zoom-sug-photo"]');
        if (!btn) return;
        const sug = (state.suggestions || []).find((s) => s.id === btn.dataset.sugId);
        if (!sug || !sug.photoDataUrl) return;
        els.modalImage.src = sug.photoDataUrl;
        els.modalCaption.textContent = `Alerta de ${sug.studentName}: ${sug.subject}`;
        els.imageModal.classList.remove("hidden");
      });
    }

    const closeModal = () => {
      if (els.imageModal) els.imageModal.classList.add("hidden");
      if (els.modalImage) els.modalImage.src = "";
    };

    if (els.modalCloseBtn) els.modalCloseBtn.addEventListener("click", closeModal);
    if (els.modalBackdrop) els.modalBackdrop.addEventListener("click", closeModal);
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && els.imageModal && !els.imageModal.classList.contains("hidden")) {
        closeModal();
      }
    });

    // Exportar Dados em JSON
    if (els.exportBtn) {
      els.exportBtn.addEventListener("click", () => {
        const stats = computeStats();
        const payload = {
          projeto: "EcoEscola Emygdio: Missão Sustentabilidade",
          exportadoEm: new Date().toISOString(),
          estudante: getDisplayStudentName(),
          pontuacaoTotal: stats.totalPoints,
          itensTotais: stats.totalItems,
          missoesConcluidas: stats.completedMissions,
          alertasComSolucao: (state.suggestions || []).map((s) => ({
            problema: s.subject,
            solucaoProposta: s.alternative,
            data: s.date,
            registradoEm: s.savedAt,
            estudante: s.studentName,
            anexouFoto: Boolean(s.photoDataUrl),
          })),
          registrosReciclagem: state.entries.map((e) => ({
            data: e.date,
            registradoEm: e.savedAt,
            estudante: e.studentName,
            pontos: e.pointsEarned,
            observacao: e.notes,
            anexouFoto: Boolean(e.photoDataUrl),
            itens: e.items,
          })),
        };

        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `ecoescola-emygdio-${getTodayLocalISO()}.json`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        showToast("Dados exportados em arquivo JSON com sucesso!");
      });
    }

    // Limpar Dados Locais
    if (els.clearDataBtn) {
      els.clearDataBtn.addEventListener("click", () => {
        const hasEntries = state.entries && state.entries.length > 0;
        const hasSug = state.suggestions && state.suggestions.length > 0;
        if (!hasEntries && !hasSug && !state.studentName) {
          showToast("Não há dados locais salvos para limpar.");
          return;
        }

        const ok = window.confirm(
          "Tem certeza que deseja apagar todos os registros, fotos e pontos salvos neste navegador?"
        );
        if (!ok) return;

        state = { studentName: "", entries: [], suggestions: [] };
        localStorage.removeItem(STORAGE_KEY);
        if (els.studentName) els.studentName.value = "";
        selectedQuantities.clear();
        clearPendingPhoto();
        clearPendingSugPhoto();
        renderChecklist();
        renderDashboard(computeStats());
        showToast("Dados locais apagados com sucesso.");
      });
    }
  }

  // Inicialização
  bindEvents();
  renderChecklist();
  renderDashboard(computeStats());
})();
