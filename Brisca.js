var readlineSync = require('readline-sync');

// Ordered according to their score
const names = ["Ace", "Three", "King", "Knight", "Ten", "Seven", "Six", "Five", "Four", "Two"];
const suits = ["Clubs", "Spades", "Hearts", "Diamonds"];

class Card {
    constructor(suit, name) {
        this.suit = suit;
        this.name = name;
    }
}

const constants = {user: "User", comp: "Computer", changeHi: "Seven", changeLo: "Two"};

// Shuffles a deck
function shuffle(deck) {
    var currentIndex = deck.length, temporaryValue, randomIndex;
        while (0 !== currentIndex) {
    
        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
    
        // And swap it with the current element.
        temporaryValue = deck[currentIndex];
        deck[currentIndex] = deck[randomIndex];
        deck[randomIndex] = temporaryValue;
    }
    return deck;
}

// Creates a deck and returns a shuffled deck
function newShuffledDeck() {
    var deck = [];
    for (var card = 0; card < names.length; card++) {
        for (var suit = 0; suit < suits.length; suit++) {
            deck.push(new Card(suits[suit], names[card]));
        }
    }
    return shuffle(deck);
}

// Returns the score of all the cards in the array
function score(cards) {
    result = 0;
    for (var card = 0; card < cards.length; card++) {
        switch(cards[card].name) {
            case "Ace":
                result += 11;
                break;
            case "Three":
                result += 10;
                break;
            case "King":
                result += 4;
                break;
            case "Knight":
                result += 3;
                break;
            case "Ten":
                result += 2;
                break;
        }
    }
    return result;
}

// Compares two cards and returns the winner, where first is the player that went first and played card1
function compare(card1, card2, mainSuit, first) {

    // Checks who played first
    if (first === constants.user) {
        var second = constants.comp;
    } else {
        var second = constants.user;
    }

    // Evaluates who won the round
    if (card1.suit === mainSuit && card2.suit !== mainSuit) {
        return first;
    } else if (card1.suit !== mainSuit && card2.suit === mainSuit) {
        return second;
    } else if (card1.suit !== card2.suit) {
        return first;
    } else { 
        for (index = 0; index < names.length; index++) {
            if (card1.name === names[index]) {
                return first;
            } else if (card2.name === names[index]) {
                return second;
            }
        }
    }
}

function showInfo(card) {
    return (card.name + " of " + card.suit + ".\n");
}

// This IA beat an opponent that plays cards at random ~89% of the time and draws ~1 of the time
function improvedIA(card, compHand, mainSuit) {

    // Checks its hand for the lowest value cards
    var noSuited = Infinity;
    var noSuitedIndex = -1;
    var suited = Infinity;
    var suitedIndex = -1;
    for (var option = 0; option < compHand.length; option++) {
        var myScore = score([compHand[option]]);
        if (compHand[option].suit !== mainSuit) {
            if (noSuited > myScore) {
                noSuited = myScore;
                noSuitedIndex = option;
            }
        } else {
            if (suited > myScore) {
                suited = myScore;
                suitedIndex = option;
            }
        }
    }
    
    // Case where computer plays first
    if (card === null) {
        if (noSuited !== Infinity) {
            return compHand.splice(noSuitedIndex, 1)[0];
        } else {
            return compHand.splice(suitedIndex, 1)[0];
        }
    }
    
    // Case where computer plays second
    else {
        var winners = [];
        var canWin = false;

        // Checks if it can win with any given card
        for (var option = 0; option < compHand.length; option++) {
            winners.push(compare(card, compHand[option], mainSuit, constants.user));
            if (winners[option] === constants.comp) {
                canWin = true;
            }
        }
        if (!canWin) {
            if (noSuitedIndex !== -1 && noSuited < 5) {
                return compHand.splice(noSuitedIndex, 1)[0];
            } else  if (suitedIndex !== -1) {
                return compHand.splice(suitedIndex, 1)[0];
            } else {
                return compHand.splice(noSuitedIndex, 1)[0];
            }
        } else {
            var userScore = score([card]);
            var max = -1;
            var index = 0;
            for (var option = 0; option < compHand.length; option++) {
                if (winners[option] === constants.comp) {
                    if (compHand[option].suit !== mainSuit) {
                        var total = score([compHand[option]]) + userScore;
                        if (total > max) {
                            max = total;
                            index = option;
                        }
                    }
                }
            }
            if (max !== -1) {
                return compHand.splice(index, 1)[0];
            } else {
                return compHand.splice(suitedIndex, 1)[0];
            }
        }
    }
}

// Draws n cards from deck
function draw(n, deck) {
    var hand = [];
    for (var card = 0; card < n; card++) {
        hand.push(deck.shift());
    }
    return hand;
}

function userTurn(userHand) {
    var text = "Choose one card to play. You have the following cards: \n1. " + showInfo(userHand[0]);
    switch(userHand.length) {
        case 3:
            text += "2. " + showInfo(userHand[1]) + "3. " + showInfo(userHand[2]);
            break;
        case 2:
            text += "2. " + showInfo(userHand[1]);
            break;
    }

    // Asks the User what he wants to play
    console.log("To exit enter K.")
    var cardChoice = readlineSync.question(text);

    // Validates input
    if (cardChoice === "K" || cardChoice === "k") {
        return 0;
    } else if (Number.isNaN(cardChoice) || cardChoice !== Math.round(Number(cardChoice)).toString() || cardChoice > userHand.length || cardChoice < 1) {
        console.log("Invalid input, please enter a number between 1 and your handsize.");
        return userTurn(userHand);
    } else {
        console.log("You have played: " + showInfo(userHand[cardChoice - 1]));
        return userHand.splice(cardChoice - 1, 1)[0];
    }
}

function userSwap(userHand, card, firstCard) {
    var choice = readlineSync.question("Do you want to swap the following cards (Y/N): \n" + showInfo(userHand[card]) + showInfo(firstCard));
    if (choice === "Y" || choice === "y") {
        var temp = firstCard;
        firstCard = userHand.splice(card, 1)[0];
        userHand.push(temp);
        return;
    } else if (choice === "N" || choice === "n") {
        return;
    } else {
        console.log("Please enter a valid input.")
        return userSwap(userHand, card, firstCard);
    }
}

function compSwap(compHand, card, firstCard) {
    var temp = firstCard;
    firstCard = compHand.splice(card, 1)[0];
    compHand.push(temp);
    console.log("Computer swapped cards.")
    return;
}

function turn(p) {

    // Checks who played first
    if (p.player === constants.comp) {
        var compCard = improvedIA(null, p.compHand, p.mainSuit);
        console.log("Computer plays: " + showInfo(compCard));
        var userCard = userTurn(p.userHand);
        
        // User exits the game
        if (userCard === 0) {
            return 0;
        }
        var winner = compare(compCard, userCard, p.mainSuit, p.player);
    } else {
        var userCard = userTurn(p.userHand);
        
        // User exits the game
        if (userCard === 0) {
            return 0;
        }
        var compCard = improvedIA(userCard, p.compHand, p.mainSuit);
        console.log("Computer plays: " + showInfo(compCard));
        var winner = compare(userCard, compCard, p.mainSuit, p.player);
    }

    // Calculates the score of the round
    var roundScore = score([userCard, compCard]);
    if (winner === constants.user) {
        p.userScore += roundScore;
    } else {
        p.compScore += roundScore;
    }

    // Checks for swapping conditions
    for (var card = 0; card < p.userHand.length; card++) {
        if (winner === constants.user) {
            if (p.userHand[card].suit === p.mainSuit) {
                if (p.userHand[card].name === constants.changeHi && score([p.firstCard]) !== 0) {
                    userSwap(p.userHand, card, p.firstCard);
                } else if (p.userHand[card].name === constants.changeLo && score([p.firstCard]) === 0) {
                    userSwap(p.userHand, card, p.firstCard);
                }
            }
        } else {
            if (p.compHand[card].suit === p.mainSuit) {
                if (p.compHand[card].name === constants.changeHi && score([p.firstCard]) !== 0) {
                    compSwap(p.compHand, card, p.firstCard);
                } else if (p.compHand[card].name === constants.changeLo && score([p.firstCard]) === 0) {
                    compSwap(p.compHand, card, p.firstCard);
                }
            }
        }
    }

    // Draw step, winner draws first
    if (p.deck.length !== 1 && p.deck.length !== 0) {
        if (winner === constants.user) {
            p.userHand.push(draw(1, p.deck)[0]);
            p.compHand.push(draw(1, p.deck)[0]);
        } else {
            p.compHand.push(draw(1, p.deck)[0]);
            p.userHand.push(draw(1, p.deck)[0]);
        }
    } 
    
    // Last card drawn is the face-up card from the beggining
    else if (p.deck.length === 1) {
        if (winner === constants.user) {
            p.userHand.push(draw(1, p.deck)[0]);
            p.compHand.push(p.firstCard);
        } else {
            p.compHand.push(draw(1, p.deck)[0]);
            p.userHand.push(p.firstCard);
        }
    }

    console.log(winner + " wins " + roundScore + " points. The current score is:\nComputer: " + p.compScore + "\nUser: " + p.userScore);
    return winner;
}

function initGame() {
    var deck = newShuffledDeck();

    // Take the first card and leave it face-up
    var firstCard = deck.shift();
    const mainSuit = firstCard.suit;

    // Initialize hands and score
    var userHand = draw(3, deck);
    var compHand = draw(3, deck);
    var userScore = 0;
    var compScore = 0;

    // Coin toss to choose the first player
    if (Math.random() >= 0.5) {
        var player = constants.comp;
    } else {
        var player = constants.user;
    }

    console.log("The first card is: " + showInfo(firstCard));
    return {firstCard, mainSuit, userHand, compHand, player, deck, userScore, compScore};
}

// Main
function newGame() {
    var parameters = initGame();
    while (parameters.userHand.length !== 0 && parameters.compHand.length !== 0) {
        parameters.player = turn(parameters);
        
        // User exits the game
        if (parameters.player === 0) {
            return;
        }
    }

    // Game ends
    if (parameters.userScore > parameters.compScore) {
        console.log("Game ended, User won with " + parameters.userScore + " points.");
        return 0;
    } else if (parameters.userScore < parameters.compScore) {
        console.log("Game ended, Computer won with " + parameters.compScore + " points.");
        return 1;
    } else {
        console.log("Game ended with a tie.");
        return 0.00001;
    }
}

function main() {
    var userChoice = readlineSync.question("To start a new game enter S. To exit enter K.\n");
    if (userChoice === "S" || userChoice === "s") {
        newGame();
    } else if (userChoice === "K" || userChoice === "k"){
        return;
    } else {
        console.log("Invalid input.\n");
        return main();
    }
    main();
}

main();
