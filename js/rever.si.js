// rever.si
// Copyright Nadim Kobeissi, all rights reserved

var reversi = function() {}

$(window).load(function() {

// Configuration
var domain = 'rever.si'
var conference = 'conference.rever.si'
var bosh = 'http://rever.si/http-bind'

var myName, gameState, inviting, myTurn
var myDice, myColor, opponent, loginError, inviter
var boardSlate
var loginCredentials = []
var webNotifications

var abc = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
var boardMatrix = {}

var graphData = {}

// -----------------------------------------------
// BOARD LOGIC
// -----------------------------------------------

// Initialize board slate UI
function initBoardSlate() {
	$('#board').html('')
	for (var c in abc) {
		$('#board').append('<tr></tr>')
		for (var r = 1; r < 9; r++) {
			$('#board tr').last().append('<td></td>')
			$('#board td').last().addClass('square').attr('id', abc[c] + r)
		}
	}
	boardSlate = $('#board').html()
	bindSquareClick()
}

// Initialize board matrix
function initBoardMatrix() {
	boardMatrix = {
		'a1': 0, 'b1': 0, 'c1': 0, 'd1': 0,
		'e1': 0, 'f1': 0, 'g1': 0, 'h1': 0,
		'a2': 0, 'b2': 0, 'c2': 0, 'd2': 0,
		'e2': 0, 'f2': 0, 'g2': 0, 'h2': 0,
		'a3': 0, 'b3': 0, 'c3': 0, 'd3': 0,
		'e3': 0, 'f3': 0, 'g3': 0, 'h3': 0,
		'a4': 0, 'b4': 0, 'c4': 0, 'd4': 0,
		'e4': 0, 'f4': 0, 'g4': 0, 'h4': 0,
		'a5': 0, 'b5': 0, 'c5': 0, 'd5': 0,
		'e5': 0, 'f5': 0, 'g5': 0, 'h5': 0,
		'a6': 0, 'b6': 0, 'c6': 0, 'd6': 0,
		'e6': 0, 'f6': 0, 'g6': 0, 'h6': 0,
		'a7': 0, 'b7': 0, 'c7': 0, 'd7': 0,
		'e7': 0, 'f7': 0, 'g7': 0, 'h7': 0,
		'a8': 0, 'b8': 0, 'c8': 0, 'd8': 0,
		'e8': 0, 'f8': 0, 'g8': 0, 'h8': 0
	}
	graphData = { black: [{x: 0, y: 2}], white: [{x: 0, y: 2}] }
	$('.square').css('background-image', 'none')
}

// Start a new game	
reversi.newGame = function() {
	resetCounters()
	clearHighlights()
	initBoardMatrix()
	takeSquare('d5', 'black', null, 0)
	takeSquare('e4', 'black', null, 0)
	takeSquare('e5', 'white', null, 0)
	takeSquare('d4', 'white', null, 0)
}

// Add current board to move history with 'move' as the last move
function addToMoveHistory(move) {
	$('#moveHistory ol').append(
		'<li><table id="table_' + move + '">' + boardSlate + '</table></li>'
	)
	$('#table_' + move + ' td').each(function(index) {
		$(this).attr('id', move + '_' + $(this).attr('id'))
	})
	for (var i in boardMatrix) {
		takeSquare(i, boardMatrix[i], move, 0, 0)
	}
	scrollDown('moveHistory', 600)
}

// Take square with color
// If altBoard, draws on an alternate board table
// If network = 1, broadcasts move to opponent
// If mark = 'color', marks square with 'color'.
function takeSquare(square, color, altBoard, network, mark) {
	boardMatrix[square] = color
	if (!altBoard) { 
		altBoard = ''
		incrementCounter(color, 1)
	}
	else {
		altBoard += '_'
	}
	if (color) {
		$('#' + altBoard + square).css('background-image', 'url("img/' + color + '.png")')
	}
	if (mark) {
		$('#' + altBoard + square).css('color', mark)
		$('#' + altBoard + square).html('<span class="highlight mark">&diams;</span>')
	}
	if (network && opponent) {
		// Redundancy, since just one move not transmitting can ruin a game
		for (var i = 0; i < 999; i+= 100) {
			window.setTimeout(function() { sendMessage(square, opponent) }, i)
		}
	}
}

// Get the opposite of color
function getOpposite(color) {
	if (color === 'black') { return 'white' }
	return 'black'
}

// Get possible moves
function getMoves(color) {
	var moves = {}
	var opponent = getOpposite(color)
	for (var c = 0; c < abc.length; c++) {
		for (var r = 1; r < 9; r++) {
			if (boardMatrix[abc[c] + r]) { continue }
			moves[abc[c] + r] = []
			// Scan up
			if (r >= 3) {
				var possibleMove = []
				for (var i = (r - 1); i >= 1; i--) {
					if (boardMatrix[abc[c] + i] === opponent) {
						possibleMove.push(abc[c] + i)
					}
					else if (boardMatrix[abc[c] + i] === color) {
						if (possibleMove.length) {
							moves[abc[c] + r].push(possibleMove)
						}
						break
					}
					else {
						break
					}
				}
			}
			// Scan up-right
			if ((r >= 3) && (c <= 5)) {
				var possibleMove = []
				var o = c
				for (var i = (r - 1); i >= 1; i--) {
					if (o < 7) { o++ }
					else { break }
					if (boardMatrix[abc[o] + i] === opponent) {
						possibleMove.push(abc[o] + i)
					}
					else if (boardMatrix[abc[o] + i] === color) {
						if (possibleMove.length) {
							moves[abc[c] + r].push(possibleMove)
						}
						break
					}
					else {
						break
					}
				}
			}
			// Scan right
			if (c <= 5) {
				var possibleMove = []
				for (var o = (c + 1); o <= 7; o++) {
					if (boardMatrix[abc[o] + r] === opponent) {
						possibleMove.push(abc[o] + r)
					}
					else if (boardMatrix[abc[o] + r] === color) {
						if (possibleMove.length) {
							moves[abc[c] + r].push(possibleMove)
						}
						break
					}
					else {
						break
					}
				}
			}
			// Scan down-right
			if ((r <= 6) && (c <= 5)) {
				var possibleMove = []
				var o = c
				for (var i = (r + 1); i <= 8; i++) {
					if (o < 7) { o++ }
					else { break }
					if (boardMatrix[abc[o] + i] === opponent) {
						possibleMove.push(abc[o] + i)
					}
					else if (boardMatrix[abc[o] + i] === color) {
						if (possibleMove.length) {
							moves[abc[c] + r].push(possibleMove)
						}
						break
					}
					else {
						break
					}
				}
			}
			// Scan down
			if (r <= 6) {
				var possibleMove = []
				for (var i = (r + 1); i <= 8; i++) {
					if (boardMatrix[abc[c] + i] === opponent) {
						possibleMove.push(abc[c] + i)
					}
					else if (boardMatrix[abc[c] + i] === color) {
						if (possibleMove.length) {
							moves[abc[c] + r].push(possibleMove)
						}
						break
					}
					else {
						break
					}
				}
			}
			// Scan down-left
			if ((r <= 6) && (c >= 2)) {
				var possibleMove = []
				var o = c
				for (var i = (r + 1); i <= 8; i++) {
					if (o > 0) { o-- }
					else { break }
					if (boardMatrix[abc[o] + i] === opponent) {
						possibleMove.push(abc[o] + i)
					}
					else if (boardMatrix[abc[o] + i] === color) {
						if (possibleMove.length) {
							moves[abc[c] + r].push(possibleMove)
						}
						break
					}
					else {
						break
					}
				}
			}
			// Scan left
			if (c >= 2) {
				var possibleMove = []
				for (var o = (c - 1); o >= 0; o--) {
					if (boardMatrix[abc[o] + r] === opponent) {
						possibleMove.push(abc[o] + r)
					}
					else if (boardMatrix[abc[o] + r] === color) {
						if (possibleMove.length) {
							moves[abc[c] + r].push(possibleMove)
						}
						break
					}
					else {
						break
					}
				}
			}
			// Scan up-left
			if ((r >= 3) && (c >= 2)) {
				var possibleMove = []
				var o = c
				for (var i = (r - 1); i >= 1; i--) {
					if (o > 0) { o-- }
					else { break }
					if (boardMatrix[abc[o] + i] === opponent) {
						possibleMove.push(abc[o] + i)
					}
					else if (boardMatrix[abc[o] + i] === color) {
						if (possibleMove.length) {
							moves[abc[c] + r].push(possibleMove)
						}
						break
					}
					else {
						break
					}
				}
			}
		}
	}
	// Clean up
	for (var i in moves) {
		for (o in moves[i]) {
			if (!moves[i][o].length) {
				delete moves[i][o]
			}
		}
		if (!moves[i].length) {
			delete moves[i]
		}
	}
	if (Object.keys(moves).length === 0) {
		return false
	}
	return moves
}

// Highlight possible moves
function highlightMoves(color) {
	var moves = getMoves(color)
	if (!moves) {
		if (getDiscCount() === 64) {
			endGame()
		}
		return false
	}
	for (var i in moves) {
		$('#' + i).html('<span class="highlight">&bull;</span>')
		$('#' + i).css('cursor', 'pointer')
	}
	$('.highlight').css('color', color).fadeIn(600)
	return true
}

// Clear highlighted moves
function clearHighlights() {
	$('.square').css('cursor', 'auto')
	$('.highlight').fadeOut(600, function() {
		$('.highlight').remove()
	})
}

// Flip discs with animation
// 'discs' must be getMoves(color)[square]
// 'move' is the move that was played
// If 'highlight', highlights moves after flipping discs
function flipDiscs(discs, move, highlight) {
	var timer = 225
	var counter = 0
	var color = boardMatrix[discs[0][0]]
	var opposite = getOpposite(color)
	for (var i in discs) {
		$.each(discs[i], function(o, val) {
			window.setTimeout(function() {
				takeSquare(val, opposite, null, 0)
				incrementCounter(color, -1)
			}, timer)
			timer += 225
			counter++
		})
	}
	window.setTimeout(function() {
		if (highlight) {
			if (highlightMoves(myColor)) {
				showMessage('Playing against ' + strong(opponent) + '. It\'s your turn.')
			}
			else {
				sendMessage('pass', opponent)
				myTurn = 0
			}
		}
		addToMoveHistory(move)
		graphData.black.push({x: graphData.black.length, y: parseInt($('#blackCounter').text())})
		graphData.white.push({x: graphData.white.length, y: parseInt($('#whiteCounter').text())})
		drawDiscGraph()
	}, 225 * (counter + 2))
}

// Handle a square being clicked (play a move)
function bindSquareClick() {
	$('.square').click(function() {
		if (!myTurn || ($(this).css('cursor') !== 'pointer')) {
			return false
		}
		var square = $(this).attr('id')
		var discs = getMoves(myColor)[square]
		clearHighlights()
		takeSquare(square, myColor, null, 1)
		flipDiscs(discs, square, 0)
		myTurn = 0
		showMessage('Playing against ' + strong(opponent) + '. It\'s their turn.')
		playSound('iPlay')
	})
}

// -----------------------------------------------
// END BOARD LOGIC
// -----------------------------------------------

// -----------------------------------------------
// PLAYER UI LOGIC
// -----------------------------------------------

// Set board (and entire page) size in accordance with window size
function setBoardSize() {
	if ($(window).width() >= 1920 && $(window).height() >= 1080) {
		window.parent.document.body.style.zoom = 1.5
	}
	if ($(window).width() >= 1170 && $(window).height() >= 650) {
		window.parent.document.body.style.zoom = 1.15
	}
	else {
		window.parent.document.body.style.zoom = 1
	}
}
$(window).resize(function() {
	setBoardSize()
})
setBoardSize()

// Form logic for fields and buttons
$('input[type=text]').click(function() {
	$(this).select()
})

// Display a message in the message area
function showMessage(message, callback) {
	$('#message').find('span').html(message)
}

// Make input HTML bold
function strong(text) {
	return '<strong>' + text + '</strong>'
}

// Handle getting an invitation
function getInvitation(player, theirDice) {
	var invitation = strong(player)
		+ ' challenges you. Accept?<br />'
		+ '<span class="choice">yes</span> &nbsp; &nbsp; '
		+ '<span class="choice">no</span>'
	showMessage(invitation)
	$('.choice').click(function() {
		if ($(this).html() == 'yes') {
			myDice = Math.floor(Math.random()*9999999999)
			sendMessage('accept ' + myDice, player)
			enterGame(player, myDice, theirDice)
		}
		else {
			sendMessage('refuse', player)
			showMessage('You have refused the invitation.')
			gameState = 'lobby'
		}
	})
	playSound('getInvitation')
	webNotification(
		'img/favicon.png',
		'Reversi',
		'You have received an invitation from ' + player + '.'
	)
}

// Enter a game after successful invitation
function enterGame(player, myDice, theirDice) {
	gameState = 'inGame'
	opponent = player
	inviting = null
	inviter = null
	if (myDice > theirDice) { myColor = 'black' }
	else { myColor = 'white' }
	conn.muc.setStatus('lobby@' + conference, myName, 'away', 'away')
	$('#lobby').fadeOut(function() {
		$('#moveHistory,#displayChat').fadeOut(200)
		$('#inGame').fadeIn()
		$('#logout').fadeOut(200, function() {
			$('#resign,#displayHistory,#chat,#chatInput').fadeIn(200)
			$('#resign,#displayHistory').fadeIn(200)
			$('#chatInput').select()
		})
		addToMoveHistory('start')
		drawDiscGraph()
		if (myColor === 'black') {
			highlightMoves(myColor)
			myTurn = 1
			showMessage('Playing against ' + strong(opponent) + '. It\'s your turn.')
		}
		else {
			myTurn = 0
			showMessage('Playing against ' + strong(opponent) + '. It\'s their turn.')
		}
	})
}

// Leave game
function leaveGame() {
	gameState = 'lobby'
	opponent = null
	myTurn = null
	conn.muc.setStatus('lobby@' + conference, myName, '', '')
	$('#inGame').fadeOut(function() {
		scrollDown('lobbyChat', 600)
		$('#chat').html('')
		$('#moveHistory ol').html('')
		$('#chatInput').val('')
		$('#lobby').fadeIn()
		$('#resign,#displayHistory').fadeOut(200, function() {
			$('#logout').fadeIn(200)
			$('#lobbyChatInput').select()
		})
		reversi.newGame()
	})
}

// Display chat message
function addToChat(id, message, name) {
	$('<div />', {
		'class': 'chatLine',
		'html': strong(name) + ': ' + addLinks(message)
	}).appendTo('#' + id).fadeIn(200)
	scrollDown(id, 600)
}

// Convert message URLs to links.
function addLinks(message) {
	if ((URLs = message.match(/((mailto\:|(news|(ht|f)tp(s?))\:\/\/){1}\S+)/gi))) {
		for (var i in URLs) {
			var sanitize = URLs[i].split('')
			for (var l in sanitize) {
				if (!sanitize[l].match(/\w|\d|\:|\/|\?|\=|\#|\+|\,|\.|\&|\|\%/)) {
					sanitize[l] = encodeURIComponent(sanitize[l])
				}
			}
			sanitize = sanitize.join('')
			var processed = sanitize.replace(':','&colon;')
			message = message.replace(sanitize, '<a target="_blank" href="' + processed + '">' + processed + '</a>')		
		}
	}
	return message
}

// Scrolls down the chat window to the bottom in a smooth animation.
// 'id' is element ID
// 'speed' is animation speed in milliseconds.
function scrollDown(id, speed) {
	$('#' + id).animate({
		scrollTop: $('#' + id)[0].scrollHeight + 20
	}, speed)
}

// Play a sound
function playSound(sound) {
	(new Audio('snd/' + sound + '.wav')).play()
}

// Enable web notifications if API is present
if (window.webkitNotifications) {
	webNotifications = 1
}

// Show a web notification
function webNotification(image, title, body) {
	if (webNotifications && !document.hasFocus()) {
		var notice = window.webkitNotifications.createNotification(image, title, body)
		notice.show()
		window.setTimeout(function() {
			notice.cancel()
		}, 5000)
	}
}

// Increment disc counter for color by amount (negative amounts allowed)
function incrementCounter(color, amount) {
	var counter = parseInt($('#' + color + 'Counter').text())
	counter += amount
	$('#' + color + 'Counter').text(counter)
}

// Get total disc count
function getDiscCount() {
	return parseInt($('#blackCounter').text()) + parseInt($('#whiteCounter').text())
}

// Draw disc count graph
function drawDiscGraph() {
	$('#graph').html('')
	var graph = new Rickshaw.Graph({
		element: document.querySelector('#graph'), 
		width: 215,
		height: 45,
		renderer: 'line',
		offset: 'stream',
		interpolation: 'step-after',
		series: [
			{
				name: 'Black',
				color: 'black',
				data: graphData.black
	    	},
			{
				name: 'White',
				color: 'white',
				data: graphData.white
	    	}
		]
	}).render()
}

// End game
function endGame() {
	var blackCount = parseInt($('#blackCounter').text())
	var whiteCount = parseInt($('#whiteCounter').text())
	if (((blackCount > whiteCount) && (myColor === 'black'))
	||  ((blackCount < whiteCount) && (myColor === 'white'))) {
		showMessage('You have won!')
	}
	else if (blackCount === whiteCount) {
		showMessage('It\'s a draw!')
	}
	else {
		showMessage('You have lost.')
	}
}

// Reset disc counters
function resetCounters() {
	$('#blackCounter').text('0')
	$('#whiteCounter').text('0')
}

// Bind resign button
$('#resign').click(function() {
	sendMessage('resign', opponent)
	showMessage('You have resigned.')
	leaveGame()
})

// Bind chat display button
$('#displayChat').click(function() {
	$('#moveHistory').fadeOut(function() {
		$('#chat,#chatInput').fadeIn()
	})
	$(this).fadeOut(function() {
		$('#displayHistory').fadeIn()
	})
})

// Bind move history display button
$('#displayHistory').click(function() {
	$('#chat,#chatInput').fadeOut(function() {
		$('#moveHistory').fadeIn()
	})
	$(this).fadeOut(function() {
		$('#displayChat').fadeIn()
	})
})

// Bind logout button
$('#logout').click(function() {
	logout(true)
})

// Prevent accidental window close
$(window).bind('beforeunload', function() {
	if (gameState === 'inGame') {
		return 'You are playing a game. Are you sure you wish to quit?'
	}
})

// -----------------------------------------------
// END PLAYER UI LOGIC
// -----------------------------------------------

// -----------------------------------------------
// XMPP LOGIC
// -----------------------------------------------

// Generates a random string of length `size` characters.
// If `alpha = 1`, random string will contain alpha characters, and so on.
function randomString(size, alpha, uppercase, numeric) {
	var keyspace = result = ''
	if (alpha) { keyspace += 'abcdefghijklmnopqrstuvwxyz' }
	if (uppercase) { keyspace += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' }
	if (numeric) { keyspace += '0123456789' }
	for (var i = 0; i !== size; i++) {
		result += keyspace[Math.floor(Math.random()*keyspace.length)]
	}
	return result
}

// Send XMPP message
// If 'player === null', send message to lobby
function sendMessage(message, player) {
	if (player) {
		conn.muc.message('lobby@' + conference, player, message, null)
	}
	else {
		conn.muc.message('lobby@' + conference, null, message, null)
	}	
}

// Handle chat form submission
$('#chatInput,#lobbyChatInput').keyup(function(e) {
	if (e.keyCode === 13) {
		var chat = $.trim($(this).val().replace(/</g, '&lt;').replace(/>/g, '&gt;'))
		if (chat !== '') {
			var chatID = $(this).attr('id').substring(0, $(this).attr('id').length - 5)
			addToChat(chatID, chat, myName)
			sendMessage('chat ' + $(this).val(), opponent)
			$(this).val('')
		}
	}
})

// Clean name so that it's safe to use.
function cleanName(name) {
	var clean
	if (clean = name.match(/\/([\s\S]+)/)) {
		clean = Strophe.xmlescape(clean[1])
	}
	else {
		return false
	}
	if (clean.match(/\W/)) {
		return false
	}
	return clean
}

// Handle incoming messages from the XMPP server.
function handleMessage(message) {
	var name = cleanName($(message).attr('from'))
	var body = $(message).find('body').text().replace(/\&quot;/g, '"')
	var type = $(message).attr('type')
	// If archived message, ignore.
	if ($(message).find('delay').length !== 0) {
		return true
	}
	// If message is from me, ignore.
	if (name === myName) {
		return true
	}
	// If this is a group message...
	if (type === 'groupchat') {
		if (chat = body.match(/^chat/)) {
			addToChat('lobbyChat', body.substring(5), name)
		}
		return true
	}
	// Detect incoming invitation
	if (body.match(/^invite\s[0-9]+$/)) {
		if (gameState === 'lobby') {
			var theirDice = parseInt(body.match(/[0-9]+$/)[0])
			getInvitation(name, theirDice)
			gameState = 'invited'
			inviter = name
		}
		else {
			sendMessage(gameState, name)
		}
	}
	// Detect canceled invitations
	if (body === 'cancel') {
		if (inviter === name) {
			showMessage(strong(name) + ' have canceled their invitation.')
			inviter = null
			gameState = 'lobby'
		}
	}
	// Detect invitation response
	else if (inviting === name) {
		if (body.match(/^accept\s[0-9]+$/)) {
			var theirDice = parseInt(body.match(/[0-9]+$/)[0])
			enterGame(name, myDice, theirDice)
			return true
		}
		else if (body === 'refuse') {
			showMessage(strong(name) + ' has refused your invitation.')
		}
		else if (body === 'inGame') {
			showMessage(strong(name) + ' is currently playing a game.')
		}
		else if ((body === 'invited') || (body === 'inviting')) {
			showMessage(strong(name) + ' is already handling another invitation. Try again shortly.')
		}
		gameState = 'lobby'
		inviting = null
	}
	// Detect gameplay moves/chat
	else if (opponent === name) {
		if (move = body.match(/^[a-h][1-8]$/)) {
			var discs = getMoves(getOpposite(myColor))
			if (!myTurn && discs[move[0]]) {
				myTurn = 1
				takeSquare(move[0], getOpposite(myColor), null, 0, myColor)
				flipDiscs(discs[move[0]], move[0], 1)
				playSound('theyPlay')
				webNotification(
					'img/favicon.png',
					'Reversi',
					'Your opponent has played on square ' + move[0] + '.'
				)
			}
		}
		else if (body === 'pass') {
			if (!myTurn) {
				myTurn = 1
				if (highlightMoves(myColor)) {
					showMessage(strong(name) + ' has no moves. It\'s your turn.')
				}
				else {
					endGame()
				}
			}
		}
		else if (body === 'resign') {
			showMessage('Your opponent has resigned.')
			leaveGame()
		}
		else if (chat = body.match(/^chat/)) {
			addToChat('chat', body.substring(5), name)
			playSound('getChat')
		}
	}
	return true
}

// Handle incoming presence updates from the XMPP server.
function handlePresence(presence) {
	var name = cleanName($(presence).attr('from'))
	// If invalid name, do not process
	if ($(presence).attr('type') === 'error') {
		if ($(presence).find('error').attr('code') === '409') {
			loginError = true
			logout()
			window.setTimeout(function() {
				showMessage('Name in use. Please choose another name.')
			}, 1000)
			return false
		}
		return true
	}
	// Ignore if presence status is coming from myself
	if (name === myName) {
		return true
	}
	// Detect player going offline
	if ($(presence).attr('type') === 'unavailable') {
		$('#player-' + name).slideUp().remove()
		if (opponent === name) {
			showMessage('Your opponent has logged out.')
			leaveGame()
		}
		else if (inviting === name) {
			showMessage(strong(name) + ' has logged out.')
			inviting = null
			gameState = 'lobby'
		}
		else if (inviter === name) {
			showMessage(strong(name) + ' has logged out.')
			inviter = null
			gameState = 'lobby'
		}
		return true
	}
	// Create player element if player is new
	else if (!$('#player-' + name).length) {
		addPlayer(name)
	}
	// Detect player setting status to 'available'
	if ($(presence).find('show').text() === '' || $(presence).find('show').text() === 'chat') {
		$('#player-' + name).attr('class', 'playerAvailable')
		$('#player-' + name).find('.playerStatus').text('available')
			
	}
	// Detect player setting status to 'away'
	else if ($(presence).find('show').text() === 'away') {
		$('#player-' + name).attr('class', 'playerInGame')
		$('#player-' + name).find('.playerStatus').text('in game')
			
	}
	return true
}

// Add new player to player list
function addPlayer(name) {
	$('#playerList').queue(function() {
		var buddyTemplate = '<div class="playerAvailable" id="player-' 
			+ name + '"><span>' + name + '</span><span class="playerStatus"></span></div>'
		$(buddyTemplate).appendTo('#playerList').slideDown(0, function() {
			$('#player-' + name).unbind('click')
			bindPlayerClick(name)
		})
	})
	$('#playerList').dequeue()
}

// Bind properties to player entry in lobby
function bindPlayerClick(player) {
	$('#player-' + player).click(function() {
		if ($(this).css('cursor') === 'pointer') {
			if (gameState === 'lobby') {
				myDice = Math.floor(Math.random()*9999999999)
				gameState = 'inviting'	
				inviting = player
				sendMessage('invite ' + myDice, player)
				showMessage(
					'Waiting for ' + strong(player) + ' to respond...'
					+ '<br /><span class="choice">cancel</span>'
				)
				$('.choice').click(function() {
					sendMessage('cancel', player)
					showMessage('Welcome, ' + strong(myName) + '. Click on a person to invite them to play.')
					gameState = 'lobby'
					inviting = null
				})
			}
		}
	})
}

// Handle submission of login form
$('#login').submit(function() {
	// Don't submit if form is already being processed
	if (($('#play').attr('readonly') === 'readonly')) {
		return false
	}
	//Check validity of name and game ID
	$('#name').val($.trim($('#name').val()).toLowerCase())
	if (!$('#name').val().length) {
		showMessage('Please enter a name.')
		$('#name').select()
	}
	else if (!$('#name').val().match(/^\w{1,18}$/)) {
		showMessage('Your name can only contain letters and numbers.')
		$('#name').select()
	}
	// If everything is okay, then register a randomly generated throwaway XMPP ID and log in.
	else {
		myName = Strophe.xmlescape($('#name').val())
		loginCredentials[0] = randomString(64, 1, 1, 1)
		loginCredentials[1] = randomString(64, 1, 1, 1)
		registerXMPPUser(loginCredentials[0], loginCredentials[1])
		$('#play').attr('readonly', 'readonly')
		showMessage('Connecting...')
	}
	// Get notification permissions
	if (webNotifications && window.webkitNotifications.checkPermission()) {
		window.webkitNotifications.requestPermission(function() {})
	}
	return false
})

// Registers a new user on the XMPP server.
function registerXMPPUser(username, password) {
	var registrationConnection = new Strophe.Connection(bosh)
	registrationConnection.register.connect(domain, function(status) {
		if (status === Strophe.Status.REGISTER) {
			registrationConnection.register.fields.username = username
			registrationConnection.register.fields.password = password
			registrationConnection.register.submit()
		}
		else if (status === Strophe.Status.REGISTERED) {
			registrationConnection.disconnect()
			delete registrationConnection
			login(loginCredentials[0], loginCredentials[1])
			return true
		}
		else if (status === Strophe.Status.SBMTFAIL) {
			showMessage('Connection error.')
			$('#play').removeAttr('readonly')
			return false
		}
	})
}

// Logs into the XMPP server, creating main connection/disconnection handlers.
function login(username, password) {
	conn = new Strophe.Connection(bosh)
	conn.connect(username + '@' + domain, password, function(status) {
		if (status === Strophe.Status.CONNECTING) {
			
		}
		else if (status === Strophe.Status.CONNFAIL) {
			showMessage('Connection error.')
		}
		else if (status === Strophe.Status.CONNECTED) {
			showMessage('Welcome, ' + strong(myName) + '. Click on a person to invite them to play.')
			conn.muc.join(
				'lobby@' + conference, myName, 
				function(message) {
					if (handleMessage(message)) {
						return true
					}
				},
				function (presence) {
					if (handlePresence(presence)) {
						return true
					}
				}
			)
			$('#login').fadeOut(200, function() {
				$('#logout').fadeIn(200)
				$('#lobby').fadeIn(200, function() {
					$('#lobbyChatInput').select()
				})
				gameState = 'lobby'
			})
		}
		else if ((status === Strophe.Status.DISCONNECTED) || (status === Strophe.Status.AUTHFAIL)) {
			if (!loginError) {
				showMessage('Thank you for playing with Reversi.')
			}
			reversi.newGame()
			$('#logout').fadeOut(200)
			$('#resign').fadeOut(200)
			$('#lobby,#inGame').fadeOut(200, function() {
				$('#chat,#lobbyChat').html('')
				$('#moveHistory ol').html('')
				$('#chatInput,#lobbyChatInput').val('')
				$('#login').fadeIn(200)
				$('#name').select()
			})
			myName = opponent = inviting = myTurn = null
			inviter = conn = gameState = loginError = myColor = null
			loginCredentials = []
			$('#play').removeAttr('readonly')
		}
	})
}

// Logout function
function logout(message) {
	if (message) {
		showMessage('Logging out...')
	}
	conn.muc.leave('lobby@' + conference)
	conn.disconnect()
}

// Logout on browser close
$(window).unload(function() {
	logout()
})

// -----------------------------------------------
// END XMPP LOGIC
// -----------------------------------------------

initBoardSlate()
reversi.newGame()
showMessage('rever.si is an open service that lets you play Reversi with your friends worldwide.')
$('#name').select()

})