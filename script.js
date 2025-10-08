class TypeMaster {
    constructor() {
        this.words = [];
        this.currentText = '';
        this.currentInput = '';
        this.isTesting = false;
        this.startTime = null;
        this.timer = null;
        this.timeLimit = 60;
        this.errors = 0;
        this.totalKeystrokes = 0;
        this.correctKeystrokes = 0;
        this.wpmHistory = [];
        
        this.initializeElements();
        this.loadWords();
        this.setupEventListeners();
        this.initializeChart();
    }

    initializeElements() {
        this.textDisplay = document.getElementById('textDisplay');
        this.typingInput = document.getElementById('typingInput');
        this.startBtn = document.getElementById('startBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.themeBtn = document.getElementById('themeBtn');
        this.newTestBtn = document.getElementById('newTestBtn');
        this.results = document.getElementById('results');
        
        // Stats elements
        this.wpmElement = document.getElementById('wpm');
        this.accuracyElement = document.getElementById('accuracy');
        this.timerElement = document.getElementById('timer');
        this.errorsElement = document.getElementById('errors');
        this.finalWpm = document.getElementById('finalWpm');
        this.finalAccuracy = document.getElementById('finalAccuracy');
        this.finalErrors = document.getElementById('finalErrors');
        
        // Chart
        this.progressChart = null;
    }

    async loadWords() {
        try {
            // Sample word bank for typing tests
            this.words = [
                "The quick brown fox jumps over the lazy dog while programming computers with lightning speed and accuracy that amazes everyone who watches the incredible display of typing prowess and digital dexterity in action right before their very eyes.",
                "Programming is the process of creating a set of instructions that tell a computer how to perform a task. Programming can be done using many programming languages such as JavaScript, Python, C++, and many others that developers use worldwide.",
                "Typing speed and accuracy are crucial skills in today's digital world where communication happens mostly through written text on various devices including computers, tablets, and smartphones that we use every single day for work and personal tasks.",
                "Practice makes perfect when it comes to improving your typing skills. Regular practice sessions will help you build muscle memory and increase both your speed and accuracy over time through consistent effort and proper technique.",
                "Web development involves creating websites and web applications that run in browsers. It includes frontend development with HTML, CSS, and JavaScript, plus backend development with server-side languages and database management systems.",
                "Artificial intelligence and machine learning are transforming how we interact with technology. These advanced systems can process information, recognize patterns, and make decisions with remarkable efficiency and growing capabilities.",
                "The internet has revolutionized communication, allowing people to connect instantly across great distances. This global network continues to evolve with new technologies that shape how we work, learn, and socialize in modern society."
            ];
            
            this.generateNewText();
        } catch (error) {
            console.error('Error loading words:', error);
        }
    }

    generateNewText() {
        const randomIndex = Math.floor(Math.random() * this.words.length);
        this.currentText = this.words[randomIndex];
        this.renderText();
    }

    renderText() {
        this.textDisplay.innerHTML = '';
        this.currentText.split('').forEach((char, index) => {
            const span = document.createElement('span');
            span.textContent = char;
            span.className = 'char';
            if (index === 0) {
                span.classList.add('current');
            }
            this.textDisplay.appendChild(span);
        });
    }

    setupEventListeners() {
        this.startBtn.addEventListener('click', () => this.startTest());
        this.resetBtn.addEventListener('click', () => this.resetTest());
        this.newTestBtn.addEventListener('click', () => this.newTest());
        this.themeBtn.addEventListener('click', () => this.toggleTheme());
        
        this.typingInput.addEventListener('input', (e) => this.handleInput(e));
        this.typingInput.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace') {
                e.preventDefault(); // Prevent default backspace behavior
            }
        });

        // Time selection buttons
        document.querySelectorAll('.time-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.timeLimit = parseInt(e.target.dataset.time);
                this.timerElement.textContent = this.timeLimit;
            });
        });
    }

    startTest() {
        this.isTesting = true;
        this.startTime = new Date();
        this.errors = 0;
        this.totalKeystrokes = 0;
        this.correctKeystrokes = 0;
        this.currentInput = '';
        
        this.typingInput.value = '';
        this.typingInput.disabled = false;
        this.typingInput.focus();
        
        this.startBtn.disabled = true;
        this.resetBtn.disabled = false;
        
        this.results.classList.add('hidden');
        
        this.startTimer();
        this.updateStats();
    }

    startTimer() {
        let timeLeft = this.timeLimit;
        this.timerElement.textContent = timeLeft;
        
        this.timer = setInterval(() => {
            timeLeft--;
            this.timerElement.textContent = timeLeft;
            
            if (timeLeft <= 0) {
                this.endTest();
            }
            
            this.updateStats();
        }, 1000);
    }

    handleInput(e) {
        if (!this.isTesting) return;
        
        this.currentInput = e.target.value;
        this.totalKeystrokes++;
        
        this.updateTextDisplay();
        this.updateStats();
    }

    updateTextDisplay() {
        const chars = this.textDisplay.querySelectorAll('.char');
        let newErrors = 0;
        
        chars.forEach((charSpan, index) => {
            charSpan.classList.remove('correct', 'incorrect', 'current');
            
            if (index < this.currentInput.length) {
                if (this.currentInput[index] === this.currentText[index]) {
                    charSpan.classList.add('correct');
                    this.correctKeystrokes++;
                } else {
                    charSpan.classList.add('incorrect');
                    newErrors++;
                }
            }
            
            if (index === this.currentInput.length) {
                charSpan.classList.add('current');
            }
        });
        
        this.errors = newErrors;
    }

    updateStats() {
        const currentTime = new Date();
        const timeElapsed = (currentTime - this.startTime) / 1000 / 60; // in minutes
        
        if (timeElapsed > 0) {
            const wpm = Math.round((this.correctKeystrokes / 5) / timeElapsed);
            this.wpmElement.textContent = wpm;
        }
        
        const accuracy = this.totalKeystrokes > 0 
            ? Math.round(((this.totalKeystrokes - this.errors) / this.totalKeystrokes) * 100)
            : 100;
        
        this.accuracyElement.textContent = accuracy + '%';
        this.errorsElement.textContent = this.errors;
    }

    endTest() {
        this.isTesting = false;
        clearInterval(this.timer);
        this.typingInput.disabled = true;
        
        const finalWpm = parseInt(this.wpmElement.textContent);
        const finalAccuracy = parseInt(this.accuracyElement.textContent);
        
        this.wpmHistory.push({
            wpm: finalWpm,
            accuracy: finalAccuracy,
            errors: this.errors,
            timestamp: new Date().toLocaleDateString()
        });
        
        this.showResults(finalWpm, finalAccuracy, this.errors);
        this.updateChart();
    }

    showResults(wpm, accuracy, errors) {
        this.finalWpm.textContent = wpm;
        this.finalAccuracy.textContent = accuracy + '%';
        this.finalErrors.textContent = errors;
        this.results.classList.remove('hidden');
    }

    resetTest() {
        this.isTesting = false;
        clearInterval(this.timer);
        
        this.typingInput.value = '';
        this.typingInput.disabled = true;
        
        this.startBtn.disabled = false;
        this.resetBtn.disabled = true;
        
        this.wpmElement.textContent = '0';
        this.accuracyElement.textContent = '100%';
        this.errorsElement.textContent = '0';
        this.timerElement.textContent = this.timeLimit;
        
        this.generateNewText();
        this.results.classList.add('hidden');
    }

    newTest() {
        this.resetTest();
        this.startTest();
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        this.themeBtn.textContent = newTheme === 'dark' ? '☀️ Light' : '🌙 Dark';
        
        // Update chart colors when theme changes
        if (this.progressChart) {
            this.updateChartColors();
        }
    }

    initializeChart() {
        const ctx = document.getElementById('progressChart').getContext('2d');
        
        this.progressChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'WPM Progress',
                    data: [],
                    borderColor: getComputedStyle(document.documentElement).getPropertyValue('--primary-color'),
                    backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--primary-color') + '20',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary')
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: getComputedStyle(document.documentElement).getPropertyValue('--border-color')
                        },
                        ticks: {
                            color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary')
                        }
                    },
                    x: {
                        grid: {
                            color: getComputedStyle(document.documentElement).getPropertyValue('--border-color')
                        },
                        ticks: {
                            color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary')
                        }
                    }
                }
            }
        });
    }

    updateChart() {
        if (!this.progressChart) return;
        
        const labels = this.wpmHistory.map((_, index) => `Test ${index + 1}`);
        const data = this.wpmHistory.map(test => test.wpm);
        
        this.progressChart.data.labels = labels;
        this.progressChart.data.datasets[0].data = data;
        this.progressChart.update();
    }

    updateChartColors() {
        if (!this.progressChart) return;
        
        const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary-color');
        const textColor = getComputedStyle(document.documentElement).getPropertyValue('--text-primary');
        const secondaryColor = getComputedStyle(document.documentElement).getPropertyValue('--text-secondary');
        const borderColor = getComputedStyle(document.documentElement).getPropertyValue('--border-color');
        
        this.progressChart.data.datasets[0].borderColor = primaryColor;
        this.progressChart.data.datasets[0].backgroundColor = primaryColor + '20';
        
        this.progressChart.options.plugins.legend.labels.color = textColor;
        this.progressChart.options.scales.y.ticks.color = secondaryColor;
        this.progressChart.options.scales.y.grid.color = borderColor;
        this.progressChart.options.scales.x.ticks.color = secondaryColor;
        this.progressChart.options.scales.x.grid.color = borderColor;
        
        this.progressChart.update();
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TypeMaster();
});