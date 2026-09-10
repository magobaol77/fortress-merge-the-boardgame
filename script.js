const rows = 8;
const cols = 7;

const buildingShapes = {
  reggia: [[1, 0], [0, 1], [1, 1], [2, 1], [1, 2]],
  cannoni: [[0, 0], [1, 0], [0, 1], [0, 2], [1, 2]],
  segheria: [[0, 0], [1, 0]],
  torre: [[0, 0]],
  caserma: [[0, 0], [1, 0], [0, 1], [1, 1]],
  cavalleria: [[0, 0], [1, 0], [2, 0], [1, 1]],
  muraglia: [[0, 0], [1, 0], [2, 0]],
  capanna: [[0, 0]],
  casaCavaliere: [[0, 0]],
  casaArciere: [[0, 0]],
};

const buildings = [
  {
    id: "reggia",
    name: "Reggia",
    short: "REG",
    color: "#d76f4d",
    shape: "Croce, 5 caselle",
    image: "1.0/Reggia3.png",
    prosperity: 4,
    effect: "Ottieni 2 PV",
    apply: () => {
      game.vp += 2;
      addLog("Reggia: +2 PV");
    },
  },
  {
    id: "cannoni",
    name: "Cannoni",
    short: "CAN",
    color: "#6b83d8",
    shape: "C, 5 caselle",
    image: "1.0/Cannoni1.png",
    prosperity: 3,
    effect: "Effettua 2 Colpi",
    apply: () => {
      game.pendingHits += 2;
      addLog("Cannoni: 2 Colpi disponibili");
    },
  },
  {
    id: "segheria",
    name: "Segheria",
    short: "SEG",
    color: "#6baa4f",
    shape: "Linea, 2 caselle",
    image: "1.0/Segheria3.png",
    prosperity: 2,
    effect: "Rimuovi 3 Boschi",
    apply: () => {
      game.pendingForestRemovals += 3;
      addLog("Segheria: 3 rimozioni Bosco disponibili");
    },
  },
  {
    id: "torre",
    name: "Torre",
    short: "TOR",
    color: "#d7b64d",
    shape: "Singola, 1 casella",
    image: "1.0/Torre.png",
    prosperity: 4,
    effect: "Riattiva edifici adiacenti",
    apply: () => {
      game.pendingReactivations += 1;
      addLog("Torre: 1 riattivazione da assegnare");
    },
  },
  {
    id: "caserma",
    name: "Caserma",
    short: "CAS",
    color: "#b779d9",
    shape: "Quadrato 2x2, 4 caselle",
    image: "1.0/Caserma.png",
    prosperity: 2,
    effect: "Effettua 1 Colpo",
    apply: () => {
      game.pendingHits += 1;
      addLog("Caserma: 1 Colpo disponibile");
    },
  },
  {
    id: "cavalleria",
    name: "Cavalleria",
    short: "CAV",
    color: "#4db4b0",
    shape: "T, 4 caselle",
    image: "1.0/Cavalleria.png",
    prosperity: 2,
    effect: "Effettua 2 Respingimenti",
    apply: () => {
      game.pendingPushes += 2;
      addLog("Cavalleria: 2 Respingimenti disponibili");
    },
  },
  {
    id: "muraglia",
    name: "Muraglia",
    short: "MUR",
    color: "#9ca3af",
    shape: "Linea, 3 caselle",
    image: "1.0/Muraglia.png",
    prosperity: 1,
    effect: "La piazzi dove vuoi. Se un mostro la raggiunge, viene rimossa senza penalita",
    apply: () => {
      addLog("Muraglia piazzata: puo bloccare un passo del mostro");
    },
  },
  {
    id: "capanna",
    name: "Capanna del boscaiolo",
    short: "BOS",
    color: "#8fbd63",
    shape: "Singola, 1 casella",
    prosperity: 2,
    effect: "Rimuovi 1 Bosco",
    reserveOnly: true,
    apply: () => {
      game.pendingForestRemovals += 1;
      addLog("Capanna del boscaiolo: 1 rimozione Bosco disponibile");
    },
  },
  {
    id: "casaCavaliere",
    name: "Casa del cavaliere",
    short: "CAV1",
    color: "#4da1c8",
    shape: "Singola, 1 casella",
    prosperity: 2,
    effect: "Effettua 1 Respingimento",
    reserveOnly: true,
    apply: () => {
      game.pendingPushes += 1;
      addLog("Casa del cavaliere: 1 Respingimento disponibile");
    },
  },
  {
    id: "casaArciere",
    name: "Casa dell'arciere",
    short: "ARC",
    color: "#c78945",
    shape: "Singola, 1 casella",
    prosperity: 3,
    effect: "Effettua 1 Colpo",
    reserveOnly: true,
    apply: () => {
      game.pendingHits += 1;
      addLog("Casa dell'arciere: 1 Colpo disponibile");
    },
  },
];

const reserveBuildingIds = ["capanna", "casaCavaliere", "casaArciere"];

const objectiveRewards = [2, 4, 6];
const objectiveDeck = [
  {
    id: "bonifica",
    name: "Bonifica",
    statLabel: "Boschi",
    thresholds: [7, 11, 15],
    getValue: (player) => player.forestsRemoved,
  },
  {
    id: "caccia",
    name: "Caccia",
    statLabel: "Mostri",
    thresholds: [1, 2, 3],
    getValue: (player) => player.monstersKilled,
  },
  {
    id: "maestria",
    name: "Maestria",
    statLabel: "Merge",
    thresholds: [1, 2, 3],
    getValue: (player) => player.mergesMade,
  },
  {
    id: "espansione",
    name: "Espansione",
    statLabel: "Righe",
    thresholds: [1, 2, 3],
    getValue: (player) => completedRowCount(player),
  },
  {
    id: "prestigio",
    name: "Prestigio",
    statLabel: "PV",
    thresholds: [5, 8, 11],
    getValue: (player) => player.vp,
  },
];

const enemies = {
  left: {
    name: "Troll",
    colStart: 0,
    width: 2,
    level: 1,
    position: 0,
    damage: 0,
    diceByLevel: [[1, 2], [1, 2, 3]],
  },
  center: {
    name: "Gigante",
    colStart: 2,
    width: 3,
    level: 1,
    position: 0,
    damage: 0,
    diceByLevel: [[3, 4], [3, 4]],
  },
  right: {
    name: "Troll",
    colStart: 5,
    width: 2,
    level: 1,
    position: 0,
    damage: 0,
    diceByLevel: [[5, 6], [4, 5, 6]],
  },
};

const game = {
  round: 1,
  mode: "solo",
  configuredPlayerCount: 1,
  playerTypes: ["human"],
  playerNames: ["G1"],
  currentPlayerIndex: 0,
  viewPlayerIndex: 0,
  players: [],
  deck: [],
  marketSlots: [],
  tokenIndex: 0,
  tokenAtCenter: false,
  selected: null,
  over: false,
  botRunning: false,
  specialRunning: false,
  attackRunning: false,
  activeObjectives: [],
  started: false,
  recordsSaved: false,
};

Object.defineProperties(game, {
  prosperity: {
    get: () => activePlayer().prosperity,
    set: (value) => { activePlayer().prosperity = value; },
  },
  vp: {
    get: () => activePlayer().vp,
    set: (value) => { activePlayer().vp = value; },
  },
  pendingHits: {
    get: () => activePlayer().pendingHits,
    set: (value) => { activePlayer().pendingHits = value; },
  },
  pendingPushes: {
    get: () => activePlayer().pendingPushes,
    set: (value) => { activePlayer().pendingPushes = value; },
  },
  pendingReactivations: {
    get: () => activePlayer().pendingReactivations,
    set: (value) => { activePlayer().pendingReactivations = value; },
  },
  pendingForestRemovals: {
    get: () => activePlayer().pendingForestRemovals,
    set: (value) => { activePlayer().pendingForestRemovals = value; },
  },
  pendingEffects: {
    get: () => activePlayer().pendingEffects,
    set: (value) => { activePlayer().pendingEffects = value; },
  },
  pendingReactivationSources: {
    get: () => activePlayer().pendingReactivationSources,
    set: (value) => { activePlayer().pendingReactivationSources = value; },
  },
  pendingLevelUps: {
    get: () => activePlayer().pendingLevelUps,
    set: (value) => { activePlayer().pendingLevelUps = value; },
  },
  lastAttackRolls: {
    get: () => activePlayer().lastAttackRolls,
    set: (value) => { activePlayer().lastAttackRolls = value; },
  },
  finalScored: {
    get: () => activePlayer().finalScored,
    set: (value) => { activePlayer().finalScored = value; },
  },
  nextBuildingId: {
    get: () => activePlayer().nextBuildingId,
    set: (value) => { activePlayer().nextBuildingId = value; },
  },
  buildingsOnBoard: {
    get: () => activePlayer().buildingsOnBoard,
    set: (value) => { activePlayer().buildingsOnBoard = value; },
  },
  forests: {
    get: () => activePlayer().forests,
    set: (value) => { activePlayer().forests = value; },
  },
});

const initialForests = [
  [0, 3], [0, 6],
  [1, 1], [1, 5], [1, 6],
  [2, 0], [2, 1], [2, 2],
  [3, 4], [3, 6],
  [4, 0], [4, 2], [4, 6],
  [6, 0], [6, 6],
  [7, 0], [7, 6],
];

const attackThresholds = [
  { value: 5, dice: 1, resolved: false },
  { value: 9, dice: 1, resolved: false },
  { value: 13, dice: 2, resolved: false },
  { value: 16, dice: 2, resolved: false },
  { value: 19, dice: 2, resolved: false },
  { value: 23, dice: 3, resolved: false },
  { value: 26, dice: 3, resolved: false },
  { value: 29, dice: 3, resolved: false },
  { value: 33, dice: 4, resolved: false },
];

const levelUpThresholds = [];

const endGameThreshold = { value: 34, resolved: false };
const specialTrackLength = 4;

const zooms = {
  market: 100,
  personal: 50,
};

function cloneEnemies() {
  return Object.fromEntries(Object.entries(enemies).map(([key, enemy]) => [
    key,
    {
      ...enemy,
      level: 1,
      position: 1,
      damage: 0,
      diceByLevel: enemy.diceByLevel.map((dice) => [...dice]),
    },
  ]));
}

function cloneThresholds(thresholds) {
  return thresholds.map((threshold) => ({ ...threshold, resolved: false }));
}

function fixedBotName(index) {
  const botNumber = game.playerTypes
    .slice(0, index + 1)
    .filter((type) => type === "bot").length;
  return `Automa ${Math.max(1, botNumber)}`;
}

function setupPlayerName(index, type) {
  if (type === "bot") return fixedBotName(index);
  return (game.playerNames[index] || "").trim() || `G${index + 1}`;
}

function createPlayerState(index) {
  const type = game.playerTypes[index] ?? (index === 0 ? "human" : "bot");
  return {
    id: index + 1,
    name: setupPlayerName(index, type),
    type,
    prosperity: 0,
    vp: 0,
    objectiveVp: 0,
    dead: false,
    actionDone: false,
    destroyedBuildings: 0,
    fortressVp: 0,
    invasionMalus: 0,
    forestsRemoved: 0,
    monstersKilled: 0,
    mergesMade: 0,
    objectiveClaimedThisTurn: false,
    claimedObjectives: {},
    finalReached: false,
    specialStep: 0,
    completedRows: new Set(),
    completedCols: new Set(),
    pendingHits: 0,
    pendingPushes: 0,
    pendingReactivations: 0,
    pendingForestRemovals: 0,
    pendingEffects: [],
    pendingAttacks: [],
    pendingReactivationSources: [],
    reactivatedTowersThisTurn: new Set(),
    pendingLevelUps: 0,
    lastAttackRolls: [],
    finalScored: false,
    nextBuildingId: 1,
    buildingsOnBoard: [],
    forests: new Set(initialForests.map(([row, col]) => cellKey(row, col))),
    enemies: cloneEnemies(),
    attackThresholds: cloneThresholds(attackThresholds),
    levelUpThresholds: cloneThresholds(levelUpThresholds),
    endGameResolved: false,
  };
}

function activePlayer() {
  return game.players[game.currentPlayerIndex] ?? game.players[0];
}

function viewedPlayer() {
  return game.players[game.viewPlayerIndex] ?? activePlayer();
}

function isViewingActivePlayer() {
  return game.viewPlayerIndex === game.currentPlayerIndex;
}

function currentEnemies() {
  return activePlayer().enemies;
}

function viewedEnemies() {
  return viewedPlayer().enemies;
}

function renderSetup() {
  document.querySelectorAll("[data-player-count]").forEach((button) => {
    const count = Number(button.dataset.playerCount);
    button.classList.toggle("selected", count === game.configuredPlayerCount);
  });
  playerSetup.innerHTML = Array.from({ length: game.configuredPlayerCount }, (_, index) => {
    const type = game.playerTypes[index] ?? (index === 0 ? "human" : "bot");
    const name = setupPlayerName(index, type);
    const disabledHuman = game.configuredPlayerCount === 1 && index === 0 ? "disabled" : "";
    const disabledName = type === "bot" ? "disabled" : "";
    return `
      <label class="player-type-row">
        <span>G${index + 1}</span>
        <input type="text" data-player-name="${index}" value="${escapeHtml(name)}" placeholder="Nome" ${disabledName}>
        <select data-player-type="${index}" ${disabledHuman}>
          <option value="human" ${type === "human" ? "selected" : ""}>Giocatore</option>
          <option value="bot" ${type === "bot" ? "selected" : ""}>Automa</option>
        </select>
      </label>
    `;
  }).join("");
}

const roundValue = document.querySelector("#roundValue");
const playerValue = document.querySelector("#playerValue");
const prosperityValue = document.querySelector("#prosperityValue");
const vpValue = document.querySelector("#vpValue");
const objectiveValue = document.querySelector("#objectiveValue");
const destroyedValue = document.querySelector("#destroyedValue");
const forestValue = document.querySelector("#forestValue");
const killValue = document.querySelector("#killValue");
const rowValue = document.querySelector("#rowValue");
const mergeValue = document.querySelector("#mergeValue");
const hitValue = document.querySelector("#hitValue");
const pushValue = document.querySelector("#pushValue");
const cutValue = document.querySelector("#cutValue");
const levelValue = document.querySelector("#levelValue");
const diceValue = document.querySelector("#diceValue");
const marketTrack = document.querySelector("#marketTrack");
const prosperityTrack = document.querySelector("#prosperityTrack");
const prosperityTrackSide = document.querySelector("#prosperityTrackSide");
const reserveMarket = document.querySelector("#reserveMarket");
const deckInfo = document.querySelector("#deckInfo");
const tileLibrary = document.querySelector("#tileLibrary");
const playerSummary = document.querySelector("#playerSummary");
const objectivesPanel = document.querySelector("#objectivesPanel");
const playerSetup = document.querySelector("#playerSetup");
const startGame = document.querySelector("#startGame");
const startScreen = document.querySelector("#startScreen");
const gameScreen = document.querySelector("#gameScreen");
const highscoreList = document.querySelector("#highscoreList");
const clearRecords = document.querySelector("#clearRecords");
const returnToMenu = document.querySelector("#returnToMenu");
const abandonGame = document.querySelector("#abandonGame");
const log = document.querySelector("#eventLog");
const personalStage = document.querySelector("#personalStage");
const personalZoomLabel = document.querySelector("#personalZoomLabel");
const boardGrid = document.querySelector("#boardGrid");
const monsterLayer = document.querySelector("#monsterLayer");
const selectedTool = document.querySelector("#selectedTool");
const confirmPlacement = document.querySelector("#confirmPlacement");
const destroyBuilding = document.querySelector("#destroyBuilding");
const passTurn = document.querySelector("#passTurn");

function cellKey(row, col) {
  return `${row},${col}`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function getBuilding(id) {
  return buildings.find((item) => item.id === id);
}

function rollDie() {
  return Math.floor(Math.random() * 6) + 1;
}

function activeDice(enemy) {
  return enemy.diceByLevel[enemy.level - 1];
}

function addLog(message) {
  const item = document.createElement("li");
  item.textContent = message;
  log.prepend(item);
}

function shuffle(items) {
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function setupObjectives() {
  game.activeObjectives = shuffle(objectiveDeck).slice(0, 3).map((objective) => ({
    ...objective,
    claimed: objective.thresholds.map(() => null),
  }));
}

function completedRowCount(player = activePlayer()) {
  let completed = 0;
  for (let row = 0; row < rows; row += 1) {
    const filled = Array.from({ length: cols }, (_, col) => buildingAt(row, col, player)).every(Boolean);
    if (filled) completed += 1;
  }
  return completed;
}

function totalObjectiveVp(player = activePlayer()) {
  return Object.values(player.claimedObjectives).reduce((total, claim) => total + claim.points, 0);
}

function canClaimObjective(objective, levelIndex, player = activePlayer()) {
  if (!player || player.dead || !player.actionDone || hasPendingChoices(player) || player.objectiveClaimedThisTurn || player.claimedObjectives[objective.id]) return false;
  if (objective.claimed[levelIndex]) return false;
  return objective.getValue(player) >= objective.thresholds[levelIndex];
}

function claimObjective(objectiveId, levelIndex, playerIndex = game.currentPlayerIndex) {
  const player = game.players[playerIndex];
  const objective = game.activeObjectives.find((item) => item.id === objectiveId);
  if (!player || !objective || game.over) return false;
  if (player.type === "human" && (!player.actionDone || hasPendingChoices(player))) {
    addLog("Puoi reclamare un obiettivo a fine turno, dopo aver risolto la mossa");
    renderAll();
    return false;
  }
  if (!canClaimObjective(objective, levelIndex, player)) {
    addLog("Questo obiettivo non e reclamabile");
    renderAll();
    return false;
  }
  const claim = {
    objectiveId,
    level: levelIndex + 1,
    threshold: objective.thresholds[levelIndex],
    points: objectiveRewards[levelIndex],
  };
  objective.claimed[levelIndex] = player.id;
  player.claimedObjectives[objective.id] = claim;
  player.objectiveVp = totalObjectiveVp(player);
  player.objectiveClaimedThisTurn = true;
  addLog(`${player.name} reclama ${objective.name} livello ${claim.level}: ${claim.points} PV finali`);
  renderAll();
  return true;
}

function bestObjectiveClaim(player = activePlayer()) {
  const claims = [];
  game.activeObjectives.forEach((objective) => {
    objective.thresholds.forEach((threshold, levelIndex) => {
      if (canClaimObjective(objective, levelIndex, player)) {
        claims.push({ objective, levelIndex, points: objectiveRewards[levelIndex], threshold });
      }
    });
  });
  return claims.sort((first, second) => (
    second.points - first.points || second.threshold - first.threshold
  ))[0] ?? null;
}

function loadRecords() {
  try {
    return JSON.parse(localStorage.getItem("fortressMergeRecords") || "[]");
  } catch {
    return [];
  }
}

function saveRecords(records) {
  localStorage.setItem("fortressMergeRecords", JSON.stringify(records.slice(0, 50)));
}

function playerScoreBreakdown(player) {
  const objectives = totalObjectiveVp(player);
  const destroyedMalus = player.destroyedBuildings;
  const invasionMalus = player.invasionMalus;
  return {
    objectives,
    kills: player.monstersKilled,
    merges: player.mergesMade,
    fortresses: player.fortressVp,
    destroyedMalus,
    invasionMalus,
    totalMalus: destroyedMalus + invasionMalus,
  };
}

function saveGameRecords(reason) {
  if (game.recordsSaved) return;
  const now = new Date();
  const entries = game.players.map((player) => {
    const breakdown = playerScoreBreakdown(player);
    return {
      id: `${now.getTime()}-${player.id}`,
      date: now.toLocaleDateString("it-IT"),
      name: player.name,
      mode: game.mode === "solo" ? "Solitario" : `${game.configuredPlayerCount} giocatori`,
      type: player.type === "bot" ? "Automa" : "Giocatore",
      score: player.vp,
      dead: player.dead,
      reason,
      breakdown,
    };
  });
  const records = [...entries, ...loadRecords()].sort((first, second) => second.score - first.score);
  saveRecords(records);
  game.recordsSaved = true;
  renderHighscores();
}

function renderHighscores() {
  const records = loadRecords();
  if (!records.length) {
    highscoreList.innerHTML = `<p class="empty-records">Nessuna partita registrata</p>`;
    return;
  }
  highscoreList.innerHTML = records.slice(0, 12).map((record, index) => {
    const breakdown = record.breakdown ?? {};
    return `
      <article class="highscore-card ${index === 0 ? "best" : ""}">
        <header>
          <strong>${index + 1}. ${escapeHtml(record.name)}</strong>
          <span>${record.score} PV</span>
        </header>
        <p>${escapeHtml(record.mode)} | ${escapeHtml(record.type)} | ${escapeHtml(record.date)}${record.dead ? " | Morto" : ""}</p>
        <dl>
          <div><dt>Obiettivi</dt><dd>+${breakdown.objectives ?? 0}</dd></div>
          <div><dt>Uccisioni</dt><dd>+${breakdown.kills ?? 0}</dd></div>
          <div><dt>Merge</dt><dd>+${breakdown.merges ?? 0}</dd></div>
          <div><dt>Fortezze</dt><dd>+${breakdown.fortresses ?? 0}</dd></div>
          <div><dt>Malus</dt><dd>-${breakdown.totalMalus ?? 0} <small>${breakdown.destroyedMalus ?? 0}/${breakdown.invasionMalus ?? 0}</small></dd></div>
        </dl>
      </article>
    `;
  }).join("");
}

function showStartScreen() {
  if (game.started) {
    game.over = true;
    game.selected = null;
    game.botRunning = false;
    game.specialRunning = false;
    game.attackRunning = false;
  }
  game.started = false;
  startScreen.classList.remove("is-hidden");
  gameScreen.classList.add("is-hidden");
  renderSetup();
  renderHighscores();
}

function showGameScreen() {
  game.started = true;
  startScreen.classList.add("is-hidden");
  gameScreen.classList.remove("is-hidden");
}

function handleAbandonGame() {
  if (!game.started || game.over) return;
  if (!window.confirm("Abbandonare la partita in corso? Non verra salvata nel registro.")) return;
  game.recordsSaved = true;
  addLog("Partita abbandonata: nessun risultato salvato");
  showStartScreen();
}

function createTilePool() {
  return shuffle(buildings.filter((building) => !building.reserveOnly).flatMap((building) => (
    Array.from({ length: 10 }, (_, copyIndex) => ({
      tileId: `${building.id}-${copyIndex + 1}`,
      buildingId: building.id,
    }))
  )));
}

function drawTile() {
  return game.deck.pop() ?? null;
}

function setupMarketTrack() {
  game.deck = createTilePool();
  game.marketSlots = Array.from({ length: 16 }, () => null);
  game.tokenIndex = Math.floor(Math.random() * game.marketSlots.length);
  game.tokenAtCenter = false;
  game.marketSlots[game.tokenIndex] = { type: "token" };
  game.marketSlots.forEach((slot, index) => {
    if (!slot) game.marketSlots[index] = drawTile();
  });
}

function purchasableIndexes() {
  return [1, 2, 3, 4, 5, 6].map((offset) => (game.tokenIndex + offset) % game.marketSlots.length);
}

function isPurchasable(slotIndex) {
  const slot = game.marketSlots[slotIndex];
  return Boolean(slot && slot.type !== "token")
    && (game.tokenAtCenter || purchasableIndexes().includes(slotIndex));
}

function purchaseDistance(slotIndex) {
  return purchasableIndexes().indexOf(slotIndex) + 1;
}

function purchaseSurcharge(slotIndex) {
  if (game.tokenAtCenter) return 0;
  const distance = purchaseDistance(slotIndex);
  if (!distance || distance <= 3) return 0;
  return distance - 3;
}

function canChooseTileThisTurn() {
  const player = activePlayer();
  return Boolean(player && !game.over && !player.dead && !player.finalReached && !player.actionDone && !hasPendingChoices(player));
}

function canReceiveInvasion(player) {
  return Boolean(player && !player.dead && !player.finalReached && player.prosperity < endGameThreshold.value);
}

function placedCells(originRow, originCol, buildingId) {
  const shape = buildingShapes[buildingId];
  const bottomOffset = Math.max(...shape.map(([, y]) => y));
  return shape.map(([x, y]) => [originRow + y - bottomOffset, originCol + x]);
}

function buildingAt(row, col, player = activePlayer()) {
  return player.buildingsOnBoard.find((building) => (
    building.cells.some(([cellRow, cellCol]) => cellRow === row && cellCol === col)
  ));
}

function isAdjacentToKingdom(cells) {
  if (cells.some(([row]) => row === rows - 1)) return true;
  return cells.some(([row, col]) => {
    const neighbors = [[row - 1, col], [row + 1, col], [row, col - 1], [row, col + 1]];
    return neighbors.some(([nextRow, nextCol]) => buildingAt(nextRow, nextCol));
  });
}

function validatePlacement(cells, buildingId = game.selected?.buildingId) {
  if (cells.some(([row, col]) => row < 0 || row >= rows || col < 0 || col >= cols)) {
    return "La tessera esce dalla griglia";
  }
  if (cells.some(([row, col]) => game.forests.has(cellKey(row, col)))) {
    return "Non puoi piazzare sopra un Bosco";
  }
  if (cells.some(([row, col]) => buildingAt(row, col))) {
    return "C'e gia un edificio in quelle caselle";
  }
  if (buildingId !== "muraglia" && !isAdjacentToKingdom(cells)) {
    return "Devi piazzare adiacente alla riga di fondo o a una tua tessera";
  }
  return "";
}

function previewCells() {
  if (!game.selected?.preview || game.selected.mode !== "build") return [];
  return placedCells(game.selected.preview.row, game.selected.preview.col, game.selected.buildingId);
}

function isUpgradeableTarget(building) {
  if (!building || game.selected?.buildingId !== building.id || building.id === "muraglia") return false;
  const sameBuildings = buildingsById(building.id);
  return Boolean(building)
    && building.level < 3
    && sameBuildings.length >= 2
    && sameBuildings.some((otherBuilding) => otherBuilding.instanceId !== building.instanceId);
}

function buildingsById(buildingId) {
  return game.buildingsOnBoard.filter((building) => building.id === buildingId);
}

function mergeRemovalForSurvivor(survivor) {
  return buildingsById(survivor.id)
    .filter((building) => building.instanceId !== survivor.instanceId)
    .sort((first, second) => first.level - second.level || first.instanceId - second.instanceId)[0] ?? null;
}

function canMergeBuilding(buildingId) {
  const building = getBuilding(buildingId);
  if (!building || building.id === "muraglia") return false;
  return buildingsById(buildingId).length >= 2
    && buildingsById(buildingId).some((placedBuilding) => placedBuilding.level < 3);
}

function previewError() {
  if (game.selected?.mode === "forest") {
    if (!game.selected.preview) return "Scegli un Bosco";
    const key = cellKey(game.selected.preview.row, game.selected.preview.col);
    return game.forests.has(key) ? "" : "Scegli una casella Bosco";
  }
  if (game.selected?.mode === "merge") {
    if (!game.selected.preview) return "Scegli l'edificio da upgradare";
    const target = buildingAt(game.selected.preview.row, game.selected.preview.col);
    if (!target) return "Scegli un edificio gia piazzato";
    if (target.id === "muraglia") return "La Muraglia non puo fare Merge";
    if (target.id !== game.selected.buildingId) return "Scegli un edificio dello stesso tipo";
    if (buildingsById(target.id).length < 2) return `Servono due ${target.name} gia in plancia`;
    if (target.level >= 3) return `${target.name} e gia al livello massimo`;
    if (!mergeRemovalForSurvivor(target)) return `Serve un altro ${target.name} da rimuovere`;
    return "";
  }
  if (game.selected?.mode === "destroy") {
    if (!game.selected.preview) return "Scegli un edificio da distruggere";
    const target = buildingAt(game.selected.preview.row, game.selected.preview.col);
    return target ? "" : "Scegli un tuo edificio";
  }
  const cells = previewCells();
  return cells.length ? validatePlacement(cells) : "Scegli una casella";
}

function renderStats() {
  const player = activePlayer();
  roundValue.textContent = game.round;
  playerValue.textContent = player.name;
  prosperityValue.textContent = game.prosperity;
  vpValue.textContent = game.vp;
  objectiveValue.textContent = `+${player.objectiveVp}`;
  destroyedValue.textContent = `-${player.destroyedBuildings}`;
  forestValue.textContent = player.forestsRemoved;
  killValue.textContent = player.monstersKilled;
  rowValue.textContent = completedRowCount(player);
  mergeValue.textContent = player.mergesMade;
  hitValue.textContent = game.pendingEffects.filter((effect) => effect.type === "hit").length;
  pushValue.textContent = game.pendingEffects.filter((effect) => effect.type === "push").length;
  cutValue.textContent = game.pendingForestRemovals;
  levelValue.textContent = player.finalReached ? `${player.specialStep}/${specialTrackLength}` : "-";
  diceValue.textContent = game.lastAttackRolls.length ? game.lastAttackRolls.join(" ") : "-";
}

function renderObjectives() {
  const player = activePlayer();
  objectivesPanel.innerHTML = game.activeObjectives.map((objective) => {
    const value = objective.getValue(player);
    const alreadyClaimed = player.claimedObjectives[objective.id];
    const levels = objective.thresholds.map((threshold, levelIndex) => {
      const ownerId = objective.claimed[levelIndex];
      const owner = ownerId ? game.players.find((item) => item.id === ownerId) : null;
      const points = objectiveRewards[levelIndex];
      const canClaim = canClaimObjective(objective, levelIndex, player)
        && player.type === "human"
        && player.actionDone
        && !hasPendingChoices(player);
      return `
        <div class="objective-level ${owner ? "claimed" : ""} ${canClaim ? "claimable" : ""}">
          <span>${threshold} ${objective.statLabel}</span>
          <strong>${points} PV</strong>
          ${owner ? `<em>${escapeHtml(owner.name)}</em>` : canClaim ? `<button type="button" data-claim-objective="${objective.id}" data-claim-level="${levelIndex}">Reclama</button>` : "<em>Libero</em>"}
        </div>
      `;
    }).join("");
    return `
      <article class="objective-card ${alreadyClaimed ? "locked" : ""}">
        <header>
          <strong>${objective.name}</strong>
          <span>${value} ora${alreadyClaimed ? ` | preso +${alreadyClaimed.points}` : ""}</span>
        </header>
        <div class="objective-levels">${levels}</div>
      </article>
    `;
  }).join("");
}

function renderPlayerSummary() {
  const livePlayers = game.players.filter((player) => !player.dead);
  const bestScore = livePlayers.length ? Math.max(...livePlayers.map((player) => player.vp)) : null;
  playerSummary.innerHTML = game.players.map((player, index) => {
    const current = index === game.currentPlayerIndex;
    const viewed = index === game.viewPlayerIndex;
    const winner = game.over && !player.dead && player.vp === bestScore;
    const finalStatus = player.finalReached ? ` | Speciale ${player.specialStep}/${specialTrackLength}` : "";
    const objectiveStatus = player.finalScored ? `+${player.objectiveVp} Obiettivi conteggiati` : `+${player.objectiveVp} Obiettivi`;
    return `
      <button type="button" class="player-card ${current ? "current" : ""} ${viewed ? "viewed" : ""} ${player.dead ? "dead" : ""} ${winner ? "winner" : ""}" data-view-player="${index}">
        <strong>${escapeHtml(player.name)}${winner ? " vince" : current && !game.over ? " di turno" : ""}${viewed ? " | vista" : ""}</strong>
        <span>${player.dead ? "Morto" : "Vivo"}</span>
        <em>${player.vp} PV | ${objectiveStatus} | ${player.prosperity} Prosperita | -${player.destroyedBuildings} Distrutti${finalStatus}</em>
      </button>
    `;
  }).join("");
}

function renderDice(values, matchedValues = []) {
  return values.map((value) => {
    const matchClass = matchedValues.includes(value) ? " matched" : "";
    return `<span class="die${matchClass}">${value}</span>`;
  }).join("");
}

function renderMonstersOnBoard() {
  const player = viewedPlayer();
  const pendingEffectsOnViewed = isViewingActivePlayer() ? game.pendingEffects : [];
  monsterLayer.innerHTML = Object.entries(viewedEnemies()).map(([key, enemy]) => {
    const left = (enemy.colStart / cols) * 100;
    const width = (enemy.width / cols) * 100;
    const top = enemy.position <= 0 ? (-12.5 + enemy.position * 12.5) : ((enemy.position - 1) / rows) * 100;
    const levelClass = "";
    const targetClass = pendingEffectsOnViewed.some((effect) => effect.allowedEnemies.includes(key)) ? " can-target" : "";
    return `
      <button type="button" class="monster-token${levelClass}${targetClass}" data-level-board="${key}" style="left:${left}%; top:${top}%; width:${width}%;">
        <span class="monster-name">${enemy.name}</span>
        <span class="monster-damage">Danni ${enemy.damage}</span>
        <span class="monster-dice">${renderDice(activeDice(enemy), player.lastAttackRolls)}</span>
      </button>
    `;
  }).join("");
}

function renderBoardGrid() {
  const player = viewedPlayer();
  const canUseViewedBoard = isViewingActivePlayer();
  const cells = [];
  const upgradePreviewBuilding = canUseViewedBoard && game.selected?.mode === "merge" && game.selected.preview
    ? buildingAt(game.selected.preview.row, game.selected.preview.col, player)
    : null;
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const forest = player.forests.has(cellKey(row, col));
      const building = buildingAt(row, col, player);
      const classes = ["board-cell"];
      if (forest) classes.push("forest");
      if (building) classes.push("building", `level-${building.level}`);
      if (canUseViewedBoard && game.selected?.mode === "build") {
        const targetCells = placedCells(row, col, game.selected.buildingId);
        classes.push(validatePlacement(targetCells, game.selected.buildingId) ? "blocked-target" : "placeable-target");
      }
      if (canUseViewedBoard && game.selected?.mode === "forest") {
        classes.push(forest ? "forest-target" : "blocked-target");
      }
      if (canUseViewedBoard && game.selected?.mode === "merge") {
        classes.push(isUpgradeableTarget(building) ? "placeable-target" : "blocked-target");
      }
      if (canUseViewedBoard && game.selected?.mode === "destroy") {
        classes.push(building ? "placeable-target" : "blocked-target");
      }
      const preview = canUseViewedBoard && previewCells().some(([previewRow, previewCol]) => previewRow === row && previewCol === col);
      if (preview) classes.push(previewError() ? "preview-invalid" : "preview-valid");
      if (canUseViewedBoard && game.selected?.mode === "forest" && game.selected.preview?.row === row && game.selected.preview?.col === col) {
        classes.push(previewError() ? "preview-invalid" : "preview-valid");
      }
      if (canUseViewedBoard && game.selected?.mode === "merge" && upgradePreviewBuilding?.cells.some(([previewRow, previewCol]) => previewRow === row && previewCol === col)) {
        classes.push(previewError() ? "preview-invalid" : "preview-valid");
      }
      if (canUseViewedBoard && game.selected?.mode === "destroy" && building && game.selected.preview?.row === row && game.selected.preview?.col === col) {
        classes.push(previewError() ? "preview-invalid" : "preview-valid");
      }
      cells.push(`
        <button
          type="button"
          class="${classes.join(" ")}"
          style="${building ? `--building-color:${getBuilding(building.id).color}` : ""}"
          data-row="${row}"
          data-col="${col}"
          data-building="${building ? `${building.short} L${building.level}` : ""}"
          aria-label="Riga ${row + 1}, colonna ${col + 1}">
        </button>
      `);
    }
  }
  boardGrid.innerHTML = cells.join("");
}

function shapeBounds(shape) {
  return {
    width: Math.max(...shape.map(([x]) => x)) + 1,
    height: Math.max(...shape.map(([, y]) => y)) + 1,
  };
}

function renderPolyomino(building, compact = false) {
  const shape = buildingShapes[building.id];
  const { width, height } = shapeBounds(shape);
  const cells = shape.map(([x, y]) => `<span style="grid-column:${x + 1}; grid-row:${y + 1};"></span>`).join("");
  return `
    <div class="polyomino ${compact ? "compact" : ""}" style="--poly-color:${building.color}; --poly-cols:${width}; --poly-rows:${height};" aria-hidden="true">
      ${cells}
    </div>
  `;
}

function renderBuildingCard(building, market = false) {
  const action = market
    ? `<div class="card-actions">
        <button type="button" data-select-build="${building.id}">Compra</button>
      </div>`
    : "";
  return `
    <article class="building-card">
      ${renderPolyomino(building)}
      <div>
        <h3>${building.name}</h3>
        <p>${building.shape}</p>
        <p>Prosperita provvisoria: ${building.prosperity}</p>
        <p>${building.effect}</p>
      </div>
      ${action}
    </article>
  `;
}

const slotPositions = [
  [1, 1], [1, 2], [1, 3], [1, 4], [1, 5],
  [2, 5], [3, 5], [4, 5],
  [5, 5], [5, 4], [5, 3], [5, 2], [5, 1],
  [4, 1], [3, 1], [2, 1],
];

function renderMarketSlot(slot, index) {
  const [gridRow, gridColumn] = slotPositions[index];
  const style = `grid-row:${gridRow}; grid-column:${gridColumn};`;
  if (slot?.type === "token" && !game.tokenAtCenter) {
    return `<div class="market-slot token" style="${style}"><span>Token</span><strong>Acquisto</strong><em>#${index + 1}</em></div>`;
  }
  if (slot?.type === "token" && game.tokenAtCenter) {
    return `<div class="market-slot token ghost-token" style="${style}"><span>Base</span><strong>#${index + 1}</strong></div>`;
  }
  if (!slot) {
    return `<div class="market-slot empty" style="${style}">Pool vuoto</div>`;
  }

  const building = getBuilding(slot.buildingId);
  const available = canChooseTileThisTurn() && isPurchasable(index);
  const surcharge = purchaseSurcharge(index);
  const selected = game.selected?.slotIndex === index;
  const canMerge = canMergeBuilding(building.id);

  return `
    <article class="market-slot ${available ? "available" : ""} ${selected ? "selected" : ""}" style="${style}" aria-label="${available ? `Compra ${building.name}` : building.name}">
      ${renderPolyomino(building, true)}
      <h3>${building.name}</h3>
      ${available ? `
        <div class="market-actions">
          <button type="button" data-select-build="${index}" data-buy-mode="build">${surcharge ? `PIAZZA +${surcharge}` : "PIAZZA"}</button>
          ${canMerge ? `<button type="button" data-select-build="${index}" data-buy-mode="merge">${surcharge ? `MERGE +${surcharge}` : "MERGE"}</button>` : ""}
        </div>
      ` : ""}
    </article>
  `;
}

function renderReserveMarket() {
  const canChoose = canChooseTileThisTurn();
  reserveMarket.innerHTML = reserveBuildingIds.map((buildingId) => {
    const building = getBuilding(buildingId);
    const selected = game.selected?.source === "reserve" && game.selected.buildingId === building.id;
    const canMerge = canMergeBuilding(building.id);
    return `
      <article class="reserve-tile ${selected ? "selected" : ""}" aria-label="Prendi ${building.name}">
        ${renderPolyomino(building, true)}
        <span>${building.name}</span>
        <strong>${building.prosperity} Prosperita</strong>
        <div class="market-actions">
          <button type="button" data-select-reserve="${building.id}" data-buy-mode="build" ${canChoose ? "" : "disabled"}>PIAZZA</button>
          ${canMerge ? `<button type="button" data-select-reserve="${building.id}" data-buy-mode="merge" ${canChoose ? "" : "disabled"}>MERGE</button>` : ""}
        </div>
      </article>
    `;
  }).join("");
}

function renderMarket() {
  deckInfo.textContent = `Pool: ${game.deck.length} | Token: ${game.tokenAtCenter ? "Centro" : game.tokenIndex + 1}`;
  marketTrack.innerHTML = game.marketSlots.map(renderMarketSlot).join("");
  renderReserveMarket();
}

function playerTrackValue(player) {
  if (player.finalReached && player.specialStep > 0) {
    return endGameThreshold.value + Math.min(player.specialStep, specialTrackLength);
  }
  return Math.min(player.prosperity, endGameThreshold.value);
}

function renderProsperityTrack() {
  const maxValue = endGameThreshold.value + specialTrackLength;
  const player = activePlayer();
  const attackByValue = new Map(player.attackThresholds.map((threshold) => [threshold.value, threshold]));
  const currentSpecialValue = player.finalReached && player.specialStep > 0
    ? endGameThreshold.value + player.specialStep
    : null;
  const markup = Array.from({ length: maxValue + 1 }, (_, value) => {
    const attack = attackByValue.get(value);
    const specialStep = value > endGameThreshold.value ? value - endGameThreshold.value : 0;
    const reached = specialStep ? player.specialStep >= specialStep : game.prosperity >= value;
    const current = specialStep ? currentSpecialValue === value : game.prosperity === value && !currentSpecialValue;
    const classes = ["prosperity-cell"];
    if (attack) classes.push("attack");
    if (specialStep) classes.push("special");
    if (value === endGameThreshold.value) classes.push("final");
    if (reached) classes.push("reached");
    if (current) classes.push("current");
    const label = specialStep ? `${specialStep}d` : attack ? `${attack.dice}d` : value;
    const title = attack
      ? `Prosperita ${value}: attacco da ${attack.dice} dadi`
      : specialStep
        ? `Casella speciale ${specialStep}: tira ${specialStep} dadi contro tutti gli altri`
        : `Prosperita ${value}`;
    const counters = game.players
      .map((trackPlayer, index) => ({ trackPlayer, index }))
      .filter(({ trackPlayer }) => playerTrackValue(trackPlayer) === value)
      .map(({ trackPlayer, index }) => `
        <span
          class="player-track-counter player-${index + 1} ${index === game.currentPlayerIndex ? "current-player" : ""} ${index === game.viewPlayerIndex ? "view-player" : ""}"
          title="${escapeHtml(trackPlayer.name)}">
          ${escapeHtml(trackPlayer.name)}
        </span>
      `).join("");
    return `
      <span class="${classes.join(" ")}" title="${title}">
        <span class="prosperity-label">${label}</span>
        ${counters ? `<span class="player-track-counters">${counters}</span>` : ""}
      </span>
    `;
  }).join("");
  prosperityTrack.innerHTML = markup;
  prosperityTrackSide.innerHTML = markup;
}

function renderTiles() {
  tileLibrary.innerHTML = buildings.map((building) => renderBuildingCard(building)).join("");
}

function renderBoardZoom() {
  personalStage.style.width = `${zooms.personal}%`;
  personalZoomLabel.textContent = `${zooms.personal}%`;
}

function pendingChoiceText(player = activePlayer()) {
  if (game.selected) return "Completa o annulla la selezione";
  if (player.pendingLevelUps) return "Scegli un mostro per il Level Up";
  if (player.pendingEffects.length) {
    const effect = player.pendingEffects[0];
    return effect.type === "hit" ? "Assegna i danni a un mostro valido" : "Scegli un mostro da respingere";
  }
  if (player.pendingReactivations) return "Scegli un edificio adiacente da riattivare";
  if (player.pendingForestRemovals) return "Rimuovi un Bosco";
  if (player.pendingAttacks.length) return "Invasione in arrivo";
  return "";
}

function clearPendingChoicesForPass(player = activePlayer()) {
  const skipped = [];
  if (player.pendingLevelUps) skipped.push(`${player.pendingLevelUps} Level Up`);
  if (player.pendingEffects.length) skipped.push(`${player.pendingEffects.length} effetti mostro`);
  if (player.pendingReactivations) skipped.push(`${player.pendingReactivations} riattivazioni`);
  if (player.pendingForestRemovals) skipped.push(`${player.pendingForestRemovals} rimozioni Bosco`);
  player.pendingLevelUps = 0;
  player.pendingEffects = [];
  player.pendingReactivations = 0;
  player.pendingReactivationSources = [];
  player.pendingForestRemovals = 0;
  player.reactivatedTowersThisTurn = new Set();
  if (skipped.length) addLog(`${player.name}: effetti non usati scartati (${skipped.join(", ")})`);
}

function renderSelectedTool() {
  returnToMenu.hidden = !game.over;
  abandonGame.hidden = game.over;
  if (game.over) {
    selectedTool.textContent = "Partita finita: puoi tornare al menu";
    confirmPlacement.disabled = true;
    destroyBuilding.disabled = true;
    passTurn.disabled = true;
    return;
  }
  const player = activePlayer();
  const pendingText = pendingChoiceText(player);
  passTurn.disabled = Boolean(game.selected) || !player.actionDone || player.pendingAttacks.length > 0 || game.attackRunning;
  destroyBuilding.disabled = activePlayer().type === "bot" || activePlayer().finalReached || Boolean(game.selected) || game.pendingEffects.length > 0 || game.pendingReactivations > 0 || game.pendingForestRemovals > 0 || game.pendingLevelUps > 0 || player.pendingAttacks.length > 0 || game.attackRunning;
  if (!game.selected) {
    selectedTool.textContent = pendingText
      ? `Da risolvere: ${pendingText}. Puoi premere Passa per saltarlo`
      : player.actionDone
        ? "Turno pronto: premi Passa"
        : player.finalReached
          ? `Casella speciale ${Math.min(player.specialStep + 1, specialTrackLength)}/${specialTrackLength}: tiro automatico`
          : `Nessuna tessera`;
    confirmPlacement.disabled = true;
    return;
  }
  const building = getBuilding(game.selected.buildingId);
  const error = previewError();
  const action = game.selected.mode === "merge" ? "Upgrade edificio" : game.selected.mode === "destroy" ? "Distruggi edificio" : "Piazza";
  selectedTool.textContent = game.selected.preview
    ? `${action}${building ? ` ${building.name}` : ""}: ${error || "preview valida, conferma"}`
    : `${action}${building ? ` ${building.name}` : ""}: clicca una casella`;
  confirmPlacement.disabled = Boolean(error);
}

function renderAll() {
  renderStats();
  renderMonstersOnBoard();
  renderBoardGrid();
  renderMarket();
  renderProsperityTrack();
  renderTiles();
  renderPlayerSummary();
  renderObjectives();
  renderBoardZoom();
  renderSelectedTool();
  renderSetup();
  schedulePendingAttackIfNeeded();
  scheduleSpecialIfNeeded();
  scheduleBotIfNeeded();
}

function completeMarketAction(building) {
  const previousProsperity = game.prosperity;
  const surcharge = game.selected?.extraProsperity ?? 0;
  const nextProsperity = game.prosperity + building.prosperity + surcharge;
  game.prosperity = Math.min(endGameThreshold.value, nextProsperity);
  activePlayer().actionDone = true;
  if (surcharge) addLog(`Acquisto oltre le 3 tessere: +${surcharge} Prosperita`);
  if (nextProsperity > endGameThreshold.value && previousProsperity < endGameThreshold.value) {
    addLog(`${activePlayer().name}: Prosperita fermata a 34`);
  }
  movePurchaseTokenFromSelection();
  applySoloMarketDiscard();
  resolveProsperityTriggers(previousProsperity);
}

function applySoloMarketDiscard() {
  if (game.mode !== "solo" || game.selected?.source === "reserve") return;
  const candidates = [1, 2, 3]
    .map((offset) => (game.tokenIndex + offset) % game.marketSlots.length)
    .filter((index) => {
      const slot = game.marketSlots[index];
      return slot && slot.type !== "token";
    });
  if (!candidates.length) return;
  const discardIndex = candidates[Math.floor(Math.random() * candidates.length)];
  const discarded = getBuilding(game.marketSlots[discardIndex].buildingId);
  game.marketSlots[discardIndex] = drawTile();
  addLog(`Solitario: scartata a caso ${discarded.name} dalle prossime 3 tessere`);
}

function enemiesForCells(cells) {
  const usedCols = new Set(cells.map(([, col]) => col));
  return Object.entries(currentEnemies())
    .filter(([, enemy]) => (
      Array.from({ length: enemy.width }, (_, index) => enemy.colStart + index)
        .some((col) => usedCols.has(col))
    ))
    .map(([key]) => key);
}

function queueTargetEffects(type, count, sourceName, cells) {
  const allowedEnemies = enemiesForCells(cells);
  if (allowedEnemies.length === 0) {
    addLog(`${sourceName}: nessun mostro nelle colonne occupate`);
    return;
  }
  for (let i = 0; i < count; i += 1) {
    game.pendingEffects.push({ type, sourceName, allowedEnemies });
  }
  const actionName = type === "hit" ? "danni" : "spinte";
  addLog(`${sourceName}: ${count} ${actionName} da assegnare ai mostri nelle sue colonne`);
}

function areAdjacentCells(firstCells, secondCells) {
  return firstCells.some(([row, col]) => (
    secondCells.some(([otherRow, otherCol]) => (
      Math.abs(row - otherRow) + Math.abs(col - otherCol) === 1
    ))
  ));
}

function applyPlacedBuildingEffect(building, cells, instance, reactivation = false) {
  if (building.id === "reggia") {
    game.vp += 2;
    activePlayer().fortressVp += 2;
    addLog(`${reactivation ? "Riattiva Reggia" : "Reggia"}: +2 PV`);
  } else if (building.id === "segheria") {
    game.pendingForestRemovals += 3;
    addLog(`${reactivation ? "Riattiva Segheria" : "Segheria"}: 3 rimozioni Bosco disponibili`);
  } else if (building.id === "capanna") {
    game.pendingForestRemovals += 1;
    addLog(`${reactivation ? "Riattiva Capanna del boscaiolo" : "Capanna del boscaiolo"}: 1 rimozione Bosco disponibile`);
  } else if (building.id === "caserma") {
    queueTargetEffects("hit", 1, reactivation ? "Riattiva Caserma" : "Caserma", cells);
  } else if (building.id === "casaArciere") {
    queueTargetEffects("hit", 1, reactivation ? "Riattiva Casa dell'arciere" : "Casa dell'arciere", cells);
  } else if (building.id === "cannoni") {
    queueTargetEffects("hit", 2, reactivation ? "Riattiva Cannoni" : "Cannoni", cells);
  } else if (building.id === "cavalleria") {
    queueTargetEffects("push", 2, reactivation ? "Riattiva Cavalleria" : "Cavalleria", cells);
  } else if (building.id === "casaCavaliere") {
    queueTargetEffects("push", 1, reactivation ? "Riattiva Casa del cavaliere" : "Casa del cavaliere", cells);
  } else if (building.id === "torre") {
    if (activePlayer().reactivatedTowersThisTurn.has(instance.instanceId)) {
      addLog(`${reactivation ? "Riattiva Torre" : "Torre"}: questa Torre ha gia generato una riattivazione in questo turno`);
      return;
    }
    activePlayer().reactivatedTowersThisTurn.add(instance.instanceId);
    game.pendingReactivations += 1;
    game.pendingReactivationSources.push({ instanceId: instance.instanceId, cells });
    addLog(`${reactivation ? "Riattiva Torre" : "Torre"}: clicca un singolo edificio adiacente da riattivare`);
  } else if (building.id === "muraglia") {
    addLog("Muraglia piazzata: se un mostro la raggiunge, viene rimossa senza penalita");
  }
}

function resolveProsperityTriggers(previousProsperity) {
  const player = activePlayer();
  player.attackThresholds.forEach((threshold) => {
    if (!threshold.resolved && previousProsperity < threshold.value && game.prosperity >= threshold.value) {
      threshold.resolved = true;
      player.pendingAttacks.push({ dice: threshold.dice, threshold: threshold.value });
      addLog(`Soglia Prosperita ${threshold.value}: invasione da ${threshold.dice} dadi a fine turno`);
    }
  });

  player.levelUpThresholds.forEach((threshold) => {
    if (!threshold.resolved && previousProsperity < threshold.value && game.prosperity >= threshold.value) {
      threshold.resolved = true;
      addLog(`Soglia Prosperita ${threshold.value}: scegli un mostro da livellare`);
      game.pendingLevelUps += 1;
      game.selected = null;
    }
  });

  if (!player.endGameResolved && previousProsperity < endGameThreshold.value && game.prosperity >= endGameThreshold.value) {
    player.endGameResolved = true;
    player.finalReached = true;
    player.specialStep = 0;
    if (player.pendingAttacks.length) {
      player.pendingAttacks = [];
      addLog(`${player.name} e a 34: eventuali invasioni in coda non si applicano`);
    }
    addLog(`${player.name} raggiunge la casella 34: dal prossimo turno avanza sulle caselle speciali`);
  }
}

function hasPendingChoices(player = activePlayer()) {
  return Boolean(
    game.selected
    || player.pendingEffects.length
    || player.pendingAttacks.length
    || player.pendingReactivations
    || player.pendingForestRemovals
    || player.pendingLevelUps
  );
}

function hasPendingBuildingEffects(player = activePlayer()) {
  return Boolean(
    game.selected
    || player.pendingEffects.length
    || player.pendingReactivations
    || player.pendingForestRemovals
    || player.pendingLevelUps
  );
}

function schedulePendingAttackIfNeeded() {
  const player = activePlayer();
  if (
    !game.started
    || game.attackRunning
    || game.over
    || !player
    || player.dead
    || !canReceiveInvasion(player)
    || !player.actionDone
    || !player.pendingAttacks.length
    || hasPendingBuildingEffects(player)
  ) return;
  game.attackRunning = true;
  window.setTimeout(runPendingAttack, 350);
}

function runPendingAttack() {
  const player = activePlayer();
  if (!game.started || game.over || !player || player.dead || !player.pendingAttacks.length || hasPendingBuildingEffects(player)) {
    game.attackRunning = false;
    renderAll();
    return;
  }
  const attack = player.pendingAttacks.shift();
  addLog(`${player.name}: risolve invasione soglia ${attack.threshold}`);
  resolveAttack(attack.dice, null, false, "Invasione");
  game.attackRunning = false;
  renderAll();
}

function finishTurnIfReady() {
  renderAll();
}

function advanceTurn() {
  if (game.over) return;
  const player = activePlayer();
  if (game.selected) {
    addLog("Prima completa o annulla la selezione");
    renderAll();
    return;
  }
  if (!player.actionDone) {
    addLog("Prima fai una mossa principale");
    renderAll();
    return;
  }
  clearPendingChoicesForPass(player);
  if (player.pendingAttacks.length) {
    addLog(`${player.name}: prima si risolve l'invasione di fine turno`);
    renderAll();
    return;
  }
  player.actionDone = false;
  player.objectiveClaimedThisTurn = false;
  player.reactivatedTowersThisTurn = new Set();
  if (game.mode === "solo") {
    if (livePlayersReachedFinal()) {
      endGame("giocatore arrivato alla casella 34");
      return;
    }
    game.round += 1;
    addLog(`Solitario: turno ${game.round}`);
    renderAll();
    return;
  }
  const livePlayers = game.players.filter((player) => !player.dead);
  if (livePlayers.length <= 1) {
    endGame("Rimane un solo giocatore vivo");
    return;
  }
  if (livePlayersReachedFinal()) {
    endGame("tutti i giocatori in gioco hanno raggiunto la casella 34");
    return;
  }
  const activePlayers = game.players.filter((player) => !player.dead && !(player.finalReached && player.specialStep >= specialTrackLength));
  if (!activePlayers.length) {
    endGame("tutti i giocatori vivi hanno completato le caselle speciali");
    return;
  }
  const startIndex = game.currentPlayerIndex;
  do {
    game.currentPlayerIndex = (game.currentPlayerIndex + 1) % game.players.length;
  } while (
    (game.players[game.currentPlayerIndex].dead
      || (game.players[game.currentPlayerIndex].finalReached && game.players[game.currentPlayerIndex].specialStep >= specialTrackLength))
    && game.currentPlayerIndex !== startIndex
  );
  game.round += 1;
  game.viewPlayerIndex = game.currentPlayerIndex;
  addLog(`Tocca a ${activePlayer().name}`);
  renderAll();
}

function withActivePlayer(index, callback) {
  const previousIndex = game.currentPlayerIndex;
  game.currentPlayerIndex = index;
  const result = callback();
  game.currentPlayerIndex = previousIndex;
  return result;
}

function livePlayersReachedFinal() {
  return game.players
    .filter((player) => !player.dead)
    .every((player) => player.finalReached || player.prosperity >= endGameThreshold.value);
}

function livePlayersCompletedSpecials() {
  return game.players
    .filter((player) => !player.dead)
    .every((player) => player.finalReached && player.specialStep >= specialTrackLength);
}

function scheduleSpecialIfNeeded() {
  const player = activePlayer();
  if (!game.started || game.specialRunning || game.over || !player || player.dead || !player.finalReached || player.actionDone || hasPendingChoices(player)) return;
  if (player.specialStep >= specialTrackLength) {
    player.actionDone = true;
    if (livePlayersCompletedSpecials()) endGame("tutti i giocatori vivi hanno completato le caselle speciali");
    return;
  }
  game.specialRunning = true;
  window.setTimeout(runSpecialStep, 450);
}

function runSpecialStep() {
  const attacker = activePlayer();
  if (!game.started || game.over || !attacker || attacker.dead || !attacker.finalReached || attacker.actionDone || hasPendingChoices(attacker)) {
    game.specialRunning = false;
    renderAll();
    return;
  }
  attacker.specialStep += 1;
  const diceCount = attacker.specialStep;
  const rolls = Array.from({ length: diceCount }, rollDie);
  attacker.lastAttackRolls = rolls;
  addLog(`${attacker.name}: casella speciale ${attacker.specialStep}/${specialTrackLength}, dadi ${rolls.join(", ")}`);
  const targetIndexes = game.players
    .map((player, index) => ({ player, index }))
    .filter(({ player, index }) => index !== game.currentPlayerIndex && canReceiveInvasion(player))
    .map(({ index }) => index);
  if (!targetIndexes.length) {
    addLog("Nessun avversario sotto 34: il tiro non colpisce nessuno");
  }
  targetIndexes.forEach((index) => {
    const player = game.players[index];
    withActivePlayer(index, () => resolveAttack(diceCount, rolls, false, `Speciale di ${attacker.name} su ${player.name}`));
  });
  attacker.actionDone = true;
  game.specialRunning = false;
  if (livePlayersCompletedSpecials()) {
    endGame("tutti i giocatori vivi hanno completato le caselle speciali");
    return;
  }
  renderAll();
}

function scoreFinalPenalties() {
  game.players.forEach((player) => {
    if (player.dead || player.finalScored) return;
    const objectiveBonus = totalObjectiveVp(player);
    const destroyedPenalty = player.destroyedBuildings;
    player.vp += objectiveBonus - destroyedPenalty;
    player.finalScored = true;
    addLog(`${player.name}: +${objectiveBonus} PV obiettivi, -${destroyedPenalty} PV per edifici distrutti`);
  });
}

function endGame(reason) {
  if (game.over) return;
  game.over = true;
  game.selected = null;
  scoreFinalPenalties();
  saveGameRecords(reason);
  const contenders = game.players.filter((player) => !player.dead);
  if (!contenders.length) {
    addLog(`Fine partita: ${reason}. Nessun giocatore sopravvive`);
    renderAll();
    return;
  }
  const bestScore = Math.max(...contenders.map((player) => player.vp));
  const winners = contenders.filter((player) => player.vp === bestScore).map((player) => player.name).join(", ");
  addLog(`Fine partita: ${reason}. Vince ${winners} con ${bestScore} PV`);
  renderAll();
}

function eliminateActivePlayer(reason) {
  const player = activePlayer();
  player.dead = true;
  game.selected = null;
  addLog(`${player.name} muore: ${reason}`);
  endGame(`${player.name} e morto`);
}

function enemyPressure(enemy) {
  return Math.max(0, enemy.position) + enemy.damage * 1.4;
}

function bestEnemyForEffect(effect) {
  return effect.allowedEnemies
    .map((key) => [key, currentEnemies()[key]])
    .filter(([, enemy]) => enemy)
    .sort(([, first], [, second]) => enemyPressure(second) - enemyPressure(first))[0]?.[0] ?? null;
}

function bestForestCell() {
  return Array.from(game.forests).map((key) => {
    const [row, col] = key.split(",").map(Number);
    const nearbyBuildings = [[row - 1, col], [row + 1, col], [row, col - 1], [row, col + 1]]
      .filter(([nextRow, nextCol]) => buildingAt(nextRow, nextCol)).length;
    return { row, col, score: nearbyBuildings * 2 + row };
  }).sort((first, second) => second.score - first.score)[0] ?? null;
}

function allValidPlacements(buildingId) {
  const placements = [];
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const cells = placedCells(row, col, buildingId);
      if (!validatePlacement(cells, buildingId)) placements.push({ row, col, cells });
    }
  }
  return placements;
}

function scorePlacement(building, cells) {
  const enemyKeys = enemiesForCells(cells);
  const pressure = enemyKeys.reduce((total, key) => total + enemyPressure(currentEnemies()[key]), 0);
  let score = cells.reduce((total, [row]) => total + row * 0.08, 0);
  if (building.id === "reggia") score += 6;
  if (building.id === "segheria") score += game.forests.size > 8 ? 7 : 3;
  if (building.id === "capanna") score += game.forests.size ? 5 : -8;
  if (building.id === "caserma") score += pressure * 1.6;
  if (building.id === "casaArciere") score += pressure * 1.45;
  if (building.id === "cannoni") score += pressure * 2.1;
  if (building.id === "cavalleria") score += pressure * 1.9;
  if (building.id === "casaCavaliere") score += pressure * 1.4;
  if (building.id === "muraglia") score += pressure >= 4 ? pressure * 2.6 : 1;
  if (building.id === "torre") score += cells.some(([row, col]) => (
    [[row - 1, col], [row + 1, col], [row, col - 1], [row, col + 1]]
      .some(([nextRow, nextCol]) => {
        const neighbor = buildingAt(nextRow, nextCol);
        return neighbor;
      })
  )) ? 7 : 1;
  return score;
}

function bestPlacementForBuilding(buildingId) {
  const building = getBuilding(buildingId);
  return allValidPlacements(buildingId)
    .map((placement) => ({ ...placement, score: scorePlacement(building, placement.cells) }))
    .sort((first, second) => second.score - first.score)[0] ?? null;
}

function botMergeTarget(buildingId) {
  return game.buildingsOnBoard.find((building) => isUpgradeableTarget(building) && building.id === buildingId) ?? null;
}

function availableBotActions() {
  const actions = [];
  game.marketSlots.forEach((slot, index) => {
    if (!slot || slot.type === "token" || !isPurchasable(index)) return;
    const building = getBuilding(slot.buildingId);
    const placement = bestPlacementForBuilding(building.id);
    const surcharge = purchaseSurcharge(index);
    if (placement) {
      actions.push({
        source: "market",
        mode: "build",
        buildingId: building.id,
        slotIndex: index,
        extraProsperity: surcharge,
        placement,
        score: placement.score - surcharge * 5,
      });
    }
    const mergeTarget = botMergeTarget(building.id);
    if (mergeTarget) {
      actions.push({
        source: "market",
        mode: "merge",
        buildingId: building.id,
        slotIndex: index,
        extraProsperity: surcharge,
        mergeTarget,
        score: 18 - surcharge * 5 + getBuilding(building.id).prosperity,
      });
    }
  });

  reserveBuildingIds.forEach((buildingId) => {
    const placement = bestPlacementForBuilding(buildingId);
    if (placement) {
      actions.push({ source: "reserve", mode: "build", buildingId, extraProsperity: 0, placement, score: placement.score - 1 });
    }
    const mergeTarget = botMergeTarget(buildingId);
    if (mergeTarget) {
      actions.push({ source: "reserve", mode: "merge", buildingId, extraProsperity: 0, mergeTarget, score: 16 });
    }
  });

  return actions.sort((first, second) => second.score - first.score);
}

function performBotStep() {
  const player = activePlayer();
  if (game.pendingLevelUps > 0) {
    const target = Object.entries(currentEnemies())
      .filter(([, enemy]) => enemy.level < 2)
      .sort(([, first], [, second]) => enemyPressure(second) - enemyPressure(first))[0]?.[0];
    if (target) levelUpEnemy(target);
    else game.pendingLevelUps = 0;
    return;
  }
  if (game.pendingEffects.length) {
    const target = bestEnemyForEffect(game.pendingEffects[0]);
    if (target) applyPendingEffectToEnemy(target);
    else game.pendingEffects.shift();
    return;
  }
  if (game.pendingForestRemovals > 0) {
    const forest = bestForestCell();
    if (forest) removeForestAt(forest.row, forest.col, false);
    else game.pendingForestRemovals = 0;
    return;
  }
  if (game.pendingReactivations > 0) {
    const source = game.pendingReactivationSources[0];
    const target = game.buildingsOnBoard.find((building) => (
      building.instanceId !== source.instanceId && areAdjacentCells(source.cells, building.cells)
    ));
    if (target) reactivateBuildingAt(target.cells[0][0], target.cells[0][1]);
    else {
      game.pendingReactivationSources.shift();
      game.pendingReactivations -= 1;
      addLog(`${player.name} automa: nessun edificio utile da riattivare`);
    }
    return;
  }
  if (player.pendingAttacks.length) return;
  if (player.actionDone) {
    const claim = bestObjectiveClaim(player);
    if (claim) {
      claimObjective(claim.objective.id, claim.levelIndex);
      return;
    }
    advanceTurn();
    return;
  }

  const action = availableBotActions()[0];
  if (!action) {
    player.actionDone = true;
    addLog(`${player.name} automa: nessuna mossa valida, passa`);
    return;
  }
  game.selected = {
    buildingId: action.buildingId,
    mode: action.mode,
    source: action.source,
    slotIndex: action.slotIndex,
    extraProsperity: action.extraProsperity,
    preview: null,
  };
  const building = getBuilding(action.buildingId);
  addLog(`${player.name} automa sceglie ${building.name}${action.mode === "merge" ? " per MERGE" : ""}`);
  if (action.mode === "merge") {
    upgradeSelectedBuildingAt(action.mergeTarget.cells[0][0], action.mergeTarget.cells[0][1]);
  } else {
    placeBuilding(action.placement.row, action.placement.col);
  }
}

function runBotStep() {
  const player = activePlayer();
  if (!game.started || game.over || !player || player.type !== "bot" || player.dead) {
    game.botRunning = false;
    renderAll();
    return;
  }
  performBotStep();
  window.setTimeout(runBotStep, 450);
}

function scheduleBotIfNeeded() {
  const player = activePlayer();
  if (!game.started || game.botRunning || game.over || !player || player.type !== "bot" || player.dead) return;
  if (player.finalReached) {
    if (player.actionDone) window.setTimeout(advanceTurn, 250);
    return;
  }
  game.botRunning = true;
  window.setTimeout(runBotStep, 450);
}

function selectMarketAction(slotIndex, mode = "build") {
  if (game.over || activePlayer().dead) return;
  if (activePlayer().type === "bot") return;
  if (activePlayer().actionDone) {
    addLog("Hai gia fatto la mossa: premi Passa per il prossimo giocatore");
    return;
  }
  if (hasPendingChoices()) {
    addLog("Prima risolvi la selezione o gli effetti pendenti del giocatore di turno");
    return;
  }
  if (!isPurchasable(slotIndex)) {
    addLog(game.tokenAtCenter
      ? "Con il token al centro puoi scegliere una qualunque tessera del tracciato"
      : "Puoi prendere al massimo la sesta tessera dopo il token Acquisto");
    return;
  }
  const slot = game.marketSlots[slotIndex];
  if (!slot || slot.type === "token") {
    addLog("Quello spazio non contiene una tessera acquistabile");
    return;
  }
  if (mode === "merge" && !canMergeBuilding(slot.buildingId)) {
    addLog("Per fare Merge servono gia due edifici uguali in plancia");
    return;
  }
  const extraProsperity = purchaseSurcharge(slotIndex);
  game.viewPlayerIndex = game.currentPlayerIndex;
  game.selected = { buildingId: slot.buildingId, mode, slotIndex, extraProsperity, preview: null };
  const building = getBuilding(slot.buildingId);
  addLog(mode === "merge"
    ? `${building.name}: scegli l'edificio da upgradare. L'altro verra rimosso${extraProsperity ? ` (+${extraProsperity} Prosperita)` : ""}`
    : `Selezionata ${building.name}${extraProsperity ? ` (+${extraProsperity} Prosperita)` : ""}: clicca una casella per vedere la forma`);
  renderAll();
}

function selectReserveAction(buildingId, mode = "build") {
  if (game.over || activePlayer().dead) return;
  if (activePlayer().type === "bot") return;
  if (activePlayer().actionDone) {
    addLog("Hai gia fatto la mossa: premi Passa per il prossimo giocatore");
    return;
  }
  if (hasPendingChoices()) {
    addLog("Prima risolvi la selezione o gli effetti pendenti del giocatore di turno");
    return;
  }
  const building = getBuilding(buildingId);
  if (!building?.reserveOnly) return;
  if (mode === "merge" && !canMergeBuilding(buildingId)) {
    addLog("Per fare Merge servono gia due edifici uguali in plancia");
    return;
  }
  game.viewPlayerIndex = game.currentPlayerIndex;
  game.selected = { buildingId, mode, source: "reserve", preview: null };
  addLog(mode === "merge"
    ? `${building.name}: scegli l'edificio da upgradare. L'altro verra rimosso. Il token andra al centro quando confermi`
    : `Riserva: selezionata ${building.name}. Il token andra al centro quando confermi`);
  renderAll();
}

function movePurchaseTokenFromSelection() {
  if (game.selected?.source === "reserve") {
    game.tokenAtCenter = true;
    return;
  }
  const boughtSlotIndex = game.selected?.slotIndex;
  const oldTokenIndex = game.tokenIndex;
  if (Number.isInteger(boughtSlotIndex)) {
    game.tokenAtCenter = false;
    game.marketSlots[boughtSlotIndex] = { type: "token" };
    game.marketSlots[oldTokenIndex] = drawTile();
    game.tokenIndex = boughtSlotIndex;
  }
}

function placeBuilding(row, col) {
  if (game.over) return;
  const building = getBuilding(game.selected.buildingId);
  const cells = placedCells(row, col, building.id);
  const error = validatePlacement(cells);
  if (error) {
    addLog(error);
    selectedTool.textContent = `${error}. Prova una casella verde`;
    return;
  }

  const placedBuilding = {
    instanceId: game.nextBuildingId,
    id: building.id,
    name: building.name,
    short: building.short,
    level: 1,
    cells,
  };
  game.buildingsOnBoard.push(placedBuilding);
  game.nextBuildingId += 1;
  applyPlacedBuildingEffect(building, cells, placedBuilding);
  completeMarketAction(building);
  addLog(`Piazzato ${building.name} in riga ${row + 1}, colonna ${col + 1}`);
  game.selected = null;
  finishTurnIfReady();
}

function discardSelectedTileForForest(row, col) {
  if (game.over) return;
  const key = cellKey(row, col);
  if (!game.selected || !game.forests.has(key)) {
    addLog("Scegli una casella Bosco da rimuovere");
    renderSelectedTool();
    return;
  }
  const building = getBuilding(game.selected.buildingId);
  game.forests.delete(key);
  activePlayer().forestsRemoved += 1;
  completeMarketAction(building);
  addLog(`${building.name} scartata: rimosso Bosco in riga ${row + 1}, colonna ${col + 1}`);
  game.selected = null;
  finishTurnIfReady();
}

function previewPlacement(row, col) {
  if (!game.selected) return;
  game.selected.preview = { row, col };
  renderAll();
}

function upgradeSelectedBuildingAt(row, col) {
  if (game.over) return;
  const survivor = buildingAt(row, col);
  const building = getBuilding(game.selected.buildingId);
  const error = previewError();
  if (error) {
    addLog(error);
    renderSelectedTool();
    return;
  }
  const removedBuilding = mergeRemovalForSurvivor(survivor);
  game.buildingsOnBoard = game.buildingsOnBoard.filter((item) => item.instanceId !== removedBuilding.instanceId);
  game.pendingReactivationSources = game.pendingReactivationSources.filter((source) => source.instanceId !== removedBuilding.instanceId);
  survivor.level += 1;
  game.vp += 1;
  activePlayer().mergesMade += 1;
  applyPlacedBuildingEffect(building, survivor.cells, survivor);
  completeMarketAction(building);
  addLog(`${survivor.name} sale a livello ${survivor.level}: l'altro ${removedBuilding.name} viene rimosso, +1 PV e effetto attivato`);
  game.selected = null;
  finishTurnIfReady();
}

function destroySelectedBuildingAt(row, col) {
  if (game.over) return;
  const target = buildingAt(row, col);
  const error = previewError();
  if (error) {
    addLog(error);
    renderSelectedTool();
    return;
  }
  game.buildingsOnBoard = game.buildingsOnBoard.filter((item) => item.instanceId !== target.instanceId);
  game.pendingReactivationSources = game.pendingReactivationSources.filter((source) => source.instanceId !== target.instanceId);
  if (target.id === "muraglia") {
    addLog("Muraglia distrutta volontariamente: nessuna penalita a fine partita");
  } else {
    activePlayer().destroyedBuildings += 1;
    addLog(`${target.name} distrutto volontariamente: -1 PV a fine partita`);
  }
  game.selected = null;
  renderAll();
}

function evolveBuildingAt(row, col) {
  const target = buildingAt(row, col);
  const building = getBuilding(game.selected.buildingId);
  if (!target || target.id !== building.id) {
    addLog(`Seleziona un tuo edificio ${building.name} da evolvere`);
    return;
  }
  if (target.id === "muraglia") {
    addLog("La Muraglia non puo essere evoluta");
    return;
  }
  if (target.level >= 3) {
    addLog(`${target.name} e gia al livello massimo`);
    return;
  }
  target.level += 1;
  completeMarketAction(building);
  addLog(`${target.name} sale al livello ${target.level}`);
  game.selected = null;
  renderAll();
}

function removeForestAt(row, col, consumeMarketTile = false) {
  if (game.over) return;
  const key = cellKey(row, col);
  if (!game.forests.has(key)) {
    addLog("In quella casella non c'e un Bosco");
    return;
  }
  if (!consumeMarketTile && game.pendingForestRemovals <= 0) {
    addLog("Nessuna rimozione Bosco disponibile");
    return;
  }
  game.forests.delete(key);
  activePlayer().forestsRemoved += 1;
  if (consumeMarketTile) {
    completeMarketAction(getBuilding(game.selected.buildingId));
    game.selected = null;
  } else {
    game.pendingForestRemovals -= 1;
  }
  addLog(`Bosco rimosso in riga ${row + 1}, colonna ${col + 1}`);
  finishTurnIfReady();
}

function damageBuilding(building) {
  if (building.id === "muraglia") {
    game.buildingsOnBoard = game.buildingsOnBoard.filter((item) => item.instanceId !== building.instanceId);
    game.pendingReactivationSources = game.pendingReactivationSources.filter((source) => source.instanceId !== building.instanceId);
    addLog("Muraglia rimossa dal mostro: nessuna penalita a fine partita");
    return;
  }
  if (building.level > 1) {
    building.level -= 1;
    addLog(`${building.name} colpito dal mostro: scende a livello ${building.level}`);
    return;
  }
  game.buildingsOnBoard = game.buildingsOnBoard.filter((item) => item.instanceId !== building.instanceId);
  game.pendingReactivationSources = game.pendingReactivationSources.filter((source) => source.instanceId !== building.instanceId);
  activePlayer().destroyedBuildings += 1;
  addLog(`${building.name} viene distrutto dal mostro: -1 PV a fine partita`);
}

function advanceEnemy(key) {
  const enemy = currentEnemies()[key];
  if (enemy.position <= 0) {
    enemy.position = 1;
    addLog(`${enemy.name} entra alla riga 1`);
    return;
  }
  const targetRow = enemy.position;

  const coveredBuildings = new Map();
  if (targetRow < rows) {
    for (let col = enemy.colStart; col < enemy.colStart + enemy.width; col += 1) {
      const building = buildingAt(targetRow, col);
      if (building) coveredBuildings.set(building.instanceId, building);
    }
  }

  if (coveredBuildings.size > 0) {
    coveredBuildings.forEach(damageBuilding);
    return;
  }

  if (targetRow >= rows - 1) {
    game.vp -= 3;
    activePlayer().invasionMalus += 3;
    enemy.position = 0;
    enemy.damage = 0;
    addLog(`${enemy.name} raggiunge l'ultima riga: -3 PV e riparte dalla riga 0`);
    return;
  }

  enemy.position += 1;
  addLog(`${enemy.name} avanza alla riga ${enemy.position}`);
}

function resolveAttack(diceCount = 2, forcedRolls = null, shouldRender = true, label = "Attacco") {
  if (game.over) return;
  if (!canReceiveInvasion(activePlayer())) {
    addLog(`${activePlayer().name} e a 34 Prosperita: non subisce il tiro invasione`);
    return;
  }
  game.lastAttackRolls = forcedRolls ? [...forcedRolls] : Array.from({ length: diceCount }, rollDie);
  addLog(`${label}: dadi ${game.lastAttackRolls.join(", ")}`);

  Object.entries(currentEnemies()).forEach(([key, enemy]) => {
    if (game.over) return;
    const matches = game.lastAttackRolls.filter((roll) => activeDice(enemy).includes(roll)).length;
    for (let i = 0; i < matches; i += 1) {
      advanceEnemy(key);
    }
    if (matches > 0) addLog(`${enemy.name}: ${matches} match`);
  });

  if (shouldRender) renderAll();
}

function levelUpEnemy(key) {
  if (game.over) return;
  const enemy = currentEnemies()[key];
  if (game.pendingLevelUps <= 0) {
    addLog("Nessun Level Up da assegnare");
    return;
  }
  if (enemy.level >= 2) {
    addLog(`${enemy.name} e gia sul lato level up`);
    return;
  }
  enemy.level += 1;
  game.pendingLevelUps -= 1;
  addLog(`${enemy.name} level up: aggiunge 1 faccia dado`);
  finishTurnIfReady();
}

function applyHitToEnemy(key) {
  const enemy = currentEnemies()[key];
  enemy.damage += 1;
  addLog(`Danno su ${enemy.name}: ${enemy.damage}/3`);
  if (enemy.damage >= 3) {
    enemy.damage = 0;
    enemy.position = 0;
    game.vp += 1;
    activePlayer().monstersKilled += 1;
    addLog(`${enemy.name} sconfitto: +1 PV e torna alla riga 0`);
  }
}

function applyPushToEnemy(key) {
  const enemy = currentEnemies()[key];
  enemy.position = Math.max(0, enemy.position - 1);
  addLog(`Spinta su ${enemy.name}: riga ${enemy.position}`);
}

function applyPendingEffectToEnemy(key) {
  if (game.over) return;
  const effectIndex = game.pendingEffects.findIndex((effect) => effect.allowedEnemies.includes(key));
  if (effectIndex < 0) {
    addLog("Quel mostro non e nelle colonne dell'effetto disponibile");
    return;
  }
  const [effect] = game.pendingEffects.splice(effectIndex, 1);
  if (effect.type === "hit") applyHitToEnemy(key);
  if (effect.type === "push") applyPushToEnemy(key);
  finishTurnIfReady();
}

function reactivateBuildingAt(row, col) {
  if (game.over) return false;
  const target = buildingAt(row, col);
  if (!target) return false;
  const sourceIndex = game.pendingReactivationSources.findIndex((source) => areAdjacentCells(source.cells, target.cells));
  if (sourceIndex < 0) {
    addLog("Seleziona un edificio adiacente alla Torre");
    return true;
  }
  game.pendingReactivationSources.splice(sourceIndex, 1);
  game.pendingReactivations -= 1;
  applyPlacedBuildingEffect(getBuilding(target.id), target.cells, target, true);
  finishTurnIfReady();
  return true;
}

function resetGame() {
  document.querySelectorAll("[data-player-name]").forEach((input) => {
    const index = Number(input.dataset.playerName);
    if ((game.playerTypes[index] ?? "human") !== "bot") {
      game.playerNames[index] = input.value.trim();
    }
  });
  if (game.configuredPlayerCount === 1) {
    game.mode = "solo";
    game.playerTypes = ["human"];
  } else {
    game.mode = "multiplayer";
    game.playerTypes = Array.from({ length: game.configuredPlayerCount }, (_, index) => game.playerTypes[index] ?? (index === 0 ? "human" : "bot"));
  }
  Object.assign(game, {
    round: 1,
    currentPlayerIndex: 0,
    viewPlayerIndex: 0,
    players: Array.from({ length: game.configuredPlayerCount }, (_, index) => createPlayerState(index)),
    deck: [],
    marketSlots: [],
    tokenIndex: 0,
    tokenAtCenter: false,
    selected: null,
    over: false,
    botRunning: false,
    specialRunning: false,
    attackRunning: false,
    activeObjectives: [],
    recordsSaved: false,
  });
  setupMarketTrack();
  setupObjectives();
  showGameScreen();

  log.innerHTML = "";
  addLog(`${game.mode === "solo" ? "Solitario" : "Multiplayer"}: ${activePlayer().name} inizia`);
  renderAll();
}

document.addEventListener("click", (event) => {
  const viewTarget = event.target.closest("[data-view-player]");
  if (viewTarget) {
    game.viewPlayerIndex = Number(viewTarget.dataset.viewPlayer);
    game.selected = null;
    renderAll();
    return;
  }

  const objectiveTarget = event.target.closest("[data-claim-objective]");
  if (objectiveTarget) {
    claimObjective(objectiveTarget.dataset.claimObjective, Number(objectiveTarget.dataset.claimLevel));
    return;
  }

  const actionTarget = event.target.closest("[data-select-build], [data-select-reserve], [data-level-board], [data-row]");
  if (!actionTarget) return;
  if (activePlayer()?.type === "bot") return;

  const selectBuild = actionTarget.dataset.selectBuild;
  const selectReserve = actionTarget.dataset.selectReserve;
  const buyMode = actionTarget.dataset.buyMode ?? "build";
  const levelBoardKey = actionTarget.dataset.levelBoard;
  const row = actionTarget.dataset.row;
  const col = actionTarget.dataset.col;

  if (selectBuild !== undefined) selectMarketAction(Number(selectBuild), buyMode);
  if (selectReserve !== undefined) selectReserveAction(selectReserve, buyMode);
  if (levelBoardKey) {
    if (!isViewingActivePlayer()) {
      addLog(`Stai guardando ${viewedPlayer().name}: clicca ${activePlayer().name} per agire sul turno`);
      return;
    }
    if (game.pendingLevelUps > 0) levelUpEnemy(levelBoardKey);
    else applyPendingEffectToEnemy(levelBoardKey);
  }

  if (row !== undefined && col !== undefined) {
    if (!isViewingActivePlayer()) {
      addLog(`Stai guardando ${viewedPlayer().name}: clicca ${activePlayer().name} per agire sul turno`);
      return;
    }
    const cellRow = Number(row);
    const cellCol = Number(col);
    if (game.selected?.mode === "build" || game.selected?.mode === "forest" || game.selected?.mode === "merge" || game.selected?.mode === "destroy") previewPlacement(cellRow, cellCol);
    else if (game.pendingReactivations > 0 && reactivateBuildingAt(cellRow, cellCol)) return;
    else if (game.pendingForestRemovals > 0) removeForestAt(cellRow, cellCol, false);
  }
});

document.querySelector("#confirmPlacement").addEventListener("click", () => {
  if (!game.selected?.preview || previewError()) return;
  if (game.selected.mode === "forest") {
    discardSelectedTileForForest(game.selected.preview.row, game.selected.preview.col);
  } else if (game.selected.mode === "merge") {
    upgradeSelectedBuildingAt(game.selected.preview.row, game.selected.preview.col);
  } else if (game.selected.mode === "destroy") {
    destroySelectedBuildingAt(game.selected.preview.row, game.selected.preview.col);
  } else {
    placeBuilding(game.selected.preview.row, game.selected.preview.col);
  }
});
document.querySelector("#destroyBuilding").addEventListener("click", () => {
  if (game.over || activePlayer().type === "bot" || hasPendingChoices()) return;
  game.viewPlayerIndex = game.currentPlayerIndex;
  game.selected = { mode: "destroy", preview: null };
  addLog("Distruggi edificio: scegli un tuo edificio da rimuovere");
  renderAll();
});
document.querySelector("#cancelPlacement").addEventListener("click", () => {
  game.selected = null;
  renderAll();
});
document.querySelector("#passTurn").addEventListener("click", advanceTurn);
document.querySelector("#resetGame").addEventListener("click", resetGame);
document.querySelector("#startGame").addEventListener("click", resetGame);
returnToMenu.addEventListener("click", showStartScreen);
abandonGame.addEventListener("click", handleAbandonGame);
document.querySelectorAll("[data-player-count]").forEach((button) => {
  button.addEventListener("click", () => {
    const count = Number(button.dataset.playerCount);
    game.configuredPlayerCount = count;
    game.mode = count === 1 ? "solo" : "multiplayer";
    game.playerTypes = Array.from({ length: count }, (_, index) => (
      count === 1 ? "human" : game.playerTypes[index] ?? (index === 0 ? "human" : "bot")
    ));
    game.playerNames = Array.from({ length: count }, (_, index) => game.playerNames[index] ?? `G${index + 1}`);
    renderSetup();
  });
});
playerSetup.addEventListener("input", (event) => {
  const input = event.target.closest("[data-player-name]");
  if (!input) return;
  game.playerNames[Number(input.dataset.playerName)] = input.value;
});
playerSetup.addEventListener("change", (event) => {
  const select = event.target.closest("[data-player-type]");
  if (!select) return;
  game.playerTypes[Number(select.dataset.playerType)] = select.value;
  renderSetup();
});
document.querySelector("#clearLog").addEventListener("click", () => {
  log.innerHTML = "";
});
clearRecords.addEventListener("click", () => {
  localStorage.removeItem("fortressMergeRecords");
  renderHighscores();
});

document.querySelectorAll("[data-zoom]").forEach((button) => {
  button.addEventListener("click", () => {
    const direction = button.dataset.zoom;
    const target = button.dataset.zoomTarget;
    zooms[target] = direction === "in" ? Math.min(180, zooms[target] + 10) : Math.max(40, zooms[target] - 10);
    renderBoardZoom();
  });
});

showStartScreen();
