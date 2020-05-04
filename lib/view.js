const humanizeString = require('humanize-string');
const Controller = require("./controller");

class View extends Controller{
    model = null;
    title = null;
    column = {}
    links = [];
    pageLength = 25;
    form = null;
    readers = true;

    constructor(model, configs={}){
        super(configs);

        this.method = "GET";
        this.model = model;
        this.form = configs.form ? configs.form : null;
        this.title = configs.title ? configs.title : model.name;

        this.column = configs.column ? configs.column : Object.keys(model.properties).map(el => {
            let title = model.properties[el].label ? model.properties[el].label : humanizeString(el);
            return {data: el, title: title};
        });
        
        this.conditions = configs.conditions ? configs.conditions : {} ; 
        this.links = configs.links && configs.links.length ? configs.links : [this.column[0].data];
        this.readers = configs.hasOwnProperty('readers') ? configs.readers : true;
        
        return this;
    }

    setLinks(links){
        this.links = Array.isArray(links) ? links : this.links;
        return this;
    }

    getColumn(){
        let columns = this.column;
        return columns.map(el => ({
            data: el.data,
            title: el.title ? el.title : humanizeString(el.data)
        }));
    }

    getDataTablesConfig(){
        return {
            ajax: this.path + "?json",
            deferRender: true,
            processing: true,
            columns: this.getColumn(),
            lengthMenu: [25, 50, 100],
            pageLength: this.pageLength,
            scrollY: '500px',
            scrollCollapse: true,
            paging:  true,
            responsive: true,
            keys: true,
            select: true,
            order: this.order ? this.order : [[0, 'asc']],
            dom: `<'ui stackable grid'
                    <'#data-container.row dt-table'
                        <'sixteen wide column'tr>
                    >
                    <'#data-footer.row'
                        <'four wide column'l>
                        <'center aligned four wide column'i>
                        <'right aligned eight wide column'p>
                    >
                >`,
            buttons: ['csv', 'excel', 'print']
        }
    }

    fn(req, res, next){       
        if(!req.query.hasOwnProperty('json')){
            return res.render('_base/view', {title: this.title, configs : this.getDataTablesConfig(), form_path: this.form.path});
        }else{
            let map = this.column.map(el => el.data).concat(['_id']);

            this.model.find(this.conditions)
            .then((result) => {
                return res.json({
                    data: result.reduce((data, el) => {
                        let authorized = typeof this.readers === 'function' ? this.readers(this.userAccess, el) : this.readers;
                        if(!authorized) return data;
                        
                        let doc = map.reduce((r, f) => {
                            let value = el[f];
                            let col = this.column.find(c => c.data == f);

                            if(col){
                                if(col.hasOwnProperty('type')){
                                    switch(col.type){
                                        case 'date':
                                            value = new Date(el[f]).toLocaleString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
                                            break;
                                    }
                                }

                                if(typeof col.render === "function"){
                                    value = col.render(el[f], el);
                                }
                            }

                            if(this.form && this.links.indexOf(f) !== -1){
                                value = Utils.twig.action({text: value, location: this.form.path + '?ReadForm&id=' + el['_id']});
                            }

                            r[f] = value;

                            return r;
                        }, {});

                        data.push(doc);
                        
                        return data;
                    }, [])
                });
            })
            .catch((err) => {console.error(err)});
        }
    }

}

module.exports = View;