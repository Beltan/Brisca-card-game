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

const constants = {user: "User", comp: "Computer"};

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
        var score1 = score(card1);
        var score2 = score(card2);
        if (score1 > score2) {
            return first;
        } else {
            return second;
        }
    }
}

function showInfo(card) {
    return (card.name + " of " + card.suit + "\n");
}

// TODO: Implement better AI
function comp(card, compHand, mainSuit) {
    var compCard = compHand.shift();
    console.log("Computer plays: " + showInfo(compCard));
    return compCard;
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
    switch(userHand.length) {
        var text = "Choose one card to play. You have the following cards: \n1. " + showInfo(userHand[0]);
        case 3:
            text += "2. " + showInfo(userHand[1]) + "3. " + showInfo(userHand[2]);
            break;
        case 2:
            text += "2. " + showInfo(userHand[1]);
            break;
    }

    // Asks the User what he wants to play
    var cardChoice = Number(readlineSync.question(text));

    if (cardChoice > userHand.length || cardChoice < 1) {
        console.log("Invalid argument, please enter a number between 1 and your handsize");
        return userTurn(userHand);
    } else {
        console.log("You have played: " + showInfo(userHand[cardChoice - 1]);
        return userHand.splice(cardChoice - 1, 1)[0];
    }
}

function turn(p) {

    // Checks who played first
    if (p.player === constants.comp) {
        var compCard = comp(null, p.compHand, p.mainSuit);
        var userCard = userTurn(p.userHand);
        var winner = compare(compCard, userCard, p.mainSuit, p.player);
    } else {
        var userCard = userTurn(p.userHand);
        var compCard = comp(userCard, p.compHand, p.mainSuit);
        var winner = compare(userCard, compCard, p.mainSuit, p.player);
    }

    // Calculates the score of the round
    var roundScore = score([userCard, compCard]);
    if (winner === constants.user) {
        p.userScore += roundScore;
    } else {
        p.compScore += roundScore;
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

    console.log(winner + " wins " + roundScore + " points");
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
    parameters.player = turn(parameters);

    while (parameters.userHand.length !== 0 && parameters.compHand.length !== 0) {
        parameters.player = turn(parameters);
    }

    // Game ends
    if (parameters.userScore > parameters.compScore) {
        console.log("Game ended, User won with " + parameters.userScore + " points");
    } else if (parameters.userScore < parameters.compScore) {
        console.log("Game ended, Computer won with " + parameters.compScore + " points");
    } else {
        console.log("Game ended with a tie");
    }
}

newGame();
