const url =  '/api/Save-JSON';

function PrintResponse(response){

    let container = document.getElementById("text");

    container.innerHTML = "";

    if(response.error){
        container.innerText = `Ошибка ${response.error}: ${response.message}`;
    }
    else if(response.deleted){
         container.innerText = 'Удалено';
    }
    else{
        container.innerText = `Операция: ${response.op}\nX = ${response.x}\nY = ${response.y}\nРезультат = ${response.result}`;
    }

}



function formatResult(message){
  if(message.error){
    return `Ошибка ${message.error}: ${message.message}`;
  }

  else if(message.deleted){
    return 'Deleted';
  }

  return `Операция: ${message.op}\nX = ${message.x}\nY = ${message.y}\nРезультат = ${message.result}`;

}


let request = async (method) => {

  let params = {
    method: method,
    headers: {'content-type':'application/json'}
  }

  if(method == 'POST' || method == 'PUT'){
    params.body = JSON.stringify(GetInput());
  }

  let response = await fetch(url, params);

  let text = await response.text();
  
  let data = text ? JSON.parse(text) : {deleted:true};

  PrintResponse((data));
}


function GetInput(){
    return{
        op: document.getElementById('op').value,
        x: +document.getElementById('X').value,
        y: +document.getElementById('Y').value
    }
}
