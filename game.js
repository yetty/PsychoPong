/**
 *
 * Object for the game PsychoPong
 *
 *
 * @author: Juda Kaleta <juda.kaleta@gmail.com>
 * @version: 0.1 alpha
 * @license: GNU GPL3
 *
 */
var PsychoPong = {
	// frames per second
	fps : 20,

	// speed of player's board
	player_speed : 2,

	/**
	 * Initialization of PsychoPong. Prepare Model, Controller
	 * and View.
	 */
	init : function (params) {
		if (typeof(params['canvas']) != 'string'||$("#"+params['canvas']).length == 0) {
			throw "Init error: Canvas is not an object";
		}

		PsychoPong.Model.init();
		PsychoPong.Controller.init();
		PsychoPong.View.init(params['canvas']);

		return this;
	},


	/**
	 * Run PsychoPong. Must be after initialization.
	 */
	start : function () {
		PsychoPong.game = true;

		// start move of the ball
		PsychoPong.Model.ball.speed = [1, 0];

		setTimeout(function frame() {
			// is the game still running?
			if ((PsychoPong.game)&&(PsychoPong.View.status)) {
					PsychoPong.Model.incSpeed();

					PsychoPong.View.status = false;
					PsychoPong.Model.moveAll();
					PsychoPong.View.render();

					setTimeout(frame, 1000 / PsychoPong.fps);
				}
			}
		}, 1000 / PsychoPong.fps);
	},

	/**
	 * End of the game.
	 */
	end : function (winner) {
		PsychoPong.game = false;
		PsychoPong.View.end(winner);
	},


	Model : {
		canvasSize : [100, 100],

		Player : function () {
			this.speed = 0;
			this.goals = 0;

			this.height = 20;
			this.width = 5;

			this.x = 0;
			this.y = (PsychoPong.Model.canvasSize[1]-this.height) / 2;

			this.move = function () {
				if ((this.speed<0&&this.y>0)||(this.speed>0&&this.y+this.height<PsychoPong.Model.canvasSize[1])) {
					this.y += this.speed;
				}
			};
		},

		ball : {
			size : 2,
			speed : [0, 0],

			init : function () {
				this.x = PsychoPong.Model.canvasSize[0] / 2;
				this.y = PsychoPong.Model.canvasSize[1] / 2;
			},

			move : function () {
				a = PsychoPong.Model.playerA;
				b = PsychoPong.Model.playerB;
				rebound = false; goal = false;

				collision = this._collision(a, b);

				if (collision[0]===true) {
					this._rebound(collision[1]);
				} else if (collision[0]===false) {
					this._goal(collision[1]);
				}

				if ((this.y+this.size >= PsychoPong.Model.canvasSize[1])||(this.y-this.size<=0)) {
					this.speed[1] *= -1;
				}
				if ((this.speed[0]<0&&this.x>0)||(this.speed[0]>0&&this.x+this.size<PsychoPong.Model.canvasSize[0])) {
					this.x += this.speed[0];
				}

				if ((this.speed[1]<0&&this.y>0)||(this.speed[1]>0&&this.y+this.size<PsychoPong.Model.canvasSize[1])) {
					this.y += this.speed[1];
				}

			},

			_collision : function (a, b) {
				if (this.x >= PsychoPong.Model.canvasSize[0] - b.width) {
					if ((this.y >= b.y)&&(this.y <= (b.y+b.height))) {
						return [true, b];
					} else {
						return [false, PsychoPong.Model.appendGoal(a, b)];
					}
				}
				if (this.x <= 0 + a.width) {
					if ((this.y >= a.y)&&(this.y <= (a.y+a.height))) {
						return [true, a];
					} else {
						return [false, PsychoPong.Model.appendGoal(b, a)];
					}
				}

				return [undefined, undefined];
			},

			_rebound : function (x) {
				this.speed[0] *= -1;
				this.speed[1] += x.speed / PsychoPong.player_speed * 0.1;
			},

			_goal : function (x) {
				this.x = PsychoPong.Model.canvasSize[0] / 2;
				this.y = PsychoPong.Model.canvasSize[1] / 2;

				speed = 1;
				if (x == PsychoPong.Model.playerB) { speed = -1; }
				this.speed = [speed, 0];

				PsychoPong.View.speedRotation++;
				PsychoPong.View.goal(goal);
			},
		},

		init : function () {
			this.playerA = new this.Player();

			this.playerB = new this.Player();
			this.playerB.x = this.canvasSize[0]-this.playerB.width;

			this.ball.init();
		},

		moveAll : function () {
			this.playerA.move();
			this.playerB.move();
			this.ball.move();
		},

		appendGoal : function (given, gotten) {
			goal = gotten;
			given.goals++;

			if (given.goals == 10) {
				PsychoPong.end(given);
			}

			return goal;
		},

		incSpeed : function () {
			s = PsychoPong.Model.ball.speed;

			// vertical speed
			s[1] += Math.round(Math.random())*0.01;

			// horizontal speed
			if (s[0] > 0) {
				s[0] += 1 / 200;
			} else {
				s[0] -= 1 / 200;
			}
		}

	}, // END of Model

	Controller : {
		init : function () {
			var speed = PsychoPong.player_speed;
			var parent = this;

			$(document).keydown(function (e) {
				switch(e.which) {
					// playerA
					case 65: // a
						PsychoPong.Model.playerA.speed = -speed;
						break;
					case 83: // s
						PsychoPong.Model.playerA.speed = speed;
						break;

					// playerB
					case 75: // k
						PsychoPong.Model.playerB.speed = -speed;
						break;
					case 76: // l
						PsychoPong.Model.playerB.speed = speed;
						break;
				}
			});

			$(document).keyup(function (e) {
				switch(e.which) {
					// playerA
					case 65: // a
						PsychoPong.Model.playerA.speed = 0;
						break;
					case 83: // s
						PsychoPong.Model.playerA.speed = 0;
						break;

					// playerB
					case 75: // k
						PsychoPong.Model.playerB.speed = 0;
						break;
					case 76: // l
						PsychoPong.Model.playerB.speed = 0;
						break;
				}
			});

			return this;
		},
	}, // END of Controller

	View : {
		canvas : undefined,
		context : undefined,
		status : true,

		speedRotation : 0,
		speed : 10,
		iRotation : 0,

		init : function (canvas) {
			this.canvas = $("#"+canvas);
			orCanvas = document.getElementById(canvas);
			this.context = orCanvas.getContext('2d');
			this.size = PsychoPong.Model.canvasSize;
			this.context.fillStyle = '#00f';

			this.setCanvasSize();
		},

		setCanvasSize : function () {
			size = $(window).width();
			if (size > $(window).height()) {
				size = $(window).height();
			}
			size -= 200;

			this.canvas.css('width', size);
			this.canvas.css('height', size);
		},

		render : function () {
			this.context.clearRect(0, 0, this.size[0]*3, this.size[1]*3);
			this._rotation();

			for(var i=0; i < 9; i++) {
				x = (i % 3) * this.size[0];
				y = Math.floor(i/3) * this.size[1];

				this._render(x, y);
			}

			this.i = this.i+1;
			if (this.i == 360) {
				this.i = 0;
			}

			this.status = true;
		},


		_render : function (x, y) {
			this.context.fillRect(x, y-1, this.size[0], 2); // up
			this.context.fillRect(x, y+this.size[1]-1, this.size[0], 2); // bottom
			this.context.fillRect(x-1, y, 2, this.size[1]); // left
			this.context.fillRect(x+this.size[0]-1, y, 2, this.size[1]); // right

			this._renderPlayer(x, y, PsychoPong.Model.playerA);
			this._renderPlayer(x, y, PsychoPong.Model.playerB);
			this._renderBall(x, y, PsychoPong.Model.ball);
		},

		_rotation : function () {
			if (this.speedRotation > 0) {
				this.canvas.css({
					'transform': 'rotate('+this.iRotate+'deg)',
					'-moz-transform': 'rotate('+this.iRotate+'deg)',
					'-o-transform': 'rotate('+this.iRotate+'deg)',
					'-webkit-transform': 'rotate('+this.iRotate+'deg)'
				});

				this.iRotation += ( this.speedRotation / 4 );
			}
		},

		_renderPlayer : function (x, y, p) {
			this.context.fillRect(x+p.x, y+p.y, p.width, p.height);
		},


		_renderBall : function(x, y, b) {
			this.context.beginPath();
			this.context.arc(x+b.x, y+b.y, b.size, 0, 2 * Math.PI, false);
			this.context.fill();
		},

		goal : function (player) {
			if (player == PsychoPong.Model.playerA) {
				$("#score .B").html(PsychoPong.Model.playerB.goals);
			} else {
				$("#score .A").html(PsychoPong.Model.playerA.goals);
			}
		},

		end : function (winner) {
			who = 'A';
			if (winner == PsychoPong.Model.playerB) {
				who = 'B';
			}

			$("#end span").html(who);

			$("#game").fadeOut();
			$("#score").fadeOut();
			$("#end").show();
		},
	}, // END of View
}

