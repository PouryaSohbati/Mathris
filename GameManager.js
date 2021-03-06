$(document).ready(function(){
	var canvas = $("#canvas")[0];
	var context = canvas.getContext("2d");	


	///////////////////////////////////////////////////////////////////////////
	//								Variables								 //
	///////////////////////////////////////////////////////////////////////////
	var gameLoop;
	var spawnInterval;
	var blocks;
	var selectedBlocks;
	var BM;
	var problem;
	var pauseFlag;
	var gameOver;
	var sound;
	var score;
	var curtain1;
	var curtain2;
	var images = [];

	var buttons = new Array();				// An array that hold buttons
	var hud = new HUD(context, buttons);
	var levelM = new LevelManager();

	///////////////////////////////////////////////////////////////////////////
	//							Some Needed Functions						 //
	///////////////////////////////////////////////////////////////////////////

	// This function allocates the buttons and curtains
	var allocating = function(){
		sound = true;

		curtain1 = new Curtain(resources.xyDim.PH_Bar.x, resources.xyDim.PH_Bar.y, resources.xyDim.PH_Bar.width, 
							resources.xyDim.PH_Bar.height, resources.colors.curtain2, 1.5, 'V', 1, context, drawManager);
		curtain2 = new Curtain(resources.xyDim.field.x, resources.xyDim.field.y, resources.xyDim.field.width, 
							resources.xyDim.field.height, resources.colors.curtain, 1.5, 'H', 2, context);

		// This button deselects every selected blocks
		buttons.push(new Button(context, 248, 380, 20, 20, deselectAll));
		// This button pauses and unpauses the game
		buttons.push(new Button(context, 271, 380, 20, 20, pause, unpause));
		// This button mute and unmutes the game
		buttons.push(new Button(context, 294, 380, 20, 20, mute, unmute));
		// This button creates a new game
		buttons.push(new Button(context, 248, 410, 66, 40, initGame));

		// setting images for each button
		buttons[0].setPictures(images[1]);
		buttons[1].setPictures(images[2], images[3]);
		buttons[2].setPictures(images[4], images[5]);
		buttons[3].setPictures(images[6]);

		// starts the game
		initGame();
	};

	// This function initializes the game
	var initGame = function(){
		reset();
		blocks = createBlockArray();		// Allocating array that holds every blocks
		selectedBlocks = new Array(); 		// An array that holds selected blocks
		BM = new BlockManager();
		problem = new Problem(blocks, selectedBlocks);
		
		for(var i = 0; i < blocks.length; ++i){	// Column
			for(var j = 0; j < resources.initialNumBlocks; ++j){ // Row
				blocks[i].push(BM.spawnAt(i, j, levelM.getValue(), levelM.getSign()));
			}
		}
		problem.createProblem(); 				 // Creates a problem(question)
		hud.setPH(problem.getProblem(), "");	 // Passes the problem and the helper to the HUD

		setIntervals();	
	};
	
	// This function reset every variable
	var reset = function(){
		gameOver = false;
		pauseFlag = false;
		score = 0;
		curtain1.resetState();
		curtain2.resetState();
		buttons[1].resetState(); // change the state of pause
		hud.resetScore();
		hud.resetLevel();
		levelM.reset();
	};

	// This function clears the intervals
	var clearIntervals = function(){
		// Loop that updates everything
		if(typeof gameLoop !== undefined) clearInterval(gameLoop);
		// Loop that spawns blocksd
		if(typeof spawnInterval != undefined) clearInterval(spawnInterval);
	};

	// This function manages the intervals (gameLoop and spawnInterval)
	var setIntervals = function(GLInv, SPInv){
		var GLInv = GLInv;
		var SPInv = SPInv;

		//initializes if no argument was passed in
		if (GLInv === undefined)
			GLInv = 15;
		if (SPInv === undefined)
			SPInv = 4000;

		clearIntervals();
		gameLoop = setInterval(function(){drawManager();
										  updateManager();
										  }, GLInv);
		spawnInterval = setInterval(function(){var temp = BM.spawnRandBlock(levelM.getValue(), levelM.getSign());
												blocks[temp.column].push(temp);
												}, SPInv);
	};

	// This function allocates two dimentional array for blocks 
	// first dimention is for columns and the second is for the rows
	var createBlockArray = function(){
		var arr = new Array(resources.numberOfBlocks.column);
		for(var i = 0; i < arr.length; ++i){
			arr[i] = new Array();
		}
		return arr;
	};

	// This function deselects all of the selected blocks
	var deselectAll = function(){
		if (gameOver || pauseFlag) return false;
		for(var i in selectedBlocks){
			selectedBlocks[i].select();
		}
		selectedBlocks.splice(0, selectedBlocks.length);
		hud.setHelper("");
		return true;
	};

	// This function is a draw manager and calls all draw functions
	var drawManager = function(){
		// Draws the background
		context.fillStyle = resources.colors.background;
		context.fillRect(resources.xyDim.canvas.x, resources.xyDim.canvas.y, 
							resources.xyDim.canvas.width, resources.xyDim.canvas.height);
		// Draws the blocks
		for (index in blocks){
			for (i in blocks[index])
				drawBlock.call(blocks[index][i], context);
		}
		hud.draw(); // Draws the HUD and every button in the HUD
	};

	// this function pauses the game
	var pause = function(){
		if(!gameOver && curtain1.closeCurtain() && curtain2.closeCurtain()){
 			clearIntervals();
 			pauseFlag = true;
 			return true;
 		}
 		return false;
	};

	// this function unpauses the game
	var unpause = function(){
		if(curtain1.openCurtain() && curtain2.openCurtain()){
			setTimeout(function(){setIntervals(); pauseFlag = false;}, 1600);
			return true;
		}
		return false;
	};

	// This function mutes the game
	var mute = function(){
		sound = false;
		return true;
	};

	// This function unmutes the game
	var unmute = function(){
		sound = true;
		return true;
	};

	//checks to see if the game is over
	var endGame = function(){
		// if a column has reached the top
		for (var i in blocks){
			if (blocks[i].length === resources.numberOfBlocks.row){
				// if that block is stationary
				if(blocks[i][resources.numberOfBlocks.row-1].speed === 0)
					return true;
			}
		}
		return false;
	};

	// This function is an update manager and calls all update functions
	var updateManager = function(){
		// Updates the blocks
		for (var i = 0; i < blocks.length; ++i){
			for (var j = 0; j < blocks[i].length; ++j){
				var prev;
				if(j > 0)
					prev = blocks[i][j-1];
				else
					prev = undefined;
				// Passes the object under it, it it exists to check for collision check
				blocks[i][j].update(prev); 
			}
		}
		if(endGame()){
			clearInterval(spawnInterval);
			gameOver = true;
			return;
		}
	};

	var removeBlocksFromField = function(){

		// delete the selected block
		for (var i in selectedBlocks){
			for (var j in blocks){
				if(blocks[j].indexOf(selectedBlocks[i]) !== -1){
					killBlock.call(selectedBlocks[i], context, images[0]);
					// Return it to the object pool to be reused
					BM.returnToPool(selectedBlocks[i]);	
					// Remove it from the blocks array
					blocks[j].splice(blocks[j].indexOf(selectedBlocks[i]), 1); 
				}
			}
		}
		// Remove everything from the selected blocks array
		selectedBlocks.splice(0, selectedBlocks.length);

	};

	// This function calculates the score
	var calculateScore = function(){
		return selectedBlocks.length;
	};

	// What to do if the player got the answer
	var gotTheAnswer = function(){
		if(sound) resources.sounds.puff.play();	 // play the puff sound
		score += calculateScore();				 // calculate the score
		levelM.setScore(score);					 // sets the score for 
		hud.setScore(score);			 		 // pass the score to hud
		hud.setLevel(levelM.getLevel());		 // update the level in hud
		removeBlocksFromField();				 // Remove the selected blocks
		problem.createProblem(); 				 // Creates a problem(question)
		hud.setPH(problem.getProblem(), "");	 // Passes the problem and the helper to the HUD
	};

	// This function is a click handller 
	var handleClicks = function(e){
		var rect = canvas.getBoundingClientRect();
	    var mouseX = e.clientX - rect.left;
	    var mouseY = e.clientY - rect.top;

	    if(blocks === undefined) return;
	    // Check to see what buttons were clicked
		var mouseInHUD = hud.pointInButton(mouseX, mouseY); 
		// if buttons were clicked return
		if(mouseInHUD || pauseFlag || gameOver) return; 
		// Check to see what blocks were clicked
		for(var i = 0; i < blocks.length; ++i){			// Columns
			for(var j = 0; j < blocks[i].length; ++j){  // Rows
				// If this blocked clicked
				if(pointInBlock.call(blocks[i][j], mouseX, mouseY)){
					// Change the selected status
					blocks[i][j].select();	
					// If selected, add to array of selected blocks
					if(blocks[i][j].selected)
						selectedBlocks.push(blocks[i][j]); 
					// if deselected, remove it from the array of selected blocks
					else	
						selectedBlocks.splice(selectedBlocks.indexOf(blocks[i][j]), 1); 
					// Check answer
					if(problem.checkAnswer())
						gotTheAnswer();
					else 
						hud.setHelper(problem.helper()); // Passes the helper to the HUD
				}
			}
		}
	};


	// Loads the images that and stops the game from starting untill all of the images are loaded
	// startGame is the function that this function calls when all images load
	var loadImages = function(imgs, startGame) {
		var loadedImages = 0;
		var numImages = 0;
		for (var i in imgs) {
			numImages++;
		}
		for (var i in imgs) {
			images.push(new Image());
			images[images.length-1].src = imgs[i];
			images[images.length-1].onload = function(){
				if (++loadedImages === numImages) {
					startGame();
				}
			};
		}
	};

	///////////////////////////////////////////////////////////////////////////
	//									Main 								 //
	///////////////////////////////////////////////////////////////////////////

	// calls allocate after all images have finished loading
    loadImages(resources.images, allocating); 

	document.addEventListener('click', handleClicks);

});