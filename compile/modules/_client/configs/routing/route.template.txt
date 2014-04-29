"use strict";

define(function (require) {
    return function(match) {
        <% _.forEach(routes(),function(item){%>match('<%= item.route %>',<%= JSON.stringify(_.omit(item, ['route'])) %>);
        <%});%>
    };
});