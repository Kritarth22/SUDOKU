document.addEventListener("DOMContentLoaded", function () {
    const container = document.getElementById("container");
    const timeDisplay = document.getElementById("time");
    const hintCountDisplay = document.getElementById("hintCount");
    let seconds = 0;
    let minutes = 0;
    let timer;
    let hintsLeft = 3;
    let initialPuzzle = generateRandomSudoku();
    let puzzle = JSON.parse(JSON.stringify(initialPuzzle));
    let solvedPuzzle = [];
    let lastHighlightedCell = null;

    // Timer functions
    function startTimer() {
        clearInterval(timer);
        seconds = 0;
        minutes = 0;
        updateTimerDisplay();
        timer = setInterval(updateTimer, 1000);
    }

    function updateTimer() {
        seconds++;
        if (seconds >= 60) {
            seconds = 0;
            minutes++;
        }
        updateTimerDisplay();
    }

    function updateTimerDisplay() {
        const formattedSeconds = seconds < 10 ? `0${seconds}` : seconds;
        const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
        timeDisplay.textContent = `${formattedMinutes}:${formattedSeconds}`;
    }

    function stopTimer() {
        clearInterval(timer);
    }

    // Hint functionality
    function giveHint() {
        if (hintsLeft <= 0) {
            alert("No hints left!");
            return;
        }

        const userGrid = getUserInputGrid();
        const correctSolution = solveSudoku(JSON.parse(JSON.stringify(initialPuzzle)));
        let emptyCells = [];

        // Find all empty or incorrect cells
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                if (userGrid[i][j] !== correctSolution[i][j]) {
                    emptyCells.push({row: i, col: j});
                }
            }
        }

        if (emptyCells.length === 0) {
            alert("The puzzle is already solved!");
            return;
        }

        // Pick a random empty cell
        const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        const cellElement = container.children[randomCell.row].children[randomCell.col];
        
        // Fill in the correct value
        cellElement.value = correctSolution[randomCell.row][randomCell.col];
        cellElement.classList.add('hint-cell');
        
        hintsLeft--;
        hintCountDisplay.textContent = hintsLeft;
    }

    // Cell highlighting functionality
    function highlightRelatedCells(cell) {
        // Remove previous highlights
        if (lastHighlightedCell) {
            clearHighlights();
        }
        
        const row = cell.parentNode;
        const rowIndex = Array.from(row.parentNode.children).indexOf(row);
        const colIndex = Array.from(row.children).indexOf(cell);
        
        // Highlight row
        Array.from(row.children).forEach(c => {
            if (c !== cell) c.classList.add('highlight-row');
        });
        
        // Highlight column
        Array.from(container.children).forEach(r => {
            const c = r.children[colIndex];
            if (c !== cell) c.classList.add('highlight-col');
        });
        
        // Highlight subgrid
        const subgridStartRow = Math.floor(rowIndex / 3) * 3;
        const subgridStartCol = Math.floor(colIndex / 3) * 3;
        
        for (let i = subgridStartRow; i < subgridStartRow + 3; i++) {
            for (let j = subgridStartCol; j < subgridStartCol + 3; j++) {
                const c = container.children[i].children[j];
                if (c !== cell && !c.classList.contains('highlight-row') && !c.classList.contains('highlight-col')) {
                    c.classList.add('highlight-subgrid');
                }
            }
        }
        
        lastHighlightedCell = cell;
    }

    function clearHighlights() {
        document.querySelectorAll('.highlight-row, .highlight-col, .highlight-subgrid').forEach(el => {
            el.classList.remove('highlight-row', 'highlight-col', 'highlight-subgrid');
        });
    }

    // Original Sudoku functions with animations
    function generateRandomSudoku() {
        return [
            [5, 3, 0, 0, 7, 0, 0, 0, 0],
            [6, 0, 0, 1, 9, 5, 0, 0, 0],
            [0, 9, 8, 0, 0, 0, 0, 6, 0],
            [8, 0, 0, 0, 6, 0, 0, 0, 3],
            [4, 0, 0, 8, 0, 3, 0, 0, 1],
            [7, 0, 0, 0, 2, 0, 0, 0, 6],
            [0, 6, 0, 0, 0, 0, 2, 8, 0],
            [0, 0, 0, 4, 1, 9, 0, 0, 5],
            [0, 0, 0, 0, 8, 0, 0, 7, 9]
        ];
    }

    function solveSudoku(board) {
        const solvedPuzzle = JSON.parse(JSON.stringify(board));
        solveHelper(solvedPuzzle);
        return solvedPuzzle;
    }

    function solveHelper(board) {
        const emptyCell = findEmptyCell(board);
        if (!emptyCell) {
            return true;
        }

        const [row, col] = emptyCell;
        for (let num = 1; num <= 9; num++) {
            if (isValidMove(board, row, col, num)) {
                board[row][col] = num;
                if (solveHelper(board)) {
                    return true;
                }
                board[row][col] = 0;
            }
        }
        return false;
    }

    function findEmptyCell(board) {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (board[row][col] === 0) {
                    return [row, col];
                }
            }
        }
        return null;
    }

    function isValidMove(board, row, col, num) {
        for (let i = 0; i < 9; i++) {
            if (board[row][i] === num || board[i][col] === num) {
                return false;
            }
        }

        const startRow = Math.floor(row / 3) * 3;
        const startCol = Math.floor(col / 3) * 3;
        for (let i = startRow; i < startRow + 3; i++) {
            for (let j = startCol; j < startCol + 3; j++) {
                if (board[i][j] === num) {
                    return false;
                }
            }
        }
        return true;
    }

    function createSudokuGrid(puzzle) {
        container.innerHTML = '';
        container.classList.add('fade-in');
        
        puzzle.forEach((row, rowIndex) => {
            const rowElement = document.createElement('div');
            rowElement.classList.add('row');
            row.forEach((cell, columnIndex) => {
                const cellElement = document.createElement('input');
                cellElement.classList.add('cell');
                cellElement.classList.add((rowIndex + columnIndex) % 2 === 0 ? 'lightBackground' : 'darkBackground');
                cellElement.type = 'text';
                cellElement.maxLength = 1;

                if (cell !== 0) {
                    cellElement.value = cell;
                    cellElement.readOnly = true;
                    cellElement.style.fontWeight = "bold";
                }

                // Add click event for highlighting
                cellElement.addEventListener('click', function() {
                    highlightRelatedCells(this);
                });

                // Add focus event for keyboard navigation
                cellElement.addEventListener('focus', function() {
                    highlightRelatedCells(this);
                });

                rowElement.appendChild(cellElement);
            });
            container.appendChild(rowElement);
        });
        
        // Remove fade-in class after animation completes
        setTimeout(() => {
            container.classList.remove('fade-in');
        }, 500);
    }

    function animateSolution(solution) {
        const userGrid = getUserInputGrid();
        let delay = 0;
        
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                if (userGrid[i][j] !== solution[i][j]) {
                    const cell = container.children[i].children[j];
                    setTimeout(() => {
                        cell.value = solution[i][j];
                        cell.classList.add('cell-animate');
                        setTimeout(() => {
                            cell.classList.remove('cell-animate');
                        }, 300);
                    }, delay);
                    delay += 50;
                }
            }
        }
    }

    function getUserInputGrid() {
        const grid = [];
        const rows = container.getElementsByClassName('row');
        
        for (let i = 0; i < rows.length; i++) {
            const cells = rows[i].getElementsByClassName('cell');
            const row = [];
            
            for (let j = 0; j < cells.length; j++) {
                let value = cells[j].value;
                row.push(value ? parseInt(value) : 0);
            }
            grid.push(row);
        }
        return grid;
    }

    function checkUserSolution() {
        const userGrid = getUserInputGrid();
        const correctSolution = solveSudoku(JSON.parse(JSON.stringify(initialPuzzle)));

        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                if (userGrid[i][j] !== correctSolution[i][j]) {
                    alert("❌ TRY AGAIN!");
                    return;
                }
            }
        }
        
        stopTimer();
        alert(`✅ CORRECT! Time taken: ${timeDisplay.textContent}`);
    }

    function solvePuzzle() {
        solvedPuzzle = solveSudoku(puzzle);
        animateSolution(solvedPuzzle);
        stopTimer();
    }

    function resetPuzzle() {
        initialPuzzle = generateRandomSudoku();
        puzzle = JSON.parse(JSON.stringify(initialPuzzle));
        solvedPuzzle = [];
        createSudokuGrid(puzzle);
        hintsLeft = 3;
        hintCountDisplay.textContent = hintsLeft;
        startTimer();
    }

    // Initialize the game
    createSudokuGrid(puzzle);
    startTimer();

    // Event listeners
    document.getElementById("solveButton").addEventListener("click", solvePuzzle);
    document.getElementById("resetButton").addEventListener("click", resetPuzzle);
    document.getElementById("checkButton").addEventListener("click", checkUserSolution);
    document.getElementById("hintButton").addEventListener("click", giveHint);

    // Click outside to clear highlights
    document.addEventListener('click', function(e) {
        if (!e.target.classList.contains('cell')) {
            clearHighlights();
            lastHighlightedCell = null;
        }
    });
});