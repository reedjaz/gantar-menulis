const sfxHandlers = {
    decide: () => soundman.play('decide'),
    cancel: () => soundman.play('cancel'),
    click: () => soundman.play('click'),
    enter: () => soundman.play('enter'),
    error: () => soundman.play('error'),
    hover: () => soundman.play('hover'),
};

function setupBtnSFX() {
    setupLockedAnswerShake();
    document.querySelectorAll('.btn-decide').forEach(el => el.addEventListener('click', sfxHandlers.decide));
    document.querySelectorAll('.btn-cancel').forEach(el => el.addEventListener('click', sfxHandlers.cancel));
    document.querySelectorAll('.btn-click').forEach(el => el.addEventListener('click', sfxHandlers.click));
    document.querySelectorAll('.btn-enter').forEach(el => el.addEventListener('click', sfxHandlers.enter));
    document.querySelectorAll('.btn-error').forEach(el => el.addEventListener('click', sfxHandlers.error));
    // document.querySelectorAll('button').forEach(el => el.addEventListener('mouseenter', sfxHandlers.hover));
}

function detachBtnSFX() {
    document.querySelectorAll('.btn-decide').forEach(el => el.removeEventListener('click', sfxHandlers.decide));
    document.querySelectorAll('.btn-cancel').forEach(el => el.removeEventListener('click', sfxHandlers.cancel));
    document.querySelectorAll('.btn-click').forEach(el => el.removeEventListener('click', sfxHandlers.click));
    document.querySelectorAll('.btn-enter').forEach(el => el.removeEventListener('click', sfxHandlers.enter));
    document.querySelectorAll('.btn-error').forEach(el => el.removeEventListener('click', sfxHandlers.error));
    // // document.querySelectorAll('button').forEach(el => el.removeEventListener('mouseenter', sfxHandlers.hover));
}

function checkAnswer(group, correctAnswers) {

    let userAnswer = window.selectedAnswers?.[group];

    if (!userAnswer) {
        userAnswer = getFinalAnswerText() || '';
    }

    if (!userAnswer) {
        console.log("Belum ada jawaban dipilih.");
        return false;
    }

    const correctList = Array.isArray(correctAnswers) ? correctAnswers : [correctAnswers];
    const isCorrect = correctList
        .map(ans => ans.toUpperCase())
        .includes(userAnswer.toUpperCase());

    soundman.play(isCorrect ? "correct" : "wrong");

    window.score = window.score || 0;
    window.combo = window.combo || 0;

    if (isCorrect) {
        window.score += 1;
        window.combo += 1;
        console.log(`✅ Benar! Skor: ${window.score}, Kombo: ${window.combo}`);
    } else {
        window.combo = 0;
        console.log(`❌ Salah. Skor tetap: ${window.score}, Kombo direset.`);
    }

    console.log(`Jawaban Pemain: ${userAnswer}`);
    console.log(`Jawaban Benar: ${correctList}`);

    return isCorrect;

}

function checkAnswerAdv(group, correctAnswers) {
    let userAnswer = getFinalAnswerAdvancedText();

    if (!userAnswer) {
        console.log("Belum ada jawaban dipilih.");
        return false;
    }

    const correctList = Array.isArray(correctAnswers) ? correctAnswers : [correctAnswers];
    const isCorrect = correctList
        .map(ans => ans.toUpperCase().trim())
        .includes(userAnswer.toUpperCase());

    soundman.play(isCorrect ? "correct" : "wrong");

    window.score = window.score || 0;
    window.combo = window.combo || 0;

    if (isCorrect) {
        window.score += 1;
        window.combo += 1;
        console.log(`✅ Benar! Skor: ${window.score}, Kombo: ${window.combo}`);
    } else {
        window.combo = 0;
        console.log(`❌ Salah. Skor tetap: ${window.score}, Kombo direset.`);
    }

    console.log(`Jawaban Pemain: "${userAnswer}"`);
    console.log(`Jawaban Benar: ${correctList.map(a => `"${a}"`).join(', ')}`);

    return isCorrect;
}

function makeItCorrect() {
    window.score += 1;
    window.combo += 1;
    console.log(`✅ Benar! Skor: ${window.score}, Kombo: ${window.combo}`);
}


function setupLockedAnswerShake() {
    function lockedClickHandler(event) {
        const button = event.currentTarget;
        button.classList.remove('shake');
        void button.offsetWidth;
        button.classList.add('shake');
        console.log("Button is disabled!");
    }
    document.querySelectorAll('.btn-answer.locked').forEach(button => {
        button.removeEventListener('click', lockedClickHandler);
        button.addEventListener('click', lockedClickHandler);
        button.classList.add('btn-error');
    });
}
