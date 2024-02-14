/*Hey!
 * Just an idea, add a market
 * Purple/Green squares could give resources isntead of money to use in the market
 * force the player to mine for them, then trade them at high margins for other resources
 * just an idea
 */
let gold = 100;

const Log = [];
let teamLog = {};
let redeemedSeeds = [];
let nextExpedition = 0;

function importCave() {
	let seed = parseInt(prompt("What is the Cave ID?"),32);
	if (seed in redeemedSeeds) {
		alert("You have already scanned that cave...");
		return;
	}
	redeemedSeeds.push(seed);
	caves[0] = generateRandomCave(true, seed);
	clearInterval(caveIntervals[0]);
	let cB = caveElements[0];
	let cE = createCaveElement(caves[0],0);
    addToLog("A cave has been imported!");
    cavesContainer.replaceChild(cE,cB);
	
	
}

function RNG(seed) {
  // LCG using GCC's constants
  this.m = 0x80000000; // 2**31;
  this.a = 1103515245;
  this.c = 12345;

  this.state = seed ? seed : Math.floor(Math.random() * (this.m - 1));
}
RNG.prototype.nextInt = function() {
  this.state = (this.a * this.state + this.c) % this.m;
  return this.state;
}
RNG.prototype.nextFloat = function() {
  // returns in range [0,1]
  return this.nextInt() / (this.m - 1);
}
RNG.prototype.nextRange = function(start, end) {
  // returns in range [start, end): including start, excluding end
  // can't modulu nextInt because of weak randomness in lower bits
  var rangeSize = end - start;
  var randomUnder1 = this.nextInt() / this.m;
  return start + Math.floor(randomUnder1 * rangeSize);
}
RNG.prototype.choice = function(array) {
  return array[this.nextRange(0, array.length)];
}


function appendToTeamLog(teamID, teamMsg,caveData) {
    if (teamLog.hasOwnProperty(teamID)) {
        teamLog[teamID]["log"].push(teamMsg);
    } else {
        teamLog[teamID] = {
            "log": [teamMsg],
			"name": caveData.name,
			"values": caveData.randomValues
        };
    }
}

function getNextTeamID() {
    nextExpedition++;
    return nextExpedition;
}

function addToLog(newLine) {
    Log.push(newLine);

    if (Log.length > 30) {
        Log.splice(0, Log.length - 30);
    }
    updateLogUI();
}

function updateLogUI() {
    const logList = document.getElementById("log");

    // Clear existing list items
    logList.innerHTML = "";

    // Add new lines as list items
    Log.forEach((line) => {
        const listItem = document.createElement("li");
        listItem.innerHTML = line;
        logList.appendChild(listItem);
    });

    log.scrollTop = log.scrollHeight;
}
let tileValueDict = {
    0: {
		"min":0,
		"max":5
	},
	1: {
		"min":3,
		"max":6
	},
	2: {
		"min":7,
		"max":12
	},
	3: {
		"min":-8,
		"max":-6
	},
    4: {
        "min": 0,
        "max": 0
    },
    5: {
        "min": 0,
        "max": 0
    },
	6: {
		"min":13,
		"max":18
	},
	7: {
        "min": 3,
        "max": 5
    },
};

class Cave {
    constructor(name, type, investmentCost, baseValue, randArr) {
		if (randArr === undefined) {
			randArr = [];
			for (let i = 0; i < 500; i++) {
				randArr.push(Math.random());
			}
		}
        this.name = name;
        this.baseValue = baseValue;
        this.minGold = 0;
        this.maxGold = 0;
        this.investmentCost = investmentCost;
        this.investmentCount = 0;
        this.tempInvestmentCount = 0;
        this.stabilityString = type;
        this.countDownDate = getRandomTime().getTime();
        this.passCt = 0;
        this.randomValues = [];
        this.displayValues = [];
		
        this.rollRandomValues(randArr);
        this.hoveredOver = false;
        this.purpleValue = type == "Rift" ? 35 : 25;
        this.greenValue = 25;
        this.maxInvestments = 50;
        this.minGold = this.calculateLowestPossible();
        this.maxGold = this.calculateHighestPossible();
		this.seed = 0;
		this.relics = 0;
    }

    calculateLowestPossible() {
        let t = 0;
        for (let i = 0; i < 25; i++) {
            let v = this.randomValues[i];
            let data = tileValueDict[v];
            if (v == 4) {
                //if (Math.random() < 0.25) { logMessages.push("Your teams struck extra-rare minerals!"); t+=25; }
            } else {
                let f = 0;
                //Experimental Synergy System
                f *= this.stabilityString == "Rampant" ? 0.4 : 0.9;
                let mod = this.stabilityString == "Rampant" ? 0.2 : 0.05;
                if (i > 0 && this.randomValues[i] == this.randomValues[i - 1]) {
                    f += mod;
                }
                if (i > 4 && this.randomValues[i] == this.randomValues[i - 5]) {
                    f += mod;
                }
                if (i < 24 && this.randomValues[i] == this.randomValues[i + 1]) {
                    f += mod;
                }
                if (i < 20 && this.randomValues[i] == this.randomValues[i + 5]) {
                    f += mod;
                }
                t += lerp(data["min"], data["max"], f);
            }
        }
        return Math.floor((t / 100) * this.baseValue);
    }

    calculateHighestPossible() {
        let t = 0;
        for (let i = 0; i < 25; i++) {
            let v = this.randomValues[i];
            let data = tileValueDict[v];
            if (v == 4) {
                t += this.purpleValue;
            } else {
                let f = 1;
                //Experimental Synergy System
                f *= this.stabilityString == "Rampant" ? 0.5 : 0.9;
                let mod = this.stabilityString == "Rampant" ? 0.2 : 0.05;
                if (i > 0 && this.randomValues[i] == this.randomValues[i - 1]) {
                    f += mod;
                }
                if (i > 4 && this.randomValues[i] == this.randomValues[i - 5]) {
                    f += mod;
                }
                if (i < 24 && this.randomValues[i] == this.randomValues[i + 1]) {
                    f += mod;
                }
                if (i < 20 && this.randomValues[i] == this.randomValues[i + 5]) {
                    f += mod;
                }
                t += lerp(data["min"], data["max"], f);
            }

            if (v == 7) {
                t += this.greenValue;
            }

        }
        return Math.floor((t / 100) * this.baseValue);
    }

    rollRandomValues(randArr) {
		let start = 0;
		function getR() {
			let val = randArr[start];
			start++;
			return val;
		}
        let spreadDict = {
            "default": [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 2],
            "rift": [5, 5, 5, 5, 5, 4, 4, 4, 4, 4, 6],
            "rampant": [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 7, 7, 2]
        };
        let options = (this.stabilityString !== undefined && this.stabilityString.toLowerCase()) in spreadDict ? spreadDict[this.stabilityString.toLowerCase()] : spreadDict["default"];
        this.randomValues = [];
        for (let i = 0; i < 25; i++) {
            let o = options[Math.floor(getR() * options.length)];
            if (getR() < 0.015) {
                o = 3;
            } else if (getR() < 0.01 && (this.stabilityString === undefined || this.stabilityString != "Rampant")) {
                o = 4;
            }
            this.randomValues.push(o);
            this.displayValues.push(getR() < 0.2 ? 1000 : o);
        }
        //Obscured part. This system is fully experimental and subject to change.
        /*let obsX = Math.floor(Math.random() * 3.99);
        let obsY = Math.floor(Math.random() * 3.99);
        this.displayValues[obsX*5+obsY] = 1000;
        this.displayValues[obsX*5+obsY+1] = 1000;
        this.displayValues[obsX*5+obsY+5] = 1000;
        this.displayValues[obsX*5+obsY+6] = 1000;*/
    }

    getDisplayString() {
        let s = `<b class="${this.stabilityString.toLowerCase()}">${this.name}</b>\n????-${this.maxGold} G\n${this.investmentCount}/${this.maxInvestments}`;
        if (this.tempInvestmentCount > 0) {
            s += ` (${this.tempInvestmentCount})`;
        }

        return s;
    }

    calculateGoldOutput() {
		if (this.relics === undefined) {
			this.relics = 0;
		}
        let t = 0;
		let tArray = []
        let logMessages = [];
        let pluralMsg = this.tempInvestmentCount > 1 ? "teams" : "team";
        for (let i = 0; i < 25; i++) {
            let v = this.randomValues[i];
            let data = tileValueDict[v];
            if (v == 4) {
                if (Math.random() < 0.25) {
                    logMessages.push(`<span style="color:purple;">Your ${pluralMsg} struck extra-rare minerals! (You gained ${this.stabilityString == "Rift" ? 2 : 1} gems!)</span>`);
                    marketValueDict["gems"]["owned"] += this.stabilityString == "Rift" ? 2 : 1;
                    updateMarket(false);
                    t += this.purpleValue;
					tArray.push(1);
                } else {
					tArray.push(0);
				}
            } else {
                let f = Math.pow(Math.random(), 1);
                //Experimental Synergy System
                f *= this.stabilityString == "Rampant" ? 0.4 : 0.9;
                let mod = this.stabilityString == "Rampant" ? 0.2 : 0.05;
                if (i > 0 && this.randomValues[i] == this.randomValues[i - 1]) {
                    f += mod;
                }
                if (i > 4 && this.randomValues[i] == this.randomValues[i - 5]) {
                    f += mod;
                }
                if (i < 24 && this.randomValues[i] == this.randomValues[i + 1]) {
                    f += mod;
                }
                if (i < 20 && this.randomValues[i] == this.randomValues[i + 5]) {
                    f += mod;
                }
				let tTemp = lerp(data["min"], data["max"], f);
                t += tTemp;
				tArray.push(f);
				
				if (v <= 2) { /*Checks for potential random events*/
					if (Math.random() < 0.01) {
						addToLog("<u>A relic has been found!</u>");
						this.investmentCost *= 1.05;
						this.relics++;
						this.baseValue *= 1.05;
						this.baseValue = Math.floor(this.baseValue);
						this.investmentCost = Math.floor(this.investmentCost);
						this.maxGold = this.calculateHighestPossible();
					}
				}
				
            }

            if (v == 7) {
                if (Math.random() < 0.25) {
                    logMessages.push(`<span style="color:green;">Your ${pluralMsg} found rare wildlife!</span>`);
                    t += this.greenValue;
                }
            }

        }
	t *= 0.8 + Math.random()*0.4;
        let totalGoldOutput = Math.floor((t / 100) * this.baseValue);


        if (this.stabilityString == "Unsafe") {
            let r = Math.random();
            if (r < 0.25) {
                logMessages.push(`Your ${pluralMsg} on ${this.name} were unable to find the projected amount of valuables...`);
                totalGoldOutput = Math.floor(totalGoldOutput / 2);
            } else if (r > 0.85) {
                logMessages.push(`Your ${pluralMsg} on ${this.name} found far more valuables than anticipated!`);
                totalGoldOutput *= 2;
            }
        }
		let origTotal = Math.floor(totalGoldOutput);
        totalGoldOutput = Math.floor(totalGoldOutput / (100 / this.tempInvestmentCount));
        let roi = (totalGoldOutput / (this.tempInvestmentCount * this.investmentCost));
        logMessages.push(`<b>Your ${this.tempInvestmentCount} ${pluralMsg} on ${this.name} gathered ${totalGoldOutput} G (${roi.toFixed(2)} ROI)</b>`);
        return {
            "total": Math.floor(totalGoldOutput),
            "log": logMessages,
            "roi": roi,
			"origTotal": origTotal,
			"totalArray": tArray,
			"invests": this.tempInvestmentCount
        };
    }

    invest() {
        this.tempInvestmentCount++;
    }

    cleanValues() {
        this.investmentCount += this.tempInvestmentCount;
        this.tempInvestmentCount = 0;
    }
}

let marketTime = 0;
let seed = Math.floor(Math.random() * 60000);
noise.seed(seed);
let marketCoreDict = {
    "gems": {
        "func": function() {
            return formatNoise(noise.simplex2(marketTime + 0.1, 100)) * 100 + 100;
        },
	"min": 100,
	"max": 200
    },
    "gold": {
        "func": function() {
	    let v1 = formatNoise(noise.simplex2(marketTime + 0.1, 500));
	    let v2 = formatNoise(noise.simplex2(marketTime*5 + 0.1, 550));
            return Math.pow(v1*0.6 + v2 * 0.4, 3) * 500 + 250;
        },
	"min": 250,
	"max": 750
    },
    "iron": {
        "func": function() {
            let n1 = formatNoise(noise.simplex2(marketTime * 8 + 0.1, 900));
            let n2 = formatNoise(noise.simplex2(marketTime * 1500 + 0.1, 1100));
            let n3 = formatNoise(noise.simplex2(marketTime + 0.1, 1000));
            let n4 = (n1 + lerp(n1, n2, n3)) / 2;
            return n4 * 100 + 100;
        },
	"min": 100,
	"max": 200
    },
    "onyx": {
        "func": function() {
            return formatNoise(noise.simplex2(marketTime / 10 + 0.1, 300)) * 2100 + 800;
        },
	"min": 800,
	"max": 2300
    }
}

let marketValueDict = {
    "gems": {
        "current": 150,
        "previous": 150,
        "owned": 0,
        "buyOrder": 0,
        "sellOrder": 0,
	"historic":[]
    },
    "gold": {
        "current": 500,
        "previous": 500,
        "owned": 0,
        "buyOrder": 0,
        "sellOrder": 0,
	"historic":[]
    },
    "iron": {
        "current": 150,
        "previous": 150,
        "owned": 0,
        "buyOrder": 0,
        "sellOrder": 0,
	"historic": []
    },
    "onyx": {
        "current": 1250,
        "previous": 1250,
        "owned": 0,
        "buyOrder": 0,
        "sellOrder": 0,
	"historic": []
    }
};

function updateMarket(increaseTime) {
    if (increaseTime === undefined) {
        increaseTime = true;
    }
    if (increaseTime) {
        marketTime += 0.005;
    }
    for (let i = 0; i < Object.keys(marketValueDict).length; i++) {
        let key = Object.keys(marketValueDict)[i];
        let value = marketValueDict[key];
        if (increaseTime) {
	    if (marketValueDict[key]["historic"] === undefined) {
		marketValueDict[key]["historic"] = [];
	    }
	    marketValueDict[key]["historic"].push(value["current"]);
		if (marketValueDict[key]["historic"].length > 40) {
        		marketValueDict[key]["historic"].splice(0, marketValueDict[key]["historic"].length - 40);
    		}
	    
            marketValueDict[key]["previous"] = value["current"];
            marketValueDict[key]["current"] = marketCoreDict[key]["func"]();

            if (value["sellOrder"] > 0) {
                let saleAmnt = Math.floor(value["sellOrder"] * value["current"] * 0.95);
                gold += saleAmnt;
                addToLog(`<b>You received ${saleAmnt} for your sale of ${value["sellOrder"]} ${key}!</b>`);
                marketValueDict[key]["sellOrder"] = 0;
            }
            if (value["buyOrder"] > 0) {
                marketValueDict[key]["owned"] += value["buyOrder"];
                addToLog(`<b>You received ${value["buyOrder"]} ${key} from your purchases!</b>`);
                marketValueDict[key]["buyOrder"] = 0;
            }
        }
        updateGoldDisplay();
    }
    var marketValuesDiv = document.getElementById("marketValues");
    marketValuesDiv.innerHTML = "";
    for (let i = 0; i < Object.keys(marketValueDict).length; i++) {
        let key = Object.keys(marketValueDict)[i];
        if (marketValueDict[key] !== undefined) {
            var currentValue = marketValueDict[key].current;
            var previousValue = marketValueDict[key].previous;
            var change = currentValue - previousValue;
            var percentageChange = (change / previousValue) * 100;

            var triangle = "";
            var colorClass = "";

            if (change > 0) {
                triangle = "▲";
                colorClass = "green";
            } else if (change < 0) {
                triangle = "▼";
                colorClass = "red";
            } else {
                triangle = "-";
                colorClass = "red";
            }

            var percentageText = percentageChange.toFixed(2) + "%";
            var displayText = key.toUpperCase() + ": " + currentValue.toFixed(2) + " (" + triangle + " " + percentageText + ") OWNED: " + marketValueDict[key]["owned"];
            var el = document.createElement("div");
            el.className = "marketValue";
            var tx = document.createElement("p");
            tx.textContent = displayText;
            tx.className = "marketText";
            tx.classList.add(colorClass);

            let buyOrderFunc = function() {
                if (gold >= Math.floor(marketValueDict[key]["current"])) {
                    marketValueDict[key]["buyOrder"]++;
                    gold -= Math.floor(marketValueDict[key]["current"]);
                    addToLog(`Put in a buy order for ${key}`);
                    updateGoldDisplay();
                } else {
                    alert(`You do not have enough G to buy ${key}...`);
                }
                var displayText = key.toUpperCase() + ": " + currentValue.toFixed(2) + " (" + triangle + " " + percentageText + ") OWNED: " + marketValueDict[key]["owned"];
                tx.textContent = displayText;
            };

            let sellOrderFunc = function() {
                if (marketValueDict[key]["owned"] > 0) {
                    marketValueDict[key]["sellOrder"]++;
                    marketValueDict[key]["owned"]--;
                    addToLog(`Put in a sell order for ${key}`);
                } else {
                    alert(`You do not own any ${key}...`);
                }
                var displayText = key.toUpperCase() + ": " + currentValue.toFixed(2) + " (" + triangle + " " + percentageText + ") OWNED: " + marketValueDict[key]["owned"];
                tx.textContent = displayText;
            };


            var btnBuy = document.createElement("button");
            btnBuy.textContent = "Buy!";
            btnBuy.className = "marketBtn";
            btnBuy.onclick = buyOrderFunc;
            var btnSell = document.createElement("button");
            btnSell.textContent = "Sell!";
            btnSell.className = "marketBtn";
            btnSell.onclick = sellOrderFunc;
            marketValuesDiv.appendChild(el);
            el.appendChild(tx);
            el.appendChild(btnBuy);
            el.appendChild(btnSell);
	const clamp = (a, min = 0, max = 1) => Math.min(max, Math.max(min, a));
	const invlerp = (x, y, a) => clamp((a - x) / (y - x));
	    let canv = document.createElement('canvas');
		canv.id = "marketCanvas";
	    el.appendChild(canv);
	    canv.width = 200;
	    canv.height = 125;
	    const ctx = canv.getContext("2d");
	    ctx.lineWidth = 3;
  	    const img = new Image();
	    img.width = 200;
	    img.height = 125;
  	    img.onload = () => {
    	    	ctx.drawImage(img, 0, 0);
    		ctx.beginPath();
    		ctx.moveTo(0, 120 - invlerp(marketCoreDict[key]["min"],marketCoreDict[key]["max"],marketValueDict[key]["historic"][0])*100);
		for (let i = 0; i < marketValueDict[key]["historic"].length; i++) {
			ctx.lineTo((i+1)*(200/marketValueDict[key]["historic"].length), 120 - invlerp(marketCoreDict[key]["min"],marketCoreDict[key]["max"],marketValueDict[key]["historic"][i])*100);
		}

    		ctx.stroke();
  	    };
	    img.src = "blank.png";

        }
    }
}

setInterval(updateMarket, 15000);

function formatNoise(n) {
    return n / 2 + 0.5;
}

function generateCodename(v1,v2) {
    // Generate two random letters
    const randomLetter1 = String.fromCharCode(65 + Math.floor(Math.random() * 26)); // Random uppercase letter
    const randomLetter2 = String.fromCharCode(65 + Math.floor(Math.random() * 26));

    // Add four random numbers
    const randomNumbers = Array.from({
        length: 4
    }, () => Math.floor(Math.random() * 10));

    // Combine letters and numbers
    const codename = `${randomLetter1}${randomLetter2}-${randomNumbers.join('')}`;

    // List of options for the word
    const options = [
        'Phoenix', 'Shadow', 'Raptor', 'Spectre', 'Viper',
        'Tranquil', 'Harmony', 'Calm', 'Serenity', 'Peaceful',
        'Zen', 'Gentle', 'Grace', 'Ethereal', 'Silence',
        'Dream', 'Cascade', 'Candle', 'Meadow', 'Lullaby',
        'Ripple', 'Whisper', 'Soothing', 'Azure', 'Amethyst',
        'Celestial', 'Radiant', 'Breeze', 'Enchant', 'Luminous',
        'Purity', 'Crescent', 'Reflect', 'Sylvan', 'Vista',
        'Aurora', 'Tranquil', 'Ballet', 'Seraph', 'Empyrean',
        'Halcyon', 'Oasis', 'Pacify', 'Cherish', 'Velvet',
		"Shadowrealm", "Abyssal", "Subterra", "Echo", "Darkhold",
		"Gloomhaven", "Obsidian", "Cryptic", "Chasm", "Mystique",
		"Umbral", "Labyrinth", "Silentium", "Nether", "Stygian", 
		"Phantom", "Sunder", "Eclipse", "Vault", "Veil", "Echoes", 
		"Whisper", "Specter", "Fathom", "Shadowscape", "Enigma", "Thornhold", 
		"Abyss", "Myst", "Shroud", "Hollow", "Twilight", 
		"Cimmerian", "Nocturne", "Tenebris"
    ];
	
	const adjectives = [
	  "Ethereal", "Resplendent", "Surreal", "Majestic", "Effervescent", "Serene", "Enigmatic", "Opulent", "Radiant", "Nebulous", 
	  "Astral", "Vibrant", "Luminous", "Ethereal", "Mystical", "Transcendent", "Glorious", "Cerulean", "Scintillating", "Celestial",
	  "Bewitching", "Halcyon", "Phantasmagorical", "Quixotic", "Elysian", "Incandescent", "Diaphanous", "Crepuscular", "Sublime", 
	  "Spectral", "Effulgent", "Zephyrous", "Vivid", "Illustrious", "Panoramic", "Resplendent", "Fascinating", "Exquisite", "Breathtaking",
	  "Whimsical", "Pristine"
	];

	
    // Choose a random word from the list
    const randomWord = adjectives[Math.floor(v1 * adjectives.length)];
	const randomWord2 = options[Math.floor(v2 * options.length)];

    // Combine the codename with the random word
    const finalCodename = `"${randomWord} ${randomWord2}"`;

    return finalCodename;
}

function generateRandomCave(canMakeRift, seed) {
    if (canMakeRift == undefined) {
        canMakeRift = true;
    }
	let manualSeed = true;
	if (seed === undefined) {
		manualSeed = false;
		seed = Math.random() * 2000000000;
	}
	
	let rng = new RNG(Math.floor(seed));
	
    const baseValue = Math.floor((Math.pow(rng.nextFloat(), 1.5) * (2000)) * Math.max(1,gold / 300)) + 1500;
    const stability = rng.nextFloat();

    let stabilityString = "Safe";
    let chooser = rng.nextFloat() * 100;
    if (chooser < 75) {
        if (rng.nextFloat() < 0.01 && canMakeRift) {
            stabilityString = "Rift";
        }
    } else if (chooser < 90) {
        stabilityString = "Unsafe";
    } else {
        stabilityString = "Rampant";
    }

    const maxGold = Math.floor(baseValue * (1 + rng.nextFloat() * 0.4));
    const minGold = Math.floor(baseValue * (1 - Math.pow(stability, 1.5) * 0.4)); // Adjust the multiplier for maxGold

    const investmentCost = Math.floor(baseValue * 0.01); // 10% of the base value as an example

    const caveName = generateCodename(rng.nextFloat(),rng.nextFloat()); // You can customize the name or even generate one randomly

	let randArr = [];
	for (let i = 0; i < 500; i++) {
		randArr.push(rng.nextFloat());
	}

    let c = new Cave(caveName, stabilityString, investmentCost, baseValue,randArr);
	c.seed = seed;
    return c;
}

function lerp(a, b, t) {
    return t * (b - a) + a;
}

function generateRandom(min, max) {
    return Math.round(lerp(min, max, Math.random()));
}

function getRandomTime(multiplier) {
    if (multiplier == undefined) {
        multiplier = 25;
    }
    const currentTime = new Date();
    const randomMinutes = (Math.random() * (0.25) + 0.75) * multiplier;
    const randomTimeInMilliseconds = randomMinutes * 60 * 1000;
    const finalTime = new Date(currentTime.getTime() + randomTimeInMilliseconds);

    return finalTime;
}

function handleRemoval(caveToRemove, cData, reason, index) {
    let n = cData.name;
    caves[index] = generateRandomCave();
    addToLog(reason.replace("<0>", n).replace("<1>", caves[index].name));
    let caveElement = createCaveElement(caves[index], index);
    cavesContainer.replaceChild(caveElement, caveToRemove);
}

caveElements = {};
caveIntervals = {};
function createCaveElement(caveData, ind) {
    const cave = document.createElement("div");
	caveElements[ind] = cave;
    cave.className = caveData.hoveredOver ? "cave" : "cave new";

    if (caveData.stabilityString == "Rift") {
        cave.className += " riftCave";
    }

    const dv = document.createElement("div");
    dv.className = "bottom-scalar";
    cave.appendChild(dv);

    const grid = document.createElement("div");
    grid.className = "grid-box-container mobile-grid";

    const caveText = document.createElement("p");
    caveText.className = "caveText";
    caveText.innerHTML = caveData.getDisplayString();
    cave.appendChild(caveText);

    dv.appendChild(grid);
    const btn = document.createElement("button");
    btn.className = "caveButton";
    btn.textContent = `Invest (${caveData.investmentCost})`;
    cave.appendChild(btn);

    const btn2 = document.createElement("button");
    btn2.className = "caveButton2";
    btn2.textContent = "*";
    cave.appendChild(btn2);

    const timeText = document.createElement("p");
    timeText.className = "timeText";
    timeText.innerHTML = "-h -m --s";
    dv.appendChild(timeText);

    createGridFromData(caveData.displayValues, grid);

    let y = function(askInvest) {
        const maxInvest = Math.min(caveData.maxInvestments - (caveData.investmentCount + caveData.tempInvestmentCount), Math.floor(gold / caveData.investmentCost));
        const investment = askInvest ? parseInt(prompt(`How many teams do you want to send? (Max. ${maxInvest})`)) : 1; //parseInt(prompt(`How many teams do you want to send? (Max. ${maxInvest})`));
        const theorInvest = investment + caveData.investmentCount + caveData.tempInvestmentCount;
        if (investment > maxInvest) {
            alert(`You need ${(investment*caveData.investmentCost)-gold} more G to invest that much...`);
        } else if (theorInvest > caveData.maxInvestments) {
            alert(`You may only invest in ${caveData.name} ${caveData.maxInvestments-(caveData.investmentCount + caveData.tempInvestmentCount)} more times...`);
        } else if (isNaN(investment) || investment < 0) {
            alert("Invalid investment amount!");
        } else {
            caveData.tempInvestmentCount += investment;
            gold -= caveData.investmentCost * investment;
            updateGoldDisplay();
            caveText.innerHTML = caveData.getDisplayString();
            addToLog(`Invested in ${caveData.name} ${investment} time` + (investment > 1 ? "s" : ""));
        }
    };

    btn.onclick = function() {
        y(false)
    };
    btn2.onclick = function() {
        y(true)
    };

    // Update the count down every 1 second
    var x = setInterval(function() {
        var now = new Date().getTime();
        var distance = caveData.countDownDate - now;
        var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((distance % (1000 * 60)) / 1000);
        timeText.innerHTML = hours + "h " +
            minutes + "m " + seconds + "s ";

        // If the count down is over, write some text 
        timeText.className = distance <= 30000 ? "timeText urgent" : "timeText";
        if (distance <= 1000) {
            caveData.countDownDate = getRandomTime().getTime();
            if (caveData.tempInvestmentCount <= 0) {
                caveData.passCt++;
                if (caveData.passCt >= 2) {
                    clearInterval(x);
                    handleRemoval(cave, caveData, `<0> has lost all interest, replacing with <1>`, ind);
                    /*let n = caveData.name;
                    caves[ind] = generateRandomCave();
                    addToLog(`${n} has lost all investment, replacing with ${caves[ind].name}`);
                    let caveElement = createCaveElement(caves[ind]);
                    cavesContainer.replaceChild(caveElement, cave);*/
                }
                return;
            }
            
            let output = caveData.calculateGoldOutput();
            caveData.cleanValues();
            caveText.innerHTML = caveData.getDisplayString();
			let bonus = output["total"];
			gold += bonus;
			updateGoldDisplay();
			createGridFromData(caveData.displayValues, grid);
			let newID = getNextTeamID();
            for (let i = 0; i < 25; i++) {
                let coordStr = `${(Math.floor(i/5))+1}X${(i%5)+1}`;
				let outputDescriptor = "subpar returns";
				if (output.totalArray[i] > 0.5) {
					outputDescriptor = "good returns";
				}
				if (output.totalArray[i] >= 0.99) {
					outputDescriptor = "fantastic returns";
				}
				appendToTeamLog(newID, caveData.randomValues[i] == 3 ? `Tile at ${coordStr} negatively impacted yields.` : `Tile at ${coordStr} yielded ${outputDescriptor}.`,caveData);
                caveData.displayValues[i] = caveData.randomValues[i];
            }
			appendToTeamLog(newID,"Technical Information:",caveData);
			appendToTeamLog(newID,"Shareable Code: " + caveData.seed.toString(32),caveData);
			appendToTeamLog(newID,"Value String: " + caveData.randomValues,caveData);
			teamLog[newID]["subtitle"] = `${output["origTotal"]} / ${output["invests"]} = ${output["total"]} (${output["roi"].toFixed(2)} ROI)`;
			
			generateTabs();
			caveData.displayValues = caveData.randomValues; // Once you have sent a team, you get full data on the cave
			output["log"].forEach(e => addToLog(e));
			var audio = new Audio(output["roi"] > 1 ? 'money.mp3' : "moneySad.mp3");
			audio.play();
			if (document.hidden && 'Notification' in window && output["log"].length > 0) {

				if (Notification.permission === 'granted') {
					new Notification(`CHASM: Payout from ${caveData.name}`, {
						body: (output["log"][output["log"].length - 1]).replace(/(<([^>]+)>)/ig, '')
					});
				}
			}

			if (caveData.investmentCount >= caveData.maxInvestments) {
				clearInterval(x);
				handleRemoval(cave, caveData, `<0> has been fully extracted, replacing with <1>`, ind);
				/*let n = caveData.name;
				caves[ind] = generateRandomCave();
				addToLog(`${n} has been fully extracted, replacing with ${caves[ind].name}`);
				let caveElement = createCaveElement(caves[ind]);
				cavesContainer.replaceChild(caveElement, cave);*/
			}
        }
        //clearInterval(x); //For end-of-life on the element
    }, 1000);
	
	caveIntervals[ind] = x;

    //Hover over code
    cave.addEventListener("mouseover", function(event) {
        createGridFromData(caveData.displayValues, document.getElementById('grid-container'));
        cave.className = cave.className.replace("new", "");
        caveData.hoveredOver = true;
    });

    return cave;
}

var colorDict = {
	0: "background-color:#444444",
	1: "background-color:#888888",
	2: "background-color:white; box-shadow: inset 0 0 0 5px #bbb;",
	3: "background-color:red",
	4: "background-color:purple",
	5: "background-color:black",
	6: "background-color:yellow",
	7: "background-color:green",
	1000: "background-image: url('noise.gif');background-size: 100% auto;image-rendering: pixelated;"
};



function updateGoldDisplay() {
    document.getElementById("gold").textContent = `G: ${gold}`;
}

function go() {
    for (let i = 0; i < 12; i++) {
        if (caves[i].tempInvestmentCount <= 0) {
            continue;
        }
        let output = caves[i].calculateGoldOutput();
        let bonus = output["total"];
        caves[i].cleanValues();
        gold += bonus;
        output["log"].forEach(e => addToLog(e));
        if (caves[i].investmentCount >= 100) {
            let n = caves[i].name;
            caves[i] = generateRandomCave();
            addToLog(`${n} has been fully extracted, replacing with ${caves[i].name}`);
        }
    }

    rebuildUI();
}

function rebuildUI() {
    cavesContainer.innerHTML = "";
    for (let i = 0; i < 12; i++) {
        const caveElement = createCaveElement(caves[i], i);
        cavesContainer.appendChild(caveElement);
    }
    updateGoldDisplay();
}

let caves = [];
const cavesContainer = document.getElementById("caves");
cavesContainer.innerHTML = "";

//Loading
var save = JSON.parse(window.localStorage.getItem("save"));
if (save !== null && save !== undefined) {
    hidewelcome();
    console.log(save);
    if (save["caves"] !== undefined) {

        caves = save["caves"];
        for (let i = 0; i < 12; i++) {
            caves[i] = Object.assign(new Cave, caves[i]);
        }
    } else {
        for (let i = 0; i < 12; i++) {
            let c = generateRandomCave(false);
            caves.push(c);
        }
    }

    if (save["gold"] !== undefined) {
        gold = save["gold"];
    }

    if (save["marketTime"] !== undefined) {
        marketTime = save["marketTime"];
    }

    if (save["seed"] !== undefined) {
        noise.seed(save["seed"]);
        seed = save["seed"]
    }

    if (save["market"] !== undefined) {
        marketValueDict = save["market"];
    }

    if (save["log"] !== undefined) {
        teamLog = save["log"];
    }
	if (save["redeemed"] !== undefined) {
       	 	redeemedSeeds = save["redeemed"];
  	  }
	
	if (save["nextExpedition"] !== undefined) {
		nextExpedition = save["nextExpedition"]
	}
    updateMarket(false);
} else {
    for (let i = 0; i < 12; i++) {
        let c = generateRandomCave(false);
        caves.push(c);
    }
    updateMarket();
    Notification.requestPermission();
}

rebuildUI();

function createGridFromData(arr, grid,suffix) {
	if (suffix == undefined) {
		suffix = "";
	}
    let v = [];
    
    for (let i = 0; i < 25; i++) {
        v.push(colorDict[arr[i]]);
    }
    createGrid(v, grid,suffix);
}

function createGrid(colors, gridContainer,suffix) {
	if (suffix == undefined) {
		suffix = "";
	}
    gridContainer.innerHTML = '';
    for (let color of colors) {
        const box = document.createElement('div');
        box.className = 'grid-box'+suffix;
        box.style = color;
        gridContainer.appendChild(box);
    }
}

function resetSave() {
    if (confirm('Warning: This WILL delete your saved progress! Are you *sure*?')) {
        window.localStorage.setItem("save", null);
		document.getElementById("tabone").click();
        location.reload();
    }
}

function hidewelcome() {
    document.getElementById("welcome").style = "display: none";
}

setInterval(function() {
    window.localStorage.setItem("save", JSON.stringify({
        "gold": gold,
        "caves": caves,
        "marketTime": marketTime,
        "seed": seed,
        "market": marketValueDict,
        "log": teamLog,
		"nextExpedition": nextExpedition,
	"redeemed":redeemedSeeds
    }));
}, 5000);

//createGrid(colorsArray);

// Function to generate tabs

let tabClickedOn = 0;

function generateTabs() {
	var tabsContainer = document.getElementById('teamLogTabs');
	tabsContainer.innerHTML = '';
	
	for (let i = Object.keys(teamLog).length - 1; i >= 0; i--) {
		let key = Object.keys(teamLog)[i];
	  if (teamLog.hasOwnProperty(key)) {
		var tab = document.createElement('div');
		tab.classList.add('teamTab');
		tab.textContent = teamLog[key].name;
		tab.dataset.key = key;
		tab.addEventListener('click', onTabClick);
		tabsContainer.appendChild(tab);
	  }
	}
	
	if (tabClickedOn > document.getElementsByClassName('teamTab').length) {
		document.getElementsByClassName('teamTab')[tabClickedOn].click();
	}
	
}

function addSquareToParagraph(paragraph, st) {
    // Create a new square element
    var square = document.createElement('div');

    // Apply styles to the square
    square.style = st;
	square.className = "logSquare";

    // Append the square to the paragraph
    paragraph.appendChild(square);
}

// Function to handle tab click
function onTabClick(event) {
	var key = event.target.dataset.key;
	tabClickedOn = key;
	let logContent = document.getElementById('logContent');
	logContent.innerHTML = "";
	let header = document.createElement("div");
	header.className = "logHeader";
	logContent.appendChild(header);
	let header2 = document.createElement("div");
	header2.style = "flex:2;padding-left: 5vw;text-align:center;";
	header.appendChild(header2);
	let title = document.createElement("h1");
	title.style = "";
	title.textContent = `${teamLog[key].name}`;
	header2.appendChild(title);
	
	let title2 = document.createElement("h2");
	title2.style = "";
	title2.textContent = `${teamLog[key].subtitle}`;
	header2.appendChild(title2);
	
	let grid = document.createElement("div");
	grid.className = "grid-box-container-alt";
	header.appendChild(grid);
	createGridFromData(teamLog[key].values, grid,"-alt");
	
	for (let i = 0; i < teamLog[key].log.length ; i++) {
		let para = document.createElement("p");
		addSquareToParagraph(para,colorDict[teamLog[key]["values"][i]]);
		para.innerHTML += teamLog[key].log[i];
		logContent.appendChild(para);
	}
	// Remove 'active' class from all tabs
	var tabs = document.querySelectorAll('.teamTab');
	tabs.forEach(function(tab) {
	  tab.classList.remove('active');
	});
	// Add 'active' class to the clicked tab
	event.target.classList.add('active');
}

// Initial setup
generateTabs();

// Select the first tab by default
var firstTab = document.querySelector('.teamTab');
if (firstTab) {
	firstTab.click();
}
