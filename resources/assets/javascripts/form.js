if ($("#action-bar").length) {
    $(".main-container").addClass("has-action-bar");
}

$('.ui.calendar').calendar({type: 'date'});
$('.ui.checkbox').checkbox();
$('.ui.radio.checkbox').checkbox();

$('.ui.dropdown').each((i, t) => {
    const dataset = t.dataset;
    let required = $(t).attr('required');
    
    if(dataset.type){
        if(dataset.type === 'model'){
            $(t).dropdown({
                clearable: true, 
                apiSettings: {
                    url: `${document.location.pathname}?reference&key=${dataset.key}&query={query}`,
                    cache: false,
                    throttle: 200
                },
                saveRemoteData: false
            });            
        }
    }else{
        $(t).dropdown({clearable: true, fullTextSearch: true});
    }

    $(t).attr('required', required);
});

deleteDoc = () => {
    const url = new URL(document.location.href);
    const id = url.searchParams.get("id");

    modal.confirmation(`Are sure to delete data this document?`, () => {
        $.ajax({
            url: document.location.pathname,
            type: 'DELETE',
            data: { id: id },
            success: function (result) {
                if (result.success) {
                    parent.tabs ? parent.removeActiveTab() : document.location = '/';
                } else {
                    modal.info(`Error while deleting document!<ul><li>${result.errors.join("</li><li>")}</li></ul>`);
                }
            }
        });
    });
};


formItems = (id) => {
    this.id = id;
    this.table = $('#' + id + "_table");
    this.modal = $('#' + id + "_modal");
    this.input = $('#' + id + "_value");
    this.items = JSON.parse(decodeURI(this.modal.data().items));
    
    this.open = (i) => {
        const self = this;
        
        if(typeof i !== "undefined"){
            let value = self.getValues()[i];
            self.items.forEach(el => $("#" + el.id).val(value[el.key]));
        }else{
            self.items.forEach(el => $("#" + el.id).val(""));
        }

        this.modal.modal({
            closable: false,
            onApprove(){
                const result = self.items.reduce((res, el) => {
                    let item = $("#" + el.id);
                    let val = item.val();
                    res[el.key] = val;
                    return res;
                }, {});
                
                if(typeof i !== "undefined"){
                    let values = self.getValues();
                    values[i] = result;
                    self.setValues(values);
                }else{
                    self.addValues(result);
                }

                self.renderTable();
            }
        }).modal('show');
    }

    this.renderTable = () => {
        let editMode = this.input.length;
        let values = this.getValues();
        let items = this.items.slice();

        this.table.children('tbody').html('');
        if(editMode) items.push({key: "__action", id: "__action"});
        
        let rows = values.map((el, i) => {
            let cels = items.map(col => {
                if(col.key === '__action'){
                    return `<td>
                                <button type="button" class="tiny circular ui green icon button" onclick="formItems('${this.id}').edit(${i})">
                                    <i class="edit icon"></i>
                                </button>
                                <button type="button" class="tiny circular ui red icon button" onclick="formItems('${this.id}').delete(${i})">
                                    <i class="delete icon"></i>
                                </button>
                            </td>`;
                }else{
                    return `<td>${el.hasOwnProperty(col.key) ? el[col.key] : '-'}</td>`;
                }
            })

            return `<tr>${cels.join("")}</tr>`;
        });
    
        rows.forEach(row => this.table.append(row));
    }

    this.edit = (i) => {
        this.open(i);
    }

    this.delete = (i) => {
        let values = this.getValues();
        values.splice(i, 1);

        this.setValues(values);
        this.renderTable();
    }

    this.getValues = () => {
        return this.input.length ? JSON.parse(this.input.val()) : JSON.parse(decodeURI(this.modal.data().values));
    }

    this.addValues = (item) => {
        let items = this.getValues();
        items.push(item);
        this.setValues(items);
    }

    this.setValues = (items) => {
        if(this.input.length) this.input.val(JSON.stringify(items));
    }
    
    return this;
    
}

$(".form-items").each((i, el) => formItems(el.id).renderTable());