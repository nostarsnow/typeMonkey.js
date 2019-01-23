class TypeMoneky {
  constructor(opts){
    let defaultOpts = {
      debug : false,
      box : '',
      list : [],
      fontSize : 16,
      lineHeight : 1.1,
      letterSpacing : 0,
      blockIndex: 0,
      rowIndex : 0,
      conPercent : 0.8,
      color:'#fff',
      background:'#000',
      beforeCreate (next,nextIndex,opts) {
        next()
      }
    }
    this.opts = Object.assign(defaultOpts,opts)
    if ( this.opts.debug ){
      opts.box.addEventListener('click',v=>{
        this.next()
      }).classList.addClass('tm-debug')
    }
    return this
  }
  init(){
    let opts = this.opts
    let $box = opts.box
    let prefix = this.getPrefix()

    let $wrap = this.h('div',{
      class : 'tm-wrap'
    })
    let $inner = this.h('div',{
      class : 'tm-inner',
      style : {
        'font-size' : opts.fontSize + 'px',
        lineHeight : opts.lineHeight,
        'background':opts.background,
        color : opts.color
      }
    })
    let $blocks = []

    this.opts = Object.assign(opts,{
      width : opts.box.offsetWidth,
      height : opts.box.offsetHeight,
      conWidth : opts.box.offsetWidth * this.opts.conPercent,
      total : opts.list.reduce((p,v,i,a)=>{
        if ( i === 0 ){
          p.l.push([])
        }
        if ( v.type === 'rotate' ){
          p.l[p.l.length-1].rotate = v.value
          p.l.push([])
          /*p.r++
          p.l.push(v)
          p.l.push([])*/

          /*let to = ''
          if ( v.value === 'rb' ){
            to = `right bottom`
          }else{
            to = `left bottom`
          }
          let $block = this.h('div',{
            class : `tm-block tm-block-${p.r}`,
            style : {
              [`${prefix}transform-origin`]:to
            }
          })
          $block.rotate = v.value
          if ( $blocks.length > 0 ){
            $block.appendChild($blocks[$blocks.length-1])
          }
          $blocks.push($block)*/
        }else if( v.type === 'text' ){
          p.t++
          p.l[p.l.length-1].push(v)
        }
        return p
      },{
        r : 0,
        t : 0,
        l : []
      }),
      index:0,
      blockIndex : 0,
      rowIndex:0
    })
    opts.total.l.forEach((v,i)=>{
      let to = ''
      if ( v.rotate === 'rb' ){
        to = `right bottom`
      }else{
        to = `left bottom`
      }
      let $block = this.h('div',{
        class : `tm-block tm-block-${i+1}`,
        style : {
          [`${prefix}transform-origin`]:to
        }
      })
      $block.rotate = v.rotate
      if ( $blocks.length > 0 ){
        $block.appendChild($blocks[$blocks.length-1])
      }
      $blocks.push($block)
    })
    let $blockLast = this.h('div',{
      class : `tm-block tm-block-last`,
      style : {
        [`${prefix}transform-origin`]:'left bottom'
      }
    })
    $blockLast.appendChild($blocks[$blocks.length-1])
    $blocks.push($blockLast)
    $inner.appendChild($blocks[$blocks.length-1])
    $wrap.appendChild($inner)
    $box.appendChild($wrap)
    Object.assign(this,{
      $box,
      $wrap,
      $inner,
      $blocks,
      $blockLast,
      prefix,
      killIe : (/msie [6|7|8|9]/i.test(navigator.userAgent)),
      transform : prefix + 'transform'
    })
  }
  start(){
    this.next()
  }
  createRow(nextIndex){
    let opts = this.opts
    let cur = opts.list[nextIndex]
    if ( cur.type === 'rotate' ){
      opts.index++
      opts.blockIndex++
      opts.rowIndex = 0
      this.next()
      return;
    }
    let $curBlock = this.$blocks[opts.blockIndex],
        $blockLast = this.$blocks[this.$blocks.length-1],
        $cols = document.createDocumentFragment()
    cur.value.split('').forEach((t,i)=>{
      let $col = this.createCol(t,i,opts.rowIndex)
      $cols.appendChild($col)
    })
    let rowWidth = cur.value.length * opts.fontSize
    let rowHeight = opts.fontSize * opts.lineHeight
    let scale = opts.conWidth / rowWidth
    let newRowWidth = rowWidth * scale
    let newRowHeight = rowHeight * scale
    let $row = this.h('div',{
      class : `tm-row tm-row-${opts.rowIndex+1}`,
      style : {
        color : cur.color,
      }
    })
    if ( opts.blockIndex > 0 ){
      let lastArray = opts.total.l[opts.blockIndex-1]
      let $prevBlock = this.$blocks[opts.blockIndex-1]
      let curArray = opts.total.l[opts.blockIndex]
      let rotate,left = 0,originX
      if ( $prevBlock.rotate === 'lb' ){
        rotate = `-90`
      }
      if ( $prevBlock.rotate === 'rb' ){
        rotate = `90`
        let lastArrMax = Math.max.apply(null,lastArray.map(v=>v.value.length))
        let lastArrLastLengh = lastArray[lastArray.length-1].value.length
        originX = lastArrLastLengh/lastArrMax

        let now = curArray[opts.rowIndex].value.length
        let max = Math.max.apply(null,curArray.map(v=>v.value.length))

        let prevMaxIndex = curArray.slice(0,opts.rowIndex).findIndex(v=>v.value.length > now)

        if ( opts.rowIndex === 0 ){
          left = 100 * (now - lastArrLastLengh)/now + '%'
        }else if ( prevMaxIndex === -1 ){
          left = 100 * (now - lastArrLastLengh)/now + '%'
        }else if ( prevMaxIndex >= 0 ){
          let prevMax = curArray[prevMaxIndex].value.length
          left = 100 * (prevMax - lastArrLastLengh)/prevMax + '%'
        }
      }
      let style = {
        left,
        top : -newRowHeight*(lastArray.length-1)/scale + 'px',
        [this.transform]:`rotate(${rotate}deg)`
      }
      if ( originX !== undefined ){
        style[`${this.prefix}transform-origin`] = `${originX*100}% bottom`
      }
      this.setStyle($prevBlock,style)
    }
    $curBlock.scale = scale
    this.setStyle($curBlock,{
      left : (opts.width - newRowWidth)/2/scale + 'px',
      top : (opts.height - newRowHeight*(opts.rowIndex+1)) / 2 / scale - newRowHeight*(opts.rowIndex)/2/scale + 'px'
    })
    this.setStyle($blockLast,{
      [this.transform]:`translate3d(0,0,0) scale(${scale})`
    })
    $row.appendChild($cols)
    $curBlock.appendChild($row)
    opts.index++
    opts.rowIndex++
  }
  createCol(t,i,index){
    return this.h('span',{
      class : `tm-col tm-col-${i+1}`,
      style : {
        width : this.opts.fontSize + 'px',
      }
    },t)
  }
  next(){
    let opts = this.opts
    if ( opts.index === opts.list.length ){
      this.isEnd = true
    }else{
      let nextIndex = opts.index
      this.opts.beforeCreate(this._next.bind(this,nextIndex),nextIndex,opts.list[nextIndex],opts)
    }
  }
  _next(nextIndex){
    this.createRow(nextIndex)
  }
  h(name,obj,children){
    return this._createElement(name,obj,children)
  }
  _createElement(name,obj,children){
    let el = document.createElement(name)
    Object.keys(obj).forEach(v=>{
      if ( v === 'style' ){
        this.setStyle(el,obj[v])
      }else{
        el.setAttribute(v,obj[v])
      }
    })
    if ( this.isType(children,'String') ){
      el.innerHTML = children
    }
    return el
  }
  getStyleStr(style = {}){
    return Object.keys(style).map(v=>{
      return `${this.str2label(v)}:${style[v]};`
    }).join('')
  }
  setStyle(el,style){
    Object.keys(style).forEach(v=>{
      el.style[this.label2str(v)]=style[v]
    })
  }
  isType(value,type){
    return Object.prototype.toString.call(value) === `[object ${type}]`
  }
  str2label(str,tag='-'){
    let result = ''
    if ( !str[0].match(/[A-Z]+/) ) {
      let strs = str.split(/[A-Z]+/)
      strs.forEach((value,index)=>{
        if ( index > 0 ){
          let sublength = 0
          for (let i = index; i > 0; i--) {
            sublength += strs[i - 1].length
          }
          result += tag + (strs[index] = str.substr(sublength,1) + value).toLowerCase()
        }else{
          result += strs[index].toLowerCase()
        }
      })
    }else{
      result = str.toLowerCase()
    }
    return result
  }
  label2str(str,tag='-'){
    return str.split(tag).filter(v=>v).map((v,i)=>{
      if ( i !== 0 ){
        v = v.substring(0,1).toUpperCase()+v.substring(1)
      }
      return v
    }).join('')
  }
  getPrefix(){
    return (function() {
      let styles = window.getComputedStyle(document.documentElement, ''),
        pre = (Array.prototype.slice
            .call(styles)
            .join('')
            .match(/-(moz|webkit|ms)-/) || (styles.OLink === '' && ['', 'o'])
        )[1],
        dom = ('WebKit|Moz|MS|O').match(new RegExp('(' + pre + ')', 'i'))[1]
      return {
        dom: dom,
        lowercase: pre,
        css: '-' + pre + '-',
        js: pre[0].toUpperCase() + pre.substr(1)
      }.css
    })()
  }
}