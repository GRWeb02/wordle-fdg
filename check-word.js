// Check today's word
const today = new Date();
const gameId = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
console.log('📅 Game ID (Today):', gameId);

const wordSeed = gameId.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
console.log('🎲 Word Seed:', wordSeed);

// Same word list as in the game
const words = [
    'ABOUT', 'ABOVE', 'ABUSE', 'ACTOR', 'ACUTE', 'ADMIT', 'ADOPT', 'ADULT', 'AFTER', 'AGAIN',
    'AGENT', 'AGREE', 'AHEAD', 'ALARM', 'ALBUM', 'ALERT', 'ALIEN', 'ALIGN', 'ALIKE', 'ALIVE',
    'ALLOW', 'ALONE', 'ALONG', 'ALTER', 'AMONG', 'ANGER', 'ANGLE', 'ANGRY', 'APART', 'APPLE',
    'APPLY', 'ARENA', 'ARGUE', 'ARISE', 'ARRAY', 'ASIDE', 'ASSET', 'AUDIO', 'AUDIT', 'AVOID',
    'AWAKE', 'AWARD', 'AWARE', 'BADLY', 'BAKER', 'BASES', 'BASIC', 'BEACH', 'BEGAN', 'BEGIN'
];

const todaysWord = words[wordSeed % words.length];
console.log('🎯 TODAY\'S WORD:', todaysWord);
console.log('📊 Word Index:', wordSeed % words.length);
console.log('📝 Total Words Available:', words.length);
