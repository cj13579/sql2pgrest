# sql2pgrest

sql2pgrest allows you to convert standard SQL queries into PostgREST URLs.

## Example

```html
<div class="row">
    <div class="mb-3">
        <label for="queryInput" class="form-label">Enter your SQL query:</label>
        <textarea class="form-control" id="queryInput" rows="6"></textarea>
    </div>
    <div class="mb-3">
        <button type="button" name="convert2Postgrest" class="btn btn-primary" onclick="convertToPostgREST()">Convert!</button>
    </div>
    
    <div class="mb-3">
        <h3>PostgREST URI:</h3>
        <p id="pgUrl"></p>
    </div>
</div>
...
<script src="sql2pgrest.min.js"></script>
<script>
    function convertToPostgREST() {
        var data = document.getElementById('queryInput').value;
        result = sql2postgrest(data);
        if (result) {
            if (result.success) {
                log("SUCCESS: Query converted.", "success")
                document.getElementById("pgUrl").textContent=result.message;
            } else {
                log("ERROR: Unable to convert query.", "error")
                document.getElementById("pgUrl").textContent=result.message;
            }
        } else {
            log("things have gone badly for us.")
        }
    }
</script>
```

## Contributions

This is by no means finished. There are a bunch of unsupported PostgREST operators, basic AF JSONB support, and this is the first thing I have ever written in JavaScript. Please help. Ta.
