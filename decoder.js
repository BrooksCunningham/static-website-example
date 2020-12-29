
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

function compare_web_violation_decoder(violations_json,violation_value) {
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

function compare_web_whitelist_decoder(whitelist_json, user_input_value) {
  myjson = {} ;

  for(var key in whitelist_json){
    if ((key & user_input_value) != 0) {

      myjson[key] = whitelist_json[key] ;
      console.log(key + ' - ' + whitelist_json[key]);

    }
  }
  console.log(myjson);
  document.getElementById("web_whitelist_decoded").innerHTML = JSON.stringify(myjson, null, 2);
}

function web_violation_decode() {
  fetch('/web_violations.json')
    .then(status)
    .then(json)
    .then(function(data) {
      if (n1.value != "") {
        compare_web_violation_decoder(data,n1.value);
      }
    }).catch(function(error) {
      console.log('Request failed', error);
    });

};

function web_whitelist_decode() {
  fetch('/web_whitelist.json')
    .then(status)
    .then(json)
    .then(function(data) {
      if (n2.value != "") {
        compare_web_whitelist_decoder(data,n2.value);
      }
    }).catch(function(error) {
      console.log('Request failed', error);
    });

};
