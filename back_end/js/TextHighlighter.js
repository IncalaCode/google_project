/*
The MIT License (MIT)

Copyright (c) 2011 - 2014 mirz <mirz.hq@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/
(function (l) {
    function t(a, b) { return e(a).color() === e(b).color() } function p(a, b) { a = a || {}; for (var c in b) b.hasOwnProperty(c) && void 0 === a[c] && (a[c] = b[c]); return a } function m(a) { return a.filter(function (a, c, d) { return d.indexOf(a) === c }) } function h(a, b) { a.sort(function (a, d) { return e(b ? d : a).parents().length - e(b ? a : d).parents().length }) } function v(a) {
        var b = [], c = {}, d = []; a.forEach(function (a) { var d = a.getAttribute("data-timestamp"); "undefined" === typeof c[d] && (c[d] = [], b.push(d)); c[d].push(a) }); b.forEach(function (a) {
            var b =
                c[a]; d.push({ chunks: b, timestamp: a, toString: function () { return b.map(function (a) { return a.textContent }).join("") } })
        }); return d
    } function w(a, b) { a.addEventListener("mouseup", b.highlightHandler.bind(b)); a.addEventListener("touchend", b.highlightHandler.bind(b)) } function g(a, b) {
        if (!a) throw "Missing anchor element"; this.el = a; this.options = p(b, { color: "#ffff7b", highlightedClass: "highlighted", contextClass: "highlighter-context", onRemoveHighlight: function () { return !0 }, onBeforeHighlight: function () { return !0 }, onAfterHighlight: function () { } });
        e(this.el).addClass(this.options.contextClass); w(this.el, this)
    } var u = "SCRIPT STYLE SELECT OPTION BUTTON OBJECT APPLET VIDEO AUDIO CANVAS EMBED PARAM METER PROGRESS".split(" "), e = function (a) {
        return {
            addClass: function (b) { a.classList ? a.classList.add(b) : a.className += " " + b }, removeClass: function (b) { a.classList ? a.classList.remove(b) : a.className = a.className.replace(new RegExp("(^|\\b)" + b + "(\\b|$)", "gi"), " ") }, prepend: function (b) { b = Array.prototype.slice.call(b); for (var c = b.length; c--;)a.insertBefore(b[c], a.firstChild) },
            append: function (b) { b = Array.prototype.slice.call(b); for (var c = 0, d = b.length; c < d; ++c)a.appendChild(b[c]) }, insertAfter: function (b) { return b.parentNode.insertBefore(a, b.nextSibling) }, insertBefore: function (b) { return b.parentNode.insertBefore(a, b) }, remove: function () { a.parentNode.removeChild(a); a = null }, contains: function (b) { return a !== b && a.contains(b) }, wrap: function (b) { a.parentNode && a.parentNode.insertBefore(b, a); b.appendChild(a); return b }, unwrap: function () {
                var b = Array.prototype.slice.call(a.childNodes), c;
                b.forEach(function (a) { c = a.parentNode; e(a).insertBefore(a.parentNode); e(c).remove() }); return b
            }, parents: function () { for (var b, c = []; b = a.parentNode;)c.push(b), a = b; return c }, normalizeTextNodes: function () { if (a) { if (3 === a.nodeType) for (; a.nextSibling && 3 === a.nextSibling.nodeType;)a.nodeValue += a.nextSibling.nodeValue, a.parentNode.removeChild(a.nextSibling); else e(a.firstChild).normalizeTextNodes(); e(a.nextSibling).normalizeTextNodes() } }, color: function () { return a.style.backgroundColor }, fromHTML: function (a) {
                var c =
                    document.createElement("div"); c.innerHTML = a; return c.childNodes
            }, getRange: function () { var b = e(a).getSelection(), c; 0 < b.rangeCount && (c = b.getRangeAt(0)); return c }, removeAllRanges: function () { e(a).getSelection().removeAllRanges() }, getSelection: function () { return e(a).getWindow().getSelection() }, getWindow: function () { return e(a).getDocument().defaultView }, getDocument: function () { return a.ownerDocument || a }
        }
    }; g.prototype.destroy = function () {
        var a = this.el; a.removeEventListener("mouseup", this.highlightHandler.bind(this));
        a.removeEventListener("touchend", this.highlightHandler.bind(this)); e(this.el).removeClass(this.options.contextClass)
    }; g.prototype.highlightHandler = function () { this.doHighlight() }; g.prototype.doHighlight = function (a) { var b = e(this.el).getRange(), c, d; b && !b.collapsed && (!0 === this.options.onBeforeHighlight(b) && (d = +new Date, c = g.createWrapper(this.options), c.setAttribute("data-timestamp", d), c = this.highlightRange(b, c), c = this.normalizeHighlights(c), this.options.onAfterHighlight(b, c, d)), a || e(this.el).removeAllRanges()) };
    g.prototype.highlightRange = function (a, b) {
        var c; if (!a || a.collapsed) return []; var d = a.startContainer; c = a.endContainer; var r = a.commonAncestorContainer, n = !0; if (0 === a.endOffset) { for (; !c.previousSibling && c.parentNode !== r;)c = c.parentNode; c = c.previousSibling } else 3 === c.nodeType ? a.endOffset < c.nodeValue.length && c.splitText(a.endOffset) : 0 < a.endOffset && (c = c.childNodes.item(a.endOffset - 1)); 3 === d.nodeType ? a.startOffset === d.nodeValue.length ? n = !1 : 0 < a.startOffset && (d = d.splitText(a.startOffset), c === d.previousSibling &&
            (c = d)) : d = a.startOffset < d.childNodes.length ? d.childNodes.item(a.startOffset) : d.nextSibling; var f = n, n = !1, r = [], k; do f && 3 === d.nodeType && (-1 === u.indexOf(d.parentNode.tagName) && "" !== d.nodeValue.trim() && (f = b.cloneNode(!0), f.setAttribute("data-highlighted", !0), k = d.parentNode, e(this.el).contains(k) || k === this.el) && (f = e(d).wrap(f), r.push(f)), f = !1), d !== c || c.hasChildNodes() && f || (n = !0), d.tagName && -1 < u.indexOf(d.tagName) && (c.parentNode === d && (n = !0), f = !1), f && d.hasChildNodes() ? d = d.firstChild : d.nextSibling ? (d = d.nextSibling,
                f = !0) : (d = d.parentNode, f = !1); while (!n); return r
    }; g.prototype.normalizeHighlights = function (a) { this.flattenNestedHighlights(a); this.mergeSiblingHighlights(a); a = a.filter(function (a) { return a.parentElement ? a : null }); a = m(a); a.sort(function (a, c) { return a.offsetTop - c.offsetTop || a.offsetLeft - c.offsetLeft }); return a }; g.prototype.flattenNestedHighlights = function (a) {
        function b() {
            var b = !1; a.forEach(function (c, f) {
                var k = c.parentElement, g = k.previousSibling, h = k.nextSibling; d.isHighlight(k) && (t(k, c) ? (k.replaceChild(c.firstChild,
                    c), a[f] = k, b = !0) : (c.nextSibling || (e(c).insertBefore(h || k), b = !0), c.previousSibling || (e(c).insertAfter(g || k), b = !0), k.hasChildNodes() || e(k).remove()))
            }); return b
        } var c, d = this; h(a, !0); do c = b(); while (c)
    }; g.prototype.mergeSiblingHighlights = function (a) { function b(a, b) { return b && 1 === b.nodeType && t(a, b) && c.isHighlight(b) } var c = this; a.forEach(function (a) { var c = a.previousSibling, n = a.nextSibling; b(a, c) && (e(a).prepend(c.childNodes), e(c).remove()); b(a, n) && (e(a).append(n.childNodes), e(n).remove()); e(a).normalizeTextNodes() }) };
    g.prototype.setColor = function (a) { this.options.color = a }; g.prototype.getColor = function () { return this.options.color }; g.prototype.removeHighlights = function (a) { function b(a) { e(a).unwrap().forEach(function (a) { var b = a.previousSibling, c = a.nextSibling; b && 3 === b.nodeType && (a.nodeValue = b.nodeValue + a.nodeValue, e(b).remove()); c && 3 === c.nodeType && (a.nodeValue += c.nodeValue, e(c).remove()) }) } a = this.getHighlights({ container: a || this.el }); var c = this; h(a, !0); a.forEach(function (a) { !0 === c.options.onRemoveHighlight(a) && b(a) }) };
    g.prototype.getHighlights = function (a) { a = p(a, { container: this.el, andSelf: !0, grouped: !1 }); var b = a.container.querySelectorAll("[data-highlighted]"), b = Array.prototype.slice.call(b); !0 === a.andSelf && a.container.hasAttribute("data-highlighted") && b.push(a.container); a.grouped && (b = v(b)); return b }; g.prototype.isHighlight = function (a) { return a && 1 === a.nodeType && a.hasAttribute("data-highlighted") }; g.prototype.serializeHighlights = function () {
        var a = this.getHighlights(), b = this.el, c = []; h(a, !1); a.forEach(function (a) {
            var e =
                0, g = a.textContent.length, f = a, k = [], h; do h = Array.prototype.slice.call(f.parentNode.childNodes), k.unshift(h.indexOf(f)), f = f.parentNode; while (f !== b || !f); f = a.cloneNode(!0); f.innerHTML = ""; f = f.outerHTML; a.previousSibling && 3 === a.previousSibling.nodeType && (e = a.previousSibling.length); c.push([f, a.textContent, k.join(":"), e, g])
        }); return JSON.stringify(c)
    }; g.prototype.deserializeHighlights = function (a) {
        var b, c = [], d = this; if (!a) return c; try { b = JSON.parse(a) } catch (g) { throw "Can't parse JSON: " + g; } b.forEach(function (a) {
            try {
                for (var b =
                    a[0], g = a[2].split(":"), h = a[3], m = a[4], l = g.pop(), s = d.el, q, p, r; r = g.shift();)s = s.childNodes[r]; s.childNodes[l - 1] && 3 === s.childNodes[l - 1].nodeType && --l; s = s.childNodes[l]; q = s.splitText(h); q.splitText(m); q.nextSibling && !q.nextSibling.nodeValue && e(q.nextSibling).remove(); q.previousSibling && !q.previousSibling.nodeValue && e(q.previousSibling).remove(); p = e(q).wrap(e().fromHTML(b)[0]); c.push(p)
            } catch (t) { console && console.warn && console.warn("Can't deserialize highlight descriptor. Cause: " + t) }
        }); return c
    }; g.prototype.find =
        function (a, b) { var c = e(this.el).getWindow(), d = c.scrollX, g = c.scrollY, h = "undefined" === typeof b ? !0 : b; e(this.el).removeAllRanges(); if (c.find) for (; c.find(a, h);)this.doHighlight(!0); else if (c.document.body.createTextRange) { var f = c.document.body.createTextRange(); for (f.moveToElementText(this.el); f.findText(a, 1, h ? 4 : 0) && (e(this.el).contains(f.parentElement()) || f.parentElement() === this.el);)f.select(), this.doHighlight(!0), f.collapse(!1) } e(this.el).removeAllRanges(); c.scrollTo(d, g) }; g.createWrapper = function (a) {
            var b =
                document.createElement("span"); b.style.backgroundColor = a.color; b.className = a.highlightedClass; return b
        }; l.TextHighlighter = g
})(window); (function (l) { function t(l, m) { return function () { m.call(this, l) } } l.fn.getHighlighter = function () { return this.data("textHighlighter") }; l.fn.textHighlighter = function (p) { return this.each(function () { var m = this, h; l.data(m, "textHighlighter") || (h = new TextHighlighter(m, p), h.destroy = t(h.destroy, function (p) { p.call(h); l(m).removeData("textHighlighter") }), l.data(m, "textHighlighter", h)) }) } })(jQuery);
