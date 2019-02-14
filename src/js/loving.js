//!(function () {
var $demo = document.getElementById('demo'),
  $bg = document.getElementById('bg'),
  $tm = document.getElementById('tm'),
  $cover = document.getElementById('cover'),
  $lovs = $bg.querySelector('.lovs');
  requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
var music = {
  src: '../img/loving/dbb.mp3',
  lrcSrc: '../img/loving/dbb.lrc',
  offset: $cover.getBoundingClientRect(),
  imgs: {
    index : 0,
    list : []
  },
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
            <span>by ${lrc.ar}</span>
          </div>
          <div class="action">
            <span>开始播放</span>
          </div>
        </div>
      `)
    this.lovs = [];
    let $lovFrames = document.createDocumentFragment();
    for ( let i = 0; i < 52 ; i ++ ){
      let $lov = tm.h('div',{
        class : `lov-l lov-${i+1}`
      },String(i+1));
      this.imgs.list.push(i);
      this.lovs.push($lov);
      $lovFrames.appendChild($lov);
    }
    let lbs = [29,126];
    let rbs = [81,143];
    let reds = [4,5,10,15,17,23,27,28,36,43,47,48,58,65,72,74,78,79,104,124,125,139,140,143,144,145,146,147,148];
    let titles = [0, 29, 81, 126];
    let blues = [1, 6, 11, 16, 24, 30, 37, 44, 51, 59, 66, 75, 82, 90, 96, 105, 113, 127, 136];
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
      if (blues.findIndex(vv => vv === i) > -1) {
        result.color = '#00a0e9';
      }
      if (titles.findIndex(vv => vv === i) > -1) {
        result.color = '#000';
      }
      p.push(result)
      return p
    }, []);
    shuffle(this.imgs.list);
    this.imgs.length = this.imgs.list.length;
    this.imgs.step = ~~( lrc.list.length / this.imgs.length );
    this.imgs.pre = ~~((lrc.list.length % this.imgs.length)/2);
    this.$pre.addEventListener('click', e => {
      $cover.classList.add('hide');
      $bg.classList.remove('hide');
      tm.init(list);
      musicAction();
    }, false)
    let $lovsList = $bg.querySelector('.lovs-list');
    tm.setStyle($lovsList,{
      [tm.transform] : `scale(${this.offset.width/1200})`
    })
    $lovsList.appendChild($lovFrames);
    $cover.appendChild(this.$pre);
    addWindowListen();
  }
}
var tm = new TypeMoneky({
  box: $tm,
  background: 'transparent',
  beforeCreate(next, nextIndex, opts) {
    let imgs = music.imgs;
    if ( imgs.index < imgs.length && nextIndex === imgs.pre + imgs.index*imgs.step ){
      music.lovs[imgs.list[imgs.index]].classList.add('show');
      imgs.index++;
    }
    next()
  }
});
music.$mp3 = tm.h('audio', {
  class: 'tm-audio',
  preload: true,
  src: music.src,
  style: {
    position: 'absolute',
    visibility: 'hidden'
  }
});
music.$mp3.playbackRate = getRequest('play') || 1;
$demo.appendChild(music.$mp3);
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
  $tm.addEventListener('click',e=>{
    tm.clear();
    $tm.classList.add('hide');
    tm.setStyle($lovs,{
      bottom: (music.offset.height - music.offset.width)/2 + 'px'
    })
  },false);
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
function shuffle(arr){
  var len = arr.length;
  for(var i = 0; i < len - 1; i++){
    var idx = Math.floor(Math.random() * (len - i));
    var temp = arr[idx];
    arr[idx] = arr[len - i - 1];
    arr[len - i -1] = temp;
  }
  return arr;
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