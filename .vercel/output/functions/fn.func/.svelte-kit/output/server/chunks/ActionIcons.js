import { a as classAdderBuilder } from "./classAdderBuilder.js";
const Content = classAdderBuilder({
  class: "smui-card__content",
  tag: "div"
});
classAdderBuilder({
  class: "mdc-card__media-content",
  tag: "div"
});
classAdderBuilder({
  class: "mdc-card__action-buttons",
  tag: "div"
});
classAdderBuilder({
  class: "mdc-card__action-icons",
  tag: "div"
});
export {
  Content as C
};
