let gold = 100;

let tileValueDict = {
	0: {
		"min":0,
		"max":3
	},
	1: {
		"min":3,
		"max":9
	},
	2: {
		"min":8,
		"max":13
	},
	3: {
		"min":-10,
		"max":-6
	},
	4: { //Purple Chance Thing
		"min":0,
		"max":0
	},
	5: {
		"min":0,
		"max":0
	},
	6: {
		"min":13,
		"max":18
	}
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
		this.purpleValue = type == "Rift" ? 45: 30;
        this.minGold = this.calculateLowestPossible();
        this.maxGold = this.calculateHighestPossible();
    }
  
  calculateLowestPossible() {
	  let t = 0;
	  for (let i = 0; i < 25; i++) {
		  let data = tileValueDict[this.randomValues[i]];
		  t += data["min"];
	  }
	  return Math.floor((t/100)*this.baseValue);
  }
  
  calculateHighestPossible() {
	  let t = 0;
	  for (let i = 0; i < 25; i++) {
		  let data = tileValueDict[this.randomValues[i]];
		  t += data["max"];
	  }
	  return Math.floor((t/100)*this.baseValue);
  }
  
  rollRandomValues() {
		let spreadDict = {"default":[0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,2],"rift":[5,5,5,5,4,4,4,4,4,6,6]};
		let options = this.stabilityString.toLowerCase() in spreadDict ? spreadDict[this.stabilityString.toLowerCase()] : spreadDict["default"];
		this.randomValues=[];
		for (let i =0; i < 25; i++) {
			let o = options[Math.floor(Math.random()*options.length)];
			if (Math.random()<0.01) {
				o = 3;
			} else if (Math.random()<0.01) {
				o = 4;
			}
			this.randomValues.push(o);
		}
		return this.randomValues;
  }
  
  getDisplayString() {
	  let s = `<b class="${this.stabilityString.toLowerCase()}">${this.name}</b>\n${this.minGold}-${this.maxGold} G\n${this.investmentCount}/100`;
	  if (this.tempInvestmentCount > 0) {
		  s += ` (${this.tempInvestmentCount})`;
	  }
	  
	  return s;
  }

  calculateGoldOutput() {
        let t = 0;
        let logMessages = [];
        for (let i = 0; i < 25; i++) {
            let v = this.randomValues[i];
            let data = tileValueDict[v];
            if (v == 4) {
                if (Math.random() < 0.25) {
                    logMessages.push('<span style="color:purple;">Your teams struck extra-rare minerals!</span>');
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

        }
        let totalGoldOutput = Math.floor((t / 100) * this.baseValue);


        if (this.stabilityString == "Unsafe") {
            let r = Math.random();
            if (r < 0.25) {
                logMessages.push(`Your teams on ${this.name} were unable to find the projected amount of valuables...`);
                totalGoldOutput = Math.floor(totalGoldOutput / 2);
            } else if (r > 0.85) {
                logMessages.push(`Your teams on ${this.name} found far more valuables than anticipated!`);
                totalGoldOutput *= 2;
            }
        }
        totalGoldOutput = Math.floor(totalGoldOutput / (100 / this.tempInvestmentCount));
        let roi = (totalGoldOutput / (this.tempInvestmentCount * this.investmentCost));
        logMessages.push(`<b>Your ${this.tempInvestmentCount} teams on ${this.name} gathered ${totalGoldOutput} G (${roi.toFixed(2)} ROI)</b>`);
        return {
            "total": Math.floor(totalGoldOutput),
            "log": logMessages,
            "roi": roi
        };
    }
}

function generateCodename() {
  // Generate two random letters
  const randomLetter1 = String.fromCharCode(65 + Math.floor(Math.random() * 26)); // Random uppercase letter
  const randomLetter2 = String.fromCharCode(65 + Math.floor(Math.random() * 26));

  // Add four random numbers
  const randomNumbers = Array.from({ length: 4 }, () => Math.floor(Math.random() * 10));

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

function generateRandomCave() {
	const baseValue = 2500;
	const stability = Math.random();
	
	const stabilityString = "Rift";
	
	const maxGold = Math.floor(baseValue * (1 + Math.random()*0.4));
	const minGold = Math.floor(baseValue * (1 - Math.pow(stability,1.5)*0.4)); // Adjust the multiplier for maxGold

	const investmentCost = Math.floor(baseValue * 0.01); // 10% of the base value as an example

	const caveName = generateCodename(); // You can customize the name or even generate one randomly
	
	let c = new Cave(caveName, stabilityString, investmentCost,baseValue);
	return c;
}

function lerp (a,b,t) {
	return t * (b - a) + a;
}

function generateRandom(min, max) {
    return Math.floor(lerp(min,max,Math.random()));
}

function getRandomTime(multiplier) {
	if (multiplier == undefined) {
		multiplier = 1;
	}
	const currentTime = new Date();
	const randomMinutes = (Math.random() * (1 - 0.5) + 0.5) * multiplier;
	const randomTimeInMilliseconds = randomMinutes * 60 * 1000;
	const finalTime = new Date(currentTime.getTime() + randomTimeInMilliseconds);

	return finalTime;
}

function handleRemoval(caveToRemove,cData,reason,index) {
	let n = cData.name;
	caves[index] = generateRandomCave();
	addToLog(reason.replace("<0>",n).replace("<1>",caves[index].name));
	let caveElement = createCaveElement(caves[index],index);
	cavesContainer.replaceChild(caveElement, caveToRemove);
}

function createCaveElement(caveData,ind) {
    const cave = document.createElement("div");
    cave.className = "cave new";
	
	const caveText = document.createElement("p");
	caveText.className = "caveText";
    caveText.innerHTML = caveData.getDisplayString();
	cave.appendChild(caveText);
	
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
    timeText.innerHTML = "";
	cave.appendChild(timeText);
	
	let y = function (askInvest) {
		const maxInvest = Math.min(100,Math.floor(gold/caveData.investmentCost));
        const investment = askInvest ? parseInt(prompt(`How many teams do you want to send? (Max. ${maxInvest})`)) : 1;//parseInt(prompt(`How many teams do you want to send? (Max. ${maxInvest})`));
		const theorInvest = investment+caveData.investmentCount + caveData.tempInvestmentCount;
		if (investment > maxInvest) {
			alert(`You need ${(investment*caveData.investmentCost)-gold} more G to invest that much...`);
		} else if (theorInvest > 100) {
			alert(`You may only invest in ${caveData.name} ${theorInvest-100} more times...`);
		} else if (isNaN(investment) || investment < 0) {
            alert("Invalid investment amount!");
        } else {
			caveData.tempInvestmentCount += investment;
            gold -= caveData.investmentCost * investment;
            updateGoldDisplay();
			caveText.innerHTML = caveData.getDisplayString();
			addToLog(`Invested in ${caveData.name} ${investment} time`+(investment>1?"s":""));
        }
    };
	
    btn.onclick = function() {y(false)};
	btn2.onclick = function() {y(true)};

	// Update the count down every 1 second
	var x = setInterval(function() {
	  var now = new Date().getTime();
	  var distance = caveData.countDownDate - now;
	  var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
	  var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
	  var seconds = Math.floor((distance % (1000 * 60)) / 1000);
	  timeText.innerHTML = hours + "h "
	  + minutes + "m " + seconds + "s ";
		
	  // If the count down is over, write some text 
	  if (distance <= 1) {
		caveData.countDownDate = getRandomTime();
		if (caveData.tempInvestmentCount<=0) {
			caveData.passCt++;
			if (caveData.passCt >= 2) {
				clearInterval(x);
				handleRemoval(cave,caveData,`<0> has lost all investment, replacing with <1>`,ind);
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
		if (caveData.investmentCount >= 100) {
			clearInterval(x);
			handleRemoval(cave,caveData,`<0> has been fully extracted, replacing with <1>`,ind);
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
		let v = [];
		let colorDict = {0:"#444444",1:"#888888",2:"white",3:"red",4:"purple",5:"black",6:"yellow"};
		for (let i = 0; i < 25; i++) {
			v.push(colorDict[caveData.randomValues[i]]);
		}
		createGrid(v);
		cave.className = "cave";
	});
	
    return cave;
}

function updateGoldDisplay() {
    document.getElementById("gold").textContent = `G: ${gold}`;
}

function go() {
    for (let i = 0; i < 12; i++) {
		if (caves[i].tempInvestmentCount<=0) {continue;}
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
		const caveElement = createCaveElement(caves[i],i);
		cavesContainer.appendChild(caveElement);
	}
	updateGoldDisplay();
}

function calculateStandardDeviation(numbers) {
    const mean = numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
    const squaredDifferences = numbers.map(num => Math.pow(num - mean, 2));
    const meanSquaredDifference = squaredDifferences.reduce((sum, num) => sum + num, 0) / squaredDifferences.length;
    const standardDeviation = Math.sqrt(meanSquaredDifference);
    return standardDeviation;
}

function runTest(cave, header) {
	let allValues = [];
	let ROIs = [];
	let totalPos = 0;
	cave.tempInvestmentCount = 100;
	for (let i = 0; i < 10000; i++) {
		let v = cave.calculateGoldOutput();
		allValues.push(v["total"]);
		ROIs.push(v["roi"]);
		if (v["roi"] > 1) {
			totalPos += 1;
		}
	}
	
	var total = 0;
	for(var i = 0; i < allValues.length; i++) {
		total += allValues[i];
	}
	var avg = total / allValues.length;
	let sd = calculateStandardDeviation(allValues);
	console.log(avg);
	console.log("Standard Deviation: " + sd);
	
	let avgROI = ROIs.reduce((sum, num) => sum + num, 0) / ROIs.length;
	let profOdds = totalPos/ROIs.length;
	let txt = `<h3>${header}</h3>Average ROI: ${avgROI}\nAverage: ${avg}\nSD: ${sd}\nChance of Profit: ${profOdds}\nData: ${cave.randomValues}`;
	
	var paragraph = document.createElement("p");
    paragraph.innerHTML = txt;
    var testContentDiv = document.getElementById("testContent");
    testContentDiv.appendChild(paragraph);
	
}

let caves = [];

let c = generateRandomCave();
let myArray = [
    ...Array(12).fill(0),
    ...Array(12).fill(1),
    2
];
c.randomValues = myArray;
runTest(c, "Test 1: Low Values");
myArray = [
    ...Array(13).fill(0),
    ...Array(10).fill(1),
    2,2
];
c.randomValues = myArray;
runTest(c, "Test 2: Lower Mid-Values, Additional High-Value");
myArray = [
    ...Array(12).fill(0),
    ...Array(10).fill(1),
    2,2,2
];
c.randomValues = myArray;
runTest(c, "Test 3: 'Ideal Values', three High-Value");
myArray = [
    ...Array(8).fill(0),
    ...Array(14).fill(1),
    2,2,2
];
c.randomValues = myArray;
runTest(c, "Test 4: 'Very Lucky', Little Low-Value");
myArray = [
    ...Array(12).fill(0),
    ...Array(12).fill(1),
    4
];
c.randomValues = myArray;
runTest(c, "Test 5: Test 1, Replacing High-Value with Chance Square");
myArray = [
    ...Array(12).fill(0),
    ...Array(9).fill(1),
    2,2,2,3
];
c.randomValues = myArray;
runTest(c, "Test 6: Detriment Squares and their effect on Ideal Values");
myArray = [
    0,0,1,0,0,1,0,1,1,1,2,0,0,1,0,1,2,1,1,1,0,1,0,1,1
];
c.randomValues = myArray;
runTest(c, "Test 7: Naturally Generated Values");
myArray = [
    0,1,1,0,1,0,1,0,1,1,0,1,0,0,1,1,1,0,1,0,0,2,0,0,1
];
c.randomValues = myArray;
runTest(c, "Test 8: Naturally Generated Values #2");
myArray = [
    2,4,5,5,5,4,4,2,5,5,5,5,4,2,5,5,5,4,3,5,4,5,2,5,4
];
c.randomValues = myArray;
runTest(c, "Test 9: Rift (Naturally Generated)");

function rollRandomValues(type) {
	let spreadDict = {"default":[0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,2],"rift":[5,5,5,5,5,5,4,4,4,2,2]};
	let options = type.toLowerCase() in spreadDict ? spreadDict[type.toLowerCase()] : spreadDict["default"];
	let randomValues=[];
	for (let i =0; i < 25; i++) {
		let o = options[Math.floor(Math.random()*options.length)];
		if (Math.random()<0.01) {
			o = 3;
		} else if (Math.random()<0.01) {
			o = 4;
		}
		randomValues.push(o);
	}
	return randomValues;
}

for (let i = 0; i < 20; i++) {
	var paragraph = document.createElement("p");
    paragraph.innerHTML = rollRandomValues("rift");
    var testContentDiv = document.getElementById("data");
    testContentDiv.appendChild(paragraph);
}

//rebuildUI();

/*if ('Notification' in window) {
            Notification.requestPermission().then(function(permission) {
              if (permission === 'granted') {
                new Notification('Hi!');
              }
            });
          }*/

function createGrid(colors) {
  const gridContainer = document.getElementById('grid-container');

  // Clear previous content
  gridContainer.innerHTML = '';

  // Loop through the colors array and create boxes with corresponding colors
  for (let color of colors) {
    const box = document.createElement('div');
    box.className = 'grid-box';
    box.style.backgroundColor = color;
    gridContainer.appendChild(box);
  }
}

//createGrid(colorsArray);
