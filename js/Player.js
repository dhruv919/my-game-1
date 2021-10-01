class Player {
  constructor(){
    this.index = null;
    this.distance = 0;
    this.name = null;
    this.rank = null;
  }

  getCount(){
    
    var playerCountRef = database.ref('playerCount');
    playerCountRef.on("value",(data)=>{
      playerCount = data.val();
      
    })
    console.log(playerCount)
  }

  updateCount(count){
    alert("update count in DB "+count)
    database.ref('/').update({
      playerCount: count
    });
  }

  update(){
    var playerIndex = "players/player" + this.index;
    database.ref(playerIndex).set({
      name:this.name,
      distance:this.distance,
      rank: this.rank
      // score: this.score,
    });
  }

  static getPlayerInfo(){
    var playerInfoRef = database.ref('players');
    playerInfoRef.on("value",(data)=>{
      allPlayers = data.val();
    })
  }
  getBikesAtEnd(){
    database.ref("bikessAtEnd").on("value",(data)=>{
    this.rank=data.val();
    bikesAtEnd=data.val()
    })
  }
  updatebikesAtEnd(rank){
    database.ref("/").update({
      bikesAtEnd:rank
    })
  }
}
