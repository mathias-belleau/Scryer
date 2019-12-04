class Unit {
    constructor(player, unitType) {
        var unitFetched = unitList.get(unitType)
        // console.log("fetched unit: ", unitFetched)

        this.player = player
        //fetch unit type from list
        
        this.hp = this.maxHp = unitFetched.maxHP
        this.attacked = false
        this.ranged = false
        this.tileImg = unitFetched.tileImg
        this.strength = unitFetched.str
        this.x = undefined
        this.y = undefined

        this.speed = 0
        
        this.attackedUnits = []
    }

    //for ROT scheduler
    getSpeed(){
        return this.speed
    }

    TakeDamage(amount, source){
        this.hp -= amount

        if(this.hp <= 0){
            //trigger death stuff
            this.x = undefined
            this.y = undefined
        }
    }

    Alive(){
        return this.hp > 0
    }

    Attack(target){
        // console.log("attack!")
        // console.log("my coords! x: ", this.x, " y: ", this.y)
        // console.log("target coords! x: ", target.x, " y: ", target.y)

        var dmg = 0
        var dieRolls = []
        for (var i = 0; i < this.strength; i++){
            var value = Math.floor( (Math.random() * 6) + 1)
            value += 0
            value += 0
            if(value >= 6){
                dmg+=1
            }
            dieRolls.push(value)
        }
        console.log("dmg done: ", dieRolls)
        if(dmg >= 1){
            //hit our enemy 
            var enemyUnit = game.GetTile(target.x, target.y)
            enemyUnit = enemyUnit.unit
            enemyUnit.TakeDamage(dmg)
            console.log(enemyUnit)
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
            if(!unit.Alive()){
                return 0
            }
            //if self || or target return true 
            if((this.x == xb && this.y == yb) || (unit.x == xb && unit.y == yb)){
                return 1
            }
            //check if wall
            if(game.mapData[xb][yb].tileType == 'a'){
                return 0
            }
            //check if has unit existing
            if( game.mapData[xb][yb].unit != undefined){
                return 0
            }
            return 1
        }
        
        //store all our paths to all the units
        var paths = []

       // console.log("this unit is: ", this.tileImg)
        for(var number = 0; number < units.length; number++){
            var path = []
            
            var unit = units[number]
            
            
            var pathCallback = function(x, y) {
                //// console.log("path: ", x,":",y)
                path.push([x, y]);
            } 
            // console.log("unit about to path to", unit.tileImg)
            //dont path to ourselves, or a friendly unit
            if(this != unit && this.player != unit.player){
                    var astar = new ROT.Path.AStar(xb, yb, passableCallback);

                    // console.log("need to calc path from:", this.tileImg, " to ", unit.tileImg)
                    var x = unit.x
                    var y = unit.y
                    astar.compute(x, y, pathCallback);

                    // reverse the path as it's stored target -> source
                    path = path.reverse()
                    // console.log(path)
                    // console.log("finished finding path")
                    paths.push(path)
            }else{
                // console.log("don't compute as we match ourselves")
            }
            
        }
        //filter out the dead?
        paths = paths.filter((a) => a.length > 0)

        //sort paths by distance
        paths = paths.sort(function(a,b) {return a.length - b.length})
        // console.log("b: ", paths)
        if(paths[0].length >= 0){
            //get first target
            var targetPath = paths[0]
            var target = {x: targetPath[targetPath.length-1][0], y: targetPath[targetPath.length-1][1]}
            //slice off first and last which is unit and target
            targetPath = targetPath.slice(1,-1)
            //got target
             //sort all enemy paths by distance
            // console.log("got target")

            //pick our target
            //ranged == random
            //melee = closest

            if(targetPath.length > 0){
                var targetX = targetPath[0][0]
                var targetY = targetPath[0][1]
                
                this.Movement(mapData, { x: targetX, y: targetY })
            }

            //check if attack rangeattack
            //if we are next to something the distance is 0
            //if we we just moved, our path distance is 1 and our current is == to the target
            if(targetPath.length <= 0 || (this.x == targetX && this.y == targetY && targetPath.length == 1)){
                //TODO: check if this target was already attacked this turn. if yes swing at someone else?
                this.Attack(target)
                
            }
       
        }
        
    }

    Movement(mapData, target){
        // // console.log("moving unit", this)
        //get this units Tile
        var oldTile = mapData[this.x][this.y]
        // console.log(target.x)
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
       
        //draw the tiles again
        game.DrawTile(oldTile.x, oldTile.y)
        game.DrawTile(newTile.x, newTile.y)
    }
}




/* input callback informs about map structure */


let unitList = new Map()

function StartResourceLoading(){
    // console.log("fetching")
    fetch("../json/unitList.json")
    .then(response => response.json())
    .then(json => {
        for(var test in json){
            // console.log( typeof json[test].name)
            unitList.set(json[test].name, json[test])
        }
        // console.log("starting game")
        StartGame()
    });
}



