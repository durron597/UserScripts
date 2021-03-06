// ==UserScript==
// @name         @Closey command auto complete
// @namespace    https://github.com/SO-Close-Vote-Reviewers/UserScripts
// @version      0.2
// @description  command completion for bot commands
// @author       rene
// @match        *://chat.stackoverflow.com/rooms/41570/so-close-vote-reviewers
// @grant        none
// ==/UserScript==

/*global $:false, document:false, console:false */
function startAutoComplete(jquery) {
  "use strict";
    if (!String.prototype.startsWith) {
        Object.defineProperty(String.prototype, 'startsWith', {
            enumerable: false,
            configurable: false,
            writable: false,   
            value: function (searchString, position) {
                position = position || 0;
                return this.lastIndexOf(searchString, position) === position;
            }
        });
    }

    var $ = jquery,
        inp = $('#input'),  // where we type messages
        parse = /(@closey\s+)([\w|\W]+)/i, // //parse botname and commands
        cmds = [
             // public
            'alive',
            'commands',
            'help',
            'running commands',
            'status',
             // Registered
            'audit stats', // - Shows stats about your recorded audits.
            'completed tags', // [min <#>] - Shows the latest tags that have been completed by multiple people.
            'current session', // - Tells if the user has an open session or not, and when it started.
            'current tag', // - Get the tag that has the most amount of manageable close queue items from the SEDE query.
            'end session', // - If a user has an open review session this command will force end that session.
            'last session stats', // - Shows stats about your last review session.
            'last session edit count', // <new count> - Edits the number of reviewed items in your last review session.
            'next', // <#> tags - Displays the first X tags from the SEDE query to focus on.
            'refresh tags', // - Forces a refresh of the tags obtained from the SEDE query.
            'start event', // - Shows the current stats from the /review/close/stats page and the next 3 tags to work on.
            'starting', // - Informs the chatbot that you are starting a new review session.
            'stats', // - Shows the stats at the top of the /review/close/stats page.
            // owner
            'add user',
            'track user', // <chat id> - Adds the user to the registered users list.
            'stop bot'// - The bot will leave the chat room and quit the running application.
        ]; // all known commands

    // clear all hints and remove click handlers
    function clearHints() {
        $('#closey').find('li').each(function () { $(this).off('click'); });
        $('#closey').remove();
    }

    // put the choose hint in the chat message text area
    function complete(bot, command) {
        return function () {
            inp.val(bot + command);
            clearHints();
        };
    }

    // build on single le that holds the hint
    function buildHint(value, bot) {
        var li = $('<li></li>')
            .css('display', 'inline-block')
            .css('margin-left', '3px')
            .css('margin-right', '3px')
            .css('padding', '2px')
            .css('border', 'solid 1px blue')
            .text(value);
        li.on('click', complete(bot, value));
        return li;
    }

    function highlight(li) {
        li.addClass('tab');
        li.css('background-color', 'yellow');
        return li.text();
    }
    function highlightNextHint() {
        var setnext = false,
            lif,
            selected;
        $('#closey').find('li').each(function () {
            var li = $(this);
            if (li.hasClass('tab')) {
                setnext = true;
                li.removeClass('tab');
                li.css('background-color', 'white');
            } else {
                if (setnext) {
                    selected = highlight(li);
                    return false;
                }
            }
        });
        if (!setnext) {
            lif = $('#closey').find('li');
            if (lif.length > 0) {
                selected = highlight($(lif[0]));
                setnext = true;
            }
        }
        return selected;
    }

    function handleKey(cmd, bot) {
        var botcmd,
            c,
            container;

        clearHints();
        container = $('<ul id="closey"></ul>').css('text-align', 'left');
        for (c = 0; c < cmds.length; c = c + 1) {
            botcmd = cmds[c];
            if (botcmd.startsWith(cmd) && botcmd !== cmd) {
                container.append(buildHint(botcmd, bot));
            }
        }
        $('#tabcomplete-container').append(container);
    }

    $(document).on('keydown', function (k) {
        var BOT = 1,
            COMMAND = 2,
            result = parse.exec(inp.val()),
            selected;

        if (result !== null &&
                result.length > COMMAND &&
                k.keyCode === 9) {
            selected = highlightNextHint();
            if (selected !== undefined) {
                k.preventDefault();
                k.stopPropagation();
                inp.val(result[BOT] + selected);
                return true;
            }
        }
    });

    inp.on('keyup', function (e) {
        var BOT = 1,
            COMMAND = 2,
            result = parse.exec(e.result);
        console.log(e);
        console.log(result);
        if (e.keyCode !== 9) {
            if (result !== null &&
                    result.length > COMMAND) {
                handleKey(result[COMMAND], result[BOT]);
            } else {
                clearHints();
            }
        }
    });
}

function getJquery() {
  "use strict";
    return $ || unsafeWindow.jQuery;
}

window.addEventListener('load',
    function() {
        startAutoComplete(getJquery());
    });
