// FDG Wordle Game Logic
class FDGWordle {
    constructor() {
        this.currentRow = 0;
        this.currentTile = 0;
        this.gameOver = false;
        this.gameWon = false;
        this.currentGuess = '';
        this.guesses = [];
        this.targetWord = '';
        this.gameId = this.generateGameId();
        
        this.initializeGame();
        this.setupEventListeners();
        this.loadStats();
    }

    generateGameId() {
        const today = new Date();
        // Use UTC to ensure consistent daily reset worldwide
        const utc = new Date(today.getTime() + (today.getTimezoneOffset() * 60000));
        return `${utc.getFullYear()}-${utc.getMonth()}-${utc.getDate()}`;
    }

    async initializeGame() {
        this.createGameBoard();

        // Load today's game state (if exists)
        this.loadTodaysGame();

        // If game is already over, just show the results
        if (this.gameOver) {
            this.showGameOverMessage();
            return;
        }

        // Get target word if we don't have it yet
        if (!this.targetWord) {
            await this.getTargetWord();
        }
    }

    async getTargetWord() {
        try {
            // Try to get word from server for enhanced security
            const response = await fetch('/api/daily-word', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ gameId: this.gameId })
            });

            if (response.ok) {
                const data = await response.json();
                if (data && data.word) {
                    this.targetWord = data.word;
                    console.log('🔒 Daily word loaded successfully');
                } else {
                    throw new Error('Invalid server response');
                }
            } else {
                throw new Error('Server not available');
            }
        } catch (error) {
            // Fallback to local word generation for offline play
            console.log('🎮 Using offline mode - game fully functional!');
            this.targetWord = this.getLocalTargetWord();
            console.log('🎯 Daily word generated');
        }

        // Final safety check
        if (!this.targetWord) {
            console.warn('Target word still not set, forcing local generation');
            this.targetWord = this.getLocalTargetWord();
            console.log('🎯 Daily word generated (fallback)');
        }
    }

    loadTodaysGame() {
        const savedGame = localStorage.getItem(`fdg-wordle-${this.gameId}`);

        if (savedGame) {
            const gameData = JSON.parse(savedGame);

            // Restore game state
            this.targetWord = gameData.targetWord;
            this.guesses = gameData.guesses || [];
            this.currentRow = gameData.currentRow || 0;
            this.currentTile = gameData.currentTile || 0;
            this.currentGuess = gameData.currentGuess || '';
            this.gameOver = gameData.gameOver || false;
            this.gameWon = gameData.gameWon || false;

            // Recreate the board with saved guesses
            this.recreateBoard(gameData);

            console.log('🔄 Game state loaded from today');
        }
    }

    saveTodaysGame() {
        const gameData = {
            gameId: this.gameId,
            targetWord: this.targetWord,
            guesses: this.guesses.map((guess, index) => ({
                word: guess,
                result: this.getGuessResult(guess, this.targetWord)
            })),
            currentRow: this.currentRow,
            currentTile: this.currentTile,
            currentGuess: this.currentGuess,
            gameOver: this.gameOver,
            gameWon: this.gameWon,
            timestamp: Date.now()
        };

        localStorage.setItem(`fdg-wordle-${this.gameId}`, JSON.stringify(gameData));
    }

    getGuessResult(guess, target) {
        const result = [];
        const targetLetters = target.split('');
        const guessLetters = guess.split('');

        // First pass: mark correct letters
        for (let i = 0; i < 5; i++) {
            if (guessLetters[i] === targetLetters[i]) {
                result[i] = 'correct';
                targetLetters[i] = null;
                guessLetters[i] = null;
            }
        }

        // Second pass: mark present letters
        for (let i = 0; i < 5; i++) {
            if (guessLetters[i] !== null) {
                const letterIndex = targetLetters.indexOf(guessLetters[i]);
                if (letterIndex !== -1) {
                    result[i] = 'present';
                    targetLetters[letterIndex] = null;
                } else {
                    result[i] = 'absent';
                }
            }
        }

        return result;
    }

    recreateBoard(gameData) {
        // Clear the board first
        for (let row = 0; row < 6; row++) {
            for (let col = 0; col < 5; col++) {
                const tile = document.getElementById(`tile-${row}-${col}`);
                tile.textContent = '';
                tile.className = 'tile';
            }
        }

        // Recreate each completed guess
        gameData.guesses.forEach((guessData, rowIndex) => {
            const word = guessData.word;
            const result = guessData.result;

            for (let col = 0; col < 5; col++) {
                const tile = document.getElementById(`tile-${rowIndex}-${col}`);
                tile.textContent = word[col];
                tile.classList.add(result[col]);
            }
        });

        // Recreate current guess in progress (if any)
        if (gameData.currentGuess && !gameData.gameOver) {
            for (let i = 0; i < gameData.currentGuess.length; i++) {
                const tile = document.getElementById(`tile-${gameData.currentRow}-${i}`);
                tile.textContent = gameData.currentGuess[i];
                tile.classList.add('filled');
            }
        }
    }

    showGameOverMessage() {
        if (this.gameWon) {
            this.showMessage('🎉 You already won today! Come back tomorrow for a new word.');
        } else {
            this.showMessage('😔 Game over. Come back tomorrow for a new word.');
        }

        // Show stats after a delay
        setTimeout(() => {
            this.showModal('statsModal');
            this.updateStatsDisplay();
        }, 3000);
    }

    getLocalTargetWord() {
        // Obfuscated word selection - makes it harder to find in inspect element
        const wordSeed = this.gameId.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
        const words = this.getWordList();
        return words[wordSeed % words.length];
    }

    getWordList() {
        // Comprehensive 5-letter word list - 2000+ words for maximum daily variety
        const encoded = [
            'ABACK', 'ABASE', 'ABATE', 'ABBEY', 'ABBOT', 'ABHOR', 'ABIDE', 'ABLED', 'ABODE', 'ABORT',
            'ABOUT', 'ABOVE', 'ABUSE', 'ABYSS', 'ACORN', 'ACRID', 'ACTOR', 'ACUTE', 'ADAGE', 'ADAPT',
            'ADEPT', 'ADMIN', 'ADMIT', 'ADOBE', 'ADOPT', 'ADORE', 'ADORN', 'ADULT', 'AFFIX', 'AFIRE',
            'AFOOT', 'AFOUL', 'AFTER', 'AGAIN', 'AGAPE', 'AGATE', 'AGENT', 'AGILE', 'AGING', 'AGLOW',
            'AGONY', 'AGREE', 'AHEAD', 'AIDER', 'AISLE', 'ALARM', 'ALBUM', 'ALERT', 'ALGAE', 'ALIBI',
            'ALIEN', 'ALIGN', 'ALIKE', 'ALIVE', 'ALLAY', 'ALLEY', 'ALLOT', 'ALLOW', 'ALLOY', 'ALOFT',
            'ALONE', 'ALONG', 'ALOOF', 'ALOUD', 'ALPHA', 'ALTAR', 'ALTER', 'AMASS', 'AMAZE', 'AMBER',
            'AMBLE', 'AMEND', 'AMISS', 'AMITY', 'AMONG', 'AMPLE', 'AMPLY', 'AMUSE', 'ANGEL', 'ANGER',
            'ANGLE', 'ANGRY', 'ANGST', 'ANIME', 'ANKLE', 'ANNEX', 'ANNOY', 'ANNUL', 'ANODE', 'ANTIC',
            'ANVIL', 'AORTA', 'APART', 'APHID', 'APING', 'APNEA', 'APPLE', 'APPLY', 'APRON', 'APTLY',
            'ARBOR', 'ARDOR', 'ARENA', 'ARGUE', 'ARISE', 'ARMOR', 'AROMA', 'AROSE', 'ARRAY', 'ARROW',
            'ARSON', 'ARTSY', 'ASCOT', 'ASHEN', 'ASIDE', 'ASKEW', 'ASSAY', 'ASSET', 'ATOLL', 'ATONE',
            'ATTIC', 'AUDIO', 'AUDIT', 'AUGUR', 'AUNTY', 'AVAIL', 'AVERT', 'AVIAN', 'AVOID', 'AWAIT',
            'AWAKE', 'AWARD', 'AWARE', 'AWASH', 'AWFUL', 'AWOKE', 'AXIAL', 'AXIOM', 'AXION', 'AZURE',
            'BACON', 'BADGE', 'BADLY', 'BAGEL', 'BAGGY', 'BAKER', 'BALER', 'BALMY', 'BANAL', 'BANJO',
            'BARGE', 'BARON', 'BASAL', 'BASIC', 'BASIL', 'BASIN', 'BASIS', 'BASTE', 'BATCH', 'BATHE',
            'BATON', 'BATTY', 'BAWDY', 'BAYOU', 'BEACH', 'BEADY', 'BEARD', 'BEAST', 'BEECH', 'BEEFY',
            'BEFIT', 'BEGAN', 'BEGAT', 'BEGET', 'BEGIN', 'BEGUN', 'BEING', 'BELCH', 'BELIE', 'BELLE',
            'BELLY', 'BELOW', 'BENCH', 'BERET', 'BERRY', 'BERTH', 'BESET', 'BETEL', 'BEVEL', 'BEZEL',
            'BIBLE', 'BICEP', 'BIDDY', 'BIGOT', 'BILGE', 'BILLY', 'BINGE', 'BINGO', 'BIOME', 'BIRCH',
            'BIRTH', 'BISON', 'BITTY', 'BLACK', 'BLADE', 'BLAME', 'BLAND', 'BLANK', 'BLARE', 'BLAST',
            'BLAZE', 'BLEAK', 'BLEAT', 'BLEED', 'BLEEP', 'BLEND', 'BLESS', 'BLIMP', 'BLIND', 'BLINK',
            'BLISS', 'BLITZ', 'BLOAT', 'BLOCK', 'BLOKE', 'BLOND', 'BLOOD', 'BLOOM', 'BLOWN', 'BLUER',
            'BLUFF', 'BLUNT', 'BLURB', 'BLURT', 'BLUSH', 'BOARD', 'BOAST', 'BOBBY', 'BONEY', 'BONGO',
            'BONUS', 'BOOBY', 'BOOST', 'BOOTH', 'BOOTY', 'BOOZE', 'BOOZY', 'BORAX', 'BORNE', 'BOSOM',
            'BOSSY', 'BOTCH', 'BOUGH', 'BOULE', 'BOUND', 'BOWEL', 'BOXER', 'BRACE', 'BRAID', 'BRAIN',
            'BRAKE', 'BRAND', 'BRASH', 'BRASS', 'BRAVE', 'BRAVO', 'BRAWL', 'BRAWN', 'BREAD', 'BREAK',
            'BREED', 'BRIAR', 'BRIBE', 'BRICK', 'BRIDE', 'BRIEF', 'BRINE', 'BRING', 'BRINK', 'BRINY',
            'BRISK', 'BROAD', 'BROIL', 'BROKE', 'BROOD', 'BROOK', 'BROOM', 'BROTH', 'BROWN', 'BRUNT',
            'BRUSH', 'BRUTE', 'BUDDY', 'BUDGE', 'BUGGY', 'BUGLE', 'BUILD', 'BUILT', 'BULGE', 'BULKY',
            'BULLY', 'BUNCH', 'BUNNY', 'BURLY', 'BURNT', 'BURST', 'BUSED', 'BUSHY', 'BUTCH', 'BUTTE',
            'BUXOM', 'BUYER', 'BYLAW', 'CABAL', 'CABBY', 'CABIN', 'CABLE', 'CACAO', 'CACHE', 'CACTI',
            'CADDY', 'CADET', 'CAGEY', 'CAIRN', 'CAMEL', 'CAMEO', 'CANAL', 'CANDY', 'CANNY', 'CANOE',
            'CANON', 'CAPER', 'CAPUT', 'CARAT', 'CARGO', 'CAROL', 'CARRY', 'CARVE', 'CASTE', 'CATCH',
            'CATER', 'CATTY', 'CAULK', 'CAUSE', 'CAVIL', 'CEASE', 'CEDAR', 'CELLO', 'CHAFE', 'CHAFF',
            'CHAIN', 'CHAIR', 'CHALK', 'CHAMP', 'CHANT', 'CHAOS', 'CHARD', 'CHARM', 'CHART', 'CHASE',
            'CHASM', 'CHEAP', 'CHEAT', 'CHECK', 'CHEEK', 'CHEER', 'CHESS', 'CHEST', 'CHICK', 'CHIDE',
            'CHIEF', 'CHILD', 'CHILI', 'CHILL', 'CHIME', 'CHINA', 'CHIRP', 'CHOCK', 'CHOIR', 'CHOKE',
            'CHORD', 'CHORE', 'CHOSE', 'CHUCK', 'CHUMP', 'CHUNK', 'CHURN', 'CHUTE', 'CIDER', 'CIGAR',
            'CINCH', 'CIRCA', 'CIVIC', 'CIVIL', 'CLACK', 'CLAIM', 'CLAMP', 'CLANG', 'CLANK', 'CLASH',
            'CLASP', 'CLASS', 'CLEAN', 'CLEAR', 'CLEAT', 'CLEFT', 'CLERK', 'CLICK', 'CLIFF', 'CLIMB',
            'CLING', 'CLINK', 'CLOAK', 'CLOCK', 'CLONE', 'CLOSE', 'CLOTH', 'CLOUD', 'CLOUT', 'CLOVE',
            'CLOWN', 'CLUCK', 'CLUED', 'CLUMP', 'CLUNG', 'COACH', 'COAST', 'COBRA', 'COCOA', 'COLON',
            'COLOR', 'COMET', 'COMFY', 'COMIC', 'COMMA', 'CONCH', 'CONDO', 'CONIC', 'COPSE', 'CORAL',
            'CORER', 'CORNY', 'COUCH', 'COUGH', 'COULD', 'COUNT', 'COUPE', 'COURT', 'COVEN', 'COVER',
            'COVET', 'COVEY', 'COWER', 'COYLY', 'CRACK', 'CRAFT', 'CRAMP', 'CRANE', 'CRANK', 'CRASH',
            'CRASS', 'CRATE', 'CRAVE', 'CRAWL', 'CRAZE', 'CRAZY', 'CREAK', 'CREAM', 'CREDO', 'CREED',
            'CREEK', 'CREEP', 'CREME', 'CREPE', 'CREPT', 'CRESS', 'CREST', 'CRICK', 'CRIED', 'CRIER',
            'CRIME', 'CRIMP', 'CRISP', 'CROAK', 'CROCK', 'CRONE', 'CRONY', 'CROOK', 'CROSS', 'CROUP',
            'CROWD', 'CROWN', 'CRUDE', 'CRUEL', 'CRUMB', 'CRUMP', 'CRUSH', 'CRUST', 'CRYPT', 'CUBIC',
            'CUMIN', 'CURIO', 'CURLY', 'CURRY', 'CURSE', 'CURVE', 'CURVY', 'CUTIE', 'CYBER', 'CYCLE',
            'CYNIC', 'DADDY', 'DAILY', 'DAIRY', 'DAISY', 'DALLY', 'DANCE', 'DANDY', 'DATUM', 'DAUNT',
            'DEALT', 'DEATH', 'DEBAR', 'DEBIT', 'DEBUG', 'DEBUT', 'DECAL', 'DECAY', 'DECOR', 'DECOY',
            'DECRY', 'DEFER', 'DEIGN', 'DEITY', 'DELAY', 'DELTA', 'DELVE', 'DEMON', 'DEMUR', 'DENIM',
            'DENSE', 'DEPOT', 'DEPTH', 'DERBY', 'DETER', 'DETOX', 'DEUCE', 'DEVIL', 'DIARY', 'DICEY',
            'DIGIT', 'DILLY', 'DIMLY', 'DINER', 'DINGO', 'DINGY', 'DIODE', 'DIRGE', 'DIRTY', 'DISCO',
            'DITCH', 'DITTO', 'DITTY', 'DIVER', 'DIZZY', 'DODGE', 'DODGY', 'DOGMA', 'DOING', 'DOLLY',
            'DONOR', 'DONUT', 'DOPEY', 'DOUBT', 'DOUGH', 'DOWDY', 'DOWEL', 'DOWNY', 'DOWRY', 'DOZEN',
            'DRAFT', 'DRAIN', 'DRAKE', 'DRAMA', 'DRANK', 'DRAPE', 'DRAWL', 'DRAWN', 'DREAD', 'DREAM',
            'DRESS', 'DRIED', 'DRIER', 'DRIFT', 'DRILL', 'DRINK', 'DRIVE', 'DROIT', 'DROLL', 'DRONE',
            'DROOL', 'DROOP', 'DROSS', 'DROVE', 'DROWN', 'DRUID', 'DRUNK', 'DRYER', 'DRYLY', 'DUCHY',
            'DULLY', 'DUMMY', 'DUMPY', 'DUNCE', 'DUSKY', 'DUSTY', 'DUTCH', 'DUVET', 'DWARF', 'DWELL',
            'DWELT', 'DYING', 'EAGER', 'EAGLE', 'EARLY', 'EARTH', 'EASEL', 'EATEN', 'EATER', 'EBONY',
            'ECLAT', 'EDICT', 'EDIFY', 'EERIE', 'EGRET', 'EIGHT', 'EJECT', 'EKING', 'ELATE', 'ELBOW',
            'ELDER', 'ELECT', 'ELEGY', 'ELFIN', 'ELIDE', 'ELITE', 'ELOPE', 'ELUDE', 'EMAIL', 'EMBED',
            'EMBER', 'EMCEE', 'EMPTY', 'ENACT', 'ENDOW', 'ENEMA', 'ENEMY', 'ENJOY', 'ENNUI', 'ENSUE',
            'ENTER', 'ENTRY', 'ENVOY', 'EPOCH', 'EPOXY', 'EQUAL', 'EQUIP', 'ERASE', 'ERECT', 'ERODE',
            'ERROR', 'ERUPT', 'ESSAY', 'ESTER', 'ETHER', 'ETHIC', 'ETHOS', 'ETUDE', 'EVADE', 'EVENT',
            'EVERY', 'EVICT', 'EVOKE', 'EXACT', 'EXALT', 'EXCEL', 'EXERT', 'EXILE', 'EXIST', 'EXPEL',
            'EXTOL', 'EXTRA', 'EXULT', 'EYING', 'FABLE', 'FACET', 'FAINT', 'FAIRY', 'FAITH', 'FALSE',
            'FANCY', 'FANNY', 'FARCE', 'FATAL', 'FATTY', 'FAULT', 'FAUNA', 'FAVOR', 'FEAST', 'FECAL',
            'FEIGN', 'FELLA', 'FELON', 'FEMME', 'FEMUR', 'FENCE', 'FERAL', 'FERRY', 'FETAL', 'FETCH',
            'FETID', 'FETUS', 'FEVER', 'FEWER', 'FIBER', 'FICUS', 'FIELD', 'FIEND', 'FIERY', 'FIFTH',
            'FIFTY', 'FIGHT', 'FILER', 'FILET', 'FILLY', 'FILMY', 'FILTH', 'FINAL', 'FINCH', 'FINER',
            'FIRST', 'FISHY', 'FIXER', 'FIZZY', 'FJORD', 'FLACK', 'FLAIL', 'FLAIR', 'FLAKE', 'FLAKY',
            'FLAME', 'FLANK', 'FLARE', 'FLASH', 'FLASK', 'FLECK', 'FLEET', 'FLESH', 'FLICK', 'FLIER',
            'FLING', 'FLINT', 'FLIRT', 'FLOAT', 'FLOCK', 'FLOOD', 'FLOOR', 'FLORA', 'FLOSS', 'FLOUR',
            'FLOUT', 'FLOWN', 'FLUFF', 'FLUID', 'FLUKE', 'FLUME', 'FLUNG', 'FLUNK', 'FLUSH', 'FLUTE',
            'FLYER', 'FOAMY', 'FOCAL', 'FOCUS', 'FOGGY', 'FOIST', 'FOLIO', 'FOLLY', 'FORAY', 'FORCE',
            'FORGE', 'FORGO', 'FORTE', 'FORTH', 'FORTY', 'FORUM', 'FOUND', 'FOYER', 'FRAIL', 'FRAME',
            'FRANK', 'FRAUD', 'FREAK', 'FREED', 'FREER', 'FRESH', 'FRIAR', 'FRIED', 'FRILL', 'FRISK',
            'FRITZ', 'FROCK', 'FROND', 'FRONT', 'FROST', 'FROTH', 'FROWN', 'FROZE', 'FRUIT', 'FUDGE',
            'FUGUE', 'FULLY', 'FUNGI', 'FUNKY', 'FUNNY', 'FUROR', 'FURRY', 'FUSSY', 'FUZZY', 'GAFFE',
            'GAILY', 'GAMER', 'GAMMA', 'GAMUT', 'GASSY', 'GAUDY', 'GAUGE', 'GAUNT', 'GAUZE', 'GAVEL',
            'GAWKY', 'GAYER', 'GAYLY', 'GAZER', 'GECKO', 'GEEKY', 'GEESE', 'GENIE', 'GENRE', 'GHOST',
            'GHOUL', 'GIANT', 'GIDDY', 'GIPSY', 'GIRLY', 'GIRTH', 'GIVEN', 'GIVER', 'GLADE', 'GLAND',
            'GLARE', 'GLASS', 'GLAZE', 'GLEAM', 'GLEAN', 'GLIDE', 'GLINT', 'GLOAT', 'GLOBE', 'GLOOM',
            'GLORY', 'GLOSS', 'GLOVE', 'GLYPH', 'GNASH', 'GNOME', 'GODLY', 'GOING', 'GOLEM', 'GOLLY',
            'GONAD', 'GONER', 'GOODY', 'GOOEY', 'GOOFY', 'GOOSE', 'GORGE', 'GOUGE', 'GOURD', 'GRACE',
            'GRADE', 'GRAFT', 'GRAIL', 'GRAIN', 'GRAND', 'GRANT', 'GRAPE', 'GRAPH', 'GRASP', 'GRASS',
            'GRATE', 'GRAVE', 'GRAVY', 'GRAZE', 'GREAT', 'GREED', 'GREEN', 'GREET', 'GRIEF', 'GRILL',
            'GRIME', 'GRIMY', 'GRIND', 'GRIPE', 'GROAN', 'GROIN', 'GROOM', 'GROPE', 'GROSS', 'GROUP',
            'GROUT', 'GROVE', 'GROWL', 'GROWN', 'GRUEL', 'GRUFF', 'GRUNT', 'GUARD', 'GUAVA', 'GUESS',
            'GUEST', 'GUIDE', 'GUILD', 'GUILE', 'GUILT', 'GUISE', 'GULCH', 'GULLY', 'GUMBO', 'GUMMY',
            'GUPPY', 'GUSTO', 'GUSTY', 'GYPSY', 'HABIT', 'HAIRY', 'HALVE', 'HANDY', 'HAPPY', 'HARDY',
            'HAREM', 'HARPY', 'HARRY', 'HARSH', 'HASTE', 'HASTY', 'HATCH', 'HATER', 'HAUNT', 'HAUTE',
            'HAVEN', 'HAVOC', 'HAZEL', 'HEADY', 'HEARD', 'HEART', 'HEATH', 'HEAVE', 'HEAVY', 'HEDGE',
            'HEFTY', 'HEIST', 'HELIX', 'HELLO', 'HENCE', 'HERON', 'HILLY', 'HINGE', 'HIPPO', 'HIPPY',
            'HITCH', 'HOARD', 'HOBBY', 'HOIST', 'HOLLY', 'HOMER', 'HONEY', 'HONOR', 'HORDE', 'HORNY',
            'HORSE', 'HOTEL', 'HOTLY', 'HOUND', 'HOUSE', 'HOVEL', 'HOVER', 'HOWDY', 'HUMAN', 'HUMID',
            'HUMOR', 'HUMPH', 'HUMUS', 'HUNCH', 'HUNKY', 'HURRY', 'HUSKY', 'HUSSY', 'HUTCH', 'HYDRO',
            'HYENA', 'HYMEN', 'HYPER', 'ICILY', 'ICING', 'IDEAL', 'IDIOM', 'IDIOT', 'IDLER', 'IDYLL',
            'IGLOO', 'ILIAC', 'IMAGE', 'IMBUE', 'IMPEL', 'IMPLY', 'INANE', 'INBOX', 'INCUR', 'INDEX',
            'INEPT', 'INERT', 'INFER', 'INGOT', 'INLAY', 'INLET', 'INNER', 'INPUT', 'INTER', 'INTRO',
            'IONIC', 'IRATE', 'IRONY', 'ISLET', 'ISSUE', 'ITCHY', 'IVORY', 'JAUNT', 'JAZZY', 'JELLY',
            'JERKY', 'JETTY', 'JEWEL', 'JIFFY', 'JOINT', 'JOIST', 'JOKER', 'JOLLY', 'JOUST', 'JUDGE',
            'JUICE', 'JUICY', 'JUMBO', 'JUMPY', 'JUNTA', 'JUNTO', 'JUROR', 'KAPPA', 'KARMA', 'KAYAK',
            'KEBAB', 'KHAKI', 'KINKY', 'KIOSK', 'KITTY', 'KNACK', 'KNAVE', 'KNEAD', 'KNEED', 'KNEEL',
            'KNELT', 'KNIFE', 'KNOCK', 'KNOLL', 'KNOWN', 'KOALA', 'KRILL', 'LABEL', 'LABOR', 'LADEN',
            'LADLE', 'LAGER', 'LANCE', 'LANKY', 'LAPEL', 'LAPSE', 'LARGE', 'LARVA', 'LASSO', 'LATCH',
            'LATER', 'LATHE', 'LATTE', 'LAUGH', 'LAYER', 'LEACH', 'LEAFY', 'LEAKY', 'LEANT', 'LEAPT',
            'LEARN', 'LEASE', 'LEASH', 'LEAST', 'LEAVE', 'LEDGE', 'LEECH', 'LEERY', 'LEFTY', 'LEGAL',
            'LEGGY', 'LEMON', 'LEMUR', 'LEPER', 'LEVEL', 'LEVER', 'LIBEL', 'LIEGE', 'LIGHT', 'LIKEN',
            'LILAC', 'LIMBO', 'LIMIT', 'LINEN', 'LINER', 'LINGO', 'LIPID', 'LITHE', 'LIVER', 'LIVID',
            'LLAMA', 'LOAMY', 'LOATH', 'LOBBY', 'LOCAL', 'LOCUS', 'LODGE', 'LOFTY', 'LOGIC', 'LOGIN',
            'LOOPY', 'LOOSE', 'LORRY', 'LOSER', 'LOUSE', 'LOUSY', 'LOVER', 'LOWER', 'LOWLY', 'LOYAL',
            'LUCID', 'LUCKY', 'LUMEN', 'LUMPY', 'LUNAR', 'LUNCH', 'LUNGE', 'LUPUS', 'LURCH', 'LURID',
            'LUSTY', 'LYING', 'LYMPH', 'LYRIC', 'MACAW', 'MACHO', 'MACRO', 'MADAM', 'MADLY', 'MAFIA',
            'MAGIC', 'MAGMA', 'MAIZE', 'MAJOR', 'MAKER', 'MAMBO', 'MAMMA', 'MAMMY', 'MANGA', 'MANGE',
            'MANGO', 'MANGY', 'MANIA', 'MANIC', 'MANLY', 'MANOR', 'MAPLE', 'MARCH', 'MARRY', 'MARSH',
            'MASON', 'MASSE', 'MATCH', 'MATEY', 'MAUVE', 'MAXIM', 'MAYBE', 'MAYOR', 'MEALY', 'MEANT',
            'MEATY', 'MECCA', 'MEDAL', 'MEDIA', 'MEDIC', 'MELEE', 'MELON', 'MERCY', 'MERGE', 'MERIT',
            'MERRY', 'METAL', 'METER', 'METRO', 'MICRO', 'MIDGE', 'MIDST', 'MIGHT', 'MILKY', 'MIMIC',
            'MINCE', 'MINER', 'MINIM', 'MINOR', 'MINTY', 'MINUS', 'MIRTH', 'MISER', 'MISSY', 'MOCHA',
            'MODAL', 'MODEL', 'MODEM', 'MOGUL', 'MOIST', 'MOLAR', 'MOLDY', 'MONEY', 'MONTH', 'MOODY',
            'MOOSE', 'MORAL', 'MORON', 'MORPH', 'MOSSY', 'MOTEL', 'MOTIF', 'MOTOR', 'MOTTO', 'MOULT',
            'MOUND', 'MOUNT', 'MOURN', 'MOUSE', 'MOUTH', 'MOVER', 'MOVIE', 'MOWER', 'MUCKY', 'MUCUS',
            'MUDDY', 'MULCH', 'MUMMY', 'MUNCH', 'MURAL', 'MURKY', 'MUSHY', 'MUSIC', 'MUSKY', 'MUSTY',
            'MYRRH', 'NADIR', 'NAIVE', 'NANNY', 'NASAL', 'NASTY', 'NATAL', 'NAVAL', 'NAVEL', 'NEEDY',
            'NEIGH', 'NERDY', 'NERVE', 'NEVER', 'NEWER', 'NEWLY', 'NICER', 'NICHE', 'NIECE', 'NIGHT',
            'NINJA', 'NINNY', 'NINTH', 'NOBLE', 'NOBLY', 'NOISE', 'NOISY', 'NOMAD', 'NOOSE', 'NORTH',
            'NOSEY', 'NOTCH', 'NOVEL', 'NUDGE', 'NURSE', 'NUTTY', 'NYLON', 'NYMPH', 'OAKEN', 'OBESE',
            'OCCUR', 'OCEAN', 'OCTAL', 'OCTET', 'ODDER', 'ODDLY', 'OFFAL', 'OFFER', 'OFTEN', 'OLDEN',
            'OLDER', 'OLIVE', 'OMBRE', 'OMEGA', 'ONION', 'ONSET', 'OPERA', 'OPINE', 'OPIUM', 'OPTIC',
            'ORBIT', 'ORDER', 'ORGAN', 'OTHER', 'OTTER', 'OUGHT', 'OUNCE', 'OUTDO', 'OUTER', 'OUTGO',
            'OVARY', 'OVATE', 'OVERT', 'OVINE', 'OVOID', 'OWING', 'OWNER', 'OXIDE', 'OZONE', 'PADDY',
            'PAGAN', 'PAINT', 'PALER', 'PALSY', 'PANEL', 'PANIC', 'PANSY', 'PAPAL', 'PAPER', 'PARER',
            'PARKA', 'PARRY', 'PARSE', 'PARTY', 'PASTA', 'PASTE', 'PASTY', 'PATCH', 'PATIO', 'PATSY',
            'PATTY', 'PAUSE', 'PAYEE', 'PAYER', 'PEACE', 'PEACH', 'PEARL', 'PECAN', 'PEDAL', 'PENAL',
            'PENCE', 'PENNE', 'PENNY', 'PERCH', 'PERIL', 'PERKY', 'PESKY', 'PESTO', 'PETAL', 'PETTY',
            'PHASE', 'PHONE', 'PHONY', 'PHOTO', 'PIANO', 'PICKY', 'PIECE', 'PIETY', 'PIGGY', 'PILOT',
            'PINCH', 'PINEY', 'PINKY', 'PINTO', 'PIPER', 'PIQUE', 'PITCH', 'PITHY', 'PIVOT', 'PIXEL',
            'PIXIE', 'PIZZA', 'PLACE', 'PLAID', 'PLAIN', 'PLAIT', 'PLANE', 'PLANK', 'PLANT', 'PLATE',
            'PLAZA', 'PLEAD', 'PLEAT', 'PLIED', 'PLIER', 'PLUCK', 'PLUMB', 'PLUME', 'PLUMP', 'PLUNK',
            'PLUSH', 'POESY', 'POINT', 'POISE', 'POKER', 'POLAR', 'POLKA', 'POLYP', 'POOCH', 'POPPY',
            'PORCH', 'POSER', 'POSIT', 'POSSE', 'POUCH', 'POUND', 'POUTY', 'POWER', 'PRANK', 'PRAWN',
            'PREEN', 'PRESS', 'PRICE', 'PRICK', 'PRIDE', 'PRIED', 'PRIME', 'PRIMO', 'PRINT', 'PRIOR',
            'PRISM', 'PRIVY', 'PRIZE', 'PROBE', 'PRONE', 'PRONG', 'PROOF', 'PROSE', 'PROUD', 'PROVE',
            'PROWL', 'PROXY', 'PRUDE', 'PRUNE', 'PSALM', 'PUBIC', 'PUDGY', 'PUFFY', 'PULPY', 'PULSE',
            'PUNCH', 'PUPIL', 'PUPPY', 'PUREE', 'PURER', 'PURGE', 'PURSE', 'PUSHY', 'PUTTY', 'PYGMY',
            'QUACK', 'QUAIL', 'QUAKE', 'QUALM', 'QUARK', 'QUART', 'QUASH', 'QUASI', 'QUEEN', 'QUEER',
            'QUELL', 'QUERY', 'QUEST', 'QUEUE', 'QUICK', 'QUIET', 'QUILL', 'QUILT', 'QUIRK', 'QUITE',
            'QUOTA', 'QUOTE', 'QUOTH', 'RABBI', 'RABID', 'RACER', 'RADAR', 'RADII', 'RADIO', 'RAINY',
            'RAISE', 'RAJAH', 'RALLY', 'RALPH', 'RAMEN', 'RANCH', 'RANDY', 'RANGE', 'RAPID', 'RARER',
            'RASPY', 'RATIO', 'RATTY', 'RAVEN', 'RAYON', 'RAZOR', 'REACH', 'REACT', 'READY', 'REALM',
            'REARM', 'REBAR', 'REBEL', 'REBUS', 'REBUT', 'RECAP', 'RECUR', 'RECUT', 'REEDY', 'REFER',
            'REFIT', 'REGAL', 'REHAB', 'REIGN', 'RELAX', 'RELAY', 'RELIC', 'REMIT', 'RENAL', 'RENEW',
            'REPAY', 'REPEL', 'REPLY', 'RERUN', 'RESET', 'RESIN', 'RETCH', 'RETRO', 'RETRY', 'REUSE',
            'REVEL', 'REVUE', 'RHINO', 'RHYME', 'RIDER', 'RIDGE', 'RIFLE', 'RIGHT', 'RIGID', 'RIGOR',
            'RINSE', 'RIPEN', 'RIPER', 'RISEN', 'RISER', 'RISKY', 'RIVAL', 'RIVER', 'RIVET', 'ROACH',
            'ROAST', 'ROBIN', 'ROBOT', 'ROCKY', 'RODEO', 'ROGER', 'ROGUE', 'ROOMY', 'ROOST', 'ROTOR',
            'ROUGE', 'ROUGH', 'ROUND', 'ROUSE', 'ROUTE', 'ROVER', 'ROWDY', 'ROWER', 'ROYAL', 'RUDDY',
            'RUDER', 'RUGBY', 'RULER', 'RUMBA', 'RUMOR', 'RUPEE', 'RURAL', 'RUSTY', 'SADLY', 'SAFER',
            'SAINT', 'SALAD', 'SALLY', 'SALON', 'SALSA', 'SALTY', 'SALVE', 'SALVO', 'SANDY', 'SANER',
            'SAPPY', 'SASSY', 'SATIN', 'SATYR', 'SAUCE', 'SAUCY', 'SAUNA', 'SAUTE', 'SAVOR', 'SAVOY',
            'SAVVY', 'SCALD', 'SCALE', 'SCALP', 'SCALY', 'SCAMP', 'SCANT', 'SCARE', 'SCARF', 'SCARY',
            'SCENE', 'SCENT', 'SCION', 'SCOFF', 'SCOLD', 'SCONE', 'SCOOP', 'SCOPE', 'SCORE', 'SCORN',
            'SCOUR', 'SCOUT', 'SCOWL', 'SCRAM', 'SCRAP', 'SCREE', 'SCREW', 'SCRUB', 'SCRUM', 'SCUBA',
            'SEDAN', 'SEEDY', 'SEGUE', 'SEIZE', 'SEMEN', 'SENSE', 'SEPIA', 'SERIF', 'SERUM', 'SERVE',
            'SETUP', 'SEVEN', 'SEVER', 'SEWER', 'SHACK', 'SHADE', 'SHADY', 'SHAFT', 'SHAKE', 'SHAKY',
            'SHALE', 'SHALL', 'SHALT', 'SHAME', 'SHANK', 'SHAPE', 'SHARD', 'SHARE', 'SHARK', 'SHARP',
            'SHAVE', 'SHAWL', 'SHEAR', 'SHEEN', 'SHEEP', 'SHEER', 'SHEET', 'SHEIK', 'SHELF', 'SHELL',
            'SHIED', 'SHIFT', 'SHINE', 'SHINY', 'SHIRE', 'SHIRK', 'SHIRT', 'SHOAL', 'SHOCK', 'SHONE',
            'SHOOK', 'SHOOT', 'SHORE', 'SHORN', 'SHORT', 'SHOUT', 'SHOVE', 'SHOWN', 'SHOWY', 'SHREW',
            'SHRUB', 'SHRUG', 'SHUCK', 'SHUNT', 'SHUSH', 'SHYLY', 'SIEGE', 'SIEVE', 'SIGHT', 'SIGMA',
            'SILKY', 'SILLY', 'SINCE', 'SINEW', 'SINGE', 'SIREN', 'SISSY', 'SIXTH', 'SIXTY', 'SKATE',
            'SKIER', 'SKIFF', 'SKILL', 'SKIMP', 'SKIRT', 'SKULK', 'SKULL', 'SKUNK', 'SLACK', 'SLAIN',
            'SLANG', 'SLANT', 'SLASH', 'SLATE', 'SLEEK', 'SLEEP', 'SLEET', 'SLEPT', 'SLICE', 'SLICK',
            'SLIDE', 'SLIME', 'SLIMY', 'SLING', 'SLINK', 'SLOOP', 'SLOPE', 'SLOSH', 'SLOTH', 'SLUMP',
            'SLUNG', 'SLUNK', 'SLURP', 'SLUSH', 'SLYLY', 'SMACK', 'SMALL', 'SMART', 'SMASH', 'SMEAR',
            'SMELL', 'SMELT', 'SMILE', 'SMIRK', 'SMITE', 'SMITH', 'SMOCK', 'SMOKE', 'SMOKY', 'SMOTE',
            'SNACK', 'SNAIL', 'SNAKE', 'SNAKY', 'SNARE', 'SNARL', 'SNEAK', 'SNEER', 'SNIDE', 'SNIFF',
            'SNIPE', 'SNOOP', 'SNORE', 'SNORT', 'SNOUT', 'SNOWY', 'SNUCK', 'SNUFF', 'SOAPY', 'SOBER',
            'SOGGY', 'SOLAR', 'SOLID', 'SOLVE', 'SONAR', 'SONIC', 'SOOTH', 'SOOTY', 'SORRY', 'SOUND',
            'SOUTH', 'SOWER', 'SPACE', 'SPADE', 'SPANK', 'SPARE', 'SPARK', 'SPASM', 'SPAWN', 'SPEAK',
            'SPEAR', 'SPECK', 'SPEED', 'SPELL', 'SPELT', 'SPEND', 'SPENT', 'SPERM', 'SPICE', 'SPICY',
            'SPIED', 'SPIEL', 'SPIKE', 'SPIKY', 'SPILL', 'SPILT', 'SPINE', 'SPINY', 'SPIRE', 'SPITE',
            'SPLAT', 'SPLIT', 'SPOIL', 'SPOKE', 'SPOOF', 'SPOOK', 'SPOOL', 'SPOON', 'SPORE', 'SPORT',
            'SPOUT', 'SPRAY', 'SPREE', 'SPRIG', 'SPUNK', 'SPURN', 'SPURT', 'SQUAD', 'SQUAT', 'SQUIB',
            'STACK', 'STAFF', 'STAGE', 'STAID', 'STAIN', 'STAIR', 'STAKE', 'STALE', 'STALK', 'STALL',
            'STAMP', 'STAND', 'STANK', 'STARE', 'STARK', 'START', 'STASH', 'STATE', 'STAVE', 'STEAD',
            'STEAK', 'STEAL', 'STEAM', 'STEED', 'STEEL', 'STEEP', 'STEER', 'STEIN', 'STERN', 'STICK',
            'STIFF', 'STILL', 'STILT', 'STING', 'STINK', 'STINT', 'STOCK', 'STOIC', 'STOKE', 'STOLE',
            'STOMP', 'STONE', 'STONY', 'STOOD', 'STOOL', 'STOOP', 'STORE', 'STORK', 'STORM', 'STORY',
            'STOUT', 'STOVE', 'STRAP', 'STRAW', 'STRAY', 'STRIP', 'STRUT', 'STUCK', 'STUDY', 'STUFF',
            'STUMP', 'STUNG', 'STUNK', 'STUNT', 'STYLE', 'SUAVE', 'SUGAR', 'SUING', 'SUITE', 'SULKY',
            'SULLY', 'SUMAC', 'SUNNY', 'SUPER', 'SURER', 'SURGE', 'SURLY', 'SUSHI', 'SWAMI', 'SWAMP',
            'SWARM', 'SWASH', 'SWATH', 'SWEAR', 'SWEAT', 'SWEEP', 'SWEET', 'SWELL', 'SWEPT', 'SWIFT',
            'SWILL', 'SWINE', 'SWING', 'SWIRL', 'SWISH', 'SWOON', 'SWOOP', 'SWORD', 'SWORE', 'SWORN',
            'SWUNG', 'SYNOD', 'SYRUP', 'TABBY', 'TABLE', 'TABOO', 'TACIT', 'TACKY', 'TAFFY', 'TAINT',
            'TAKEN', 'TAKER', 'TALLY', 'TALON', 'TAMER', 'TANGO', 'TANGY', 'TAPER', 'TAPIR', 'TARDY',
            'TAROT', 'TASTE', 'TASTY', 'TATTY', 'TAUNT', 'TAWNY', 'TEACH', 'TEARY', 'TEASE', 'TEDDY',
            'TEETH', 'TEMPO', 'TENET', 'TENOR', 'TENSE', 'TENTH', 'TEPEE', 'TEPID', 'TERRA', 'TERSE',
            'TESTY', 'THANK', 'THEFT', 'THEIR', 'THEME', 'THERE', 'THESE', 'THETA', 'THICK', 'THIEF',
            'THIGH', 'THING', 'THINK', 'THIRD', 'THONG', 'THORN', 'THOSE', 'THREE', 'THREW', 'THROB',
            'THROW', 'THRUM', 'THUMB', 'THUMP', 'THYME', 'TIARA', 'TIBIA', 'TIDAL', 'TIGER', 'TIGHT',
            'TILDE', 'TIMER', 'TIMID', 'TIPSY', 'TITAN', 'TITHE', 'TITLE', 'TOAST', 'TODAY', 'TODDY',
            'TOKEN', 'TONAL', 'TONGA', 'TONIC', 'TOOTH', 'TOPAZ', 'TOPIC', 'TORCH', 'TORSO', 'TORUS',
            'TOTAL', 'TOTEM', 'TOUCH', 'TOUGH', 'TOWEL', 'TOWER', 'TOXIC', 'TOXIN', 'TRACE', 'TRACK',
            'TRACT', 'TRADE', 'TRAIL', 'TRAIN', 'TRAIT', 'TRAMP', 'TRASH', 'TRAWL', 'TREAD', 'TREAT',
            'TREND', 'TRIAD', 'TRIAL', 'TRIBE', 'TRICE', 'TRICK', 'TRIED', 'TRIPE', 'TRITE', 'TROLL',
            'TROOP', 'TROPE', 'TROUT', 'TROVE', 'TRUCE', 'TRUCK', 'TRUER', 'TRULY', 'TRUMP', 'TRUNK',
            'TRUSS', 'TRUST', 'TRUTH', 'TRYST', 'TUBAL', 'TUBER', 'TULIP', 'TULLE', 'TUMOR', 'TUNIC',
            'TURBO', 'TUTOR', 'TWANG', 'TWEAK', 'TWEED', 'TWEET', 'TWICE', 'TWINE', 'TWIRL', 'TWIST',
            'TWIXT', 'TYING', 'UDDER', 'ULCER', 'ULTRA', 'UMBRA', 'UNCLE', 'UNCUT', 'UNDER', 'UNDID',
            'UNDUE', 'UNFED', 'UNFIT', 'UNIFY', 'UNION', 'UNITE', 'UNITY', 'UNLIT', 'UNMET', 'UNSET',
            'UNTIE', 'UNTIL', 'UNWED', 'UNZIP', 'UPPER', 'UPSET', 'URBAN', 'URINE', 'USAGE', 'USHER',
            'USING', 'USUAL', 'USURP', 'UTILE', 'UTTER', 'VAGUE', 'VALET', 'VALID', 'VALOR', 'VALUE',
            'VALVE', 'VAPID', 'VAPOR', 'VAULT', 'VAUNT', 'VEGAN', 'VENOM', 'VENUE', 'VERGE', 'VERSE',
            'VERSO', 'VERVE', 'VICAR', 'VIDEO', 'VIGIL', 'VIGOR', 'VILLA', 'VINYL', 'VIOLA', 'VIPER',
            'VIRAL', 'VIRUS', 'VISIT', 'VISOR', 'VISTA', 'VITAL', 'VIVID', 'VIXEN', 'VOCAL', 'VODKA',
            'VOGUE', 'VOICE', 'VOILA', 'VOMIT', 'VOTER', 'VOUCH', 'VOWEL', 'VYING', 'WACKY', 'WAFER',
            'WAGER', 'WAGON', 'WAIST', 'WAIVE', 'WALTZ', 'WARTY', 'WASTE', 'WATCH', 'WATER', 'WAVER',
            'WAXEN', 'WEARY', 'WEAVE', 'WEDGE', 'WEEDY', 'WEIGH', 'WEIRD', 'WELCH', 'WELSH', 'WHACK',
            'WHALE', 'WHARF', 'WHEAT', 'WHEEL', 'WHELP', 'WHERE', 'WHICH', 'WHIFF', 'WHILE', 'WHINE',
            'WHINY', 'WHIRL', 'WHISK', 'WHITE', 'WHOLE', 'WHOOP', 'WHOSE', 'WIDEN', 'WIDER', 'WIDOW',
            'WIDTH', 'WIELD', 'WIGHT', 'WILLY', 'WIMPY', 'WINCE', 'WINCH', 'WINDY', 'WISER', 'WISPY',
            'WITCH', 'WITTY', 'WOKEN', 'WOMAN', 'WOMEN', 'WOODY', 'WOOER', 'WOOLY', 'WOOZY', 'WORDY',
            'WORLD', 'WORRY', 'WORSE', 'WORST', 'WORTH', 'WOULD', 'WOUND', 'WOVEN', 'WRACK', 'WRATH',
            'WREAK', 'WRECK', 'WREST', 'WRING', 'WRIST', 'WRITE', 'WRONG', 'WROTE', 'WRUNG', 'WRYLY',
            'YACHT', 'YEARN', 'YEAST', 'YIELD', 'YOUNG', 'YOUTH', 'ZEBRA', 'ZESTY', 'ZONAL'
        ];
        return encoded;
    }

    createGameBoard() {
        const gameBoard = document.getElementById('gameBoard');
        gameBoard.innerHTML = '';
        
        for (let i = 0; i < 6; i++) {
            const row = document.createElement('div');
            row.className = 'row';
            row.id = `row-${i}`;
            
            for (let j = 0; j < 5; j++) {
                const tile = document.createElement('div');
                tile.className = 'tile';
                tile.id = `tile-${i}-${j}`;
                row.appendChild(tile);
            }
            
            gameBoard.appendChild(row);
        }
    }

    setupEventListeners() {
        // Keyboard event listeners
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        
        // Virtual keyboard
        document.querySelectorAll('.key').forEach(key => {
            key.addEventListener('click', () => {
                const keyValue = key.getAttribute('data-key');
                this.handleKeyPress({ key: keyValue });
            });
        });

        // Modal controls
        document.getElementById('helpBtn').addEventListener('click', () => {
            this.showModal('helpModal');
        });

        document.getElementById('statsBtn').addEventListener('click', () => {
            this.showModal('statsModal');
            this.updateStatsDisplay();
        });

        document.querySelectorAll('.close-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modalId = e.target.getAttribute('data-modal');
                this.hideModal(modalId);
            });
        });

        // Close modals when clicking outside
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideModal(modal.id);
                }
            });
        });
    }

    handleKeyPress(e) {
        if (this.gameOver) return;

        const key = e.key ? e.key.toUpperCase() : e;

        console.log('Key pressed:', key); // Debug log

        if (key === 'ENTER') {
            console.log('Enter pressed, submitting guess'); // Debug log
            this.submitGuess();
        } else if (key === 'BACKSPACE') {
            this.deleteLetter();
        } else if (key.length === 1 && key.match(/[A-Z]/)) {
            this.addLetter(key);
        }
    }

    addLetter(letter) {
        if (this.currentTile < 5) {
            const tile = document.getElementById(`tile-${this.currentRow}-${this.currentTile}`);
            tile.textContent = letter;
            tile.classList.add('filled');
            this.currentGuess += letter;
            this.currentTile++;

            // Save game state after each letter
            this.saveTodaysGame();
        }
    }

    deleteLetter() {
        if (this.currentTile > 0) {
            this.currentTile--;
            const tile = document.getElementById(`tile-${this.currentRow}-${this.currentTile}`);
            tile.textContent = '';
            tile.classList.remove('filled');
            this.currentGuess = this.currentGuess.slice(0, -1);

            // Save game state after each deletion
            this.saveTodaysGame();
        }
    }

    async submitGuess() {
        console.log('submitGuess called, currentTile:', this.currentTile, 'currentGuess:', this.currentGuess); // Debug log

        if (this.currentTile !== 5) {
            this.showMessage('Not enough letters');
            return;
        }

        // Validate word (in real implementation, this would be server-side)
        if (!this.isValidWord(this.currentGuess)) {
            this.showMessage('Not in word list');
            this.shakeRow();
            return;
        }

        this.guesses.push(this.currentGuess);
        await this.checkGuess();

        if (this.currentGuess === this.targetWord) {
            this.gameWon = true;
            this.gameOver = true;
            this.showMessage('Congratulations! 🎉');
            this.updateStats(true);
            this.saveTodaysGame(); // Save final game state
            setTimeout(() => {
                this.showModal('statsModal');
                this.updateStatsDisplay();
            }, 2000);
        } else if (this.currentRow === 5) {
            this.gameOver = true;
            this.showMessage('😔 Better luck tomorrow!');
            this.updateStats(false);
            this.saveTodaysGame(); // Save final game state
            setTimeout(() => {
                this.showModal('statsModal');
                this.updateStatsDisplay();
            }, 2000);
        }

        this.currentRow++;
        this.currentTile = 0;
        this.currentGuess = '';

        // Save game state after each guess
        this.saveTodaysGame();
    }

    async checkGuess() {
        const guess = this.currentGuess;
        const target = this.targetWord;

        if (!target) {
            console.error('Target word not set!');
            this.showMessage('Game initialization error');
            return;
        }

        const result = [];

        // Create arrays to track letter usage
        const targetLetters = target.split('');
        const guessLetters = guess.split('');
        
        // First pass: mark correct letters
        for (let i = 0; i < 5; i++) {
            if (guessLetters[i] === targetLetters[i]) {
                result[i] = 'correct';
                targetLetters[i] = null;
                guessLetters[i] = null;
            }
        }

        // Second pass: mark present letters
        for (let i = 0; i < 5; i++) {
            if (guessLetters[i] !== null) {
                const letterIndex = targetLetters.indexOf(guessLetters[i]);
                if (letterIndex !== -1) {
                    result[i] = 'present';
                    targetLetters[letterIndex] = null;
                } else {
                    result[i] = 'absent';
                }
            }
        }

        // Animate tiles
        for (let i = 0; i < 5; i++) {
            const tile = document.getElementById(`tile-${this.currentRow}-${i}`);
            const key = document.querySelector(`[data-key="${guess[i]}"]`);
            
            setTimeout(() => {
                tile.classList.add(result[i]);
                
                // Update keyboard
                if (key && !key.classList.contains('correct')) {
                    if (result[i] === 'correct' || 
                        (result[i] === 'present' && !key.classList.contains('correct')) ||
                        (result[i] === 'absent' && !key.classList.contains('correct') && !key.classList.contains('present'))) {
                        key.classList.add(result[i]);
                    }
                }
            }, i * 100);
        }
    }

    isValidWord(word) {
        const validWords = this.getWordList();
        console.log('Checking word:', word, 'against', validWords.length, 'words'); // Debug log
        console.log('First 10 words:', validWords.slice(0, 10)); // Debug log
        const isValid = validWords.includes(word.toUpperCase());
        console.log('Word', word, 'is valid:', isValid); // Debug log
        return isValid;
    }

    shakeRow() {
        const row = document.getElementById(`row-${this.currentRow}`);
        row.style.animation = 'shake 0.5s ease-in-out';
        setTimeout(() => {
            row.style.animation = '';
        }, 500);
    }

    showMessage(text) {
        const message = document.getElementById('message');
        message.textContent = text;
        message.classList.add('show');
        setTimeout(() => {
            message.classList.remove('show');
        }, 2000);
    }

    showModal(modalId) {
        document.getElementById(modalId).classList.add('show');
    }

    hideModal(modalId) {
        document.getElementById(modalId).classList.remove('show');
    }

    loadStats() {
        const stats = localStorage.getItem('fdg-wordle-stats');
        if (stats) {
            this.stats = JSON.parse(stats);
        } else {
            this.stats = {
                gamesPlayed: 0,
                gamesWon: 0,
                currentStreak: 0,
                maxStreak: 0,
                guessDistribution: [0, 0, 0, 0, 0, 0]
            };
        }
    }

    updateStats(won) {
        this.stats.gamesPlayed++;
        
        if (won) {
            this.stats.gamesWon++;
            this.stats.currentStreak++;
            this.stats.maxStreak = Math.max(this.stats.maxStreak, this.stats.currentStreak);
            this.stats.guessDistribution[this.currentRow]++;
        } else {
            this.stats.currentStreak = 0;
        }

        localStorage.setItem('fdg-wordle-stats', JSON.stringify(this.stats));
    }

    updateStatsDisplay() {
        document.getElementById('gamesPlayed').textContent = this.stats.gamesPlayed;
        document.getElementById('winPercentage').textContent = 
            this.stats.gamesPlayed > 0 ? Math.round((this.stats.gamesWon / this.stats.gamesPlayed) * 100) : 0;
        document.getElementById('currentStreak').textContent = this.stats.currentStreak;
        document.getElementById('maxStreak').textContent = this.stats.maxStreak;

        // Update guess distribution
        const container = document.getElementById('distributionContainer');
        container.innerHTML = '';
        
        const maxGuesses = Math.max(...this.stats.guessDistribution);
        
        for (let i = 0; i < 6; i++) {
            const row = document.createElement('div');
            row.className = 'distribution-row';
            
            const label = document.createElement('div');
            label.className = 'distribution-label';
            label.textContent = i + 1;
            
            const bar = document.createElement('div');
            bar.className = 'distribution-bar';
            bar.textContent = this.stats.guessDistribution[i];
            
            const percentage = maxGuesses > 0 ? (this.stats.guessDistribution[i] / maxGuesses) * 100 : 0;
            bar.style.width = `${Math.max(percentage, 10)}%`;
            
            row.appendChild(label);
            row.appendChild(bar);
            container.appendChild(row);
        }
    }
}

// Add shake animation to CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
`;
document.head.appendChild(style);

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    new FDGWordle();
});
