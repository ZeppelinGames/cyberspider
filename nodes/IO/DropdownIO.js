import TinyGraphInstance from "../../tinygraph.js";
import IO from "./IO.js";

export default class DropdownIO extends IO {
    constructor(id, options) {
        super(id, "dropdown", false);
        this.options = options;

        this.selectElement = document.createElement("select");

        for (const option of options) {
            const optionElement = document.createElement("option");
            optionElement.value = option;
            optionElement.textContent = option;
            this.selectElement.appendChild(optionElement);
        }
        this.selectElement.onchange = (e) => {
            TinyGraphInstance.compute();
        };
        console.log(this.selectElement.value);
    }
    
    validate() {
        return this.options.includes(this.selectElement.value);
    }
    
    onMount() {
        this.selectElement.value = this.options[0];
        return this.selectElement;
    }

    onSetCanEdit(canEdit) {
        this.selectElement.disabled = !canEdit;
    }

    getValue() {
        return this.selectElement.options[this.selectElement.selectedIndex].value;
    }
    onSetValue(value) {
        console.log("DropdownIO onSetValue:", value);
        if (this.options.includes(value)) {
            this.selectElement.value = value;
        }
    }
}