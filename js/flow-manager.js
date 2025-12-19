window.FlowManager = {
    currentScene: null,
    history: [],

    init() {
        console.log('[FlowManager] Initialized');
    },

    // Helpers to parse "chapter/page"
    parseScene(scenePath) {
        if (!scenePath) return { chapter: 'root', page: 'title' };

        // Handle "chapter/page" format
        const parts = scenePath.split('/');

        // If single part, it's root chapter (e.g. 'title')
        if (parts.length === 1) {
            return { chapter: 'root', page: parts[0] };
        }

        // If "a1-study/p1", chapter="a1-study", page="p1"
        // If "a4-play/level-1/p1", chapter="a4-play/level-1", page="p1"
        const page = parts.pop();
        const chapter = parts.join('/');

        return { chapter, page };
    },

    // Navigate to next page in current chapter
    goNext(transition = 'slide-left', hideHUD = 'none') {
        if (!this.currentScene) {
            console.warn('[FlowManager] Current scene unkown, cannot go next.');
            return;
        }

        const { chapter, page } = this.parseScene(this.currentScene);
        const flow = window.gameConfig.flow[chapter];

        if (!flow) {
            console.error(`[FlowManager] Chapter '${chapter}' not found in config.`);
            return;
        }

        const currentIndex = flow.indexOf(page);
        if (currentIndex === -1) {
            console.error(`[FlowManager] Page '${page}' not found in chapter '${chapter}'.`);
            return;
        }

        const nextIndex = currentIndex + 1;
        if (nextIndex < flow.length) {
            const nextPage = flow[nextIndex];
            // Construc full path for loadScene
            const nextPath = chapter === 'root' ? nextPage : `${chapter}/${nextPage}`;

            console.log(`[FlowManager] Navigating: ${this.currentScene} -> ${nextPath}`);

            // Call the existing loader
            if (typeof loadSceneTrans === 'function') {
                loadSceneTrans(nextPath, hideHUD, transition);
                this.currentScene = nextPath; // Update tracker
            } else {
                console.error('[FlowManager] loadSceneTrans is not defined.');
            }
        } else {
            console.warn('[FlowManager] End of chapter reached.');
            // Optional: Handle end of chapter (e.g. go back to menu)
        }
    },

    // Navigate to previous page
    goPrev(transition = 'slide-right', hideHUD = 'none') {
        if (!this.currentScene) return;

        const { chapter, page } = this.parseScene(this.currentScene);
        const flow = window.gameConfig.flow[chapter];

        if (!flow) return;

        const currentIndex = flow.indexOf(page);
        if (currentIndex > 0) {
            const prevPage = flow[currentIndex - 1];
            const prevPath = chapter === 'root' ? prevPage : `${chapter}/${prevPage}`;

            loadSceneTrans(prevPath, hideHUD, transition);
            this.currentScene = prevPath;
        } else {
            console.warn('[FlowManager] Start of chapter reached.');
        }
    },

    // Jump specific scene
    goTo(scenePath, transition = 'fade', hideHUD = 'none') {
        if (typeof loadSceneTrans === 'function') {
            loadSceneTrans(scenePath, hideHUD, transition);
            this.currentScene = scenePath;
        }
    }
};

// Global Alias (Easy Access)
window.goNext = (t, h) => window.FlowManager.goNext(t, h);
window.goPrev = (t, h) => window.FlowManager.goPrev(t, h);
window.goTo = (s, t, h) => window.FlowManager.goTo(s, t, h);
