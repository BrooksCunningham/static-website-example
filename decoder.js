function sync() {
  var n1 = document.getElementById('n1');
  var n2 = document.getElementById("web_violations_decoded").innerHTML;

};


function status(response) {
  if (response.status >= 200 && response.status < 300) {
    return Promise.resolve(response)
  } else {
    return Promise.reject(new Error(response.statusText))
  }
}

function json(response) {
  return response.json()
}

function compare_decoder(violations_json,violation_value) {
  myjson = {} ;

  for(var key in violations_json){
    if ((key & violation_value) != 0) {

      myjson[key] = violations_json[key] ;
      console.log(key + ' - ' + violations_json[key]);

    }
  }
  console.log(myjson);
  document.getElementById("web_violations_decoded").innerHTML = JSON.stringify(myjson, null, 2);
}

function web_decode() {
  sync();
  fetch('/web_violations.json')
    .then(status)
    .then(json)
    .then(function(data) {
      if (n1.value != "") {
        compare_decoder(data,n1.value);
      }
    }).catch(function(error) {
      console.log('Request failed', error);
    });

};
