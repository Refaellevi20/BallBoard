
'use strict'

const WALL = 'WALL'
const FLOOR = 'FLOOR'
const BALL = 'BALL'
const GAMER = 'GAMER'
const GLUE = 'GLUE'

const GAMER_IMG = '<img src="img/gamer.png">'
const BALL_IMG = '<img src="img/ball.png">'
const GLUE_IMG = '<img src="img/candy.png">'

var gBoard
var gGamerPos
var gBallCount
var gCollectedBalls
var gBallInterval
var gGlueInterval
var gStuck = false

function onInitGame() {
    gGamerPos = { i: 2, j: 9 }
    gBoard = buildBoard()

    gBallCount = 2
    gCollectedBalls = 0
    gStuck = false

    renderBoard(gBoard)

    gBallInterval = setInterval(addBall, 4500)
    gGlueInterval = setInterval(addGlue, 5000)
    updateNeighborCount()
}

function buildBoard() {
    const board = []
    const rowsCount = 10
    const colsCount = 12
    for (var i = 0; i < rowsCount; i++) {
        board[i] = []
        for (var j = 0; j < colsCount; j++) {
            board[i][j] = { type: FLOOR, gameElement: null }
            if (i === 0 || i === rowsCount - 1 ||
                j === 0 || j === colsCount - 1) {
                board[i][j].type = WALL
            }
        }
    }
    board[gGamerPos.i][gGamerPos.j].gameElement = GAMER
    board[5][5].gameElement = BALL
    board[7][2].gameElement = BALL
    board[4][11].type = FLOOR
    board[4][0].type = FLOOR
    board[0][6].type = FLOOR
    board[9][6].type = FLOOR
    return board
}

function renderBoard(board) {
    var strHTML = ''
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>'
        for (var j = 0; j < board[0].length; j++) {
            const currCell = board[i][j]
            var cellClass = getClassName({ i: i, j: j })
            if (currCell.type === FLOOR) cellClass += ' floor'
            else if (currCell.type === WALL) cellClass += ' wall'

            strHTML += `<td class="cell ${cellClass}" onclick="moveTo(${i}, ${j})">`
            if (currCell.gameElement === GAMER) {
                strHTML += GAMER_IMG
            } else if (currCell.gameElement === BALL) {
                strHTML += BALL_IMG
            } else if (currCell.gameElement === GLUE) {
                strHTML += GLUE_IMG
            }
            strHTML += '</td>'
        }
        strHTML += '</tr>'
    }
    const elBoard = document.querySelector('.board')
    elBoard.innerHTML = strHTML
}

function moveTo(i, j) {

    //* condition for the secret  passages
    //* only if the monster trying to move from the secret  passages 
    //* up/down/right/left
    if (gStuck) return
    if (i < 0) i = gBoard.length - 1
    if (i >= gBoard.length) i = 0
    if (j < 0) j = gBoard[i].length - 1
    if (j >= gBoard[i].length) j = 0

    const targetCell = gBoard[i][j]
    if (targetCell.type === WALL) return



    const iAbsDiff = Math.abs(i - gGamerPos.i)
    const jAbsDiff = Math.abs(j - gGamerPos.j)

    //^ In -> if ((iAbsDiff === 1 && jAbsDiff === 0) || (jAbsDiff === 1 && iAbsDiff === 0)
    //^ there is a condition that the monster can only move one step it,
    //^ in other words the monster cannot move to a skip or jump more than one step and because
    //^ of this it was not possible to make secret passages so I created a condition
    //^ that it is allowed to jump in the conditions of the secret passages.
    if ((iAbsDiff === 1 && jAbsDiff === 0) || (jAbsDiff === 1 && iAbsDiff === 0) || (j <= 0) || (i <= 0) || (j >= gBoard[i].length - 1) || (i >= gBoard.length - 1)) {
        if (targetCell.gameElement === BALL) {
            gCollectedBalls++
            updateScore(gCollectedBalls)
            if (gCollectedBalls === gBallCount) {
                endGame()
            } else {
                // playSound()
            }
        } else if (targetCell.gameElement === GLUE) {
            handleGlue()
        }

        gBoard[gGamerPos.i][gGamerPos.j].gameElement = null
        renderCell(gGamerPos, '')

        gBoard[i][j].gameElement = GAMER
        gGamerPos = { i, j }
        renderCell(gGamerPos, GAMER_IMG)
        updateNeighborCount()
    }
}

function renderCell(location, value) {
    const cellSelector = '.' + getClassName(location)
    const elCell = document.querySelector(cellSelector)
    elCell.innerHTML = value
}
//* Move the player by keyboard arrows
function onKey(ev) {
    if (gStuck) return

    const i = gGamerPos.i
    const j = gGamerPos.j
    switch (ev.code) {
        case 'ArrowLeft':
            moveTo(i, j - 1)
            break
        case 'ArrowRight':
            moveTo(i, j + 1)
            break
        case 'ArrowUp':
            moveTo(i - 1, j)
            break
        case 'ArrowDown':
            moveTo(i + 1, j)
            break
    }
}
//* Returns the class name for a specific cell
function getClassName(location) {
    const cellClass = `cell-${location.i}-${location.j}`
    return cellClass
}
//^ run over the entire matrix and insert all the empty cells in the matrix
//^ into the array and then choose a random cell from the array

function addBall() {
    const emptyCells = getEmptyCells()
    if (emptyCells.length === 0) return
    //* only empty cell 
    const randIdx = Math.floor(Math.random() * emptyCells.length)
    const emptyCell = emptyCells[randIdx]
    gBoard[emptyCell.i][emptyCell.j].gameElement = BALL
    renderCell(emptyCell, BALL_IMG)
    gBallCount++
}

function addGlue() {
    const emptyCells = getEmptyCells()
    if (emptyCells.length === 0) return
    const randIdx = Math.floor(Math.random() * emptyCells.length)
    const emptyCell = emptyCells[randIdx]
    gBoard[emptyCell.i][emptyCell.j].gameElement = GLUE
    renderCell(emptyCell, GLUE_IMG)
    setTimeout(() => {
        if (gBoard[emptyCell.i][emptyCell.j].gameElement === GLUE) {
            gBoard[emptyCell.i][emptyCell.j].gameElement = null
            renderCell(emptyCell, '')
        }
    }, 3000)
}

function handleGlue() {
    gStuck = true
    setTimeout(() => {
        gStuck = false
    }, 3000)
}

function getEmptyCells() {
    const emptyCells = []
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[i].length; j++) {
            const cell = gBoard[i][j]
            //* if there is an empty floor (not red) and
            //* if there is no gamePlayer on the cell
            if (cell.type === FLOOR && cell.gameElement === null) {
                emptyCells.push({ i, j })
            }
        }
    }
    return emptyCells
}

function updateScore(score) {
    document.querySelector('.score').innerText = `Balls Collected: ${score}`
}

function endGame() {
    clearInterval(gGlueInterval)
    document.querySelector('.board').style.display = 'none'
    showElement('.game-over')
}

function showElement(selector) {
    const el = document.querySelector(selector)
    el.classList.remove('hide')

}
function hideElement(selector) {
    const el = document.querySelector(selector)
    el.classList.add('hide')
}

function onRestart() {
    document.querySelector('.board').style.display = 'block'
    hideElement('.game-over')
    onInitGame()
    // start the game all over again
}


function countBallsAround(board, rowIdx, colIdx) {
    var ballCount = 0
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (i === rowIdx && j === colIdx) continue
            if (j < 0 || j >= board[0].length) continue
            const currCell = board[i][j]
            if (currCell.gameElement === BALL) ballCount++
        }
    }
    console.log(ballCount)

    return ballCount
}

function updateNeighborCount() {
    const ballCount = countBallsAround(gBoard, gGamerPos.i, gGamerPos.j)
    document.querySelector('.neighbor-count').innerText = `Balls Around: ${ballCount}`
    console.log(ballCount)

}



