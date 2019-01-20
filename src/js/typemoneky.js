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
    if ( opts.debug ){
      opts.box.addEventListener('click',v=>{
        this.next()
      })
    }
    return this
  }
  init(){
    let opts = this.opts
    this.opts = Object.assign(opts,{
      width : opts.box.offsetWidth,
      height : opts.box.offsetHeight,
      conWidth : opts.box.offsetWidth * this.opts.conPercent,
      total : opts.list.reduce((p,v,i,a)=>{
        if ( i === 0 ){
          p.l.push([])
        }
        if ( v.type === 'rotate' ){
          p.r++
          p.l.push(v)
          p.l.push([])
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
      rowIndex:0,
    })
    this.killIe = (/msie [6|7|8|9]/i.test(navigator.userAgent))
    this.prefix = this.getPrefix()
    this.$box = opts.box
    this.$blocks = []
    this.start()
  }
  start(){
    let $wrap = this.h('div',{
      class : 'tm-wrap'
    })
    let $inner = this.h('div',{
      class : 'tm-inner',
      style : {
        'font-size' : this.opts.fontSize + 'px',
        lineHeight : this.opts.lineHeight,
        'background':this.opts.background,
        color : this.opts.color
      }
    })
    $wrap.appendChild($inner)
    this.$box.appendChild($wrap)
    this.$wrap = $wrap
    this.$inner = $inner
    //this.next()
  }
  createRow(){
    let opts = this.opts
    var { list,total,rowIndex,blockIndex,index } = opts
    let curList = list[opts.index]
    let nextTotalIndex = 0
    if ( curList.type === 'rotate' ){
      opts.blockIndex++
      curList = opts.list[++opts.index]
      nextTotalIndex = blockIndex + 3
      opts.rowIndex = 1
      rowIndex = 0
      opts.index++
      blockIndex++
    }else if ( curList.type === 'text' ){
      opts.rowIndex++
      opts.index++
      nextTotalIndex = opts.blockIndex + 1
    }
    let $block
    if ( rowIndex === 0 ){
      let nextBlock = total.l[nextTotalIndex],
          to = '',style={}
      if ( nextBlock && nextBlock.type === 'rotate' ){
        if ( nextBlock.value === 'rb' ){
          to = `right bottom`
          //to = `${opts.lineHeight*100}% bottom`
        }else{
          to = `left bottom`
          //to = `-${opts.lineHeight*100-100}% bottom`
        }
        
      }else{
        to = `left bottom`
      }
      style = {
        [`${this.prefix}transform-origin`]:to
      }
      $block = this.h('div',{
        class : `tm-block tm-block-${blockIndex+1}`,
        style
      })
      $block.opts = {}
      if ( nextBlock && nextBlock.type === 'rotate' ){
        $block.opts.rotate = nextBlock.value
      }
    }else{
      $block = this.$blocks[blockIndex]
    }
    let style = {}
    if ( curList.color ){
      style.color = curList.color
    }
    let $row = this.h('div',{
      class : `tm-row tm-row-${rowIndex+1}`,
      style
    })
    let $cols = document.createDocumentFragment()
    curList.value.split('').forEach((t,i)=>{
      let $col = this.createCol(t,i,rowIndex)
      $cols.appendChild($col)
    })
    let rowWidth = curList.value.length * opts.fontSize
    let rowHeight = opts.fontSize * opts.lineHeight
    let scale = opts.conWidth / rowWidth
    let newRowWidth = rowWidth * scale
    let newRowHeight = rowHeight * scale
    let blockStyle = {
      left : (opts.width - newRowWidth)/2 + 'px',
      top : (opts.height - rowHeight*(rowIndex+1)) / 2  + ( newRowHeight - rowHeight*(rowIndex+1) )/2  + 'px',
      [`${this.prefix}transform`] : `scale(${scale})`
    }
    this.setStyle($block,blockStyle)

    this.$blocks.slice(0,opts.blockIndex).forEach(v=>{
      let rotate,opts=v.opts
      if ( opts.rotate === 'lb' ){
        rotate = `-90`
      }
      if ( opts.rotate === 'rb' ){
        rotate = `90`
      }
      let style = {
        [`${this.prefix}transform`] : `scale(${scale}) rotate(${rotate}deg)`,
      }
      if ( rowIndex > 0 ){
        style.top = Number(opts.top.replace('px','')) - newRowHeight*rowIndex + 'px'
      }
      this.setStyle(v,style)
    })

    $row.appendChild($cols)
    $block.appendChild($row)
    Object.assign($block.opts,{
      scale,
      top:blockStyle.top,
      left:blockStyle.left
    })
    if ( rowIndex === 0 ){
      $block.opts.firstTop = blockStyle.top
      this.$inner.appendChild($block)
      this.$blocks.push($block)
    }
  }
  createCol(t,i,index){
    return this.h('span',{
      class : `tm-col tm-col-${i+1}`
    },t)
  }
  next(){
    let opts = this.opts
    if ( opts.index === opts.list.length ){
      this.isEnd = true
    }else{
      let nextIndex
      if ( opts.index === 0 ){
        nextIndex = 0
      }else{
        nextIndex = opts.index
      }
      this.opts.beforeCreate(this._next.bind(this),nextIndex,this.opts)
    }
  }
  _next(){
    this.createRow()
  }
  h(name,obj,children){
    return this._createElement(name,obj,children)
  }
  _createElement(name,obj,children){
    let el = document.createElement(name)
    Object.keys(obj).forEach(v=>{
      if ( v === 'style' ){
        el.setAttribute(v,this.getStyleStr(obj[v]))
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
    let _style = (el.getAttribute('style') || '').split(';').reduce((p,v,i,a)=>{
      let kv = v.split(':')
      if ( kv.toString() ){
        p[kv[0].trim()] = kv[1].trim()
      }
      return p
    },{})
    let newStyle = Object.assign(_style,style)
    return el.setAttribute('style' , this.getStyleStr(newStyle))
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