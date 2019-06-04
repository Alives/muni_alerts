var AGENCY = "sf-muni";
var API_URL = "http://webservices.nextbus.com/service/publicXMLFeed?command=" +
  "predictions&a=" + AGENCY;
var ROUTES = {
  HomeToEmbarcadero: {
    show_only: ["*"],
    stop_ids: [13998]
  },
  EmbarcaderoToWork: {
    show_only: ["KT", "N", "TBUS"],
    stop_ids: [
      16992,
      136475] // TBUS
  },
  WorkToEmbarcadero: {
    show_only: ["*"],
    stop_ids: [
      14510,
      17964]  // TBUS
  },
  EmbarcaderoToHome: {
    show_only: ["J", "KT", "N"],
    stop_ids: [17217],
  }
};

function clearAllIntervals() {
  for (i = 1; i < 99999; i += 1) {
    window.clearInterval(i);
  }
}

function clearLi(id) {
  var ul = document.getElementById(id);
  while (ul.firstChild) {
    ul.removeChild(ul.firstChild);
  }
}

function timeStamp() {
  var now = new Date();
  var time = [now.getHours(), now.getMinutes(), now.getSeconds()];
  var suffix = (time[0] < 12) ? "am" : "pm";
  time[0] = (time[0] < 12) ? time[0] : time[0] - 12;
  time[0] = time[0] || 12;
  for (i = 1; i < 3; i += 1) {
    if (time[i] < 10) {
      time[i] = "0" + time[i];
    }
  }
  return time.join(":") + " " + suffix;
}

function timeStr(epoch) {
  var now = Math.floor((new Date()).getTime() / 1000);
  var delta = Math.floor(epoch / 1000) - now;
  if (delta <= 0) { return "-1"; }
  var hrs = Math.floor(delta / 3600);
  var min = Math.floor((delta - (hrs * 3600)) / 60);
  var sec = delta - (hrs * 3600) - (min * 60);
  if (min < 10) { min = "0" + min; }
  if (sec < 10) { sec = "0" + sec; }
  var str = min + ":" + sec;
  if (hrs > 0) {
    return hrs + ":" + str;
  } else {
    return "  " + str;
  }
}

function xmlPromise(name) {
  return Q.promise(function (resolve, reject, notify) {
    $.get(name)
     .done(function (data) {
       resolve(data);
    }).fail(function () {
      reject();
    });
  });
}

function updateLists() {
  var promises = {};
  var url;
  clearAllIntervals();
  $.each(ROUTES, function(dir, data) {
    promises[dir] = [];
    $.each(data["stop_ids"], function(i, stop_id) {
      url = API_URL + "&stopId=" + stop_id;
      promises[dir].push(xmlPromise(url));
    });
    Q.allSettled(promises[dir]).then(function(responses) {
      var entry = {};
      var entries = {};
      var epoch;
      var li;
      var n;
      var p;
      var predictions;
      var show_only = ROUTES[dir]["show_only"];
      var time;
      var text;
      var xml;
      $.each(responses, function(i, response) {
        xml = response.value.documentElement;
        $.each(xml.getElementsByTagName("predictions"), function(i, predictions) {
          $.each(predictions.getElementsByTagName("direction"), function(i, d) {
            $.each(d.getElementsByTagName("prediction"), function(i, p) {
              epoch = parseInt(p.getAttribute("epochTime"), 10);
              entry = {
                train: predictions.getAttribute("routeTag"),
                station: predictions.getAttribute("stopTitle"),
              };
              if ((($.inArray(entry["train"], show_only) !== -1) || show_only[0] == "*")) {
                if (epoch in entries) {
                  entries[epoch].push(entry);
                } else {
                  entries[epoch] = [entry];
                }
              }
            });
          });
        });
      });
      clearLi(dir);
      $.each(Object.keys(entries).sort(), function(i, epoch) {
        $.each(entries[epoch], function(i, entry) {
          text = " - " + entry.train;
          li = document.createElement("li");
          p = document.createElement("p");
          time = timeStr(epoch);
          if (time == "-1") {
            return;
          }
          li.className = "train " + entry.train;
          li.setAttribute("epoch", epoch);
          li.setAttribute("text", text);
          n = document.createTextNode(time + text);
          p.appendChild(n);
          li.appendChild(p);
          document.getElementById(dir).appendChild(li);
        });
      });
      li = document.createElement("li");
      li.className = "timestamp";
      n = document.createTextNode(timeStamp());
      p = document.createElement("p");
      p.appendChild(n);
      li.appendChild(p);
      document.getElementById(dir).appendChild(li);
      setInterval(updateTimes, 5000);
    });
  });
}

function updateTimes() {
  var li;
  var n;
  var p;
  var time;
  var trains = document.getElementsByClassName("train");
  for (i = 0; i < trains.length; i += 1) {
    p = document.createElement("p");
    li = trains[i];
    time = timeStr(li.getAttribute("epoch"));
    if (time == "-1") {
      li.parentNode.removeChild(li);
      continue;
    }
    n = document.createTextNode(time + li.getAttribute("text"));
    p.appendChild(n);
    li.removeChild(li.firstChild);
    li.appendChild(p);
  }
}

$(document).ready(function() {
  updateLists();
  setInterval(updateLists, 30 * 1000);
  function onFocus(){
    updateLists();
    setInterval(updateLists, 30 * 1000);
  }
  window.onfocus = onFocus;
  window.onblur = clearAllIntervals();
});
