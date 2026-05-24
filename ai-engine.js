/**
 * AI 决策引擎 — 蒙特卡洛胜率、EV、个性矩阵
 */
(function () {
  "use strict";

  function getDeps() {
    return window.TexasHoldem || null;
  }

  function knownCardIds(cards) {
    var map = {};
    var i;
    for (i = 0; i < cards.length; i += 1) {
      map[cards[i].id] = true;
    }
    return map;
  }

  function buildRemainingDeck(knownCards) {
    var deps = getDeps();
    var full;
    var known = knownCardIds(knownCards);
    var out = [];
    var i;
    if (!deps || !deps.createStandardDeck) {
      return [];
    }
    full = deps.createStandardDeck();
    for (i = 0; i < full.length; i += 1) {
      if (!known[full[i].id]) {
        out.push(full[i]);
      }
    }
    return out;
  }

  function calculateEquity(holeCards, board, opponentCount, knownCards, simCount) {
    var deps = getDeps();
    var remaining;
    var wins = 0;
    var ties = 0;
    var s;
    var shuffled;
    var workBoard;
    var idx;
    var heroCards;
    var heroEval;
    var o;
    var oppHole;
    var oppEval;
    var bestOpp;
    var lost;

    if (!deps || !deps.fisherYatesShuffle || !deps.evaluateBestFromCards || simCount <= 0) {
      return 0.5;
    }

    if (opponentCount <= 0) {
      return 1;
    }

    remaining = buildRemainingDeck(knownCards);
    if (remaining.length < 5 - board.length + opponentCount * 2) {
      return 0.35;
    }

    for (s = 0; s < simCount; s += 1) {
      shuffled = deps.fisherYatesShuffle(remaining);
      idx = 0;
      workBoard = board.slice();
      while (workBoard.length < 5 && idx < shuffled.length) {
        workBoard.push(shuffled[idx]);
        idx += 1;
      }
      heroCards = holeCards.concat(workBoard);
      heroEval = deps.evaluateBestFromCards(heroCards);
      lost = false;
      bestOpp = null;
      for (o = 0; o < opponentCount; o += 1) {
        if (idx + 1 >= shuffled.length) {
          break;
        }
        oppHole = [shuffled[idx], shuffled[idx + 1]];
        idx += 2;
        oppEval = deps.evaluateBestFromCards(oppHole.concat(workBoard));
        if (!heroEval || !oppEval) {
          continue;
        }
        if (deps.compareEvaluations(oppEval, heroEval) > 0) {
          lost = true;
          break;
        }
        if (deps.compareEvaluations(oppEval, heroEval) === 0) {
          bestOpp = oppEval;
        }
      }
      if (!lost) {
        if (bestOpp) {
          ties += 1;
        } else {
          wins += 1;
        }
      }
    }

    return (wins + ties * 0.5) / simCount;
  }

  function countActiveOpponents(tableState, selfId) {
    var n = 0;
    var i;
    var p;
    for (i = 0; i < tableState.players.length; i += 1) {
      p = tableState.players[i];
      if (p.id === selfId) {
        continue;
      }
      if (!p.folded && !p.eliminated) {
        n += 1;
      }
    }
    return n;
  }

  function getPositionFlags(tableState, seatIndex) {
    var n = tableState.playerCount;
    var dealer = tableState.dealerIndex;
    var cutoff = (dealer - 1 + n) % n;
    return {
      isButton: seatIndex === dealer,
      isCutoff: seatIndex === cutoff,
      isLate: seatIndex === dealer || seatIndex === cutoff
    };
  }

  function noOneBetYet(tableState) {
    var i;
    var p;
    if (tableState.currentBetLevel !== 0) {
      return false;
    }
    for (i = 0; i < tableState.players.length; i += 1) {
      p = tableState.players[i];
      if (p.folded || p.eliminated || p.allIn) {
        continue;
      }
      if (p.currentBet > 0) {
        return false;
      }
    }
    return true;
  }

  function everyoneBeforeChecked(tableState, selfId) {
    // 无法直接获取“行动顺序之前的人”，这里用 hasActedThisRound 近似：
    // 如果已经有人行动过，且他们都只是 Check（currentBet=0，且桌面无下注），则视为“前面都 Check”。
    var i;
    var p;
    var someoneActed = false;
    if (!noOneBetYet(tableState)) {
      return false;
    }
    for (i = 0; i < tableState.players.length; i += 1) {
      p = tableState.players[i];
      if (p.id === selfId) {
        continue;
      }
      if (p.folded || p.eliminated || p.allIn) {
        continue;
      }
      if (p.hasActedThisRound) {
        someoneActed = true;
        if (p.currentBet !== 0) {
          return false;
        }
      }
    }
    return someoneActed;
  }

  function preflopHandGrade(holeCards) {
    // 返回 { tier: "premium|strong|playable|trash", suited, connector }
    if (!holeCards || holeCards.length < 2) {
      return { tier: "trash" };
    }
    var a = holeCards[0];
    var b = holeCards[1];
    var r1 = a.rank;
    var r2 = b.rank;
    var hi = Math.max(r1, r2);
    var lo = Math.min(r1, r2);
    var suited = a.suit === b.suit;
    var pair = r1 === r2;
    var gap = hi - lo;
    var connector = gap === 1;
    var broadway = hi >= 11 || lo >= 11; // J+ 或包含 A/K/Q/J
    var hasAce = hi === 14 || lo === 14;
    var hasBigCard = hi >= 13 || lo >= 13; // K+
    var tier = "trash";

    if (pair) {
      if (hi >= 13) {
        tier = "premium"; // AA/KK
      } else if (hi >= 11) {
        tier = "strong"; // QQ/JJ
      } else if (hi >= 8) {
        tier = "playable"; // 88/99/TT
      } else {
        tier = "playable";
      }
      return { tier: tier, suited: suited, connector: connector, pair: true };
    }

    // 同花连牌（含 1-gap）
    if (suited && gap <= 1 && hi >= 10) {
      return { tier: "strong", suited: suited, connector: gap <= 1, pair: false };
    }
    if (suited && connector) {
      return { tier: "playable", suited: suited, connector: true, pair: false };
    }

    // 含 A/K/Q/J
    if (broadway) {
      if (hasAce && hi >= 13) {
        tier = suited ? "strong" : "playable"; // AK
      } else if (hi >= 12 && lo >= 10) {
        tier = suited ? "strong" : "playable"; // AQ/AJ/KQ/QJ 等
      } else if (hasBigCard) {
        tier = suited ? "playable" : "trash";
      } else {
        tier = "playable";
      }
      return { tier: tier, suited: suited, connector: connector, pair: false };
    }

    // Axs
    if (hasAce && suited) {
      return { tier: "playable", suited: suited, connector: connector, pair: false };
    }

    return { tier: "trash", suited: suited, connector: connector, pair: false };
  }

  function estimatePreflopEquity(holeCards, difficultyLevel) {
    var g = preflopHandGrade(holeCards);
    var base;
    if (g.tier === "premium") {
      base = 0.88;
    } else if (g.tier === "strong") {
      base = 0.76;
    } else if (g.tier === "playable") {
      base = 0.62;
    } else {
      // 典型杂牌（如 2/7 杂色）压低胜率
      base = 0.18 + Math.random() * 0.12;
    }

    // 难度越高，越敢在翻牌前争夺盲注：把可玩牌的胜率拉到 60%~95% 区间
    if (g.tier !== "trash") {
      var bonus = (Math.max(1, Math.min(5, difficultyLevel)) - 1) / 4; // 0..1
      base = base + bonus * 0.16; // 可达 ~0.92
      base = Math.max(0.6, Math.min(0.95, base));
    }
    return Math.max(0.05, Math.min(0.98, base));
  }

  function getPostflopSimCount(difficultyLevel) {
    var lvl = Math.max(1, Math.min(5, difficultyLevel));
    // 500 ~ 2000
    var base = 500 + Math.round(((lvl - 1) / 4) * 1500);
    // 少量抖动，避免机械化
    return Math.max(500, Math.min(2000, base + Math.floor(Math.random() * 120) - 60));
  }

  function computeEv(equity, pot, toCall) {
    if (toCall <= 0) {
      return equity * pot;
    }
    return equity * (pot + toCall) - (1 - equity) * toCall;
  }

  function pickRaiseTotal(playerState, tableState, personality, equity, sizingRatio) {
    var pot = tableState.pot;
    var toCall = Math.max(0, tableState.currentBetLevel - playerState.currentBet);
    var minRaise = tableState.currentBetLevel + tableState.minRaise;
    var fromSizing;
    var target;
    if (personality.useBetSizing && sizingRatio > 0) {
      fromSizing = playerState.currentBet + Math.floor(pot * sizingRatio);
      target = Math.max(minRaise, fromSizing);
    } else {
      target = minRaise;
    }
    if (target > playerState.currentBet + playerState.chips) {
      return playerState.currentBet + playerState.chips;
    }
    return target;
  }

  function idealActionFromEquity(equity, toCall, personality, level) {
    if (toCall === 0) {
      if (equity > 0.65) {
        return "raise";
      }
      if (equity > 0.35) {
        return "check";
      }
      return "check";
    }
    if (level >= 2) {
      if (equity > 0.65) {
        return "raise";
      }
      if (equity > 0.4) {
        return "call";
      }
      return "fold";
    }
    if (equity > 0.55) {
      return "call";
    }
    return "fold";
  }

  function applyPersonalityNoise(action, equity, ev, personality, toCall, facingRaise) {
    var r = Math.random();
    if (r > personality.correctRate) {
      if (toCall === 0) {
        return r < 0.5 ? "check" : "call";
      }
      return r < 0.5 ? "fold" : "call";
    }
    if (facingRaise && toCall > 0 && r < personality.foldToRaiseRate) {
      return "fold";
    }
    if (r < personality.randomRate) {
      if (toCall === 0) {
        return r < 0.5 ? "check" : "raise";
      }
      return r < 0.5 ? "fold" : "call";
    }
    return action;
  }

  function makeAIDecision(playerState, tableState, difficultyLevel) {
    var personality = window.GameSettings.getPersonality(difficultyLevel);
    var toCall = Math.max(0, tableState.currentBetLevel - playerState.currentBet);
    var pot = tableState.pot + tableState.currentBetLevel;
    var opponents = countActiveOpponents(tableState, playerState.id);
    var known = playerState.holeCards.concat(tableState.board);
    var equity = 0.5;
    var ev = 0;
    var pos = getPositionFlags(tableState, playerState.seatIndex);
    var action = "check";
    var facingRaise = toCall > 0;
    var sizingRatio = 0.5;
    var allChecked = noOneBetYet(tableState);
    var checkedBeforeMe = everyoneBeforeChecked(tableState, playerState.id);
    var isPreflop = !tableState.board || tableState.board.length < 3;
    var r;

    if (playerState.chips <= 0) {
      return { action: "check" };
    }

    // ------------------------------
    // 翻牌前：严禁蒙特卡洛（未知牌太多导致胜率偏低 → 疯狂弃牌）
    // ------------------------------
    if (isPreflop) {
      equity = estimatePreflopEquity(playerState.holeCards, difficultyLevel);
    } else {
      // 翻牌后：启用 500~2000 次蒙特卡洛
      equity = calculateEquity(
        playerState.holeCards,
        tableState.board,
        opponents,
        known,
        getPostflopSimCount(difficultyLevel)
      );
    }

    // all-in/fold 临界要在 equity 有意义后再判断
    if (toCall >= playerState.chips) {
      if (equity > 0.45 || Math.random() < personality.aggression * 0.3) {
        return { action: "allin" };
      }
      return { action: "fold" };
    }

    ev = computeEv(equity, pot, toCall);
    ev += (personality.aggression - 0.5) * pot * 0.08;
    ev -= personality.tightness * toCall * 0.15;

    // 4/5 星：后位偷池/诈唬本能加权（Button / Cut-off，且前面都 Check）
    if (!isPreflop && difficultyLevel >= 4 && toCall === 0 && checkedBeforeMe && (pos.isButton || pos.isCutoff)) {
      equity = Math.min(1, equity + 0.2);
      ev += pot * 0.2;
    }

    // 5 星：空池诈唬（胜率 < 20%，且无人下注）
    if (!isPreflop && difficultyLevel >= 5 && toCall === 0 && allChecked && equity < 0.2) {
      if (Math.random() < 0.35) {
        var bluffSize = Math.max(tableState.bigBlind || 0, Math.floor(Math.max(1, tableState.pot) * 0.5));
        return {
          action: "raise",
          raiseTotal: Math.max(tableState.currentBetLevel + tableState.minRaise, playerState.currentBet + bluffSize)
        };
      }
    }

    action = idealActionFromEquity(equity, toCall, personality, difficultyLevel);

    if (personality.usePotOdds && toCall > 0) {
      var need = toCall / (pot + toCall);
      if (equity < need * 0.95 && action === "call") {
        action = "fold";
      }
    }

    if (personality.positionAware && toCall === 0) {
      if ((pos.isButton || pos.isCutoff) && checkedBeforeMe && equity > 0.3 && difficultyLevel >= 4) {
        action = "raise";
      }
    }

    if (personality.dynamicBluff && toCall === 0 && pos.isLate && allChecked) {
      if (equity < 0.2 && Math.random() < personality.bluffing) {
        action = "raise";
      }
    }

    if (toCall > 0 && equity < 0.25 && personality.bluffing > 0.2 && pos.isLate) {
      if (Math.random() < personality.bluffing * 0.35) {
        action = "raise";
      }
    }

    if (action === "raise" && personality.useBetSizing) {
      if (equity > 0.72) {
        sizingRatio = 0.5 + Math.random() * 0.3;
      } else if (equity > 0.45) {
        sizingRatio = 0.25 + Math.random() * 0.1;
      } else {
        sizingRatio = 0.35;
      }
    }

    // 翻牌前：除“垃圾牌”外，禁止被噪声强行 Fold
    if (isPreflop) {
      var g2 = preflopHandGrade(playerState.holeCards);
      if (g2.tier === "trash") {
        // 只有垃圾牌才执行 Tightness 弃牌检测
        if (toCall > 0 && Math.random() < personality.tightness) {
          action = "fold";
        } else {
          action = toCall > 0 ? "call" : "check";
        }
      } else {
        if (action === "fold") {
          action = toCall > 0 ? "call" : "check";
        }
        // 翻牌前不应用随机噪声，避免“疯狂 Fold”
      }
    } else {
      action = applyPersonalityNoise(action, equity, ev, personality, toCall, facingRaise);
    }

    if (action === "raise") {
      return {
        action: "raise",
        raiseTotal: pickRaiseTotal(playerState, tableState, personality, equity, sizingRatio)
      };
    }

    if (action === "call" && toCall === 0) {
      return { action: "check" };
    }

    if (action === "fold" && toCall === 0) {
      return { action: "check" };
    }

    return { action: action };
  }

  // 【BB 预发牌决策】基于AI难度决定 Call 还是 Raise
  function makeBBAction(holeCards, callAmount, difficultyLevel) {
    if (!holeCards || holeCards.length < 2) {
      return "call";
    }
    var g = preflopHandGrade(holeCards);
    // 高难度AI根据手牌质量决定是否加注
    if (difficultyLevel >= 3) {
      if (g.tier === "premium") {
        return Math.random() < 0.7 ? "raise" : "call";
      }
      if (g.tier === "strong") {
        return Math.random() < 0.35 ? "raise" : "call";
      }
      return "call";
    }
    if (difficultyLevel >= 2 && g.tier === "premium") {
      return Math.random() < 0.3 ? "raise" : "call";
    }
    return "call";
  }

  window.AIEngine = {
    calculateEquity: calculateEquity,
    makeAIDecision: makeAIDecision,
    makeBBAction: makeBBAction
  };
})();
