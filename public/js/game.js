// import tileMap from './tilesetMap.js'
var tileSet = document.createElement("img");
tileSet.src = "../tileset/ProjectUtumno_full.png";

let game = {}

class Game  {
    constructor() {
        const scale = 1

        this.width = 22*scale
        this.height = 12*scale
        console.log(tileSet)
        var options = {
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
        this.map = new ROT.Map.Arena(22*scale,12*scale)

        //create our list of tiles
        this.mapData = create2DArray(this.height,this.width)
        let mapBuildCallback = function(x, y, wall) {
            let newTile = new Tile(x,y, (wall ? 'a' : '#'))
            this.mapData[x][y] = newTile
        }

        this.map.create(mapBuildCallback.bind(this))

        // make our players
        this.player1 = new Player('player', 0)
        this.player2 = new Player('NPC', 1)

        console.log("making human")
        let newHuman = new Unit(this.player1, "Human")

        let newOrc = new Unit(this.player2, "Orc")
        this.SpawnUnit(newHuman,1,1)
        this.SpawnUnit(newOrc,15,2)
        
        this.DrawMap()
                
        let clickCallback = function(e) {
            console.log(this.display.eventToPosition(e))
        }
        //window.addEventListener("click", clickCallback.bind(this)) 
        
    }

    SpawnUnit(unit, x, y){
        this.mapData[x][y].unit = unit
        this.mapData[x][y].unit.x = x
        this.mapData[x][y].unit.y = y
    }

    GetPoistion(e){
        
    }

    DrawMap(){
        //iterate over each tile
        for (var x =0; x < this.width; x++){
            for(var y = 0; y < this.height; y++){
                //build our array to draw
                //[tile, unitTile]
                let whatToDraw = []
                //push this tiles image
                whatToDraw.push(this.mapData[x][y].tileType)

                //if this tile has a unit on it, push that too
                if(this.mapData[x][y].unit != undefined){
                    console.log("found unit: ", this.mapData[x][y].unit)
                    whatToDraw.push(this.mapData[x][y].unit.tileImg)
                    console.log(whatToDraw)
                }

                //actually draw what's on this to map
                this.display.draw(x,y, whatToDraw)
            }
        }
    }

    DrawTile(x,y){
        //build our array to draw
        //[tile, unitTile]
        let whatToDraw = []
        //push this tiles image
        whatToDraw.push(this.mapData[x][y].tileType)

        //if this tile has a unit on it, push that too
        if(this.mapData[x][y].unit != undefined){
            console.log("found unit: ", this.mapData[x][y].unit)
            whatToDraw.push(this.mapData[x][y].unit.tileImg)
            console.log(whatToDraw)
        }

        //actually draw what's on this to map
        this.display.draw(x,y, whatToDraw)

    }

    Turn(){
        console.log("New turn")
        //get a list of units left on the map
        var units = []
        for (var x =0; x < this.width; x++){
            for(var y = 0; y < this.height; y++){
                if(this.mapData[x][y].unit){
                    units.push(this.mapData[x][y].unit)
                }
            }
        }
        this.SetSpeedForTurn(units)
        units = this.MakeTurnSchedule(units)
        units.forEach(function (unit) {
            //iterate thru each unit count.
            //TODO: clean up dead after every move?
            
            if(unit.hp > 0){
                //make sure this unit didn't already die this turn
                unit.TakeTurn(this.mapData, units)
            }
            this.CleanDead()

        }.bind(this))
        

        //clean dead
        CleanDead()


        console.log("end turn")
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
        console.log(units)
        units.forEach(function (unit) {
            console.log(unit)
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
    }

    MakeTurnSchedule(units){
        units.sort((a, b) => b.speed - a.speed)
        return units
    }

    CleanDead(){
        for (var x =0; x < this.width; x++){
            for(var y = 0; y < this.height; y++){
                if(this.mapData[x][y].unit){
                    if(this.mapData[x][y].unit.hp <= 0){
                        this.mapData[x][y].unit = undefined
                    }
                    
                }
            }
        }
    }

    Movement(unitToMove, x, y){
        console.log("moving unit", unitToMove)
        //get this units Tile
        var oldTile = this.mapData[unitToMove.x][unitToMove.y]

        //Get next tile
        console.log(x,y)

        var newTile = this.GetTile(x+1,y)
        
       if(newTile == undefined){
           return
       }
       
        //assign unit to newTile
        newTile.unit=unitToMove

        //assign unit to new coords
        unitToMove.x = newTile.x
        unitToMove.y = newTile.y

        //clear old tiles unit
        oldTile.unit = undefined

        //now draw both tiles again

        this.DrawTile(oldTile.x, oldTile.y)
        this.DrawTile(newTile.x, newTile.y)

    }

    GetTile(x, y){
        if(x >= this.width || y >= this.height){
            return undefined
        } else {
            console.log(this.mapData[x][y])
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