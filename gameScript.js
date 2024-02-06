let gold = 100000;

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
    listItem.textContent = line;
    logList.appendChild(listItem);
  });
  
  log.scrollTop = log.scrollHeight;
}


class Cave {
  constructor(name, minGold, maxGold, investmentCost) {
    this.name = name;
    this.minGold = minGold;
    this.maxGold = maxGold;
    this.investmentCost = investmentCost;
    this.investmentCount = 0;
	this.tempInvestmentCount = 0;
	this.stabilityString = "";
	this.countDownDate = getRandomTime();
	this.passCt = 0;
  }
  
  getDisplayString() {
	  let s = `<b class="${this.stabilityString == "Unsafe" ? "unsafe" : ""}">${this.name}</b>\n${this.minGold}-${this.maxGold} G\n${this.investmentCount}/100`;
	  if (this.tempInvestmentCount > 0) {
		  s += ` (${this.tempInvestmentCount})`;
	  }
	  
	  return s;
  }

  calculateGoldOutput() {
    const randomOutput = Math.floor(Math.random() * (this.maxGold - this.minGold)) + this.minGold;
    let totalGoldOutput = Math.floor(randomOutput/100 * this.tempInvestmentCount);   
	let logMessages = [];
	
	if (this.stabilityString == "Unsafe") {
		let r = Math.random();
		if (r < 0.25) {
			logMessages.push(`Your teams on ${this.name} were unable to find the projected amount of valuables...`);
			totalGoldOutput = Math.floor(totalGoldOutput/2);
		}	else if (r > 0.85) {
			logMessages.push(`Your teams on ${this.name} found far more valuables than anticipated!`);
			totalGoldOutput *= 2;
		}
	}
	
	logMessages.push(`Your ${this.tempInvestmentCount} teams on ${this.name} gathered ${totalGoldOutput} G (${(totalGoldOutput/(this.tempInvestmentCount*this.investmentCost)).toFixed(2)} ROI)`);
    return {"total":totalGoldOutput, "log":logMessages};
  }

  invest() {
    this.tempInvestmentCount++;
  }
  
  cleanValues() {
	this.investmentCount += this.tempInvestmentCount;
	this.tempInvestmentCount = 0;
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
	const baseValue = Math.floor(Math.random() * (3500 - 1500 + 1)) + 1500;
	const stability = Math.random();
	
	const stabilityString = Math.random() < 0.8 ? "Safe" : "Unsafe";
	
	const maxGold = Math.floor(baseValue * (1 + Math.random()*0.4));
	const minGold = Math.floor(baseValue * (1 - Math.pow(stability,1.5)*0.4)); // Adjust the multiplier for maxGold

	const investmentCost = Math.floor(baseValue * 0.01); // 10% of the base value as an example

	const caveName = generateCodename(); // You can customize the name or even generate one randomly
	
	let c = new Cave(caveName, minGold, maxGold, investmentCost);
	c.stabilityString = stabilityString;
	return c;
}

function generateRandom(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function getRandomTime() {
  const currentTime = new Date();
  const randomMinutes = Math.random() * (0.5 - 0.25) + 0.25;
  const randomTimeInMilliseconds = randomMinutes * 60 * 1000;
  const finalTime = new Date(currentTime.getTime() + randomTimeInMilliseconds);

  return finalTime;
}

function createCaveElement(caveData,ind) {
    const cave = document.createElement("div");
    cave.className = "cave";
	
	const caveText = document.createElement("p");
	caveText.className = "caveText";
    caveText.innerHTML = caveData.getDisplayString();
	cave.appendChild(caveText);
	
	const btn = document.createElement("button");
	btn.className = "caveButton";
	btn.textContent = `Invest (${caveData.investmentCost})`;
	cave.appendChild(btn);
	
	const timeText = document.createElement("p");
	timeText.className = "timeText";
    timeText.innerHTML = "";
	cave.appendChild(timeText);
	
    btn.onclick = function () {
		const maxInvest = Math.min(100,Math.floor(gold/caveData.investmentCost));
        const investment = parseInt(prompt(`How many teams do you want to send? (Max. ${maxInvest})`));
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
			if (caveData.passCt >= 1) {
				clearInterval(x);
				let n = caveData.name;
				caves[ind] = generateRandomCave();
				addToLog(`${n} has lost all investment, replacing with ${caves[ind].name}`);
				let caveElement = createCaveElement(caves[ind],ind);
				cavesContainer.replaceChild(caveElement, cave);
			}
			return;
		}
		let output = caveData.calculateGoldOutput();
		let bonus = output["total"];
		caveData.cleanValues();
		gold += bonus;
		output["log"].forEach(e => addToLog(e));
		if (caveData.investmentCount >= 100) {
			clearInterval(x);
			let n = caveData.name;
			caves[ind] = generateRandomCave();
			addToLog(`${n} has been fully extracted, replacing with ${caves[ind].name}`);
			let caveElement = createCaveElement(caves[ind],ind);
			cavesContainer.replaceChild(caveElement, cave);
		}
	  }
	  //clearInterval(x); //For end-of-life on the element
	}, 1000);

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

let caves = [];
const cavesContainer = document.getElementById("caves");
cavesContainer.innerHTML = "";

for (let i = 0; i < 12; i++) {
	let c = generateRandomCave();
	caves.push(c);
}

rebuildUI();

/*if ('Notification' in window) {
            Notification.requestPermission().then(function(permission) {
              if (permission === 'granted') {
                new Notification('Hi!');
              }
            });
          }*/



