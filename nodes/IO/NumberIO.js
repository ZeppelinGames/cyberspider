import TinyGraphInstance from "../../tinygraph.js";
import IO from "./IO.js";

export default class NumberIO extends IO {
  constructor(id, placeholder = "", min = -Infinity, max = Infinity) {
    super(id, "number");

    this.inputElement = document.createElement("input");
    this.inputElement.placeholder = placeholder;
    this.inputElement.min = min;
    this.inputElement.max = max;

    this.inputElement.onchange = (e) => {
      this.setValue(Number.parseFloat(e.target.value));
      TinyGraphInstance.compute();
    };
  }

  validate() {
    return !Number.isNaN(Number(this.inputElement.value));
  }

  onMount() {
    this.inputElement.type = "number";
    return this.inputElement;
  }

  onSetCanEdit(canEdit) {
    this.inputElement.disabled = !canEdit;
  }

  onSetValue(value) {
    this.inputElement.value = Number(value);
  }
}
