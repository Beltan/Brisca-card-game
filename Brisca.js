var readlineSync = require('readline-sync');
 
class Card {
    constructor(suit, name) {
        this.suit = suit;
        this.name = name;
    }
}
const names = ["Ace", "Three", "King", "Knight", "Ten", "Seven", "Six", "Five", "Four", "Two"];
const suits = ["Clubs", "Spades", "Hearts", "Diamonds"];

function shuffle(deck) {
    var currentIndex = deck.length, temporaryValue, randomIndex;
  
    // While there remain elements to shuffle...
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

function newShuffledDeck() {
    var deck = [];

    for (var card = 0; card < names.length; card++) {
        for (var suit = 0; suit < suits.length; suit++) {
            deck.push(new Card(suits[suit], names[card]));
        }
    }
    return shuffle(deck);
}

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

function compare(card1, card2, mainSuit, player) {
    if (player == "User") {
        var other = "Computer";
    } else {
        var other = "User";
    }
    if (card1.suit == mainSuit && card2.suit != mainSuit) {
        return player;
    } else if (card1.suit != mainSuit && card2.suit == mainSuit) {
        return other;
    } else if (card1.suit != card2.suit) {
        return player;
    } else {
        var score1 = score(card1);
        var score2 = score(card2);
        if (score1 > score2) {
            return player;
        } else {
            return other;
        }
    }
}

// TODO: Implement better AI
function comp(card, compHand, mainSuit) {
    var compCard = compHand.shift();
    console.log("Computer plays: " + compCard.name + " of " + compCard.suit + "\n");
    return compCard;
}

function draw(n, deck) {
    var hand = [];
    for (var card = 0; card < n; card++) {
        hand.push(deck.shift());
    }
    return hand;
}

function userTurn(userHand) {
    if (userHand.length == 3) {
        var text = "Choose one card to play. You have the following cards: \n" + "1. " + userHand[0].name + " of " + userHand[0].suit + "\n2. " + userHand[1].name + " of " + userHand[1].suit + "\n3. " + userHand[2].name + " of " + userHand[2].suit + "\n";
    } else if (userHand.length == 2) {
        var text = "Choose one card to play. You have the following cards: \n" + "1. " + userHand[0].name + " of " + userHand[0].suit + "\n2. " + userHand[1].name + " of " + userHand[1].suit + "\n";
    } else {
        var text = "Choose one card to play. You have the following cards: \n" + "1. " + userHand[0].name + " of " + userHand[0].suit + "\n";
    }
    var cardChoice = Number(readlineSync.question(text));
    if (cardChoice > userHand.length || cardChoice < 1) {
        console.log("Invalid argument, please enter a number between 1 and your handsize");
        return userTurn(userHand);
    } else {
        console.log("You have played: " + userHand[cardChoice - 1].name + " of " + userHand[cardChoice - 1].suit);
        return userHand.splice(cardChoice - 1, 1)[0];
    }
}

function turn(p) {
    if (p.player == "Computer") {
        var compCard = comp(null, p.compHand, p.mainSuit);
        var userCard = userTurn(p.userHand);
        var winner = compare(compCard, userCard, p.mainSuit, p.player);
    } else {
        var userCard = userTurn(p.userHand);
        var compCard = comp(userCard, p.compHand, p.mainSuit);
        var winner = compare(userCard, compCard, p.mainSuit, p.player);
    }
    var roundScore = score([userCard, compCard]);
    if (winner == "User") {
        p.userScore += roundScore;
    } else {
        p.compScore += roundScore;
    }
    if (p.deck.length != 1 && p.deck.length != 0) {
        if (winner == "User") {
            p.userHand.push(draw(1, p.deck)[0]);
            p.compHand.push(draw(1, p.deck)[0]);
        } else {
            p.compHand.push(draw(1, p.deck)[0]);
            p.userHand.push(draw(1, p.deck)[0]);
        }
    } else if (p.deck.length == 1) {
        if (winner == "User") {
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
    var firstCard = deck.shift();
    const mainSuit = firstCard.suit;
    var userHand = draw(3, deck);
    var compHand = draw(3, deck);
    var userScore = 0;
    var compScore = 0;
    if (Math.random() >= 0.5) {
        var player = "Computer";
    } else {
        var player = "User";
    }
    console.log("The first card is: " + firstCard.name + " of " + firstCard.suit + "\n");
    return {firstCard, mainSuit, userHand, compHand, player, deck, userScore, compScore};
}

function newGame() {
    var parameters = initGame();
    parameters.player = turn(parameters);
    while (parameters.userHand.length != 0 && parameters.compHand.length != 0) {
        parameters.player = turn(parameters);
    }
    if (parameters.userScore > parameters.compScore) {
        console.log("Game ended, User won with " + parameters.userScore + " points");
    } else if (parameters.userScore < parameters.compScore) {
        console.log("Game ended, Computer won with " + parameters.compScore + " points");
    } else {
        console.log("Game ended with a tie");
    }
}

newGame();