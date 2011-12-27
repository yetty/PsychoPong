
var CrazyPong = {
	/**
	 * Object for the game CrazyPong
	 *
	 * @author: Juda Kaleta <juda.kaleta@gmail.com>
	 * @version: 0.1 alpha
	 * @license: GNU GPL3
	 */

	player_speed : 2,

	/**
	 * Initialization of the game.
	*/
	init : function (params) {
		if (typeof(params['canvas']) != 'string'||$("#"+params['canvas']).length == 0) {
			throw "Init error: Canvas is not an object";
		}

		this.model = this.Model.init();
		this.controller = this.Controller.init();
		this.viewer = this.Viewer.init(params['canvas']);

		return this;
	},

	start : function () {
		var parent = this;
		var frames = 0;
		CrazyPong.model.ball.speed = [1, 0];
		CrazyPong.game = true;

		setTimeout(function frame() {
			try {
				if ((parent.viewer.status !== false)&&(CrazyPong.game === true)) {
					frames++;
					if (frames%50 == 0) {
						s = CrazyPong.model.ball.speed[0];
						if (s > 0) {
							CrazyPong.model.ball.speed[0] += 0.1;
						} else {
							CrazyPong.model.ball.speed[0] -= 0.1;
						}

						if(frame%400 == 0) {
							CrazyPong.model.ball.speed[1] += Math.round(Math.random());
							frames = 0;
						}
					}

					parent.viewer.status = false;
					parent.model.moveAll();
					parent.viewer.render();
				}
			} finally {
				setTimeout(frame, 50);
			}
		}, 50);
	},

	end : function (winner) {
		CrazyPong.game = false;
		CrazyPong.viewer.end(winner);
	},

	Model : {
		canvasSize : [100, 100],

		Element : function () {
			this.x = 0;
			this.y = 0;
			this.height = 0;
			this.width = 0;
			this.speed = [0, 0];

			this._move = function () {
				if ((this.speed[0]<0&&this.x>0)||(this.speed[0]>0&&this.x+this.width<CrazyPong.model.canvasSize[0])) {
					this.x += this.speed[0];
				}

				if ((this.speed[1]<0&&this.y>0)||(this.speed[1]>0&&this.y+this.height<CrazyPong.model.canvasSize[1])) {
					this.y += this.speed[1];
				}
			};

			this._ballMove = function () {
				a = CrazyPong.model.playerA;
				b = CrazyPong.model.playerB;

				rebound = false;
				goal = false;

				if (this.x >= CrazyPong.model.canvasSize[0] - b.width) {
					if ((this.y >= b.y)&&(this.y <= (b.y+b.height))) {
						rebound = b;
					} else { goal = CrazyPong.model.appendGoal(a, b); }
				}

				if (this.x <= 0 + a.width) {
					if ((this.y >= a.y)&&(this.y <= (a.y+a.height))) {
						rebound = a;
					} else { goal = CrazyPong.model.appendGoal(b, a); }
				}

				if (rebound!==false) {
					this.speed[0] *= -1;
					this.speed[1] += rebound.speed[1] / CrazyPong.player_speed;
				}

				if (goal!==false) {
						this.x = CrazyPong.model.canvasSize[0] / 2;
						this.y = CrazyPong.model.canvasSize[1] / 2;

						speed = 1;
						if (goal == b) { speed = -1; }
						this.speed = [speed, 0];

						CrazyPong.viewer.speedRotate++;
						CrazyPong.viewer.goal(goal);
				}

				if ((this.y+this.height >= CrazyPong.model.canvasSize[1])||(this.y-this.height<=0)) {
					this.speed[1] *= -1;
				}

				this._move();

			};

			this.move = this._move;
		},

		playerA : undefined,
		playerB : undefined,
		ball : undefined,

		init : function () {
			this.playerA = new this.Element();
			this.playerA.goals = 0;
			this.playerA.height = 20;
			this.playerA.width = 5;
			this.playerA.y = (this.canvasSize[1]-this.playerA.height) / 2;

			this.playerB = new this.Element();
			this.playerB.goals = 0;
			this.playerB.height = 20;
			this.playerB.width = 5;
			this.playerB.x = this.canvasSize[0]-this.playerB.width;
			this.playerB.y = (this.canvasSize[1]-this.playerB.height) / 2;

			this.ball = new this.Element();
			this.ball.move = this.ball._ballMove;
			this.ball.y = this.canvasSize[1] / 2;
			this.ball.x = this.canvasSize[0] / 2;
			this.ball.width = 2;
			this.ball.height = 2;

			return this;
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
				CrazyPong.end(given);
			}

			return goal;
		}

	}, // END of Model

	Controller : {
		init : function () {
			var speed = CrazyPong.player_speed;
			var parent = this;

			$(document).keydown(function (e) {
				switch(e.which) {
					// playerA
					case 65: // a
						CrazyPong.model.playerA.speed = [0, -speed];
						break;
					case 83: // s
						CrazyPong.model.playerA.speed = [0, speed];
						break;

					// playerB
					case 75: // k
						CrazyPong.model.playerB.speed = [0, -speed];
						break;
					case 76: // l
						CrazyPong.model.playerB.speed = [0, speed];
						break;
				}
			});

			$(document).keyup(function (e) {
				switch(e.which) {
					// playerA
					case 65: // a
						CrazyPong.model.playerA.speed = [0, 0];
						break;
					case 83: // s
						CrazyPong.model.playerA.speed = [0, 0];
						break;

					// playerB
					case 75: // k
						CrazyPong.model.playerB.speed = [0, 0];
						break;
					case 76: // l
						CrazyPong.model.playerB.speed = [0, 0];
						break;
				}
			});

			return this;
		},

		speedUpRotate : function() {
			CrazyPong.viewer.speedRotate++;
		}

	}, // END of Controller

	Viewer : {
		canvas : undefined,
		context : undefined,
		status : true,

		speedRotate : 0,
		speed : 10,
		iRotate : 0,

		init : function (canvas) {
			this.canvas = $("#"+canvas);
			orCanvas = document.getElementById(canvas);
			this.context = orCanvas.getContext('2d');
			this.context.fillStyle = '#00f';

			this.size = CrazyPong.model.canvasSize;
			//this.canvas.width = 900;
			//this.canvas.height = 900;

			size = $(window).width();
			if (size > $(window).height()) {
				size = $(window).height();
			}
			size -= 200;

			this.canvas.css('width', size);
			this.canvas.css('height', size);
			//orCanvas.width = '800px';//$(window).width();
			//orCanvas.height = '500px'; //$(window).height();

			return this;
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

			this._renderPlayer(x, y, CrazyPong.model.playerA);
			this._renderPlayer(x, y, CrazyPong.model.playerB);
			this._renderBall(x, y, CrazyPong.model.ball);
		},

		_rotation : function () {
			if (this.speedRotate > 0) {
				this.canvas.css({
    				'transform': 'rotate('+this.iRotate+'deg)',
	    			'-moz-transform': 'rotate('+this.iRotate+'deg)',
		    		'-o-transform': 'rotate('+this.iRotate+'deg)',
				    '-webkit-transform': 'rotate('+this.iRotate+'deg)'
				});

				this.iRotate += ( this.speedRotate / 4 );
			}
		},

		_renderPlayer : function (x, y, p) {
			this.context.fillRect(x+p.x, y+p.y, p.width, p.height);
		},


		_renderBall : function(x, y, b) {
			this.context.beginPath();
			this.context.arc(x+b.x, y+b.y, b.width, 0, 2 * Math.PI, false);
			this.context.fill();
		},

		goal : function (player) {
			if (player == CrazyPong.model.playerA) {
				$("#score .B").html(CrazyPong.model.playerB.goals);
			} else {
				$("#score .A").html(CrazyPong.model.playerA.goals);
			}
		},

		end : function (winner) {
			who = 'A';
			if (winner == CrazyPong.model.playerB) {
				who = 'B';
			}

			$("#end span").html(who);

			$("#game").fadeOut();
			$("#score").fadeOut();
			$("#end").show();
		},



	}, // END of Viewer

}

