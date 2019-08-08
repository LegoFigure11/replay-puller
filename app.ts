import request = require("request");
import sleep = require("system-sleep");
import fs = require("fs");

const url = "https://www.smogon.com/forums/threads/battle-spot-premier-league-iv-week-3.3652978/";

const urlRegex: RegExp = /\b((?:[a-z][\w-]+:(?:\/{1,3}|[a-z0-9%])|www\d{0,3}[.]|[a-z0-9.\-]+[.][a-z]{2,4}\/)(?:[^\s()<>]+|\(([^\s()<>]+|(\([^\s()<>]+\)))*\))+(?:\(([^\s()<>]+|(\([^\s()<>]+\)))*\)|[^\s`!()\[\]{};:'".,<>?«»“”‘’]))/i;
const playersRegex: RegExp = /\|p[1-2]\|+(.*)+\|/;

let parsedReplayURLs = [];
let replayLogs = [];
request(url, function(error: any, response: { statusCode: any; }, body: any) {

  let data = body.split("\n");
  let processedData = [];
  for (let j of data) {
    if (j.includes("replay.pokemonshowdown")) {
      processedData.push(j);
    }
  }
  for (let k of processedData) {
    let match = urlRegex.exec(k);
    if (match != undefined) {
      parsedReplayURLs.push(match[0]);
      replayLogs.push(`${match[0]}.log`);
    }
  }
  replayLogs.sort();
  for (var n of replayLogs) {
    getPlayers(n);
    sleep(100);
  }
});

function getPlayers(n: string) {
  request(n, function(error: any, response: { statusCode: any; }, body: any) {
    let p1 = "";
    let p2 = "";
    let winner = "";
    let p1mons = [];
    let p2mons = [];
    let data = body.split("\n");
    for (var a of data) {
      if (a.includes("|win|")) {
        winner = `Winner: ${a.substr(5, a.length)}`;
      }
    }
    for (var q of data) {
      if (q.includes("|player|p1|")) {
        let temp1 = playersRegex.exec(q);
        let temp2 = temp1[0].substr(4, temp1[0].length);
        p1 = temp2.substr(0, temp2.indexOf("|"));
        break;
      }
    }
    for (var p of data) {
      if (p.includes("|poke|p1|")) {
        let temp1 = playersRegex.exec(p);
        let temp2 = temp1[0].substr(4, temp1[0].length);
        let temp3 = temp2.substr(0, temp2.indexOf("|"));
        p1mons.push(`[IMG]https://raw.githubusercontent.com/msikma/pokesprite/master/icons/pokemon/regular/${temp3.substr(0, temp3.indexOf(",")).toLowerCase().replace(" ", "-")}.png[/IMG]`);
      }
    }
    for (var w of data) {
      if (w.includes("|player|p2|")) {
        let temp1 = playersRegex.exec(w);
        let temp2 = temp1[0].substr(4, temp1[0].length);
        p2 = temp2.substr(0, temp2.indexOf("|"));
        break;
      }
    }
    for (var v of data) {
      if (v.includes("|poke|p2|")) {
        let temp1 = playersRegex.exec(v);
        let temp2 = temp1[0].substr(4, temp1[0].length);
        let temp3 = temp2.substr(0, temp2.indexOf("|"));
        p2mons.push(`[IMG]https://raw.githubusercontent.com/msikma/pokesprite/master/icons/pokemon/regular/${temp3.substr(0, temp3.indexOf(",")).toLowerCase().replace(" ", "-")}.png[/IMG]`);
      }
    }
    let output = [];
    output.push(n.substr(0, n.length - 4));
    output.push(winner);
    output.push(p1);
    output.push(p1mons.join(""));
    output.push(p2);
    output.push(p2mons.join(""));
    console.log(output.join("\n"));
    output.push("---------------------------------------\n\n");
    write(output.join("\n"));
  });
}

function write(value) {
  fs.appendFile(`${url.substr(url.indexOf("/threads/") + 9, url.length).replace("/", "")}_replays.txt`, value, function(err) {
    if (err) throw err;
    console.log('Saved!\n------------------------------------\n');
  });
}
