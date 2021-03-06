var Chat = function (bindTo) {
    var el = bindTo;
    var messages = [];
    var contexts = {
        OOC: {
            markup: [
                [/((\W|^)\*)([^*]*)(\*(\W|$))/, '<b>', '</b>'],
                [/((\W|^)\/)([^\/]*)(\/(\W|$))/, '<i>', '</i>'],
                [/((\W|^)~)([^~]*)(~(\W|$))/, '<strike>', '</strike>'],
                [/((\W|^)_)([^_]*)(_(\W|$))/, '<u>', '</u>']
            ]
        },
        LOOC: {
            markup: [
                [/((\W|^)\*)([^*]*)(\*(\W|$))/, '<b>', '</b>'],
                [/((\W|^)\/)([^\/]*)(\/(\W|$))/, '<i>', '</i>'],
                [/((\W|^)~)([^~]*)(~(\W|$))/, '<strike>', '</strike>'],
                [/((\W|^)_)([^_]*)(_(\W|$))/, '<u>', '</u>']
            ]
        },
        IC: {
            markup: [
                [/((\W|^)\*)([^*]*)(\*(\W|$))/, '<b>', '</b>'],
                [/((\W|^)\/)([^\/]*)(\/(\W|$))/, '<i>', '</i>']
            ]
        },
        LOGS: {
            markup: []
        },
        MSAY: {
            markup: []
        },
        ASAY: {
            markup: []
        },
        PMS: {
            markup: []
        }
    };

    var tabs = {
        // Global OOC tab
        OOC:    {OOC: contexts.OOC, MSAY: contexts.MSAY, ASAY: contexts.ASAY, PMS: contexts.PMS},
        // IC tab
        IC:     {IC: contexts.IC, LOOC: contexts.LOOC, PMS: contexts.PMS},
        // Admin tab
        ADMIN:  {LOGS: contexts.LOGS},
        // Custom tab
        CUSTOM: {}
    };

    var maxMessages = 50000;
    var cullMessages = 5000;
    var tabMax = 1000;

    var currentTab = tabs.OOC;
    var currentSize = 0;

    // check if a tab should show this message
    function messageMatches(tab, message) {
        if (tab[message.context]) {
            return true;
        }
        return false;
    }

    // turn message into html
    function nodeFromMessage(message) {
        var text = message.context + ': ' + parseMarkup(message, currentTab);

        var div = document.createElement('div');
        div.innerHTML = text;
        return div;
    }

    function displayMessage(message) {
        var node = nodeFromMessage(message);
        el.appendChild(node);
        currentSize += 1;

        if (currentSize > tabMax) {
            el.removeChild(el.firstChild);
            currentSize -= 1;
        }

        // Autoscroll the thing if we're near the bottom.
        if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 10) {
            node.scrollIntoView();
        }
    }

    function parseMarkup(message, tab) {
        var msg = message.content;
        for (var i = 0; i < tab[message.context].markup.length; i++) {
            msg = msg.replace(tab[message.context].markup[i][0], '$2' + tab[message.context].markup[i][1] + '$3' + tab[message.context].markup[i][2] + '$5');
        }
        return msg;
    }

    // public functions

    return {
        addMessage: function addMessage(message) {
            var parsed = JSON.parse(message);
            messages.push(parsed);
            if (messageMatches(currentTab, parsed)) {
                displayMessage(parsed);
            }
            if (messages.length > maxMessages) {
                messages = messages.slice(cullMessages);
            }
        },

        swapTab: function swapTab(tab) {
            currentTab = tabs[tab];
            currentSize = 0;

            // build an array of messages for the new tab
            var curMessage = messages.length - 1;
            var backwardMessages = [];
            while (curMessage >= 0 && currentSize < tabMax) {
                if (messageMatches(currentTab, messages[curMessage])) {
                    backwardMessages.push(messages[curMessage]);
                    currentSize += 1;
                }
                curMessage -= 1;
            }

            // build a new div and swap it with our current one
            var old = el;
            el = el.cloneNode(false);

            for (var i = backwardMessages.length - 1; i >= 0; i--) {
                el.appendChild(nodeFromMessage(backwardMessages[i]));
            }

            old.parentNode.replaceChild(el, old);

            // Scroll the last node into view if our new tab is longer than the
            // old one.
            if (el.lastChild) {
                el.lastChild.scrollIntoView();
            }
        },

        toggleMixed: function toggleMixed(context) {
            if (tabs.CUSTOM.hasOwnProperty(context)) {
                delete tabs.CUSTOM[context];
                document.getElementById(context).className = '';
            }
            else {
                tabs.CUSTOM[context] = contexts[context];
                document.getElementById(context).className = 'enabled';
            }
        },

        saveMixed: function saveMixed() {
            var data = [];
            for (var name in tabs.CUSTOM) {
                if (tabs.CUSTOM.hasOwnProperty(name))
                {
                    data.push(name);
                }
            }

            return data;
        }
    };
};
