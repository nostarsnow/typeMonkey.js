# typeMonkey.js 

## Demo 

![文字动画](https://wx1.sinaimg.cn/mw690/4d227521ly1fzda7zr393g204607kao9.gif)  

[在线预览：Demo](https://nostarsnow.github.io/typeMonkey.js/dist/) 

[图文配乐版 - 通过mp3音乐文件和lrc歌词文件](https://nostarsnow.github.io/typeMonkey.js/dist/music/) 

[歌曲配歌词配动画版 - 情人节给女朋友的礼物](https://nostarsnow.github.io/typeMonkey.js/dist/loving/) 


[介绍](https://nostarsnow.github.io/2019/01/20/typemonkey/) 


## 前言 

首先必须声明。我不喜欢抖音。不喜欢快手。 

但这个世界不是你不喜欢就能改变的。所以我偶尔看看土味。 

抖音快手中有一种视频。人声在念笑话或者鸡汤。视频里会跟随跳动出现一句一句话。如果你玩肯定见到过。 

我查了一下。最初是用AE的typeMonkey制作的。后来字说APP做了个易用版。都挺不错的。

于是。机缘巧合之下。我也搜了一下好像没有web端实现的。那么。我来试试。 

## 制作 

### 构思 

说起来产生这个想法已经很久了。我都忘记是从什么时候开始的。大概是发现身边的人都盯着抖音开始的吧。 

功能大概就是：

* 文字一行一行跟随音频出现在页面水平垂直中心。 
* 每行文字宽度始终固定为一个长度。超出缩小。不够则放大。过程中有动画。 
* 每行文字出现也有或没有动画。
* 段落与段落之间切换会有翻转动画。
* 之后的段落中每行出现的时候。之前的所有段落所有行也会随之放大缩小上下移动
* 文字会有特定的颜色。
* 等等。。。

### 构思原理 


