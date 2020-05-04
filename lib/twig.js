const humanizeString = require('humanize-string');

const Twig = {
    route(route) {
        Utils.getRoute(route)
    },
    menu(menu) {
        let icon = menu.icon ? `<i class="menu ${menu.icon ? menu.icon : 'folder'} icon"></i>` : '';
        if (menu.items) {
            let childs = menu.items.map(el => Utils.twig.menu(el));
            return `<a class="title item">${icon} ${menu.text}<i class="dropdown icon"></i></a>
            <div class="item content">
                ${childs.join("\n")}
            </div>`;
        }

        let target = menu.target ? `data-target="${menu.target}"` : "";
        return `<a class="item mie-action" data-location="${menu.location || Utils.getRoute(menu.route)}" ${target}>${icon} ${menu.text}</a>`
    },
    smenu(menu) {
        const icon = menu.icon ? `<i class="${menu.icon ? menu.icon : 'folder'} icon"></i>` : '';
        const target = menu.target ? `data-target="${menu.target}"` : "";
        let content = "";
        if (menu.items) {
            let subs = menu.items.map(el => {
                let action = Object.assign({}, el, { className: 'item' });
                return Utils.twig.action(action);
            });
            content = `${subs.join("")}`;
        } else {
            let action = Object.assign({}, menu, { className: 'item' });
            content = Utils.twig.action(action);
        }
        return `<div class="ui dropdown item displaynone smenu">
                    ${icon}
                    <div class="menu">
                        ${content}
                    </div>
                </div>`
    },
    form(form) {
        let csrfInput = form.csrfToken ? `<input type="hidden" name="_csrf" value="${form.csrfToken}">` : '';
        let items = form.items.map(el => Utils.twig.form_row(el, form.editMode));
        let actionbars = form.actionbars.length ? `<div id="action-bar">${form.actionbars.join("")}</div>` : '';
        let formContent = form.editMode ?
            `<form id="${form.name}" name="${form.name}" class="ui form" action="${form.action}" method="POST">
            ${csrfInput}
            ${items.join("")}
            ${actionbars}
        </form>`
            :
            `<div class="ui form">
            ${items.join("")}
            ${actionbars}
        </div>`;

        return `
        <div class="ui segment form-container">
            <div class="ui huge top attached label form-title">${form.title}</div>
            ${formContent}
        </div>`;
    },
    form_row(item, editMode = true) {
        if (item.hide) return "";

        const config = Object.assign({}, item);
        config.required = config.required ? 'required' : '';
        config.disabled = config.disabled ? 'disabled' : '';
        config.editMode = editMode;

        const widget = Utils.twig.widget(config);

        return `<div class="field">
                    <label>${item.label}</label>
                    ${widget}
                </div>`;
    },
    widget(config) {
        config.value = config.value ? config.value : '';
        if (typeof Utils.twig[config.type] === "function")
            return Utils.twig[config.type](config);
        else
            if (config.editMode)
                return `<input type="${config.type}" name="${config.name}" id="${config.id}" class="${config.className}" value="${config.value}" ${config.required} ${config.disabled}>`;
            else
                return `<p>${config.value}</p>`;
    },
    computed(config) {
        let value = typeof config.display === "function" ? config.display(config.value) : (config.hasOwnProperty('display') ? config.display : config.value);

        return `<p>${value}</p>`;
    },
    textarea(config) {
        if (config.editMode)
            return `<textarea name="${config.name}" id="${config.id}" class="${config.className}" ${config.required} ${config.disabled}>${config.value}</textarea>`;
        else
            return `<p>${config.value}</p>`;
    },
    date(config) {
        if (config.editMode)
            return `<div class="ui calendar date">
                        <div class="ui input">
                            <input name="${config.name}" id="${config.id}" class="${config.className}" value="${config.value}" ${config.required} ${config.disabled}>
                        </div>
                    </div>`;
        else
            return `<p>${config.value ? new Date(config.value).toLocaleString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : ''}</p>`;
    },
    select(config) {
        const placeholder = config.placeholder ? config.placeholder : config.label;
        const multiple = config.hasOwnProperty('multiple') && config.multiple ? 'multiple' : '';
        const values = multiple ? (config.value ? config.value : []) : [config.value];
        const dataset = !config.dataset ? [] : Object.keys(config.dataset).map(el => `data-${el}="${config.dataset[el]}"`);
        const options = !Array.isArray(config.options) ? [] : config.options.map(el => {
            let value = typeof el === 'string' ? el : el.value;
            let text = typeof el === 'string' ? el : el.text;

            let selected = values.indexOf(value) !== -1 ? 'selected' : '';
            return `<option value="${value}" ${selected}>${text}</option>`;
        });

        options.unshift(`<option value="">${placeholder}</option>`)

        if (config.editMode)
            return `<select name="${config.name}" id="${config.id}" class="ui search dropdown ${config.className}" ${multiple} ${dataset.join("")} ${config.required} ${config.disabled}>
                    ${options.join("")}
                </select>`;
        else
            return `<p>${config.value}</p>`;
    },
    checkbox(config) {
        let innerLabel = config.innerLabel ? `<label>${config.innerLabel}</label>` : '';
        let checked = config.value ? 'checked' : '';
        if (config.editMode)
            return `<div class="ui checkbox checked">
                        <input type="checkbox" name="${config.name}" id="${config.id}" tabindex="0" class="hidden" ${checked} ${config.required} ${config.disabled}>
                        ${innerLabel}
                    </div>`
        else
            return `<p>${config.value && innerLabel ? innerLabel : config.value}</p>`;
    },
    toggle(config) {
        let innerLabel = config.innerLabel ? `<label>${config.innerLabel}</label>` : '';
        let checked = config.value ? 'checked' : '';
        if (config.editMode)
            return `<div class="ui toggle checkbox checked">
                        <input type="checkbox" name="${config.name}" id="${config.id}" tabindex="0" class="hidden" ${checked} ${config.required} ${config.disabled}>
                        ${innerLabel}
                    </div>`
        else
            return `<p>${config.value && innerLabel ? innerLabel : config.value}</p>`;
    },
    radio(config) {
        const options = !Array.isArray(config.options) ? [] : config.options.map(el => {
            let selected = el === config.value ? 'checked ' : '';
            return `<div class="field">
                        <div class="ui radio checkbox checked">
                        <input type="radio" name="${config.name}" ${selected} tabindex="0" class="hidden" value="${el}" ${config.required} ${config.disabled}>
                        <label>${el}</label>
                        </div>
                    </div>`;
        });

        if (config.editMode)
            return options.join("");
        else
            return `<p>${config.value}</p>`;
    },
    model(config) {
        let refCfg = Object.assign({}, config);
        refCfg.multiple = refCfg.hasOwnProperty('multiple') ? refCfg.multiple : false;
        if (refCfg.multiple) {
            refCfg.value = Array.isArray(refCfg.value) ? refCfg.value : (refCfg.value ? [refCfg.value] : []);
            refCfg.options = refCfg.value.map(el => ({ value: el._id, text: el[refCfg.display] }));
            refCfg.value = refCfg.value.map(el => refCfg.editMode ? el._id : el[refCfg.display]);
        } else {
            refCfg.options = refCfg.value ? [{ value: refCfg.value._id, text: refCfg.value[refCfg.display] }] : [];
            refCfg.value = refCfg.value ? (refCfg.editMode ? refCfg.value._id : refCfg.value[refCfg.display]) : '';
        }

        refCfg.dataset = { type: 'model', key: config.key }
        return Utils.twig.select(refCfg);
    },
    items(config) {
        const items = config.items;
        const values = Array.isArray(config.value) ? config.value : (config.value ? [config.value] : []);
        const table = Utils.twig.table(config, values);
        let subForm = [];
        const content = Object.keys(items).map(el => {
            subForm.push({ key: items[el].key, type: items[el].type, id: items[el].id })
            return Utils.twig.form_row(items[el]);
        });

        if (config.editMode)
            return `<div id="${config.id}" class="form-items">
                        <button type="button" class="mini ui button" onclick="formItems('${config.id}').open()"><i class="plus circle icon"></i> Add</button>
                        ${table}
                        <div id="${config.id}_modal" class="tiny ui modal" data-items="${encodeURI(JSON.stringify(subForm))}">
                            <div class="header"><i class="wpforms icon"></i> ${config.label}</div>
                            <div class="content">
                                <div class="ui form">
                                    ${content.join("")}
                                </div>
                            </div>
                            <div class="actions">
                                <button class="ui green labeled icon button approve btn-approve">
                                    <i class="check circle icon"></i> Save
                                </button>
                                <button class="ui red right labeled icon button cancel btn-cancel">
                                    <i class="times circle icon"></i> Cancel
                                </button>
                            </div>
                        </div>
                        <textarea id="${config.id}_value" name="${config.name}" style="display:none">${JSON.stringify(values)}</textarea>
                    </div>`;
        else
            return `<div id="${config.id}" class="form-items">
                    ${table}
                    <div id="${config.id}_modal" class="tiny ui modal" data-items="${encodeURI(JSON.stringify(subForm))}" data-values="${encodeURI(JSON.stringify(values))}">
                        <div class="header"><i class="wpforms icon"></i> ${config.label}</div>
                        <div class="content">
                            <div class="ui form">
                                ${content.join("")}
                            </div>
                        </div>
                        <div class="actions">
                            <button class="ui green labeled icon button approve btn-approve">
                                <i class="check circle icon"></i> Save
                            </button>
                            <button class="ui red right labeled icon button cancel btn-cancel">
                                <i class="times circle icon"></i> Cancel
                            </button>
                        </div>
                    </div>
                </div>`;
    },
    table(config) {
        const columns = config.items;
        let headers = columns.map(col => {
            let label = col.label ? col.label : humanizeString(col);
            return `<th>${label}</th>`;
        });

        if (config.editMode) headers.push(`<th>Action</th>`);

        return `<table id="${config.id}_table" class="ui celled table">
                    <thead><tr>${headers.join("")}</tr></thead>
                    <tbody></tbody>
                </table>`;
    },
    action(action) {
        let type = action.type || 'link';
        let icon = action.icon ? `<i class="${action.icon} icon"></i>` : '';
        let className = action.className ? action.className + ' mie-action' : 'mie-action';

        if (type === "link") {
            let route = action.route && Utils.routes[action.route] ? Utils.routes[action.route].path : null;
            let target = action.target ? `data-target="${action.target}"` : "";
            return `<a class="${className}"  data-location="${action.location || route}" ${target}>${icon} ${action.text}</a>`
        }

        if (type === "linkButton") {
            className += " mini ui button";
            let route = action.route && Utils.routes[action.route] ? Utils.routes[action.route].path : null;
            let target = action.target ? `data-target="${action.target}"` : "";
            return `<a class="${className}"  data-location="${action.location || route}" ${target}>${icon} ${action.text}</a>`
        }

        if (type === "button") {
            return `<button class="mini ui button ${className}" onclick="${action.fn}">${icon} ${action.text}</button>`;
        }

        if (type === "submit") {
            return `<button class="mini ui button ${className}" type="submit">${icon} ${action.text}</button>`;
        }

        if (type === "reset") {
            return `<button class="mini ui button ${className}" type="reset">${icon} ${action.text}</button>`;
        }

        if (type === "close") {
            return `<button type="button" class="mini ui button ${className}" onclick="parent.tabs ? parent.removeActiveTab() : document.location = '/'">${icon || `<i class="times circle icon"></i>`} ${action.text || 'Close'}</button>`;
        }
    },
    error(errors) {
        if (!errors || !errors.length) return;
        let errs = Array.isArray(errors) ? errors : [errors];

        errs = errs.map(el => {
            if (!el) return;
            if (el.message) return el.message;
            return `<b>${Object.keys(el)[0]}</b> : ${el[Object.keys(el)[0]]}`;
        });

        return `<div class="ui error message">
            <i class="close icon" onclick="$(this).closest('.message').transition('fade')"></i>
            <div class="header">There were some errors with your submission</div>
            <ul class="list"><li>${errs.join("</li><li>")}</li></ul>
        </div>`;
    }
}

module.exports = Twig;