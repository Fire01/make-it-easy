$(".btn-reload").click(() => {datatables.clear().draw();datatables.ajax.reload()});
$(".btn-csv").click(() => datatables.buttons('.buttons-csv').trigger());
$(".btn-excel").click(() => datatables.buttons('.buttons-excel').trigger());
$(".btn-print").click(() => datatables.buttons('.buttons-print').trigger());
$(".btn-delete").click(() => {
    const selecteds = datatables.rows({ selected: true }).data();
    if(!selecteds.length) {
        modal.info("Please select document to be deleted!");
        return;
    }
    
    let values = [];
    let ids = [];
    selecteds.each(el => {
        ids.push(el._id);
        values.push(Object.values(el)[0]);
    });
    
    modal.confirmation(`Are sure to delete data these documents?<ul><li>${values.join("</li><li>")}</li></ul>`, ()=>{
        $.ajax({
            url: viewCfg.form_path,
            type: 'DELETE',
            data: {id: ids},
            success: function(result) {
                if(!result.success) modal.info(`Error while deleting document!<ul><li>${result.errors.join("</li><li>")}</li></ul>`);
                datatables.clear().draw();
                datatables.ajax.reload();
            }
        });
    });
});

$(".input-search").on('keyup click', (e) => datatables.search(e.target.value).draw());
$(".clear-search").click(() => {$(".input-search").val("");datatables.search("").draw()});