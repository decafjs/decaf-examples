/**
 * Page class
 *
 * manages list of tags/components to be included in a page and renders a page of HTML via HoganJS template.
 *
 * A controller (.sjs file) will typically instantiate a page, add scripts and tag files to the instance,
 * create an object to be rendered via HoganJS template and call the render() function.
 */


/*global require */

var TemplateManager = require('decaf-hoganjs').TemplateManager,
    viewManager     = new TemplateManager('views');

function Page( req, res ) {
    this.req = req;
    this.res = res;
    this._scripts = [
        'bower_components/jquery/dist/jquery.min.js',
        'bower_components/bootstrap/dist/js/bootstrap.min.js',
        "bower_components/riot/riot.js"
    ];
    this._css = [
        'bower_components/bootstrap/dist/css/bootstrap.min.css',
        'bower_components/bootstrap/dist/css/bootstrap-theme.min.css'
    ];
}

decaf.extend(Page.prototype, {
    addStylesheet: function(path) {
        var me = this,
            paths = Array.prototype.slice.call(arguments, 0);
        decaf.each(paths, function( path ) {
            me._css.push(path);
        });
    },
    addScript     : function( path ) {
        var me = this,
            paths = Array.prototype.slice.call(arguments, 0);
        decaf.each(paths, function( path ) {
            me._scripts.push(path);
        });
    },
    render : function( tpl, o ) {
        o.css = this._css.concat(o.css || []);
        o.scripts = this._scripts.concat(o.scripts || []);
        if (!o.title) {
            o.title = '';
        }
        this.res.send(viewManager[tpl].render(o, viewManager));
    }
});

module.exports = Page;
