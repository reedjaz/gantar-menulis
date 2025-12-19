window.gameConfig = {
    // 1. Navigation Flow
    // Struktur: 'Chapter Name': ['page1', 'page2', ...]
    flow: {
        'root': ['title', 'main-menu', 'halt', 'about'],
        'a1-study': [
            'p0', 'p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8', 'p9'
        ],
        'a2-listen': [
            'p0', 'p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8', 'p9', 'p10'
        ],
        'a3-quiz': [
            'p0', 'p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'end'
        ],
        'a4-play': [
            'p0', 'lobby'
        ],
        'a4-play/level-1': ['p1', 'p2', 'p3', 'p4', 'p5', 'end'],
        'a4-play/level-2': ['p1', 'p2', 'p3', 'p4', 'p5', 'end'],
        'a4-play/level-3': ['p1', 'p2', 'p3', 'p4', 'p5', 'end'],
        'a4-play/level-4': ['p1', 'p2', 'p3', 'p4', 'p5', 'end'],
    },

    // 2. Audio Settings (BGM)
    // Key: 'scene-name' (full path), Value: 'setting string'
    bgm: {
        'title': { sound: '[FO=1]&bgm-menu' },
        'halt': { sound: '[FO=500]' },

        'a1-study/p0': { sound: '[FO=1000]&bgm-menu' },
        'a2-listen/p0': { sound: '[FO=1000]&bgm-menu' },
        'a3-quiz/p0': { sound: '[FO=1000]&bgm-menu' },
        'a4-play/p0': { sound: '[FO=1000]&bgm-menu' },

        'a1-study/p1': { sound: '[FO=1000]&bgm-study' },
        'a2-listen/p1': { sound: '[FO=1000]&bgm-listen' },
        'a3-quiz/p1': { sound: '[FO=1000]&bgm-quiz' },
        'a4-play/lobby': { sound: '[FO=1000]&bgm-play' },

        'a2-listen/p10': { sound: '[FO=500]&bgm-menu' },

        'a3-quiz/end': { sound: '[FO=150]' },

        'a4-play/level-1/p1': { sound: '[FO=150]&bgm-play' },
        'a4-play/level-2/p1': { sound: '[FO=150]&bgm-play' },
        'a4-play/level-3/p1': { sound: '[FO=150]&bgm-play' },
        'a4-play/level-4/p1': { sound: '[FO=150]&bgm-play' },

        'a4-play/level-1/end': { sound: '[FO=150]' },
        'a4-play/level-2/end': { sound: '[FO=150]' },
        'a4-play/level-3/end': { sound: '[FO=150]' },
        'a4-play/level-4/end': { sound: '[FO=150]' },
    },

    // 3. Voice Over Settings
    vo: {
        'title': { sound: 'vo-title', delay: 1500 },
    }
};
