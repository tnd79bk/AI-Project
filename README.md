# AI-Project
## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development. See Deployment for notes on how to deploy the project on a live system.
Download the repository
```
git clone https://github.com/tnd79bk/AI-Project.git
cd AI-Project
```
### Prerequisites

You will need to have Node.js and npm installed. For instructions on installing Node, please visit [NPM's documentation on installing Node.js](https://docs.npmjs.com/getting-started/installing-node).

### Installing

You can run npm's initialization to install dependencies from `package.json`.

```
npm init
```

### How to Play

You can open file index.html in your browser and play

#### Play Against Computer

To play against the computer, simply make a move. You will play as the white side. The computer will then make a move.

The computer is currently set to look 1,2 or 3 (which you select in depth) moves ahead using minimax with alpha beta pruning.

#### Computer vs Computer

If you'd like to have the computer play the computer, you can press CompVsComp button in your browser, setting the algorithm you'd like to use, and each computer player's 'skill' level.

## Built With

* [Express](https://expressjs.com) - The web framework used
* [chess.js](https://github.com/jhlywa/chess.js) - Chess library
* [chessboard.js](https://github.com/oakmac/chessboardjs) - Chess board visualization

## Authors

* **Tran Ngoc Duc** - *Initial work* - [tnd79bk](https://github.com/tnd79bk)

## Acknowledgments

* Inspired by [Lauri Hartikka's tutorial](https://medium.freecodecamp.org/simple-chess-ai-step-by-step-1d55a9266977)
