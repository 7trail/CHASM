/*Hey!
 * Just an idea, add a market
 * Purple/Green squares could give resources isntead of money to use in the market
 * force the player to mine for them, then trade them at high margins for other resources
 * just an idea
*/



let gold = 100;

const Log = [];

function addToLog(newLine) {
    Log.push(newLine);

    if (Log.length > 20) {
        Log.splice(0, Log.length - 20);
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
		"max":3
	},
	1: {
		"min":1,
		"max":12
	},
	2: {
		"min":7,
		"max":14
	},
	3: {
		"min":-6,
		"max":-3
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
    constructor(name, type, investmentCost, baseValue) {
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
        this.rollRandomValues();
        this.hoveredOver = false;
		this.purpleValue = type == "Rift" ? 35: 25;
		this.greenValue = 25;
	this.maxInvestments = 50;
        this.minGold = this.calculateLowestPossible();
        this.maxGold = this.calculateHighestPossible();
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
			
			if (v == 7) { t+=this.greenValue; }

        }
        return Math.floor((t / 100) * this.baseValue);
    }

    rollRandomValues() {
        let spreadDict = {"default":[0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,2],"rift":[5,5,5,5,5,4,4,4,4,4,6],"rampant":[0,0,0,0,0,0,0,0,1,1,1,1,1,7,7,2]};
		let options = (this.stabilityString !== undefined && this.stabilityString.toLowerCase()) in spreadDict ? spreadDict[this.stabilityString.toLowerCase()] : spreadDict["default"];
        this.randomValues = [];
        for (let i = 0; i < 25; i++) {
            let o = options[Math.floor(Math.random() * options.length)];
            if (Math.random() < 0.01) {
                o = 3;
            } else if (Math.random() < 0.01 && (this.stabilityString === undefined || this.stabilityString != "Rampant")) {
                o = 4;
            }
            this.randomValues.push(o);
        }
    }

    getDisplayString() {
        let s = `<b class="${this.stabilityString.toLowerCase()}">${this.name}</b>\n????-${this.maxGold} G\n${this.investmentCount}/${this.maxInvestments}`;
        if (this.tempInvestmentCount > 0) {
            s += ` (${this.tempInvestmentCount})`;
        }

        return s;
    }

    calculateGoldOutput() {
        let t = 0;
        let logMessages = [];
		let pluralMsg = this.tempInvestmentCount > 1 ? "teams": "team";
        for (let i = 0; i < 25; i++) {
            let v = this.randomValues[i];
            let data = tileValueDict[v];
            if (v == 4) {
                if (Math.random() < 0.25) {
                    logMessages.push(`<span style="color:purple;">Your ${pluralMsg} struck extra-rare minerals! (You gained ${this.stabilityString == "Rift" ? 2 : 1} gems!)</span>`);
					marketValueDict["gems"]["owned"] += this.stabilityString == "Rift" ? 2 : 1;
					updateMarket(false);
                    t += this.purpleValue;
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
                t += lerp(data["min"], data["max"], f);
            }
			
			if (v == 7) {
                if (Math.random() < 0.25) { logMessages.push(`<span style="color:green;">Your ${pluralMsg} found rare wildlife!</span>`); t+=this.greenValue; }
            }

        }
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
        totalGoldOutput = Math.floor(totalGoldOutput / (100 / this.tempInvestmentCount));
        let roi = (totalGoldOutput / (this.tempInvestmentCount * this.investmentCost));
        logMessages.push(`<b>Your ${this.tempInvestmentCount} ${pluralMsg} on ${this.name} gathered ${totalGoldOutput} G (${roi.toFixed(2)} ROI)</b>`);
        return {
            "total": Math.floor(totalGoldOutput),
            "log": logMessages,
            "roi": roi
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
let seed = Math.floor(Math.random()*60000);
noise.seed(seed);
let marketCoreDict = {
	"gems": {
		"func": function() {
			return formatNoise(noise.simplex2(marketTime+0.1, 100)) * 100 + 100;
		}
	},
	"gold": {
		"func": function() {
			return Math.pow(formatNoise(noise.simplex2(marketTime+0.1, 500)),3) * 500 + 250;
		}
	},
	"iron": {
		"func": function() {
			let n1 = formatNoise(noise.simplex2(marketTime*8+0.1, 900));
			let n2 = formatNoise(noise.simplex2(marketTime*1500+0.1, 1100));
			let n3 = formatNoise(noise.simplex2(marketTime+0.1,1000));
			let n4 = (n1 + lerp(n1,n2,n3))/2;
			return n4 * 100 + 100;
		}
	},
	"onyx": {
		"func": function() {
			return formatNoise(noise.simplex2(marketTime/10+0.1, 300)) * 2100 + 200;
		}
	}
}

let marketValueDict = {
	"gems": {"current": 150, "previous": 150, "owned":0, "buyOrder": 0, "sellOrder": 0},
	"gold": {"current": 500, "previous": 500, "owned":0, "buyOrder": 0, "sellOrder": 0},
	"iron": {"current": 150, "previous": 150, "owned":0, "buyOrder": 0, "sellOrder": 0},
	"onyx": {"current": 1250, "previous": 1250, "owned":0, "buyOrder": 0, "sellOrder": 0}
};

function updateMarket(increaseTime) {
	if (increaseTime === undefined) {
		increaseTime = true;
	}
	if (increaseTime) {marketTime+=0.02;}
	for (let i = 0; i < Object.keys(marketValueDict).length; i++) {
		let key = Object.keys(marketValueDict)[i];
		let value = marketValueDict[key];
		if (increaseTime) {
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
		if (marketValueDict[key]!==undefined) {
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
		}
	}
}

setInterval(updateMarket, 15000);

function formatNoise(n) { return n/2 + 0.5; }

function generateCodename() {
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
    ];

    // Choose a random word from the list
    const randomWord = options[Math.floor(Math.random() * options.length)];

    // Combine the codename with the random word
    const finalCodename = `${codename} "${randomWord}"`;

    return finalCodename;
}

function generateRandomCave(canMakeRift) {
	if (canMakeRift == undefined) {
		canMakeRift = true;
	}
    const baseValue = Math.floor((Math.pow(Math.random(),1.5) * (2000))*gold/100) + 1500;
    const stability = Math.random();

    let stabilityString = "Safe";
    let chooser = Math.random() * 100;
    if (chooser < 75) {
        if (Math.random() < 0.01 && canMakeRift) {
			stabilityString = "Rift";
		}
    } else if (chooser < 90) {
        stabilityString = "Unsafe";
    } else {
        stabilityString = "Rampant";
    }

    const maxGold = Math.floor(baseValue * (1 + Math.random() * 0.4));
    const minGold = Math.floor(baseValue * (1 - Math.pow(stability, 1.5) * 0.4)); // Adjust the multiplier for maxGold

    const investmentCost = Math.floor(baseValue * 0.01); // 10% of the base value as an example

    const caveName = generateCodename(); // You can customize the name or even generate one randomly

    let c = new Cave(caveName, stabilityString, investmentCost, baseValue);
    return c;
}

function lerp(a, b, t) {
    return t * (b - a) + a;
}

function generateRandom(min, max) {
    return Math.floor(lerp(min, max, Math.random()));
}

function getRandomTime(multiplier) {
    if (multiplier == undefined) {
        multiplier = 15;
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

function createCaveElement(caveData, ind) {
    const cave = document.createElement("div");
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

    createGridFromData(caveData, grid);

    let y = function(askInvest) {
        const maxInvest = Math.min(caveData.maxInvestments-(caveData.investmentCount+caveData.tempInvestmentCount), Math.floor(gold / caveData.investmentCost));
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
            let bonus = output["total"];
            caveData.cleanValues();
            gold += bonus;
            output["log"].forEach(e => addToLog(e));
            updateGoldDisplay();
            caveText.innerHTML = caveData.getDisplayString();
			var audio = new Audio(output["roi"] > 1 ? 'money.mp3' : "moneySad.mp3"); // replace with the path to your sound file	
            audio.play();
			if (document.hidden && 'Notification' in window && output["log"].length > 0) {

				if (Notification.permission === 'granted') {
					new Notification(`CHASM: Payout from ${caveData.name}`, {body:(output["log"][output["log"].length - 1]).replace(/(<([^>]+)>)/ig, '')});
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

    //Hover over code
    cave.addEventListener("mouseover", function(event) {
        createGridFromData(caveData, document.getElementById('grid-container'));
        cave.className = cave.className.replace("new","");
        caveData.hoveredOver = true;
    });

    return cave;
}

function createGridFromData(data, grid) {
    let v = [];
    let colorDict = {
        0: "#444444",
        1: "#888888",
        2: "white",
        3: "red",
        4: "purple",
		5:"black",
		6:"yellow",
		7:"green"
    };
    for (let i = 0; i < 25; i++) {
        v.push(colorDict[data.randomValues[i]]);
    }
    createGrid(v, grid);
}

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
function createGrid(colors, gridContainer) {
    gridContainer.innerHTML = '';
    for (let color of colors) {
        const box = document.createElement('div');
        box.className = 'grid-box';
        box.style.backgroundColor = color;
        gridContainer.appendChild(box);
    }
}

function resetSave() {
    if (confirm('Warning: This WILL delete your saved progress! Are you *sure*?')) {
        window.localStorage.setItem("save", null);
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
		"market": marketValueDict
    }));
}, 5000);

//createGrid(colorsArray);
