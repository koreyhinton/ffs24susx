var music_players = {
    "D9": new Audio('audio/D9.mp3'),
    "D12": new Audio('audio/D12.mp3'),
    "sus": new Audio('audio/sus.mp3'),
    "C9": new Audio('audio/C9.mp3')
}

//music_player.D9.volume=0.1;

function music_play(key) {
    var player=music_players[key];
    player.currentTime=0;
    player.volume=0.2;
    player.play();
    console.log("play "+key);
}

function music_stop(key) {
//    return;
    if (key==null) {
	Object.keys(music_players).forEach(function(k) {
	    music_players[k].volume=0.009;//0.002;
	    /*var intval=setInterval(function(){
		if (music_players[k].volume<=0.0){
		    clearInterval(intval);
//		                    music_players[k].pause();
		}else if(music_players[k].volume-0.1>=0.0) {
		    music_players[k].volume-=0.1;
		}
	    },1);*/
	});
    } else {
	music_players[key].volume=0.009;//0.002;
        /*var int2val=setInterval(function(){
	    if (music_players[key].volume<=0.0){
		clearInterval(intval);
	    } else if(music_players[key].volume-0.1>=0.0) {
		music_players[key].volume-=0.1;
	    }
	    //var player=music_players[key].pause();
	},5);*/
    }
}
