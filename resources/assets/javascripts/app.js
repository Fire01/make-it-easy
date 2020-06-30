$('body').on('click', 'a.mie-action', e => {
    openLink(e);
});

openLink = (e) => {
    let el = e.target;
    let data = el.dataset;
    if(!data.location){
        if(el.parentElement && el.parentElement.nodeName === "A"){
            data = el.parentElement.dataset;
            if(!data.location) return false;
        }
    }
    let target = data.target ? data.target : "_tab";
    let title = data.title ? data.title : el.text;
    if(!title) title = el.parentElement.text;
    
    switch(target){
        case "_tab":
            if(window.self === window.top)
                if(typeof tabs === 'undefined') document.location = data.location;
                else addTab(title, data.location)
            else parent.addTab(title, data.location);

            break;
        default:
            document.location = data.location;
            break;
    }
}

modal = {
    confirmation(message, cb){
        $("#base-modal .header").html(`<i class="question circle icon"></i> Confirmation`);
        $("#base-modal .actions .button").show();
        $("#base-modal .actions .btn-close").hide();
        modal.show(message, cb);
    },
    info(message){
        $("#base-modal .header").html(`<i class="info circle icon"></i> Info`);
        $("#base-modal .actions .button").show();
        $("#base-modal .actions .btn-approve").hide();
        $("#base-modal .actions .btn-cancel").hide();
        modal.show(message);
    },
    show(message, cb){
        $("#base-modal .content p").html(message);
        $('#base-modal')
        .modal({
            closable: false,
            onApprove(){
                if(typeof cb === 'function') cb();
            }
        })
        .modal('show');
    }
}