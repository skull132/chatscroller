var Chat = function(bindTo) {
  var el = bindTo;
  var messages = [];
  var tabs = [
    {OOC: true},
    {admin: true, LOOC: true, 'admin fight': true},
    {GOOC: true}
  ];
  var maxMessages = 50000;
  var cullMessages = 1000;
  var tabMax = 1000;

  var currentTab = 0;
  var currentSize = 0;

  // check if a tab should show this message
  function messageMatches(tab, message) {
    for (var i = 0; i < message.context.length; i++) {
      if (tab[message.context[i]]) {
        return true;
      }
    }
    return false;
  }

  // turn message into html
  function nodeFromMessage(message) {
    var text = message.context.join(' | ') + ': ' + message.content;

    var div = document.createElement('div');
    div.appendChild(document.createTextNode(text));
    return div;
  }

  function displayMessage(message) {
    el.appendChild(nodeFromMessage(message));
    currentSize += 1;

    if (currentSize > tabMax) {
      el.removeChild(el.firstChild);
      currentSize -= 1;
    }
  }


  // public functions

  return {
    addMessage: function addMessage(message) {
      var parsed = JSON.parse(message);
      messages.push(parsed);
      if (messageMatches(tabs[currentTab], parsed)) {
        displayMessage(parsed);
      }
      if (messages.length > maxMessages) {
        messages = messages.slice(cullMessages);
      }
    },

    swapTab: function swapTab(tab) {
      currentTab = tab;
      currentSize = 0;

      // build an array of messages for the new tab
      var curMessage = messages.length - 1;
      var backwardMessages = [];
      while (curMessage >= 0 && currentSize < tabMax) {
        if (messageMatches(tabs[currentTab], messages[curMessage])) {
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
    }
  };
}
