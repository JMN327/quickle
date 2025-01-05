import "./styles.css";
import storageAvailable from "./local-storage.js";
import ClassTemplate from "./class-template.js";

console.log("Hello World!)");
console.log(`Storage available: ${storageAvailable("localStorage")}`);

const x = new ClassTemplate({ exposedVariable1: "mishmash",  });
x.exposedVariable2 = 7;
console.log(x.exposedVariable2, x.exposedVariable1);
