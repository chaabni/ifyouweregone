/*global Game*/

/**
 * Returns a random integer between min and max
 * Using Math.round() will give you a non-uniform distribution!
 */


var wKey,
    aKey,
    sKey,
    dKey,
    spaceKey;

var group,
    player,
    ground,
    background,
    cutscene = false,
    scrollPosition = 0;

Game.Level1 = function(game) {
  this.game = game;
};

Game.Level1.prototype = {
  create: function() {
    this.game.world.setBounds(0, 0 ,Game.w ,Game.h);
		this.game.stage.backgroundColor = '#000';

    background = this.game.add.tileSprite(0, 0, this.game.width, this.game.height, borderbmd);
    background.tileScale.set(4);
    background.tint = 0x444444;

    border = this.game.add.tileSprite(-512, this.game.height - 32, this.game.width + 512, 32, borderbmd);
    border.enableBody = true;

    this.game.physics.arcade.enable(border);
    border.body.immovable = true;
    border.body.allowGravity = false;

    player = this.game.add.sprite(128, this.game.world.centerY, playerbmd);
    player.enableBody = true;
    this.game.physics.arcade.enable(player);
    player.anchor.set(0.5);
    player.tint = 0xf660ab;
    player.body.gravity.y = 750;

    this.pillars = this.game.add.group();

    this.timer = this.game.time.events.loop(1500, this.addPillars, this);  

    // Music
    this.music = this.game.add.sound('music');
    this.music.volume = 0.5;
    this.music.play('',0,1,true);

    //Add SFX
    this.deadSnd = this.game.add.sound('dead');
    this.deadSnd.volume = 0.5;

    this.jumpSnd = this.game.add.sound('jump');
    this.jumpSnd.volume = 0.5;


    //Setup WASD and extra keys
    wKey = this.game.input.keyboard.addKey(Phaser.Keyboard.W);
    aKey = this.game.input.keyboard.addKey(Phaser.Keyboard.A);
    sKey = this.game.input.keyboard.addKey(Phaser.Keyboard.S);
    dKey = this.game.input.keyboard.addKey(Phaser.Keyboard.D);
    spaceKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

    this.emitter = this.game.add.emitter(0, 0, 100);
    this.emitter.makeParticles(debris);
    this.emitter.gravity = 500;
    this.emitter.minParticleSpeed.setTo(-200, -200);
    this.emitter.maxParticleSpeed.setTo(200, 200);
  
    this.cursors = this.game.input.keyboard.createCursorKeys();

    Game.score = 0;

    this.deathText = this.game.add.bitmapText(Game.w - 230 , 16, 'minecraftia','Deaths: '+Game.deaths, 32);
    this.playAgainText = this.game.add.bitmapText(Game.w + 100, this.game.world.centerY, 'minecraftia','test',48);

    this.messageText = this.game.add.bitmapText(this.game.world.centerX - 300, this.game.world.centerY,'minecraftia', 'I\'d run through fire...',32);
    this.messageText.tint = 0xf660ab;
    this.game.add.tween(this.messageText).to({alpha: 0}, 1800).start();
 

  },
  update: function() {

    scrollPosition -= 6;
    if (Game.score < 16) {

      border.tilePosition.x = scrollPosition;
      background.tilePosition.x = scrollPosition * 0.1;

      if (player.alive === true) {
        this.game.physics.arcade.collide(player, this.pillars, this.hitPillar, null, this);
        this.game.physics.arcade.collide(border, player);
        this.playerMovement();
      }else {

        this.playAgainText.setText('Try Again?');

        this.game.time.events.add(Phaser.Timer.SECOND * 1.5, function() { 
            this.game.add.tween(this.playAgainText).to({x: this.game.world.centerX-300}, 355, Phaser.Easing.Linear.None).start();
        }, this);
          
        if (this.game.input.activePointer.isDown || wKey.isDown || spaceKey.isDown || this.cursors.up.isDown){
          this.pillars.forEach(function(p) {
            p.alive = false;
          });
          this.music.stop();
          this.game.state.start('Level1');
        }
      }

     
    }else {
      background.tilePosition.y = scrollPosition * 0.3;
      if (cutscene === false) {
        cutscene = true;
        player.body.velocity.y = 0;
        player.body.allowGravity = false;
        var p = this.game.add.tween(player).to({x: this.game.world.centerX, y : this.game.world.centerY - 100}, 2000, Phaser.Easing.Linear.None, true);

          this.pillars.forEach(function(p) {
            p.body.velocity.x = 0;
            p.body.velocity.y = -500;
          });


        p.onComplete.add(function () {
          this.game.state.start('Level2');
        }, this);
      }
      
    }

  },
  hitPillar: function(plyr, pillar) {
    console.log('ouch');
      this.playerDead();
  },
  playerDead: function() {
    this.game.plugins.ScreenShake.start(40);
    this.deadSnd.play();

    Game.deaths += 1;
    this.deathText.setText('Deaths: ' + Game.deaths);

    player.alive = false;
    player.kill();
    this.emitter.x = player.x;
    this.emitter.y = player.y;
    this.emitter.start(true, 1000, null, 128);
  },
  addPillars: function() {
    if (player.alive === false) {
      return;
    }else {
      Game.score += 1;
    }
    var hole = Math.floor(Math.random() * 7) ;
     for (var i = 0; i < 9; i++) {
       if (i !== hole && i !== hole + 1 && i !== hole + 2) { 
         this.addPillar(800, i * 32 + 280);   
       }
     }
  },
  addPillar: function(x,y) {

    var p;
    if (this.pillars.getFirstExists(false) === null) {
      p = this.add.sprite(x, y, playerbmd, 0); 
      this.game.physics.arcade.enable(p);
      p.checkWorldBounds = true;
      p.outOfBoundsKill = true;
      p.body.immovable = true;
      this.pillars.add(p);
      console.log('create pillar');
    }else {
      p = this.pillars.getFirstExists(false);
      p.reset(x, y);
      console.log('rez pillar');
    }

    p.tint = 0xff0000;

    this.game.physics.arcade.enable(p);

    if (Game.score < 16) {
      p.body.velocity.x = -355; 
    }else {
      p.body.velocity.x = 0;
      p.body.velocity.y = -500;
    }
  },

  playerMovement: function() {
    
    if ((spaceKey.isDown || this.game.input.activePointer.isDown || this.cursors.up.isDown || wKey.isDown) && player.body.touching.down) {
        this.jumpSnd.play();
        player.body.velocity.y = -600;
        this.game.add.tween(player).to({angle: player.angle - 270}, 800, Phaser.Easing.Linear.None).start();

    }

    spaceKey.onUp.add(function() {
      lowJump();
    },this);

    this.game.input.onUp.add(function() {
      lowJump();
    },this);

    wKey.onUp.add(function() {
      lowJump();
    },this);

    this.cursors.up.onUp.add(function() {
      lowJump();
    },this);

    function lowJump() {
      if (player.body.velocity.y < -200) {
        player.body.velocity.y = -200;
      }
    }


  },

};
