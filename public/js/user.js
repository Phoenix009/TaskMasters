
function edit_row(no){
    no = Number(no);
    document.querySelector(`#confirm${no}`).style.display = "block";
    document.querySelector(`#request${no}`).style.display = "none";
}