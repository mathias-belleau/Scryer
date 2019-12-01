class Unit {
    constructor(player, unitType) {
        var unitFetched = unitList.get(unitType)
        console.log("fetched unit: ", unitFetched)

        this.player = player
        //fetch unit type from list
        
        this.hp = this.maxHp = unitFetched.maxHP
        this.attacked = false
        this.ranged = false
        this.tileImg = unitFetched.tileImg

        this.x = undefined
        this.y = undefined

        this.speed = 0
        
    }

    //for ROT scheduler
    getSpeed(){
        return this.speed
    }

    TakeDamage(amount){
        this.hp -= amount

        if(this.hp <= 0){
            //trigger death stuff
            this.x = undefined
            this.y = undefined
        }
    }

    TakeTurn(mapData, units){
        //decide what to do
        //if ranged simply fire at a random enemy

        //get location of all enemies
        //if distance to an enemy is 1? attack it
        //else attempt move towards closest enemy
        //^ if fail attempt move to second closest

        //make new pathfinder
        var xb = this.x
        var yb = this.y
        var passableCallback = function(xb, yb) {
            //if self return true
            if(this.x == xb && this.y == yb){
                return 1
            }
            //check if wall
            if(game.mapData[xb][yb].tileType == 'a'){
                return 0
            }
            //check if has unit existing
            if( game.mapData[xb][yb].unit != undefined){
                return 0.5
            }
            return 1
        }
        var astar = new ROT.Path.AStar(xb, yb, passableCallback);

        
        console.log("astar:" ,astar)

        //store all our paths to all the units
        var paths = []

       console.log("this unit is: ", this.tileImg)
        for(var number = 0; number < units.length; number++){
            var path = []
            
            var unit = units[number]
            
            
            var pathCallback = function(x, y) {
                //console.log("path: ", x,":",y)
                path.push([x, y]);
            } 
            console.log("unit about to path to", unit.tileImg)
            //dont path to ourselves, or a friendly unit
            if(this != unit || this.player != unit.player){
                    console.log("need to calc path from:", this.tileImg, " to ", unit.tileImg)
                    var x = unit.x
                    var y = unit.y
                    astar.compute(x, y, pathCallback);

                    // reverse the path as it's stored target -> source
                    path = path.reverse()
                    console.log(path)
                    console.log("finished finding path")
                    paths.push(path)
            }else{
                console.log("don't compute as we match ourselves")
            }
            
        }
        console.log("outside finding all paths")
        console.log(paths[0].length)
        if(paths[0].length >= 0){
            //got target
             //sort all enemy paths by distance
            console.log("got target")

            //pick our target
            //ranged == random
            //melee = closest

            //if touching someone (path[0].length <=2) attack
            if(paths[0].length <= 2){
                //attack!
                console.log("attack!")
            }else { //else move
                var targetX = paths[0][1][0]
                var targetY = paths[0][1][1]
                
                this.Movement(mapData, { x: targetX, y: targetY })
            }
       
        }
        
    }

    Movement(mapData, target){
        console.log("moving unit", this)
        //get this units Tile
        var oldTile = mapData[this.x][this.y]
        console.log(target.x)
        var newTile = game.GetTile(target.x,target.y)
        
       if(newTile == undefined){
           return
       }
       
        //assign unit to newTile
        newTile.unit=this
    
        //assign unit to new coords
        this.x = newTile.x
        this.y = newTile.y
    
        //clear old tiles unit
        oldTile.unit = undefined
    
    }
}




/* input callback informs about map structure */


let unitList = new Map()

function StartResourceLoading(){
    console.log("fetching")
    fetch("../json/unitList.json")
    .then(response => response.json())
    .then(json => {
        for(var test in json){
            console.log( typeof json[test].name)
            unitList.set(json[test].name, json[test])
        }
        console.log("starting game")
        StartGame()
    });
}



