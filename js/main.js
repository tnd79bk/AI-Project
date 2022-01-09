var STACK_SIZE = 100;
var board = null;
var $board = $('#myBoard');
var game = new Chess();
var globalSum = 0;
var whiteSquareGrey = '#a9a9a9';
var blackSquareGrey = '#696969';

var squareClass = 'square-55d63';
var squareToHighlight = null;
var colorToHighlight = null;
var positionCount;

var config = {
  draggable: true,
  position: 'start',
  onDragStart: onDragStart,
  onDrop: onDrop,
  onMouseoutSquare: onMouseoutSquare,
  onMouseoverSquare: onMouseoverSquare,
  onSnapEnd: onSnapEnd,
};
board = Chessboard('myBoard', config);

timer = null;

var weights = { p: 100, n: 280, b: 320, r: 479, q: 929, k: 60000 };
var pst_w = {
  p: [
    [100, 100, 100, 100, 105, 100, 100, 100],
    [78, 83, 86, 73, 102, 82, 85, 90],
    [7, 29, 21, 44, 40, 31, 44, 7],
    [-17, 16, -2, 15, 14, 0, 15, -13],
    [-26, 3, 10, 9, 6, 1, 0, -23],
    [-22, 9, 5, -11, -10, -2, 3, -19],
    [-31, 8, -7, -37, -36, -14, 3, -31],
    [0, 0, 0, 0, 0, 0, 0, 0],
  ],
  n: [
    [-66, -53, -75, -75, -10, -55, -58, -70],
    [-3, -6, 100, -36, 4, 62, -4, -14],
    [10, 67, 1, 74, 73, 27, 62, -2],
    [24, 24, 45, 37, 33, 41, 25, 17],
    [-1, 5, 31, 21, 22, 35, 2, 0],
    [-18, 10, 13, 22, 18, 15, 11, -14],
    [-23, -15, 2, 0, 2, 0, -23, -20],
    [-74, -23, -26, -24, -19, -35, -22, -69],
  ],
  b: [
    [-59, -78, -82, -76, -23, -107, -37, -50],
    [-11, 20, 35, -42, -39, 31, 2, -22],
    [-9, 39, -32, 41, 52, -10, 28, -14],
    [25, 17, 20, 34, 26, 25, 15, 10],
    [13, 10, 17, 23, 17, 16, 0, 7],
    [14, 25, 24, 15, 8, 25, 20, 15],
    [19, 20, 11, 6, 7, 6, 20, 16],
    [-7, 2, -15, -12, -14, -15, -10, -10],
  ],
  r: [
    [35, 29, 33, 4, 37, 33, 56, 50],
    [55, 29, 56, 67, 55, 62, 34, 60],
    [19, 35, 28, 33, 45, 27, 25, 15],
    [0, 5, 16, 13, 18, -4, -9, -6],
    [-28, -35, -16, -21, -13, -29, -46, -30],
    [-42, -28, -42, -25, -25, -35, -26, -46],
    [-53, -38, -31, -26, -29, -43, -44, -53],
    [-30, -24, -18, 5, -2, -18, -31, -32],
  ],
  q: [
    [6, 1, -8, -104, 69, 24, 88, 26],
    [14, 32, 60, -10, 20, 76, 57, 24],
    [-2, 43, 32, 60, 72, 63, 43, 2],
    [1, -16, 22, 17, 25, 20, -13, -6],
    [-14, -15, -2, -5, -1, -10, -20, -22],
    [-30, -6, -13, -11, -16, -11, -16, -27],
    [-36, -18, 0, -19, -15, -15, -21, -38],
    [-39, -30, -31, -13, -31, -36, -34, -42],
  ],
  k: [
    [4, 54, 47, -99, -99, 60, 83, -62],
    [-32, 10, 55, 56, 56, 55, 10, 3],
    [-62, 12, -57, 44, -67, 28, 37, -31],
    [-55, 50, 11, -4, -19, 13, 0, -49],
    [-55, -43, -52, -28, -51, -47, -8, -50],
    [-47, -42, -43, -79, -64, -32, -29, -32],
    [-4, 3, -14, -50, -57, -18, 13, 4],
    [17, 30, -3, -14, 6, -1, 40, 18],
  ],
};
var pst_b = {
  p: pst_w['p'].slice().reverse(),
  n: pst_w['n'].slice().reverse(),
  b: pst_w['b'].slice().reverse(),
  r: pst_w['r'].slice().reverse(),
  q: pst_w['q'].slice().reverse(),
  k: pst_w['k'].slice().reverse(),
};

var pstOpponent = { w: pst_b, b: pst_w };
var pstSelf = { w: pst_w, b: pst_b };

function evaluateBoard(game, move, prevSum, color) {

  if (game.in_checkmate()) {
    if (move.color === color) {
      return 10 ** 10;
    }
    else {
      return -(10 ** 10);
    }
  }

  if (game.in_draw() || game.in_threefold_repetition() || game.in_stalemate()) {
    return 0;
  }

  if (game.in_check()) {
    if (move.color === color) {
      prevSum += 50;
    }
    else {
      prevSum -= 50;
    }
  }

  var from = [
    8 - parseInt(move.from[1]),
    move.from.charCodeAt(0) - 'a'.charCodeAt(0),
  ];
  var to = [
    8 - parseInt(move.to[1]),
    move.to.charCodeAt(0) - 'a'.charCodeAt(0),
  ];

  if ('captured' in move) {
    // Opponent piece was captured
    if (move.color === color) {
      prevSum +=
        weights[move.captured] +
        pstOpponent[move.color][move.captured][to[0]][to[1]];
    }
    // Our piece was captured
    else {
      prevSum -=
        weights[move.captured] +
        pstSelf[move.color][move.captured][to[0]][to[1]];
    }
  }

  if (move.flags.includes('p')) {
    move.promotion = 'q';

    // Our piece was promoted
    if (move.color === color) {
      prevSum -=
        weights[move.piece] + pstSelf[move.color][move.piece][from[0]][from[1]];
      prevSum +=
        weights[move.promotion] +
        pstSelf[move.color][move.promotion][to[0]][to[1]];
    }
    // Opponent piece was promoted
    else {
      prevSum +=
        weights[move.piece] + pstSelf[move.color][move.piece][from[0]][from[1]];
      prevSum -=
        weights[move.promotion] +
        pstSelf[move.color][move.promotion][to[0]][to[1]];
    }
  } else {
    if (move.color !== color) {
      prevSum += pstSelf[move.color][move.piece][from[0]][from[1]];
      prevSum -= pstSelf[move.color][move.piece][to[0]][to[1]];
    } else {
      prevSum -= pstSelf[move.color][move.piece][from[0]][from[1]];
      prevSum += pstSelf[move.color][move.piece][to[0]][to[1]];
    }
  }

  return prevSum;
}

function minimax(game, depth, alpha, beta, isMaximizingPlayer, sum, color) {
  positionCount++;
  var children = game.ugly_moves({ verbose: true });

  // Sort moves randomly
  children.sort(function (a, b) {
    return 0.5 - Math.random();
  });

  var currMove;
  if (depth === 0 || children.length === 0) {
    return [null, sum];
  }

  var maxValue = Number.NEGATIVE_INFINITY;
  var minValue = Number.POSITIVE_INFINITY;
  var bestMove;
  for (var i = 0; i < children.length; i++) {
    currMove = children[i];

    var currPrettyMove = game.ugly_move(currMove);
    var newSum = evaluateBoard(game, currPrettyMove, sum, color);
    var [childBestMove, childValue] = minimax(
      game,
      depth - 1,
      alpha,
      beta,
      !isMaximizingPlayer,
      newSum,
      color
    );

    game.undo();

    if (isMaximizingPlayer) {
      if (childValue > maxValue) {
        maxValue = childValue;
        bestMove = currPrettyMove;
      }
      if (childValue > alpha) {
        alpha = childValue;
      }
    } else {
      if (childValue < minValue) {
        minValue = childValue;
        bestMove = currPrettyMove;
      }
      if (childValue < beta) {
        beta = childValue;
      }
    }

    // Alpha-beta pruning
    if (alpha >= beta) {
      break;
    }
  }

  if (isMaximizingPlayer) {
    return [bestMove, maxValue];
  } else {
    return [bestMove, minValue];
  }
}

function checkStatus(color) {
  if (game.in_checkmate()) {
    var modal = document.getElementById("myModal");
    modal.style.display = "block";

    var btn = document.getElementById("resetBtn2");
    btn.onclick = function () {
      modal.style.display = "none";
      reset()
    }

    var span = document.getElementsByClassName("close")[0];
    span.onclick = function () {
      modal.style.display = "none";
    }

    window.onclick = function (event) {
      if (event.target == modal) {
        modal.style.display = "none";
      }
    }

    $('#status').html(`<b>Checkmate!</b>.`);
  } else if (game.insufficient_material()) {
    $('#status').html(`It's a <b>draw!</b> (Insufficient Material)`);
  } else if (game.in_threefold_repetition()) {
    $('#status').html(`It's a <b>draw!</b> (Threefold Repetition)`);
  } else if (game.in_stalemate()) {
    $('#status').html(`It's a <b>draw!</b> (Stalemate)`);
  } else if (game.in_draw()) {
    $('#status').html(`It's a <b>draw!</b> (50-move Rule)`);
  } else if (game.in_check()) {
    $('#status').html(`Oops, <b>${color}</b> is in <b>check!</b>`);
    return false;
  } else {
    $('#status').html(`No check, checkmate, or draw.`);
    return false;
  }
  return true;
}

function updateAdvantage() {
  if (globalSum > 0) {
    $('#advantageColor').text('Black');
    $('#advantageNumber').text(globalSum);
  } else if (globalSum < 0) {
    $('#advantageColor').text('White');
    $('#advantageNumber').text(-globalSum);
  } else {
    $('#advantageColor').text('Neither side');
    $('#advantageNumber').text(globalSum);
  }
}


function getBestMove(game, color, currSum) {
  positionCount = 0;

  if (color === 'b') {
    var depth = parseInt($('#search-depth').find(':selected').text());
  } else {
    var depth = parseInt($('#search-depth-white').find(':selected').text());
  }

  var d1 = new Date().getTime();
  var [bestMove, bestMoveValue] = minimax(
    game,
    depth,
    Number.NEGATIVE_INFINITY,
    Number.POSITIVE_INFINITY,
    true,
    currSum,
    color
  );
  var d2 = new Date().getTime();
  var moveTime = d2 - d1;
  var positionsPerS = (positionCount * 1000) / moveTime;

  $('#position-count').text(positionCount);
  $('#time').text(moveTime / 1000);
  $('#positions-per-s').text(Math.round(positionsPerS));

  return [bestMove, bestMoveValue];
}

function makeBestMove(color) {
  if (color === 'b') {
    var move = getBestMove(game, color, globalSum)[0];
  } else {
    var move = getBestMove(game, color, -globalSum)[0];
  }

  globalSum = evaluateBoard(game, move, globalSum, 'b');
  updateAdvantage();

  game.move(move);
  board.position(game.fen());

  if (color === 'b') {
    checkStatus('black');

    // Highlight black move
    $board.find('.' + squareClass).removeClass('highlight-black');
    $board.find('.square-' + move.from).addClass('highlight-black');
    squareToHighlight = move.to;
    colorToHighlight = 'black';

    $board
      .find('.square-' + squareToHighlight)
      .addClass('highlight-' + colorToHighlight);
  } else {
    checkStatus('white');

    // Highlight white move
    $board.find('.' + squareClass).removeClass('highlight-white');
    $board.find('.square-' + move.from).addClass('highlight-white');
    squareToHighlight = move.to;
    colorToHighlight = 'white';

    $board
      .find('.square-' + squareToHighlight)
      .addClass('highlight-' + colorToHighlight);
  }
}

function compVsComp(color) {
  if (!checkStatus({ w: 'white', b: 'black' }[color])) {
    timer = window.setTimeout(function () {
      makeBestMove(color);
      if (color === 'w') {
        color = 'b';
      } else {
        color = 'w';
      }
      compVsComp(color);
    }, 250);
  }
}

function reset() {
  game.reset();
  globalSum = 0;
  $('#status').html(`No check, checkmate, or draw.`);
  $board.find('.' + squareClass).removeClass('highlight-white');
  $board.find('.' + squareClass).removeClass('highlight-black');
  $board.find('.' + squareClass).removeClass('highlight-hint');
  board.position(game.fen());
  $('#advantageColor').text('Neither side');
  $('#advantageNumber').text(globalSum);

  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
}

$('#startBtn').on('click', function () {
  reset();
});

$('#compVsCompBtn').on('click', function () {
  reset();
  compVsComp('w');
});
$('#resetBtn').on('click', function () {
  reset();
});

var undo_stack = [];

function undo() {
  var move = game.undo();
  undo_stack.push(move);

  if (undo_stack.length > STACK_SIZE) {
    undo_stack.shift();
  }
  board.position(game.fen());
}

$('#undoBtn').on('click', function () {
  if (game.history().length >= 2) {
    $board.find('.' + squareClass).removeClass('highlight-white');
    $board.find('.' + squareClass).removeClass('highlight-black');
    $board.find('.' + squareClass).removeClass('highlight-hint');

    undo();
    window.setTimeout(function () {
      undo();
      window.setTimeout(function () {
        showHint();
      }, 250);
    }, 250);
  } else {
    alert('Nothing to undo.');
  }
});

function redo() {
  game.move(undo_stack.pop());
  board.position(game.fen());
}

$('#redoBtn').on('click', function () {
  if (undo_stack.length >= 2) {
    redo();
    window.setTimeout(function () {
      redo();
      window.setTimeout(function () {
        showHint();
      }, 250);
    }, 250);
  } else {
    alert('Nothing to redo.');
  }
});

$('#showHint').change(function () {
  window.setTimeout(showHint, 250);
});

function showHint() {
  var showHint = document.getElementById('showHint');
  $board.find('.' + squareClass).removeClass('highlight-hint');

  if (showHint.checked) {
    var move = getBestMove(game, 'w', -globalSum)[0];

    $board.find('.square-' + move.from).addClass('highlight-hint');
    $board.find('.square-' + move.to).addClass('highlight-hint');
  }
}

function removeGreySquares() {
  $('#myBoard .square-55d63').css('background', '');
}

function greySquare(square) {
  var $square = $('#myBoard .square-' + square);

  var background = whiteSquareGrey;
  if ($square.hasClass('black-3c85d')) {
    background = blackSquareGrey;
  }

  $square.css('background', background);
}

function onDragStart(source, piece) {
  if (game.game_over()) return false;

  if (
    (game.turn() === 'w' && piece.search(/^b/) !== -1) ||
    (game.turn() === 'b' && piece.search(/^w/) !== -1)
  ) {
    return false;
  }
}

function onDrop(source, target) {
  undo_stack = [];
  removeGreySquares();

  // see if the move is legal
  var move = game.move({
    from: source,
    to: target,
    promotion: 'q',
  });

  // Illegal move
  if (move === null) return 'snapback';

  globalSum = evaluateBoard(game, move, globalSum, 'b');
  updateAdvantage();

  // Highlight latest move
  $board.find('.' + squareClass).removeClass('highlight-white');

  $board.find('.square-' + move.from).addClass('highlight-white');
  squareToHighlight = move.to;
  colorToHighlight = 'white';

  $board
    .find('.square-' + squareToHighlight)
    .addClass('highlight-' + colorToHighlight);

  if (!checkStatus('black'));
  {
    // Make the best move for black
    window.setTimeout(function () {
      makeBestMove('b');
      window.setTimeout(function () {
        showHint();
      }, 250);
    }, 250);
  }
}

function onMouseoverSquare(square, piece) {
  // get list of possible moves for this square
  var moves = game.moves({
    square: square,
    verbose: true,
  });

  // exit if there are no moves available for this square
  if (moves.length === 0) return;

  // highlight the square they moused over
  greySquare(square);

  // highlight the possible squares for this piece
  for (var i = 0; i < moves.length; i++) {
    greySquare(moves[i].to);
  }
}

function onMouseoutSquare(square, piece) {
  removeGreySquares();
}

function onSnapEnd() {
  board.position(game.fen());
}
