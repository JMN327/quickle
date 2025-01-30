import "./styles.css";
import "./Drag_Drop_List.css";
import storageAvailable from "./modules/browser-storage.js";
import screenManager from "./modules/UI/screen-manager.js";

console.log("Hello World!)");
console.log(`Local Storage available: ${storageAvailable("localStorage")}`);
console.log(`Session Storage available: ${storageAvailable("sessionStorage")}`);

screenManager();

/* let bag = Bag()
bag.fill()
bag.shuffle()
let rack = Rack()
rack.addTiles(bag.draw(rack.spaces.count))
console.table(rack.tiles)
console.log(rack.longestWordLength()) */

/* let board = Board()
console.log(board.positions())
let cell = board.grid[0][0];
console.log(cell.checkList)
console.log(cell.state)
console.table(cell.checkList.validTiles);
cell.checkList.addTile(Direction.HORIZONTAL, Color.RED, Shape.CIRCLE);
cell.checkList.addTile(Direction.HORIZONTAL, Color.RED, Shape.SQUARE);
cell.checkList.addTile(Direction.VERTICAL, Color.GREEN, Shape.CLOVER);
console.table(cell.checkList.validTiles);
console.table(cell.checkList.validTileNames);
cell.checkList.removeTile(Direction.HORIZONTAL, Color.RED, Shape.SQUARE);
console.table(cell.checkList.validTileNames);
cell.checkList.removeTile(Direction.VERTICAL, Color.GREEN, Shape.CLOVER);
console.table(cell.checkList.validTileNames);
cell.checkList.addTile(Direction.VERTICAL, Color.YELLOW, Shape.DIAMOND);
cell.checkList.addTile(Direction.VERTICAL, Color.RED, Shape.DIAMOND);
console.table(cell.checkList.validTileNames);
console.table(cell.checkList.matrix); */

/* let bag = Bag();
let rack = Rack();
let board = Board();
console.table(board.info);
bag.fill();

board.addTile(bag.quickPick(Color.RED, Shape.CIRCLE), 0, 0);
board.addTile(bag.quickPick(Color.RED, Shape.SQUARE), 0, 1);
board.fixTiles()
board.addTile(bag.quickPick(Color.BLUE, Shape.SQUARE), -1, 1);
board.addTile(bag.quickPick(Color.GREEN, Shape.SQUARE), 1, 1);
board.fixTiles()
board.addTile(bag.quickPick(Color.RED, Shape.SQUARE), -1, 0);
board.addTile(bag.quickPick(Color.RED, Shape.CLOVER), -2, 0);
board.addTile(bag.quickPick(Color.RED, Shape.DIAMOND), -3, 0);
board.addTile(bag.quickPick(Color.RED, Shape.STAR), -4, 0);
board.addTile(bag.quickPick(Color.RED, Shape.CROSS), -5, 0);
board.removeTile(-5,0) */

//console.table(board.playableCells(bag.quickPick(Color.RED, Shape.DIAMOND)))

/* let game = GameManager();
game.addPlayer({PlayerType:PlayerType.HUMAN,name:"Elspeth"})
game.addPlayer({PlayerType:PlayerType.HUMAN,name:"Jinny"})
game.addPlayer({PlayerType:PlayerType.HUMAN,name:"Rose"})
game.startGame()
console.log(game.currentPlayer.name)
console.table(game.currentPlayer.rack.tiles)
game.selectTileOnRack(1)
console.table(game.playableTilesForSelection())
game.placeSelectedTileOnBoard(0,0)
console.table(game.board.info)
game.selectTileOnRack(0)
console.table(game.playableTilesForSelection())
 */
