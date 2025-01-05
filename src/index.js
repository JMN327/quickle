import "./styles.css";
import storageAvailable from "./local-storage.js";
import {addBasicElement, addTileElement} from "./basicElement.js";

console.log("Hello World!)");
console.log(`Storage available: ${storageAvailable("localStorage")}`);

let body = document.querySelector("body")

let pallet = addBasicElement("div", ["pallet"], body)
addTileElement("square", "red", pallet)
addTileElement("clover", "blue", pallet)




