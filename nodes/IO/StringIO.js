import TinyGraphInstance from "../../tinygraph.js";
import IO from "./IO.js";

export default class StringIO extends IO {
  constructor(id, placeholder = "") {
    super(id, "string");

    this.inputElement = document.createElement("input");
    this.inputElement.placeholder = placeholder;

    this.inputElement.oninput = (e) => {
      this.setValue(e.target.value);
      TinyGraphInstance.compute();
    };
  }

  onMount() {
    this.inputElement.type = "text";
    return this.inputElement;
  }

  onSetCanEdit(canEdit) {
    this.inputElement.disabled = !canEdit;
  }

  onSetValue(value) {
    this.inputElement.value = value;
  }
}