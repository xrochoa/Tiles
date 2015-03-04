// 1 - Start enchant.js
enchant();

// 2 - On document load 
window.onload = function() {
    // 3 - Starting point
    var game = new Game(1000, 1000);
    // 4 - Preload resources
    game.preload('res/BG.jpg', 'res/BG2.jpg', 'res/BG3.jpg',
        'res/penguinSheet.png', 'res/Ice.jpg', 'res/Hit.mp3',
        'res/bgm.mp3');
    // 5 - Game settings
    game.fps = 60;
    game.scale = 0.5;
    game.onload = function() {
        // Once Game finishes loading
        var scene = new SceneStart();
        game.pushScene(scene);
    }
    // 7 - Start
    game.start();
    // SceneGame  
    var SceneGame = Class.create(Scene, {
        // The main gameplay scene.     
        initialize: function() {
            var game, label, bg, penguin, iceGroup;

            // 1 - Call superclass constructor
            Scene.apply(this);
            // 2 - Access to the game singleton instance
            game = Game.instance;
            // 3 - Create child nodes
            // Label
            label = new Label('TILES<br>0');
            label.x = 500 - (label.width / 2);
            label.y = 50;
            label.color = 'black';
            label.font = '20px strong';
            label.textAlign = 'center';
            label._style.textShadow = "-1px 0 black, 0 1px black, 1px 0 black, 0 -1px black";


            this.scoreLabel = label;
            bg = new Sprite(1000, 1000);
            bg.image = game.assets['res/BG.jpg'];
            // Penguin
            penguin = new Penguin();
            penguin.x = game.width / 2 - penguin.width / 2;
            penguin.y = 700;
            this.penguin = penguin;

            // Ice group
            iceGroup = new Group();
            this.iceGroup = iceGroup;

            // 4 - Add child nodes        
            this.addChild(bg);

            this.addChild(penguin);

            this.addChild(iceGroup);


            this.addChild(label);
            // Touch listener
            this.addEventListener(Event.RIGHT_BUTTON_DOWN, this.handleTouchControlRight);
            this.addEventListener(Event.LEFT_BUTTON_DOWN, this.handleTouchControlLeft);
            this.addEventListener(Event.UP_BUTTON_DOWN, this.pauseScene);


            //this.addEventListener(Event.TOUCH_START, this.handleTouchControl);
            // Update
            this.addEventListener(Event.ENTER_FRAME, this.update);

            // Instance variables
            this.generateIceTimer = 0;
            this.scoreTimer = 0;
            this.score = 0;
            // Background music
            this.bgm = game.assets['res/bgm.mp3']; // Add this line
            // Start BGM
            this.bgm.play();

        },
        handleTouchControlRight: function() {
            this.penguin.moveRight();
        },
        handleTouchControlLeft: function() {
            this.penguin.moveLeft();
        },
        pauseScene: function() {
            var game = Game.instance;
            game.pushScene(new ScenePause());


        },
        update: function(evt) {
            // Score increase as time passes
            this.scoreTimer += evt.elapsed * 0.001;
            if (this.scoreTimer >= 0.5) {
                this.setScore(this.score + 1);
                this.scoreTimer -= 0.5;
            }
            // Check if it's time to create a new set of obstacles
            this.generateIceTimer += evt.elapsed * 0.001;
            if (this.generateIceTimer >= 0.5) {
                var ice;
                this.generateIceTimer -= 0.5;
                ice = new Ice(Math.floor(Math.random() * 1));
                this.addChild(ice);
                //this.addChild(ice);
                this.iceGroup.addChild(ice);
                // Check collision
                for (var i = this.iceGroup.childNodes.length - 1; i >= 0; i--) {
                    var ice;
                    ice = this.iceGroup.childNodes[i];
                    if (ice.intersect(this.penguin)) {
                        var game = Game.instance;
                        game.assets['res/Hit.mp3'].play();
                        this.iceGroup.removeChild(ice);
                        // Add the following lines
                        // Game over
                        this.bgm.stop();
                        game.replaceScene(new SceneGameOver(this.score));
                        break;
                    }
                }
            }
            // Loop BGM
            if (this.bgm.currentTime >= this.bgm.duration) {
                this.bgm.play();
            }
        },
        setScore: function(value) {
            this.score = value;
            this.scoreLabel.text = 'TILES<br>' + this.score;
        }
    });

    // Penguin
    var Penguin = Class.create(Sprite, {
        // The player character.     
        initialize: function() {
            // 1 - Call superclass constructor
            Sprite.apply(this, [180, 230]);
            this.image = Game.instance.assets['res/penguinSheet.png'];
            // 2 - Animate
            this.animationDuration = 0;
            this.addEventListener(Event.ENTER_FRAME, this.updateAnimation);
        },
        updateAnimation: function(evt) {
            this.animationDuration += evt.elapsed * 0.001;
            if (this.animationDuration >= 0.25) {
                this.frame = (this.frame + 0) % 2;
                this.animationDuration -= 0.25;
            }
        },
        moveRight: function() {
            if (this.x >= 810) {
                this.tl.moveBy(0, 0, 0);

            } else {
                this.tl.moveBy(40, 0, 5);
            }
        },
        moveLeft: function() {
            if (this.x <= 10) {
                this.tl.moveBy(0, 0, 0);
            } else {
                this.tl.moveBy(-40, 0, 5);
            }
        }
    });



    // Ice Boulder
    var Ice = Class.create(Sprite, {
        // The obstacle that the penguin must avoid
        initialize: function(lane) {
            // Call superclass constructor
            Sprite.apply(this, [40, 40]);
            this.image = Game.instance.assets['res/Ice.jpg'];
            this.rotationSpeed = 0;
            this.setLane(lane);
            this.addEventListener(Event.ENTER_FRAME, this.update);
        },
        setLane: function(lane) {
            var game;
            game = Game.instance;

            this.rotationSpeed = Math.random() * 100 - 50;

            this.x = 50 + ((Math.floor(Math.random() * 5.8)) * 170); // * (game.width - 100);
            this.y = -this.height;
            this.rotation = Math.floor(Math.random() * 100);
        },
        update: function(evt) {
            var ySpeed, game;

            game = Game.instance;
            ySpeed = 500;

            this.y += ySpeed * evt.elapsed * 0.001;
            this.rotation += this.rotationSpeed * evt.elapsed * 0.001;
            if (this.y > game.height) {
                this.parentNode.removeChild(this);
            }
        }
    });

    // SceneGameOver  
    var SceneGameOver = Class.create(Scene, {
        initialize: function(score) {
            var gameOverLabel, scoreLabel, bg;
            Scene.apply(this);

            bg = new Sprite(1000, 1000);
            bg.image = game.assets['res/BG3.jpg'];
            bg.opacity = 0.2;
            this.backgroundColor = 'black';


            gameOverLabel = new Label("GAME OVER<br><br>Click to Restart");
            gameOverLabel.x = 500 - (gameOverLabel.width / 2);
            gameOverLabel.y = 300;
            gameOverLabel.color = 'red';
            gameOverLabel.font = '40px strong';
            gameOverLabel.textAlign = 'center';

            // Score label
            scoreLabel = new Label('TILES<br><br>' + score);
            scoreLabel.x = 500 - (scoreLabel.width / 2);
            scoreLabel.y = 500;
            scoreLabel.color = 'white';
            scoreLabel.font = '50px strong';
            scoreLabel.textAlign = 'center';

            // Listen for taps
            this.addEventListener(Event.TOUCH_START, this.touchToRestart);

            this.addChild(bg);


            // Add labels
            this.addChild(gameOverLabel);
            this.addChild(scoreLabel);

        },
        touchToRestart: function(evt) {
            var game = Game.instance;
            game.replaceScene(new SceneGame());

        }
    });


    // ScenePause  
    var ScenePause = Class.create(Scene, {
        initialize: function() {
            var PauseLabel;
            Scene.apply(this);
            this.backgroundColor = 'black';
            //this.opacity = 0.5;



            PauseLabel = new Label("PAUSE");
            PauseLabel.x = 500 - (PauseLabel.width / 2);
            PauseLabel.y = 500 - (PauseLabel.height / 2);
            PauseLabel.color = 'white';
            PauseLabel.font = '40px strong';
            PauseLabel.textAlign = 'center';



            // Listen for taps
            this.addEventListener(Event.UP_BUTTON_DOWN, this.touchToPause);

            // Add labels
            this.addChild(PauseLabel);

        },
        touchToPause: function(evt) {
            var game = Game.instance;
            game.popScene();

        }
    });

    // SceneStart  
    var SceneStart = Class.create(Scene, {
        initialize: function() {
            var PauseLabel;
            Scene.apply(this);

            bg = new Sprite(1000, 1000);
            bg.image = game.assets['res/BG2.jpg'];
            this.backgroundColor = 'black';
            //this.opacity = 0.5;



            PauseLabel = new Label("Click to start");
            PauseLabel.x = 500 - (PauseLabel.width / 2);
            PauseLabel.y = 800;
            PauseLabel.color = 'white';
            PauseLabel.font = '40px strong';
            PauseLabel.textAlign = 'center';



            // Listen for taps
            this.addEventListener(Event.TOUCH_START, this.touchToStart);
            this.addChild(bg);

            // Add labels
            this.addChild(PauseLabel);

        },
        touchToStart: function(evt) {
            var scene = new SceneGame();
            game.pushScene(scene);

        }
    });

};