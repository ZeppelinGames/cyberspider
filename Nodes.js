import ConstantNumber from "./nodes/constants/ConstantNumber.js";
import ConstantString from "./nodes/constants/ConstantString.js";
import ConstantTextbox from "./nodes/constants/ConstantTextbox.js";
import Concat from "./nodes/data/Concat.js";
import FromBase64 from "./nodes/data/FromBase64.js";
import Substring from "./nodes/data/Substring.js";
import ToBase64 from "./nodes/data/ToBase64.js";
import MathNode from "./nodes/math/MathNode.js";
import ToLower from "./nodes/transform/ToLower.js";
import ToUpper from "./nodes/transform/ToUpper.js";

// Register nodes here
export default function RegisterNodes(tinygraph) {
  // Constants
  tinygraph.registerNodeType(
    ConstantNumber,
    "ConstantNumber",
    "Constant Number",
    "/Constants/"
  );
  tinygraph.registerNodeType(
    ConstantString,
    "ConstantString",
    "Constant String",
    "/Constants/"
  );
  tinygraph.registerNodeType(
    ConstantTextbox,
    "ConstantTextbox",
    "Constant Textbox",
    "/Constants/"
  );

  // Data
  tinygraph.registerNodeType(Substring, "Substring", "Substring", "/Data/");
  tinygraph.registerNodeType(Concat, "Concat", "Concat", "/Data/");
  tinygraph.registerNodeType(ToBase64, "ToBase64", "To Base64", "/Data/");
  tinygraph.registerNodeType(FromBase64, "FromBase64", "From Base64", "/Data/");

  // Transformation
  tinygraph.registerNodeType(ToLower, "ToLower", "To Lowercase", "/Transform/");
  tinygraph.registerNodeType(ToUpper, "ToUpper", "To Uppercase", "/Transform/");

  // Math
  tinygraph.registerNodeType(MathNode, "Math", "Math", "/Math/");
}
