/**
 * Geometry Dash Clone
 * A JavaScript implementation of a game similar to Geometry Dash
 */

// Game Constants
const GRAVITY = 0.7;
const JUMP_FORCE = -12;
const GROUND_HEIGHT = 400;
const OBSTACLE_SPEED = 6;
const OBSTACLE_MIN_DISTANCE = 300;
const OBSTACLE_MAX_DISTANCE = 500;
const LEVEL_LENGTH = 10000;

// Game Variables
let canvas, ctx;
let player;
let obstacles = [];
let groundParticles = [];
let backgroundStars = [];
let jumpParticles = [];
let deathParticles = [];
let portals = [];
let collectibles = [];
let score = 0;
let gameOver = false;
let levelCompleted = false;
let gameStarted = false;
let gamePaused = false;
let frameCount = 0;
let lastObstacleX = 0;
let levelProgress = 0;
let currentLevel = 1;
let collectedItems = 0;

// Player Customization
let playerColors = {
    primary: '#4caf50',
    secondary: '#2e7d32',
    outline: '#1b5e20'
};
let gameMode = 'cube';
let invertedGravity = false;
let speedMultiplier = 1;

// Visual Effects
let backgroundOffset = 0;
let groundOffset = 0;
let cameraShake = 0;
let playerTrail = [];
let pulseEffects = [];

// Audio
let gameMusic;
let jumpSound;
let deathSound;
let portalSound;
let completionSound;
let muted = false;

// Asset Loading
let assetsLoaded = 0;
let totalAssets = 0;
let gameAssets = {};

// DOM Elements
let loadingScreen;
let startScreen;
let gameOverScreen;
let levelCompleteScreen;
let gameUI;
let progressFill;
let finalScoreElement;
let completionScoreElement;
let scoreElement;
let levelProgressElement;
let muteButton;

/**
 * Initialize the game when the window loads
 */
window.onload = function() {
    // Get DOM elements
    canvas = document.getElementById('game-canvas');
    ctx = canvas.getContext('2d');
    loadingScreen = document.getElementById('loading-screen');
    startScreen = document.getElementById('start-screen');
    gameOverScreen = document.getElementById('game-over-screen');
    levelCompleteScreen = document.getElementById('level-complete-screen');
    gameUI = document.getElementById('game-ui');
    progressFill = document.querySelector('.progress-fill');
    finalScoreElement = document.getElementById('final-score');
    completionScoreElement = document.getElementById('completion-score');
    scoreElement = document.getElementById('score');
    levelProgressElement = document.getElementById('level-progress');
    muteButton = document.getElementById('mute-btn');
    
    // Set canvas dimensions
    canvas.width = 900;
    canvas.height = 500;
    
    // Setup event listeners
    setupEventListeners();
    
    // Load game assets
    loadAssets();
    
    // Generate background stars
    generateStars();
};

/**
 * Set up all event listeners for the game
 */
function setupEventListeners() {
    // Start button
    document.getElementById('play-btn').addEventListener('click', function() {
        startScreen.classList.add('hidden');
        gameUI.classList.remove('hidden');
        startGame();
    });
    
    // Customize button
    document.getElementById('customize-btn').addEventListener('click', function() {
        // Cycle through colors
        const colors = ['#4caf50', '#2196f3', '#f44336', '#ffeb3b', '#9c27b0'];
        const currentIndex = colors.indexOf(playerColors.primary);
        const nextIndex = (currentIndex + 1) % colors.length;
        
        playerColors.primary = colors[nextIndex];
        playerColors.secondary = adjustColor(colors[nextIndex], -30);
        playerColors.outline = adjustColor(colors[nextIndex], -50);
    });
    
    // Restart button
    document.getElementById('restart-btn').addEventListener('click', function() {
        gameOverScreen.classList.add('hidden');
        resetGame();
    });
    
    // Next level button
    document.getElementById('next-level-btn').addEventListener('click', function() {
        levelCompleteScreen.classList.add('hidden');
        currentLevel++;
        resetGame();
    });
    
    // Mute button
    muteButton.addEventListener('click', function() {
        toggleMute();
    });
    
    // Pause button
    document.getElementById('pause-btn').addEventListener('click', function() {
        togglePause();
    });
    
    // Keyboard controls
    document.addEventListener('keydown', function(event) {
        // Jump with Space or Up Arrow
        if ((event.code === 'Space' || event.code === 'ArrowUp') && 
            gameStarted && !gameOver && !levelCompleted && !gamePaused) {
            performAction();
        }
        
        // Restart with Enter
        if (event.code === 'Enter' && (gameOver || levelCompleted)) {
            if (gameOver) {
                gameOverScreen.classList.add('hidden');
                resetGame();
            } else if (levelCompleted) {
                levelCompleteScreen.classList.add('hidden');
                currentLevel++;
                resetGame();
            }
        }
        
        // Mute with M
        if (event.code === 'KeyM') {
            toggleMute();
        }
        
        // Pause with P or Escape
        if (event.code === 'KeyP' || event.code === 'Escape') {
            togglePause();
        }
    });
    
    // Mouse/touch controls
    canvas.addEventListener('click', function() {
        if (gameStarted && !gameOver && !levelCompleted && !gamePaused) {
            performAction();
        }
    });
}

/**
 * Load all game assets
 */
function loadAssets() {
    // For this demo, we'll simulate loading instead of actually loading images
    // In a real implementation, you would load actual image and sound files
    
    // Simulate loading progress
    totalAssets = 20; // Arbitrary number for demo
    
    const loadingInterval = setInterval(() => {
        assetsLoaded++;
        const progress = (assetsLoaded / totalAssets) * 100;
        progressFill.style.width = progress + '%';
        
        if (assetsLoaded >= totalAssets) {
            clearInterval(loadingInterval);
            setTimeout(() => {
                loadingScreen.classList.add('hidden');
            }, 500);
        }
    }, 100);
    
    // Initialize audio (in a real implementation, you would load actual audio files)
    initAudio();
}

/**
 * Initialize audio elements
 */
function initAudio() {
    gameMusic = new Audio();
    jumpSound = new Audio();
    deathSound = new Audio();
    portalSound = new Audio();
    completionSound = new Audio();
    
    // In a real implementation, you would set the source of these audio elements
    // gameMusic.src = 'assets/sounds/music.mp3';
    // jumpSound.src = 'assets/sounds/jump.mp3';
}

/**
 * Toggle mute state for all game audio
 */
function toggleMute() {
    muted = !muted;
    
    if (muted) {
        muteButton.textContent = '🔇';
        if (gameMusic) gameMusic.
