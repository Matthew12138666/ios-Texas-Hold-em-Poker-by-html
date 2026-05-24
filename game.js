/**
 * Texas Hold'em Offline — 布局、盲注、发牌、调试工具
 */

(function () {
  "use strict";

  var SUITS = ["spades", "hearts", "diamonds", "clubs"];
  var RANKS = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
  var SUIT_SYMBOLS = {
    spades: "\u2660",
    hearts: "\u2665",
    diamonds: "\u2666",
    clubs: "\u2667"
  };
  var RANK_LABELS = {
    2: "2",
    3: "3",
    4: "4",
    5: "5",
    6: "6",
    7: "7",
    8: "8",
    9: "9",
    10: "10",
    11: "J",
    12: "Q",
    13: "K",
    14: "A"
  };
  var RED_SUITS = { hearts: true, diamonds: true };

  var SUIT_NAME_ZH = {
    spades: "黑桃",
    hearts: "红桃",
    diamonds: "方块",
    clubs: "梅花"
  };

  var HAND_CATEGORY = {
    HIGH_CARD: 0,
    ONE_PAIR: 1,
    TWO_PAIR: 2,
    THREE_OF_KIND: 3,
    STRAIGHT: 4,
    FLUSH: 5,
    FULL_HOUSE: 6,
    FOUR_OF_KIND: 7,
    STRAIGHT_FLUSH: 8
  };

  var HAND_CATEGORY_NAME_ZH = {
    0: "High card",
    1: "One pair",
    2: "Two pair",
    3: "Three of a kind",
    4: "Straight",
    5: "Flush",
    6: "Full house",
    7: "Four of a kind",
    8: "Straight flush"
  };

  var AI_DIFFICULTIES = [
    { level: 1, stars: 1, id: "pdb", name: "PDB" },
    { level: 2, stars: 2, id: "novice", name: "Novice" },
    { level: 3, stars: 3, id: "sc", name: "SC" },
    { level: 4, stars: 4, id: "advanced", name: "Advanced" },
    { level: 5, stars: 5, id: "chow", name: "周潤發" }
  ];

  var MIN_AI = 1;
  var MAX_AI = 8;
  var STARTING_CHIPS = 10000;
  var BLIND_PRESETS = [
    { smallBlind: 10, bigBlind: 20, label: "10 / 20" },
    { smallBlind: 50, bigBlind: 100, label: "50 / 100" },
    { smallBlind: 100, bigBlind: 200, label: "100 / 200" }
  ];
  var DEAL_STAGGER_MS = 120;
  var BOARD_STAGGER_MS = 180;
  var DEAL_ANIM_MS = 420;

  var gameSettings = {
    aiPlayerCount: 1,
    aiDifficulty: AI_DIFFICULTIES[0],
    blindPresetIndex: 1,
    loopCount: 1,
    startingChips: STARTING_CHIPS
  };

  var PHASE = {
    LOBBY: "LOBBY",
    DEALING: "DEALING",
    PREFLOP: "PREFLOP",
    FLOP: "FLOP",
    TURN: "TURN",
    RIVER: "RIVER",
    SHOWDOWN: "SHOWDOWN",
    HAND_END: "HAND_END",
    TOURNAMENT_OVER: "TOURNAMENT_OVER"
  };

  var PHASE_LABEL_ZH = {
    LOBBY: "Menu",
    DEALING: "Dealing",
    PREFLOP: "Preflop",
    FLOP: "Flop",
    TURN: "Turn",
    RIVER: "River",
    SHOWDOWN: "Showdown",
    HAND_END: "Hand end",
    TOURNAMENT_OVER: "Tournament over"
  };

  var AI_FAST_DELAY_MIN = 60;
  var AI_FAST_DELAY_MAX = 140;
  var JOKE_POOL = [
    "撸网贷",
    "割肾",
    "人在缅甸, 刚下飞机",
    "王从天降",
    "17张牌你能秒我? ",
    "在穿着内裤摆摊卖衣服", 
    "造个大电", "外卖到了", 
    "网卡了", "今天不想赢", "手汗", 
    "断触", "误触", "帧率低", "没手感", 
    "瓶颈期", "刚睡醒", "没支架", "460了", 
    "掉帧了", "没戴耳机", "手机太烫了", "腱鞘炎犯了", 
    "对面开了", "刚换手机膜", "上了个厕所", "没状态", 
    "刚睡醒", "网线被猫咬了", "路由器冒烟了", "基站被雷劈了", 
    "蓝牙没电了", "鼠标没电了", "驱动没更", "蓝屏了", 
    "电脑被pdb黑了", "手机太亮了", "刚吃了辣肚子疼", "刚才有人路过挡光了", 
    "牌位有点歪", "刚接了个电话", "煤气没关", "绿色桌子", 
    "在偷pdb的内裤抵债", 
    "没皮肤", "没配件", "差一丝", "没大电了", 
    "闪退了", "打野没帮", "辅助不跟", "双c给切", 
    "对抗梦游", "惩歪了", "大歪了", "给控了", 
    "差一把莫桑比克", "马了马了", "hjp抢我配件", "开了吧",  "轻快绷住", "松弛绷住", "舒缓绷住", "安逸绷住", 
    "自在绷住", "悠闲绷住", "悠然绷住", "闲适绷住", "惬意绷住", "舒畅绷住", "畅快绷住", "舒坦绷住", "放松绷住", 
    "从容绷住", "淡定绷住", "坦然绷住", "轻便绷住", "轻巧绷住", "轻盈绷住", "轻捷绷住", "轻闲绷住", "清闲绷住", 
    "闲散绷住", "怡然绷住", "怡悦绷住", "欢畅绷住", "松快绷住", "松爽绷住", "宽心绷住", "省心绷住", "省力绷住", 
    "省事绷住", "无碍绷住", "没绷住", "无忧绷住", "悠然绷住", "神怡绷住", "心宽绷住", "心静绷住", "淡然绷住", 
    "恬淡绷住", "轻缓绷住", "安稳绷住", "安然绷住"
    
    
    // 使用方法示例：
    // 在 AI 思考的气泡中或结算时，直接随机取一句：
    // var randomJoke = JOKE_POOL[Math.floor(Math.random() * JOKE_POOL.length)];  

  ];

  /* ================================================ */

  var gameState = {
    deck: [],
    players: [],
    playersClockwise: [],
    board: [],
    pot: 0,
    dealerIndex: 0,
    dealerId: null,
    isDealing: false,
    godEyeOn: false,
    phase: PHASE.LOBBY,
    handActive: false,
    currentBetLevel: 0,
    minRaise: 0,
    actionSeatIndex: -1,
    loopRunning: false,
    heroFoldedThisHand: false,
    // 单轮下注圈数封顶限制（全场累计 4 次 Raise 后锁死，只能 Call/Fold）
    bettingCap: {
      streetBetCycles: 0, 
      maxCycles: 4
    },
    // 摊牌专用异步队列与跳过状态控制器
    showdownCtrl: {
      running: false,
      skipped: false,
      timers: []
    },
    tournament: {
      state: "LOBBY", // LOBBY | IN_PROGRESS | TOURNAMENT_OVER
      loopsTarget: 1,
      loopsCompleted: 0,
      seatsPerLoop: 0,
      dealerRotations: 0
    },
    // 新增回合控制Token，防止异步下注引起死锁卡死
    turnEngine: {
      token: 0,
      scheduled: false
    },
    // 筹码结算原子性锁：结算过程中禁止任何其他逻辑操作余额
    isProcessingSettlement: false,
    // BB 预发牌决策异步等待标记（Skip 兜底）
    bbPreDealResolve: null,
    // BB 预发牌阶段标志（Hero 为 BB 时，动作按钮路由到 BB 专用逻辑）
    isBBPreDealPhase: false,
    bbPreDealPlayer: null,
    bbPreDealCallAmount: 0
  };

  var dealCtrl = {
    generation: 0,
    skipRequested: false,
    finishedGen: -1
  };

  /* ================================================ */

  var dom = {};

  function formatChips(value) {
    var n = Number(value);
    if (!Number.isFinite(n)) {
      return "0";
    }
    return n.toLocaleString("en-US");
  }

  function starsString(count) {
    var s = "";
    var i;
    for (i = 0; i < count; i += 1) {
      s += "\u2605";
    }
    for (i = count; i < 5; i += 1) {
      s += "\u2606";
    }
    return s;
  }

  function delay(ms) {
    return new Promise(function (resolve) {
      window.setTimeout(resolve, ms);
    });
  }

  // 【核心重构】安全解耦绑定函数 —— 每个元素统一兜底，绝不因缺失节点中断脚本
  function bindDom() {
    // ---------- 全局容器与应用壳 ----------
    dom.app = document.getElementById("app") || document.createElement("div"); // 应用根节点，兜底

    // ---------- 状态栏 ----------
    dom.statusBar = document.querySelector(".status-bar") || document.createElement("header");
    dom.gamePhaseLabel = document.getElementById("game-phase-label") || document.createElement("span"); // 阶段标签，兜底
    dom.btnOpenLobby = document.getElementById("btn-open-lobby") || document.createElement("button"); // 设置按钮

    // ---------- 游戏舞台 / 桌面核心 ----------
    dom.tableStage = document.getElementById("table-stage") || document.createElement("main");
    dom.felt = document.getElementById("felt") || document.createElement("section");
    dom.aiRailLeft = document.getElementById("ai-rail-left") || document.createElement("aside"); // 左侧 AI 轨道
    dom.aiRailRight = document.getElementById("ai-rail-right") || document.createElement("aside"); // 右侧 AI 轨道
    dom.boardCards = document.getElementById("board-cards") || document.createElement("div");
    dom.deckOrigin = document.getElementById("deck-origin") || document.createElement("div");

    // ---------- 底池与公共牌中心区 ----------
    dom.potAmount = document.getElementById("pot-amount") || document.createElement("span");
    dom.potDisplay = document.getElementById("pot-display") || document.createElement("div");

    // ---------- 玩家英雄区域 ----------
    dom.heroZone = document.getElementById("hero-zone") || document.createElement("section"); // 玩家座位容器
    dom.heroHoleCards = document.getElementById("hero-hole-cards") || document.createElement("div");
    dom.heroChips = document.getElementById("hero-chips") || document.createElement("span");
    dom.heroActionBubble = document.getElementById("hero-action-bubble") || document.createElement("div");
    dom.heroDealerBadge = document.getElementById("hero-dealer-badge") || document.createElement("span"); // 庄家徽章
    dom.heroBlindBadge = document.getElementById("hero-blind-badge") || document.createElement("span"); // 盲注徽章

    // ---------- 行动栏与下注操作 ----------
    dom.actionBar = document.getElementById("action-bar") || document.createElement("footer");
    dom.actionHint = document.getElementById("action-hint") || document.createElement("span");
    dom.toCall = document.getElementById("to-call") || document.createElement("span");
    dom.btnFold = document.getElementById("btn-fold") || document.createElement("button");
    dom.btnCheck = document.getElementById("btn-check") || document.createElement("button");
    dom.btnCall = document.getElementById("btn-call") || document.createElement("button");
    dom.btnRaise = document.getElementById("btn-raise") || document.createElement("button");
    dom.btnAllin = document.getElementById("btn-allin") || document.createElement("button");
    dom.raiseMultiples = document.getElementById("raise-multiples") || document.createElement("div"); // 倍数加注面板

    // ---------- 全局金手指 / 退出游戏 ----------
    dom.btnGodEye = document.getElementById("btn-god-eye") || document.createElement("button");
    dom.btnExitGame = document.getElementById("btn-exit-game") || document.createElement("button");
    dom.cheatPanel = document.getElementById("cheat-panel") || document.createElement("aside");
    dom.cheatToggle = document.getElementById("cheat-toggle") || document.createElement("button");
    dom.btnInfiniteChips = document.getElementById("btn-infinite-chips") || document.createElement("button");
    dom.btnSkipDeal = document.getElementById("btn-skip-deal") || document.createElement("button");

    // ---------- 大厅覆盖层与配置面板（致命：之前 showLobby/hideLobby 因 lobbyOverlay 未绑定而崩溃） ----------
    dom.lobbyOverlay = document.getElementById("lobby-overlay") || document.createElement("div"); // 大厅遮罩层
    dom.btnStartGame = document.getElementById("btn-start-game") || document.createElement("button"); // 开始游戏按钮

    // ---------- 大厅步进器组件（AI 数量） ----------
    dom.aiCountDisplay = document.getElementById("ai-count-display") || document.createElement("output");
    dom.btnAiMinus = document.getElementById("btn-ai-minus") || document.createElement("button");
    dom.btnAiPlus = document.getElementById("btn-ai-plus") || document.createElement("button");

    // ---------- 大厅步进器组件（循环圈数） ----------
    dom.loopCountDisplay = document.getElementById("loop-count-display") || document.createElement("output");
    dom.btnLoopMinus = document.getElementById("btn-loop-minus") || document.createElement("button");
    dom.btnLoopPlus = document.getElementById("btn-loop-plus") || document.createElement("button");

    // ---------- 盲注 / 初始筹码 / AI 难度选择 ----------
    dom.blindPresetSelect = document.getElementById("blind-preset-select") || document.createElement("select");
    dom.startingChipsInput = document.getElementById("starting-chips-input") || document.createElement("input");
    dom.difficultyList = document.getElementById("difficulty-list") || document.createElement("div"); // 动态 AI 难度卡片父容器

    // ---------- 大厅底部摘要标签 ----------
    dom.summaryPlayers = document.getElementById("summary-players") || document.createElement("strong");
    dom.summaryDifficulty = document.getElementById("summary-difficulty") || document.createElement("strong");
    dom.summaryBlinds = document.getElementById("summary-blinds") || document.createElement("strong");
    dom.summaryLoops = document.getElementById("summary-loops") || document.createElement("strong");
    dom.summaryStartingChips = document.getElementById("summary-starting-chips") || document.createElement("strong");

    // ---------- 牌局结束遮罩 ----------
    dom.handEndOverlay = document.getElementById("hand-end-overlay") || document.createElement("div");
    dom.handEndSummary = document.getElementById("hand-end-summary") || document.createElement("pre");
    dom.btnNextHand = document.getElementById("btn-next-hand") || document.createElement("button");
    dom.btnHandEndLobby = document.getElementById("btn-hand-end-lobby") || document.createElement("button");

    // ---------- 摊牌 / 跳过动画 ----------
    dom.btnSkipShowdown = document.getElementById("btn-skip-showdown") || document.createElement("button");
    dom.showdownTitle = document.getElementById("showdown-title") || document.createElement("div");
    dom.showdownBanner = document.getElementById("showdown-banner") || document.createElement("pre");
    dom.handEvalLog = document.getElementById("hand-eval-log") || document.createElement("div");
    // 摊牌结算状态栏：显示赢家结果与下一步引导提示文字
    dom.showdownStatus = document.getElementById("showdown-status") || document.createElement("div");
  }

  function createCard(suit, rank) {
    return { suit: suit, rank: rank, id: suit + "-" + rank };
  }

  function createStandardDeck() {
    var deck = [];
    var si;
    var ri;
    for (si = 0; si < SUITS.length; si += 1) {
      for (ri = 0; ri < RANKS.length; ri += 1) {
        deck.push(createCard(SUITS[si], RANKS[ri]));
      }
    }
    return deck;
  }

  function fisherYatesShuffle(cards) {
    var deck = cards.slice();
    var i;
    var j;
    var temp;
    for (i = deck.length - 1; i > 0; i -= 1) {
      j = Math.floor(Math.random() * (i + 1));
      temp = deck[i];
      deck[i] = deck[j];
      deck[j] = temp;
    }
    return deck;
  }

  function drawFromDeck() {
    if (gameState.deck.length === 0) {
      return null;
    }
    return gameState.deck.pop();
  }

  function getBlindAmounts() {
    var preset = BLIND_PRESETS[gameSettings.blindPresetIndex];
    if (!preset) {
      return BLIND_PRESETS[1];
    }
    return preset;
  }

  function rankLabel(rank) {
    return RANK_LABELS[rank] || String(rank);
  }

  function getRankCounts(ranks) {
    var map = {};
    var entries = [];
    var r;
    var i;
    for (i = 0; i < ranks.length; i += 1) {
      map[ranks[i]] = (map[ranks[i]] || 0) + 1;
    }
    for (r in map) {
      if (Object.prototype.hasOwnProperty.call(map, r)) {
        entries.push({ rank: parseInt(r, 10), count: map[r] });
      }
    }
    entries.sort(function (a, b) {
      if (b.count !== a.count) {
        return b.count - a.count;
      }
      return b.rank - a.rank;
    });
    return entries;
  }

  function getStraightHighCard(ranks) {
    var rankSet = {};
    var high;
    var i;
    for (i = 0; i < ranks.length; i += 1) {
      rankSet[ranks[i]] = true;
    }
    if (rankSet[14] && rankSet[5] && rankSet[4] && rankSet[3] && rankSet[2]) {
      return 5;
    }
    for (high = 14; high >= 5; high -= 1) {
      if (
        rankSet[high] &&
        rankSet[high - 1] &&
        rankSet[high - 2] &&
        rankSet[high - 3] &&
        rankSet[high - 4]
      ) {
        return high;
      }
    }
    return 0;
  }

  function isRoyalStraight(ranks) {
    var i;
    var need = { 10: true, 11: true, 12: true, 13: true, 14: true };
    var has = {};
    for (i = 0; i < ranks.length; i += 1) {
      has[ranks[i]] = true;
    }
    for (i = 10; i <= 14; i += 1) {
      if (!has[i]) {
        return false;
      }
    }
    return true;
  }

  function tiebreakToScore(category, tiebreak) {
    var score = category;
    var i;
    var mult = 15;
    for (i = 0; i < tiebreak.length; i += 1) {
      score = score * mult + tiebreak[i];
    }
    return score;
  }

  function compareEvaluations(a, b) {
    var i;
    var len;
    var va;
    var vb;
    if (a.category !== b.category) {
      return a.category - b.category;
    }
    len = Math.max(a.tiebreak.length, b.tiebreak.length);
    for (i = 0; i < len; i += 1) {
      va = a.tiebreak[i] || 0;
      vb = b.tiebreak[i] || 0;
      if (va !== vb) {
        return va - vb;
      }
    }
    return 0;
  }

  function combinations5From7(cards) {
    var combos = [];
    var a;
    var b;
    var c;
    var d;
    var e;
    for (a = 0; a < 3; a += 1) {
      for (b = a + 1; b < 4; b += 1) {
        for (c = b + 1; c < 5; c += 1) {
          for (d = c + 1; d < 6; d += 1) {
            for (e = d + 1; e < 7; e += 1) {
              combos.push([cards[a], cards[b], cards[c], cards[d], cards[e]]);
            }
          }
        }
      }
    }
    return combos;
  }

  function evaluateFiveCards(cards) {
    var ranks = [];
    var suits = [];
    var i;
    var isFlush;
    var straightHigh;
    var counts;
    var category;
    var tiebreak;
    var kickers;
    var pairRank;
    var secondPair;
    var tripRank;
    var quadRank;
    var flushSuit;
    var categoryName;
    var isRoyal;

    if (!cards || cards.length !== 5) {
      return null;
    }

    for (i = 0; i < 5; i += 1) {
      ranks.push(cards[i].rank);
      suits.push(cards[i].suit);
    }

    ranks.sort(function (x, y) {
      return y - x;
    });

    isFlush = suits[0] === suits[1] && suits[1] === suits[2] && suits[2] === suits[3] && suits[3] === suits[4];
    straightHigh = getStraightHighCard(ranks);
    counts = getRankCounts(ranks);
    flushSuit = suits[0];

    if (isFlush && straightHigh > 0) {
      isRoyal = straightHigh === 14 && isRoyalStraight(ranks);
      category = HAND_CATEGORY.STRAIGHT_FLUSH;
      tiebreak = [straightHigh];
      categoryName = isRoyal ? "Royal straight flush" : HAND_CATEGORY_NAME_ZH[8];
      return {
        category: category,
        categoryName: categoryName,
        tiebreak: tiebreak,
        score: tiebreakToScore(category, tiebreak),
        bestFive: cards.slice(),
        isRoyal: isRoyal,
        flushSuit: flushSuit
      };
    }

    if (counts[0].count === 4) {
      quadRank = counts[0].rank;
      kickers = [];
      for (i = 0; i < counts.length; i += 1) {
        if (counts[i].count === 1) {
          kickers.push(counts[i].rank);
        }
      }
      category = HAND_CATEGORY.FOUR_OF_KIND;
      tiebreak = [quadRank, kickers[0]];
      return {
        category: category,
        categoryName: HAND_CATEGORY_NAME_ZH[7],
        tiebreak: tiebreak,
        score: tiebreakToScore(category, tiebreak),
        bestFive: cards.slice()
      };
    }

    if (counts[0].count === 3 && counts[1].count === 2) {
      category = HAND_CATEGORY.FULL_HOUSE;
      tiebreak = [counts[0].rank, counts[1].rank];
      return {
        category: category,
        categoryName: HAND_CATEGORY_NAME_ZH[6],
        tiebreak: tiebreak,
        score: tiebreakToScore(category, tiebreak),
        bestFive: cards.slice()
      };
    }

    if (isFlush) {
      category = HAND_CATEGORY.FLUSH;
      tiebreak = ranks.slice();
      return {
        category: category,
        categoryName: HAND_CATEGORY_NAME_ZH[5],
        tiebreak: tiebreak,
        score: tiebreakToScore(category, tiebreak),
        bestFive: cards.slice(),
        flushSuit: flushSuit
      };
    }

    if (straightHigh > 0) {
      category = HAND_CATEGORY.STRAIGHT;
      tiebreak = [straightHigh];
      return {
        category: category,
        categoryName: HAND_CATEGORY_NAME_ZH[4],
        tiebreak: tiebreak,
        score: tiebreakToScore(category, tiebreak),
        bestFive: cards.slice()
      };
    }

    if (counts[0].count === 3) {
      tripRank = counts[0].rank;
      kickers = [];
      for (i = 1; i < counts.length; i += 1) {
        kickers.push(counts[i].rank);
      }
      category = HAND_CATEGORY.THREE_OF_KIND;
      tiebreak = [tripRank, kickers[0], kickers[1]];
      return {
        category: category,
        categoryName: HAND_CATEGORY_NAME_ZH[3],
        tiebreak: tiebreak,
        score: tiebreakToScore(category, tiebreak),
        bestFive: cards.slice()
      };
    }

    if (counts[0].count === 2 && counts[1].count === 2) {
      if (counts[0].rank > counts[1].rank) {
        pairRank = counts[0].rank;
        secondPair = counts[1].rank;
      } else {
        pairRank = counts[1].rank;
        secondPair = counts[0].rank;
      }
      kickers = [];
      for (i = 0; i < counts.length; i += 1) {
        if (counts[i].count === 1) {
          kickers.push(counts[i].rank);
        }
      }
      category = HAND_CATEGORY.TWO_PAIR;
      tiebreak = [pairRank, secondPair, kickers[0]];
      return {
        category: category,
        categoryName: HAND_CATEGORY_NAME_ZH[2],
        tiebreak: tiebreak,
        score: tiebreakToScore(category, tiebreak),
        bestFive: cards.slice(),
        pairHigh: pairRank,
        pairLow: secondPair,
        kicker: kickers[0]
      };
    }

    if (counts[0].count === 2) {
      pairRank = counts[0].rank;
      kickers = [];
      for (i = 1; i < counts.length; i += 1) {
        kickers.push(counts[i].rank);
      }
      category = HAND_CATEGORY.ONE_PAIR;
      tiebreak = [pairRank, kickers[0], kickers[1], kickers[2]];
      return {
        category: category,
        categoryName: HAND_CATEGORY_NAME_ZH[1],
        tiebreak: tiebreak,
        score: tiebreakToScore(category, tiebreak),
        bestFive: cards.slice(),
        pairRank: pairRank,
        kickers: kickers
      };
    }

    category = HAND_CATEGORY.HIGH_CARD;
    tiebreak = ranks.slice();
    return {
      category: category,
      categoryName: HAND_CATEGORY_NAME_ZH[0],
      tiebreak: tiebreak,
      score: tiebreakToScore(category, tiebreak),
      bestFive: cards.slice()
    };
  }

  function combinations5FromN(cards) {
    var combos = [];
    var n = cards.length;
    var a;
    var b;
    var c;
    var d;
    var e;
    if (n < 5) {
      return combos;
    }
    if (n === 5) {
      return [cards.slice()];
    }
    for (a = 0; a < n - 4; a += 1) {
      for (b = a + 1; b < n - 3; b += 1) {
        for (c = b + 1; c < n - 2; c += 1) {
          for (d = c + 1; d < n - 1; d += 1) {
            for (e = d + 1; e < n; e += 1) {
              combos.push([cards[a], cards[b], cards[c], cards[d], cards[e]]);
            }
          }
        }
      }
    }
    return combos;
  }

  function evaluateBestFromCards(cards) {
    var combos;
    var best = null;
    var i;
    var ev;
    if (!cards || cards.length < 5) {
      return null;
    }
    if (cards.length === 5) {
      return evaluateFiveCards(cards);
    }
    if (cards.length === 7) {
      return evaluateHand(cards);
    }
    combos = combinations5FromN(cards);
    for (i = 0; i < combos.length; i += 1) {
      ev = evaluateFiveCards(combos[i]);
      if (!ev) {
        continue;
      }
      if (!best || compareEvaluations(ev, best) > 0) {
        best = ev;
      }
    }
    return best;
  }

  function evaluateHand(cards) {
    var combos;
    var best = null;
    var i;
    var ev;

    if (!cards || cards.length < 5) {
      return null;
    }

    if (cards.length === 5) {
      return evaluateFiveCards(cards);
    }

    if (cards.length !== 7) {
      return null;
    }

    combos = combinations5From7(cards);
    for (i = 0; i < combos.length; i += 1) {
      ev = evaluateFiveCards(combos[i]);
      if (!ev) {
        continue;
      }
      if (!best || compareEvaluations(ev, best) > 0) {
        best = ev;
      }
    }
    return best;
  }

  function formatHandDescription(evalResult) {
    var label;
    var suitZh;
    if (!evalResult) {
      return "Fuck pdb, such shit code that cant be calculated";
    }
    label = evalResult.categoryName;
    if (evalResult.isRoyal) {
      return "Royal straight flush (" + SUIT_NAME_ZH[evalResult.flushSuit] + ")";
    }
    if (evalResult.category === HAND_CATEGORY.STRAIGHT_FLUSH && evalResult.flushSuit) {
      return "Straight flush (" + SUIT_NAME_ZH[evalResult.flushSuit] + ")";
    }
    if (evalResult.category === HAND_CATEGORY.FLUSH && evalResult.flushSuit) {
      return "Flush (" + SUIT_NAME_ZH[evalResult.flushSuit] + ")";
    }
    if (evalResult.category === HAND_CATEGORY.FOUR_OF_KIND) {
      return "Four of a kind (" + rankLabel(evalResult.tiebreak[0]) + ")";
    }
    if (evalResult.category === HAND_CATEGORY.FULL_HOUSE) {
      return "Full house (" + rankLabel(evalResult.tiebreak[0]) + " with " + rankLabel(evalResult.tiebreak[1]) + ")";
    }
    if (evalResult.category === HAND_CATEGORY.STRAIGHT) {
      if (evalResult.tiebreak[0] === 5) {
        return "Straight (A-2-3-4-5 wheel)";
      }
      return "Straight (High card" + rankLabel(evalResult.tiebreak[0]) + ")";
    }
    if (evalResult.category === HAND_CATEGORY.THREE_OF_KIND) {
      return "Three of a kind (" + rankLabel(evalResult.tiebreak[0]) + ")";
    }
    if (evalResult.category === HAND_CATEGORY.TWO_PAIR) {
      return "Two pair (" + rankLabel(evalResult.pairHigh) + " and " + rankLabel(evalResult.pairLow) + "kickers " + rankLabel(evalResult.kicker) + ")";
    }
    if (evalResult.category === HAND_CATEGORY.ONE_PAIR) {
      return "One pair (" + rankLabel(evalResult.pairRank) + "kickers " + rankLabel(evalResult.kickers[0]) + "/" + rankLabel(evalResult.kickers[1]) + "/" + rankLabel(evalResult.kickers[2]) + ")";
    }
    return label + " (" + rankLabel(evalResult.tiebreak[0]) + "High)";
  }

  function getPlayerAllCards(player) {
    var cards = [];
    var i;
    if (!player || player.holeCards.length < 2) {
      return null;
    }
    for (i = 0; i < player.holeCards.length; i += 1) {
      cards.push(player.holeCards[i]);
    }
    for (i = 0; i < gameState.board.length; i += 1) {
      cards.push(gameState.board[i]);
    }
    return cards.length >= 5 ? cards : null;
  }

  function evaluatePlayerHand(player) {
    var cards = getPlayerAllCards(player);
    if (!cards) {
      return null;
    }
    return evaluateBestFromCards(cards);
  }

  function logAllPlayerHandRankings() {
    var lines = [];
    var i;
    var player;
    var ev;
    var desc;
    for (i = 0; i < gameState.players.length; i += 1) {
      player = gameState.players[i];
      ev = evaluatePlayerHand(player);
      if (!ev) {
        desc = "Cards not enough (2 hole cards + 5 board cards)";
      } else {
        desc = formatHandDescription(ev) + " · Score " + ev.score;
      }
      lines.push(player.name + "：" + desc);
    }
    return lines;
  }

  function showHandEvaluations() {
    var lines = logAllPlayerHandRankings();
    var text = lines.join("\n");
    console.log("[God's eye] Current best hand\n" + text);
    if (dom.handEvalLog) {
      dom.handEvalLog.textContent = text;
      dom.handEvalLog.classList.remove("is-hidden");
    }
  }

  function hideHandEvaluations() {
    if (dom.handEvalLog) {
      dom.handEvalLog.classList.add("is-hidden");
      dom.handEvalLog.textContent = "";
    }
  }

  function isRedSuit(suit) {
    return RED_SUITS[suit] === true;
  }

  function isDealCancelled(gen) {
    return dealCtrl.skipRequested || dealCtrl.generation !== gen;
  }

  function waitIfDealing(ms, gen) {
    if (isDealCancelled(gen)) {
      return Promise.resolve(false);
    }
    return delay(ms).then(function () {
      return !isDealCancelled(gen);
    });
  }

  function beginDealSession() {
    dealCtrl.generation += 1;
    dealCtrl.skipRequested = false;
    dealCtrl.finishedGen = -1;
    return dealCtrl.generation;
  }

  function requestSkipDeal() {
    dealCtrl.skipRequested = true;
  }

  function buildFaceCardElement(card) {
    var el = document.createElement("div");
    var rankEl = document.createElement("span");
    var suitEl = document.createElement("span");
    var red = isRedSuit(card.suit);
    el.className = "card card--face";
    el.dataset.cardId = card.id;
    rankEl.className = "card__rank" + (red ? " card__rank--red" : "");
    rankEl.textContent = RANK_LABELS[card.rank];
    suitEl.className = "card__suit card__suit--" + card.suit;
    suitEl.setAttribute("aria-hidden", "true");
    suitEl.textContent = SUIT_SYMBOLS[card.suit];
    el.appendChild(rankEl);
    el.appendChild(suitEl);
    return el;
  }

  function buildBackCardElement() {
    var el = document.createElement("div");
    el.className = "card card--back";
    el.setAttribute("aria-label", "Back");
    return el;
  }

  function buildBoardFlipElement(card, instant) {
    var container = document.createElement("div");
    var inner = document.createElement("div");
    var backFace = document.createElement("div");
    var face = buildFaceCardElement(card);
    container.className = "card--flip-container";
    inner.className = "card--flip-inner";
    if (instant) {
      inner.classList.add("is-flipped-instant");
    }
    backFace.className = "card--flip-face card--back";
    face.classList.add("card--flip-face");
    inner.appendChild(backFace);
    inner.appendChild(face);
    container.appendChild(inner);
    container.dataset.cardId = card.id;
    return { container: container, inner: inner };
  }

  function getDeckOriginOffset(targetEl) {
    var originRect = dom.deckOrigin.getBoundingClientRect();
    var targetRect = targetEl.getBoundingClientRect();
    var ox = originRect.left + originRect.width / 2;
    var oy = originRect.top + originRect.height / 2;
    var tx = targetRect.left + targetRect.width / 2;
    var ty = targetRect.top + targetRect.height / 2;
    return { x: ox - tx, y: oy - ty };
  }

  function animateCardDeal(cardEl, hostEl, instant) {
    if (instant) {
      cardEl.classList.add("card--instant");
      hostEl.appendChild(cardEl);
      return Promise.resolve();
    }
    var offset = getDeckOriginOffset(hostEl);
    cardEl.classList.add("card--dealing");
    cardEl.style.setProperty("--deal-from-x", offset.x + "px");
    cardEl.style.setProperty("--deal-from-y", offset.y + "px");
    hostEl.appendChild(cardEl);
    return new Promise(function (resolve) {
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          cardEl.classList.add("card--dealt");
          window.setTimeout(resolve, DEAL_ANIM_MS);
        });
      });
    });
  }

  function animateBoardFlip(flipBundle, instant) {
    if (instant) {
      flipBundle.inner.classList.add("is-flipped-instant");
      return Promise.resolve();
    }
    return new Promise(function (resolve) {
      requestAnimationFrame(function () {
        flipBundle.inner.classList.add("is-flipped");
        window.setTimeout(resolve, 400);
      });
    });
  }

  function createSeatBadges() {
    var dealerBadge = document.createElement("span");
    var blindBadge = document.createElement("span");
    dealerBadge.className = "seat-badge seat-badge--dealer is-hidden";
    dealerBadge.textContent = "\u24B7";
    dealerBadge.title = "Dealer";
    blindBadge.className = "seat-badge seat-badge--blind is-hidden";
    return { dealerBadge: dealerBadge, blindBadge: blindBadge };
  }

  function createAiSeatElement(aiIndex, side) {
    var seat = document.createElement("article");
    var badges = createSeatBadges();
    var chipsOverlay = document.createElement("div");
    var info = document.createElement("div");
    var avatar = document.createElement("div");
    var meta = document.createElement("div");
    var name = document.createElement("h2");
    var chipsRow = document.createElement("p");
    var chipIcon = document.createElement("span");
    var chipsVal = document.createElement("span");
    var holeCards = document.createElement("div");
    var actionBubble = document.createElement("div");
    var betTag = document.createElement("div");
    var handTag = document.createElement("div"); // 用于显化摊牌最大五张牌型文本

    seat.className = "ai-seat ai-seat--" + side;
    seat.dataset.aiIndex = String(aiIndex);
    seat.setAttribute("aria-label", "AI player No." + (aiIndex + 1));

    info.className = "player-info";
    avatar.className = "player-avatar player-avatar--ai";
    avatar.textContent = String(aiIndex + 1);
    meta.className = "player-meta";
    name.className = "player-name";
    name.textContent = "AI " + (aiIndex + 1);
    chipsRow.className = "player-chips";
    chipIcon.className = "chip-icon";
    chipIcon.setAttribute("aria-hidden", "true");
    chipsVal.className = "player-chips__value";
    chipsVal.textContent = formatChips(gameSettings.startingChips || STARTING_CHIPS);
    chipsRow.appendChild(chipIcon);
    chipsRow.appendChild(chipsVal);
    meta.appendChild(name);
    meta.appendChild(chipsRow);
    info.appendChild(avatar);
    info.appendChild(meta);

    holeCards.className = "hole-cards hole-cards--ai-inner";

    chipsOverlay.className = "seat-chips-overlay";
    chipsOverlay.innerHTML =
      '<span class="chip-icon" aria-hidden="true"></span><span class="seat-chips-overlay__value">' +
      formatChips(gameSettings.startingChips || STARTING_CHIPS) +
      "</span>";

    actionBubble.className = "seat-action-bubble is-hidden";
    actionBubble.setAttribute("aria-hidden", "true");

    betTag.className = "seat-hand-tag bet-tag is-hidden";
    betTag.setAttribute("aria-hidden", "true");

    handTag.className = "seat-hand-tag hand-desc-tag is-hidden";
    handTag.setAttribute("aria-hidden", "true");

    seat.appendChild(badges.dealerBadge);
    seat.appendChild(badges.blindBadge);
    seat.appendChild(chipsOverlay);
    seat.appendChild(actionBubble);
    seat.appendChild(betTag);
    seat.appendChild(handTag);

    if (side === "left") {
      seat.appendChild(info);
      seat.appendChild(holeCards);
    } else {
      seat.appendChild(holeCards);
      seat.appendChild(info);
    }

    return {
      seatEl: seat,
      holeCardsEl: holeCards,
      chipsEl: chipsVal,
      chipsOverlayEl: chipsOverlay.querySelector(".seat-chips-overlay__value"),
      actionBubbleEl: actionBubble,
      betTagEl: betTag,
      handTagEl: handTag,
      dealerBadgeEl: badges.dealerBadge,
      blindBadgeEl: badges.blindBadge
    };
  }

  function renderAiSeats(count) {
    // 右侧 AI 数量 = ceil(count/2)，左侧 = 剩余
    var rightCount = Math.ceil(count / 2);
    var i;
    var side;
    var rail;
    var parts;
    var seat;

    dom.aiRailLeft.innerHTML = "";
    dom.aiRailRight.innerHTML = "";

    // 右侧轨道：AI#1(上)→AI#2→... (索引 0 → rightCount-1，自上而下)
    for (i = 0; i < rightCount; i += 1) {
      parts = createAiSeatElement(i, "right");
      seat = parts.seatEl;
      if (count >= 6) {
        seat.classList.add("ai-seat--many");
      }
      dom.aiRailRight.appendChild(seat);
    }

    // 左侧轨道：AI#max(上)→AI#max-1→... (索引 count-1 → rightCount，自上而下)
    for (i = count - 1; i >= rightCount; i -= 1) {
      parts = createAiSeatElement(i, "left");
      seat = parts.seatEl;
      if (count >= 6) {
        seat.classList.add("ai-seat--many");
      }
      dom.aiRailLeft.appendChild(seat);
    }
  }

  function getHeroPlayerBase() {
    var betTag = null;
    var handTag = null;
    if (dom.heroZone) {
      betTag = dom.heroZone.querySelector(".hero-bet-tag");
      handTag = dom.heroZone.querySelector(".hero-hand-tag");
      
      // 如果 DOM 中不存在下注标签，动态创建兜底
      if (!betTag) {
        betTag = document.createElement("div");
        betTag.className = "seat-hand-tag hero-bet-tag is-hidden";
        betTag.setAttribute("aria-hidden", "true");
        dom.heroZone.appendChild(betTag);
      }
      // 如果 DOM 中不存在牌型标签，动态创建兜底
      if (!handTag) {
        handTag = document.createElement("div");
        handTag.className = "seat-hand-tag hero-hand-tag is-hidden";
        handTag.setAttribute("aria-hidden", "true");
        dom.heroZone.appendChild(handTag);
      }
    }
    return {
      id: "hero",
      type: "hero",
      name: "You",
      chips: gameSettings.startingChips || STARTING_CHIPS,
      holeCards: [],
      currentBet: 0,
      folded: false,
      allIn: false,
      eliminated: false,
      hasActedThisRound: false,
      seatEl: dom.heroZone,
      holeCardsEl: dom.heroHoleCards,
      chipsEl: dom.heroChips,
      chipsOverlayEl: null,
      actionBubbleEl: dom.heroActionBubble,
      betTagEl: betTag,
      handTagEl: handTag,
      dealerBadgeEl: dom.heroDealerBadge,
      blindBadgeEl: dom.heroBlindBadge,
      isFaceUp: true
    };
  }

  function buildPlayersList() {
    var list = [];
    var hero = getHeroPlayerBase();
    var i;
    var seatNode;
    var parts;

    list.push(hero);

    for (i = 0; i < gameSettings.aiPlayerCount; i += 1) {
      seatNode = document.querySelector('.ai-seat[data-ai-index="' + i + '"]');
      if (!seatNode) {
        continue;
      }
      parts = {
        holeCardsEl: seatNode.querySelector(".hole-cards"),
        chipsEl: seatNode.querySelector(".player-chips__value"),
        chipsOverlayEl: seatNode.querySelector(".seat-chips-overlay__value"),
        actionBubbleEl: seatNode.querySelector(".seat-action-bubble"),
        betTagEl: seatNode.querySelector(".seat-hand-tag"),
        handTagEl: seatNode.querySelectorAll(".seat-hand-tag")[1],
        dealerBadgeEl: seatNode.querySelector(".seat-badge--dealer"),
        blindBadgeEl: seatNode.querySelector(".seat-badge--blind")
      };
      list.push({
        id: "ai-" + i,
        type: "ai",
        index: i,
        name: "AI " + (i + 1),
        chips: gameSettings.startingChips || STARTING_CHIPS,
        holeCards: [],
        currentBet: 0,
        folded: false,
        allIn: false,
        eliminated: false,
        hasActedThisRound: false,
        seatEl: seatNode,
        holeCardsEl: parts.holeCardsEl,
        chipsEl: parts.chipsEl,
        chipsOverlayEl: parts.chipsOverlayEl,
        actionBubbleEl: parts.actionBubbleEl,
        betTagEl: parts.betTagEl,
        handTagEl: parts.handTagEl,
        dealerBadgeEl: parts.dealerBadgeEl,
        blindBadgeEl: parts.blindBadgeEl,
        isFaceUp: false
      });
    }
    return list;
  }

  /** 顺时针顺序：右侧AI(上到下) → Hero → 左侧AI(下到上) */
  function buildClockwiseOrder(players) {
    var hero = null;
    var ais = [];
    var totalAi;
    var heroIndex;
    var ordered = [];
    var i;
    var ai;

    for (i = 0; i < players.length; i += 1) {
      if (players[i].type === "hero") {
        hero = players[i];
      } else {
        ais.push(players[i]);
      }
    }

    if (!hero) {
      return players.slice();
    }

    totalAi = ais.length;
    heroIndex = Math.ceil(totalAi / 2);

    // 右侧 AI：索引 0 → heroIndex-1 (AI#1, AI#2, ...)
    for (i = 0; i < heroIndex && i < totalAi; i += 1) {
      ordered.push(ais[i]);
    }
    // Hero 固定在正下方
    ordered.push(hero);
    // 左侧 AI：索引 heroIndex → totalAi-1 (按顺时针，下到上)
    for (i = heroIndex; i < totalAi; i += 1) {
      ordered.push(ais[i]);
    }
    return ordered;
  }

  function updatePotDisplay() {
    if (dom.potAmount) {
      dom.potAmount.textContent = formatChips(gameState.pot);
    }
  }

  function updatePlayerChipsDisplay(player) {
    var text = formatChips(player.chips);
    if (player.chipsEl) {
      player.chipsEl.textContent = text;
    }
    if (player.chipsOverlayEl) {
      player.chipsOverlayEl.textContent = text;
    }
  }

  function clearAllCards() {
    dom.heroHoleCards.innerHTML = "";
    dom.boardCards.innerHTML = "";
    var holes = document.querySelectorAll(".ai-seat .hole-cards");
    var i;
    for (i = 0; i < holes.length; i += 1) {
      holes[i].innerHTML = "";
    }
  }

  function hideAllSeatBadges() {
    var badges = document.querySelectorAll(".seat-badge");
    var i;
    for (i = 0; i < badges.length; i += 1) {
      badges[i].classList.add("is-hidden");
      badges[i].classList.remove("seat-badge--sb", "seat-badge--bb");
    }
  }

  function getBlindSeatIndices() {
    var n = gameState.playersClockwise.length;
    var d = gameState.dealerIndex;
    if (n === 2) {
      return { sb: d, bb: (d + 1) % 2 };
    }
    return { sb: (d + 1) % n, bb: (d + 2) % n };
  }

  function updateSeatRoleBadges() {
    var n = gameState.playersClockwise.length;
    var d = gameState.dealerIndex;
    var blinds = getBlindSeatIndices();
    var amounts = getBlindAmounts();
    var sb = blinds.sb;
    var bb = blinds.bb;
    var i;
    var player;

    hideAllSeatBadges();

    for (i = 0; i < n; i += 1) {
      player = gameState.playersClockwise[i];
      if (!player.dealerBadgeEl || !player.blindBadgeEl) {
        continue;
      }
      if (i === d) {
        player.dealerBadgeEl.classList.remove("is-hidden");
      }
      if (i === sb) {
        player.blindBadgeEl.textContent = "SB " + formatChips(amounts.smallBlind);
        player.blindBadgeEl.classList.add("seat-badge--sb");
        player.blindBadgeEl.classList.remove("is-hidden");
      }
      if (i === bb) {
        player.blindBadgeEl.textContent = "BB " + formatChips(amounts.bigBlind);
        player.blindBadgeEl.classList.add("seat-badge--bb");
        player.blindBadgeEl.classList.remove("is-hidden");
      }
    }
  }

  // 【小盲强扣】发牌前仅强制扣除 SB，BB 随后自主选择 Call 或 Raise
  function postSmallBlind() {
    var amounts = getBlindAmounts();
    var blinds = getBlindSeatIndices();
    var sbIdx = blinds.sb;
    var sbPlayer = gameState.playersClockwise[sbIdx];
    var sbPay = Math.min(amounts.smallBlind, sbPlayer.chips);

    gameState.pot = 0;

    sbPlayer.chips -= sbPay;
    sbPlayer.currentBet = sbPay;
    if (sbPlayer.chips === 0) { sbPlayer.allIn = true; }

    gameState.pot = sbPay;

    if (sbPlayer.betTagEl) {
      updateBetTagForPlayer(sbPlayer);
    }

    updatePlayerChipsDisplay(sbPlayer);
    updatePotDisplay();
    updateSeatRoleBadges();
  }

  // 【BB 预发牌决策】BB 自主选择 Call (2x SB) 或 Raise (2x/4x/6x/8x/10x SB)
  // 返回 Promise，resolve 时 BB 已完成下注；Hero 为 BB 时等待玩家点击按钮
  function resolveBBPreDealAction(gen) {
    return new Promise(function (resolve) {
      var amounts = getBlindAmounts();
      var blinds = getBlindSeatIndices();
      var bbIdx = blinds.bb;
      var bbPlayer = gameState.playersClockwise[bbIdx];
      var callAmount = amounts.bigBlind;

      if (isDealCancelled(gen)) { resolve(); return; }

      if (bbPlayer.type === "hero") {
        // 存储 resolve 引用供 Skip 兜底
        gameState.bbPreDealResolve = resolve;
        gameState.isBBPreDealPhase = true;
        gameState.bbPreDealPlayer = bbPlayer;
        gameState.bbPreDealCallAmount = callAmount;
        if (isDealCancelled(gen)) {
          cleanupBBPreDealState();
          var callPay = Math.min(callAmount, bbPlayer.chips);
          bbPlayer.chips -= callPay;
          bbPlayer.currentBet += callPay;
          gameState.pot += callPay;
          if (bbPlayer.chips === 0) { bbPlayer.allIn = true; }
          updateBetTagForPlayer(bbPlayer);
          updatePlayerChipsDisplay(bbPlayer);
          updatePotDisplay();
          resolve();
          return;
        }

        // 设置 BB 专用的临时下注环境
        gameState.currentBetLevel = callAmount;
        gameState.minRaise = amounts.bigBlind;

        // 【BB锁死修复】发牌期间 CSS 规则 .app.is-dealing .action-bar 有 pointer-events:none，
        // 这会屏蔽整个 action-bar 的所有按钮点击。必须先卸掉 is-dealing 类名恢复交互。
        if (dom.app) { dom.app.classList.remove("is-dealing"); }

        // Hero 是大盲：弹出 Call / Raise 按钮等待玩家决策
        setActionBarEnabled(true);
        showRaiseMultiples();
        if (dom.actionHint) { dom.actionHint.textContent = "You are BB: Call or Raise"; }
        if (dom.toCall) { dom.toCall.textContent = formatChips(callAmount); }
        if (dom.btnCheck) { dom.btnCheck.disabled = true; }
        if (dom.btnFold) { dom.btnFold.disabled = false; dom.btnFold.querySelector(".btn__subtitle").textContent = "Give up BB"; }
        if (dom.btnCall) {
          dom.btnCall.disabled = false;
          dom.btnCall.querySelector(".btn__subtitle").textContent = "Call " + formatChips(callAmount);
        }
        if (dom.btnRaise) {
          dom.btnRaise.disabled = false;
          dom.btnRaise.querySelector(".btn__subtitle").textContent = "To " + formatChips(callAmount + amounts.smallBlind * 2);
        }
        if (dom.btnAllin) { dom.btnAllin.disabled = false; }

        // 更新倍数按钮的实时金额副标题
        updateBBRaiseMultipleLabels(bbPlayer, callAmount);
        return;
      }

      // AI 是大盲：AI 引擎决策，先延迟等待（模拟思考）再执行
      var delayMs = getAiThinkDelayMs();
      window.setTimeout(function () {
        if (isDealCancelled(gen)) { resolve(); return; }
        var level = gameSettings.aiDifficulty.level;
        var bbDecision = "call";
        if (window.AIEngine && window.AIEngine.makeBBAction) {
          bbDecision = window.AIEngine.makeBBAction(bbPlayer.holeCards, callAmount, level);
        }
        gameState.currentBetLevel = callAmount;
        gameState.minRaise = getBlindAmounts().bigBlind;
        if (bbDecision === "call") {
          applyPlayerAction(bbPlayer, "call", {});
        } else if (bbDecision === "raise") {
          applyPlayerAction(bbPlayer, "raise", { raiseTotal: callAmount * 2 });
        }
        gameState.currentBetLevel = Math.max(callAmount, bbPlayer.currentBet);
        updateBetTagForPlayer(bbPlayer);
        updatePlayerChipsDisplay(bbPlayer);
        updatePotDisplay();
        resolve();
      }, delayMs);
    });
  }

  // 清理 BB 预发牌阶段的所有临时状态
  function cleanupBBPreDealState() {
    gameState.bbPreDealResolve = null;
    gameState.isBBPreDealPhase = false;
    gameState.bbPreDealPlayer = null;
    gameState.bbPreDealCallAmount = 0;
  }

  // 更新 BB 预发牌阶段倍数 Raise 按钮的实时金额副标题
  function updateBBRaiseMultipleLabels(bbPlayer, callAmount) {
    if (!dom.raiseMultiples) { return; }
    var btns = dom.raiseMultiples.querySelectorAll(".raise-multiples__btn");
    var mults = [2, 4, 6, 8, 10];
    btns.forEach(function (btn, idx) {
      var m = mults[idx] || 2;
      var target = callAmount * m;
      if (target > bbPlayer.currentBet + bbPlayer.chips) {
        target = bbPlayer.currentBet + bbPlayer.chips;
      }
      var subEl = btn.querySelector(".btn__subtitle");
      if (subEl) {
        subEl.textContent = "raise to " + formatChips(target);
      }
    });
  }

  function rotateDealerForNextHand() {
    // 牌局结束后刷新存活玩家列表，并在存活玩家中轮转庄家
    var active = buildClockwiseOrder(
      gameState.players.filter(function (p) {
        return p && !p.eliminated && p.chips > 0;
      })
    );
    var i;
    var curIdx = 0;
    var n;
    gameState.playersClockwise = active;
    assignSeatIndices();
    n = gameState.playersClockwise.length;
    if (n === 0) {
      gameState.dealerIndex = 0;
      gameState.dealerId = null;
      return;
    }
    if (gameState.dealerId) {
      for (i = 0; i < n; i += 1) {
        if (gameState.playersClockwise[i].id === gameState.dealerId) {
          curIdx = i;
          break;
        }
      }
    } else {
      curIdx = Math.max(0, Math.min(n - 1, gameState.dealerIndex));
      gameState.dealerId = gameState.playersClockwise[curIdx].id;
    }
    gameState.dealerIndex = (curIdx + 1) % n;
    gameState.dealerId = gameState.playersClockwise[gameState.dealerIndex].id;
  }

  function setDealingUi(active) {
    gameState.isDealing = active;
    if (dom.app) {
      dom.app.classList.toggle("is-dealing", active);
    }
    if (dom.btnStartGame) {
      dom.btnStartGame.disabled = active;
    }
    if (dom.btnSkipDeal) {
      dom.btnSkipDeal.classList.toggle("is-hidden", !active);
    }
  }

  function renderHoleCardForPlayer(player, card, instant) {
    var showFace = player.isFaceUp || gameState.godEyeOn;
    var cardEl = showFace ? buildFaceCardElement(card) : buildBackCardElement();
    if (!player.holeCardsEl) {
      return Promise.resolve();
    }
    return animateCardDeal(cardEl, player.holeCardsEl, instant);
  }

  function renderBoardCardAtIndex(index, card, instant) {
    var flipBundle = buildBoardFlipElement(card, instant);
    if (index === 3 || index === 4) {
      flipBundle.container.classList.add("card--gap-before");
    }
    dom.boardCards.appendChild(flipBundle.container);
    return animateBoardFlip(flipBundle, instant);
  }

  function renderAllCardsInstant() {
    var i;
    var r;
    var player;
    var card;

    clearAllCards();

    for (i = 0; i < gameState.players.length; i += 1) {
      player = gameState.players[i];
      for (r = 0; r < player.holeCards.length; r += 1) {
        card = player.holeCards[r];
        renderHoleCardForPlayer(player, card, true);
      }
    }

    for (i = 0; i < gameState.board.length; i += 1) {
      renderBoardCardAtIndex(i, gameState.board[i], true);
    }
  }

  async function dealHoleCardsAnimated(gen) {
    var round;
    var i;
    var player;
    var card;
    var ok;

    for (round = 0; round < 2; round += 1) {
      for (i = 0; i < gameState.playersClockwise.length; i += 1) {
        if (isDealCancelled(gen)) {
          return false;
        }
        player = gameState.playersClockwise[i];
        card = player.holeCards[round];
        if (!card || !player.holeCardsEl) {
          continue;
        }
        await renderHoleCardForPlayer(player, card, false);
        ok = await waitIfDealing(DEAL_STAGGER_MS, gen);
        if (!ok) {
          return false;
        }
      }
    }
    return true;
  }

  async function dealBoardAnimated(gen) {
    var i;
    var card;
    var ok;

    for (i = 0; i < 5; i += 1) {
      if (isDealCancelled(gen)) {
        return false;
      }
      card = gameState.board[i];
      if (!card) {
        continue;
      }
      await renderBoardCardAtIndex(i, card, false);
      ok = await waitIfDealing(BOARD_STAGGER_MS, gen);
      if (!ok) {
        return false;
      }
    }
    return true;
  }

  function collectHoleCardsFromDeck() {
    var i;
    var player;
    gameState.players.forEach(function (p) {
      p.holeCards = [];
    });
    for (i = 0; i < gameState.playersClockwise.length; i += 1) {
      player = gameState.playersClockwise[i];
      player.holeCards.push(drawFromDeck());
      player.holeCards.push(drawFromDeck());
    }
  }

  function finishInitialDeal(gen) {
    if (dealCtrl.finishedGen === gen) {
      return;
    }
    dealCtrl.finishedGen = gen;

    if (isDealCancelled(gen)) {
      renderAllCardsInstant();
    }

    setDealingUi(false);
    assignSeatIndices();
    updateSeatRoleBadges();
    updateAllSeatVisuals();
    beginPreflopBetting();
    console.log("[Game] Entering preflop betting round", { pot: gameState.pot, dealer: gameState.dealerIndex });
  }

  async function runDealAnimation(gen) {
    var ok;
    var i;

    gameState.board = [];
    dom.boardCards.innerHTML = "";

    for (i = 0; i < gameState.playersClockwise.length; i += 1) {
      resetPlayerHandFlags(gameState.playersClockwise[i]);
    }

    // 第一步：小盲强扣
    postSmallBlind();
    ok = await waitIfDealing(200, gen);
    if (!ok) {
      finishInitialDeal(gen);
      return;
    }

    // 第二步：大盲自主决策 Call/Raise（Hero 为 BB 时等待点击按钮）
    await resolveBBPreDealAction(gen);
    if (isDealCancelled(gen)) {
      finishInitialDeal(gen);
      return;
    }

    ok = await waitIfDealing(300, gen);
    if (!ok) {
      finishInitialDeal(gen);
      return;
    }

    // 第三步：发牌
    ok = await dealHoleCardsAnimated(gen);
    finishInitialDeal(gen);
  }

  function skipDealAnimation() {
    var i;
    var r;
    var player;
    if (!gameState.isDealing) {
      return;
    }
    requestSkipDeal();
    // 如果在等待 BB 预发牌决策，自动结算为 Call
     if (gameState.bbPreDealResolve) {
       var resolve = gameState.bbPreDealResolve;
       cleanupBBPreDealState();
       setActionBarEnabled(false);
       hideRaiseMultiples();
       if (dom.actionHint) { dom.actionHint.textContent = "Dealing…"; }
       resolve();
     }
    clearAllCards();
    for (i = 0; i < gameState.players.length; i += 1) {
      player = gameState.players[i];
      for (r = 0; r < player.holeCards.length; r += 1) {
        renderHoleCardForPlayer(player, player.holeCards[r], true);
      }
    }
    finishInitialDeal(dealCtrl.generation);
  }

  function revealAllAiHoleCards(force) {
    var i;
    var r;
    var player;
    var card;
    var el;
    var holes;

    if (!force && !gameState.godEyeOn) {
      return;
    }

    for (i = 0; i < gameState.players.length; i += 1) {
      player = gameState.players[i];
      if (player.type !== "ai" || !player.holeCardsEl) {
        continue;
      }
      holes = player.holeCardsEl;
      holes.innerHTML = "";
      for (r = 0; r < player.holeCards.length; r += 1) {
        card = player.holeCards[r];
        el = buildFaceCardElement(card);
        el.classList.add("card--instant");
        holes.appendChild(el);
      }
    }
  }

  function hideAiHoleCards() {
    var i;
    var player;
    var r;
    for (i = 0; i < gameState.players.length; i += 1) {
      player = gameState.players[i];
      if (player.type !== "ai" || !player.holeCardsEl) {
        continue;
      }
      player.holeCardsEl.innerHTML = "";
      for (r = 0; r < player.holeCards.length; r += 1) {
        player.holeCardsEl.appendChild(buildBackCardElement());
      }
    }
  }

  function toggleGodEye() {
    gameState.godEyeOn = !gameState.godEyeOn;
    if (gameState.godEyeOn) {
      revealAllAiHoleCards(true);
      dom.btnGodEye.textContent = "God's eye (On)";
      showHandEvaluations();
    } else {
      dom.btnGodEye.textContent = "God's eye";
      hideAiHoleCards();
      hideHandEvaluations();
    }
  }

  function addInfiniteChips() {
    var hero = gameState.players[0];
    var i;
    for (i = 0; i < gameState.players.length; i += 1) {
      if (gameState.players[i].type === "hero") {
        hero = gameState.players[i];
        break;
      }
    }
    if (!hero) {
      hero = getHeroPlayerBase();
    }
    hero.chips += 10000;
    updatePlayerChipsDisplay(hero);
  }

  async function startGame(isContinuation) {
    if (gameState.isDealing || gameState.loopRunning || gameState.isProcessingSettlement) {
      return;
    }

    var gen = beginDealSession();
    var i;
    var needed;
    var activeSeats = 0;

    setDealingUi(true);
    hideLobby();
    clearAllCards();
    gameState.board = [];
    gameState.pot = 0;
    updatePotDisplay();
    gameState.godEyeOn = false;
    dom.btnGodEye.textContent = "God's eye";
    hideHandEvaluations();
    hideHandEndOverlay();
    gameState.heroFoldedThisHand = false;
    if (dom.showdownBanner) {
      dom.showdownBanner.classList.add("is-hidden");
    }
    if (dom.showdownTitle) {
      dom.showdownTitle.className = "showdown-title is-hidden";
    }

    // 状态机重置：初始化比牌控制数据
    gameState.showdownCtrl.running = false;
    gameState.showdownCtrl.skipped = false;
    gameState.showdownCtrl.timers.forEach(function(t) { window.clearTimeout(t); });
    gameState.showdownCtrl.timers = [];
    if (dom.btnSkipShowdown) { dom.btnSkipShowdown.classList.add("is-hidden"); }

    // 从 DOM 输入框动态同步玩家设置的初始筹码值
    if (dom.startingChipsInput) {
      var val = parseInt(dom.startingChipsInput.value, 10);
      if (Number.isInteger(val) && val >= 1000 && val <= 1000000) {
        gameSettings.startingChips = val;
      }
    }

    gameState.deck = fisherYatesShuffle(createStandardDeck());
    if (!isContinuation || !gameState.players || gameState.players.length === 0) {
      // 新开一局（新赛事）：重建座位 & 重置筹码
      renderAiSeats(gameSettings.aiPlayerCount);
      gameState.players = buildPlayersList();
      gameState.dealerIndex = 0;
      gameState.dealerId = null;

      gameState.tournament.state = "IN_PROGRESS";
      gameState.tournament.loopsTarget = Math.max(1, gameSettings.loopCount || 1);
      gameState.tournament.loopsCompleted = 0;
      gameState.tournament.dealerRotations = 0;
      gameState.tournament.seatsPerLoop = gameState.players.length;
    } else {
      // 继续下一把：保留筹码与淘汰状态，不重建 DOM
      for (i = 0; i < gameState.players.length; i += 1) {
        if (gameState.players[i].chipsEl) {
          // 仅确保元素存在（座位仍在）
          updatePlayerChipsDisplay(gameState.players[i]);
        }
      }
    }

    // 100% 恢复所有人的高亮状态与样式，清除上一局弃牌(Folded)造成的半透明(opacity: 0.5)
    for (i = 0; i < gameState.players.length; i += 1) {
      if (!isContinuation) {
        gameState.players[i].chips = gameSettings.startingChips || STARTING_CHIPS;
        gameState.players[i].eliminated = false;
      }
      if (gameState.players[i].eliminated || gameState.players[i].chips <= 0) {
        gameState.players[i].eliminated = true;
        gameState.players[i].chips = 0;
      } else {
        activeSeats += 1;
        resetPlayerHandFlags(gameState.players[i]);
      }
      
      // 清理残留的摊牌文本与重塑 CSS 高亮样式
      if (gameState.players[i].handTagEl) {
        gameState.players[i].handTagEl.textContent = "";
        var hCls = (gameState.players[i].type === "hero") ? "seat-hand-tag hero-hand-tag" : "seat-hand-tag hand-desc-tag";
        gameState.players[i].handTagEl.className = hCls + " is-hidden";
      }
      if (gameState.players[i].seatEl) {
        gameState.players[i].seatEl.classList.remove("is-folded", "is-active");
        gameState.players[i].seatEl.style.opacity = ""; // 移除可能存在的覆盖样式
      }
      if (gameState.players[i].holeCardsEl) {
        gameState.players[i].holeCardsEl.classList.remove("hole-cards--folded");
      }
      updatePlayerChipsDisplay(gameState.players[i]);
      updateSeatVisualState(gameState.players[i]);
    }

    gameState.playersClockwise = buildClockwiseOrder(
      gameState.players.filter(function (p) {
        return !p.eliminated && p.chips > 0;
      })
    );
    assignSeatIndices();
    if (!gameState.dealerId && gameState.playersClockwise[gameState.dealerIndex]) {
      gameState.dealerId = gameState.playersClockwise[gameState.dealerIndex].id;
    }
    if (gameState.dealerId) {
      for (i = 0; i < gameState.playersClockwise.length; i += 1) {
        if (gameState.playersClockwise[i].id === gameState.dealerId) {
          gameState.dealerIndex = i;
          break;
        }
      }
    }

    if (activeSeats < 2 || gameState.playersClockwise.length < 2) {
      console.error("Not enough playable players");
      setDealingUi(false);
      showLobby();
      return;
    }

    while (gameState.dealerIndex >= gameState.playersClockwise.length) {
      gameState.dealerIndex = 0;
    }
    if (gameState.playersClockwise[gameState.dealerIndex]) {
      gameState.dealerId = gameState.playersClockwise[gameState.dealerIndex].id;
    }
    updateSeatRoleBadges();
    if (dom.btnExitGame) {
      dom.btnExitGame.classList.remove("is-hidden");
    }

    needed = gameState.playersClockwise.length * 2 + 5;
    if (gameState.deck.length < needed) {
      console.error("Not enough cards in the deck");
      setDealingUi(false);
      return;
    }

    collectHoleCardsFromDeck();
    setPhaseLabel(PHASE.DEALING);
    await runDealAnimation(gen);
  }

  // 【核心兜底重构】静默跳过所有可能缺失的摘要标签，绝不抛错中断
  function updateLobbySummary() {
    var total = 1 + gameSettings.aiPlayerCount;
    var diff = gameSettings.aiDifficulty;
    var blinds = getBlindAmounts();
    // 每个摘要标签都进行存在性检测，缺失时静默跳过
    if (dom.summaryPlayers) {
      dom.summaryPlayers.textContent = String(total);
    }
    if (dom.summaryDifficulty) {
      dom.summaryDifficulty.textContent = starsString(diff.stars) + " " + diff.name;
    }
    if (dom.summaryBlinds) {
      dom.summaryBlinds.textContent = blinds.label;
    }
    if (dom.summaryLoops) {
      dom.summaryLoops.textContent = String(gameSettings.loopCount || 1);
    }
    // 动态同步初始筹码值到摘要标签
    if (dom.summaryStartingChips && dom.startingChipsInput) {
      dom.summaryStartingChips.textContent = formatChips(dom.startingChipsInput.value || 10000);
    }
  }

  function setBlindPreset(index) {
    var idx = Math.max(0, Math.min(BLIND_PRESETS.length - 1, index));
    gameSettings.blindPresetIndex = idx;
    if (dom.blindPresetSelect) {
      dom.blindPresetSelect.value = String(idx);
    }
    updateLobbySummary();
  }

  function setAiCount(value) {
    var n = Math.max(MIN_AI, Math.min(MAX_AI, value));
    gameSettings.aiPlayerCount = n;
    // 只有 DOM 元素真实存在时才更新 UI，否则静默跳过防止崩溃
    if (dom.aiCountDisplay) {
      dom.aiCountDisplay.textContent = String(n);
      dom.aiCountDisplay.value = n;
    }
    if (dom.btnAiMinus) {
      dom.btnAiMinus.disabled = n <= MIN_AI;
    }
    if (dom.btnAiPlus) {
      dom.btnAiPlus.disabled = n >= MAX_AI;
    }
    updateLobbySummary();
  }

  function setLoopCount(value) {
    var n = Math.max(1, Math.min(20, value));
    gameSettings.loopCount = n;
    if (dom.loopCountDisplay) {
      dom.loopCountDisplay.textContent = String(n);
      dom.loopCountDisplay.value = n;
    }
    if (dom.btnLoopMinus) {
      dom.btnLoopMinus.disabled = n <= 1;
    }
    if (dom.btnLoopPlus) {
      dom.btnLoopPlus.disabled = n >= 20;
    }
    updateLobbySummary();
  }

  function renderDifficultyOptions() {
    var i;
    var diff;
    var btn;
    dom.difficultyList.innerHTML = "";
    for (i = 0; i < AI_DIFFICULTIES.length; i += 1) {
      diff = AI_DIFFICULTIES[i];
      btn = document.createElement("button");
      btn.type = "button";
      btn.className = "difficulty-option";
      btn.dataset.level = String(diff.level);
      btn.setAttribute("role", "radio");
      btn.setAttribute(
        "aria-checked",
        diff.level === gameSettings.aiDifficulty.level ? "true" : "false"
      );
      if (diff.level === gameSettings.aiDifficulty.level) {
        btn.classList.add("is-selected");
      }
      btn.innerHTML =
        '<span class="difficulty-option__stars">' +
        starsString(diff.stars) +
        '</span><span class="difficulty-option__name">' +
        diff.name +
        "</span>";
      // 事件委托已在 initLobby 中绑定在 #difficulty-list 父级容器上，不再单独添加 inline click 监听器
      dom.difficultyList.appendChild(btn);
    }
  }

  function selectDifficulty(diff) {
    gameSettings.aiDifficulty = diff;
    console.log("[Settings] AI difficulty updated:", diff.name, "level", diff.level);
    var buttons = dom.difficultyList.querySelectorAll(".difficulty-option");
    var i;
    for (i = 0; i < buttons.length; i += 1) {
      var isSel = buttons[i].dataset.level === String(diff.level);
      buttons[i].classList.toggle("is-selected", isSel);
      buttons[i].setAttribute("aria-checked", isSel ? "true" : "false");
    }
    updateLobbySummary();
  }

  function showLobby() {
    dom.lobbyOverlay.classList.remove("is-hidden");
    if (dom.btnExitGame) {
      dom.btnExitGame.classList.add("is-hidden");
    }
  }

  function hideLobby() {
    dom.lobbyOverlay.classList.add("is-hidden");
  }

  function resetToLobbyState() {
    // 终止发牌/回合引擎
    beginDealSession();
    requestSkipDeal();
    gameState.turnEngine.token += 1;
    gameState.turnEngine.scheduled = false;
    gameState.loopRunning = false;
    gameState.handActive = false;
    gameState.isDealing = false;
    gameState.bbPreDealResolve = null;
    cleanupBBPreDealState();

    // 清理桌面
    clearAllCards();
    gameState.board = [];
    gameState.pot = 0;
    updatePotDisplay();
    clearActionHighlights();
    hideRaiseMultiples();
    hideHandEvaluations();
    hideHandEndOverlay();

    if (dom.showdownBanner) {
      dom.showdownBanner.classList.add("is-hidden");
      dom.showdownBanner.textContent = "";
    }

    // 清理玩家与赛事
    gameState.players = [];
    gameState.playersClockwise = [];
    gameState.dealerIndex = 0;
    gameState.dealerId = null;
    gameState.tournament.state = "LOBBY";
    gameState.tournament.loopsCompleted = 0;
    gameState.tournament.dealerRotations = 0;

    gameState.godEyeOn = false;
    if (dom.btnGodEye) {
      dom.btnGodEye.textContent = "God's eye";
    }

    setActionBarEnabled(false);
    setPhaseLabel(PHASE.LOBBY);
    setDealingUi(false);
  }

  function exitToLobby() {
    resetToLobbyState();
    showLobby();
  }

  function setPhaseLabel(phase) {
    gameState.phase = phase;
    if (dom.gamePhaseLabel) {
      dom.gamePhaseLabel.textContent = PHASE_LABEL_ZH[phase] || phase;
    }
  }

  function resetPlayerHandFlags(player) {
    player.folded = false;
    player.allIn = false;
    player.currentBet = 0;
    player.hasActedThisRound = false;
  }

  function assignSeatIndices() {
    var i;
    for (i = 0; i < gameState.playersClockwise.length; i += 1) {
      gameState.playersClockwise[i].seatIndex = i;
    }
  }

  function getClockwisePlayer(index) {
    return gameState.playersClockwise[index] || null;
  }

  function playersInHand() {
    var list = [];
    var i;
    for (i = 0; i < gameState.playersClockwise.length; i += 1) {
      if (!gameState.playersClockwise[i].folded && !gameState.playersClockwise[i].eliminated) {
        list.push(gameState.playersClockwise[i]);
      }
    }
    return list;
  }

  function countPlayersInHand() {
    return playersInHand().length;
  }

  function canAct(player) {
    if (!player || player.folded || player.eliminated || player.allIn) {
      return false;
    }
    return player.chips > 0;
  }

  function getToCall(player) {
    return Math.max(0, gameState.currentBetLevel - player.currentBet);
  }

  function playerNeedsAction(player) {
    if (!canAct(player)) {
      return false;
    }
    if (player.currentBet < gameState.currentBetLevel) {
      return true;
    }
    if (!player.hasActedThisRound) {
      return true;
    }
    return false;
  }

  function isBettingRoundComplete() {
    var i;
    for (i = 0; i < gameState.playersClockwise.length; i += 1) {
      if (playerNeedsAction(gameState.playersClockwise[i])) {
        return false;
      }
    }
    return true;
  }

  function clearActionHighlights() {
    var i;
    var el;
    for (i = 0; i < gameState.playersClockwise.length; i += 1) {
      el = gameState.playersClockwise[i].seatEl;
      if (el) {
        el.classList.remove("is-active");
      }
    }
  }

  function highlightActor(player) {
    clearActionHighlights();
    if (player && player.seatEl) {
      player.seatEl.classList.add("is-active");
    }
  }

  function showSeatActionBubble(player, text) {
    var el;
    var oldTimer;
    if (!player || !player.actionBubbleEl) {
      return;
    }
    el = player.actionBubbleEl;
    el.textContent = text || "";
    el.classList.remove("is-hidden");
    el.classList.remove("is-show");

    oldTimer = el.dataset.timerId ? parseInt(el.dataset.timerId, 10) : 0;
    if (oldTimer) {
      window.clearTimeout(oldTimer);
    }

    // 触发重排，保证动画重复可用
    void el.offsetWidth;
    el.classList.add("is-show");

    el.dataset.timerId = String(
      window.setTimeout(function () {
        el.classList.remove("is-show");
        el.classList.add("is-hidden");
      }, 1500)
    );
  }

  function updateBetTagForPlayer(player) {
    if (!player || !player.betTagEl) {
      return;
    }
    var baseClass = (player.type === "hero") ? "seat-hand-tag hero-bet-tag" : "seat-hand-tag bet-tag";
    if (player.folded || player.eliminated) {
      player.betTagEl.textContent = "FOLD";
      player.betTagEl.className = baseClass + " seat-hand-tag--fold is-show";
    } else if (player.currentBet > 0) {
      player.betTagEl.textContent = "Bet " + formatChips(player.currentBet);
      player.betTagEl.className = baseClass + " is-show";
    } else if (player.currentBet === 0 && player.hasActedThisRound) {
      player.betTagEl.textContent = "CHECK";
      player.betTagEl.className = baseClass + " seat-hand-tag--check is-show";
    } else {
      player.betTagEl.textContent = "";
      player.betTagEl.className = baseClass + " is-hidden";
    }
  }

  function updateSeatVisualState(player) {
    if (!player || !player.seatEl) {
      return;
    }
    player.seatEl.classList.toggle("is-folded", !!player.folded);
    player.seatEl.classList.toggle("is-eliminated", !!player.eliminated);
  }

  function updateAllSeatVisuals() {
    var i;
    for (i = 0; i < gameState.playersClockwise.length; i += 1) {
      updateSeatVisualState(gameState.playersClockwise[i]);
    }
  }

  function markFoldedCards(player) {
    var r;
    var card;
    var el;
    if (player.holeCardsEl) {
      player.holeCardsEl.classList.add("hole-cards--folded");
      player.holeCardsEl.innerHTML = "";
      for (r = 0; r < player.holeCards.length; r += 1) {
        card = player.holeCards[r];
        if (player.isFaceUp || gameState.godEyeOn) {
          el = buildFaceCardElement(card);
        } else {
          el = buildBackCardElement();
        }
        el.classList.add("card--folded-dim");
        player.holeCardsEl.appendChild(el);
      }
    }
    if (player.type === "hero") {
      gameState.heroFoldedThisHand = true;
      hideRaiseMultiples();
    }
    updateSeatVisualState(player);
  }

  function isHeroFoldedThisHand() {
    return gameState.heroFoldedThisHand === true;
  }

  function getAiThinkDelayMs() {
    if (isHeroFoldedThisHand()) {
      return AI_FAST_DELAY_MIN + Math.floor(Math.random() * (AI_FAST_DELAY_MAX - AI_FAST_DELAY_MIN));
    }
    var slider = document.getElementById("setting-ai-delay");
    var baseSec = 4;
    if (slider) {
      baseSec = parseInt(slider.value, 10) || 4;
    }
    var baseMs = baseSec * 1000;
    var variance = Math.floor(baseMs * 0.25);
    return baseMs + Math.floor(Math.random() * variance * 2) - variance;
  }

  function hideRaiseMultiples() {
    // raise 倍数栏始终可见，不折叠
  }

  function showRaiseMultiples() {
    if (dom.raiseMultiples) {
      dom.raiseMultiples.classList.remove("is-hidden");
    }
  }

  // 更新倍数 Raise 按钮的实时金额副标题（显示 raise to XXX chips）
  function updateRaiseMultipleLabels(player) {
    if (!dom.raiseMultiples || !player) { return; }
    var amounts = getBlindAmounts();
    var bb = amounts.bigBlind;
    var toCallAmt = getToCall(player);
    var btns = dom.raiseMultiples.querySelectorAll(".raise-multiples__btn");
    var mults = [2, 4, 6, 8, 10];
    btns.forEach(function (btn, idx) {
      var m = mults[idx] || 2;
      var target;
      if (toCallAmt <= 0) {
        target = gameState.currentBetLevel + bb * m;
      } else {
        target = player.currentBet + toCallAmt + toCallAmt * m;
      }
      target = Math.max(target, gameState.currentBetLevel + gameState.minRaise);
      if (target > player.currentBet + player.chips) {
        target = player.currentBet + player.chips;
      }
      var subEl = btn.querySelector(".btn__subtitle");
      if (subEl) {
        subEl.textContent = "raise to " + formatChips(target);
      }
    });
  }

  function buildTableState() {
    var i;
    var plist = [];
    for (i = 0; i < gameState.playersClockwise.length; i += 1) {
      plist.push({
        id: gameState.playersClockwise[i].id,
        folded: gameState.playersClockwise[i].folded,
        eliminated: gameState.playersClockwise[i].eliminated,
        allIn: gameState.playersClockwise[i].allIn,
        currentBet: gameState.playersClockwise[i].currentBet,
        hasActedThisRound: gameState.playersClockwise[i].hasActedThisRound,
        seatIndex: gameState.playersClockwise[i].seatIndex
      });
    }
    return {
      pot: gameState.pot,
      currentBetLevel: gameState.currentBetLevel,
      minRaise: gameState.minRaise,
      board: gameState.board.slice(),
      phase: gameState.phase,
      dealerIndex: gameState.dealerIndex,
      playerCount: gameState.playersClockwise.length,
      bigBlind: getBlindAmounts().bigBlind,
      players: plist
    };
  }

  function buildPlayerState(player) {
    return {
      id: player.id,
      holeCards: player.holeCards.slice(),
      chips: player.chips,
      currentBet: player.currentBet,
      seatIndex: player.seatIndex,
      folded: player.folded,
      allIn: player.allIn
    };
  }

  function resetHasActedExcept(aggressor) {
    var i;
    var p;
    for (i = 0; i < gameState.playersClockwise.length; i += 1) {
      p = gameState.playersClockwise[i];
      if (p === aggressor) {
        continue;
      }
      if (canAct(p) && p.currentBet < gameState.currentBetLevel) {
        p.hasActedThisRound = false;
      }
    }
  }

  function commitChips(player, amount) {
    var pay = Math.min(amount, player.chips);
    player.chips -= pay;
    player.currentBet += pay;
    gameState.pot += pay;
    if (player.chips === 0) {
      player.allIn = true;
    }
    updateBetTagForPlayer(player);
    updatePlayerChipsDisplay(player);
    updatePotDisplay();
    return pay;
  }

  function raiseBetLevel(player, newLevel) {
    var oldLevel = gameState.currentBetLevel;
    var raiseSize;
    if (newLevel > gameState.currentBetLevel) {
      gameState.currentBetLevel = newLevel;
      raiseSize = newLevel - oldLevel;
      if (raiseSize > gameState.minRaise) {
        gameState.minRaise = raiseSize;
      }
      // 单轮下注圈数递增计数
      if (gameState.bettingCap && gameState.bettingCap.streetBetCycles < gameState.bettingCap.maxCycles) {
        gameState.bettingCap.streetBetCycles += 1;
      }
      resetHasActedExcept(player);
    }
    player.hasActedThisRound = true;
  }

  // 检查当前发牌圈内是否依然允许加注 (是否未达到封顶限制)
  function isRaiseAllowedThisStreet() {
    if (!gameState.bettingCap) { return true; }
    return gameState.bettingCap.streetBetCycles < gameState.bettingCap.maxCycles;
  }

  function getRaiseTargetTotal() {
    return gameState.currentBetLevel + gameState.minRaise;
  }

  function findNextActorIndex(fromIndex) {
    var n = gameState.playersClockwise.length;
    var i;
    var idx;
    var p;
    for (i = 1; i <= n; i += 1) {
      idx = (fromIndex + i) % n;
      p = gameState.playersClockwise[idx];
      if (playerNeedsAction(p)) {
        return idx;
      }
    }
    return -1;
  }

  function getFirstActorIndex() {
    var blinds;
    var startFrom;
    if (gameState.phase === PHASE.PREFLOP) {
      // 翻牌前：大盲注之后的下一位首发
      blinds = getBlindSeatIndices();
      startFrom = blinds.bb;
    } else {
      // 翻牌后(Flop/Turn/River)：小盲位(SB)首发
      blinds = getBlindSeatIndices();
      startFrom = blinds.sb;
    }
    return findNextActorIndex(startFrom);
  }

  function resetStreetBets() {
    var i;
    for (i = 0; i < gameState.playersClockwise.length; i += 1) {
      gameState.playersClockwise[i].currentBet = 0;
      gameState.playersClockwise[i].hasActedThisRound = false;
      updateBetTagForPlayer(gameState.playersClockwise[i]);
    }
    gameState.currentBetLevel = 0;
    gameState.minRaise = getBlindAmounts().bigBlind;
    if (gameState.bettingCap) {
      gameState.bettingCap.streetBetCycles = 0;
    }
  }

  function setActionBarEnabled(enabled) {
    if (dom.actionBar) {
      dom.actionBar.classList.toggle("is-disabled", !enabled);
    }
    if (dom.btnFold) {
      dom.btnFold.disabled = !enabled;
    }
    if (dom.btnCheck) {
      dom.btnCheck.disabled = !enabled;
    }
    if (dom.btnCall) {
      dom.btnCall.disabled = !enabled;
    }
    if (dom.btnRaise) {
      dom.btnRaise.disabled = !enabled;
    }
    if (dom.btnAllin) {
      dom.btnAllin.disabled = !enabled;
    }
  }

  function updateHeroActionBar() {
    var hero = null;
    var toCall;
    var raiseTotal;
    var i;
    for (i = 0; i < gameState.playersClockwise.length; i += 1) {
      if (gameState.playersClockwise[i].type === "hero") {
        hero = gameState.playersClockwise[i];
        break;
      }
    }
    if (!hero || !gameState.handActive || gameState.actionSeatIndex !== hero.seatIndex) {
      setActionBarEnabled(false);
      hideRaiseMultiples();
      if (dom.actionHint) {
        dom.actionHint.textContent = isHeroFoldedThisHand() ? "You folded · Watching" : "Waiting for other players";
      }
      return;
    }
    toCall = getToCall(hero);
    raiseTotal = getRaiseTargetTotal();
    setActionBarEnabled(true);
    // 倍数面板始终可见
    showRaiseMultiples();
    if (dom.actionHint) {
      dom.actionHint.textContent = toCall > 0 ? "Call to" : "Current can check";
    }
    if (dom.toCall) {
      dom.toCall.textContent = formatChips(toCall > 0 ? gameState.currentBetLevel : 0);
    }
    if (dom.btnCheck) {
      dom.btnCheck.disabled = toCall > 0;
    }
    if (dom.btnCall) {
      dom.btnCall.disabled = toCall === 0;
      dom.btnCall.querySelector(".btn__subtitle").textContent =
        toCall > 0 ? "Call " + formatChips(toCall) : "Call";
    }
    if (dom.btnRaise) {
      var raiseSubtitle = isRaiseAllowedThisStreet() ? "To " + formatChips(raiseTotal) : "Max Cap";
      dom.btnRaise.disabled = (!isRaiseAllowedThisStreet() && toCall === 0);
      dom.btnRaise.querySelector(".btn__subtitle").textContent = raiseSubtitle;
    }
    if (dom.btnAllin) {
      dom.btnAllin.disabled = hero.chips === 0 || !isRaiseAllowedThisStreet();
    }

    // 更新倍数按钮的实时金额副标题
    updateRaiseMultipleLabels(hero);
  }

  function applyFold(player) {
    player.folded = true;
    player.hasActedThisRound = true;
    
    // 【核心修改】弃牌时不直接抹干抹净DOM卡片，而是加上CSS半透明衰减类
    if (player.holeCardsEl) {
      player.holeCardsEl.classList.add("hole-cards--folded");
    }
    if (player.id === "hero") {
      gameState.heroFoldedThisHand = true;
    }
    updateBetTagForPlayer(player);
    return true;
  }

  function applyCheck(player) {
    if (getToCall(player) > 0) {
      return false;
    }
    player.hasActedThisRound = true;
    return true;
  }

  function applyCall(player) {
    // 【补差价模式】跟注需要补齐的差价 = 当前最高注额 − 玩家已下注额
    var toCall = getToCall(player);
    if (toCall <= 0) {
      return applyCheck(player);
    }
    commitChips(player, toCall);
    player.hasActedThisRound = true;
    return true;
  }

  function applyRaiseTo(player, targetTotal) {
    // 【补差价模式】加注到目标总额时，实际扣除 = 目标总额 − 玩家已下注额
    var need = targetTotal - player.currentBet;
    if (need <= 0) {
      return applyCheck(player);
    }
    commitChips(player, need);
    raiseBetLevel(player, player.currentBet);
    return true;
  }

  function applyAllIn(player) {
    var target = player.currentBet + player.chips;
    commitChips(player, player.chips);
    if (player.currentBet > gameState.currentBetLevel) {
      raiseBetLevel(player, player.currentBet);
    } else {
      player.hasActedThisRound = true;
    }
    return true;
  }

  function applyPlayerAction(player, actionType, options) {
    var bb = getBlindAmounts().bigBlind;
    var raiseTarget;
    var opts = options || {};
    var toCall;
    if (actionType === "fold") {
      applyFold(player);
      return true;
    }
    if (actionType === "check") {
      return applyCheck(player);
    }
    if (actionType === "call") {
      return applyCall(player);
    }
    if (actionType === "raise") {
      // 封顶拦截判定：前3次可Raise，第4轮强行转变为 Call 或 Check
      if (!isRaiseAllowedThisStreet()) {
        toCall = getToCall(player);
        if (toCall > 0) { return applyCall(player); }
        return applyCheck(player);
      }
      if (opts.raiseTotal) {
        raiseTarget = opts.raiseTotal;
      } else {
        raiseTarget = Math.max(getRaiseTargetTotal(), gameState.currentBetLevel + bb);
      }
      if (raiseTarget > player.currentBet + player.chips) {
        return applyAllIn(player);
      }
      return applyRaiseTo(player, raiseTarget);
    }
    if (actionType === "allin") {
      // 封顶轮：只允许 Call/Fold（没有 toCall 时等价于 Check）
      if (!isRaiseAllowedThisStreet()) {
        toCall = getToCall(player);
        if (toCall <= 0) {
          return applyCheck(player); // 不需要跟注，直接过牌
        }
        // 只能跟注到当前级别，若筹码不足则以 all-in 形式完成跟注
        if (toCall >= player.chips) {
          commitChips(player, player.chips);
          player.hasActedThisRound = true;
          return true;
        }
        return applyCall(player);
      }
      return applyAllIn(player);
    }
    return false;
  }

  function applyAIDecision(player, decision) {
    var d;
    var toCall;
    var rounded;
    if (!decision || !decision.action) { return; }

    d = { action: decision.action };
    if (decision.raiseTotal) {
      // AI 加注金额美化：向上取整为 10 的整数倍
      rounded = Math.ceil(decision.raiseTotal / 10) * 10;
      d.raiseTotal = rounded;
    }

    // 封顶轮：AI 若想 raise/all-in，自动降级为 call/check
    if (!isRaiseAllowedThisStreet() && (d.action === "raise" || d.action === "allin")) {
      toCall = getToCall(player);
      if (toCall > 0) {
        d.action = "call";
      } else {
        d.action = "check";
      }
      delete d.raiseTotal;
    }

    applyPlayerAction(player, d.action, {
      raiseTotal: d.raiseTotal
    });
  }

  function decideAIAction(player) {
    var level = gameSettings.aiDifficulty.level;
    if (window.AIEngine && window.AIEngine.makeAIDecision) {
      return window.AIEngine.makeAIDecision(
        buildPlayerState(player),
        buildTableState(),
        level
      );
    }
    return { action: "check" };
  }

  function calcHeroRaiseTotal(multiple) {
    var hero = null;
    var toCall;
    var target;
    var i;
    for (i = 0; i < gameState.playersClockwise.length; i += 1) {
      if (gameState.playersClockwise[i].type === "hero") {
        hero = gameState.playersClockwise[i];
        break;
      }
    }
    if (!hero) {
      return 0;
    }
    toCall = getToCall(hero);
    if (toCall <= 0) {
      target = gameState.currentBetLevel + getBlindAmounts().bigBlind * multiple;
    } else {
      target = hero.currentBet + toCall + toCall * multiple;
    }
    target = Math.max(target, gameState.currentBetLevel + gameState.minRaise);
    if (target > hero.currentBet + hero.chips) {
      return hero.currentBet + hero.chips;
    }
    return target;
  }

  // 【筹码原子性结算】锁定 → 快照校验 → 飞行动画 → 回调清池 → 显示引导
  function concludeShowdownCalculations(winners, share, remainder, onAfterPayout) {
    // 立即锁定结算状态，禁止任何外部逻辑在此期间操作余额
    gameState.isProcessingSettlement = true;

    // 【死人禁赛】强行过滤掉已经弃牌或淘汰的玩家，确保只有存活玩家才有资格分配底池
    winners = winners.filter(function (w) {
      return w && !w.eliminated && !w.folded;
    });
    if (winners.length === 0) {
      console.error("[Settlement] 所有赢家均无效，底池无人认领！");
      gameState.isProcessingSettlement = false;
      return;
    }
    share = Math.floor(gameState.pot / winners.length);
    remainder = gameState.pot % winners.length;

    // 余额快照：结算前计算全场总筹码（pot + 所有玩家余额）
    var totalBefore = gameState.pot;
    var i;
    for (i = 0; i < gameState.players.length; i += 1) {
      totalBefore += gameState.players[i].chips;
    }
    console.log("[Settlement] Total chips snapshot before settlement:", totalBefore);

    // 封装：将赢家筹码写入 + 底池清空，必须在飞行动画 callback 中执行
    function executeAtomicPayout() {
      // 将底池按份额分配给赢家
      var j;
      for (j = 0; j < winners.length; j += 1) {
        var w = winners[j];
        w.chips += share + (j < remainder ? 1 : 0);
        updatePlayerChipsDisplay(w);
      }
      // 底池清零必须在动画后的回调中执行
      gameState.pot = 0;
      updatePotDisplay();
      if (dom.btnSkipShowdown) { dom.btnSkipShowdown.classList.add("is-hidden"); }

      // 余额快照校验：结算后再次计算全场总筹码
      var totalAfter = 0;
      var k;
      for (k = 0; k < gameState.players.length; k += 1) {
        totalAfter += gameState.players[k].chips;
      }
      totalAfter += gameState.pot; // pot 应为 0

      console.log("[Settlement] Total chips snapshot after settlement:", totalAfter);
      if (totalAfter !== totalBefore) {
        console.error("[Settlement] Ghost chips alert! Total chips are inconsistent: before=" + totalBefore + " after=" + totalAfter + " difference=" + (totalAfter - totalBefore));
      }

      // 解锁结算状态
      gameState.isProcessingSettlement = false;

      // 显示摊牌状态栏：赢家结果 + 英文引导提示
      if (dom.showdownStatus) {
        var winnerNames = winners.map(function (x) { return x.name; }).join(", ");
        dom.showdownStatus.textContent = "Winner: " + winnerNames + " (Wins $" + formatChips(share) + ")\n[ Tap anywhere to continue ]";
        dom.showdownStatus.classList.remove("is-hidden");
      }

      // 执行后续回调（如进入 endHandSequence）
      if (onAfterPayout) {
        onAfterPayout();
      }
    }

    // 播筹筹码飞行动画，动画完成后的回调中执行原子记账
    playPotFlyingAnimation(winners, executeAtomicPayout);
  }

  function resolveSingleWinner() {
    var remaining = playersInHand();
    if (remaining.length === 1) {
      // 原子结算单赢家（无飞行动画 — 牌局中弃牌获胜用）
      gameState.isProcessingSettlement = true;
      remaining[0].chips += gameState.pot;
      gameState.pot = 0;
      updatePlayerChipsDisplay(remaining[0]);
      updatePotDisplay();
      gameState.isProcessingSettlement = false;
      return remaining[0];
    }
    return null;
  }

  // 核心动画渲染：将指定玩家的暗牌依次掀开，注入卡片翻转 class，并亮起牌型描述
  function revealSinglePlayerShowdownUi(player) {
    if (!player || player.eliminated) { return; }
    
    // 强制重塑卡片 DOM 结构执行翻牌展开
    if (player.holeCardsEl && player.holeCards.length >= 2) {
      player.holeCardsEl.innerHTML = "";
      player.holeCards.forEach(function (card) {
        var cardEl = buildFaceCardElement(card);
        cardEl.classList.add("card--reveal"); // 赋予3D翻转动效
        player.holeCardsEl.appendChild(cardEl);
      });
    }

    // 座位下方浮现亮色最大五张组合名称
    var ev = evaluatePlayerHand(player);
    if (ev && player.handTagEl) {
      player.handTagEl.textContent = formatHandDescription(ev);
      var handBaseClass = (player.type === "hero") ? "seat-hand-tag hero-hand-tag" : "seat-hand-tag hand-desc-tag";
      player.handTagEl.className = handBaseClass + " is-show";
    }
  }

  // 筹码底池飞行动画粒子执行器（0.8秒平滑曲线至赢家座位）
  function playPotFlyingAnimation(winnerSeats, onComplete) {
    if (!dom.potAmount || winnerSeats.length === 0) {
      if (onComplete) { onComplete(); }
      return;
    }

    var potRect = dom.potAmount.getBoundingClientRect();
    var completedCount = 0;

    // 为每位平分底池的赢家各自创建并执行粒子动画
    winnerSeats.forEach(function (winner) {
      if (!winner || !winner.seatEl) { return; }
      var winnerRect = winner.seatEl.getBoundingClientRect();

      var token = document.createElement("div");
      token.className = "pot-fly-token";
      token.style.left = potRect.left + "px";
      token.style.top = potRect.top + "px";
      document.body.appendChild(token);

      var startX = potRect.left;
      var startY = potRect.top;
      var endX = winnerRect.left + winnerRect.width / 2 - 11;
      var endY = winnerRect.top + winnerRect.height / 2 - 11;

      var startTime = performance.now();
      var duration = 800; // 严格耗时 0.8秒

      function animateFly(now) {
        var elapsed = now - startTime;
        var progress = Math.min(elapsed / duration, 1);
        
        // 采用经典的 Ease-Out 立方曲线进行平滑位移计算
        var ease = 1 - Math.pow(1 - progress, 3);
        
        var curX = startX + (endX - startX) * ease;
        var curY = startY + (endY - startY) * ease;

        token.style.left = curX + "px";
        token.style.top = curY + "px";

        if (progress < 1) {
          requestAnimationFrame(animateFly);
        } else {
          // 飞抵目的地，销毁粒子
          if (token.parentNode) { token.parentNode.removeChild(token); }
          completedCount += 1;
          if (completedCount === winnerSeats.length && onComplete) {
            onComplete();
          }
        }
      }
      requestAnimationFrame(animateFly);
    });
  }

  // 摊牌比牌异步控制流核心
  function runShowdown() {
    // 获取场上未出局的所有人，用来依次做半透明翻牌展示
    var allActivePlayers = gameState.players.filter(function (p) {
      return !p.eliminated;
    });
    // 参与胜负判定（Contenders）的玩家，必须是既没有出局，也绝对没有弃牌（Fold）的存活者
    var contenders = gameState.players.filter(function (p) {
      return !p.eliminated && !p.folded;
    });

    var evaluations = [];
    var best = null;
    var winners = [];
    var i;
    var p;
    var ev;
    var share;
    var remainder;

    setPhaseLabel(PHASE.SHOWDOWN);
    gameState.handActive = false;
    setActionBarEnabled(false);
    hideRaiseMultiples();

    // 初始化摊牌比牌控制器数据
    gameState.showdownCtrl.running = true;
    gameState.showdownCtrl.skipped = false;
    gameState.showdownCtrl.timers = [];

    // 隐藏旧横幅
    if (dom.showdownBanner) {
      dom.showdownBanner.textContent = "";
      dom.showdownBanner.classList.add("is-hidden");
    }
    if (dom.handEndSummary) {
      dom.handEndSummary.textContent = "";
      dom.handEndSummary.classList.add("is-hidden");
    }
    if (dom.showdownStatus) {
      dom.showdownStatus.classList.add("is-hidden");
    }

    // 若场上通过弃牌只剩下一人存活，此人直接收池，无需比牌
    if (contenders.length === 1) {
      var singleWinner = contenders[0];
      // 翻牌全场所有人
      allActivePlayers.forEach(function (player) {
        revealSinglePlayerShowdownUi(player);
      });
      gameState.showdownCtrl.running = false;

      // 原子结算单个赢家
      concludeShowdownCalculations([singleWinner], gameState.pot, 0, function () {
        // 展示 #hand-end-overlay 实现全局点击推进
        showHandEndOverlay();
        window.setTimeout(function () {
          endHandSequence();
        }, 100);
      });
      return;
    }

    // 展露 Showdown 现场动画大标题
    if (dom.showdownTitle) {
      dom.showdownTitle.className = "showdown-title is-show";
    }
    if (dom.btnSkipShowdown) {
      dom.btnSkipShowdown.classList.remove("is-hidden");
    }

    // 只对 contenders 队列计算胜负 — 弃牌者无资格赢钱
    for (i = 0; i < contenders.length; i += 1) {
      p = contenders[i];
      ev = evaluatePlayerHand(p);
      evaluations.push({ player: p, eval: ev });
      if (!ev) { continue; }
      if (!best || compareEvaluations(ev, best) > 0) {
        best = ev;
        winners = [p];
      } else if (best && compareEvaluations(ev, best) === 0) {
        winners.push(p);
      }
    }

    if (winners.length === 0 && evaluations.length > 0) {
      winners = [evaluations[0].player];
    }

    share = Math.floor(gameState.pot / winners.length);
    remainder = gameState.pot % winners.length;

    // 依次异步翻牌渲染队列（包含已 Fold 玩家在内的完整激活列表）
    var queueIndex = 0;
    function processNextShowdownPlayerReveal() {
      if (gameState.showdownCtrl.skipped) { return; }
      if (queueIndex < allActivePlayers.length) {
        var currentPlayer = allActivePlayers[queueIndex];
        revealSinglePlayerShowdownUi(currentPlayer);
        queueIndex += 1;
        var t = window.setTimeout(processNextShowdownPlayerReveal, 500);
        gameState.showdownCtrl.timers.push(t);
      } else {
        // 翻牌完结后，执行原子结算（含飞行动画与 pot 清零回调）
        var tFly = window.setTimeout(function () {
          gameState.showdownCtrl.running = false;
          concludeShowdownCalculations(winners, share, remainder, function () {
            // 展示 #hand-end-overlay 实现全局点击推进下一局
            showHandEndOverlay();
            window.setTimeout(function () {
              endHandSequence();
            }, 100);
          });
        }, 300);
        gameState.showdownCtrl.timers.push(tFly);
      }
    }

    processNextShowdownPlayerReveal();
  }

  // 实现翻牌跳过按钮逻辑 (Skip Animation 一步到位)
  function skipShowdownAnimation() {
    if (!gameState.showdownCtrl.running) { return; }
    gameState.showdownCtrl.skipped = true;

    // 清除一切延迟计时器
    gameState.showdownCtrl.timers.forEach(function (t) { window.clearTimeout(t); });
    gameState.showdownCtrl.timers = [];

    if (dom.btnSkipShowdown) { dom.btnSkipShowdown.classList.add("is-hidden"); }

    var allActivePlayers = gameState.players.filter(function (p) { return !p.eliminated; });
    var contenders = gameState.players.filter(function (p) { return !p.eliminated && !p.folded; });
    var best = null;
    var winners = [];

    // 全场所有人（包括 Fold 的人）底牌瞬间全部翻开呈现 — 保留牌型描述不动
    allActivePlayers.forEach(function (p) {
      revealSinglePlayerShowdownUi(p);
    });

    // 胜负判定仅对没有弃牌的 contenders 队列生效
    contenders.forEach(function (p) {
      var ev = evaluatePlayerHand(p);
      if (!ev) { return; }
      if (!best || compareEvaluations(ev, best) > 0) {
        best = ev;
        winners = [p];
      } else if (best && compareEvaluations(ev, best) === 0) {
        winners.push(p);
      }
    });

    if (winners.length === 0 && contenders.length > 0) {
      winners = [contenders[0]];
    }

    var share = Math.floor(gameState.pot / winners.length);
    var remainder = gameState.pot % winners.length;

    gameState.showdownCtrl.running = false;

    // 原子结算（跳过飞行动画，瞬间记账 + 显示引导）
    concludeShowdownCalculations(winners, share, remainder, function () {
      showHandEndOverlay();
      window.setTimeout(function () {
        endHandSequence();
      }, 100);
    });
  }

  function eliminateBustedPlayers() {
    var i;
    var p;
    for (i = 0; i < gameState.playersClockwise.length; i += 1) {
      p = gameState.playersClockwise[i];
      if (p.chips <= 0 && !p.eliminated) {
        p.eliminated = true;
        p.folded = true;
        updateSeatVisualState(p);
        if (p.holeCardsEl) {
          p.holeCardsEl.innerHTML = "";
        }
      }
    }
  }

  function countActiveForNextHand() {
    var n = 0;
    var i;
    for (i = 0; i < gameState.players.length; i += 1) {
      if (!gameState.players[i].eliminated && gameState.players[i].chips > 0) {
        n += 1;
      }
    }
    return n;
  }

  async function revealBoardCards(count, instant) {
    var i;
    var card;
    var start = gameState.board.length;
    if (isHeroFoldedThisHand()) {
      instant = true;
    }
    for (i = 0; i < count; i += 1) {
      card = drawFromDeck();
      if (!card) {
        continue;
      }
      gameState.board.push(card);
      await renderBoardCardAtIndex(start + i, card, instant);
      if (!instant) {
        await delay(BOARD_STAGGER_MS);
      }
    }
  }

  async function advanceStreet() {
    var single;
    if (countPlayersInHand() <= 1) {
      single = resolveSingleWinner();
      if (dom.showdownBanner && single) {
        dom.showdownBanner.textContent = single.name + " Collect pot ";
        dom.showdownBanner.classList.remove("is-hidden");
      }
      await endHandSequence();
      return;
    }

    resetStreetBets();

    if (gameState.phase === PHASE.PREFLOP) {
      setPhaseLabel(PHASE.FLOP);
      await revealBoardCards(3, false);
      gameState.actionSeatIndex = getFirstActorIndex();
      scheduleProcessNextTurn();
      return;
    }

    if (gameState.phase === PHASE.FLOP) {
      setPhaseLabel(PHASE.TURN);
      await revealBoardCards(1, false);
      gameState.actionSeatIndex = getFirstActorIndex();
      scheduleProcessNextTurn();
      return;
    }

    if (gameState.phase === PHASE.TURN) {
      setPhaseLabel(PHASE.RIVER);
      await revealBoardCards(1, false);
      gameState.actionSeatIndex = getFirstActorIndex();
      scheduleProcessNextTurn();
      return;
    }

    if (gameState.phase === PHASE.RIVER) {
      runShowdown();
      return;
    }
  }
  function renderDynamicRankList() {
    var rowsContainer = document.getElementById("custom-rank-rows");
    if (!rowsContainer) { return; }
    rowsContainer.innerHTML = "";

    // 复制玩家数组并按筹码从高到低排序（已淘汰者筹码为0排在最后）
    var sortedPlayers = gameState.players.slice().sort(function (a, b) {
      if (a.eliminated && !b.eliminated) { return 1; }
      if (!a.eliminated && b.eliminated) { return -1; }
      return b.chips - a.chips;
    });

    sortedPlayers.forEach(function (p, index) {
      var row = document.createElement("div");
      row.className = "rank-row-item" + (p.type === "hero" ? " rank-row-item--hero" : "");
  
      // 1. 设置排名字段 (例如: 1. You)
      var nameDisplay = (index + 1) + ". " + p.name;
  
      // 2. 设置状态字段 (破产显示垃圾话，没破产显示筹码)
      var statusDisplay = "";
      if (p.eliminated) {
        var randomJoke = JOKE_POOL[Math.floor(Math.random() * JOKE_POOL.length)];
        statusDisplay = "(" + randomJoke + ")";
      } else {
        statusDisplay = formatChips(p.chips) + " chips";
      }
  
      // 3. 将名字和状态分别填入两个 span 中，UI 上会更整齐
      row.innerHTML = "<span>" + nameDisplay + "</span><span class='rank-status'>" + statusDisplay + "</span>";
      rowsContainer.appendChild(row);
    });
  }
  function showHandEndOverlay() {
    if (dom.handEndOverlay) {
      dom.handEndOverlay.classList.remove("is-hidden");
    }
    hideRaiseMultiples();
  }

  function hideHandEndOverlay() {
    if (dom.handEndOverlay) {
      dom.handEndOverlay.classList.add("is-hidden");
    }
  }

  async function endHandSequence() {
    var activeCount;
    var i;

    // 结算锁期间禁止任何余额篡改
    if (gameState.isProcessingSettlement) {
      console.warn("[Settlement] 结算仍在进行，延迟推进");
      window.setTimeout(function () { endHandSequence(); }, 200);
      return;
    }

    // 精准财务与生命周期绑定：筹码≤0 的玩家标记淘汰
    for (i = 0; i < gameState.players.length; i += 1) {
      if (gameState.players[i].chips <= 0) {
        gameState.players[i].eliminated = true;
        gameState.players[i].chips = 0;
      } else {
        gameState.players[i].eliminated = false;
      }
    }

    eliminateBustedPlayers();
    rotateDealerForNextHand();
    gameState.handActive = false;
    gameState.heroFoldedThisHand = false;
    setActionBarEnabled(false);
    clearActionHighlights();
    hideRaiseMultiples();

    // 隐藏旧横幅与摊牌状态栏
    if (dom.showdownBanner) {
      dom.showdownBanner.textContent = "";
      dom.showdownBanner.classList.add("is-hidden");
    }
    if (dom.handEndSummary) {
      dom.handEndSummary.textContent = "";
      dom.handEndSummary.classList.add("is-hidden");
    }

    activeCount = countActiveForNextHand();

    // 赛事进度及多循环轮转计算
    if (gameState.tournament && gameState.tournament.state === "IN_PROGRESS") {
      gameState.tournament.dealerRotations += 1;
      if (
        gameState.tournament.seatsPerLoop > 0 &&
        gameState.tournament.dealerRotations % gameState.tournament.seatsPerLoop === 0
      ) {
        gameState.tournament.loopsCompleted += 1;
      }
      if (gameState.tournament.loopsCompleted >= gameState.tournament.loopsTarget) {
        gameState.tournament.state = "TOURNAMENT_OVER";
      }
    }

    // 若场上只剩一位霸主存活，强行宣告终局大完结
    if (activeCount < 2 && gameState.tournament && gameState.tournament.state !== "LOBBY") {
      gameState.tournament.state = "TOURNAMENT_OVER";
    }

    renderDynamicRankList();

    // 【核心门控】只有全部循环圈数打完才允许弹出终局排行榜
    var isTournamentFullyOver = gameState.tournament && gameState.tournament.state === "TOURNAMENT_OVER";

    if (isTournamentFullyOver) {
      // 分支A：赛事全部完结，弹出动态排行榜 + 全透明拦截层
      setPhaseLabel(PHASE.TOURNAMENT_OVER);
      if (dom.showdownStatus && !dom.showdownStatus.classList.contains("is-hidden")) {
        dom.showdownStatus.classList.add("is-hidden");
      }
      var rankPanel = document.getElementById("custom-showdown-rank");
      if (rankPanel) {
        renderDynamicRankList();
        rankPanel.classList.remove("is-hidden");
      }
      var hintEl = document.getElementById("click-anywhere-hint");
      if (hintEl) {
        hintEl.textContent = "Game over, tap anywhere to return to the main menu";
        hintEl.style.color = "#ff6666";
      }
      if (dom.handEndOverlay) {
        dom.handEndOverlay.onclick = null;
        dom.handEndOverlay.classList.remove("is-hidden");
        dom.handEndOverlay.onclick = function () {
          if (gameState.isProcessingSettlement) { return; }
          dom.handEndOverlay.classList.add("is-hidden");
          dom.handEndOverlay.onclick = null;
          hideHandEndOverlay();
          if (dom.showdownStatus) { dom.showdownStatus.classList.add("is-hidden"); }
          if (rankPanel) { rankPanel.classList.add("is-hidden"); }
          // 清空临时余额内存，100% 倒退回大厅
          exitToLobby();
        };
      }
      return;
    }

    // 分支B：普通单局结束，保留牌型不动 + 显示引导 → 点击推进下一把
    setPhaseLabel(PHASE.HAND_END);

    // showdownStatus 已经由 concludeShowdownCalculations 显示，不覆盖
    var hintEl2 = document.getElementById("click-anywhere-hint");
    if (hintEl2) {
      hintEl2.textContent = "Tap anywhere to continue";
      hintEl2.style.color = "rgba(232,197,71,0.95)";
    }
    if (dom.handEndOverlay) {
      dom.handEndOverlay.classList.remove("is-hidden");
      dom.handEndOverlay.onclick = function () {
        // 结算锁防止连击
        if (gameState.isProcessingSettlement) { return; }
        dom.handEndOverlay.classList.add("is-hidden");
        dom.handEndOverlay.onclick = null;
        hideHandEndOverlay();
        if (dom.showdownStatus) { dom.showdownStatus.classList.add("is-hidden"); }
        // 清理所有玩家的摊牌牌型与手牌，为下一局做准备
        var pi;
        for (pi = 0; pi < gameState.players.length; pi += 1) {
          if (gameState.players[pi].handTagEl) {
            gameState.players[pi].handTagEl.textContent = "";
            var hBaseCls = (gameState.players[pi].type === "hero") ? "seat-hand-tag hero-hand-tag" : "seat-hand-tag hand-desc-tag";
            gameState.players[pi].handTagEl.className = hBaseCls + " is-hidden";
          }
        }
        // 启动下一局，筹码跨局继承
        startGame(true);
      };
    }
  }

  function isStreetReadyToAdvance() {
    var i;
    var p;
    // 核心判定：未弃牌的存活玩家中
    // 1) 能行动者：都已行动过且 currentBet == currentBetLevel
    // 2) 不能行动者（all-in / 无筹码）：不阻塞下注轮推进
    for (i = 0; i < gameState.playersClockwise.length; i += 1) {
      p = gameState.playersClockwise[i];
      if (!p || p.folded || p.eliminated) { continue; }
      if (!canAct(p)) { continue; }
      if (!p.hasActedThisRound) { return false; }
      if (p.currentBet !== gameState.currentBetLevel) { return false; }
    }
    return true;
  }

  function formatDecisionBubbleText(player, decision) {
    var toCall = getToCall(player);
    var delta;
    if (!decision || !decision.action) {
      return "";
    }
    if (decision.action === "fold") {
      return "Fold";
    }
    if (decision.action === "check") {
      return "Check";
    }
    if (decision.action === "call") {
      return "Call +" + formatChips(toCall);
    }
    if (decision.action === "raise") {
      delta = Math.max(0, (decision.raiseTotal || 0) - player.currentBet);
      return "Raise +" + formatChips(delta);
    }
    if (decision.action === "allin") {
      return "All-in +" + formatChips(player.chips);
    }
    return String(decision.action);
  }

  function scheduleProcessNextTurn() {
    if (gameState.turnEngine.scheduled) { return; }
    gameState.turnEngine.scheduled = true;
    gameState.turnEngine.token += 1;
    var token = gameState.turnEngine.token;
    window.setTimeout(function () {
      processNextTurn(token);
    }, 0);
  }

  async function processNextTurn(token) {
    var player;
    var next;
    var single;
    var action;
    var bubble;

    if (token !== gameState.turnEngine.token) { return; }
    gameState.turnEngine.scheduled = false;

    if (!gameState.handActive || gameState.isDealing) { return; }
    if (gameState.phase === PHASE.TOURNAMENT_OVER) { return; }
    if (gameState.loopRunning) { return; }
    gameState.loopRunning = true;

    try {
      if (countPlayersInHand() <= 1) {
        single = resolveSingleWinner();

        // 即使是全员弃牌，也要让存活玩家及弃牌AI的牌半透明翻开曝光
        gameState.players.forEach(function (p) {
          if (!p.eliminated) {
            revealSinglePlayerShowdownUi(p);
          }
        });

        if (single) {
          // 使用原子结算，飞行动画完成后进入下一局
          concludeShowdownCalculations([single], gameState.pot, 0, function () {
            showHandEndOverlay();
            window.setTimeout(function () {
              endHandSequence();
            }, 100);
          });
        } else {
          // 无赢家边缘情况，延迟进入结算
          window.setTimeout(function () {
            endHandSequence();
          }, 500);
        }
        return;
      }

      // 【彻底修复下注发牌卡死】下注轮完结 → 立刻清理下注 → 自动发下一阶段公共牌
      if (isStreetReadyToAdvance()) {
        await advanceStreet();
        return;
      }

      if (gameState.actionSeatIndex < 0) {
        gameState.actionSeatIndex = getFirstActorIndex();
      }

      player = getClockwisePlayer(gameState.actionSeatIndex);
      if (!player || !playerNeedsAction(player)) {
        next = findNextActorIndex(gameState.actionSeatIndex);
        gameState.actionSeatIndex = next >= 0 ? next : getFirstActorIndex();
        scheduleProcessNextTurn();
        return;
      }

      highlightActor(player);
      updateHeroActionBar();

      if (player.type === "hero") {
        // 【自动Fold】Hero 没有足够筹码跟注且无法过牌时，强制弃牌
        var heroToCall = getToCall(player);
        if (heroToCall > 0 && player.chips < heroToCall) {
          applyFold(player);
          showSeatActionBubble(player, "Fold");
          updateBetTagForPlayer(player);
          setActionBarEnabled(false);
          hideRaiseMultiples();
          var heroNext = findNextActorIndex(gameState.actionSeatIndex);
          gameState.actionSeatIndex = heroNext >= 0 ? heroNext : getFirstActorIndex();
          scheduleProcessNextTurn();
          return;
        }
        return;
      }

      // 【自动Fold】AI 没有足够筹码跟注（call）且无法过牌（check）时，强制弃牌
      var aiToCallBefore = getToCall(player);
      if (aiToCallBefore > 0 && player.chips < aiToCallBefore) {
        // 【Bug1 修复】先等待延迟（模拟思考），再执行弃牌动作
        await delay(getAiThinkDelayMs());
        applyFold(player);
        updateBetTagForPlayer(player);
        scheduleProcessNextTurn();
        return;
      }

      // 【Bug1 修复】先等待完整延迟（模拟思考），再计算决策并提交动作
      await delay(getAiThinkDelayMs());
      action = decideAIAction(player);
      bubble = formatDecisionBubbleText(player, action);
      applyAIDecision(player, action);
      updateBetTagForPlayer(player);

      scheduleProcessNextTurn();
    } finally {
      gameState.loopRunning = false;
    }
  }

  // 兼容旧调用：保留 runActionLoop 名称，但底层使用新的 turn engine
  async function runActionLoop() {
    scheduleProcessNextTurn();
  }

  function onHeroAction(actionType, options) {
    // 【BB 预发牌路由】Hero 作为大盲时的 Call/Raise/Fold/Allin 走专用路径
    if (gameState.isBBPreDealPhase) {
      var bbPlayer = gameState.bbPreDealPlayer;
      var bbResolve = gameState.bbPreDealResolve;
      var bbCallAmt = gameState.bbPreDealCallAmount;
      if (!bbPlayer || !bbResolve) { return; }

      var opts = options || {};
      // 防止结算锁连击
      if (gameState.isProcessingSettlement) { return; }

      if (actionType === "fold") {
        applyFold(bbPlayer);
      } else if (actionType === "call") {
        applyCall(bbPlayer);
      } else if (actionType === "raise") {
        var raiseTotal = opts.raiseTotal;
        if (!raiseTotal) {
          raiseTotal = bbPlayer.currentBet + bbCallAmt;
        }
        applyRaiseTo(bbPlayer, raiseTotal);
      } else if (actionType === "allin") {
        applyAllIn(bbPlayer);
      }

      gameState.currentBetLevel = Math.max(bbCallAmt, bbPlayer.currentBet);
      updateBetTagForPlayer(bbPlayer);
      updatePlayerChipsDisplay(bbPlayer);
      updatePotDisplay();

      cleanupBBPreDealState();
      setActionBarEnabled(false);
      hideRaiseMultiples();
      if (dom.actionHint) { dom.actionHint.textContent = "Dealing…"; }
      bbResolve();
      return;
    }

    var hero = null;
    var i;
    var next;
    var single;
    var opts = options || {};

    // 【正常游戏路由】---- 以下为正常下注阶段的 Hero 动作处理 ----
    var bubbleText = "";
    var decision = { action: actionType };
    if (opts.raiseTotal) {
      decision.raiseTotal = opts.raiseTotal;
    }
    for (i = 0; i < gameState.playersClockwise.length; i += 1) {
      if (gameState.playersClockwise[i].type === "hero") {
        hero = gameState.playersClockwise[i];
        break;
      }
    }
    if (!hero || gameState.actionSeatIndex !== hero.seatIndex || !gameState.handActive) {
      return;
    }
    bubbleText = formatDecisionBubbleText(hero, decision);
    applyPlayerAction(hero, actionType, opts);
    setActionBarEnabled(false);
    hideRaiseMultiples();
    if (bubbleText) {
      showSeatActionBubble(hero, bubbleText);
    }
    updateBetTagForPlayer(hero);

    if (countPlayersInHand() <= 1) {
      single = resolveSingleWinner();
      if (dom.showdownBanner && single) {
        dom.showdownBanner.textContent = single.name + " 收池（全员弃牌）";
        dom.showdownBanner.classList.remove("is-hidden");
      }
      endHandSequence();
      return;
    }

    if (isStreetReadyToAdvance()) {
      advanceStreet();
      return;
    }

    // 【Bug2 修复】重置回合引擎令牌，为下一位 AI 创建全新的独立延迟周期
    gameState.turnEngine.scheduled = false;
    gameState.turnEngine.token += 1;
    next = findNextActorIndex(gameState.actionSeatIndex);
    gameState.actionSeatIndex = next >= 0 ? next : getFirstActorIndex();
    scheduleProcessNextTurn();
  }

  function beginPreflopBetting() {
    var amounts = getBlindAmounts();
    // BB 预发牌决策后的实际下注额作为当前街道最高注
    var blinds = getBlindSeatIndices();
    var bbPlayer = gameState.playersClockwise[blinds.bb];
    var actualBBLevel = bbPlayer ? bbPlayer.currentBet : amounts.bigBlind;
    // 【Bug4 修复】每轮发牌阶段开始时强制重置 Raise 封顶计数器
    if (gameState.bettingCap) {
      gameState.bettingCap.streetBetCycles = 0;
    }
    gameState.handActive = true;
    gameState.heroFoldedThisHand = false;
    gameState.minRaise = amounts.bigBlind;
    gameState.currentBetLevel = Math.max(amounts.bigBlind, actualBBLevel);
    setPhaseLabel(PHASE.PREFLOP);
    hideHandEndOverlay();
    if (dom.showdownBanner) {
      dom.showdownBanner.classList.add("is-hidden");
    }
    gameState.actionSeatIndex = getFirstActorIndex();
    runActionLoop();
  }

  function initHandEndControls() {
    if (dom.btnNextHand) {
      dom.btnNextHand.addEventListener("click", function () {
        hideHandEndOverlay();
        startGame(true);
      });
    }
    if (dom.btnHandEndLobby) {
      dom.btnHandEndLobby.addEventListener("click", function () {
        hideHandEndOverlay();
        exitToLobby();
      });
    }
  }

  function initRaiseMultipleButtons() {
    var buttons;
    var i;
    if (!dom.raiseMultiples) {
      return;
    }
    buttons = dom.raiseMultiples.querySelectorAll(".raise-multiples__btn");
    for (i = 0; i < buttons.length; i += 1) {
      buttons[i].addEventListener("click", function (evt) {
        var mult = parseInt(evt.currentTarget.dataset.mult, 10);
        var total = calcHeroRaiseTotal(mult);
        onHeroAction("raise", { raiseTotal: total });
      });
    }
  }

  // 【补充】核心行动按钮绑定 —— 弃牌/过牌/跟注/加注/全下
  function initActionButtons() {
    if (dom.btnFold) {
      dom.btnFold.addEventListener("click", function () {
        onHeroAction("fold");
      });
    }
    if (dom.btnCheck) {
      dom.btnCheck.addEventListener("click", function () {
        onHeroAction("check");
      });
    }
    if (dom.btnCall) {
      dom.btnCall.addEventListener("click", function () {
        onHeroAction("call");
      });
    }
    // 加注按钮直接触发默认加注（1x 底注），倍数面板始终可见供选择
    if (dom.btnRaise) {
      dom.btnRaise.addEventListener("click", function () {
        var heroP = null;
        var ii;
        for (ii = 0; ii < gameState.playersClockwise.length; ii += 1) {
          if (gameState.playersClockwise[ii].type === "hero") { heroP = gameState.playersClockwise[ii]; break; }
        }
        if (!heroP || !gameState.handActive) { return; }
        var bb = getBlindAmounts().bigBlind;
        var raiseTo = heroP.currentBet + getToCall(heroP) + bb;
        if (raiseTo > heroP.currentBet + heroP.chips) { raiseTo = heroP.currentBet + heroP.chips; }
        onHeroAction("raise", { raiseTotal: raiseTo });
      });
    }
    if (dom.btnAllin) {
      dom.btnAllin.addEventListener("click", function () {
        onHeroAction("allin");
      });
    }
  }

  // 【补充】金手指面板折叠与功能按钮绑定
  function initCheatPanel() {
    if (dom.cheatToggle && dom.cheatPanel) {
      dom.cheatToggle.addEventListener("click", function () {
        dom.cheatPanel.classList.toggle("is-collapsed");
      });
    }
    if (dom.btnGodEye) {
      dom.btnGodEye.addEventListener("click", toggleGodEye);
    }
    if (dom.btnInfiniteChips) {
      dom.btnInfiniteChips.addEventListener("click", addInfiniteChips);
    }
  }

  // 【补充】退出游戏 + 跳过发牌/摊牌按钮绑定
  function initExitControls() {
    if (dom.btnExitGame) {
      dom.btnExitGame.addEventListener("click", exitToLobby);
    }
    if (dom.btnSkipDeal) {
      dom.btnSkipDeal.addEventListener("click", skipDealAnimation);
    }
    if (dom.btnSkipShowdown) {
      dom.btnSkipShowdown.addEventListener("click", skipShowdownAnimation);
    }
  }

  // 修复合并后的操作面板按钮绑定
  function initLobby() {
    // 1. 核心流绑定：AI 玩家数量加减组件交互绑定
    var aiMinusBtn = document.getElementById("btn-ai-minus");
    var aiPlusBtn = document.getElementById("btn-ai-plus");
    var aiDisplay = document.getElementById("ai-count-display");

    if (aiMinusBtn) {
      aiMinusBtn.onclick = function () {
        if (gameSettings.aiPlayerCount > MIN_AI) {
          gameSettings.aiPlayerCount -= 1;
          if (aiDisplay) { aiDisplay.textContent = String(gameSettings.aiPlayerCount); }
          aiMinusBtn.disabled = gameSettings.aiPlayerCount <= MIN_AI;
          aiPlusBtn.disabled = gameSettings.aiPlayerCount >= MAX_AI;
          updateLobbySummary(); // 实时同步刷新大厅下方的状态汇总
        }
      };
      aiMinusBtn.disabled = gameSettings.aiPlayerCount <= MIN_AI; // 初始化禁用状态
    }
    if (aiPlusBtn) {
      aiPlusBtn.onclick = function () {
        if (gameSettings.aiPlayerCount < MAX_AI) { // 遵循设置最大限制 8 人
          gameSettings.aiPlayerCount += 1;
          if (aiDisplay) { aiDisplay.textContent = String(gameSettings.aiPlayerCount); }
          aiMinusBtn.disabled = gameSettings.aiPlayerCount <= MIN_AI;
          aiPlusBtn.disabled = gameSettings.aiPlayerCount >= MAX_AI;
          updateLobbySummary(); // 实时同步刷新大厅下方的状态汇总
        }
      };
      aiPlusBtn.disabled = gameSettings.aiPlayerCount >= MAX_AI; // 初始化禁用状态
    }

    // 2. 核心流绑定：大循环圈数加减组件交互绑定
    var loopMinusBtn = document.getElementById("btn-loop-minus");
    var loopPlusBtn = document.getElementById("btn-loop-plus");
    var loopDisplay = document.getElementById("loop-count-display");

    if (loopMinusBtn) {
      loopMinusBtn.onclick = function () {
        if (gameSettings.loopCount > 1) {
          gameSettings.loopCount -= 1;
          if (loopDisplay) { loopDisplay.textContent = String(gameSettings.loopCount); }
          loopMinusBtn.disabled = gameSettings.loopCount <= 1;
          loopPlusBtn.disabled = gameSettings.loopCount >= 20;
          updateLobbySummary(); // 实时同步刷新大厅下方的状态汇总
        }
      };
      loopMinusBtn.disabled = gameSettings.loopCount <= 1; // 初始化禁用状态
    }
    if (loopPlusBtn) {
      loopPlusBtn.onclick = function () {
        if (gameSettings.loopCount < 20) { // 设定上限最大20圈
          gameSettings.loopCount += 1;
          if (loopDisplay) { loopDisplay.textContent = String(gameSettings.loopCount); }
          loopMinusBtn.disabled = gameSettings.loopCount <= 1;
          loopPlusBtn.disabled = gameSettings.loopCount >= 20;
          updateLobbySummary(); // 实时同步刷新大厅下方的状态汇总
        }
      };
      loopPlusBtn.disabled = gameSettings.loopCount >= 20; // 初始化禁用状态
    }

    // 3. 核心修复：使用事件委托绑定 AI 难度卡片选择组（解决动态渲染导致找不到节点而崩溃的死穴）
    var difficultyList = document.getElementById("difficulty-list");
    if (difficultyList) {
      difficultyList.onclick = function (e) {
        // 向上冒泡寻找最近的难度选项卡片
        var opt = e.target.closest(".difficulty-option");
        if (opt) {
          // 提取当前卡片内存储的难度级别数值
          var level = parseInt(opt.dataset.level, 10) || 2;
          // 从 AI_DIFFICULTIES 列表中找到匹配的完整难度对象（含 stars/id/name）
          var j;
          var picked = AI_DIFFICULTIES[0];
          for (j = 0; j < AI_DIFFICULTIES.length; j += 1) {
            if (AI_DIFFICULTIES[j].level === level) {
              picked = AI_DIFFICULTIES[j];
              break;
            }
          }
          // 委托给统一的难度选择函数处理（内部更新 UI 和配置）
          selectDifficulty(picked);
        }
      };
    }

    // 4. 打开大厅配置面板点击事件
    if (dom.btnOpenLobby) {
      dom.btnOpenLobby.onclick = function () {
        showLobby();
      };
    }

    // 5. 绑定盲注预设下拉选择框更改事件
    var blindSelect = document.getElementById("blind-preset-select");
    if (blindSelect) {
      blindSelect.onchange = function () {
        var val = parseInt(blindSelect.value, 10) || 0;
        gameSettings.blindPresetIndex = val;
        updateLobbySummary();
      };
    }

    // 6. 绑定初始筹码 Buy-In 输入框动态感知事件
    var chipsInput = document.getElementById("starting-chips-input");
    if (chipsInput) {
      chipsInput.oninput = function () {
        var val = parseInt(chipsInput.value, 10) || 10000;
        gameSettings.startingChips = val;
        updateLobbySummary();
      };
    }

    // 7. 核心复活：重构并彻底恢复“开始游戏”大按钮点击事件
    var startGameBtn = document.getElementById("btn-start-game");
    if (startGameBtn) {
      startGameBtn.onclick = function() {
        startGame(false); // 关掉大厅遮罩，扣除盲注，直接洗牌发牌进局
      };
    }

    // 8. 统一对齐 HTML 的类名，对大厅内所有交互元素的变动进行补丁监听
    var lobbyInputs = document.querySelectorAll(".stepper__btn, .lobby-select, .lobby-input");
    lobbyInputs.forEach(function(el) {
      el.addEventListener("click", function() {
        // 利用微延迟，等待 DOM 的值变更完后再执行状态同步刷新
        setTimeout(updateLobbySummary, 50);
      });
      el.addEventListener("change", function() {
        updateLobbySummary();
      });
    });

    // 9. 核心修复：在完成所有事件绑定后统一渲染难度卡片，保证动态 DOM 存在后再填充
    // 10. AI 延迟滑块显示值实时同步
    var delaySlider = document.getElementById("setting-ai-delay");
    var delayDisplay = document.getElementById("delay-value-display");
    if (delaySlider && delayDisplay) {
      delaySlider.addEventListener("input", function () {
        delayDisplay.textContent = String(delaySlider.value);
      });
      delayDisplay.textContent = String(delaySlider.value);
    }

    renderDifficultyOptions();
    updateLobbySummary(); 
  }

  function preventDoubleTapZoom() {
    var lastTouchEnd = 0;
    document.addEventListener(
      "touchend",
      function (event) {
        var now = Date.now();
        if (now - lastTouchEnd <= 300) {
          event.preventDefault();
        }
        lastTouchEnd = now;
      },
      { passive: false }
    );
  }

  function initRankToggle() {
    var btn = document.getElementById("btn-rank-toggle");
    var rankPanel = document.getElementById("custom-showdown-rank");
    if (!btn || !rankPanel) { return; }
    // 默认静默隐藏
    rankPanel.classList.add("is-hidden");
    btn.addEventListener("click", function () {
      if (rankPanel.classList.contains("is-hidden")) {
        renderDynamicRankList();
        rankPanel.classList.remove("is-hidden");
      } else {
        rankPanel.classList.add("is-hidden");
      }
    });
  }

  function init() {
    bindDom();
    initLobby();
    initActionButtons();
    initRaiseMultipleButtons();
    initHandEndControls();
    initCheatPanel();
    initExitControls();
    initRankToggle();
    preventDoubleTapZoom();
    updatePotDisplay();
    setPhaseLabel(PHASE.LOBBY);
    setActionBarEnabled(false);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  window.TexasHoldem = {
    gameSettings: gameSettings,
    gameState: gameState,
    startGame: startGame,
    skipDealAnimation: skipDealAnimation,
    fisherYatesShuffle: fisherYatesShuffle,
    createStandardDeck: createStandardDeck,
    evaluateHand: evaluateHand,
    evaluateFiveCards: evaluateBestFromCards,
    evaluateBestFromCards: evaluateBestFromCards,
    compareEvaluations: compareEvaluations,
    formatHandDescription: formatHandDescription
  };
})();
