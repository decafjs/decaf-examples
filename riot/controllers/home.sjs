/*global require, req, res */

var Page = require('Page'),
    page = new Page(req, res);

page.addScript('tags/navbar.tag');
page.addScript('tags/todo.tag');
page.render('home', { title: 'Riot demo'});
