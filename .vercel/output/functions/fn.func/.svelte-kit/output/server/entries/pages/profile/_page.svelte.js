import { c as create_ssr_component, a as compute_rest_props, g as get_current_component, d as spread, h as escape_attribute_value, e as escape_object, f as add_attribute, p as createEventDispatcher, j as escape, n as null_to_empty, q as each, v as validate_component, m as missing_component, i as subscribe, r as is_promise, t as noop } from "../../../chunks/ssr.js";
import { g as globals, m as metaNamesSdk, a as walletConnected, w as walletAddress } from "../../../chunks/stores.js";
import { f as forwardEventsBuilder, c as classMap, C as CircularProgress } from "../../../chunks/Subtitle.js";
const Paper = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, ["use", "class", "variant", "square", "color", "elevation", "transition", "getElement"]);
  forwardEventsBuilder(get_current_component());
  let { use = [] } = $$props;
  let { class: className = "" } = $$props;
  let { variant = "raised" } = $$props;
  let { square = false } = $$props;
  let { color = "default" } = $$props;
  let { elevation = 1 } = $$props;
  let { transition = false } = $$props;
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
  if ($$props.square === void 0 && $$bindings.square && square !== void 0)
    $$bindings.square(square);
  if ($$props.color === void 0 && $$bindings.color && color !== void 0)
    $$bindings.color(color);
  if ($$props.elevation === void 0 && $$bindings.elevation && elevation !== void 0)
    $$bindings.elevation(elevation);
  if ($$props.transition === void 0 && $$bindings.transition && transition !== void 0)
    $$bindings.transition(transition);
  if ($$props.getElement === void 0 && $$bindings.getElement && getElement !== void 0)
    $$bindings.getElement(getElement);
  return `<div${spread(
    [
      {
        class: escape_attribute_value(classMap({
          [className]: true,
          "smui-paper": true,
          "smui-paper--raised": variant === "raised",
          "smui-paper--unelevated": variant === "unelevated",
          "smui-paper--outlined": variant === "outlined",
          ["smui-paper--elevation-z" + elevation]: elevation !== 0 && variant === "raised",
          "smui-paper--rounded": !square,
          ["smui-paper--color-" + color]: color !== "default",
          "smui-paper-transition": transition
        }))
      },
      escape_object($$restProps)
    ],
    {}
  )}${add_attribute("this", element, 0)}>${slots.default ? slots.default({}) : ``} </div>`;
});
const SvelteTable_svelte_svelte_type_style_lang = "";
const { Object: Object_1 } = globals;
const css$1 = {
  code: "table.svelte-dsaf7t.svelte-dsaf7t{width:100%}.isSortable.svelte-dsaf7t.svelte-dsaf7t{cursor:pointer}.isClickable.svelte-dsaf7t.svelte-dsaf7t{cursor:pointer}tr.svelte-dsaf7t th select.svelte-dsaf7t{width:100%}",
  map: null
};
const SvelteTable = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let colspan;
  let { columns } = $$props;
  let { rows } = $$props;
  let { c_rows = void 0 } = $$props;
  let { sortOrders = [1, -1] } = $$props;
  let { sortBy = "" } = $$props;
  let { sortOrder = sortOrders?.[0] || 1 } = $$props;
  let { filterSelections = {} } = $$props;
  let { expanded = [] } = $$props;
  let { selected = [] } = $$props;
  let { expandRowKey = null } = $$props;
  let { rowKey = expandRowKey } = $$props;
  let { expandSingle = false } = $$props;
  let { selectSingle = false } = $$props;
  let { selectOnClick = false } = $$props;
  let { iconAsc = "▲" } = $$props;
  let { iconDesc = "▼" } = $$props;
  let { iconSortable = "" } = $$props;
  let { iconExpand = "▼" } = $$props;
  let { iconExpanded = "▲" } = $$props;
  let { showExpandIcon = false } = $$props;
  let { classNameTable = "" } = $$props;
  let { classNameThead = "" } = $$props;
  let { classNameTbody = "" } = $$props;
  let { classNameSelect = "" } = $$props;
  let { classNameInput = "" } = $$props;
  let { classNameRow = null } = $$props;
  let { classNameCell = "" } = $$props;
  let { classNameRowSelected = null } = $$props;
  let { classNameRowExpanded = null } = $$props;
  let { classNameExpandedContent = "" } = $$props;
  let { classNameCellExpand = "" } = $$props;
  createEventDispatcher();
  let sortFunction = () => "";
  if (!Array.isArray(expanded))
    throw "'expanded' needs to be an array";
  if (!Array.isArray(selected))
    throw "'selection' needs to be an array";
  if (expandRowKey !== null) {
    console.warn("'expandRowKey' is deprecated in favour of 'rowKey'");
  }
  if (classNameRowSelected && !rowKey) {
    console.error("'rowKey' is needed to use 'classNameRowSelected'");
  }
  let showFilterHeader = columns.some((c) => {
    return !c.hideFilterHeader && (c.filterOptions !== void 0 || c.searchValue !== void 0);
  });
  let filterValues = {};
  let columnByKey;
  const asStringArray = (v) => [].concat(v).filter((v2) => v2 !== null && typeof v2 === "string" && v2 !== "").join(" ");
  const calculateFilterValues = () => {
    filterValues = {};
    columns.forEach((c) => {
      if (typeof c.filterOptions === "function") {
        filterValues[c.key] = c.filterOptions(rows);
      } else if (Array.isArray(c.filterOptions)) {
        filterValues[c.key] = c.filterOptions.map((val) => ({ name: val, value: val }));
      }
    });
  };
  if ($$props.columns === void 0 && $$bindings.columns && columns !== void 0)
    $$bindings.columns(columns);
  if ($$props.rows === void 0 && $$bindings.rows && rows !== void 0)
    $$bindings.rows(rows);
  if ($$props.c_rows === void 0 && $$bindings.c_rows && c_rows !== void 0)
    $$bindings.c_rows(c_rows);
  if ($$props.sortOrders === void 0 && $$bindings.sortOrders && sortOrders !== void 0)
    $$bindings.sortOrders(sortOrders);
  if ($$props.sortBy === void 0 && $$bindings.sortBy && sortBy !== void 0)
    $$bindings.sortBy(sortBy);
  if ($$props.sortOrder === void 0 && $$bindings.sortOrder && sortOrder !== void 0)
    $$bindings.sortOrder(sortOrder);
  if ($$props.filterSelections === void 0 && $$bindings.filterSelections && filterSelections !== void 0)
    $$bindings.filterSelections(filterSelections);
  if ($$props.expanded === void 0 && $$bindings.expanded && expanded !== void 0)
    $$bindings.expanded(expanded);
  if ($$props.selected === void 0 && $$bindings.selected && selected !== void 0)
    $$bindings.selected(selected);
  if ($$props.expandRowKey === void 0 && $$bindings.expandRowKey && expandRowKey !== void 0)
    $$bindings.expandRowKey(expandRowKey);
  if ($$props.rowKey === void 0 && $$bindings.rowKey && rowKey !== void 0)
    $$bindings.rowKey(rowKey);
  if ($$props.expandSingle === void 0 && $$bindings.expandSingle && expandSingle !== void 0)
    $$bindings.expandSingle(expandSingle);
  if ($$props.selectSingle === void 0 && $$bindings.selectSingle && selectSingle !== void 0)
    $$bindings.selectSingle(selectSingle);
  if ($$props.selectOnClick === void 0 && $$bindings.selectOnClick && selectOnClick !== void 0)
    $$bindings.selectOnClick(selectOnClick);
  if ($$props.iconAsc === void 0 && $$bindings.iconAsc && iconAsc !== void 0)
    $$bindings.iconAsc(iconAsc);
  if ($$props.iconDesc === void 0 && $$bindings.iconDesc && iconDesc !== void 0)
    $$bindings.iconDesc(iconDesc);
  if ($$props.iconSortable === void 0 && $$bindings.iconSortable && iconSortable !== void 0)
    $$bindings.iconSortable(iconSortable);
  if ($$props.iconExpand === void 0 && $$bindings.iconExpand && iconExpand !== void 0)
    $$bindings.iconExpand(iconExpand);
  if ($$props.iconExpanded === void 0 && $$bindings.iconExpanded && iconExpanded !== void 0)
    $$bindings.iconExpanded(iconExpanded);
  if ($$props.showExpandIcon === void 0 && $$bindings.showExpandIcon && showExpandIcon !== void 0)
    $$bindings.showExpandIcon(showExpandIcon);
  if ($$props.classNameTable === void 0 && $$bindings.classNameTable && classNameTable !== void 0)
    $$bindings.classNameTable(classNameTable);
  if ($$props.classNameThead === void 0 && $$bindings.classNameThead && classNameThead !== void 0)
    $$bindings.classNameThead(classNameThead);
  if ($$props.classNameTbody === void 0 && $$bindings.classNameTbody && classNameTbody !== void 0)
    $$bindings.classNameTbody(classNameTbody);
  if ($$props.classNameSelect === void 0 && $$bindings.classNameSelect && classNameSelect !== void 0)
    $$bindings.classNameSelect(classNameSelect);
  if ($$props.classNameInput === void 0 && $$bindings.classNameInput && classNameInput !== void 0)
    $$bindings.classNameInput(classNameInput);
  if ($$props.classNameRow === void 0 && $$bindings.classNameRow && classNameRow !== void 0)
    $$bindings.classNameRow(classNameRow);
  if ($$props.classNameCell === void 0 && $$bindings.classNameCell && classNameCell !== void 0)
    $$bindings.classNameCell(classNameCell);
  if ($$props.classNameRowSelected === void 0 && $$bindings.classNameRowSelected && classNameRowSelected !== void 0)
    $$bindings.classNameRowSelected(classNameRowSelected);
  if ($$props.classNameRowExpanded === void 0 && $$bindings.classNameRowExpanded && classNameRowExpanded !== void 0)
    $$bindings.classNameRowExpanded(classNameRowExpanded);
  if ($$props.classNameExpandedContent === void 0 && $$bindings.classNameExpandedContent && classNameExpandedContent !== void 0)
    $$bindings.classNameExpandedContent(classNameExpandedContent);
  if ($$props.classNameCellExpand === void 0 && $$bindings.classNameCellExpand && classNameCellExpand !== void 0)
    $$bindings.classNameCellExpand(classNameCellExpand);
  $$result.css.add(css$1);
  {
    {
      columnByKey = {};
      columns.forEach((col) => {
        columnByKey[col.key] = col;
      });
    }
  }
  colspan = (showExpandIcon ? 1 : 0) + columns.length;
  {
    {
      let col = columnByKey[sortBy];
      if (col !== void 0 && col.sortable === true && typeof col.value === "function") {
        sortFunction = (r) => col.value(r);
      }
    }
  }
  c_rows = rows.filter((r) => {
    return Object.keys(filterSelections).every((f) => {
      let resSearch = null;
      if (columnByKey[f] === void 0) {
        return true;
      } else if (!columnByKey[f]?.searchValue) {
        resSearch = false;
      } else if (filterSelections[f] === "") {
        return true;
      } else if (columnByKey[f].searchValue.length === 1) {
        resSearch = (columnByKey[f].searchValue(r) + "").toLocaleLowerCase().indexOf((filterSelections[f] + "").toLocaleLowerCase()) >= 0;
      } else if (columnByKey[f].searchValue.length === 2) {
        resSearch = !!columnByKey[f].searchValue(r, filterSelections[f] + "");
      }
      let resFilter = resSearch || filterSelections[f] === void 0 || // default to value() if filterValue() not provided in col
      filterSelections[f] === (typeof columnByKey[f].filterValue === "function" ? columnByKey[f].filterValue(r) : columnByKey[f].value(r));
      return resFilter;
    });
  }).map((r) => Object.assign({}, r, {
    // internal row property for sort order
    $sortOn: sortFunction(r),
    // internal row property for expanded rows
    $expanded: rowKey !== null && expanded.indexOf(r[rowKey]) >= 0,
    $selected: rowKey !== null && selected.indexOf(r[rowKey]) >= 0
  })).sort((a, b) => {
    if (!sortBy)
      return 0;
    else if (a.$sortOn > b.$sortOn)
      return sortOrder;
    else if (a.$sortOn < b.$sortOn)
      return -sortOrder;
    return 0;
  });
  {
    {
      if (showFilterHeader && columns && rows) {
        calculateFilterValues();
      }
    }
  }
  return `<table class="${escape(null_to_empty(asStringArray(classNameTable)), true) + " svelte-dsaf7t"}"><thead class="${escape(null_to_empty(asStringArray(classNameThead)), true) + " svelte-dsaf7t"}">${showFilterHeader ? `<tr class="svelte-dsaf7t">${each(columns, (col) => {
    return `<th class="${escape(null_to_empty(asStringArray([col.headerFilterClass])), true) + " svelte-dsaf7t"}">${!col.hideFilterHeader && col.searchValue !== void 0 ? `<input class="${escape(null_to_empty(asStringArray(classNameInput)), true) + " svelte-dsaf7t"}"${add_attribute("placeholder", col.filterPlaceholder, 0)}${add_attribute("value", filterSelections[col.key], 0)}>` : `${!col.hideFilterHeader && filterValues[col.key] !== void 0 ? `<select class="${escape(null_to_empty(asStringArray(classNameSelect)), true) + " svelte-dsaf7t"}"><option${add_attribute("value", void 0, 0)}>${escape(col.filterPlaceholder || "")}</option>${each(filterValues[col.key], (option) => {
      return `<option${add_attribute("value", option.value, 0)}>${escape(option.name)}</option>`;
    })}</select>` : ``}`} </th>`;
  })} ${showExpandIcon ? `<th></th>` : ``}</tr>` : ``} ${slots.header ? slots.header({ sortOrder, sortBy }) : ` <tr>${each(columns, (col) => {
    return `<th class="${escape(null_to_empty(asStringArray([col.sortable ? "isSortable" : "", col.headerClass])), true) + " svelte-dsaf7t"}" tabindex="0">${escape(col.title)} ${sortBy === col.key ? `<!-- HTML_TAG_START -->${sortOrder === 1 ? iconAsc : iconDesc}<!-- HTML_TAG_END -->` : `${col.sortable ? `<!-- HTML_TAG_START -->${iconSortable}<!-- HTML_TAG_END -->` : ``}`} </th>`;
  })} ${showExpandIcon ? `<th></th>` : ``}</tr> `}</thead> <tbody class="${escape(null_to_empty(asStringArray(classNameTbody)), true) + " svelte-dsaf7t"}">${each(c_rows, (row, n) => {
    return `${slots.row ? slots.row({ row, n }) : ` <tr class="${escape(
      null_to_empty(asStringArray([
        typeof classNameRow === "string" ? classNameRow : null,
        typeof classNameRow === "function" ? classNameRow(row, n) : null,
        row.$expanded && classNameRowExpanded,
        row.$selected && classNameRowSelected
      ])),
      true
    ) + " svelte-dsaf7t"}"${add_attribute("tabindex", selectOnClick ? "0" : null, 0)}>${each(columns, (col, colIndex) => {
      return `<td class="${escape(
        null_to_empty(asStringArray([
          typeof col.class === "string" ? col.class : null,
          typeof col.class === "function" ? col.class(row, n, colIndex) : null,
          classNameCell
        ])),
        true
      ) + " svelte-dsaf7t"}">${col.renderComponent ? `${validate_component(col.renderComponent.component || col.renderComponent || missing_component, "svelte:component").$$render($$result, Object_1.assign({}, col.renderComponent.props || {}, { row }, { col }), {}, {})}` : `${col.parseHTML ? `<!-- HTML_TAG_START -->${col.renderValue ? col.renderValue(row, n, colIndex) : col.value(row, n, colIndex)}<!-- HTML_TAG_END -->` : `${escape(col.renderValue ? col.renderValue(row, n, colIndex) : col.value(row, n, colIndex))}`}`} </td>`;
    })} ${showExpandIcon ? `<td class="${escape(null_to_empty(asStringArray(classNameCellExpand)), true) + " svelte-dsaf7t"}"><span class="isClickable svelte-dsaf7t" tabindex="0" role="button"><!-- HTML_TAG_START -->${row.$expanded ? iconExpand : iconExpanded}<!-- HTML_TAG_END --></span> </td>` : ``}</tr> ${row.$expanded ? `<tr class="${escape(null_to_empty(asStringArray(classNameExpandedContent)), true) + " svelte-dsaf7t"}"><td${add_attribute("colspan", colspan, 0)}>${slots.expanded ? slots.expanded({ row, n }) : ``} </td></tr>` : ``} `}`;
  })}</tbody> </table>`;
});
const _page_svelte_svelte_type_style_lang = "";
const css = {
  code: ".address-title.svelte-j7ycs0{font-weight:bold}.profile.svelte-j7ycs0{min-width:60vw}.paper-content.svelte-j7ycs0{padding:1rem;text-align:center}h3.svelte-j7ycs0{margin-top:0}",
  map: null
};
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $metaNamesSdk, $$unsubscribe_metaNamesSdk;
  let $walletConnected, $$unsubscribe_walletConnected;
  let $walletAddress, $$unsubscribe_walletAddress;
  $$unsubscribe_metaNamesSdk = subscribe(metaNamesSdk, (value) => $metaNamesSdk = value);
  $$unsubscribe_walletConnected = subscribe(walletConnected, (value) => $walletConnected = value);
  $$unsubscribe_walletAddress = subscribe(walletAddress, (value) => $walletAddress = value);
  const columns = [
    {
      key: "name",
      title: "Domain Name",
      sortable: true,
      parseHTML: true,
      value: (row) => row.name,
      renderValue: (row) => {
        return `<a href="/domain/${row.name}">${row.name}</a>`;
      }
    },
    {
      key: "parentId",
      title: "Parent",
      sortable: true,
      parseHTML: true,
      value: (row) => row.parentId ?? "",
      renderValue: (row) => {
        if (row.parentId) {
          return `<a href="/domain/${row.parentId}">${row.parentId}</a>`;
        } else {
          return "";
        }
      }
    },
    {
      key: "tokenId",
      title: "Token ID",
      sortable: true,
      value: (row) => row.tokenId
    }
  ];
  async function getDomains(walletAddress2) {
    if (!walletAddress2)
      return [];
    const domains = await $metaNamesSdk.domainRepository.findByOwner(walletAddress2);
    if (domains)
      return domains;
    else
      return [];
  }
  $$result.css.add(css);
  $$unsubscribe_metaNamesSdk();
  $$unsubscribe_walletConnected();
  $$unsubscribe_walletAddress();
  return `<div class="profile content svelte-j7ycs0">${validate_component(Paper, "Paper").$$render($$result, { class: "w-100", variant: "raised" }, {}, {
    default: () => {
      return `<div class="paper-content svelte-j7ycs0">${$walletConnected ? `<h3 class="svelte-j7ycs0" data-svelte-h="svelte-tdzkhd">Profile</h3> <p class="address-title svelte-j7ycs0" data-svelte-h="svelte-11k560z">Wallet address</p> <p>${escape($walletAddress)}</p> <h4 data-svelte-h="svelte-pof7zx">Domains</h4> ${function(__value) {
        if (is_promise(__value)) {
          __value.then(null, noop);
          return ` ${validate_component(CircularProgress, "CircularProgress").$$render(
            $$result,
            {
              style: "height: 32px; width: 32px;",
              indeterminate: true
            },
            {},
            {}
          )} `;
        }
        return function(domains) {
          return ` ${domains.length === 0 ? `<p data-svelte-h="svelte-l193ei">No domains found</p> <a href="/" data-svelte-h="svelte-13dpej2">Register a domain!</a>` : `${validate_component(SvelteTable, "SvelteTable").$$render($$result, { columns, rows: domains }, {}, {})}`} `;
        }(__value);
      }(getDomains($walletAddress))}` : `<h3 class="svelte-j7ycs0" data-svelte-h="svelte-1sary2q">Connect the Wallet</h3> <p data-svelte-h="svelte-wmv1k8">To see your domains</p>`}</div>`;
    }
  })} </div>`;
});
export {
  Page as default
};
