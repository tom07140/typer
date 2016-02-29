var TYPER = function(){

	//singleton
    if (TYPER.instance_) {
        return TYPER.instance_;
    }
    TYPER.instance_ = this;

	// Muutujad
	this.WIDTH = window.innerWidth;
	this.HEIGHT = window.innerHeight;
	this.canvas = null;
	this.ctx = null;

	this.words = []; // kÃµik sÃµnad
	this.word = null; // preagu arvamisel olev sÃµna
	this.word_min_length = 4;
	this.guessed_words = 0; // nÃ¶ skoor

	//mÃ¤ngija objekt, hoiame nime ja skoori
	this.player = {name: null, score: 0};

	this.init();
};

//////////////////////////////////////////////////////////////////////////
//////////////////           TIMER             //////////////////////////
////////////////////////////////////////////////////////////////////////

var count = 60;

var counter=setInterval(timer, 1000);

function timer(){
  count=count-1;
  if(count <= 0){
    clearInterval(counter);
    return;
  }
  document.getElementById("timer").innerHTML=count + " secs";
}

window.TYPER = TYPER;

TYPER.prototype = {

	// Funktsioon, mille kÃ¤ivitame alguses
	init: function(){

		// kÃ¼sime mÃ¤nigja andmed
		this.loadPlayerData();

		// Lisame canvas elemendi ja contexti
		this.canvas = document.getElementsByTagName('canvas')[0];
		this.ctx = this.canvas.getContext('2d');

		// canvase laius ja kÃµrgus veebisirvija akna suuruseks (nii style, kui reso)
		this.canvas.style.width = this.WIDTH + 'px';
		this.canvas.style.height = this.HEIGHT + 'px';

		//reso
		this.canvas.width = this.WIDTH;
		this.canvas.height = this.HEIGHT;

		// laeme sÃµnad
		this.loadWords();
	}, // init end

	loadPlayerData: function(){

		// kÃ¼sime mÃ¤ngija nime ja muudame objektis nime
		var p_name = prompt("Sisesta mÃ¤ngija nimi");

		// Kui ei kirjutanud nime vÃµi jÃ¤ttis tÃ¼hjaks
		if(p_name === null || p_name === ""){
			p_name = "Tundmatu";
			// tegelikult vÃµiks ka uuesti kÃ¼sida
		}

		// MÃ¤nigja objektis muudame nime
		this.player.name = p_name; // player =>>> {name:"Romil", score: 0}
        console.log(this.player);
	}, // loadPlayerData end

	loadWords: function(){

        console.log('loading...');

		// AJAX http://www.w3schools.com/ajax/tryit.asp?filename=tryajax_first
		var xmlhttp = new XMLHttpRequest();

		// mÃ¤Ã¤ran mis juhtub, kui saab vastuse
		xmlhttp.onreadystatechange = function(){

            // OLULINE TYPER tuleb siia funktsiooni kaasa saata vÃµtta instance_'i kaudu
            var TYPER_ref = TYPER.instance_;

			//console.log(xmlhttp.readyState); //vÃµib teoorias kÃµiki staatuseid eraldi kÃ¤sitleda

			// Sai faili tervenisti kÃ¤tte
			if(xmlhttp.readyState == 4 && xmlhttp.status == 200){

                console.log('successfully loaded');

				// serveri vastuse sisu
				var response = xmlhttp.responseText;
				//console.log(response);

				// tekitame massiivi, faili sisu aluseks, uue sÃµna algust mÃ¤rgib reavahetuse \n
				var words_from_file = response.split('\n');
				console.log(words_from_file);

				//asendan massiivi
				TYPER_ref.words = structureArrayByWordLength(words_from_file);
				console.log(TYPER_ref.words);

				// kÃµik sÃµnad olemas, alustame mÃ¤nguga
				TYPER_ref.start();
			}
		};

		xmlhttp.open('GET','./lemmad2013.txt',true);
		xmlhttp.send();
	}, // loadWords end

	start: function(){

		// Tekitame sÃµna objekti Word
		this.generateWord();
		//console.log(this.word);

        //joonista sÃµna
		this.word.Draw(this.guessed_words);

		// Kuulame klahvivajutusi
		window.addEventListener('keypress', this.keyPressed.bind(this));

	}, //start end
    generateWord: function(){

        // kui pikk peab sÃµna tulema, + min pikkus + Ã¤raarvatud sÃµnade arvul jÃ¤Ã¤k 5 jagamisel
        var generated_word_length =  this.word_min_length + parseInt(this.guessed_words/5);

    	// Saan suvalise arvu vahemikus 0 - (massiivi pikkus -1)
    	var random_index = (Math.random()*(this.words[generated_word_length].length-1)).toFixed();

        // random sÃµna, mille salvestame siia algseks
    	var word = this.words[generated_word_length][random_index];

        this.word = new Word(word, this.canvas, this.ctx);
    },
	keyPressed: function(event){

		//console.log(event);
		// event.which annab koodi ja fromcharcode tagastab tÃ¤he
		var letter = String.fromCharCode(event.which);
		//console.log(letter);

		// VÃµrdlen kas meie kirjutatud tÃ¤ht on sama mis jÃ¤rele jÃ¤Ã¤nud sÃµna esimene
		//console.log(TYPER.word);
		if(letter === this.word.left.charAt(0)){

			// VÃµtame Ã¼he tÃ¤he maha
			this.word.removeFirstLetter();

			// kas sÃµna sai otsa, kui jah - loosite uue sÃµna

			if(this.word.left.length === 0){

				this.guessed_words += 1;

        //update player score
        this.player.score = this.guessed_words;

				//loosin uue sÃµna
				this.generateWord();
			}

      if (count > 0){
        //joonistan uuesti
  			this.word.Draw(this.guessed_words);
      }

		}

	} // keypress end

};


// SÃµna objekt
function Word(word, canvas, ctx){

    this.word = word;
    // lisaks sÃµna jÃ¤rel, mida hakkame hakkima
	  this.left = this.word;

    this.canvas = canvas;
    this.ctx = ctx;
}

Word.prototype = {
	Draw: function(score){

		//TÃ¼hjendame canvase
		this.ctx.clearRect( 0, 0, this.canvas.width, this.canvas.height);

		// Canvasele joonistamine
		this.ctx.textAlign = 'center';
		this.ctx.font = '70px Courier';

		// 	// Joonistame sÃµna, mis on jÃ¤rel / tekst, x, y
		this.ctx.fillText(this.left, this.canvas.width/2, this.canvas.height/2);

    //skoor
    this.ctx.textAlign = 'left';
    this.ctx.font = '40px Courier';
    this.ctx.fillText("skoor: "+score, 50, 50);

    //timer
    this.ctx.textAling = 'right';
    this.ctx.font = '40px Courier';
  //  this.ctx.fillText("timer: "+timer, 350, 50);
	},

	// VÃµtame sÃµnast esimese tÃ¤he maha
	removeFirstLetter: function(){

		// VÃµtame esimese tÃ¤he sÃµnast maha
		this.left = this.left.slice(1);
		//console.log(this.left);
	}
};

/* HELPERS */
function structureArrayByWordLength(words){
    //TEEN massiivi Ã¼mber, et oleksid jaotatud pikkuse jÃ¤rgi
    // NT this.words[3] on kÃµik kolmetÃ¤helised

    // defineerin ajutise massiivi, kus kÃµik on Ãµiges jrk
    var temp_array = [];

    // KÃ¤ime lÃ¤bi kÃµik sÃµnad
    for(var i = 0; i < words.length; i++){

        var word_length = words[i].length;

        // Kui pole veel seda array'd olemas, tegu esimese just selle pikkusega sÃµnaga
        if(temp_array[word_length] === undefined){
            // Teen uue
            temp_array[word_length] = [];
        }

        // Lisan sÃµna juurde
        temp_array[word_length].push(words[i]);
    }

    return temp_array;
}

window.onload = function(){
	var typer = new TYPER();
};
