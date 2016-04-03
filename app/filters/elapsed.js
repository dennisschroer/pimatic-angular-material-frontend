angular.module('pimaticApp').filter('elapsed', function () {
    return function (time) {
        var hours, output, minutes;

        hours = Math.floor(time / 3600);
        output = hours > 9 ? hours : "0" + hours;
        time -= hours * 3600;

        minutes = Math.floor(time / 60);
        output += ":" + (minutes > 9 ? minutes : "0" + minutes);
        time -= minutes * 60;

        output += ":" + (time > 9 ? time : "0" + time);

        return output;
    };
});
