var btn = $("#additembtn");
var form = $("#additemform");
form.hide();
var savebtn = document.getElementsByClassNameAll("save_button");

console.log(savebtn);

// document.getElementById("save_button").style.display="none";
btn.on("click", ()=>{
    btn.slideOut();
    form.slideIn();
});

function edit_row(no)
{
 document.getElementById("edit_button"+no).style.display="none";
 document.getElementById("save_button"+no).style.display="block";

 var id =document.getElementById(+no);
 var item=document.getElementById("item"+no);
 var avail=document.getElementById("avail"+no);
 var qty_req=document.getElementById("qty-req"+no);
  
 var id_data  =id.innerHTML;
 var item_data=item.innerHTML;
 var avail_data=avail.innerHTML;
 var Qty_data=qty_req.innerHTML;

 id.innerHTML=`<input type='text' name='id'  value ='${id_data}' readonly>`;
 item.innerHTML=`<input type='text' name='item_text'  value ='${item_data}' >`;
 avail.innerHTML=`<input type='text' name='avail_text'  value ='${avail_data}' >`;
 qty_req.innerHTML=`<input type='text' name='qty_text'  value ='${Qty_data}' >`;
}
