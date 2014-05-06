var Snake = {};

Snake.equalCoordinates = function(coord1, coord2) {
	return coord1[0] === coord2[0] && coord1[1] === coord2[1];
}

Snake.checkCoordinatesInArray = function(coord, arr) {
	var inArray = false;
	$.each(arr, function(index, item) {
		if(Snake.equalCoordinates(coord, item)) {
			inArray = true;
		}
	});
	return inArray;
}

Snake.game = (function() {
	var ctx;
	Snake.size = 200;
	Snake.blockSize = 10;
	Snake.blocks = Snake.size / Snake.blockSize;
	var frameLength = 100;
	var snake;
	var apple;
	var score = $('#score span');
	var t;
	var posArray;

	function init() {
		score.html(0);
		var $canvas = $('#snake');
		$canvas.attr('height', Snake.size);
		$canvas.attr('width', Snake.size);
		var canvas = $canvas[0];
		ctx = canvas.getContext('2d');
		snake = Snake.snake();
		apple = Snake.apple();
		posArray = snake.getPosition();
		apple.setNewPosition(posArray);
		bindEvents();
		t = setInterval(gameLoop, frameLength);
	}

	function gameLoop() {
		ctx.clearRect(0, 0, Snake.size, Snake.size);
		snake.advance();
		snake.draw(ctx);
		apple.draw(ctx);
		if(Snake.equalCoordinates(posArray[0], apple.getPosition())) {
			frameLength = frameLength * 0.98;
			clearInterval(t);
			t = setInterval(gameLoop, frameLength);
			snake.grow();
			apple.setNewPosition(posArray);
			score.html(parseInt(score.html())+1);
		}
	}
	function bindEvents() {
		var keys = {
			37: 'left',
			38: 'up',
			39: 'right',
			40: 'down'
		};
		$(document).off('keydown');
		$(document).on( 'keydown', function(e) {
			var k = e.which;
			var direction = keys[k];
			if(direction) {
				snake.setDirection(direction);
				event.preventDefault();
			}
		});
	}
	function gameOver() {
		var overlay = $('#overlay');
		overlay.fadeIn();
		snake.retreat();
		snake.draw(ctx);
		clearInterval(t);
		$(document).off('keydown');
		$(document).on('keydown', function(e) {
			if(e.which == 32) {
				overlay.hide();
				init();
			}
		});
	}

	return {
		init: init,
		gameOver: gameOver
	};
})();

Snake.apple = function() {
	var position = [6, 6];
	function draw(ctx) {
		ctx.save();
		ctx.fillStyle = 'F00';
		ctx.beginPath();
		var radius = Snake.blockSize/2;
		var x = Snake.blockSize * position[0];
		var y = Snake.blockSize * position[1];
		var half = Snake.blockSize/2;
		ctx.arc(x+half, y+half, half, 0, 2*Math.PI);
		ctx.fill();
		ctx.restore();
	}
	function random(low, high) {
		return Math.floor(Math.random() * (high - low + 1) + low);
	}

	function getRandomPosition() {
		var x = random(1, Snake.blocks - 2);
		var y = random(1, Snake.blocks - 2);
		return [x, y];
	}

	function setNewPosition(snakeArray) {
		var newPosition = getRandomPosition();
		if (Snake.checkCoordinatesInArray(newPosition, snakeArray)) {
			return setNewPosition(snakeArray);
		}
		else {
			position = newPosition;
		}
	}

	function getPosition() {
		return position;
	}
	return {
		draw: draw,
		setNewPosition: setNewPosition,
		getPosition: getPosition
	};
}

Snake.snake = function() {
	var prevPosArray = [];
	var posArray = [];
	posArray.push([5, 4]);
	posArray.push([4, 4]);
	var direction = 'right';
	var nextDirection = direction;

	function drawSection(ctx, position) {
		var x = Snake.blockSize * position[0];
		var y = Snake.blockSize * position[1];
		ctx.fillRect(x, y, Snake.blockSize, Snake.blockSize);
	}

	function draw(ctx) {
		ctx.save();
		ctx.fillStyle = '#0a0';
		for(var i = 0; i < posArray.length; i++) {
			drawSection(ctx, posArray[i]);
		}
		ctx.restore();
	}

	function advance() {
		var nextPosition = posArray[0].slice();
		direction = nextDirection;
		switch(direction) {
			case 'right':
			nextPosition[0] += 1;
			break;
			case 'left':
			nextPosition[0] -= 1;
			break;
			case 'up':
			nextPosition[1] -= 1;
			break;
			case 'down':
			nextPosition[1] += 1;
			break;
			default:
			throw('Invalid direction');
		}
		if(checkCollision()) {
			Snake.game.gameOver();
		} else {
			if(nextPosition[0] < 0) {
				nextPosition[0] = Snake.blocks - 1;
			} if (nextPosition[0] >= Snake.blocks) {
				nextPosition[0] = 0;
			} if (nextPosition[1] < 0) {
				nextPosition[1] = Snake.blocks-1;
			} if (nextPosition[1] >= Snake.blocks) {
				nextPosition[1] = 0;
			}
			posArray.unshift(nextPosition);
			prevPosArray = posArray.slice();
			posArray.pop();
		}
	}
	function checkCollision() {
		var head = posArray[0];
		var body = posArray.slice(1);
		return Snake.checkCoordinatesInArray(head, body);
	}
	function setDirection(newDirection) {
		var allowedDirection;
		switch(direction) {
			case 'left':
			case 'right':
			allowedDirection = ['up', 'down'];
			break;
			case 'up':
			case 'down':
			allowedDirection = ['left', 'right'];
			break;
			default:
			throw('Invalid direction');
		}
		if(allowedDirection.indexOf(newDirection) > -1) {
			nextDirection = newDirection;
		}
	}
	function getPosition() {
		return posArray;
	}
	function retreat() {
		posArray = prevPosArray;
	}

	function grow() {
		var last = posArray[posArray.length-1];
		posArray.push(last);
	}

	return {
		draw: draw,
		advance: advance,
		setDirection: setDirection,
		getPosition: getPosition,
		grow: grow,
		retreat: retreat
	};
};

$(document).ready(function () {
	Snake.game.init();
});