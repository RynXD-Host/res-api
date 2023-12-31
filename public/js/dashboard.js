function updateClock() {
 var now = new Date();
 var hours = now.getHours();
 var minutes = now.getMinutes();
 var seconds = now.getSeconds();
 var formattedTime = padZero(hours) + ":" + padZero(minutes) + ":" + padZero(seconds);
 document.getElementById('clock').innerText = formattedTime;
}

function padZero(number) {
 return number < 10 ? '0' + number : number;
}
setInterval(updateClock, 1000);
updateClock();

function getIpAddress() {
 $.get("https://api64.ipify.org?format=json", function(data) {
  $("#ipAddress").text(data.ip);
 });
}

getIpAddress();

$.getJSON("https://visitor-counter.kentodlahh11.workers.dev/visit?url=api.arifzyn.biz.id", function(response) {
  $("#visitor").text(`${response.today} / ${response.total}`)  
})

function searcTable() {
  var input, filter, table, tr, td, i, txtValue;
  input = document.getElementById("myInput");
  filter = input.value.toUpperCase();
  table = document.getElementById("apiTable");
  tr = table.getElementsByTagName("tr");
  
  for (i = 0; i < tr.length; i++) {
    td = tr[i].getElementsByTagName("td")[0];
    if (td) {
      txtValue = td.textContent || td.innerText;
      if (txtValue.toUpperCase().indexOf(filter) > -1) {
        tr[i].style.display = "";
      } else {
        tr[i].style.display = "none";
      }
    }
  }
}