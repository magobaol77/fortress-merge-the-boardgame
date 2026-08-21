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
    prosperity: 3,
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
    effect: "Edificio difensivo: assorbe il passo del mostro",
    apply: () => {
      addLog("Muraglia piazzata come difesa sulla griglia");
    },
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
    diceByLevel: [[4], [4, 5]],
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
  prosperity: 0,
  vp: 0,
  pendingHits: 0,
  pendingPushes: 0,
  pendingReactivations: 0,
  pendingForestRemovals: 0,
  pendingEffects: [],
  pendingReactivationSources: [],
  deck: [],
  marketSlots: [],
  tokenIndex: 0,
  pendingLevelUps: 0,
  lastAttackRolls: [],
  selected: null,
  nextBuildingId: 1,
  buildingsOnBoard: [],
  forests: new Set(),
};

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

const levelUpThresholds = [
  { value: 11, resolved: false },
  { value: 21, resolved: false },
  { value: 31, resolved: false },
];

const endGameThreshold = { value: 34, resolved: false };

const zooms = {
  market: 100,
  personal: 100,
};

const roundValue = document.querySelector("#roundValue");
const prosperityValue = document.querySelector("#prosperityValue");
const vpValue = document.querySelector("#vpValue");
const forestValue = document.querySelector("#forestValue");
const hitValue = document.querySelector("#hitValue");
const pushValue = document.querySelector("#pushValue");
const cutValue = document.querySelector("#cutValue");
const levelValue = document.querySelector("#levelValue");
const diceValue = document.querySelector("#diceValue");
const marketTrack = document.querySelector("#marketTrack");
const prosperityTrack = document.querySelector("#prosperityTrack");
const prosperityTrackSide = document.querySelector("#prosperityTrackSide");
const deckInfo = document.querySelector("#deckInfo");
const tileLibrary = document.querySelector("#tileLibrary");
const log = document.querySelector("#eventLog");
const personalStage = document.querySelector("#personalStage");
const personalZoomLabel = document.querySelector("#personalZoomLabel");
const boardGrid = document.querySelector("#boardGrid");
const monsterLayer = document.querySelector("#monsterLayer");
const selectedTool = document.querySelector("#selectedTool");
const confirmPlacement = document.querySelector("#confirmPlacement");
const forestMode = document.querySelector("#forestMode");
const upgradeMode = document.querySelector("#upgradeMode");

function cellKey(row, col) {
  return `${row},${col}`;
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

function createTilePool() {
  return shuffle(buildings.flatMap((building) => (
    Array.from({ length: 5 }, (_, copyIndex) => ({
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
  game.marketSlots[game.tokenIndex] = { type: "token" };
  game.marketSlots.forEach((slot, index) => {
    if (!slot) game.marketSlots[index] = drawTile();
  });
}

function purchasableIndexes() {
  return [1, 2, 3].map((offset) => (game.tokenIndex + offset) % game.marketSlots.length);
}

function isPurchasable(slotIndex) {
  return purchasableIndexes().includes(slotIndex);
}

function placedCells(originRow, originCol, buildingId) {
  const shape = buildingShapes[buildingId];
  const bottomOffset = Math.max(...shape.map(([, y]) => y));
  return shape.map(([x, y]) => [originRow + y - bottomOffset, originCol + x]);
}

function buildingAt(row, col) {
  return game.buildingsOnBoard.find((building) => (
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

function validatePlacement(cells) {
  if (cells.some(([row, col]) => row < 0 || row >= rows || col < 0 || col >= cols)) {
    return "La tessera esce dalla griglia";
  }
  if (cells.some(([row, col]) => game.forests.has(cellKey(row, col)))) {
    return "Non puoi piazzare sopra un Bosco";
  }
  if (cells.some(([row, col]) => buildingAt(row, col))) {
    return "C'e gia un edificio in quelle caselle";
  }
  if (!isAdjacentToKingdom(cells)) {
    return "Devi piazzare adiacente alla riga di fondo o a una tua tessera";
  }
  return "";
}

function previewCells() {
  if (!game.selected?.preview || game.selected.mode !== "build") return [];
  return placedCells(game.selected.preview.row, game.selected.preview.col, game.selected.buildingId);
}

function isUpgradeableTarget(building) {
  return Boolean(building)
    && game.selected?.buildingId === building.id
    && building.id !== "muraglia"
    && building.level < 3;
}

function previewError() {
  if (game.selected?.mode === "forest") {
    if (!game.selected.preview) return "Scegli un Bosco";
    const key = cellKey(game.selected.preview.row, game.selected.preview.col);
    return game.forests.has(key) ? "" : "Scegli una casella Bosco";
  }
  if (game.selected?.mode === "upgrade") {
    if (!game.selected.preview) return "Scegli un edificio uguale";
    const target = buildingAt(game.selected.preview.row, game.selected.preview.col);
    if (!target) return "Scegli un edificio gia piazzato";
    if (target.id === "muraglia") return "La Muraglia non puo essere upgradata";
    if (target.id !== game.selected.buildingId) return "Scegli un edificio dello stesso tipo";
    if (target.level >= 3) return "Edificio gia al livello massimo";
    return "";
  }
  const cells = previewCells();
  return cells.length ? validatePlacement(cells) : "Scegli una casella";
}

function renderStats() {
  roundValue.textContent = game.round;
  prosperityValue.textContent = game.prosperity;
  vpValue.textContent = game.vp;
  forestValue.textContent = game.forests.size;
  hitValue.textContent = game.pendingEffects.filter((effect) => effect.type === "hit").length;
  pushValue.textContent = game.pendingEffects.filter((effect) => effect.type === "push").length;
  cutValue.textContent = game.pendingForestRemovals;
  levelValue.textContent = game.pendingLevelUps;
  diceValue.textContent = game.lastAttackRolls.length ? game.lastAttackRolls.join(" ") : "-";
}

function renderDice(values, matchedValues = []) {
  return values.map((value) => {
    const matchClass = matchedValues.includes(value) ? " matched" : "";
    return `<span class="die${matchClass}">${value}</span>`;
  }).join("");
}

function renderMonstersOnBoard() {
  monsterLayer.innerHTML = Object.entries(enemies).map(([key, enemy]) => {
    const left = (enemy.colStart / cols) * 100;
    const width = (enemy.width / cols) * 100;
    const top = enemy.position <= 0 ? (-12.5 + enemy.position * 12.5) : ((enemy.position - 1) / rows) * 100;
    const levelClass = game.pendingLevelUps > 0 && enemy.level < 2 ? " needs-level" : "";
    const targetClass = game.pendingEffects.some((effect) => effect.allowedEnemies.includes(key)) ? " can-target" : "";
    return `
      <button type="button" class="monster-token${levelClass}${targetClass}" data-level-board="${key}" style="left:${left}%; top:${top}%; width:${width}%;">
        <span class="monster-name">${enemy.name} L${enemy.level}</span>
        <span class="monster-damage">Danni ${enemy.damage}</span>
        <span class="monster-dice">${renderDice(activeDice(enemy), game.lastAttackRolls)}</span>
      </button>
    `;
  }).join("");
}

function renderBoardGrid() {
  const cells = [];
  const upgradePreviewBuilding = game.selected?.mode === "upgrade" && game.selected.preview
    ? buildingAt(game.selected.preview.row, game.selected.preview.col)
    : null;
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const forest = game.forests.has(cellKey(row, col));
      const building = buildingAt(row, col);
      const classes = ["board-cell"];
      if (forest) classes.push("forest");
      if (building) classes.push("building", `level-${building.level}`);
      if (game.selected?.mode === "build") {
        const targetCells = placedCells(row, col, game.selected.buildingId);
        classes.push(validatePlacement(targetCells) ? "blocked-target" : "placeable-target");
      }
      if (game.selected?.mode === "forest") {
        classes.push(forest ? "forest-target" : "blocked-target");
      }
      if (game.selected?.mode === "upgrade") {
        classes.push(isUpgradeableTarget(building) ? "placeable-target" : "blocked-target");
      }
      const preview = previewCells().some(([previewRow, previewCol]) => previewRow === row && previewCol === col);
      if (preview) classes.push(previewError() ? "preview-invalid" : "preview-valid");
      if (game.selected?.mode === "forest" && game.selected.preview?.row === row && game.selected.preview?.col === col) {
        classes.push(previewError() ? "preview-invalid" : "preview-valid");
      }
      if (game.selected?.mode === "upgrade" && upgradePreviewBuilding?.cells.some(([previewRow, previewCol]) => previewRow === row && previewCol === col)) {
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
  if (slot?.type === "token") {
    return `<div class="market-slot token" style="${style}"><span>Token</span><strong>Acquisto</strong><em>#${index + 1}</em></div>`;
  }
  if (!slot) {
    return `<div class="market-slot empty" style="${style}">Pool vuoto</div>`;
  }

  const building = getBuilding(slot.buildingId);
  const available = isPurchasable(index);
  const availableRank = purchasableIndexes().indexOf(index) + 1;
  const selected = game.selected?.slotIndex === index;
  const tag = available ? "button" : "article";
  const data = available ? `type="button" data-select-build="${index}"` : "";

  return `
    <${tag} class="market-slot ${available ? "available" : ""} ${selected ? "selected" : ""}" ${data} style="${style}" aria-label="${available ? `Compra ${building.name}` : building.name}">
      ${renderPolyomino(building, true)}
      <h3>${building.name}</h3>
      ${available ? `<span class="buy-label">Compra ${availableRank}</span>` : ""}
    </${tag}>
  `;
}

function renderMarket() {
  deckInfo.textContent = `Pool: ${game.deck.length} | Token: ${game.tokenIndex + 1}`;
  marketTrack.innerHTML = game.marketSlots.map(renderMarketSlot).join("");
}

function renderProsperityTrack() {
  const maxValue = 34;
  const attackByValue = new Map(attackThresholds.map((threshold) => [threshold.value, threshold]));
  const levelByValue = new Map(levelUpThresholds.map((threshold) => [threshold.value, threshold]));
  const markup = Array.from({ length: maxValue + 1 }, (_, value) => {
    const attack = attackByValue.get(value);
    const level = levelByValue.get(value);
    const reached = game.prosperity >= value;
    const current = game.prosperity === value;
    const classes = ["prosperity-cell"];
    if (attack || level) classes.push("danger");
    if (value === endGameThreshold.value) classes.push("final");
    if (reached) classes.push("reached");
    if (current) classes.push("current");
    const label = attack ? `${attack.dice}d` : level ? "LU" : value === endGameThreshold.value ? "+2PV" : value;
    return `<span class="${classes.join(" ")}" title="Prosperita ${value}">${label}</span>`;
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

function renderSelectedTool() {
  if (!game.selected) {
    selectedTool.textContent = `Nessuna tessera`;
    confirmPlacement.disabled = true;
    forestMode.disabled = true;
    upgradeMode.disabled = true;
    forestMode.textContent = "Bosco";
    upgradeMode.textContent = "Upgrade";
    return;
  }
  const building = getBuilding(game.selected.buildingId);
  const error = previewError();
  const action = game.selected.mode === "forest" ? "Rimuovi Bosco" : game.selected.mode === "upgrade" ? "Upgrade" : "Piazza";
  selectedTool.textContent = game.selected.preview
    ? `${action} ${building.name}: ${error || "preview valida, conferma"}`
    : `${action} ${building.name}: clicca una casella`;
  confirmPlacement.disabled = Boolean(error);
  forestMode.disabled = false;
  upgradeMode.disabled = building.id === "muraglia";
  forestMode.textContent = game.selected.mode === "forest" ? "Piazza" : "Bosco";
  upgradeMode.textContent = game.selected.mode === "upgrade" ? "Piazza" : "Upgrade";
}

function renderAll() {
  renderStats();
  renderMonstersOnBoard();
  renderBoardGrid();
  renderMarket();
  renderProsperityTrack();
  renderTiles();
  renderBoardZoom();
  renderSelectedTool();
}

function completeMarketAction(building) {
  const previousProsperity = game.prosperity;
  game.prosperity += building.prosperity;
  movePurchaseTokenFromSelection();
  resolveProsperityTriggers(previousProsperity);
}

function enemiesForCells(cells) {
  const usedCols = new Set(cells.map(([, col]) => col));
  return Object.entries(enemies)
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
    addLog(`${reactivation ? "Riattiva Reggia" : "Reggia"}: +2 PV`);
  } else if (building.id === "segheria") {
    game.pendingForestRemovals += 3;
    addLog(`${reactivation ? "Riattiva Segheria" : "Segheria"}: 3 rimozioni Bosco disponibili`);
  } else if (building.id === "caserma") {
    queueTargetEffects("hit", 1, reactivation ? "Riattiva Caserma" : "Caserma", cells);
  } else if (building.id === "cannoni") {
    queueTargetEffects("hit", 2, reactivation ? "Riattiva Cannoni" : "Cannoni", cells);
  } else if (building.id === "cavalleria") {
    queueTargetEffects("push", 2, reactivation ? "Riattiva Cavalleria" : "Cavalleria", cells);
  } else if (building.id === "torre" && !reactivation) {
    game.pendingReactivations += 1;
    game.pendingReactivationSources.push({ instanceId: instance.instanceId, cells });
    addLog("Torre: clicca un singolo edificio adiacente da riattivare");
  } else if (building.id === "muraglia") {
    addLog("Muraglia piazzata: al primo colpo diventa danneggiata");
  }
}

function resolveProsperityTriggers(previousProsperity) {
  attackThresholds.forEach((threshold) => {
    if (!threshold.resolved && previousProsperity < threshold.value && game.prosperity >= threshold.value) {
      threshold.resolved = true;
      addLog(`Soglia Prosperita ${threshold.value}: Attacco da ${threshold.dice} dadi`);
      resolveAttack(threshold.dice);
    }
  });

  levelUpThresholds.forEach((threshold) => {
    if (!threshold.resolved && previousProsperity < threshold.value && game.prosperity >= threshold.value) {
      threshold.resolved = true;
      addLog(`Soglia Prosperita ${threshold.value}: scegli un mostro da livellare`);
      game.pendingLevelUps += 1;
      game.selected = null;
    }
  });

  if (!endGameThreshold.resolved && previousProsperity < endGameThreshold.value && game.prosperity >= endGameThreshold.value) {
    endGameThreshold.resolved = true;
    game.vp += 2;
    addLog("Prosperita 34: +2 PV, fine partita");
  }
}

function selectMarketAction(slotIndex, mode) {
  if (!isPurchasable(slotIndex)) {
    addLog("Puoi scegliere solo una delle 3 tessere successive al token Acquisto");
    return;
  }
  const slot = game.marketSlots[slotIndex];
  if (!slot || slot.type === "token") {
    addLog("Quello spazio non contiene una tessera acquistabile");
    return;
  }
  game.selected = { buildingId: slot.buildingId, mode: "build", slotIndex, preview: null };
  const building = getBuilding(slot.buildingId);
  addLog(`Selezionata ${building.name}: clicca una casella per vedere la forma`);
  renderAll();
}

function movePurchaseTokenFromSelection() {
  const boughtSlotIndex = game.selected?.slotIndex;
  const oldTokenIndex = game.tokenIndex;
  if (Number.isInteger(boughtSlotIndex)) {
    game.marketSlots[boughtSlotIndex] = { type: "token" };
    game.marketSlots[oldTokenIndex] = drawTile();
    game.tokenIndex = boughtSlotIndex;
  }
}

function placeBuilding(row, col) {
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
    level: building.id === "muraglia" ? 2 : 1,
    cells,
  };
  game.buildingsOnBoard.push(placedBuilding);
  game.nextBuildingId += 1;
  applyPlacedBuildingEffect(building, cells, placedBuilding);
  completeMarketAction(building);
  addLog(`Piazzato ${building.name} in riga ${row + 1}, colonna ${col + 1}`);
  game.selected = null;
  renderAll();
}

function discardSelectedTileForForest(row, col) {
  const key = cellKey(row, col);
  if (!game.selected || !game.forests.has(key)) {
    addLog("Scegli una casella Bosco da rimuovere");
    renderSelectedTool();
    return;
  }
  const building = getBuilding(game.selected.buildingId);
  game.forests.delete(key);
  completeMarketAction(building);
  addLog(`${building.name} scartata: rimosso Bosco in riga ${row + 1}, colonna ${col + 1}`);
  game.selected = null;
  renderAll();
}

function previewPlacement(row, col) {
  if (!game.selected) return;
  game.selected.preview = { row, col };
  renderAll();
}

function upgradeSelectedBuildingAt(row, col) {
  const target = buildingAt(row, col);
  const building = getBuilding(game.selected.buildingId);
  const error = previewError();
  if (error) {
    addLog(error);
    renderSelectedTool();
    return;
  }
  target.level += 1;
  game.vp += 1;
  applyPlacedBuildingEffect(building, target.cells, target);
  completeMarketAction(building);
  addLog(`${target.name} upgrade a livello ${target.level}: +1 PV e effetto attivato`);
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
  if (consumeMarketTile) {
    completeMarketAction(getBuilding(game.selected.buildingId));
    game.selected = null;
  } else {
    game.pendingForestRemovals -= 1;
  }
  addLog(`Bosco rimosso in riga ${row + 1}, colonna ${col + 1}`);
  renderAll();
}

function damageBuilding(building) {
  if (building.id === "muraglia" && building.level > 1) {
    building.level = 1;
    building.short = "MUR!";
    addLog("Muraglia colpita: diventa danneggiata");
    return;
  }
  if (building.level > 1) {
    building.level -= 1;
    addLog(`${building.name} assorbe il passo e scende al livello ${building.level}`);
    return;
  }
  game.buildingsOnBoard = game.buildingsOnBoard.filter((item) => item.instanceId !== building.instanceId);
  addLog(`${building.name} assorbe il passo e viene distrutto`);
}

function advanceEnemy(key) {
  const enemy = enemies[key];
  if (enemy.position < 0) {
    enemy.position += 1;
    addLog(`${enemy.name} torna alla partenza`);
    return;
  }
  const targetRow = enemy.position;
  if (targetRow >= rows) {
    addLog(`${enemy.name} supera il fondo: eliminazione`);
    return;
  }

  const coveredBuildings = new Map();
  for (let col = enemy.colStart; col < enemy.colStart + enemy.width; col += 1) {
    const building = buildingAt(targetRow, col);
    if (building) coveredBuildings.set(building.instanceId, building);
  }

  if (coveredBuildings.size > 0) {
    coveredBuildings.forEach(damageBuilding);
    renderAll();
    return;
  }

  enemy.position = Math.min(rows, enemy.position + 1);
  addLog(`${enemy.name} avanza alla riga ${enemy.position}`);
  if (enemy.position >= rows) addLog(`${enemy.name} raggiunge il fondo: eliminazione`);
}

function resolveAttack(diceCount = 2) {
  game.lastAttackRolls = Array.from({ length: diceCount }, rollDie);
  addLog(`Attacco: dadi ${game.lastAttackRolls.join(", ")}`);

  Object.entries(enemies).forEach(([key, enemy]) => {
    const matches = game.lastAttackRolls.filter((roll) => activeDice(enemy).includes(roll)).length;
    for (let i = 0; i < matches; i += 1) {
      advanceEnemy(key);
    }
    if (matches > 0) addLog(`${enemy.name}: ${matches} match`);
  });

  renderAll();
}

function levelUpEnemy(key) {
  const enemy = enemies[key];
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
  renderAll();
}

function applyHitToEnemy(key) {
  const enemy = enemies[key];
  enemy.damage += 1;
  addLog(`Danno su ${enemy.name}: ${enemy.damage}/3`);
  if (enemy.damage >= 3) {
    enemy.damage = 0;
    enemy.position = 0;
    addLog(`${enemy.name} sconfitto: torna fuori dalla griglia`);
  }
}

function applyPushToEnemy(key) {
  const enemy = enemies[key];
  enemy.position = Math.max(-1, enemy.position - 1);
  addLog(`Spinta su ${enemy.name}`);
}

function applyPendingEffectToEnemy(key) {
  const effectIndex = game.pendingEffects.findIndex((effect) => effect.allowedEnemies.includes(key));
  if (effectIndex < 0) {
    addLog("Quel mostro non e nelle colonne dell'effetto disponibile");
    return;
  }
  const [effect] = game.pendingEffects.splice(effectIndex, 1);
  if (effect.type === "hit") applyHitToEnemy(key);
  if (effect.type === "push") applyPushToEnemy(key);
  renderAll();
}

function reactivateBuildingAt(row, col) {
  const target = buildingAt(row, col);
  if (!target) return false;
  if (target.id === "torre") {
    addLog("La Torre non riattiva un'altra Torre in questa bozza");
    return true;
  }
  const sourceIndex = game.pendingReactivationSources.findIndex((source) => areAdjacentCells(source.cells, target.cells));
  if (sourceIndex < 0) {
    addLog("Seleziona un edificio adiacente alla Torre");
    return true;
  }
  game.pendingReactivationSources.splice(sourceIndex, 1);
  game.pendingReactivations -= 1;
  applyPlacedBuildingEffect(getBuilding(target.id), target.cells, target, true);
  renderAll();
  return true;
}

function resetGame() {
  Object.assign(game, {
    round: 1,
    prosperity: 0,
    vp: 0,
    pendingHits: 0,
    pendingPushes: 0,
    pendingReactivations: 0,
    pendingForestRemovals: 0,
    pendingEffects: [],
    pendingReactivationSources: [],
    deck: [],
    marketSlots: [],
    tokenIndex: 0,
    pendingLevelUps: 0,
    lastAttackRolls: [],
    selected: null,
    nextBuildingId: 1,
    buildingsOnBoard: [],
    forests: new Set(initialForests.map(([row, col]) => cellKey(row, col))),
  });
  setupMarketTrack();

  Object.assign(enemies.left, { level: 1, position: 0, damage: 0 });
  Object.assign(enemies.center, { level: 1, position: 0, damage: 0 });
  Object.assign(enemies.right, { level: 1, position: 0, damage: 0 });
  attackThresholds.forEach((threshold) => { threshold.resolved = false; });
  levelUpThresholds.forEach((threshold) => { threshold.resolved = false; });
  endGameThreshold.resolved = false;
  log.innerHTML = "";
  addLog("Setup solo mode su plancia personale pronto");
  renderAll();
}

document.addEventListener("click", (event) => {
  const actionTarget = event.target.closest("[data-select-build], [data-level-board], [data-row]");
  if (!actionTarget) return;

  const selectBuild = actionTarget.dataset.selectBuild;
  const levelBoardKey = actionTarget.dataset.levelBoard;
  const row = actionTarget.dataset.row;
  const col = actionTarget.dataset.col;

  if (selectBuild !== undefined) selectMarketAction(Number(selectBuild), "build");
  if (levelBoardKey) {
    if (game.pendingLevelUps > 0) levelUpEnemy(levelBoardKey);
    else applyPendingEffectToEnemy(levelBoardKey);
  }

  if (row !== undefined && col !== undefined) {
    const cellRow = Number(row);
    const cellCol = Number(col);
    if (game.selected?.mode === "build" || game.selected?.mode === "forest" || game.selected?.mode === "upgrade") previewPlacement(cellRow, cellCol);
    else if (game.pendingReactivations > 0 && reactivateBuildingAt(cellRow, cellCol)) return;
    else if (game.pendingForestRemovals > 0) removeForestAt(cellRow, cellCol, false);
  }
});

document.querySelector("#confirmPlacement").addEventListener("click", () => {
  if (!game.selected?.preview || previewError()) return;
  if (game.selected.mode === "forest") {
    discardSelectedTileForForest(game.selected.preview.row, game.selected.preview.col);
  } else if (game.selected.mode === "upgrade") {
    upgradeSelectedBuildingAt(game.selected.preview.row, game.selected.preview.col);
  } else {
    placeBuilding(game.selected.preview.row, game.selected.preview.col);
  }
});
document.querySelector("#forestMode").addEventListener("click", () => {
  if (!game.selected) return;
  game.selected.mode = game.selected.mode === "forest" ? "build" : "forest";
  game.selected.preview = null;
  renderAll();
});
document.querySelector("#upgradeMode").addEventListener("click", () => {
  if (!game.selected || game.selected.buildingId === "muraglia") return;
  game.selected.mode = game.selected.mode === "upgrade" ? "build" : "upgrade";
  game.selected.preview = null;
  renderAll();
});
document.querySelector("#cancelPlacement").addEventListener("click", () => {
  game.selected = null;
  renderAll();
});
document.querySelector("#resetGame").addEventListener("click", resetGame);
document.querySelector("#clearLog").addEventListener("click", () => {
  log.innerHTML = "";
});

document.querySelectorAll("[data-zoom]").forEach((button) => {
  button.addEventListener("click", () => {
    const direction = button.dataset.zoom;
    const target = button.dataset.zoomTarget;
    zooms[target] = direction === "in" ? Math.min(180, zooms[target] + 10) : Math.max(60, zooms[target] - 10);
    renderBoardZoom();
  });
});

resetGame();
