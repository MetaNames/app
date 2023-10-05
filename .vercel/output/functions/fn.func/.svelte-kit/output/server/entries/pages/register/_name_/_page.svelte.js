import { c as create_ssr_component, a as compute_rest_props, g as get_current_component, b as getContext, s as setContext, o as onDestroy, v as validate_component, m as missing_component, d as spread, h as escape_attribute_value, e as escape_object, f as add_attribute, i as subscribe, j as escape } from "../../../../chunks/ssr.js";
import { p as page } from "../../../../chunks/stores2.js";
import { g as globals, m as metaNamesSdk, w as walletAddress, a as walletConnected } from "../../../../chunks/stores.js";
import { B as Button, C as CommonLabel } from "../../../../chunks/Button.js";
import { f as forwardEventsBuilder, c as classMap, S as SmuiElement } from "../../../../chunks/classAdderBuilder.js";
import { C as Content } from "../../../../chunks/ActionIcons.js";
import { MDCIconButtonToggleFoundation } from "@material/icon-button";
import { R as Ripple, d as dispatch } from "../../../../chunks/Ripple.js";
const { Object: Object_1 } = globals;
const IconButton = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let actionProp;
  let $$restProps = compute_rest_props($$props, [
    "use",
    "class",
    "style",
    "ripple",
    "color",
    "toggle",
    "pressed",
    "ariaLabelOn",
    "ariaLabelOff",
    "touch",
    "displayFlex",
    "size",
    "href",
    "action",
    "component",
    "tag",
    "getElement"
  ]);
  const forwardEvents = forwardEventsBuilder(get_current_component());
  let uninitializedValue = () => {
  };
  function isUninitializedValue(value) {
    return value === uninitializedValue;
  }
  let { use = [] } = $$props;
  let { class: className = "" } = $$props;
  let { style = "" } = $$props;
  let { ripple = true } = $$props;
  let { color = void 0 } = $$props;
  let { toggle = false } = $$props;
  let { pressed = uninitializedValue } = $$props;
  let { ariaLabelOn = void 0 } = $$props;
  let { ariaLabelOff = void 0 } = $$props;
  let { touch = false } = $$props;
  let { displayFlex = true } = $$props;
  let { size = "normal" } = $$props;
  let { href = void 0 } = $$props;
  let { action = void 0 } = $$props;
  let element;
  let instance;
  let internalClasses = {};
  let internalStyles = {};
  let internalAttrs = {};
  let context = getContext("SMUI:icon-button:context");
  let ariaDescribedby = getContext("SMUI:icon-button:aria-describedby");
  let { component = SmuiElement } = $$props;
  let { tag = component === SmuiElement ? href == null ? "button" : "a" : void 0 } = $$props;
  let previousDisabled = $$restProps.disabled;
  setContext("SMUI:icon:context", "icon-button");
  let oldToggle = null;
  onDestroy(() => {
    instance && instance.destroy();
  });
  function hasClass(className2) {
    return className2 in internalClasses ? internalClasses[className2] : getElement().classList.contains(className2);
  }
  function addClass(className2) {
    if (!internalClasses[className2]) {
      internalClasses[className2] = true;
    }
  }
  function removeClass(className2) {
    if (!(className2 in internalClasses) || internalClasses[className2]) {
      internalClasses[className2] = false;
    }
  }
  function addStyle(name, value) {
    if (internalStyles[name] != value) {
      if (value === "" || value == null) {
        delete internalStyles[name];
        internalStyles = internalStyles;
      } else {
        internalStyles[name] = value;
      }
    }
  }
  function getAttr(name) {
    var _a;
    return name in internalAttrs ? (_a = internalAttrs[name]) !== null && _a !== void 0 ? _a : null : getElement().getAttribute(name);
  }
  function addAttr(name, value) {
    if (internalAttrs[name] !== value) {
      internalAttrs[name] = value;
    }
  }
  function handleChange(evtData) {
    pressed = evtData.isOn;
  }
  function getElement() {
    return element.getElement();
  }
  if ($$props.use === void 0 && $$bindings.use && use !== void 0)
    $$bindings.use(use);
  if ($$props.class === void 0 && $$bindings.class && className !== void 0)
    $$bindings.class(className);
  if ($$props.style === void 0 && $$bindings.style && style !== void 0)
    $$bindings.style(style);
  if ($$props.ripple === void 0 && $$bindings.ripple && ripple !== void 0)
    $$bindings.ripple(ripple);
  if ($$props.color === void 0 && $$bindings.color && color !== void 0)
    $$bindings.color(color);
  if ($$props.toggle === void 0 && $$bindings.toggle && toggle !== void 0)
    $$bindings.toggle(toggle);
  if ($$props.pressed === void 0 && $$bindings.pressed && pressed !== void 0)
    $$bindings.pressed(pressed);
  if ($$props.ariaLabelOn === void 0 && $$bindings.ariaLabelOn && ariaLabelOn !== void 0)
    $$bindings.ariaLabelOn(ariaLabelOn);
  if ($$props.ariaLabelOff === void 0 && $$bindings.ariaLabelOff && ariaLabelOff !== void 0)
    $$bindings.ariaLabelOff(ariaLabelOff);
  if ($$props.touch === void 0 && $$bindings.touch && touch !== void 0)
    $$bindings.touch(touch);
  if ($$props.displayFlex === void 0 && $$bindings.displayFlex && displayFlex !== void 0)
    $$bindings.displayFlex(displayFlex);
  if ($$props.size === void 0 && $$bindings.size && size !== void 0)
    $$bindings.size(size);
  if ($$props.href === void 0 && $$bindings.href && href !== void 0)
    $$bindings.href(href);
  if ($$props.action === void 0 && $$bindings.action && action !== void 0)
    $$bindings.action(action);
  if ($$props.component === void 0 && $$bindings.component && component !== void 0)
    $$bindings.component(component);
  if ($$props.tag === void 0 && $$bindings.tag && tag !== void 0)
    $$bindings.tag(tag);
  if ($$props.getElement === void 0 && $$bindings.getElement && getElement !== void 0)
    $$bindings.getElement(getElement);
  let $$settled;
  let $$rendered;
  do {
    $$settled = true;
    actionProp = (() => {
      if (context === "data-table:pagination") {
        switch (action) {
          case "first-page":
            return { "data-first-page": "true" };
          case "prev-page":
            return { "data-prev-page": "true" };
          case "next-page":
            return { "data-next-page": "true" };
          case "last-page":
            return { "data-last-page": "true" };
          default:
            return { "data-action": "true" };
        }
      } else if (context === "dialog:header" || context === "dialog:sheet") {
        return { "data-mdc-dialog-action": action };
      } else {
        return { action };
      }
    })();
    {
      if (previousDisabled !== $$restProps.disabled) {
        const elem = getElement();
        if ("blur" in elem) {
          elem.blur();
        }
        previousDisabled = $$restProps.disabled;
      }
    }
    {
      if (element && getElement() && toggle !== oldToggle) {
        if (toggle && !instance) {
          instance = new MDCIconButtonToggleFoundation({
            addClass,
            hasClass,
            notifyChange: (evtData) => {
              handleChange(evtData);
              dispatch(getElement(), "SMUIIconButtonToggle:change", evtData, void 0, true);
            },
            removeClass,
            getAttr,
            setAttr: addAttr
          });
          instance.init();
        } else if (!toggle && instance) {
          instance.destroy();
          instance = void 0;
          internalClasses = {};
          internalAttrs = {};
        }
        oldToggle = toggle;
      }
    }
    {
      if (instance && !isUninitializedValue(pressed) && instance.isOn() !== pressed) {
        instance.toggle(pressed);
      }
    }
    $$rendered = `${validate_component(component || missing_component, "svelte:component").$$render(
      $$result,
      Object_1.assign(
        {},
        { tag },
        {
          use: [
            [
              Ripple,
              {
                ripple,
                unbounded: true,
                color,
                disabled: !!$$restProps.disabled,
                addClass,
                removeClass,
                addStyle
              }
            ],
            forwardEvents,
            ...use
          ]
        },
        {
          class: classMap({
            [className]: true,
            "mdc-icon-button": true,
            "mdc-icon-button--on": !isUninitializedValue(pressed) && pressed,
            "mdc-icon-button--touch": touch,
            "mdc-icon-button--display-flex": displayFlex,
            "smui-icon-button--size-button": size === "button",
            "smui-icon-button--size-mini": size === "mini",
            "mdc-icon-button--reduced-size": size === "mini" || size === "button",
            "mdc-card__action": context === "card:action",
            "mdc-card__action--icon": context === "card:action",
            "mdc-top-app-bar__navigation-icon": context === "top-app-bar:navigation",
            "mdc-top-app-bar__action-item": context === "top-app-bar:action",
            "mdc-snackbar__dismiss": context === "snackbar:actions",
            "mdc-data-table__pagination-button": context === "data-table:pagination",
            "mdc-data-table__sort-icon-button": context === "data-table:sortable-header-cell",
            "mdc-dialog__close": (context === "dialog:header" || context === "dialog:sheet") && action === "close",
            ...internalClasses
          })
        },
        {
          style: Object.entries(internalStyles).map(([name, value]) => `${name}: ${value};`).concat([style]).join(" ")
        },
        {
          "aria-pressed": !isUninitializedValue(pressed) ? pressed ? "true" : "false" : null
        },
        {
          "aria-label": pressed ? ariaLabelOn : ariaLabelOff
        },
        { "data-aria-label-on": ariaLabelOn },
        { "data-aria-label-off": ariaLabelOff },
        { "aria-describedby": ariaDescribedby },
        { href },
        actionProp,
        internalAttrs,
        $$restProps,
        { this: element }
      ),
      {
        this: ($$value) => {
          element = $$value;
          $$settled = false;
        }
      },
      {
        default: () => {
          return `<div class="mdc-icon-button__ripple"></div> ${slots.default ? slots.default({}) : ``}${touch ? `<div class="mdc-icon-button__touch"></div>` : ``}`;
        }
      }
    )}`;
  } while (!$$settled);
  return $$rendered;
});
const Card = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, ["use", "class", "variant", "padded", "getElement"]);
  forwardEventsBuilder(get_current_component());
  let { use = [] } = $$props;
  let { class: className = "" } = $$props;
  let { variant = "raised" } = $$props;
  let { padded = false } = $$props;
  let element;
  function getElement() {
    return element;
  }
  if ($$props.use === void 0 && $$bindings.use && use !== void 0)
    $$bindings.use(use);
  if ($$props.class === void 0 && $$bindings.class && className !== void 0)
    $$bindings.class(className);
  if ($$props.variant === void 0 && $$bindings.variant && variant !== void 0)
    $$bindings.variant(variant);
  if ($$props.padded === void 0 && $$bindings.padded && padded !== void 0)
    $$bindings.padded(padded);
  if ($$props.getElement === void 0 && $$bindings.getElement && getElement !== void 0)
    $$bindings.getElement(getElement);
  return `<div${spread(
    [
      {
        class: escape_attribute_value(classMap({
          [className]: true,
          "mdc-card": true,
          "mdc-card--outlined": variant === "outlined",
          "smui-card--padded": padded
        }))
      },
      escape_object($$restProps)
    ],
    {}
  )}${add_attribute("this", element, 0)}>${slots.default ? slots.default({}) : ``} </div>`;
});
const _page_svelte_svelte_type_style_lang = "";
const css = {
  code: "h2.svelte-diiwzz.svelte-diiwzz,h4.svelte-diiwzz.svelte-diiwzz{margin-top:0;text-align:center}.content.svelte-diiwzz.svelte-diiwzz{max-width:48rem;width:100%}.fees.svelte-diiwzz.svelte-diiwzz{display:flex;flex-direction:column;align-items:center;margin-top:1rem;padding:0 5rem}.fees.svelte-diiwzz .row.svelte-diiwzz{display:flex;flex-direction:row;justify-content:space-between;width:100%}@media(max-width: 768px){.fees.svelte-diiwzz .row.svelte-diiwzz{flex-direction:column;align-items:center;padding-top:1rem}}.submit.svelte-diiwzz.svelte-diiwzz{display:flex;justify-content:center;margin-top:1rem}.years.svelte-diiwzz.svelte-diiwzz{display:flex;justify-content:space-evenly;align-items:center}.years.svelte-diiwzz span.svelte-diiwzz{font-size:xx-large}",
  map: null
};
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let domainName;
  let charsLabel;
  let fees;
  let nameLength;
  let pageName;
  let totalFeesAmount;
  let yearsLabel;
  let $metaNamesSdk, $$unsubscribe_metaNamesSdk;
  let $$unsubscribe_walletAddress;
  let $walletConnected, $$unsubscribe_walletConnected;
  let $page, $$unsubscribe_page;
  $$unsubscribe_metaNamesSdk = subscribe(metaNamesSdk, (value) => $metaNamesSdk = value);
  $$unsubscribe_walletAddress = subscribe(walletAddress, (value) => value);
  $$unsubscribe_walletConnected = subscribe(walletConnected, (value) => $walletConnected = value);
  $$unsubscribe_page = subscribe(page, (value) => $page = value);
  const nameParam = $page.params.name;
  let years = 1;
  $$result.css.add(css);
  domainName = nameParam.endsWith(".meta") ? nameParam : `${nameParam}.meta`;
  charsLabel = nameParam.length > 1 ? "chars" : "char";
  fees = $metaNamesSdk.domainRepository.calculateMintFees(nameParam);
  nameLength = nameParam.length > 5 ? "5+" : nameParam.length;
  pageName = "";
  totalFeesAmount = fees.amount * years;
  yearsLabel = "year";
  $$unsubscribe_metaNamesSdk();
  $$unsubscribe_walletAddress();
  $$unsubscribe_walletConnected();
  $$unsubscribe_page();
  return `${$$result.head += `<!-- HEAD_svelte-11yaobx_START -->${$$result.title = `<title>${escape(pageName)}Meta Names</title>`, ""}<!-- HEAD_svelte-11yaobx_END -->`, ""} <div class="content svelte-diiwzz">${`<div class="container"><h2 class="svelte-diiwzz" data-svelte-h="svelte-d4pubn">Register</h2> ${validate_component(Card, "Card").$$render($$result, {}, {}, {
    default: () => {
      return `${validate_component(Content, "Content").$$render($$result, {}, {}, {
        default: () => {
          return `<div class="card-content"><h4 class="svelte-diiwzz">${escape(domainName)}</h4> <div class="years svelte-diiwzz">${validate_component(IconButton, "IconButton").$$render(
            $$result,
            {
              class: "material-icons",
              disabled: years == 1
            },
            {},
            {
              default: () => {
                return `remove`;
              }
            }
          )} <span class="svelte-diiwzz">${escape(years)} ${escape(yearsLabel)}</span> ${validate_component(IconButton, "IconButton").$$render($$result, { class: "material-icons" }, {}, {
            default: () => {
              return `add`;
            }
          })}</div> <div class="fees svelte-diiwzz"><p class="text-center" data-svelte-h="svelte-1ctqzom">Price breakdown</p> <div class="row svelte-diiwzz"><span>1 year registration for <b>${escape(nameLength)} ${escape(charsLabel)}</b></span> <span>${escape(fees.amount)} ${escape(fees.token)}</span></div> <div class="row svelte-diiwzz"><span data-svelte-h="svelte-19n0bcv">Total (excluding network fees)</span> <span><b>${escape(totalFeesAmount)}</b> ${escape(fees.token)}</span></div></div> <div class="submit svelte-diiwzz">${`${validate_component(Button, "Button").$$render(
            $$result,
            {
              disabled: !$walletConnected,
              variant: "raised"
            },
            {},
            {
              default: () => {
                return `${validate_component(CommonLabel, "Label").$$render($$result, {}, {}, {
                  default: () => {
                    return `Approve fees`;
                  }
                })}`;
              }
            }
          )}`}</div></div>`;
        }
      })}`;
    }
  })}</div>`} </div>`;
});
export {
  Page as default
};
