<todo>
    <ul>
        <li each={ item, i in items }>{ item }</li>
    </ul>

    <form onsubmit={ handleSubmit }>
        <input>
        <button>Add #{ items.length + 1 }</button>
    </form>
    <script>
        this.items = [];

        this.handleSubmit = function( e ) {
            var input = e.target[ 0 ]
            this.items.push(input.value)
            input.value = ''
        }
    </script>
</todo>