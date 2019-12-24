var btn = $("#additembtn");
var form = $("#additemform");
form.hide();

btn.on("click", ()=>{
    btn.slideOut();
    form.slideIn();
})
