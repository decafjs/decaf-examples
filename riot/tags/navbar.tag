<navbar>
    <nav class="navbar navbar-default">
        <div class="container-fluid">
            <navbar-header brand={opts.brand}></navbar-header>
            <navbar-links active="{opts.active}"></navbar-links>
        </div>
    </nav>
</navbar>

<navbar-header>
    <div class="navbar-header">
        <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1">
            <span class="sr-only">Toggle navigation</span>
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
        </button>
        <navbar-brand name={opts.brand}></navbar-brand>
    </div>
</navbar-header>

<navbar-brand>
    <a class="navbar-brand" href="#">{ opts.name }</a>
</navbar-brand>

<navbar-links>
    <div class="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
        <ul class="nav navbar-nav">
            <li each="{items}" text={text} active={active} class={active: text === parent.active}><a href={href}>{text}</a>
        </ul>
    </div>
    this.active = opts.active;
    this.items = [
        { href: '#', text: 'link1' },
        { href: '#', text: 'link2' },
        { href: '#', text: 'link3' },
        { href: '#', text: 'link4' },
        { href: '#', text: 'link5' },
        { href: '#', text: 'link6' }
    ];
</navbar-links>
