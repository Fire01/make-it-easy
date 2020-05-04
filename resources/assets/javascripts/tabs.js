tabs = {lastActive: null};

addTab = (title, url) => {
    let id = uuid();
    
    let baseUrl = url.indexOf("#") >= 0 ? url.split("#")[0] : url.split("?")[0];
    let isExist = Object.keys(tabs).map(el => tabs[el]).find(el => el && el.baseUrl == baseUrl);
    if(isExist){
        activeTab(isExist.id);
        return false;
    }

    tabs[id] = {id: id, title: title, url: url, baseUrl: baseUrl};
    let fixTitle = title.length > 20 ? title.substr(0, 20) + '...' : title;

    let tab = `
        <div class="ui left labeled button" data-tab="${id}">
            <a class="ui label">
                ${fixTitle}
            </a>
            <div class="mini ui icon button">
                <i class="close icon"></i>
            </div>
        </div>`;

    let content = `
        <div id="${id}" class="ui tab segment main-content">
            <iframe src="${url}"></iframe>
        </div>`;
        
    $("#main-tab-bar").append(tab);
    $("#main-container").append(content);
    activeTab(id);
}

getActiveTab = () => {
    return $(".ui.tab.segment.active").attr('id');
}

activeTab = (id) => {
    let last = $(".ui.tab.segment.active");
    tabs.lastActive = last.attr('id');
    last.removeClass("active");
    $('[data-tab=' + tabs.lastActive + ']').removeClass("active");
    
    if($("#" + id).length){
        $("#" + id).addClass("active");
        $('[data-tab=' + id + ']').addClass("active");
    }else{
        activeTab('tab-home');
        $('[data-tab=tab-home]').addClass("active");
    }
}

removeTab = (id) => {
    $('[data-tab=' + id + ']').remove();
    $("#" + id).remove();
    if(tabs.lastActive == id) activeTab('tab-home');
    delete tabs[id];
    activeTab(tabs.lastActive);
}

removeActiveTab = () => {
    removeTab($("#main-tab-bar .active").data().tab)
}

$('body').on('click', '#main-tab-bar div a', e => {
    let target = e.target;
    let tabid = $(target).parent().data().tab;
    activeTab(tabid);
});

$('body').on('click', '#main-tab-bar div .ui.icon.button', e => {
    let target = e.target;
    let tabid = $(target).closest('.ui.labeled.button').data().tab;
    
    removeTab(tabid);
});

activeTab('tab-home');