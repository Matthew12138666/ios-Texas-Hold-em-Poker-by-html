/**
 * 全局设置与 AI 个性矩阵（Personality Matrix）
 */
(function () {
  "use strict";

  var PERSONALITY_MATRIX = {
    1: {
      aggression: [0.3, 0.6],
      tightness: [0.4, 0.6],
      bluffing: [0.05, 0.15],
      positionAware: false,
      mcSims: 0,
      correctRate: 0.6,
      randomRate: 0.2,
      foldToRaiseRate: 0.2
    },
    2: {
      aggression: [0.5, 0.7],
      tightness: [0.5, 0.7],
      bluffing: [0.08, 0.18],
      positionAware: false,
      mcSims: 800,
      correctRate: 0.8,
      randomRate: 0.2,
      foldToRaiseRate: 0.1
    },
    3: {
      aggression: [0.6, 0.75],
      tightness: [0.6, 0.7],
      bluffing: [0.1, 0.2],
      positionAware: false,
      mcSims: 1200,
      correctRate: 0.88,
      randomRate: 0.12,
      usePotOdds: true
    },
    4: {
      aggression: [0.75, 0.8],
      tightness: [0.7, 0.8],
      bluffing: [0.1, 0.2],
      positionAware: true,
      mcSims: 1600,
      correctRate: 0.92,
      randomRate: 0.08,
      usePotOdds: true,
      useBetSizing: true
    },
    5: {
      aggression: [0.85, 0.9],
      tightness: [0.8, 0.9],
      bluffing: [0.3, 0.4],
      positionAware: true,
      mcSims: 2000,
      correctRate: 0.95,
      randomRate: 0.05,
      usePotOdds: true,
      useBetSizing: true,
      dynamicBluff: true
    }
  };

  function rollInRange(range) {
    return range[0] + Math.random() * (range[1] - range[0]);
  }

  function getPersonality(difficultyLevel) {
    var key = difficultyLevel;
    if (!PERSONALITY_MATRIX[key]) {
      key = 2;
    }
    var base = PERSONALITY_MATRIX[key];
    return {
      level: key,
      aggression: rollInRange(base.aggression),
      tightness: rollInRange(base.tightness),
      bluffing: rollInRange(base.bluffing),
      positionAware: base.positionAware,
      mcSims: base.mcSims,
      correctRate: base.correctRate,
      randomRate: base.randomRate || 0.15,
      foldToRaiseRate: base.foldToRaiseRate || 0.15,
      usePotOdds: !!base.usePotOdds,
      useBetSizing: !!base.useBetSizing,
      dynamicBluff: !!base.dynamicBluff
    };
  }

  function resolveDifficultyByLevel(level, difficulties) {
    var i;
    for (i = 0; i < difficulties.length; i += 1) {
      if (difficulties[i].level === level) {
        return difficulties[i];
      }
    }
    return difficulties[0];
  }

  window.GameSettings = {
    PERSONALITY_MATRIX: PERSONALITY_MATRIX,
    getPersonality: getPersonality,
    resolveDifficultyByLevel: resolveDifficultyByLevel
  };
})();
