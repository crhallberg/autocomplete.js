function Autocomplete(_settings) {
  const _DEFAULTS = {
    delay: 250,
    highlight: true,
    limit: 20,
    loadingString: 'Loading...',
    minInputLength: 3
  };

  if (typeof _settings === 'undefined') {
    _settings = {};
  }
  const settings = Object.assign(_DEFAULTS, _settings);
  let container;
  let list;
  let _currentItems;
  let _currentListEls;
  let _currentIndex = -1;

  function _debounce(func, delay, bindArr) {
    let timeout = null;
    return function() {
      const context = this;
      const args = [].slice.call(arguments);

      // Bind additional parameters
      if (typeof bindArr !== 'undefined') {
        if (typeof args === 'undefined') {
          args = bindArr.slice();
        } else {
          for (let i = bindArr.length; i--; ) {
            args.unshift(bindArr[i]);
          }
        }
      }

      clearTimeout(timeout);
      timeout = setTimeout(function() {
        timeout = null;
        func.apply(context, args);
      }, delay);
    };
  }

  function _align(input) {
    let rightLimit = document.documentElement.offsetWidth - list.offsetWidth - 8;
    list.style.left = Math.min(input.offsetLeft, rightLimit) + 'px';
    list.style.top = input.offsetTop + input.offsetHeight + 'px';
    list.style.minWidth = input.offsetWidth + 'px';
  }

  function _show() {
    container.classList.add('open');
  }

  function _hide(e) {
    if (typeof e === 'undefined' || typeof e.target === 'undefined' || e.target === container) {
      container.classList.remove('open');
    }
    _currentIndex = -1;
  }

  function _renderItem(item, input) {
    let el = typeof item.href === 'undefined' ? document.createElement('div') : document.createElement('a');
    el.classList.add('ac-item');
    if (typeof item === 'string') {
      el.innerHTML = item;
    } else {
      el.innerHTML = item.text;
      if (typeof item.sub !== 'undefined') {
        let sub = document.createElement('small');
        sub.classList.add('ac-sub');
        sub.innerHTML = item.sub;
        el.appendChild(sub);
      }
    }
    if (typeof item.href === 'undefined') {
      el.addEventListener(
        'click',
        function _acItemClick() {
          if (typeof item === 'string') {
            input.value = item;
          } else {
            input.value = item.text;
          }
          _hide();
        },
        false
      );
    } else {
      el.href = item.href;
    }
    return el;
  }

  function _searchCallback(items, input) {
    if (items.length === 0) {
      _hide();
      return;
    }
    if (items.length > settings.limit) {
      items = items.slice(0, settings.limit);
    }
    _currentItems = items.slice();
    _currentListEls = items.map(item => _renderItem(item, input));
    list.innerHTML = '';
    _currentListEls.map(el => list.appendChild(el));
    _currentIndex = -1;
  }

  function _search(handler, input) {
    console.log('_search');
    if (input.value.length < settings.minInputLength) {
      _hide();
      return;
    }
    let loadingEl = _renderItem(settings.loadingString);
    loadingEl.classList.add('loading');
    list.innerHTML = loadingEl.outerHTML;
    _align(input);
    _show();
    handler(input.value, function callback(items) {
      _searchCallback(items, input);
      _align(input);
    });
  }

  function _keyup(handler, input, event) {
    // Ignore navigation keys
    // - Ignore control functions
    if (event.ctrlKey || event.which === 17) {
      return;
    }
    // - Function keys (F1 - F15)
    if (112 <= event.which && event.which <= 126) {
      return;
    }
    switch (event.which) {
      case 9: // tab
      case 13: // enter
      case 16: // shift
      case 20: // caps lock
      case 27: // esc
      case 33: // page up
      case 34: // page down
      case 35: // end
      case 36: // home
      case 37: // arrows
      case 38:
      case 39:
      case 40:
      case 45: // insert
      case 144: // num lock
      case 145: // scroll lock
      case 19: // pause/break
        return;
      default:
        _search(handler, input);
    }
  }

  function _keydown(handler, input, event) {
    // - Ignore control functions
    if (event.ctrlKey || event.which === 17) {
      return;
    }
    switch (event.which) {
      // arrow keys through items
      case 38: // up key
        event.preventDefault();
        if (_currentIndex === -1) {
          return;
        }
        _currentListEls[_currentIndex].classList.remove('selected');
        _currentIndex -= 1;
        if (_currentIndex === -1) {
          return;
        }
        _currentListEls[_currentIndex].classList.add('selected');
        break;
      case 40: // down key
        event.preventDefault();
        if (_currentIndex === _currentItems.length - 1) {
          return;
        }
        if (_currentIndex > -1) {
          _currentListEls[_currentIndex].classList.remove('selected');
        }
        _currentIndex += 1;
        if (_currentIndex === _currentItems.length - 1) {
          return;
        }
        _currentListEls[_currentIndex].classList.add('selected');
        break;
      // enter to nav or populate
      case 9:
      case 13:
        if (_currentIndex === -1) {
          return;
        }
        _currentListEls[_currentIndex].click();
        break;
      // hide on escape
      case 27:
        _hide();
        break;
    }
  }

  return function Factory(input, handler) {
    if (!input) {
      return false;
    }
    if (typeof handler === 'undefined') {
      throw new Error(
        'Autocomplete needs handler to return items based on a query: function(query, callback) {}'
      );
    }

    if (typeof container === 'undefined') {
      container = document.querySelector('.ac-container');
      if (!container) {
        container = document.createElement('div');
        container.classList.add('ac-container');
        container.addEventListener('click', _hide, false);
        list = document.createElement('div');
        list.classList.add('autocomplete-results');
        container.appendChild(list);
        document.body.appendChild(container);
      }
    }

    input.addEventListener('focus', () => _search(handler, input), false);
    input.addEventListener('keyup', _debounce(_keyup, settings.delay, [handler, input]), false);
    input.addEventListener('keydown', event => _keydown(handler, input, event), false);

    return input;
  };
}

if (typeof module !== 'undefined') {
  module.exports = Autocomplete;
}
