/*
 * This class is for managing the hardness of the game as 
 * player goes higher levels.
 */

var LevelManager = function(){
	this.level = 1;
	this.signWeight = [90, 20, 15, 10];
	this.valueSign = new Value_Sign(6, this.signWeight);

	// Set the signWeight which depends on the level
	LevelManager.prototype.setSignWeight = function(level){
		this.signWeight[0] = 90 + (level-1) * 8;
		this.signWeight[1] = 20 + (level-1) * 4;
		this.signWeight[2] = 15 + (level-1) * 3;
		this.signWeight[3] = 10 + (level-1) * 2;
		this.valueSign.setSignWeight(this.signWeight);
	};

	// Sets the weight of the sign
	LevelManager.prototype.setLevel = function(level){
		// setting the range of the random values
		this.valueSign.setValueRange(6 + (level - 1) * 3);
		this.setSignWeight(level);
		this.level = level;
	};


	// Gets the value of Level
	LevelManager.prototype.getLevel = function(){
		return this.level;
	};

	// Sets the score and changes the level accordingly
	LevelManager.prototype.setScore = function(score){
		// level goes up after every 50 scores
		var level = 1 + Math.floor(score / 50);
		if(this.level < level)
			this.setLevel(level);
	};

	// Get a random value
	LevelManager.prototype.getValue = function(){
		return this.valueSign.getValue();
	};

	// Get a random sign
	LevelManager.prototype.getSign = function(){
		return this.valueSign.getSign();
	};

	// Reset everything
	LevelManager.prototype.reset = function(){
		this.setLevel(1);
	};
};
