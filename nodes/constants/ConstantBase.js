function ConstantBase() {}

ConstantBase.prototype.getTitle = function () {
  if (this.flags.collapsed) {
    return this.properties.value;
  }
  return this.title;
};
ConstantBase.prototype.setValue = function (v) {
  this.setProperty("value", v);
};

export default ConstantBase;