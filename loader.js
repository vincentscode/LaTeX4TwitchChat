function loadScript(src) {
  /* Insert the final install script to the head */
  var s = document.createElement('script');
  s.type = "module";
  s.src = chrome.runtime.getURL(src);
	/*
  s.onload = function () {
    this.remove();
  }; */
  (document.head || document.documentElement).appendChild(s);
}

function loadCSS(src) {
	const link = document.createElement('link');
	if (window.browser)
  	link.href = browser.runtime.getURL(src);
	else
  	link.href = chrome.runtime.getURL(src);
	link.type = 'text/css';
	link.rel = 'stylesheet';
	(document.head || document.documentElement).appendChild(link);
}

function updateOptions(data) {
	let evt = new CustomEvent("UpdateOptions", { detail: data });
	document.dispatchEvent(evt);
}

function setup(default_options) {
	document.addEventListener("LoadOptions", (evt) => {
		chrome.storage.local.get(Object.keys(default_options), (data) => {
			let options = default_options
			for (let key in data) options[key] = data[key]
			updateOptions(options)
		})
	})

	/* Config changed by Popup/Option page */
	chrome.storage.onChanged.addListener((changes, namespace) => {
		if(namespace != "local") return

		let data = {}
		for (var key in changes)
			data[key] = changes[key].newValue
		updateOptions(data)
	})
}

let default_options = {
	speechLang : "disabled"
}

setup(default_options)

loadCSS("latex4twitch.css")
loadScript("latex4twitch.js")
