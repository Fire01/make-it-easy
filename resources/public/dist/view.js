!function(e){var t={};function r(a){if(t[a])return t[a].exports;var n=t[a]={i:a,l:!1,exports:{}};return e[a].call(n.exports,n,n.exports,r),n.l=!0,n.exports}r.m=e,r.c=t,r.d=function(e,t,a){r.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:a})},r.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},r.t=function(e,t){if(1&t&&(e=r(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var a=Object.create(null);if(r.r(a),Object.defineProperty(a,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var n in e)r.d(a,n,function(t){return e[t]}.bind(null,n));return a},r.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return r.d(t,"a",t),t},r.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},r.p="",r(r.s=8)}({10:function(e,t,r){},8:function(e,t,r){r(9),e.exports=r(10)},9:function(e,t){$(".btn-reload").click(()=>{datatables.clear().draw(),datatables.ajax.reload()}),$(".btn-csv").click(()=>datatables.buttons(".buttons-csv").trigger()),$(".btn-excel").click(()=>datatables.buttons(".buttons-excel").trigger()),$(".btn-print").click(()=>datatables.buttons(".buttons-print").trigger()),$(".btn-delete").click(()=>{const e=datatables.rows({selected:!0}).data();if(!e.length)return void modal.info("Please select document to be deleted!");let t=[],r=[];e.each(e=>{r.push(e._id),t.push(Object.values(e)[0])}),modal.confirmation(`Are sure to delete data these documents?<ul><li>${t.join("</li><li>")}</li></ul>`,()=>{$.ajax({url:viewCfg.form_path,type:"DELETE",data:{id:r},success:function(e){e.success||modal.info(`Error while deleting document!<ul><li>${e.errors.join("</li><li>")}</li></ul>`),datatables.clear().draw(),datatables.ajax.reload()}})})}),$(".input-search").on("keyup click",e=>datatables.search(e.target.value).draw()),$(".clear-search").click(()=>{$(".input-search").val(""),datatables.search("").draw()}),$.fn.dataTable.ext.errMode="none"}});