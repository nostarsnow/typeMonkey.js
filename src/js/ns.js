(function (window, $, undefined) {
	var ns = window.ns || {};
	ns._width = 750;
	ns.$html = $("html");
	ns.$window = $(window);
	window.click = "click";
	var div = "<div/>",
		a = "<a/>";
	ns.Date = window.Date;
	ns.getDateTime = function (date) {
		return new ns.Date(ns.formatDate(date, "yyyy/MM/dd HH:mm:ss")).getTime();
	};
	ns.formatDate = function (date, format) {
		if (!date) return;
		if (!format) format = "yyyy-MM-dd HH:mm:ss";
		switch (typeof date) {
			case "string":
				date = new Date(date.replace(/-/g, "/").replace(/T/, " "));
				break;
			case "number":
				date = new Date(date);
				break;
		}
		if (!date instanceof Date) return;
		var dict = {
			"yyyy": date.getFullYear(),
			"M": date.getMonth() + 1,
			"d": date.getDate(),
			"H": date.getHours(),
			"m": date.getMinutes(),
			"s": date.getSeconds(),
			"MM": ("" + (date.getMonth() + 101)).substr(1),
			"dd": ("" + (date.getDate() + 100)).substr(1),
			"HH": ("" + (date.getHours() + 100)).substr(1),
			"mm": ("" + (date.getMinutes() + 100)).substr(1),
			"ss": ("" + (date.getSeconds() + 100)).substr(1)
		};
		return {
			str: format.replace(/(yyyy|MM?|dd?|HH?|ss?|mm?)/g, function () {
				return dict[arguments[0]];
			}),
			dict: dict
		}
	};
	ns.getDayOffset = function(day1,day2){
		let s1 = +new Date(day1.replace(/-/g, "/"))
		let s2 = +new Date(day2.replace(/-/g, "/"))
		return ~~((s2-s1) / (1000 * 60 * 60 * 24))
	}
	ns.getPercent = function(w,t){
		return (w / t * 100).toFixed(2)
	}
	ns.tickToTime = function (tick) {
		return (tick - 116445023931680000) * 100 / 1000 / 1000
	}
	ns.shortDate = function (date) {
		var minute = 1000 * 60;
		var hour = minute * 60;
		var day = hour * 24;
		var halfamonth = day * 15;
		var month = day * 30;
		var now = new Date().getTime();
		var diffValue = now - ns.getDateTime(date);
		if (diffValue < 0) {
			return date;
		}
		var monthC = diffValue / month;
		var weekC = diffValue / (7 * day);
		var dayC = diffValue / day;
		var hourC = diffValue / hour;
		var minC = diffValue / minute;
		if (dayC > 1) {
			return ns.formatDate(date);
		} else if (hourC >= 1) {
			result = parseInt(hourC) + "小时前";
		} else if (minC >= 1) {
			result = parseInt(minC) + "分钟前";
		} else {
			result = "刚刚发表";
		}
		return result;

	}
	ns.tip = function (txt, time, showTime, hideTime) {
		var tip = ns.tip;
		time = time || 3000;
		showTime = showTime || 0;
		hideTime = hideTime || 300;
		if (tip.el === undefined || tip.txt === undefined) {
			tip.el = $(div).attr('id', 'ns-tip').appendTo(ns.$body),
				tip.txt = $(div).attr('id', 'ns-tip-txt').appendTo(tip.el);
			tip.show = function (txt) {
				clearTimeout(tip.setTimeout),
					tip.txt.html(txt);
				tip.el.removeAttr("style").fadeIn(showTime, function () {
					tip.setTimeout = setTimeout(tip.hide, time);
				});
				return tip.el;
			};
			tip.hide = function (time) {
				tip.el.fadeOut(time || hideTime, function () {
					clearTimeout(tip.setTimeout)
				});
			};
			tip.el.on(click, tip.hide.bind(null, 50));
		}
		return tip.show(txt);
	};
	ns.ajax = function (url, data, opts) {
		var defaults = {
			type: "get",
			dataType: "json",
			timeout: 20000,
			async: true,
			global: false,
			load: true,
			lock: true
		},
			opts = $.extend({}, defaults, opts);
		opts.data = data || {};
		opts.url = url;
		opts.data.ns_r = Math.random() * 0x777 << 0;
		if (opts.load) {
			ns.load();
		}
		if (opts.lock) {
			if (ns.ajaxLock) {
				return {
					done: function () { },
					then: function () { }
				};
			}
			ns.ajaxLock = true;
		}
		return $.ajax(opts).fail(function () {
			ns.loadHide();
			ns.ajaxLock = false;
			ns.tip("网络请求失败！请稍后再试！")
		}).done(function (data) {
			ns.loadHide();
			ns.ajaxLock = false;
		});
	};
	ns.get = function (url, data) {
		return ns.ajax(url, data)
	};
	ns.post = function (url, data) {
		return ns.ajax(url, data, {
			type: "post"
		});
	};
	ns.load = function (txt) {
		var lo = ns.load;
		txt = txt || 'loading...';
		if (lo.el === undefined) {
			lo.el = $(div).attr('id', 'ns_loading').appendTo(ns.$body);
			lo.icon = $(div).attr('id', 'ns_loading_i').appendTo(lo.el);
			lo.txt = $(div).attr('id', 'ns_loading_p').appendTo(lo.el);
		}
		lo.txt.html(txt);
		return lo.el.show();
	}
	ns.loadHide = function () {
		if (ns.load.el === undefined) {
			$("#ns_loading").hide();
		} else {
			ns.load.el.hide();
		}
		return ns.load.el;
	}
	ns.getRequest = function (name) {
		var url = location.search,
			theRequest = new Object();
		if (url.indexOf("?") != -1) {
			var str = url.substr(1),
				strs = str.split("&");
			for (var i = 0; i < strs.length; i++) {
				theRequest[strs[i].split("=")[0]] = unescape(strs[i].split("=")[1]);
			}
		}
		if (name !== undefined) {
			return theRequest[name];
		}
		return theRequest;
	}
	ns.init = function () {
		ns.$body = $(window.document.body);

	}
	ns.ajaxLock = false;
	window.ns = ns;
	$(function () {
		ns.init();
	});
}(window, Zepto));
(function (window, ns) {
	var defaults = {
		prev: "tpl-",
		tagOpen: "{{",
		tagClose: "}}",
		escape: true,
		compress: true
	},
		opts;
	var tpl = function (template, data, opt) {
		opts = $.extend({}, defaults, opt);
		var isId = new RegExp('^' + opts.prev).test(template);
		return _tpl(template, data, isId);
	}
	var _tpl = function (template, data, isId) {
		if (isId) {
			template = get(template);
		}
		var _render = _compiler(template, data);

		function render(data) {
			try {
				return new _render(data, template) + '';
			} catch (e) {
				throw e;
			}

		}
		render.prototype = _render.prototype;
		render.toString = function () {
			return _render.toString();
		};
		return render(data);
	}
	var get = tpl.get = function (template) {
		return document.getElementById(template).innerHTML.replace(/^\s*|\s*$/g, '');
	}
	var toString = function (value, type) {
		if (typeof value !== 'string') {
			type = typeof value;
			if (type === 'number') {
				value += '';
			} else if (type === 'function') {
				value = toString(value.call(value));
			} else {
				value = '';
			}
		}
		return value;
	};
	var escapeMap = {
		"<": "&#60;",
		">": "&#62;",
		'"': "&#34;",
		"'": "&#39;",
		"&": "&#38;"
	};
	var escapeHTML = function (content) {
		return toString(content)
			.replace(/&(?![\w#]+;)|[<>"']/g, function (v) {
				return escapeMap[v];
			});
	};
	var utils = tpl.utils = {
		get: tpl.get,
		toString: toString,
		escape: escapeHTML,
		ns: ns,
		window: window
	}
	var _compiler = function (template, data) {
		var hasTrim = ''.trim;
		var resultType = hasTrim ? ["_result='';", "_result+=", ";", "_result"] : ["_result=[];", "_result.push(", ");", "_result.join('')"];
		var concat = hasTrim ? "_result+=text;return _result;" : "_result.push(text);";
		var print = "function(){" + "var text=''.concat.apply('',arguments);" + concat + "}";
		var include = "function(data,template){" + "data=data;" + "var text=_utils.get(template,data);" + concat + "}";
		var header = "'use strict';" + "var _utils=this,toString=_utils.toString,";
		var main = resultType[0];
		var footer = "return new String(" + resultType[3] + ");";
		var uniq = {
			_result: 1,
			_data: 1,
			_template: 1,
			_utils: 1,
			$out: 1
		};
		var parseHtml = function (code) {
			if (opts.compress) {
				code = code
					.replace(/\s+/g, ' ')
					.replace(/<!--[\w\W]*?-->/g, '');
			}
			if (code) {
				code = resultType[1] + stringify(code) + resultType[2] + "\n";
			}
			return code;
		};
		var parseLogic = function logic(code) {
			if (parser) {
				code = parser(code);
			}
			if (code.indexOf('=') === 0) {
				var escapeSyntax = opts.escape && !/^=[=#]/.test(code);
				code = code.replace(/^=[=#]?|[\s;]*$/g, '');
				if (escapeSyntax) {
					var name = code.replace(/\s*\([^\)]+\)/, '');
					if (!utils[name] && !/^(print)$/.test(name)) {
						code = "escape(" + code + ")";
					}
				} else {
					code = "toString(" + code + ")";
				}
				code = resultType[1] + code + resultType[2];
			}

			getVariable(code).forEach(function (v) {
				if (!v || uniq[v]) {
					return;
				}
				var value;
				if (v === 'print') {
					value = print;
				} else if (utils[v]) {
					value = "_utils." + v;
				} else {
					value = "_data." + v;
				}
				header += v + "=" + value + ",";
				uniq[v] = true;
			})

			return code + "\n";
		}
		template.split(opts.tagOpen).forEach(function (v) {
			v = v.split(opts.tagClose);
			if (v.length === 1) {
				main += parseHtml(v[0])
			} else {
				main += parseLogic(v[0]);
				if (v[1]) {
					main += parseHtml(v[1]);
				}
			}
		});
		var code = header + main + footer;
		try {
			var render = new Function("_data", "_template", code);
			render.prototype = utils;
			return render;
		} catch (e) {
			e.temp = "function anonymous(_data,_template) {" + code + "}";
			throw e;
		}
	}

	function stringify(code) {
		return "'" + code
			.replace(/('|\\)/g, '\\$1')
			.replace(/\r/g, '\\r')
			.replace(/\n/g, '\\n') + "'";
	}
	var parser = function (code) {
		code = code.replace(/^\s*|\s*$/g, '');
		var split = code.split(' ');
		var key = split.shift();
		var args = split.join(' ');
		switch (key) {
			case 'if':
				code = 'if(' + args + '){';
				break;
			case 'else':
				if (split.shift() === 'if') {
					split = ' if(' + split.join(' ') + ')';
				} else {
					split = '';
				}
				code = '}else' + split + '{';
				break;
			case '/if':
				code = '}';
				break;
			case 'for':
				var keys = split[0].split(",");
				var value = keys[0] || '_value';
				var index = keys[1] || '_index';
				var _in = split[1] || 'in';
				var _object = split[2] || '_data';
				var param = value + ',' + index;
				if (_in !== 'in') {
					_object = '[]';
				}
				code = 'if (!' + _object + '){' + _object + '=[]} ' + _object + '.forEach(function(' + param + '){';
				break;
			case '/for':
				code = '});';
				break;
			case 'echo':
				code = 'print(' + args + ');';
				break;
			default:
				if (/^\s*\|\s*[\w\$]/.test(args)) {
					var escape = true;
					if (code.indexOf('#') === 0) {
						code = code.substr(1);
						escape = false;
					}
					var i = 0;
					var array = code.split('|');
					var len = array.length;
					var val = array[i++];
					for (; i < len; i++) {
						val = filtered(val, array[i]);
					}
					code = (escape ? '=' : '=#') + val;
				} else {
					code = '=' + code;
				}
				break;
		}
		return code;
	};
	var KEYWORDS =
		'break,case,catch,continue,debugger,default,delete,do,else,false' + ',finally,for,function,if,in,instanceof,new,null,return,switch,this' + ',throw,true,try,typeof,var,void,while,with' + ',abstract,boolean,byte,char,class,const,double,enum,export,extends' + ',final,float,goto,implements,import,int,interface,long,native' + ',package,private,protected,public,short,static,super,synchronized' + ',throws,transient,volatile' + ',arguments,let,yield' + ',undefined';
	var REMOVE_RE = /\/\*[\w\W]*?\*\/|\/\/[^\n]*\n|\/\/[^\n]*$|"(?:[^"\\]|\\[\w\W])*"|'(?:[^'\\]|\\[\w\W])*'|\s*\.\s*[$\w\.]+/g;
	var SPLIT_RE = /[^\w$]+/g;
	var KEYWORDS_RE = new RegExp(["\\b" + KEYWORDS.replace(/,/g, '\\b|\\b') + "\\b"].join('|'), 'g');
	var NUMBER_RE = /^\d[^,]*|,\d[^,]*/g;
	var BOUNDARY_RE = /^,+|,+$/g;
	var SPLIT2_RE = /^$|,+/;

	function getVariable(code) {
		return code
			.replace(REMOVE_RE, '')
			.replace(SPLIT_RE, ',')
			.replace(KEYWORDS_RE, '')
			.replace(NUMBER_RE, '')
			.replace(BOUNDARY_RE, '')
			.split(SPLIT2_RE);
	};
	ns.tpl = tpl;
})(window, window.ns)

function utc2local(date) {
	return new Date(date.replace(/t/i, ' ').replace(/z/i, ' ').replace(/-/g, '/')).getTime() + 1000 * 60 * 60 * 8
}

function noXss(str) {
	return new Option(str).innerHTML;
}