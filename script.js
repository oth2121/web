// --- DOM Element References ---
// Game Elements
const playerNameInput = document.getElementById('playerName');
const savePlayerNameBtn = document.getElementById('savePlayerNameBtn');
const currentPlayerNameDisplay = document.getElementById('currentPlayerName');
const playerNameInputContainer = document.getElementById('playerNameInputContainer');
const gameNotification = document.getElementById('gameNotification');
const trickOrTreatBtn = document.getElementById('trickOrTreatBtn');
const outcomeDisplay = document.getElementById('outcomeDisplay');
const resultMessageDiv = document.getElementById('resultMessage');
const resultText = document.getElementById('resultText');
const trickCountDisplay = document.getElementById('trickCount');
const treatCountDisplay = document.getElementById('treatCount');

// Audio Elements
const bellSound = document.getElementById('bellSound');
const treatSound = document.getElementById('treatSound');
const trickSound = document.getElementById('trickSound');
const clickSound = document.getElementById('clickSound');
const toggleSound = document.getElementById('toggleSound');

// Volume Control Elements
const sfxVolumeSlider = document.getElementById('sfxVolumeSlider');
const sfxVolumeIcon = document.getElementById('sfxVolumeIcon');
const musicVolumeSlider = document.getElementById('musicVolumeSlider');
const musicVolumeIcon = document.getElementById('musicVolumeIcon');

// Share Buttons
const shareXBtn = document.getElementById('shareXBtn');
const shareTelegramBtn = document.getElementById('shareTelegramBtn');

// Live Price Display Elements - Renamed for Solana
const solPriceDisplay = document.getElementById('solPriceDisplay'); // Changed from bnbPriceDisplay

// Theme Toggle
const themeToggleBtn = document.getElementById('themeToggle');

// Wallet Elements
const connectWalletBtn = document.getElementById('connectWalletBtn');
const walletAddressDisplay = document.getElementById('walletAddressDisplay');

// --- Game State Variables ---
let playerName = localStorage.getItem('playerName') || '';
let trickCount = parseInt(localStorage.getItem('trickCount') || '0', 10);
let treatCount = parseInt(localStorage.getItem('treatCount') || '0', 10);
let currentOutcome = ''; // Stores "trick" or "treat" for sharing
let lastOutcomeMessage = '';

// --- Volume Control Variables ---
let sfxVolume = parseFloat(localStorage.getItem('sfxVolume')) || 0.3;
let musicVolume = parseFloat(localStorage.getItem('musicVolume')) || 0.1;
let musicPlayedOnce = false; // Flag to track if music has started due to user interaction

// --- YouTube Player Variables ---
let youtubePlayer;
// 🎃👻 Halloween Ambient Music YouTube Video ID 👻🎃

// --- Utility Functions ---

// GA4 Event Helper Function (Placeholder - replace G-XXXXXXXXXX in HTML with actual ID)
function sendGAEvent(eventName, eventParams = {}) {
    if (typeof gtag === 'function') {
        gtag('event', eventName, eventParams);
        console.log(`GA Event: ${eventName}`, eventParams); // For debugging
    } else {
        console.warn("gtag function not found. Google Analytics may not be initialized or script blocked.");
    }
}

function playSound(audioElement, volume) {
    if (audioElement && volume > 0) {
        audioElement.volume = volume;
        audioElement.currentTime = 0;
        audioElement.play().catch(e => console.warn(`Audio playback failed for ${audioElement.id}:`, e.message));
    }
}

function getRandomElement(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function showGameNotification(message, type = 'info', duration = 3000) {
    if (!gameNotification) return;

    gameNotification.textContent = message;
    gameNotification.className = `game-notification ${type}`;
    gameNotification.style.display = 'block';
    setTimeout(() => {
        gameNotification.style.display = 'none';
    }, duration);
}

// Particle Animations
function createCandyParticle(originX, originY) {
    const particle = document.createElement('div');
    particle.className = 'coin-particle'; // 'coin-particle' is repurposed for candy in CSS
    document.body.appendChild(particle);

    // Random offsets for particle trajectory
    const randomOffsetX = (Math.random() - 0.5) * 150; // -75px to +75px horizontal
    const randomOffsetY = (Math.random() - 1.5) * 100; // -150px to -50px vertical (upwards)
    const randomRotation = Math.random() * 720 - 360; // -360 to +360 degrees

    const randomEndOffsetX = randomOffsetX * 2;
    const randomEndOffsetY = randomOffsetY * 2;
    const randomEndRotation = randomRotation + (Math.random() * 360 - 180);

    particle.style.left = `${originX}px`;
    particle.style.top = `${originY}px`;
    particle.style.setProperty('--dx', `${randomOffsetX}px`);
    particle.style.setProperty('--dy', `${randomOffsetY}px`);
    particle.style.setProperty('--rot', `${randomRotation}deg`);
    particle.style.setProperty('--dx-end', `${randomEndOffsetX}px`);
    particle.style.setProperty('--dy-end', `${randomEndOffsetY}px`);
    particle.style.setProperty('--rot-end', `${randomEndRotation}deg`);

    particle.addEventListener('animationend', () => {
        particle.remove();
    });
}

function createTrickParticle(originX, originY) {
    const particle = document.createElement('div');
    particle.className = 'trick-particle'; // CSS class for ghost-like animation
    document.body.appendChild(particle);

    // Random offsets for particle trajectory
    const randomOffsetX = (Math.random() - 0.5) * 120; // -60px to +60px horizontal
    const randomOffsetY = (Math.random() - 1.2) * 80; // -96px to -16px vertical (upwards)
    const randomRotation = Math.random() * 360 - 180; // -180 to +180 degrees

    const randomEndOffsetX = randomOffsetX * 1.5;
    const randomEndOffsetY = randomOffsetY * 1.5;
    const randomEndRotation = randomRotation + (Math.random() * 180 - 90);

    particle.style.left = `${originX}px`;
    particle.style.top = `${originY}px`;
    particle.style.setProperty('--dx', `${randomOffsetX}px`);
    particle.style.setProperty('--dy', `${randomOffsetY}px`);
    particle.style.setProperty('--rot', `${randomRotation}deg`);
    particle.style.setProperty('--dx-end', `${randomEndOffsetX}px`);
    particle.style.setProperty('--dy-end', `${randomEndOffsetY}px`);
    particle.style.setProperty('--rot-end', `${randomEndRotation}deg`);

    particle.addEventListener('animationend', () => {
        particle.remove();
    });
}

// --- Player Name UI & Validation Functions ---
function updatePlayerNameUI() {
    if (playerName && playerName.trim() !== "") {
        currentPlayerNameDisplay.textContent = `Playing as: ${playerName}`;
        currentPlayerNameDisplay.classList.remove('hidden');
        playerNameInputContainer.classList.add('hidden');
        trickOrTreatBtn.disabled = false;
        trickOrTreatBtn.textContent = '👻 Trick or Treat! 🍬'; // Reset button text
        // Update score displays
        trickCountDisplay.textContent = trickCount.toString();
        treatCountDisplay.textContent = treatCount.toString();
    } else {
        currentPlayerNameDisplay.classList.add('hidden');
        playerNameInputContainer.classList.remove('hidden');
        playerNameInput.value = ''; // Ensure input is clear
        trickOrTreatBtn.disabled = true;
        savePlayerNameBtn.disabled = true; // Initially disabled
    }
}

function validateAndSavePlayerName() {
    const name = playerNameInput.value.trim();
    if (name.length < 3 || name.length > 20) {
        showGameNotification('Nickname must be between 3 and 20 characters!', 'error');
        return;
    }
    playerName = name;
    localStorage.setItem('playerName', playerName);
    updatePlayerNameUI();
    showGameNotification(`Welcome, ${playerName}! Let the haunting begin!`, 'success');
    playSound(clickSound, sfxVolume);
    sendGAEvent('player_name_saved', { player_name: playerName });
}

// --- Trick or Treat Game Logic ---
const tricks = [
    "Your cursor just turned into a tiny pumpkin for 5 seconds!",
    "Oops! You have to refresh the page twice!",
    "A ghostly giggle echoes... nothing else happens!",
    "You just won the 'Least Spooky Costume' award!",
    "For the next 10 seconds, all buttons will jiggle!",
    "You hear a faint 'boo!'... from behind you!",
    "Your screen is now slightly haunted with a pixel ghost (just kidding!).",
    "You find a single piece of lint in your pocket!",
    "The next button you click will make a 'ribbit' sound (not really, but imagine!).",
    "A spider just crawled across your screen (imaginary, of course!).",
];

const treats = [
    "You found 10 $TOT tokens!",
    "A basket of candy appeared! (+5 $TOT)",
    "You got a shiny rare NFT! (Just kidding, have 20 $TOT!)",
    "A spooky generous ghost gave you 15 $TOT!",
    "Jack-o'-lanterns light up! +12 $TOT!",
    "The witch brewed a potion of riches! +18 $TOT!",
    "A lucky black cat crossed your path! +25 $TOT!",
    "You unearthed a buried treasure chest! +30 $TOT!",
];

function doTrickOrTreat() {
    if (!playerName || playerName.trim() === "") {
        showGameNotification("Please save your Spooky Nickname first!", 'error');
        return;
    }

    playSound(bellSound, sfxVolume);
    trickOrTreatBtn.disabled = true;
    outcomeDisplay.classList.remove('is-treat', 'is-trick');
    resultMessageDiv.classList.add('hidden');
    outcomeDisplay.textContent = 'Ringing the doorbell...';

    const outcomeIsTreat = Math.random() < 0.6; // 60% chance for a treat

    setTimeout(() => {
        if (outcomeIsTreat) {
            treatCount++;
            localStorage.setItem('treatCount', treatCount.toString());
            treatCountDisplay.textContent = treatCount.toString();
            outcomeDisplay.textContent = '🍬 TREAT! 🍬';
            outcomeDisplay.classList.add('is-treat');
            lastOutcomeMessage = getRandomElement(treats);
            resultText.textContent = lastOutcomeMessage;
            playSound(treatSound, sfxVolume);
            // Spawn candy particles from the button
            const btnRect = trickOrTreatBtn.getBoundingClientRect();
            for (let i = 0; i < 10; i++) {
                createCandyParticle(btnRect.left + btnRect.width / 2, btnRect.top + btnRect.height / 2);
            }
            sendGAEvent('game_outcome', { player_name: playerName, outcome: 'treat' });
        } else {
            trickCount++;
            localStorage.setItem('trickCount', trickCount.toString());
            trickCountDisplay.textContent = trickCount.toString();
            outcomeDisplay.textContent = '👻 TRICK! 👻';
            outcomeDisplay.classList.add('is-trick');
            lastOutcomeMessage = getRandomElement(tricks);
            resultText.textContent = lastOutcomeMessage;
            playSound(trickSound, sfxVolume);
            // Spawn ghost particles from the button
            const btnRect = trickOrTreatBtn.getBoundingClientRect();
            for (let i = 0; i < 5; i++) {
                createTrickParticle(btnRect.left + btnRect.width / 2, btnRect.top + btnRect.height / 2);
            }
            sendGAEvent('game_outcome', { player_name: playerName, outcome: 'trick' });
        }
        currentOutcome = outcomeIsTreat ? "TREAT" : "TRICK";
        resultMessageDiv.classList.remove('hidden');
        trickOrTreatBtn.disabled = false;
    }, 2000); // Simulate doorbell ringing and suspense
}

// --- Social Share Functions ---
function shareOnX() {
    playSound(clickSound, sfxVolume);
    const text = encodeURIComponent(`I just got a ${currentOutcome}! "${lastOutcomeMessage}" from $TOT Trick or Treat! Come play on BSC: ${window.location.href} #TOT #TrickOrTreat #Halloween #BNBChain`);
    window.open(`https://x.com/intent/tweet?text=${text}`, '_blank');
    sendGAEvent('share_content', { platform: 'X', outcome: currentOutcome, player_name: playerName });
}

function shareOnTelegram() {
    playSound(clickSound, sfxVolume);
    const text = encodeURIComponent(`I just got a ${currentOutcome}! "${lastOutcomeMessage}" from $TOT Trick or Treat! Come play on BSC: ${window.location.href} #TOT #TrickOrTreat #Halloween #BNBChain`);
    window.open(`https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${text}`, '_blank');
    sendGAEvent('share_content', { platform: 'Telegram', outcome: currentOutcome, player_name: playerName });
}

// --- Live Price Feed (BNB as placeholder for $TOT) ---
// Using CoinGecko API for BNB price
const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3/simple/price?ids=binancecoin&vs_currencies=usd&include_24hr_change=true';

async function fetchBnbPrice() {
    if (!bnbPriceDisplay) return;
    try {
        const response = await fetch(COINGECKO_API_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const bnbData = data.binancecoin;
        if (bnbData) {
            const price = bnbData.usd;
            const change24h = bnbData.usd_24h_change;
            const changeClass = change24h >= 0 ? 'positive' : 'negative';
            bnbPriceDisplay.innerHTML = `
                <p>BNB Price (USD): <span class="price-value">$${price.toFixed(2)}</span></p>
                <p>24h Change: <span class="change-24h ${changeClass}">${change24h.toFixed(2)}%</span></p>
            `;
        } else {
            bnbPriceDisplay.innerHTML = '<p>Price data not available for BNB.</p>';
        }
    } catch (error) {
        console.error("Error fetching BNB price:", error);
        bnbPriceDisplay.innerHTML = '<p>Error loading price data. Try again later.</p>';
        sendGAEvent('price_fetch_error', { error_message: error.message });
    }
}

// --- Theme Switching ---
function toggleTheme() {
    playSound(toggleSound, sfxVolume);
    document.body.classList.toggle('light-theme');
    const isLightTheme = document.body.classList.contains('light-theme');
    localStorage.setItem('theme', isLightTheme ? 'light' : 'dark');
    themeToggleBtn.textContent = isLightTheme ? '☀️' : '🌙';
    sendGAEvent('theme_toggled', { theme_name: isLightTheme ? 'light' : 'dark' });
}

function loadTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
        themeToggleBtn.textContent = '☀️';
    } else {
        document.body.classList.remove('light-theme');
        themeToggleBtn.textContent = '🌙';
    }
}

// --- YouTube IFrame Player API Logic ---
// 1. Load the IFrame Player API asynchronously.
function loadYouTubeAPI() {
    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
}

// 2. This function creates an <iframe> (and YouTube player)
//    after the API code downloads. This global function MUST be named onYouTubeIframeAPIReady.
window.onYouTubeIframeAPIReady = function() {
    ytApiReady = true;
    console.log('YouTube IFrame API is ready.');
    createYouTubePlayer();
}

function createYouTubePlayer() {
    if (!ytApiReady) {
        console.warn("YouTube API not ready. Retrying player creation.");
        setTimeout(createYouTubePlayer, 100);
        return;
    }

    youtubePlayer = new YT.Player('youtubeBackgroundPlayer', {
        height: '1',
        width: '1',
        videoId: YOUTUBE_VIDEO_ID,
        playerVars: {
            autoplay: 1,      // Autoplay (will likely be muted)
            loop: 1,          // Loop the video
            playlist: YOUTUBE_VIDEO_ID, // Required for 'loop' to work for a single video
            controls: 0,      // Hide player controls
            mute: 1,          // Start muted to attempt autoplay
            enablejsapi: 1,   // Enable JavaScript API control
            modestbranding: 1,// Hide YouTube logo
            rel: 0,           // Don't show related videos at the end
            showinfo: 0,      // Hide video title and uploader info
            fs: 0             // Disable fullscreen button
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
}

function onPlayerReady(event) {
    console.log('YouTube player ready.');
    // Set initial volume from localStorage. It will still be muted by browser.
    event.target.setVolume(musicVolume * 100);
    // User interaction will be needed to unmute and play.
    // The global gesture listener will handle trying to unmute/play.
    updateMusicVolumeIcon();
}

function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.PLAYING) {
        musicPlayedOnce = true;
    } else if (event.data === YT.PlayerState.ENDED) {
        event.target.playVideo(); // Ensure looping as fallback
    }
    updateMusicVolumeIcon();
}

// --- Volume Control Functions (Adapted for YouTube Player) ---
function loadVolumePreferences() {
    sfxVolume = parseFloat(localStorage.getItem('sfxVolume')) || 0.3;
    musicVolume = parseFloat(localStorage.getItem('musicVolume')) || 0.1;

    if (sfxVolumeSlider) sfxVolumeSlider.value = sfxVolume;
    if (musicVolumeSlider) musicVolumeSlider.value = musicVolume;

    updateSfxVolumeIcon();
    updateMusicVolumeIcon();
}

function updateSfxVolumeIcon() {
    if (sfxVolumeIcon) {
        if (sfxVolume === 0) sfxVolumeIcon.textContent = '🔇';
        else if (sfxVolume < 0.5) sfxVolumeIcon.textContent = '🔉';
        else sfxVolumeIcon.textContent = '🔊';
    }
}

function updateMusicVolumeIcon() {
    if (musicVolumeIcon) {
        if (!youtubePlayer || youtubePlayer.isMuted() || musicVolume === 0) {
            musicVolumeIcon.textContent = '🔇';
        } else {
            musicVolumeIcon.textContent = '🎵';
        }
    }
}

function setSfxGlobalVolume(volume) {
    sfxVolume = volume;
    localStorage.setItem('sfxVolume', sfxVolume.toString());
    updateSfxVolumeIcon();
    playSound(clickSound, sfxVolume); // Play a test click sound
    sendGAEvent('volume_changed', { volume_type: 'sfx', volume_level: volume });
}

function setMusicGlobalVolume(volume) {
    musicVolume = volume;
    localStorage.setItem('musicVolume', musicVolume.toString());

    if (youtubePlayer && youtubePlayer.setVolume) {
        youtubePlayer.setVolume(musicVolume * 100);
        if (musicVolume === 0) {
            youtubePlayer.mute();
        } else {
            youtubePlayer.unMute();
            // If the player was paused by the browser, try to play it now.
            if (youtubePlayer.getPlayerState() !== YT.PlayerState.PLAYING) {
                 youtubePlayer.playVideo().catch(e => console.warn("YouTube player play failed after volume change:", e.message));
            }
        }
        musicPlayedOnce = true; // Any interaction with music controls counts as user gesture
    }
    updateMusicVolumeIcon();
    sendGAEvent('volume_changed', { volume_type: 'music', volume_level: volume });
}

// NEW: Wallet Functions (Modified for Coming Soon)
function connectWallet() {
    console.log("Attempting to connect wallet (Coming Soon!)...");
    showGameNotification("Wallet connection is coming soon! Happy Halloween!", 'info');
    playSound(clickSound, sfxVolume);
    sendGAEvent('connect_wallet_clicked', { status: 'coming_soon' });
}


// --- Initial Setup and Event Listeners ---
document.addEventListener('DOMContentLoaded', () => {
    AOS.init(); // Initialize AOS library

    // --- Player Name Setup ---
    updatePlayerNameUI();

    playerNameInput.addEventListener('input', () => {
        savePlayerNameBtn.disabled = playerNameInput.value.trim().length < 3;
        // If user starts typing, allow them to change the name
        if (currentPlayerNameDisplay && !currentPlayerNameDisplay.classList.contains('hidden') && playerNameInput.value.trim() !== playerName) {
             currentPlayerNameDisplay.classList.add('hidden');
             playerNameInputContainer.classList.remove('hidden');
             trickOrTreatBtn.disabled = true; // Disable game button until new name is saved
        }
    });
    savePlayerNameBtn.addEventListener('click', validateAndSavePlayerName);

    // --- Game Logic Listeners ---
    trickOrTreatBtn.addEventListener('click', doTrickOrTreat);

    // --- Audio Control Listeners ---
    if (sfxVolumeSlider) sfxVolumeSlider.addEventListener('input', (event) => setSfxGlobalVolume(parseFloat(event.target.value)));
    if (sfxVolumeIcon) {
        sfxVolumeIcon.addEventListener('click', () => {
            const currentVolume = sfxVolumeSlider.value;
            if (currentVolume > 0) {
                sfxVolumeSlider.dataset.previousVolume = currentVolume.toString(); // Store current volume
                setSfxGlobalVolume(0); // Mute SFX
            } else {
                // Restore previous volume or default
                setSfxGlobalVolume(parseFloat(sfxVolumeSlider.dataset.previousVolume || '0.3'));
            }
            sfxVolumeSlider.value = sfxVolume; // Sync slider visually
        });
    }

    // Music Volume control for YouTube Player
    if (musicVolumeSlider) musicVolumeSlider.addEventListener('input', (event) => setMusicGlobalVolume(parseFloat(event.target.value)));
    if (musicVolumeIcon) {
        musicVolumeIcon.addEventListener('click', () => {
            // Logic to mute/unmute based on current state
            if (musicVolume > 0) { // If currently playing
                musicVolumeSlider.dataset.previousVolume = musicVolume.toString(); // Save current volume
                setMusicGlobalVolume(0); // Mute
            } else { // If currently muted
                setMusicGlobalVolume(parseFloat(musicVolumeSlider.dataset.previousVolume || '0.1')); // Restore previous volume
            }
            musicVolumeSlider.value = musicVolume; // Sync slider visually
        });
    }

    // --- Share Button Listeners ---
    if(shareXBtn) shareXBtn.addEventListener('click', shareOnX);
    if(shareTelegramBtn) shareTelegramBtn.addEventListener('click', shareOnTelegram);

    // --- Theme Toggle Listener ---
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', toggleTheme);
        themeToggleBtn.addEventListener('touchend', (event) => {
            event.preventDefault(); // Prevent double click on mobile
            themeToggleBtn.click();
        });
    }

    // --- Wallet Connect Listener ---
    if (connectWalletBtn) {
        connectWalletBtn.addEventListener('click', (e) => {
            e.preventDefault();
            connectWallet();
        });
    }

    // --- Initial Load Actions ---
    loadTheme();
    loadVolumePreferences(); // Set initial slider positions and icons
    loadYouTubeAPI(); // Load YouTube API first (player created in onYouTubeIframeAPIReady)
    fetchBnbPrice();
    setInterval(fetchBnbPrice, 30000); // Update price every 30 seconds

    // Copy-to-clipboard functionality for contract address
    const copyBtn = document.querySelector('.copy-btn');
    if (copyBtn) {
        copyBtn.addEventListener('click', function() {
            const contractAddressElement = document.getElementById('contractAddress');
            if (contractAddressElement) {
                const textToCopy = contractAddressElement.textContent;
                navigator.clipboard.writeText(textToCopy).then(() => {
                    const originalText = this.textContent;
                    this.textContent = 'Copied!';
                    setTimeout(() => {
                        this.textContent = originalText;
                    }, 1500);
                    sendGAEvent('contract_address_copied');
                }).catch(err => {
                    console.error('Failed to copy text: ', err);
                    alert('Failed to copy address. Please copy manually: ' + textToCopy);
                });
            }
        });
    }

    // Preloader Logic
    window.addEventListener('load', () => {
        const preloader = document.getElementById('preloader');
        if (preloader) {
            preloader.style.opacity = '0';
            setTimeout(() => {
                preloader.style.display = 'none';
            }, 500);
        }
    });

    // Cursor Trail Effect - Halloween themed
    document.addEventListener('mousemove', function(e) {
        const trail = document.createElement('div');
        trail.className = 'cursor-trail';
        document.body.appendChild(trail);
        trail.style.left = e.pageX + 'px';
        trail.style.top = e.pageY + 'px';
        const colors = ['var(--accent-color-1)', 'var(--accent-color-2)', '#FFFFFF']; // Orange, Purple, White
        trail.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        setTimeout(() => {
            trail.style.opacity = '0';
            trail.style.transform = 'scale(0.5)';
            setTimeout(() => {
                trail.remove();
            }, 500);
        }, 100);
    }, { passive: true });


    // NEW: Global user gesture listener to play/unmute YouTube video
    // This is crucial for modern browsers' autoplay policies.
    function setupGlobalMusicGestureListener() {
        const playMusicOnFirstGesture = () => {
            // Check if youtubePlayer exists and has an unmute method before trying to call it
            // Also check if it's currently muted or not playing
            if (youtubePlayer && typeof youtubePlayer.unMute === 'function' && (youtubePlayer.isMuted() || youtubePlayer.getPlayerState() !== YT.PlayerState.PLAYING)) {
                youtubePlayer.unMute(); // Attempt to unmute
                youtubePlayer.setVolume(musicVolume * 100); // Set to user's preferred volume
                youtubePlayer.playVideo().then(() => { // Attempt to play
                    musicPlayedOnce = true;
                    console.log("YouTube background music started via first user gesture.");
                    updateMusicVolumeIcon(); // Update icon to 'playing' state
                    // Remove listeners after successful playback initiation
                    document.body.removeEventListener('click', playMusicOnFirstGesture);
                    document.body.removeEventListener('touchend', playMusicOnFirstGesture);
                    document.body.removeEventListener('keydown', playMusicOnFirstGesture);
                    sendGAEvent('background_music_started', { trigger: 'first_user_gesture' });
                }).catch(e => console.warn("YouTube player play failed on first gesture:", e.message));
            }
        };

        if (!musicPlayedOnce) {
            // Add listeners to common user interaction events on the body
            document.body.addEventListener('click', playMusicOnFirstGesture, { once: true });
            document.body.addEventListener('touchend', playMusicOnFirstGesture, { once: true });
            document.body.addEventListener('keydown', playMusicOnFirstGesture, { once: true });
        }
    }
    setupGlobalMusicGestureListener();
});