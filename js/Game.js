class Game {
  constructor() {
    this.image = loadImage("images/bg3.jpg")
    this.blast = false;
  }

  getState() {
    var gameStateRef = database.ref('gameState');
    gameStateRef.on("value", function (data) {
      gameState = data.val();
    })

  }

  update(state) {
    database.ref('/').update({
      gameState: state
    });
  }

  async start() {
    if (gameState === 0) {
      player = new Player();
      var playerCountRef = await database.ref('playerCount').once("value");
      if (playerCountRef.exists()) {
        playerCount = playerCountRef.val();
        // player.getCount();
        console.log("game start playercount",playerCount)
      }
      form = new Form()
      form.display();
    }

    bike1 = createSprite(100, 200);
    bike1.addImage(bike1img)
    bike1.scale = 0.3;
    bike2 = createSprite(300, 200);
    bike2.addImage(bike2img)
    bike2.scale = 0.3;
    bike3 = createSprite(500, 200);
    bike3.addImage(bike3img)
    bike3.scale = 0.3;
    bike4 = createSprite(700, 200);
    bike4.addImage(bike4img)
    bike4.scale = 0.3;
    bikes = [bike1, bike2, bike3, bike4];
    powerCoins = new Group();
    this.addSprites(powerCoins, 18, powerCoinImage, 0.09);
    fuel = new Group();
    this.addSprites(fuel,18,fuelImage,0.09)
    
  }
  handlePlayerControls() {
    if (!this.blast) {
      if (keyIsDown(UP_ARROW)) {
        this.playerMoving = true;
        player.positionY += 10;
        player.update();
      }

      if (keyIsDown(LEFT_ARROW) && player.positionX > width / 3 - 50) {
        this.leftKeyActive = true;
        player.positionX -= 5;
        player.update();
      }

      if (keyIsDown(RIGHT_ARROW) && player.positionX < width / 2 + 300) {
        this.leftKeyActive = false;
        player.positionX += 5;
        player.update();
      }
    }
  }
  addSprites(spriteGroup, numberOfSprites, spriteImage, scale, positions = []) {
    for (var i = 0; i < numberOfSprites; i++) {
      var x, y;

      //C41 //SA
      if (positions.length > 0) {
        x = positions[i].x;
        y = positions[i].y;
        spriteImage = positions[i].image;
      } else {
        x = random(width / 2 + 450, width / 2 - 350);
        y = random(-height * 4.5, height - 500);
      }
      var sprite = createSprite(x, y);
      sprite.addImage("sprite", spriteImage);

      sprite.scale = scale;
      sprite.velocityY = 2;
      console.log("X=", x);
      console.log("y=", y);
      spriteGroup.add(sprite);
    }
  }
  play() {
    form.hide();

    Player.getPlayerInfo();
    player.getBikesAtEnd();


    if (allPlayers !== undefined) {
      //var display_position = 100;
      background(72, 72, 72);
      image(trackimg, 0, -displayHeight * 4, displayWidth, displayHeight * 5)
      // this.showFuelBar();
      // this.showLife();
      //index of the array
      var index = 0;

      //x and y position of the cars
      var x = 220;
      var y;

      for (var plr in allPlayers) {
        //add 1 to the index for every loop
        index = index + 1;

        //position the cars a little away from each other in x direction
        x = x + 230;
        //use data form the database to display the cars in y direction
        y = displayHeight - allPlayers[plr].distance;
        bikes[index - 1].x = x;
        bikes[index - 1].y = y;

        if (index === player.index) {
          stroke(10)
          fill("red")
          ellipse(x, y, 60, 60)
          bikes[index - 1].shapeColor = "red";
          camera.position.x = displayWidth / 2;
          camera.position.y = bikes[index - 1].y
          textSize(23);
          fill("yellow");
          text(allPlayers[plr].name, x - 35, y + 80)
        }
        this.handlePowerCoins(index);
        this.handleFuel(index);
        //textSize(15);
        //text(allPlayers[plr].name + ": " + allPlayers[plr].distance, 120,display_position)
      }

    }
    this.handlePlayerControls();

    if (keyIsDown(UP_ARROW) && player.index !== null) {
      player.distance += 10
      player.update();
    }
    if (player.distance > 4180) {
      gameState = 2
      player.rank = player.rank + 1;
      player.updatebikesAtEnd(player.rank)
      player.update()
    }

    drawSprites();
  }
  end() {
    console.log("ended")

  }
  showLeaderBoard() {
    background(this.image);

    //displaying leaderBoard heading
    var leaderBoard = createElement("h1");
    leaderBoard.position(displayWidth / 2 - 50, 50);
    leaderBoard.html("Leaderboard");
    leaderBoard.style("color", "magenta");

    // making an ranks array which contains all players and their ranks
    var ranks = [];

    for (var p in allPlayers) {
      ranks.push({ name: allPlayers[p].name, rank: allPlayers[p].rank });
    }

    var y = 200;
    // for loop over ranks array to display players according to rank
    for (var r in ranks) {
      //creating dom element with little styling to display player's name and rank
      var title = createElement("h2");
      title.position(displayWidth / 2-150, y);
      title.style("color", "purple");
      title.style.fontSize="xx-large"
      // keeping a y gap of 100 between each player
      y = y + 100;

      // sorting the ranks array so that the players are shown in ascending order
      ranks.sort(function (a, b) {
        return a.rank - b.rank;
      });

      //displaying the player name and rank
      title.html(ranks[r].name + " : " + ranks[r].rank);
    }
  }
  handleFuel(index) {
    // Adding fuel
    bikes[index - 1].overlap(fuel, function(collector, collected) {
      player.fuel = 185;
      //collected is the sprite in the group collectibles that triggered
      //the event
      collected.remove();
    });

    // Reducing Player car fuel
    if (player.fuel > 0 && this.playerMoving) {
      player.fuel -= 0.3;
    }

    if (player.fuel <= 0) {
      gameState = 2;
      this.gameOver();
    }
  }
  showFuelBar() {
    push();
    image(fuelImage, width / 2 - 130, height - player.positionY - 350, 20, 20);
    fill("white");
    rect(width / 2 - 100, height - player.positionY - 350, 185, 20);
    fill("#ffc400");
    rect(width / 2 - 100, height - player.positionY - 350, player.fuel, 20);
    noStroke();
    pop();
  }
  showLife() {
    push();
    image(lifeImage, width / 2 - 130, height - player.positionY - 400, 20, 20);
    fill("white");
    rect(width / 2 - 100, height - player.positionY - 400, 185, 20);
    fill("#f50057");
    rect(width / 2 - 100, height - player.positionY - 400, player.life, 20);
    noStroke();
    pop();
  }
  handlePowerCoins(index) {
    bikes[index - 1].overlap(powerCoins, function (collector, collected) {
      player.score += 21;
      player.update();
      //collected is the sprite in the group collectibles that triggered
      //the event
      collected.remove();
    });
  }
}

