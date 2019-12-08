// import tileMap from './tilesetMap.js'
var tileSet = document.createElement("img");
tileSet.src = "../tileset/ProjectUtumno_full.png";

let game = {}

class Game  {
    constructor() {
        this.GameOver = false
        const scale = 1

        this.width = 22*scale
        this.height = 13*scale
        // console.log(tileSet)
        var options = {
            tileColorize:true,
            layout: "tile",
            bg: "transparent",
            tileWidth: 32,
            tileHeight: 32,
            tileSet: tileSet,
            tileMap,
            width: this.width,
            height: this.height,
        }

        //make the display panel
        this.display = new ROT.Display(options);
        let display = this.display
        //scale a little better
        this.display.getContainer().getContext('2d').imageSmoothingEnabled = true; 
        this.display.getContainer().getContext('2d').scale(scale,scale);
        document.body.appendChild(this.display.getContainer());
        
        // create our battle map
        this.map = new ROT.Map.Arena(22*scale,13*scale)

        //create our list of tiles
        this.mapData = create2DArray(this.height,this.width)
        let mapBuildCallback = function(x, y, wall) {
            let newTile = new Tile(x,y, (wall ? 'a' : '#'))
            this.mapData[x][y] = newTile
        }
        // console.log(this.mapData)
        this.map.create(mapBuildCallback.bind(this))

        // make our players
        this.player1 = new Player('player', 0)
        this.player2 = new Player('NPC', 1)

        // console.log("making human")
        var spawnAmount = (Math.random() * 20) + 10
        this.CreateUnit(this.player1, "Sigmund")
        for(var spawnCount = 0; spawnCount < spawnAmount; spawnCount++){
            this.CreateUnit(this.player1, "Human")
            this.CreateUnit(this.player2, "Orc")
            if(spawnCount % 2 == 0){
                this.CreateUnit(this.player1, "Human Bowman")
            }
            if(spawnCount % 2 == 0){
                this.CreateUnit(this.player2, "Orc Axe Thrower")
            }
        }
        
        
        this.player1.SortRankFile(this.width, this.height)
        this.player2.SortRankFile(this.width, this.height)

        for(var u = 0; u < this.player1.unitList.length; u++){
            var t = this.player1.unitList[u]
            this.SpawnUnit(t, t.x, t.y)
        }

        
        for(var u = 0; u < this.player2.unitList.length; u++){
            var t = this.player2.unitList[u]
            this.SpawnUnit(t, t.x, t.y)
        }

        this.DrawMap()
                
        let clickCallback = function(e) {
            //console.log(this.display.eventToPosition(e))
        }
        window.addEventListener("click", clickCallback.bind(this)) 
        
    }

    //create and spawn unit
    CreateAndSpawn(player, unitType){
        var newUnit = this.CreateUnit(player, unitType)
        var modifier = (player == this.player1) ? 0 : 10
        //get proper tile to spawn in for player side
        //TODO: don't make random
        do {
            var tile = this.GetTile(Math.floor( (Math.random() * 10) + 1 + modifier), Math.floor((Math.random() * 10) +1) )
        }while(tile.unit)
        this.SpawnUnit(newUnit,tile.x, tile.y )
    }

    //creates a new unit but doesn't spawn it
    CreateUnit(player, unitType){
        let newUnit = new Unit(player, unitType)
        player.AddUnit(newUnit)
        return newUnit
    }

    //places unit in the map
    SpawnUnit(unit, x, y){
        this.mapData[x][y].unit = unit
        this.mapData[x][y].unit.x = x
        this.mapData[x][y].unit.y = y
    }

    DrawMap(){
        //iterate over each tile
        for (var x =0; x < this.width; x++){
            for(var y = 0; y < this.height; y++){
                this.DrawTile(x,y)
               
            }
        }
    }

    DrawTile(x,y){
        //build our array to draw
        //[tile, unitTile]
        let whatToDraw = []
        //push this tiles image
        whatToDraw.push(this.mapData[x][y].tileType)
        var bg = ["transparent"]
        var fg = ["transparent"]
        //if this tile has a unit on it, push that too
        if(this.mapData[x][y].unit != undefined){
            // console.log("found unit: ", this.mapData[x][y].unit)
            whatToDraw.push(this.mapData[x][y].unit.tileImg)
            // console.log(whatToDraw)
            fg.push("transparent")
            bg.push((this.player1 == this.mapData[x][y].unit.player) ? "rgba(0,255,0,.2" : "rgba(255,0,0,.2")
        }

        //actually draw what's on this to map
        this.display.draw(x,y, whatToDraw, fg, bg)

    }

    Turn(){
        if(this.GameOver){
            return
        }
        // console.log("New turn")
        //get a list of units left on the map
        var units = this.GetUnits()
        units = this.SetSpeedForTurn(units)
        units = this.MakeTurnSchedule(units)
        units.forEach(function (unit) {
            if(!this.GameOver){
                //iterate thru each unit count.
                //TODO: clean up dead after every move?
                
                if(unit.hp > 0){
                    //make sure this unit didn't already die this turn
                    unit.TakeTurn(this.mapData, units)
                }
                this.CleanDead()
                this.CheckVictory()
            }
        }.bind(this))
        
        //clean dead
        this.CleanDead()

        //this.DrawMap()
        // console.log("end turn")

        //check for victory
        this.CheckVictory()
    }

    //get a list of units left on the map
    GetUnits(){
        var units = []
        for (var x =0; x < this.width; x++){
            for(var y = 0; y < this.height; y++){
                if(this.mapData[x][y].unit){
                    units.push(this.mapData[x][y].unit)
                }
            }
        }
        return units
    }

    //this is used for ROT scheduler. it sets a units speed based on their position within the map
    //archers get 1000 speed
    //others get 1000 - 20 per tile from their opposite starting side
    SetSpeedForTurn(units){
        
        //unit turn orders
        //ranged
        //cav
        //right most units for left side v mixed
        //left most units for right side ^
        // console.log(units)
        units.forEach(function (unit) {
            // console.log(unit)
            if(unit.ranged){
                unit.speed= 1000
            }else {
                if(unit.player.side) {
                    //if left side
                    unit.speed = 1000 - ( (22 - unit.x) * 5 )
                }else {
                    //if right side
                    unit.speed = 1000 - ( (unit.x) * 5 )
                }
            }
        })
        return units
    }

    MakeTurnSchedule(units){
        units.sort((a, b) => a.speed - b.speed)
        return units
    }

    CleanDead(){
        for (var x =0; x < this.width; x++){
            for(var y = 0; y < this.height; y++){
                if(this.mapData[x][y].unit){
                    if(this.mapData[x][y].unit.hp <= 0){
                        this.mapData[x][y].unit = undefined
                        this.DrawTile(x,y)
                    }
                }
            }
        }
    }

    CheckVictory(){
        var units = this.GetUnits()
        //only 1 victory for now
        //all units for a player dead
        var p1Alive = units.filter( (a) => a.Alive() && a.player == game.player1)
        var p2Alive = units.filter( (a) => a.Alive() && a.player == game.player2)
        // console.log("p1 alive: ", p1Alive.length, " VS p2 alive: ", p2Alive.length)
        if(p1Alive <= 0 || p2Alive <= 0){
            game.GameOver = true
        }
    }


    GetTile(x, y){
        if(x >= this.width || y >= this.height){
            return undefined
        } else {
            // console.log(this.mapData[x][y])
            return this.mapData[x][y]
        }
    }

    SetupButtons(){
        const turnButton = document.getElementById("TurnButton")
        turnButton.addEventListener("click", function(e) {
            game.Turn()
        })
    }
}

//loads the resources for the game
function StartResourceLoad() {
    StartResourceLoading()
}

//actually start the game by making new instance of games
function StartGame(){
    
    game = new Game()
    game.SetupButtons()
    
}


//helper function for creating 2d arrays
//TODO: move to utils
function create2DArray(numRows, numColumns) {
	let array = new Array(numRows); 
 
	for(let i = 0; i < numColumns; i++) {
		array[i] = new Array(numColumns); 
	}
 
	return array; 
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  