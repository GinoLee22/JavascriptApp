/*
GAME RULES:

- The game has 2 players, playing in rounds
- In each turn, a player rolls a dice as many times as he whishes. Each result get added to his ROUND score
- BUT, if the player rolls a 1, all his ROUND score gets lost. After that, it's the next player's turn
- The player can choose to 'Hold', which means that his ROUND score gets added to his GLBAL score. After that, it's the next player's turn
- The first player to reach 100 points on GLOBAL score wins the game

*/

/*
YOUR 3 CHALLENGES
Change the game to follow these rules:

1. A player looses his ENTIRE score when he rolls two 6 in a row. After that, it's the next player's turn. (Hint: Always save the previous dice roll in a separate variable)
2. Add an input field to the HTML where players can set the winning score, so that they can change the predefined score of 100. (Hint: you can read that value with the .value property in JavaScript. This is a good oportunity to use google to figure this out :)
3. Add another dice to the game, so that there are two dices now. The player looses his current score when one of them is a 1. (Hint: you will need CSS to position the second dice, so take a look at the CSS code for the first one.)
*/

var scores, roundScore, activePlayer, gamePlaying;

init();

var sixCnt = 0;

/*
 * DOM
 */

// change content
// document.querySelector("#current-" + activePlayer).textContent = dice;
// document.querySelector("#current-" + activePlayer).innerHTML = '<em>' + dice + '</em>';


// event
var button = document.querySelector(".btn-roll").addEventListener("click", function() {
	if (gamePlaying) {
		/* 
		 * 1. Random number
		 * 2. Display the result
		 * 3. Update the round socre IF the rolled number was NOT a 1 (1 -> clear up current score)
		 */
		var dice1 = Math.floor(Math.random() * 6) + 1;
		var dice2 = Math.floor(Math.random() * 6) + 1;
		
		document.querySelector("#dice-1").style.display = "block";
		document.querySelector("#dice-2").style.display = "block";

		document.querySelector("#dice-1").src = "dice-" + dice1 + ".png";
		document.querySelector("#dice-2").src = "dice-" + dice2 + ".png";

		if (dice1 !== 1 && dice2 !== 1) {
			roundScore += dice1 + dice2;
			document.querySelector("#current-" + activePlayer).textContent = roundScore;
		} else {
			nextPlayer();
		}

		// if (dice === 6) {
		// 	if (sixCnt === 0) {
		// 		sixCnt++;
		// 	} else {			// sixCnt === 1
		// 		// player lose entire scores
		// 		scores[activePlayer] = 0;
		// 		document.querySelector("#score-" + activePlayer).textContent = scores[activePlayer];
		// 		nextPlayer();
		// 		sixCnt = 0;
		// 	}
		// }

		// if (dice !== 1) {
		// 	roundScore += dice;
		// 	document.querySelector("#current-" + activePlayer).textContent = roundScore;
		// } else {			
		//  	nextPlayer();
		// }
	}
});

document.querySelector(".btn-hold").addEventListener("click", function() {
	if (gamePlaying) {
		/*
		 * 1. Add current score to global score
		 * 2. Update the UI
		 * 3. Check if player won the game
		 */
		sixCnt = 0;
		scores[activePlayer] += roundScore;
		document.querySelector("#score-" + activePlayer).textContent = scores[activePlayer];

		var input = document.querySelector(".final-score").value;
		var winScore;
		console.log(input);
		// type coercion is important here: undefined, 0, null or "" are COERCED to false. Else -> coerce to true
		if (input) {
			winScore = input;
		} else {
			winScore = 100;
		}

		if (scores[activePlayer] >= winScore) {
			document.querySelector("#name-" + activePlayer).textContent = "Winner!";

			document.querySelector("#dice-1").style.display = "none";
			document.querySelector("#dice-2").style.display = "none";

			document.querySelector(".player-" + activePlayer + "-panel").classList.add("winner");
			document.querySelector(".player-" + activePlayer + "-panel").classList.remove("active");
			gamePlaying = false;
		} else {
			nextPlayer();
		}
	}
});

document.querySelector(".btn-new").addEventListener("click", init);

function nextPlayer() {
	// change palyer
	activePlayer = (activePlayer === 0) ? 1 : 0;
 	roundScore = 0;

 	document.querySelector("#current-0").textContent = 0;
 	document.querySelector("#current-1").textContent = 0;
 	document.querySelector(".player-0-panel").classList.toggle("active");
 	document.querySelector(".player-1-panel").classList.toggle("active");
 	// document.querySelector(".dice").style.display = "none";
}

function init() {
	scores = [0, 0];
	activePlayer = 0;
	roundScore = 0;
	gamePlaying = true;

	document.querySelector("#dice-1").style.display = "none";
	document.querySelector("#dice-2").style.display = "none";

	document.querySelector("#score-0").textContent = 0;
	document.querySelector("#score-1").textContent = 0;
	document.querySelector("#current-0").textContent = 0;
	document.querySelector("#current-1").textContent = 0;
	document.querySelector("#name-0").textContent = "Player 1";
	document.querySelector("#name-1").textContent = "Player 2";
	document.querySelector(".player-0-panel").classList.remove("winner");
	document.querySelector(".player-1-panel").classList.remove("winner");
	document.querySelector(".player-0-panel").classList.remove("active");
	document.querySelector(".player-1-panel").classList.remove("active");
	document.querySelector(".player-0-panel").classList.add("active");
}




