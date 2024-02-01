// var operators = {
//     gt: ">",
//     gte: ">=",
//     lt: "<",
//     lte: "<=",
//     neq: "!=",
//     eq: "=",
//     neq: "<>",
//     like: "like",
//     ilike: "ilike",
//     match: "~",
//     imatch: "imatch",
//     in: "in",
//     is: "is",
//     isdistinct: "is distinct from",
//     fts: "@@",
//     plfts: "@@",
//     phfts: "@@",
//     wfts: "@@",
//     cs: "@>",
//     cd: "<@",
//     sl: "<<",
//     sr: ">>",
//     nxr: "&<",
//     nxl: "&>",
//     adj: "-|-",
//     not: "not",
//     or: "or",
//     and: "and",
//     all: "all",
//     any: "any"
//     // etc.
// };

var operators = [
    {
        pg: "gte",
        sql: ">="
    },
    {
        pg: "lte",
        sql: "<="
    },
    {
        pg: "neq",
        sql: "<>"
    },
    {
        pg: "ilike",
        sql: "ilike"
    },
    {
        pg: "like",
        sql: "like"
    },
    {
        pg: "match",
        sql: "~"
    },
    {
        pg: "imatch",
        sql: "imatch"
    },
    {
        pg: "in",
        sql: "in"
    },
    {
        pg: "is",
        sql: "is"
    },
    {
        pg: "gt",
        sql: ">"
    },
    {
        pg: "lt",
        sql: "<"
    },
    {
        pg: "neq",
        sql: "!="
    },
    {
        pg: "eq",
        sql: "="
    }
];

var singleLineRegexes = [
    RegExp("(select|SELECT)\\s(.*)\\s(from|FROM)\\s(\\w+)\\s(where|WHERE)(.*)\\s(order\\sby|ORDER\\sBY)(.*)"),
    RegExp("(select|SELECT)\\s(.*)\\s(from|FROM)\\s(\\w+)\\s(where|WHERE)(.*)"),
    RegExp("(select|SELECT)\\s(.*)\\s(from|FROM)\\s(\\w+)", "g")
]

function log(msg, color) {
    // Courtesy of: https://stackoverflow.com/a/25042340
    // log("hey"); // Will be black
    // log("Hows life?", "green"); // Will be green
    // log("I did it", "success"); // Styled so as to show how great of a success it was!
    // log("FAIL!!", "error"); // Red on black!
    // var someObject = {prop1: "a", prop2: "b", prop3: "c"};
    // log(someObject); // prints out object
    // log("someObject", someObject); // prints out "someObect" in blue followed by the someObject

    color = color || "black";
    bgc = "White";
    switch (color) {
        // case "success":  color = "Green";      bgc = "LimeGreen";       break;
        // case "info":     color = "DodgerBlue"; bgc = "Turquoise";       break;
        // case "error":    color = "Red";        bgc = "Black";           break;
        // case "error":    color = "Red";        bgc = "Black";           break;
        // case "start":    color = "OliveDrab";  bgc = "PaleGreen";       break;
        // case "warning":  color = "Tomato";     bgc = "Black";           break;
        // case "end":      color = "Orchid";     bgc = "MediumVioletRed"; break;
        case "success":  color = "Green";      bgc = "White"; break;
        case "info":     color = "DodgerBlue"; bgc = "White"; break;
        case "error":    color = "Red";        bgc = "White"; break;
        case "error":    color = "Red";        bgc = "White"; break;
        case "start":    color = "OliveDrab";  bgc = "White"; break;
        case "warning":  color = "Tomato";     bgc = "White"; break;
        case "end":      color = "Orchid";     bgc = "White"; break;
        default: color = color;
    }

    if (typeof msg == "object") {
        console.log(msg);
    } else if (typeof color == "object") {
        console.log("%c" + msg, "color: PowderBlue;font-weight:bold; background-color: RoyalBlue;");
        console.log(color);
    } else {
        console.log("%c" + msg, "color:" + color + ";font-weight:bold; background-color: " + bgc + ";");
    }
}

function sql2postgrest(query) {
    // TODO: work out if there are any unsupported operators: https://postgrest.org/en/stable/references/api/tables_views.html#operators
    // TODO: handle JSON data filtering better (currently strips some things): https://postgrest.org/en/stable/references/api/tables_views.html#json-columns

    query = splitLines(query).join(" ");
    log("Submitted query: "+ query)

    function checkValid(query) {
        var valid = true;
        var checks = [
            new RegExp(".*((join|JOIN)\\s)", "g"),
            new RegExp(".*((group by|GROUP BY)\\s)", "g")
        ]

        for (let index = 0; index < checks.length; index++) {
            const element = checks[index];
            var check = element.exec(query);
            if (check){
                valid = false;
                break;
            }
        }

        return valid;
    }

    function splitLines(t) { 
        return t.split(/\r\n|\r|\n/); 
    }

    function getOperator(line) {

        var op = '';

        for (let index = 0; index < operators.length; index++) {
            const element = operators[index];
            if ( line.indexOf(element.sql) != -1 ) {
                fields = line.split(element.sql)
                op = fields[0].trim() + '=' + element.pg + '.' + encodeURIComponent(fields[1].trim())
                break
            }
        }

        return op
        
    }

    function addFilterItem(newItem, filter) {
        if ( filter == '' ){
            return newItem
        } else {
            return filter + '&' + newItem
        }
    }

    function filterBuilder(filters, filter) {
        if ( filters.length > 0 ) {

            filters = filters.replaceAll(' AND ', ' and ');
            
            if ( filters.indexOf("and") != -1) {
                filters.split("and").forEach(element => {
                    newItem = getOperator(element.trim());
                    if (newItem.length > 0 ) {
                        filter = addFilterItem(newItem, filter);
                    }
                });
            } else {
                // single where clause
                newItem = getOperator(filters);
                if (newItem.length > 0 ) {
                    filter = addFilterItem(newItem, filter);
                }
            }

            return filter;

            // if ( filters.indexOf("and") == -1  && filters.indexOf("AND") == -1 ){
            //     newItem = getOperator(filters);
            //     filter = addFilterItem(newItem, filter);
            // } else {

            // }
        }
        return filter
    }

    if ( ! checkValid(query) ){ 
        console.log("Query: " + query + " is invalid!"); 
        return {
            "success" : false,
            "message" : "This query isn't valid in PostgREST. It probably uses a join or a group by.",
        }
    } 

    function orderBuilder(columns){
        var direction = '';
        var order = '';
        // check if there is a direction
        var dir = new RegExp("(.*)(asc|ASC|desc|DESC)").exec(columns)
        if (dir){
            columns = dir[1].trim()
            direction = dir[2].toLowerCase();
        }

        if ( columns.indexOf(',') != -1 ){
            var cols = columns.split(',')
            for (let index = 0; index < cols.length; index++) {
                const element = cols[index].trim();
                if (index == 0 ){
                    order += element + '.' + direction
                } else {
                    order += ',' + element + '.' + direction
                }
            }
        } else {
            if (direction.length > 0 ){
                order += columns + '.' + direction ;
            } else {
                order += columns;
            }
        }
        return order
    }
    var success = false;
    var filter = '';
    var order = '';
    
    for (let index = 0; index < singleLineRegexes.length; index++) {
        const element = singleLineRegexes[index];
        var bits = element.exec(query)
        if ( bits ){
            var table = bits[4].trim()
            var columns = bits[2].replace(/\s+/g, '');
            var url = '/' + table + '?'

            if (bits.length >= 6){
                var filters = bits[6].trim().replaceAll('\'', '')
                filter = filterBuilder(filters, filter)
            }

            if ( columns != "*" ) {
                url += 'select=' + columns
                if (filter.length > 0 ){
                    url += '&'
                }
            }

            url += filter
            
            if (index == 0 ){
                order = orderBuilder(bits[8].trim());
                // ordering with direction found
                if (filter.length > 0 || columns != "*" ) {
                    url += '&order=' 
                } else {
                    url += 'order=' 
                }
                url += order;

            }
            success = true
            break
        }            
    }
    
    if (success){
        return {
            "success" : success,
            "message" : url,
        }
    } else {
        return {
            "success" : success,
            "message" : "Unable to process query. Sorry!",
        }
    }

}   

// TESTS!
// sql2postgrest("select county,population\nfrom users \nwhere country='USA'\nand state = 'CA'\nand population > 12355")
// sql2postgrest("select a.id,b.name from users as a join items as b where a.state='CA'")
// sql2postgrest("select * from users where name='Chris' and state = 'CA'")
// sql2postgrest("select * from users where age != 12 order by name,age desc")

log("sql2postgREST initalized!")
