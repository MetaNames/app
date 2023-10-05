import { a as classAdderBuilder } from "./classAdderBuilder.js";
const HelperLine = classAdderBuilder({
  class: "mdc-text-field-helper-line",
  tag: "div"
});
const Prefix = classAdderBuilder({
  class: "mdc-text-field__affix mdc-text-field__affix--prefix",
  tag: "span"
});
const Suffix = classAdderBuilder({
  class: "mdc-text-field__affix mdc-text-field__affix--suffix",
  tag: "span"
});
export {
  HelperLine as H,
  Prefix as P,
  Suffix as S
};
