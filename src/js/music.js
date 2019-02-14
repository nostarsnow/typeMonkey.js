//!(function () {
var $demo = document.getElementById('demo'),
  $tm = document.getElementById('tm'),
  $cover = document.getElementById('cover'),
  requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
var music = {
  src: '../img/music/csb.mp3',
  lrcSrc: '../img/music/csb.lrc',
  init(lrc) {
    this.lrc = lrc;
    this.$pre = tm.h('div', {
      class: 'music-info'
    }, `
        <div class="con">
          <div class="ti">
            <span>${lrc.ti}</span>
          </div>
          <div class="ar">
            <span>${lrc.ar}</span>
          </div>
          <div class="lrc-ar">
            <span>lrc by ${lrc.by}</span>
          </div>
          <div class="action">
            <span>开始播放</span>
          </div>
        </div>
      `)
    let lbs = [14, 41, 81, 98, 104, 123];
    let rbs = [24, 66, 74, 114, 130, 141];
    let reds = [4, 9, 13, 19, 25, 28, 31, 35, 38, 40, 50, 53, 58, 60, 72, 73, 87, 108, 113, 125, 126, 135, 136, 140, 150]
    let list = lrc.list.reduce((p, v, i) => {
      if (lbs.findIndex(vv => vv === i) > -1) {
        p.push({
          type: 'rotate',
          value: 'lb'
        })
      } else if (rbs.findIndex(vv => vv === i) > -1) {
        p.push({
          type: 'rotate',
          value: 'rb'
        })
      }
      let result = {
        type: 'text',
        value: v.lrc
      }
      if (reds.findIndex(vv => vv === i) > -1) {
        result.color = '#fe131a';
      }
      p.push(result)
      return p
    }, []);
    this.$pre.addEventListener('click', e => {
      $cover.classList.add('hide');
      tm.init(list);
      musicAction();
    }, false)
    addWindowListen();
    $cover.appendChild(this.$pre);
  }
}
var tm = new TypeMoneky({
  box: $tm,
  background: 'transparent',
  beforeCreate(next, nextIndex, opts) {
    next()
  }
});
music.$mp3 = document.querySelector('.tm-audio');
music.$mp3.src = music.src;
music.$mp3.playbackRate = getRequest('play') || 1;
get(music.lrcSrc, data => {
  music.init(lrcFormat(data).lrc)
})

function musicGoing() {
  let $mp3 = music.$mp3;
  var currentTime = $mp3.currentTime,
    currentMs = currentTime * 1000;
  if ( $mp3.currentTime >= $mp3.duration ){
    musicStop();
    return false;
  }
  if ( $mp3.paused ){
    return false;
  }
  for (let i = 0, lrc = music.lrc.list, length = lrc.length; i < length; i++) {
    if (currentMs >= lrc[i].time && (i === length - 1 || currentMs < lrc[i + 1].time)) {
      if (music.currentID === i) {
        break;
      }
      music.currentID = i;
      tm.next();
      break;
    }
  }
  requestAnimationFrame(musicGoing);
}

function musicAction() {
  music.$mp3.stop = false;
  music.$mp3.play();
  music.playing = requestAnimationFrame(musicGoing);
}

function musicStop() {
  music.$mp3.stop = true;
  cancelAnimationFrame(music.playing);
  tm.clear();
  $cover.classList.remove('hide');
}

function musicPause(){
  music.$mp3.pause();
  cancelAnimationFrame(music.playing);
}

function addWindowListen() {
  var hidden, state, visibilityChange;
  if (typeof document.hidden !== "undefined") {
    hidden = "hidden";
    visibilityChange = "visibilitychange";
    state = "visibilityState";
  } else if (typeof document.mozHidden !== "undefined") {
    hidden = "mozHidden";
    visibilityChange = "mozvisibilitychange";
    state = "mozVisibilityState";
  } else if (typeof document.msHidden !== "undefined") {
    hidden = "msHidden";
    visibilityChange = "msvisibilitychange";
    state = "msVisibilityState";
  } else if (typeof document.webkitHidden !== "undefined") {
    hidden = "webkitHidden";
    visibilityChange = "webkitvisibilitychange";
    state = "webkitVisibilityState";
  }
  document.addEventListener(visibilityChange, function () {
    if ( music.$mp3.stop === false ){
      if ( document[state] === hidden ){
        musicPause()
      }else{
        musicAction();
      }
    }
  }, false);
}

function get(url, then) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url)
  xhr.onload = function () {
    if (this.status == 200) {
      then(this.response)
    }
  };
  xhr.send();
}

function lrcFormat(data) {
  let lrcMatch = {
    ti: /\[ti[:：](.*)\]/, //歌名
    ar: /\[ar[:：](.*)\]/, //歌手
    al: /\[al[:：](.*)\]/, //专辑
    by: /\[by[:：](.*)\]/, //lrc作者
    offset: /\[offset[:：](-?\d*)\]/, //修正
    rowLyric: /((\[\d+[:：]\d+[\.:：]?\d*\])+)(.*)/, //分割每行的歌词
    times: /\[\d+[:：]\d+[\.:：]?\d*\]/g, //分割多个时间的行歌词
    time: /\[(\d+)[:：](\d+)[\.:：]?(\d*)\]/ //分割一个时间获取时分秒等
  }
  let format = {
    list: []
  };
  let rows = data.split("\n");
  let match;
  rows.forEach(function (value, index) {
    if (match = value.match(lrcMatch.ti)) {
      format.ti = match[1];
    } else if (match = value.match(lrcMatch.ar)) {
      format.ar = match[1];
    } else if (match = value.match(lrcMatch.al)) {
      format.al = match[1];
    } else if (match = value.match(lrcMatch.by)) {
      format.by = match[1];
    } else if (match = value.match(lrcMatch.offset)) {
      format.offset = match[1];
    } else if (match = value.match(lrcMatch.rowLyric)) {
      var lrc = match[3];
      var times = match[1];
      var timeArr = times.match(lrcMatch.times);
      timeArr.forEach(function (v, k) {
        var m = v.match(lrcMatch.time);
        format.list.push({
          timeTag: v,
          m: m[1],
          s: m[2],
          ms: m[3],
          time: m[1] * 60 * 1000 + m[2] * 1000 + m[3] * 10 + (parseInt(format.offset) || 0),
          lrc: lrc
        })
      });
    }
  });
  format.list.sort(function (a, b) {
    return a.time - b.time;
  });
  return {
    data,
    lrc: format
  }
}
function getRequest(name) {
  var url = location.search,
      theRequest = {}
  if (url.indexOf("?") != -1) {
    var str = url.substr(1),
        strs = str.split("&")
    for (var i = 0;i < strs.length;i++) {
      theRequest[strs[i].split("=")[0]] = unescape(strs[i].split("=")[1])
    }
  }
  if (name !== undefined) {
    return theRequest[name]
  }
  return theRequest
}
//}())