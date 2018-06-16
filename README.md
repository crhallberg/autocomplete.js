# autocomplete.js

> Here to provide the interface so you can control the results.

Go to [Version 1](https://github.com/vufind-org/autocomplete.js/tree/v1) for groups, etc.

## Getting Started

1/ Include the javascript. [Best practices](https://developers.google.com/apps-script/guides/html/best-practices#load_javascript_last) recommend doing this at the bottom of your page's body.

```html
<script src="./autocomplete.js"></script>
```

2/ Include the CSS, usually in your page's head.

```html
<link rel="stylesheet" href="autocomplete-lite.css"/>
```

3/ Create an Autocomplete instance with all your desired settings.

```js
const AC = new Autocomplete({ limit: 10, minInputLength: 1 });
```

4/ Use the instance to bind handlers to inputs

```js
AC(document.getElementById("ajax"), function achandler(query, callback) {
    const url = "https://api.wordnik.com/v4/words.json/search/" + query + "?api_key=API_KEY";
    fetch(url).then(function(response) {
        return response.json();
    }).then(function(json) {
        callback( json.searchResults.map( word => word.word ) );
    });
});
```

### Defining your handler

Every input is bound to a handler function that will create the results displayed in the UI. This function will be called when a search for a term needs to be done.

The handler function will receive two parameters:
- `query` is the search text
- and `callback` to return your results as
  - an array of strings (can be HTML)
  - an array of [objects](#item-format)

### Item format

If you want to get fancy, there are a few more options for items. Text would be the only required field for these.

```js
{
  text: "What is displayed",
  href: "optional url to go to when this item is selected",
  sub: "optional smaller subtitle"
}
```

You can also create section headers like so:

```js
{ header: "Fruits and Vegetables" }
```

### Options

| Option | Default | Description |
|--------|---------|-------------|
| delay | 250 | Debounce rate for input: handlers are triggered this many milliseconds after the last character is typed |
| limit | 20 | Max number of results to display |
| loadingString | "Loading..." | String that is displayed while waiting for results. HTML welcome. |
| minInputLength | 3 | Minimum number of characters that need to be typed before a search is made |
| rtl | false | RTL tries to anchor to the right edge of the input instead of the left |

## Autocomplete.static

For default fuzzy searching on a static list of strings, you can use `Autocomplete.static` to create a handler for you.

1/ Include the Autocomplete.static plugin

```html
<script src="./autocomplete-static.js"></script>
```

2/ Use `Autocomplete.static` to create your handler

```js
const animals = ['aardvark','albatross','alligator','alpaca','ant','anteater'...];
AC(document.getElementById("static"), Autocomplete.static(animals));
```
