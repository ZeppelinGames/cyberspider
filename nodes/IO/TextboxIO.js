import TinyGraphInstance from "../../tinygraph.js";
import IO from "./IO.js";

export default class TextboxIO extends IO {
    constructor(id) {
        super(id, "string");
        this.inputElement = document.createElement("textarea");
        this.inputElement.oninput = (e) => {
            this.setValue(e.target.value);
            TinyGraphInstance.compute();
        }
    }

    onMount() {
        return this.inputElement;
    }
    onSetCanEdit(canEdit) {
        this.inputElement.disabled = !canEdit;
    }
    onSetValue(value) {
        this.inputElement.value = value;
    }
}