'use strict';

import { loadCSS, loadScript } from "./common.js"
import { TWChatInput, TWChatSendButton } from "./tw_elements_finder.js"
import { getHash, postCode, getCode } from "./code_server.js"
import {
	createPanel,
	createSendButton,
	createCloseButton,
	createHashLabel,
	createEditorWindow,
	createPopupButton
} from "./code_editor_view.js"

loadCSS("https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.58.1/codemirror.min.css")
loadCSS("https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.58.1/theme/tomorrow-night-bright.min.css")
loadScript("https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.58.1/codemirror.min.js")
loadScript("https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.58.1/mode/javascript/javascript.min.js")
loadScript("https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.58.1/mode/python/python.min.js")
loadScript("https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.58.1/addon/display/panel.min.js")
//loadScript("https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.58.1/keymap/vim.min.js")
//loadScript("https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.58.1/keymap/sublime.min.js")

var _cmInstance; /* code mirror editor */
var _window;

/*
 * Controller
 */

function newHashFromServer(hashLabel, sendButton) {
	// get new hash
	getHash().then( json => {
		hashLabel.innerHTML = json.hash
		sendButton.disabled = false // enable send button
	}).catch(error => {
		console.error(error)
		alert("Failed to connect the server, please reload the page and try again.")
	})
}

function codeEditor() {

	let content_container = document.querySelector(".chat-room__content")

	_window = createEditorWindow()
	let textarea = document.createElement("textarea")
	textarea.value = "Edit the code here.."
	let panel = createPanel()
	let closeButton = createCloseButton()
	let hashLabel = createHashLabel()
	let sendButton = createSendButton()

	_window.appendChild(textarea)

	panel.appendChild(closeButton)
	panel.appendChild(sendButton)
	panel.appendChild(hashLabel)

	content_container.appendChild(_window)

	newHashFromServer(hashLabel, sendButton)

	// code mirror editor
	_cmInstance = CodeMirror.fromTextArea(textarea, {
		mode: {name: "javascript"},
		//mode: {name: "python"},
		//keymap: "vim",
		//autoRefresh: true,
		autofocus: true,
		tabSize: 2,
		indentUnit: 2,
		lineNumbers: true,
		theme: "tomorrow-night-bright"
	})
	//window._cmInstance = _cmInstance /* for debug */
	_cmInstance.execCommand("selectAll")
	_cmInstance.addPanel(panel, { position : "bottom" })
	_cmInstance.setSize("100%", 300)
	_cmInstance.refresh() 

	closeButton.addEventListener("click", evt => {
		_window.classList.toggle("tw-hide")
		if(!_window.classList.contains("tw-hide")) {
			_cmInstance.refresh()
			_cmInstance.focus()
		}
	})

	let twChatInput = TWChatInput()
	let twChatSendButton = TWChatSendButton()

	sendButton.addEventListener("click", evt => {
		sendButton.disabled = true
		postCode(hashLabel.innerHTML, {code : _cmInstance.getValue()}).then( json => {
			hashLabel.innerHTML = json.newHash
			_window.classList.toggle("tw-hide")
			sendButton.disabled = false
			twChatInput.focus()
			twChatInput.select()
			// the original hash is returned if the code was posted success
			document.execCommand("insertText", true, "!pre " + json.hash) 
			// copy to clipboard for firefox which is strict to insertText support.
			// <textarea> is not supported by insertText, only support <div> with contenteditable.
			navigator.clipboard.writeText("!pre " + json.hash).then(function() {
				/* clipboard successfully set */
				twChatSendButton.click()
			}, function() {
				console.error("write to clipboard failed")
				/* clipboard write failed */
				twChatSendButton.click()
			})
		}).catch( error => {
			console.log(error)
			//alert(error.message)
		})
	})
}

function popupButtonForEditor() {

	let popupButton = createPopupButton()

	// for development, new instance once popup is clicked.
	popupButton.addEventListener("click", evt => {
		if (_window) {
			_window.parentNode.removeChild(_window)
		}
		codeEditor()
		_window.classList.toggle("tw-hide")
		_cmInstance.refresh()
		_cmInstance.focus()
	});

	// for deployment, single instance only.
	/*
	codeEditor()

	popupButton.addEventListener("click", evt => {
		_window.classList.toggle("tw-hide")
		if(!_window.classList.contains("tw-hide")){
			_cmInstance.refresh()
			_cmInstance.focus()
		}
	});
	*/
	return popupButton
}

export { popupButtonForEditor }
