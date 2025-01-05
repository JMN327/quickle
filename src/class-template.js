export default class ClassTemplate {
    #privateVariable1;
    #privateVariable2;
  
    constructor({exposedVariable1 = "default1", exposedVariable2 = "default2" } = {}) {
      this.#privateVariable1 = exposedVariable1;
      this.#privateVariable2 = exposedVariable2;
    }
  
    set exposedVariable1(newValue) {
      this.#privateVariable1 = newValue;
    }
  
    get exposedVariable1() {
      return this.#privateVariable1;
    }
  
    set exposedVariable2(newValue) {
      this.#privateVariable2 = newValue;
    }
  
    get exposedVariable2() {
      return this.#privateVariable2;
    }
  }