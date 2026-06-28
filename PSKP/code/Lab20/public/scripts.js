window.onload = function(){

    const field = document.getElementById('nameField');
    const del = document.getElementById('deleteBtn');

    if(field && del){

        field.addEventListener('input', function(){
            del.disabled = true;
        });

    }

};